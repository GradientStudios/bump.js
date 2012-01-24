( function( window, Bump) {
  // *** Bump.SequentialImpulseConstraintSolver *** is a port of the bullet
  // class `btSequentialImpulseConstraintSolver`. Original documentation:
  // The btSequentialImpulseConstraintSolver is a fast SIMD implementation of
  // the Projected Gauss Seidel (iterative LCP) method.
  Bump.SequentialImpulseConstraintSolver = Bump.type( {
    parent: Bump.ConstraintSolver
  } );

} )( this, this.Bump );