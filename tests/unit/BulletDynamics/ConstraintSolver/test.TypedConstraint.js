module( 'TypedConstraint.create' );

test( 'basic', function() {
  var tc = Bump.TypedConstraint.create( 0, Bump.RigidBody.create() );

  ok( tc );
});
