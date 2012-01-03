module( 'Bump.BroadphaseProxy' );

test( 'BroadphaseProxy exists' function() {
  ok( Bump.BroadphaseProxy );
} );

module( 'Bump.BroadphaseProxy basic' );

test( 'createEmpty', function() {
  ok( Bump.BroadphaseProxy.createEmpty, 'createExists' );
  ok( typeof Bump.BroadphaseProxy.createEmpty() === 'object', 'creates an object' );

  var a = Bump.BroadphaseProxy.createEmpty(),
      b = Bump.BroadphaseProxy.createEmpty();

  ok( a !== b, 'creates different objects' );
  deepEqual( a, b, 'creates similar objects' );
} );