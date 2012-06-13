module( 'DefaultCollisionConfiguration.create' );

test( 'basic', function() {
  var collisionConfiguration = Bump.DefaultCollisionConfiguration.create();

  ok( collisionConfiguration instanceof Bump.DefaultCollisionConfiguration.prototype.constructor, 'correct type' );
});
