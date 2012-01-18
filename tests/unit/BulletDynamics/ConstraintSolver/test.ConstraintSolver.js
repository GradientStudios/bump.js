module( 'ConstraintSolver' );

test( 'abstract methods', function() {
  var cs = Bump.ConstraintSolver.create();

  ok( cs instanceof Bump.ConstraintSolver.prototype.constructor, 'correct type' );

  raises( function() { cs.solveGroup(); }, 'solveGroup is abstract' );
  raises( function() { cs.reset(); }, 'reset is abstract' );

  ok( (function() {
    cs.prepareSolve();
    return true;
  })(), 'prepareSolve is not abstract' );

  ok( (function() {
    cs.allSolved();
    return true;
  })(), 'allSolved is not abstract' );
});
