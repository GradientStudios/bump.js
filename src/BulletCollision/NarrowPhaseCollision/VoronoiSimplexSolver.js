(function( window, Bump ) {
  var VORONOI_SIMPLEX_MAX_VERTS = 5,
      VORONOI_DEFAULT_EQUAL_VERTEX_THRESHOLD = 0.0001,
      VERTA = 0,
      VERTB = 1,
      VERTC = 2,
      VERTD = 3;

  Bump.UsageBitfield = Bump.type({
    init: function UsageBitfield() {
      this.usedVertexA = false;
      this.usedVertexB = false;
      this.usedVertexC = false;
      this.usedVertexD = false;
      this.unused1 = false;
      this.unused2 = false;
      this.unused3 = false;
      this.unused4 = false;

      this.reset();

      return this;
    },

    members: {
      clone: function( dest ) {
        dest = dest || Bump.UsageBitfield.create();

        dest.usedVertexA = this.usedVertexA;
        dest.usedVertexB = this.usedVertexB;
        dest.usedVertexC = this.usedVertexC;
        dest.usedVertexD = this.usedVertexD;
        dest.unused1 = this.unused1;
        dest.unused2 = this.unused2;
        dest.unused3 = this.unused3;
        dest.unused4 = this.unused4;

        return dest;
      },

      assign: function( other ) {
        this.usedVertexA = other.usedVertexA;
        this.usedVertexB = other.usedVertexB;
        this.usedVertexC = other.usedVertexC;
        this.usedVertexD = other.usedVertexD;
        this.unused1 = other.unused1;
        this.unused2 = other.unused2;
        this.unused3 = other.unused3;
        this.unused4 = other.unused4;

        return this;
      },

      reset: function() {
        this.usedVertexA = false;
        this.usedVertexB = false;
        this.usedVertexC = false;
        this.usedVertexD = false;
      }
    }
  });

  Bump.SubSimplexClosestResult = Bump.type({
    init: function SubSimplexClosestResult() {
      this.closestPointOnSimplex = Bump.Vector3.create();
      this.usedVertices = Bump.UsageBitfield.create();
      this.barycentricCoords = new Array( 4 );
      for ( var i = 0; i < 4; ++i ) {
        this.barycentricCoords[i] = 0;
      }
      this.degenerate = false;
      return this;
    },

    members: {
      clone: function( dest ) {
        dest = dest || Bump.SubSimplexClosestResult.create();

        dest.closestPointOnSimplex.assign( this.closestPointOnSimplex );
        dest.usedVertices.assign( this.usedVertices );
        for ( var i = 0; i < 4; ++i ) {
          dest.barycentricCoords[i] = this.barycentricCoords[i];
        }
        dest.degenerate = this.degenerate;

        return dest;
      },

      assign: function( other ) {
        this.closestPointOnSimplex.assign( other.closestPointOnSimplex );
        this.usedVertices.assign( other.usedVertices );
        for ( var i = 0; i < 4; ++i ) {
          this.barycentricCoords[i] = other.barycentricCoords[i];
        }
        this.degenerate = other.degenerate;

        return this;
      },

      reset: function() {
        this.degenerate = false;
        this.setBarycentricCoordinates();
        this.usedVertices.reset();
      },

      isValid: function() {
        var valid = ( ( this.barycentricCoords[0] >= 0 ) &&
                      ( this.barycentricCoords[1] >= 0 ) &&
                      ( this.barycentricCoords[2] >= 0 ) &&
                      ( this.barycentricCoords[3] >= 0 ) );

        return valid;
      },

      setBarycentricCoordinates: function( a, b, c, d ) {
        a = a || 0;
        b = b || 0;
        c = c || 0;
        d = d || 0;

        this.barycentricCoords[0] = a;
        this.barycentricCoords[1] = b;
        this.barycentricCoords[2] = c;
        this.barycentricCoords[3] = d;
      }
    }
  });

  Bump.VoronoiSimplexSolver = Bump.type({
    init: function VoronoiSimplexSolver() {
      this.numVertices = 0;

      this.simplexVectorW = new Array( VORONOI_SIMPLEX_MAX_VERTS );
      this.simplexPointsP = new Array( VORONOI_SIMPLEX_MAX_VERTS );
      this.simplexPointsQ = new Array( VORONOI_SIMPLEX_MAX_VERTS );

      for ( var i = 0; i < VORONOI_SIMPLEX_MAX_VERTS; ++i ) {
        this.simplexVectorW[i] = Bump.Vector3.create();
        this.simplexPointsP[i] = Bump.Vector3.create();
        this.simplexPointsQ[i] = Bump.Vector3.create();
      }

      this.cachedP1 = Bump.Vector3.create();
      this.cachedP2 = Bump.Vector3.create();
      this.cachedV  = Bump.Vector3.create();
      this.lastW    = Bump.Vector3.create();

      this.equalVertexThreshold = VORONOI_DEFAULT_EQUAL_VERTEX_THRESHOLD;
      this.cachedValidClosest = false;

      this.cachedBC = Bump.SubSimplexClosestResult.create();

      return this;
    },

    members: {

      removeVertex: function( index ) {
        Bump.Assert( this.numVertices > 0 );
        --this.numVertices;
        this.simplexVectorW[ index ].assign( this.simplexVectorW[ this.numVertices ] );
        this.simplexPointsP[ index ].assign( this.simplexPointsP[ this.numVertices ] );
        this.simplexPointsQ[ index ].assign( this.simplexPointsQ[ this.numVertices ] );
      },

      reduceVertices: function( usedVerts ) {
        if ( ( this.numVertices >= 4 ) && ( !usedVerts.usedVertexD ) ) {
          this.removeVertex( 3 );
        }

        if ( ( this.numVertices >= 3 ) && ( !usedVerts.usedVertexC ) ) {
          this.removeVertex( 2 );
        }

        if ( ( this.numVertices >= 2 ) && ( !usedVerts.usedVertexB ) ) {
          this.removeVertex( 1 );
        }

        if ( ( this.numVertices >= 1 ) && ( !usedVerts.usedVertexA ) ) {
          this.removeVertex( 0 );
        }
      },

      updateClosestVectorAndPoints: function() {
        var tmpV1, tmpV2, p, a, b, c, d;

        if ( this.needsUpdate ) {
          this.cachedBC.reset();

          this.needsUpdate = false;

          switch ( this.numVertices ) {
          case 0:
            this.cachedValidClosest = false;
            break;

          case 1:
            tmpV1 = Bump.Vector3.create();

            this.cachedP1.assign( this.simplexPointsP[0] );
            this.cachedP2.assign( this.simplexPointsQ[0] );
            this.cachedV.assign( this.cachedP1.subtract( this.cachedP2 ) );
            this.cachedBC.reset();
            this.cachedBC.setBarycentricCoordinates( 1, 0, 0, 0 );
            this.cachedValidClosest = this.cachedBC.isValid();
            break;

          // Closest point origin from line segment.
          case 2:
            tmpV1 = Bump.Vector3.create();

            var from = this.simplexVectorW[0],
                to = this.simplexVectorW[1],
                nearest = Bump.Vector3.create();

            p = Bump.Vector3.create( 0, 0, 0 );
            var diff = p.subtract( from ),
                v = to.subtract( from ),
                t = v.dot( diff );

            if ( t > 0 ) {
              var dotVV = v.dot( v );
              if ( t < dotVV ) {
                t /= dotVV;
                diff.subtractSelf( v.multiplyScalar( t, tmpV1 ) );
                this.cachedBC.usedVertices.usedVertexA = true;
                this.cachedBC.usedVertices.usedVertexB = true;
              } else {
                t = 1;
                diff.subtractSelf( v );
                // Reduce to 1 point.
                this.cachedBC.usedVertices.usedVertexB = true;
              }
            } else {
              t = 0;
              // Reduce to 1 point.
              this.cachedBC.usedVertices.usedVertexA = true;
            }
            this.cachedBC.setBarycentricCoordinates( 1 - t, t );
            nearest.assign( from.add( v.multiplyScalar( t, tmpV1 ), tmpV1 ) );

            this.cachedP1.assign( this.simplexPointsP[0].add( this.simplexPointsP[1].subtract( this.simplexPointsP[0], tmpV1 ).multiplyScalar( t, tmpV1 ), tmpV1 ) );
            this.cachedP2.assign( this.simplexPointsQ[0].add( this.simplexPointsQ[1].subtract( this.simplexPointsQ[0], tmpV1 ).multiplyScalar( t, tmpV1 ), tmpV1 ) );
            this.cachedV.assign( this.cachedP1.subtract( this.cachedP2, tmpV1 ) );

            this.reduceVertices( this.cachedBC.usedVertices );

            this.cachedValidClosest = this.cachedBC.isValid();
            break;

          // Closest point origin from triangle.
          case 3:
            tmpV1 = Bump.Vector3.create();
            tmpV2 = Bump.Vector3.create();

            p = Bump.Vector3.create( 0, 0, 0 );

            a = this.simplexVectorW[0];
            b = this.simplexVectorW[1];
            c = this.simplexVectorW[2];

            this.closestPtPointTriangle( p, a, b, c, this.cachedBC );
            this.cachedP1.assign(
              this.simplexPointsP[0].multiplyScalar( this.cachedBC.barycentricCoords[0], tmpV2 )
                .add( this.simplexPointsP[1].multiplyScalar( this.cachedBC.barycentricCoords[1], tmpV2 ), tmpV1 )
                .add( this.simplexPointsP[2].multiplyScalar( this.cachedBC.barycentricCoords[2], tmpV2 ), tmpV1 )
            );

            this.cachedP2.assign(
              this.simplexPointsQ[0].multiplyScalar( this.cachedBC.barycentricCoords[0], tmpV2 )
                .add( this.simplexPointsQ[1].multiplyScalar( this.cachedBC.barycentricCoords[1], tmpV2 ), tmpV1 )
                .add( this.simplexPointsQ[2].multiplyScalar( this.cachedBC.barycentricCoords[2], tmpV2 ), tmpV1 )
            );

            this.cachedV.assign( this.cachedP1.subtract( this.cachedP2, tmpV1 ) );

            this.reduceVertices( this.cachedBC.usedVertices );
            this.cachedValidClosest = this.cachedBC.isValid();

            break;

          case 4:
            tmpV1 = Bump.Vector3.create();
            tmpV2 = Bump.Vector3.create();

            p = Bump.Vector3.create( 0, 0, 0 );

            a = this.simplexVectorW[0];
            b = this.simplexVectorW[1];
            c = this.simplexVectorW[2];
            d = this.simplexVectorW[3];

            var hasSeperation = this.closestPtPointTetrahedron( p, a, b, c, d, this.cachedBC );

            if ( hasSeperation ) {
              this.cachedP1.assign(
                this.simplexPointsP[0].multiplyScalar( this.cachedBC.barycentricCoords[0], tmpV2 )
                  .add( this.simplexPointsP[1].multiplyScalar( this.cachedBC.barycentricCoords[1], tmpV2 ), tmpV1 )
                  .add( this.simplexPointsP[2].multiplyScalar( this.cachedBC.barycentricCoords[2], tmpV2 ), tmpV1 )
                  .add( this.simplexPointsP[3].multiplyScalar( this.cachedBC.barycentricCoords[3], tmpV2 ), tmpV1 )
              );

              this.cachedP2.assign(
                this.simplexPointsQ[0].multiplyScalar( this.cachedBC.barycentricCoords[0], tmpV2 )
                  .add( this.simplexPointsQ[1].multiplyScalar( this.cachedBC.barycentricCoords[1], tmpV2 ), tmpV1 )
                  .add( this.simplexPointsQ[2].multiplyScalar( this.cachedBC.barycentricCoords[2], tmpV2 ), tmpV1 )
                  .add( this.simplexPointsQ[3].multiplyScalar( this.cachedBC.barycentricCoords[3], tmpV2 ), tmpV1 )
              );

              this.cachedV.assign( this.cachedP1.subtract( this.cachedP2 ) );
              this.reduceVertices( this.cachedBC.usedVertices );
            } else {
              //     console.log( 'sub distance got penetration' );

              if ( this.cachedBC.degenerate ) {
                this.cachedValidClosest = false;
              } else {
                this.cachedValidClosest = true;
                // degenerate case == false, penetration = true + zero
                this.cachedV.setValue( 0, 0, 0 );
              }
              break;
            }

            this.cachedValidClosest = this.cachedBC.isValid();

            // Closest point origin from tetrahedron.
            break;

          default:
            this.cachedValidClosest = false;
          }
        }

        return this.cachedValidClosest;

      },

      closestPtPointTetrahedron: function( p, a, b, c, d, finalResult ) {
        var tempResult = Bump.SubSimplexClosestResult.create();

        // Start out assuming point inside all halfspaces, so closest to itself.
        finalResult.closestPointOnSimplex.assign( p );
        finalResult.usedVertices.reset();
        finalResult.usedVertices.usedVertexA = true;
        finalResult.usedVertices.usedVertexB = true;
        finalResult.usedVertices.usedVertexC = true;
        finalResult.usedVertices.usedVertexD = true;

        var pointOutsideABC = this.pointOutsideOfPlane( p, a, b, c, d ),
            pointOutsideACD = this.pointOutsideOfPlane( p, a, c, d, b ),
            pointOutsideADB = this.pointOutsideOfPlane( p, a, d, b, c ),
            pointOutsideBDC = this.pointOutsideOfPlane( p, b, d, c, a );

        if ( pointOutsideABC < 0 || pointOutsideACD < 0 || pointOutsideADB < 0 || pointOutsideBDC < 0 ) {
          finalResult.degenerate = true;
          return false;
        }

        if ( !pointOutsideABC && !pointOutsideACD && !pointOutsideADB && !pointOutsideBDC ) {
          return false;
        }

        var tmpV1 = Bump.Vector3.create(),
            tmpV2 = Bump.Vector3.create(),
            tmpV3 = Bump.Vector3.create();

        var q, sqDist, bestSqDist = Infinity;
        // If point outside face abc then compute closest point on abc
        if ( pointOutsideABC ) {
          this.closestPtPointTriangle( p, a, b, c, tempResult );
          q = tempResult.closestPointOnSimplex.clone( tmpV1 );

          sqDist = q.subtract( p, tmpV2 ).dot( q.subtract( p, tmpV3 ) );
          // Update best closest point if (squared) distance is less than
          // current best.
          if ( sqDist < bestSqDist ) {
            bestSqDist = sqDist;
            finalResult.closestPointOnSimplex.assign( q );
            // Convert result bitmask!
            finalResult.usedVertices.reset();
            finalResult.usedVertices.usedVertexA = tempResult.usedVertices.usedVertexA;
            finalResult.usedVertices.usedVertexB = tempResult.usedVertices.usedVertexB;
            finalResult.usedVertices.usedVertexC = tempResult.usedVertices.usedVertexC;
            finalResult.setBarycentricCoordinates(
              tempResult.barycentricCoords[ VERTA ],
              tempResult.barycentricCoords[ VERTB ],
              tempResult.barycentricCoords[ VERTC ],
              0
            );

          }
        }


        // Repeat test for face acd.
        if ( pointOutsideACD ) {
          this.closestPtPointTriangle( p, a, c, d, tempResult );
          q = tempResult.closestPointOnSimplex.clone( tmpV1 );

          // Convert result bitmask!
          sqDist = q.subtract( p, tmpV2 ).dot( q.subtract( p, tmpV3 ) );
          if ( sqDist < bestSqDist ) {
            bestSqDist = sqDist;
            finalResult.closestPointOnSimplex.assign( q );
            finalResult.usedVertices.reset();
            finalResult.usedVertices.usedVertexA = tempResult.usedVertices.usedVertexA;

            finalResult.usedVertices.usedVertexC = tempResult.usedVertices.usedVertexB;
            finalResult.usedVertices.usedVertexD = tempResult.usedVertices.usedVertexC;
            finalResult.setBarycentricCoordinates(
              tempResult.barycentricCoords[ VERTA ],
              0,
              tempResult.barycentricCoords[ VERTB ],
              tempResult.barycentricCoords[ VERTC ]
            );

          }
        }

        // Repeat test for face adb.
        if ( pointOutsideADB ) {
          this.closestPtPointTriangle( p, a, d, b, tempResult );
          q = tempResult.closestPointOnSimplex.clone( tmpV1 );


          // Convert result bitmask!
          sqDist = q.subtract( p, tmpV2 ).dot( q.subtract( p, tmpV3 ) );
          if ( sqDist < bestSqDist ) {
            bestSqDist = sqDist;
            finalResult.closestPointOnSimplex.assign( q );
            finalResult.usedVertices.reset();
            finalResult.usedVertices.usedVertexA = tempResult.usedVertices.usedVertexA;
            finalResult.usedVertices.usedVertexB = tempResult.usedVertices.usedVertexC;

            finalResult.usedVertices.usedVertexD = tempResult.usedVertices.usedVertexB;
            finalResult.setBarycentricCoordinates(
              tempResult.barycentricCoords[ VERTA ],
              tempResult.barycentricCoords[ VERTC ],
              0,
              tempResult.barycentricCoords[ VERTB ]
            );

          }
        }

        // Repeat test for face bdc.
        if ( pointOutsideBDC ) {
          this.closestPtPointTriangle( p, b, d, c, tempResult );
          q = tempResult.closestPointOnSimplex.clone( tmpV1 );

          // Convert result bitmask!
          sqDist = q.subtract( p ).dot( q.subtract( p ) );
          if ( sqDist < bestSqDist ) {
            bestSqDist = sqDist;
            finalResult.closestPointOnSimplex.assign( q );
            finalResult.usedVertices.reset();

            finalResult.usedVertices.usedVertexB = tempResult.usedVertices.usedVertexA;
            finalResult.usedVertices.usedVertexC = tempResult.usedVertices.usedVertexC;
            finalResult.usedVertices.usedVertexD = tempResult.usedVertices.usedVertexB;

            finalResult.setBarycentricCoordinates(
              0,
              tempResult.barycentricCoords[ VERTA ],
              tempResult.barycentricCoords[ VERTC ],
              tempResult.barycentricCoords[ VERTB ]
            );

          }
        }

        // Help! We ended up full!
        if ( finalResult.usedVertices.usedVertexA &&
             finalResult.usedVertices.usedVertexB &&
             finalResult.usedVertices.usedVertexC &&
             finalResult.usedVertices.usedVertexD )
        {
          return true;
        }

        return true;
      },

      pointOutsideOfPlane: function( p, a, b, c, d ) {
        var tmpV1 = Bump.Vector3.create(),
            tmpV2 = Bump.Vector3.create();

        // `normal` uses `tmpV2`.
        var normal = b.subtract( a, tmpV1 ).cross( c.subtract( a, tmpV2 ), tmpV2 );

        var signp = p.subtract( a, tmpV1 ).dot( normal ), // [AP AB AC]
            signd = d.subtract( a, tmpV1 ).dot( normal ); // [AD AB AC]

        if ( signd * signd < ( 1e-8 * 1e-8 ) ) {
          return -1;
        }

        // Points on opposite sides if expression signs are opposite.
        return signp * signd < 0;
      },

      closestPtPointTriangle: function( p, a, b, c, result ) {

        result.usedVertices.reset();

        var tmpV1 = Bump.Vector3.create(),
            ab = b.subtract( a ),
            ac = c.subtract( a );

        // Check if P in vertex region outside A.
        var ap = p.subtract( a, tmpV1 ),
            d1 = ab.dot( ap ),
            d2 = ac.dot( ap );
        if ( d1 <= 0 && d2 <= 0 ) {
          result.closestPointOnSimplex.assign( a );
          result.usedVertices.usedVertexA = true;
          result.setBarycentricCoordinates( 1, 0, 0 );
          return true;
        }

        // Check if P in vertex region outside B.
        var bp = p.subtract( b, tmpV1 ),
            d3 = ab.dot( bp ),
            d4 = ac.dot( bp );
        if ( d3 >= 0 && d4 <= d3 ) {
          result.closestPointOnSimplex.assign( b );
          result.usedVertices.usedVertexB = true;
          result.setBarycentricCoordinates( 0, 1, 0 );

          return true;
        }

        var v, w;

        // Check if P in edge region of AB, if so
        // return projection of P onto AB.
        var vc = d1 * d4 - d3 * d2;
        if ( vc <= 0 && d1 >= 0 && d3 <= 0 ) {
          v = d1 / ( d1 - d3 );
          result.closestPointOnSimplex.assign( a.add( ab.multiplyScalar( v, tmpV1 ), tmpV1 ) );
          result.usedVertices.usedVertexA = true;
          result.usedVertices.usedVertexB = true;
          result.setBarycentricCoordinates( 1 - v, v, 0 );
          return true;
        }

        // Check if P in vertex region outside C.
        var cp = p.subtract( c, tmpV1 ),
            d5 = ab.dot( cp ),
            d6 = ac.dot( cp );
        if ( d6 >= 0 && d5 <= d6 ) {
          result.closestPointOnSimplex.assign( c );
          result.usedVertices.usedVertexC = true;
          result.setBarycentricCoordinates( 0, 0, 1 );
          return true;
        }

        // Check if P in edge region of AC, if so
        // return projection of P onto AC.
        var vb = d5 * d2 - d1 * d6;
        if ( vb <= 0 && d2 >= 0 && d6 <= 0 ) {
          w = d2 / ( d2 - d6 );
          result.closestPointOnSimplex = a.add( ac.multiplyScalar( w, tmpV1 ), tmpV1 );
          result.usedVertices.usedVertexA = true;
          result.usedVertices.usedVertexC = true;
          result.setBarycentricCoordinates( 1 - w, 0, w );
          return true;
        }

        // Check if P in edge region of BC, if so
        // return projection of P onto BC.
        var va = d3 * d6 - d5 * d4;
        if ( va <= 0 && ( d4 - d3 ) >= 0 && ( d5 - d6 ) >= 0 ) {
          w = ( d4 - d3 ) / (( d4 - d3 ) + ( d5 - d6 ));

          result.closestPointOnSimplex.assign(
            b.add(
              c.subtract( b, tmpV1 )
                .multiplyScalar( w, tmpV1 ), tmpV1 )
          );
          result.usedVertices.usedVertexB = true;
          result.usedVertices.usedVertexC = true;
          result.setBarycentricCoordinates( 0, 1 - w, w );
          return true;
        }

        // P inside face region. Compute Q through its barycentric
        // coordinates `( u, v, w )`.
        var denom = 1 / ( va + vb + vc );
        v = vb * denom;
        w = vc * denom;

        var tmpV2 = Bump.Vector3.create();
        result.closestPointOnSimplex.assign(
          a
            .add( ab.multiplyScalar( v, tmpV2 ), tmpV1 )
            .add( ac.multiplyScalar( w, tmpV2 ), tmpV1 )
        );
        result.usedVertices.usedVertexA = true;
        result.usedVertices.usedVertexB = true;
        result.usedVertices.usedVertexC = true;
        result.setBarycentricCoordinates( 1 - v - w, v, w );

        return true;
      },

      reset: function() {
        this.cachedValidClosest = false;
        this.numVertices = 0;
        this.needsUpdate = true;
        this.lastW.setValue( Infinity, Infinity, Infinity );
        this.cachedBC.reset();
      },

      addVertex: function( w, p, q ) {
        this.lastW.assign( w );
        this.needsUpdate = true;

        this.simplexVectorW[ this.numVertices ].assign( w );
        this.simplexPointsP[ this.numVertices ].assign( p );
        this.simplexPointsQ[ this.numVertices ].assign( q );

        ++this.numVertices;
      },

      setEqualVertexThreshold: function( threshold ) {
        this.equalVertexThreshold = threshold;
      },

      getEqualVertexThreshold: function() {
        return this.equalVertexThreshold;
      },

      closest: function( v ) {
        var succes = this.updateClosestVectorAndPoints();
        v.assign( this.cachedV );
        return succes;
      },

      maxVertex: function() {
        var i, maxV = 0, numverts = this.numVertices;

        for ( i = 0; i < numverts; ++i ) {
          var curLen2 = this.simplexVectorW[i].length2();
          if ( maxV < curLen2 ) {
            maxV = curLen2;
          }
        }
        return maxV;
      },

      fullSimplex: function() {
        return this.numVertices === 4;
      },

      getSimplex: function( pBuf, qBuf, yBuf) {
        var i;
        for ( i = 0; i < this.numVertices; ++i ) {
          yBuf[i] = this.simplexVectorW[i];
          pBuf[i] = this.simplexPointsP[i];
          qBuf[i] = this.simplexPointsQ[i];
        }
        return this.numVertices;
      },

      inSimplex: function( w ) {
        var found = false,
            i, numverts = this.numVertices;

        // `w` is in the current (reduced) simplex.
        for ( i = 0; i < numverts; ++i ) {
          if ( this.simplexVectorW[i].distance2( w ) <= this.equalVertexThreshold ) {
            found = true;
          }
        }

        // Check in case `lastW` is already removed.
        if ( w === this.lastW) {
          return true;
        }

        return found;
      },

      backup_closest: function( v ) {
        v = this.cachedV;
      },

      emptySimplex: function() {
        return this.numVertices === 0;
      },

      compute_points: function( p1, p2 ) {
        this.updateClosestVectorAndPoints();
        p1.assign( this.cachedP1 );
        p2.assign( this.cachedP2 );
      },

      numVertices: function() {
        return this.numVertices;
      }

    }
  });

})( this, this.Bump );
