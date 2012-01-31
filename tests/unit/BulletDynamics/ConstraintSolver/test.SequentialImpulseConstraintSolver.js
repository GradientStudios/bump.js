module( 'Bump.SequentialImpulseConstraintSolver create' );

test( 'basic', function() {
  ok( Bump.SequentialImpulseConstraintSolver, 'SequentialImpulseConstraintSolver exists' );
  var sics = Bump.SequentialImpulseConstraintSolver.create();

  ok( sics instanceof Bump.SequentialImpulseConstraintSolver.prototype.constructor, 'correct type' );
} );
