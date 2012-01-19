(function( window, Bump ) {

  Bump.ConstraintSolver = Bump.type({
    members: {
      prepareSolve: Bump.noop,
      solveGroup: Bump.abstract,
      allSolved: Bump.noop,
      reset: Bump.abstract
    }
  });

})( this, this.Bump );
