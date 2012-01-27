(function( window, Bump ) {
  var EPSILON = Math.pow( 2, -52 ),
      tmpV1 = Bump.Vector3.create(),
      tmpV2 = Bump.Vector3.create(),
      tmpV3 = Bump.Vector3.create(),
      tmpV4 = Bump.Vector3.create(),
      tmpT1 = Bump.Transform.create();

  var InternalVertexPair = Bump.type({
    init: function InternalVertexPair( v0, v1 ) {
      this.v0 = v0;
      this.v1 = v1;
    },

    members: {
      getHash: function() {
        return this.v0 + ( this.v1 << 16 );
      },

      equals: function( other ) {
        return this.v0 === other.v0 && this.v1 === other.v1;
      }
    }
  });

  var InternalEdge = Bump.type({
    init: function InternalEdge() {
      this.face0 = -1;
      this.face1 = -1;
    }
  });

  var IsAlmostZero = function( v ) {
    return !( Math.abs( v.x ) > 1e-6 ||
              Math.abs( v.y ) > 1e-6 ||
              Math.abs( v.z ) > 1e-6 );
  };

  Bump.ConvexPolyhedron = Bump.type({
    init: function ConvexPolyhedron() {
      this.vertices    = [];
      this.faces       = [];
      this.uniqueEdges = [];

      this.localCenter = Bump.Vector3.create();
      this.extents     = Bump.Vector3.create();
      this.radius      = 0;

      this.mC            = Bump.Vector3.create();
      this.mE            = Bump.Vector3.create();
    },

    members: {
      clone: function( dest ) {
        dest = dest || Bump.ConvexPolyhedron.create();

        dest.vertices.length = 0;
        dest.faces.length = 0;
        dest.uniqueEdges.length = 0;

        var copyArray = function( from, to ) {
          for ( var i = 0; i < from.length; ++i ) {
            to.push( from[i].clone() );
          }
        };

        copyArray( this.vertices,    dest.vertices    );
        copyArray( this.faces,       dest.faces       );
        copyArray( this.uniqueEdges, dest.uniqueEdges );

        this.localCenter.clone( dest.localCenter );
        this.extents.clone( dest.extents );
        dest.radius = this.radius;

        this.mC.clone( dest.mC );
        this.mE.clone( dest.mE );

        return dest;
      },

      initialize: function() {
        var edges = Bump.HashMap.create();
        var TotalArea = 0;
        var i, j, k, numVertices, NbTris;

        this.localCenter.setValue( 0, 0, 0 );
        for ( i = 0; i < this.faces.length; ++i ) {
          numVertices = this.faces[i].indices.length;
          NbTris = numVertices;
          for ( j = 0; j < NbTris; ++j ) {
            k = ( j + 1 ) % numVertices;
            var vp = InternalVertexPair( this.faces[i].indices[j], this.faces[i].indices[k] );
            var edptr = edges.find( vp );
            var edge = this.vertices[vp.v1].subtract( this.vertices[vp.v0] );
            edge.normalize();

            var found = false;

            for ( var p = 0; p < this.uniqueEdges.length; ++p ) {
              if (
                IsAlmostZero( this.uniqueEdges[p] - edge ) ||
                  IsAlmostZero( this.uniqueEdges[p] + edge )
              ) {
                found = true;
                break;
              }
            }

            if ( !found ) {
              this.uniqueEdges.push_back( edge );
            }

            if ( edptr ) {
              Bump.Assert( edptr.face0 >= 0 );
              Bump.Assert( edptr.face1 < 0 );
              edptr.face1 = i;
            } else {
              var ed = InternalEdge.create();
              ed.face0 = i;
              edges.insert( vp, ed );
            }
          }
        }

//     #ifdef USE_CONNECTED_FACES
//             for ( i = 0; i < this.faces.length; ++i ) {
//               numVertices = this.faces[i].indices.length;
//               this.faces[i].connectedFaces.resize( numVertices );

//               for ( j = 0; j < numVertices; ++j ) {
//                 k = ( j + 1 ) % numVertices;
//                 btInternalVertexPair vp( this.faces[i].indices[j], this.faces[i].indices[k] );
//                 btInternalEdge* edptr = edges.find( vp );
//                 Bump.Assert( edptr );
//                 Bump.Assert( edptr.face0 >= 0 );
//                 Bump.Assert( edptr.face1 >= 0 );

//                 var connectedFace = ( edptr.face0 == i ) ? edptr.face1 : edptr.face0;
//                 this.faces[i].connectedFaces[j] = connectedFace;
//               }
//             }
//     #endif

        for ( i = 0; i < this.faces.length; ++i ) {
          numVertices = this.faces[i].indices.length;
          NbTris = numVertices - 2;

          var p0 = this.vertices[ this.faces[i].indices[0] ];
          for ( j = 1; j <= NbTris; ++j ) {
            k = ( j + 1 ) % numVertices;
            var p1 = this.vertices[ this.faces[i].indices[j] ];
            var p2 = this.vertices[ this.faces[i].indices[k] ];
            var Area = (( p0.subtract(p1) ).cross( p0.subtract(p2) )).length() * 0.5,
                Center = ( p0.add( p1 ).add( p2 ) ).divideScalar( 3.0 );
            this.localCenter.addSelf( Area.multiplyVector( Center ) );
            TotalArea.addSelf( Area );
          }
        }
        this.localCenter.divideScalarSelf( TotalArea );


//     #ifdef TEST_INTERNAL_OBJECTS
//             if ( true ) {
//               this.radius = Infinity;;
//               for ( i = 0; i < this.faces.length; ++i ) {
//                 const btVector3 Normal( this.faces[i].plane[0], this.faces[i].plane[1], this.faces[i].plane[2] );
//                 const var dist = Math.abs( this.localCenter.dot( Normal ) + this.faces[i].plane[3] );
//                 if ( dist < this.radius ) {
//                   this.radius = dist;
//                 }
//               }

//               var MinX = Infinity,
//                   MinY = Infinity,
//                   MinZ = Infinity,
//                   MaxX = -Infinity,
//                   MaxY = -Infinity,
//                   MaxZ = -Infinity;

//               for ( i = 0; i < this.vertices.length; i++) {
//                 var pt = this.vertices[i];
//                 if ( pt.x < MinX ) MinX = pt.x;
//                 if ( pt.x > MaxX ) MaxX = pt.x;
//                 if ( pt.y < MinY ) MinY = pt.y;
//                 if ( pt.y > MaxY ) MaxY = pt.y;
//                 if ( pt.z < MinZ ) MinZ = pt.z;
//                 if ( pt.z > MaxZ ) MaxZ = pt.z;
//               }
//               this.mC.setValue( MaxX + MinX, MaxY + MinY, MaxZ + MinZ );
//               this.mE.setValue( MaxX - MinX, MaxY - MinY, MaxZ - MinZ );


//               //     const var r = this.radius / Math.sqrt( 2 );
//               const var r = this.radius / Math.sqrt( 3 );
//               const var LargestExtent = this.mE.maxAxis();
//               const var Step = ( this.mE[ LargestExtent ] * 0.5 - r ) / 1024;
//               this.extents[0] = this.extents[1] = this.extents[2] = r;
//               this.extents[LargestExtent] = this.mE[ LargestExtent ] * 0.5;
//               var FoundBox = false;
//               for ( var j = 0; j < 1024; ++j ) {
//                 if ( this.testContainment() ) {
//                   FoundBox = true;
//                   break;
//                 }

//                 this.extents[LargestExtent].subtractSelf( Step );
//               }
//               if ( !FoundBox ) {
//                 this.extents.x = this.extents.y = this.extents.z = r;
//               } else {
//                 // Refine the box
//                 var Step = ( this.radius - r ) / 1024,
//                 e0 = ( 1 << LargestExtent ) & 3,
//                 e1 = ( 1 << e0 ) & 3;

//                 for ( var j = 0; j < 1024; ++j ) {
//                   var Saved0 = this.extents[ e0 ],
//                   Saved1 = this.extents[ e1 ];
//                   this.extents[ e0 ] += Step;
//                   this.extents[ e1 ] += Step;

//                   if ( !this.testContainment() ) {
//                     this.extents[e0] = Saved0;
//                     this.extents[e1] = Saved1;
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
        var numVerts = this.vertices.length;
        for ( var i = 0; i < numVerts; ++i ) {
          var pt = trans.multiplyVector( this.vertices[i] );
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
