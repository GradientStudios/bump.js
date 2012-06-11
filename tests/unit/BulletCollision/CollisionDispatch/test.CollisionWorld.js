module( 'CollisionWorld.create' );

test( 'test skipped', function() {
  expect( 0 );
});

module( 'CollisionWorld.updateSingleAabb' );

test( 'test skipped', function() {
  expect( 0 );
});

module( 'CollisionWorld.updateAabbs' );

test( 'test skipped', function() {
  expect( 0 );
});

module( 'CollisionWorld.rayTest' );

test( 'test skipped', function() {
  expect( 0 );
});

module( 'CollisionWorld.convexSweetTest' );

test( 'test skipped', function() {
  expect( 0 );
});

module( 'CollisionWorld.contactTest' );

test( 'test skipped', function() {
  expect( 0 );
});

module( 'CollisionWorld.contactPairTest' );

test( 'test skipped', function() {
  expect( 0 );
});

module( 'CollisionWorld.addCollisionObject' );

test( 'test skipped', function() {
  expect( 0 );
});

module( 'CollisionWorld.removeCollisionObject' );

test( 'test skipped', function() {
  expect( 0 );
});

module( 'CollisionWorld.performDiscreteCollisionDetection' );

test( 'test skipped', function() {
  expect( 0 );
});


(function(){
  var makeTestSingleRayCallback = function() {
    var from = Bump.Vector3.create( 0, 0, 0 );
    var to = Bump.Vector3.create( 10, 10, 10 );

    var collisionConfiguration = Bump.DefaultCollisionConfiguration.create();
    var dispatcher = Bump.CollisionDispatcher.create( collisionConfiguration );
    var overlappingPairCache = Bump.DbvtBroadphase.create();
    var world = Bump.CollisionWorld.create( dispatcher, overlappingPairCache, collisionConfiguration );
    var rrc = Bump.CollisionWorld.RayResultCallback.create();

    return  Bump.CollisionWorld.SingleRayCallback.create( from, to, world, rrc );
  }

  module( 'CollisionWorld.SingleRayCallback.create' );

  test( 'basic', function() {
    var src = makeTestSingleRayCallback();
    ok( src instanceof Bump.CollisionWorld.SingleRayCallback.prototype.constructor );
  });

  test( 'correct types', function() {
    var src = makeTestSingleRayCallback();

    var checks = [
      [ 'rayFromWorld', Bump.Vector3 ],
      [ 'rayToWorld', Bump.Vector3 ],
      [ 'hitNormal', Bump.Vector3 ],
      [ 'world', Bump.CollisionWorld ],
      [ 'resultCallback', Bump.CollisionWorld.RayResultCallback ],
      [ 'rayFromTrans', Bump.Transform ],
      [ 'rayToTrans', Bump.Transform ],
      [ 'rayDirectionInverse', Bump.Vector3 ],
      [ 'signs', Bump.Vector3 ],
      [ 'lambda_max', 'number' ]
    ];

    checkTypes( src, checks );
  });

  module( 'CollisionWorld.SingleRayCallback.process' );

  test( 'test skipped', function() {
    expect( 0 );
  });
})();

module( 'CollisionWorld.LocalShapeInfo.create' );

test( 'basic', function() {
  var lsi = Bump.CollisionWorld.LocalShapeInfo.create();

  ok( lsi instanceof Bump.CollisionWorld.LocalShapeInfo.prototype.constructor );
});

test( 'correct types', function() {
  var lsi = Bump.CollisionWorld.LocalShapeInfo.create();

  var checks = [
    [ 'shapePart', 'number' ],
    [ 'triangleIndex', 'number' ]
  ];

  checkTypes( lsi, checks );
});

module( 'CollisionWorld.LocalRayResult.create' );

test( 'basic', function() {
  var lrr = Bump.CollisionWorld.LocalRayResult.create(
    Bump.CollisionObject.create(),
    Bump.CollisionWorld.LocalShapeInfo.create(),
    Bump.Vector3.create(),
    0
  );

  ok( lrr instanceof Bump.CollisionWorld.LocalRayResult.prototype.constructor );
});

test( 'correct types', function() {
  var lrr = Bump.CollisionWorld.LocalRayResult.create(
    Bump.CollisionObject.create(),
    Bump.CollisionWorld.LocalShapeInfo.create(),
    Bump.Vector3.create(),
    0
  );

  var checks = [
    [ 'collisionObject', Bump.CollisionObject ],
    [ 'localShapeInfo', Bump.CollisionWorld.LocalShapeInfo ],
    [ 'hitNormalLocal', Bump.Vector3 ],
    [ 'hitFraction', 'number' ]
  ];

  checkTypes( lrr, checks );
});

module( 'CollisionWorld.RayResultCallback.create' );

test( 'basic', function() {
  var rrc = Bump.CollisionWorld.RayResultCallback.create();
  ok( rrc instanceof Bump.CollisionWorld.RayResultCallback.prototype.constructor );
});

test( 'correct types', function() {
  var rrc = Bump.CollisionWorld.RayResultCallback.create();

  var checks = [
    [ 'closestHitFraction', 'number' ],
    [ 'collisionObject', null ],
    [ 'collisionFilterGroup', 'number'], // technically an enum value
    [ 'collisionFilterMask', 'number'], // technically an enum value
    [ 'flags', 'number' ]
  ];

  checkTypes( rrc, checks );
});

module( 'CollisionWorld.RayResultCallback.needsCollision' );

test( 'needsCollision', function() {
  var rrc = Bump.CollisionWorld.RayResultCallback.create();
  ok( rrc.needsCollision, 'function exists' );

  var filters = Bump.BroadphaseProxy.CollisionFilterGroups;

  // note: should probably be using actual Bump.BroadphaseProxies here
  var proxy = Bump.BroadphaseProxy.createEmpty();
  ok( !rrc.needsCollision( proxy ), 'no collision with group 0, mask 0' );

  proxy.collisionFilterGroup = filters.DefaultFilter;
  proxy.collisionFilterMask = filters.AllFilter;
  ok( rrc.needsCollision( proxy ), 'does collide with group = DefaultFilter, mask = AllFilter' );

  // TODO: add more tests for various filter combinations
});

module( 'CollisionWorld.ClosestRayResultCallback.create' );

test( 'basic', function() {
  var crrc = Bump.CollisionWorld.ClosestRayResultCallback.create(
    Bump.Vector3.create(),
    Bump.Vector3.create()
  );
  ok( crrc instanceof Bump.CollisionWorld.RayResultCallback.prototype.constructor );
});

test( 'correct types', function() {
  var crrc = Bump.CollisionWorld.ClosestRayResultCallback.create(
    Bump.Vector3.create(),
    Bump.Vector3.create()
  );

  var checks = [
    [ 'closestHitFraction', 'number' ],
    [ 'collisionObject', null ],
    [ 'collisionFilterGroup', 'number'], // technically an enum value
    [ 'collisionFilterMask', 'number'], // technically an enum value
    [ 'flags', 'number' ],
    [ 'rayFromWorld', Bump.Vector3 ],
    [ 'rayToWorld', Bump.Vector3 ],
    [ 'hitNormalWorld', Bump.Vector3 ],
    [ 'hitPointWorld', Bump.Vector3 ],
  ];

  checkTypes( crrc, checks );
});

module( 'CollisionWorld.ClosestRayResultCallback.addSingleResult' );

test( 'addSingleResult', function() {
  var crrc = Bump.CollisionWorld.ClosestRayResultCallback.create(
    Bump.Vector3.create( 0, 0, 0 ),
    Bump.Vector3.create( 10, 10, 10 )
  );

  ok( crrc.addSingleResult, 'function exists' );

  var co0 = Bump.CollisionObject.create();
  var lrr0 = Bump.CollisionWorld.LocalRayResult.create(
    co0,
    Bump.CollisionWorld.LocalShapeInfo.create(),
    Bump.Vector3.create( 1, 0, 0 ),
    0.5
  );

  var co1 = Bump.CollisionObject.create();
  var lrr1 = Bump.CollisionWorld.LocalRayResult.create(
    co1,
    Bump.CollisionWorld.LocalShapeInfo.create(),
    Bump.Vector3.create( 0, 1, 0 ),
    0.4
  );

  var co2 = Bump.CollisionObject.create();
  var lrr2 = Bump.CollisionWorld.LocalRayResult.create(
    co2,
    Bump.CollisionWorld.LocalShapeInfo.create(),
    Bump.Vector3.create( 0, 0, 1 ),
    0.6
  );

  equal( crrc.addSingleResult( lrr0, true ), lrr0.hitFraction, 'returns correct result' );
  ok( crrc.closestHitFraction === lrr0.hitFraction, 'hit fraction set' );
  ok( crrc.collisionObject === lrr0.collisionObject, 'collison object set' );
  ok( crrc.hitNormalWorld.equal( lrr0.hitNormalLocal ) &&
      crrc.hitNormalWorld !== lrr0.hitNormalLocal, 'normal value correctly cloned' );

  equal( crrc.addSingleResult( lrr1, false ), lrr1.hitFraction, 'returns correct result' );
  strictEqual( crrc.closestHitFraction, lrr1.hitFraction, 'hit fraction set' );
  strictEqual( crrc.collisionObject, lrr1.collisionObject, 'collison object set' );
  ok( crrc.hitNormalWorld.equal( lrr1.hitNormalLocal ) &&
      crrc.hitNormalWorld !== lrr1.hitNormalLocal, 'normal value correctly cloned' );

  var errorThrown = false;
  try {
    crrc.addSingleResult( lrr2, true );
  }
  catch ( e ) {
    errorThrown = true;
  }

  ok( errorThrown, 'larger hit fraction correctly throws assertion fail' );
});