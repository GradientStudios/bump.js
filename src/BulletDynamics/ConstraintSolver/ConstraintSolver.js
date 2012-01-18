(function( window, Bump ) {

  Bump.ConstraintSolver = Bump.type({
    members: {
      prepareSolve: function() {},
      solveGroup: function() { Bump.Assert( false ); },
      allSolved: function() {},
      reset: function() { Bump.Assert( false ); }
    }
  });

})( this, this.Bump );
