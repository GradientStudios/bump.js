(function( window, Bump ) {

  Bump.GjkEpaPenetrationDepthSolver = Bump.type({
    parent: Bump.ConvexPenetrationDepthSolver,
    init: function GjkEpaPenetrationDepthSolver() {},
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
        var guessVector = transformA.origin.subtract( transformB.origin );
        var results = Bump.GjkEpaSolver2.sResults.create();

        if (
          Bump.GjkEpaSolver2.Penetration(
            pConvexA, transformA,
            pConvexB, transformB,
            guessVector, results
          )
        ) {
          //     debugDraw.drawLine( results.witnesses[1], results.witnesses[1] + results.normal, Bump.Vector3.create( 255, 0, 0 ) );
          //     resultOut.addContactPoint( results.normal, results.witnesses[1], -results.depth );
          wWitnessOnA.assign( results.witnesses[0] );
          wWitnessOnB.assign( results.witnesses[1] );
          v.assign( results.normal );
          return true;
        } else {
          if ( Bump.GjkEpaSolver2.Distance( pConvexA, transformA, pConvexB, transformB, guessVector, results ) ) {
            wWitnessOnA.assign( results.witnesses[0] );
            wWitnessOnB.assign( results.witnesses[1] );
            v.assign( results.normal );
            return false;
          }
        }

        return false;
      }
    }
  });

})( this, this.Bump );
