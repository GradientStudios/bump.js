module( 'DiscreteDynamicsWorld.rayTest' );

test( 'rayTest', function() {
  var collisionConfiguration = Bump.DefaultCollisionConfiguration.create();
  ok( collisionConfiguration instanceof Bump.DefaultCollisionConfiguration.prototype.constructor );

  var dispatcher = Bump.CollisionDispatcher.create( collisionConfiguration );
  ok( dispatcher instanceof Bump.CollisionDispatcher.prototype.constructor );

  var overlappingPairCache = Bump.DbvtBroadphase.create();
  ok( overlappingPairCache instanceof Bump.DbvtBroadphase.prototype.constructor );

  var solver = Bump.SequentialImpulseConstraintSolver.create();
  ok( solver instanceof Bump.SequentialImpulseConstraintSolver.prototype.constructor );

  var dynamicsWorld = Bump.DiscreteDynamicsWorld.create( dispatcher, overlappingPairCache, solver, collisionConfiguration );
  ok( dynamicsWorld instanceof Bump.DiscreteDynamicsWorld.prototype.constructor );

  var collisionShapes = [];

  // make a box shape
  (function(){
    var boxShape = Bump.BoxShape.create( Bump.Vector3.create( 500, 500, 500 ) );
    ok( boxShape instanceof Bump.BoxShape.prototype.constructor );

    var boxTransform = Bump.Transform.create();
    ok( boxTransform instanceof Bump.Transform.prototype.constructor );
    boxTransform.setIdentity();
    boxTransform.setOrigin( Bump.Vector3.create( 0, -510, 0 ) );

    var mass = 0;
    var isDynamic = ( mass !== 0 );
    var localInertia = Bump.Vector3.create();

    if ( isDynamic ) {
      boxShape.calculateLocalInertia( mass, localInertia );
    }

    var myMotionState = Bump.DefaultMotionState.create( boxTransform );
    ok( myMotionState instanceof Bump.DefaultMotionState.prototype.constructor );

    var rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create( mass, myMotionState, boxShape, localInertia );
    ok( rbInfo instanceof Bump.RigidBody.RigidBodyConstructionInfo.prototype.constructor );

    var body = Bump.RigidBody.create( rbInfo );
    ok( body instanceof Bump.RigidBody.prototype.constructor );

    dynamicsWorld.addRigidBody( body );
  })();

  // make a compound shape
  (function(){
    var compoundShape = Bump.CompoundShape.create();
    ok( compoundShape instanceof Bump.CompoundShape.prototype.constructor );

    // make a child box shape
    var boxShape = Bump.BoxShape.create( Bump.Vector3.create( 10, 10, 10 ) );
    ok( boxShape instanceof Bump.BoxShape.prototype.constructor );
    var boxTransform = Bump.Transform.create();
    ok( boxTransform instanceof Bump.Transform.prototype.constructor );
    boxTransform.setIdentity();

    compoundShape.addChildShape( boxTransform, boxShape );

    var compoundTransform = Bump.Transform.create();
    ok( compoundTransform instanceof Bump.Transform.prototype.constructor );
    compoundTransform.setIdentity();
    compoundTransform.setOrigin( Bump.Vector3.create( 50, 0, 0 ) );

    var mass = 0;
    var isDynamic = ( mass !== 0 );
    var localInertia = Bump.Vector3.create();

    if ( isDynamic ) {
      compoundShape.calculateLocalInertia( mass, localInertia );
    }

    var myMotionState = Bump.DefaultMotionState.create( compoundTransform );
    ok( myMotionState instanceof Bump.DefaultMotionState.prototype.constructor );

    var rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create( mass, myMotionState, compoundShape, localInertia );
    ok( rbInfo instanceof Bump.RigidBody.RigidBodyConstructionInfo.prototype.constructor );

    var body = Bump.RigidBody.create( rbInfo );
    ok( body instanceof Bump.RigidBody.prototype.constructor );

    dynamicsWorld.addRigidBody( body );
  })();

  // test params
  var testNum = 0;
  var epsilon = Math.pow( 2, -52 );

  // function for running ray tests and comparing with provided output using epsilonNumberCheck
  var raycastTest = function( opts ) {
    var rayCallback = Bump.CollisionWorld.ClosestRayResultCallback.create( opts.from, opts.to );
    if( opts.mask ) {
      rayCallback.collisionFilterMask = opts.mask;
    }
    dynamicsWorld.rayTest( opts.from, opts.to, rayCallback );

    if( opts.hasHit ) {
      ok( rayCallback.hasHit(), 'Test ' + testNum + ' has a hit.' );
      epsilonNumberCheck( rayCallback.hitPointWorld, opts.hitPointWorld,
                          epsilon, 'Test ' + testNum + ' has correct hitPointWorld.' );
      epsilonNumberCheck( rayCallback.hitNormalWorld, opts.hitNormalWorld,
                          epsilon, 'Test ' + testNum + ' has correct hitNormalWorld.' );
      epsilonNumberCheck( { closestHitFraction: rayCallback.closestHitFraction },
                          { closestHitFraction: opts.closestHitFraction },
                          epsilon, 'Test ' + testNum + ' has correct' );
    }
    else {
      ok( !rayCallback.hasHit(), 'Test ' + testNum + ' does not have a hit.' );
    }
    testNum++;
  };

  // run the actual tests
  raycastTest({
    from: Bump.Vector3.create( -2, -8.93334, -1.55556 ),
    to: Bump.Vector3.create( -2, -10.0333, -1.55556 ),
    mask: -1,
    hasHit: true,
    hitPointWorld: Bump.Vector3.create( -2.00000000000000000000, -9.99999999997164401577, -1.55556000000000005379 ),
    hitNormalWorld: Bump.Vector3.create( 0.00000000000000832672, 1.00000000000000000000, -0.00000000000004850317 ),
    closestHitFraction: 0.96972617183501508276
  });

  raycastTest({
    from: Bump.Vector3.create( 0.00000000000000000000, 0.00000000000000000000, 0.00000000000000000000 ),
    to: Bump.Vector3.create( 50.00000000000000000000, 0.00000000000000000000, 0.00000000000000000000 ),
    mask: -1,
    hasHit: true,
    hitPointWorld: Bump.Vector3.create( 40.00000000000000000000, 0.00000000000000000000, 0.00000000000000000000 ),
    hitNormalWorld: Bump.Vector3.create( -1.00000000000000000000, 0.00000000000000000000, 0.00000000000000000000 ),
    closestHitFraction: 0.80000000000000004441
  });

  raycastTest({
    from: Bump.Vector3.create( 0.00000000000000000000, 0.00000000000000000000, 0.00000000000000000000 ),
    to: Bump.Vector3.create( 40.10000000000000142109, 0.00000000000000000000, 0.00000000000000000000 ),
    mask: -1,
    hasHit: true,
    hitPointWorld: Bump.Vector3.create( 40.00000000000000000000, 0.00000000000000000000, 0.00000000000000000000 ),
    hitNormalWorld: Bump.Vector3.create( -1.00000000000000000000, 0.00000000000000000000, 0.00000000000000000000 ),
    closestHitFraction: 0.99750623441396502056
  });

  raycastTest({
    from: Bump.Vector3.create( 0.00000000000000000000, 0.00000000000000000000, 0.00000000000000000000 ),
    to: Bump.Vector3.create( 40.00000000000000000000, 0.00000000000000000000, 0.00000000000000000000 ),
    mask: -1,
    hasHit: false
  });

  raycastTest({
    from: Bump.Vector3.create( 0.00000000000000000000, 0.00000000000000000000, 0.00000000000000000000 ),
    to: Bump.Vector3.create( 30.00000000000000000000, 0.00000000000000000000, 0.00000000000000000000 ),
    mask: -1,
    hasHit: false
  });

});