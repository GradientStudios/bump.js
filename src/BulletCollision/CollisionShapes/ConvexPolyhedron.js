(function( window, Bump ) {
  var EPSILON = Math.pow( 2, -52 ),
      tmpV1 = Bump.Vector3.create(),
      tmpV2 = Bump.Vector3.create(),
      tmpV3 = Bump.Vector3.create(),
      tmpV4 = Bump.Vector3.create(),
      tmpT1 = Bump.Transform.create();

  var InternalVertexPair = Bump.type({
    init: function InternalVertexPair( v0, v1 ) {
      this.m_v0 = v0;
      this.m_v1 = v1;
    },

    members: {
      getHash: function() {
        return this.m_v0 + ( this.m_v1 << 16 );
      },

      equals: function( other ) {
        return this.m_v0 === other.m_v0 && this.m_v1 === other.m_v1;
      }
    }
  });

  var InternalEdge = Bump.type({
    init: function InternalEdge() {
      this.m_face0 = -1;
      this.m_face1 = -1;
    }
  });

  var IsAlmostZero = function( v ) {
    return !( Math.abs( v.x ) > 1e-6 ||
              Math.abs( v.y ) > 1e-6 ||
              Math.abs( v.z ) > 1e-6 );
  };

  Bump.ConvexPolyhedron = Bump.type({
    init: function ConvexPolyhedron() {
      this.m_vertices    = [];
      this.m_faces       = [];
      this.m_uniqueEdges = [];

      this.m_localCenter = Bump.Vector3.create();
      this.m_extents     = Bump.Vector3.create();
      this.m_radius      = 0;

      this.mC            = Bump.Vector3.create();
      this.mE            = Bump.Vector3.create();
    },

    members: {
      clone: function( dest ) {
        dest = dest || Bump.ConvexPolyhedron.create();

        dest.m_vertices.length = 0;
        dest.m_faces.length = 0;
        dest.m_uniqueEdges.length = 0;

        var copyArray = function( from, to ) {
          for ( var i = 0; i < from.length; ++i ) {
            to.push( from[i].clone() );
          }
        };

        copyArray( this.m_vertices,    dest.m_vertices    );
        copyArray( this.m_faces,       dest.m_faces       );
        copyArray( this.m_uniqueEdges, dest.m_uniqueEdges );

        this.m_localCenter.clone( dest.m_localCenter );
        this.m_extents.clone( dest.m_extents );
        dest.m_radius = this.m_radius;

        this.mC.clone( dest.mC );
        this.mE.clone( dest.mE );

        return dest;
      },

      initialize: function() {
        var edges = Bump.HashMap.create();
        var TotalArea = 0;
        var i, j, k, numVertices, NbTris;

        this.m_localCenter.setValue( 0, 0, 0 );
        for ( i = 0; i < this.m_faces.length; ++i ) {
          numVertices = this.m_faces[i].m_indices.length;
          NbTris = numVertices;
          for ( j = 0; j < NbTris; ++j ) {
            k = ( j + 1 ) % numVertices;
            var vp = InternalVertexPair( this.m_faces[i].m_indices[j], this.m_faces[i].m_indices[k] );
            var edptr = edges.find( vp );
            var edge = this.m_vertices[vp.m_v1].subtract( this.m_vertices[vp.m_v0] );
            edge.normalize();

            var found = false;

            for ( var p = 0; p < this.m_uniqueEdges.length; ++p ) {
              if (
                IsAlmostZero( this.m_uniqueEdges[p] - edge ) ||
                  IsAlmostZero( this.m_uniqueEdges[p] + edge )
              ) {
                found = true;
                break;
              }
            }

            if ( !found ) {
              this.m_uniqueEdges.push_back(edge);
            }

            if ( edptr ) {
              Bump.Assert( edptr.m_face0 >= 0 );
              Bump.Assert( edptr.m_face1 < 0 );
              edptr.m_face1 = i;
            } else {
              var ed = InternalEdge.create();
              ed.m_face0 = i;
              edges.insert( vp, ed );
            }
          }
        }

//     #ifdef USE_CONNECTED_FACES
//             for ( i = 0; i < this.m_faces.length; ++i ) {
//               numVertices = this.m_faces[i].m_indices.length;
//               this.m_faces[i].m_connectedFaces.resize( numVertices );

//               for ( j = 0; j < numVertices; ++j ) {
//                 k = ( j + 1 ) % numVertices;
//                 btInternalVertexPair vp( this.m_faces[i].m_indices[j], this.m_faces[i].m_indices[k] );
//                 btInternalEdge* edptr = edges.find( vp );
//                 Bump.Assert( edptr );
//                 Bump.Assert( edptr.m_face0 >= 0 );
//                 Bump.Assert( edptr.m_face1 >= 0 );

//                 var connectedFace = ( edptr.m_face0 == i ) ? edptr.m_face1 : edptr.m_face0;
//                 this.m_faces[i].m_connectedFaces[j] = connectedFace;
//               }
//             }
//     #endif

        for ( i = 0; i < this.m_faces.length; ++i ) {
          numVertices = this.m_faces[i].m_indices.length;
          NbTris = numVertices - 2;

          var p0 = this.m_vertices[ this.m_faces[i].m_indices[0] ];
          for ( j = 1; j <= NbTris; ++j ) {
            k = ( j + 1 ) % numVertices;
            var p1 = this.m_vertices[ this.m_faces[i].m_indices[j] ];
            var p2 = this.m_vertices[ this.m_faces[i].m_indices[k] ];
            var Area = (( p0.subtract(p1) ).cross( p0.subtract(p2) )).length() * 0.5,
                Center = ( p0.add( p1 ).add( p2 ) ).divideScalar( 3.0 );
            this.m_localCenter.addSelf( Area.multiplyVector( Center ) );
            TotalArea.addSelf( Area );
          }
        }
        this.m_localCenter.divideScalarSelf( TotalArea );


//     #ifdef TEST_INTERNAL_OBJECTS
//             if ( true ) {
//               this.m_radius = Infinity;;
//               for ( i = 0; i < this.m_faces.length; ++i ) {
//                 const btVector3 Normal( this.m_faces[i].m_plane[0], this.m_faces[i].m_plane[1], this.m_faces[i].m_plane[2] );
//                 const var dist = Math.abs( this.m_localCenter.dot( Normal ) + this.m_faces[i].m_plane[3] );
//                 if ( dist < this.m_radius ) {
//                   this.m_radius = dist;
//                 }
//               }

//               var MinX = Infinity,
//                   MinY = Infinity,
//                   MinZ = Infinity,
//                   MaxX = -Infinity,
//                   MaxY = -Infinity,
//                   MaxZ = -Infinity;

//               for ( i = 0; i < this.m_vertices.length; i++) {
//                 var pt = this.m_vertices[i];
//                 if ( pt.x < MinX ) MinX = pt.x;
//                 if ( pt.x > MaxX ) MaxX = pt.x;
//                 if ( pt.y < MinY ) MinY = pt.y;
//                 if ( pt.y > MaxY ) MaxY = pt.y;
//                 if ( pt.z < MinZ ) MinZ = pt.z;
//                 if ( pt.z > MaxZ ) MaxZ = pt.z;
//               }
//               this.mC.setValue( MaxX + MinX, MaxY + MinY, MaxZ + MinZ );
//               this.mE.setValue( MaxX - MinX, MaxY - MinY, MaxZ - MinZ );


//               //     const var r = this.m_radius / Math.sqrt( 2 );
//               const var r = this.m_radius / Math.sqrt( 3 );
//               const var LargestExtent = this.mE.maxAxis();
//               const var Step = ( this.mE[ LargestExtent ] * 0.5 - r ) / 1024;
//               this.m_extents[0] = this.m_extents[1] = this.m_extents[2] = r;
//               this.m_extents[LargestExtent] = this.mE[ LargestExtent ] * 0.5;
//               var FoundBox = false;
//               for ( var j = 0; j < 1024; ++j ) {
//                 if ( this.testContainment() ) {
//                   FoundBox = true;
//                   break;
//                 }

//                 this.m_extents[LargestExtent].subtractSelf( Step );
//               }
//               if ( !FoundBox ) {
//                 this.m_extents.x = this.m_extents.y = this.m_extents.z = r;
//               } else {
//                 // Refine the box
//                 var Step = ( this.m_radius - r ) / 1024,
//                 e0 = ( 1 << LargestExtent ) & 3,
//                 e1 = ( 1 << e0 ) & 3;

//                 for ( var j = 0; j < 1024; ++j ) {
//                   var Saved0 = this.m_extents[ e0 ],
//                   Saved1 = this.m_extents[ e1 ];
//                   this.m_extents[ e0 ] += Step;
//                   this.m_extents[ e1 ] += Step;

//                   if ( !this.testContainment() ) {
//                     this.m_extents[e0] = Saved0;
//                     this.m_extents[e1] = Saved1;
//                     break;
//                   }
//                 }
//               }
//             }
//     #endif
        return this;
      },

      project: function( trans, dir, minMax ) {
        minMax.min = Infinity;
        minMax.max = -Infinity;
        var numVerts = this.m_vertices.length;
        for ( var i = 0; i < numVerts; ++i ) {
          var pt = trans.multiplyVector( this.m_vertices[i] );
          var dp = pt.dot( dir );
          if ( dp < minMax.min ) { minMax.min = dp; }
          if ( dp > minMax.max ) { minMax.max = dp; }
        }

        if ( minMax.min > minMax.max ) {
          var tmp = minMax.min;
          minMax.min = minMax.max;
          minMax.max = minMax.tmp;
        }
        return this;
      }
    }
  });
})( this, this.Bump );
