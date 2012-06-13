// load: bump.js
// load: BulletCollision/NarrowPhaseCollision/ConvexPenetrationDepthSolver.js

// run: BulletCollision/NarrowPhaseCollision/GjkEpa2.js

(function( window, Bump ) {

  Bump.GjkEpaPenetrationDepthSolver = Bump.type({
    parent: Bump.ConvexPenetrationDepthSolver,

    init: function GjkEpaPenetrationDepthSolver() {
      this._super();
    },

    members: {
      clone: function( dest ) {
        return dest || Bump.GjkEpaPenetrationDepthSolver.create();
      },

      assign: function( other ) {
        return this;
      },

      calcPenDepth: function(
        simplexSolver,
        pConvexA, pConvexB,
        transformA, transformB,
        v,
        wWitnessOnA, wWitnessOnB,
        debugDraw,
        stackAlloc
      ) {
        var GjkEpaSolver2 = Bump.GjkEpaSolver2;

        var guessVector = transformA.origin.subtract( transformB.origin );
        var results = GjkEpaSolver2.sResults.create();

        if (
          GjkEpaSolver2.Penetration(
            pConvexA, transformA,
            pConvexB, transformB,
            guessVector, results
          )
        ) {
          wWitnessOnA.assign( results.witnesses0 );
          wWitnessOnB.assign( results.witnesses1 );
          v.assign( results.normal );
          return true;
        } else {
          if ( GjkEpaSolver2.Distance( pConvexA, transformA, pConvexB, transformB, guessVector, results ) ) {
            wWitnessOnA.assign( results.witnesses0 );
            wWitnessOnB.assign( results.witnesses1 );
            v.assign( results.normal );
            return false;
          }
        }

        return false;
      }

    }
  });

})( this, this.Bump );
