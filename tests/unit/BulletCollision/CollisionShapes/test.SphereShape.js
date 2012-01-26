module( 'SphereShape.create' );

test( 'basic', function() {
  var sphere = Bump.SphereShape.create( 1 );

  ok( sphere instanceof Bump.SphereShape.prototype.constructor, 'correct type' );
  strictEqual( sphere.getName(), 'SPHERE' );
});

module( 'SphereShape.getRadius' );

test( 'basic', function() {
  var sphere = Bump.SphereShape.create( 1 );

  testFunc( Bump.SphereShape, 'getRadius', {
    objects: sphere,
    expected: [ 1 ]
  });
});
