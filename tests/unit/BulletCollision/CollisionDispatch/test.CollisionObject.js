module( 'CollisionObject' );

test( 'creation', function() {
  ok( Bump.CollisionObject );

  if ( Bump.CollisionObject ) {
    var co = Bump.CollisionObject.create();
    ok( co );
  } else {
    ok( true, 'test skipped' );
  }
});
