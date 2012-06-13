// load: bump.js

(function( window, Bump ) {

  Bump.ConstraintSolver = Bump.type({
    init: function ConstraintSolver() {},
    members: {
      prepareSolve: Bump.noop,
      solveGroup: Bump.abstract,
      allSolved: Bump.noop,
      reset: Bump.abstract
    }
  });

})( this, this.Bump );
