// load: bump.js
// load: BulletCollision/NarrowPhaseCollision/ConvexCast.js
// load: LinearMath/Vector3.js
// load: LinearMath/Transform.js

// run: BulletCollision/CollisionShapes/ConvexShape.js

(function( window, Bump ) {

  var tmpV1 = Bump.Vector3.create();
  var tmpV2 = Bump.Vector3.create();

  var tmpTITA = Bump.Transform.getIdentity();
  var tmpTITB = Bump.Transform.getIdentity();

  var tmpVr = Bump.Vector3.create();
  var tmpVSVA = Bump.Vector3.create();
  var tmpVSVB = Bump.Vector3.create();
  var tmpVv = Bump.Vector3.create();
  var tmpVn = Bump.Vector3.create();
  var tmpVw = Bump.Vector3.create();

  var MAX_ITERATIONS = 64;

  Bump.SubsimplexConvexCast = Bump.type({
    parent: Bump.ConvexCast,

    init: function SubsimplexConvexCast (
      convexA,                  // Bump.ConvexShape
      convexB,                  // Bump.ConvexShape
      simplexSolver             // Bump.SimplexSolverInterface
    ) {
      this.simplexSolver = simplexSolver;
      this.convexA = convexA;
      this.convexB = convexB;
    },

    members: {
      calcTimeOfImpact: function(
        fromA,                  // Bump.Transform
        toA,                    // Bump.Transform
        fromB,                  // Bump.Transform
        toB,                    // Bump.Transform
        result                  // CastResult
      ) {
        this.simplexSolver.reset();

        var linVelA = toA.getOrigin().subtract( fromA.getOrigin(), tmpV1 );
        var linVelB = toB.getOrigin().subtract( fromB.getOrigin(), tmpV2 );

        var lambda = 0;

        var interpolatedTransA = tmpTITA.assign( fromA );
        var interpolatedTransB = tmpTITB.assign( fromB );

        // take relative motion
        var r = linVelA.subtract( linVelB, tmpVr );
        var v;

        var supVertexA = fromA.transform(
          this.convexA.localGetSupportingVertex(
            fromA.getBasis().vectorMultiply( r.negate( tmpV1 ), tmpV1 ),
            tmpV1
          ),
          tmpVSVA
        );

        var supVertexB = fromB.transform(
          this.convexB.localGetSupportingVertex(
            fromB.getBasis().vectorMultiply( r, tmpV2 ),
            tmpV2
          ),
          tmpVSVB
        );

        v = supVertexA.subtract( supVertexB, tmpVv );
        var maxIter = MAX_ITERATIONS;

        var n = tmpVn.setZero();
        // n.setValue( 0, 0, 0 );
        var hasResult = false;
        // var c = tmpVc.setZero(); // ASD: not used?

        var lastLambda = lambda;

        var dist2 = v.length2();

        // #ifdef BT_USE_DOUBLE_PRECISION
        var epsilon = 0.0001;
        // #else
        // btScalar epsilon = btScalar(0.0001);
        // #endif //BT_USE_DOUBLE_PRECISION
        var w = tmpVw.setZero();
        // var p = tmpVp.setZero(); // ASD: not used?
        var VdotR;

        while ( ( dist2 > epsilon ) && maxIter-- ) {
          supVertexA = interpolatedTransA.transform(
            this.convexA.localGetSupportingVertex(
              interpolatedTransA.getBasis().vectorMultiply( v.negate( tmpV1 ), tmpV1 ),
              tmpV1
            ),
            tmpVSVA
          );
          supVertexB = interpolatedTransB.transform(
            this.convexB.localGetSupportingVertex(
              interpolatedTransB.getBasis().vectorMultiply( v, tmpV2 ),
              tmpV2
            ),
            tmpVSVB
          );

          supVertexA.subtract( supVertexB, w );

          var VdotW = v.dot( w );

          if ( lambda > 1.0) {
            return false;
          }

          if ( VdotW > 0 ) {
            VdotR = v.dot( r );

            if ( VdotR >= -( Bump.SIMD_EPSILON * Bump.SIMD_EPSILON ) ) {
              return false;
            }
            else {
              lambda = lambda - VdotW / VdotR;
              // interpolate to next lambda
              // x = s + lambda * r;
              interpolatedTransA.getOrigin().setInterpolate3( fromA.getOrigin(), toA.getOrigin(), lambda );
              interpolatedTransB.getOrigin().setInterpolate3( fromB.getOrigin(), toB.getOrigin(), lambda );
              // m_simplexSolver->reset();
              // check next line
              supVertexA.subtract( supVertexB, w );
              lastLambda = lambda;
              n.assign( v );
              hasResult = true;
            }
          }

          // Just like regular GJK only add the vertex if it isn't already (close) to current vertex, it would lead to divisions by zero and NaN etc.
          if ( !this.simplexSolver.inSimplex( w ) ) {
            this.simplexSolver.addVertex( w, supVertexA , supVertexB );
          }

          if ( this.simplexSolver.closest( v ) ) {
            dist2 = v.length2();
            hasResult = true;
            // todo: check this normal for validity
            // n=v;
            // printf("V=%f , %f, %f\n",v[0],v[1],v[2]);
            // printf("DIST2=%f\n",dist2);
            // printf("numverts = %i\n",m_simplexSolver->numVertices());
          }
          else {
            dist2 = 0;
          }
        }

        // int numiter = MAX_ITERATIONS - maxIter;
        // printf("number of iterations: %d", numiter);

        // don't report a time of impact when moving 'away' from the hitnormal

        result.fraction = lambda;
        if ( n.length2() >= ( Bump.SIMD_EPSILON * Bump.SIMD_EPSILON ) ) {
          n.normalized( result.normal );
        }
        else {
          result.normal.setValue( 0.0, 0.0, 0.0 );
        }

        // don't report time of impact for motion away from the contact normal (or causes minor penetration)
        if ( result.normal.dot( r ) >= -result.allowedPenetration ) {
          return false;
        }

        // var hitA = Bump.Vector3.create();
        // var hitB = Bump.Vector3.create();
        // this.simplexSolver.compute_points( hitA, hitB );
        // result.hitPoint = hitB;
        this.simplexSolver.compute_points( tmpV1, result.hitPoint );

        return true;
      }
    }
  });

})( this, this.Bump );
