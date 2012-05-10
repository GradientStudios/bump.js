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

  // make a box shape
  var groundShape = Bump.BoxShape.create( Bump.Vector3.create( 500, 500, 500 ) );
  ok( groundShape instanceof Bump.BoxShape.prototype.constructor );

  var collisionShapes = [ groundShape ];

  var groundTransform = Bump.Transform.create();
  ok( groundTransform instanceof Bump.Transform.prototype.constructor );
  groundTransform.setIdentity();
  groundTransform.setOrigin( Bump.Vector3.create( 0, -510, 0 ) );

  var mass = 0;
  var isDynamic = ( mass !== 0 );
  var localInertia = Bump.Vector3.create();

  if ( isDynamic ) {
    groundShape.calculateLocalInertia( mass, localInertia );
  }

  var myMotionState = Bump.DefaultMotionState.create( groundTransform );
  ok( myMotionState instanceof Bump.DefaultMotionState.prototype.constructor );

  var rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create( mass, myMotionState, groundShape, localInertia );
  ok( rbInfo instanceof Bump.RigidBody.RigidBodyConstructionInfo.prototype.constructor );

  var body = Bump.RigidBody.create( rbInfo );
  ok( body instanceof Bump.RigidBody.prototype.constructor );

  dynamicsWorld.addRigidBody( body );

  // do the actual ray test
  var from = Bump.Vector3.create( -2, -8.93334, -1.55556 );
  var to = Bump.Vector3.create( -2, -10.0333, -1.55556 );
  // var mask = -9;

  var FilterGroups = Bump.BroadphaseProxy.CollisionFilterGroups;

  var rayCallback = Bump.CollisionWorld.ClosestRayResultCallback.create( from, to );
  rayCallback.collisionFilterMask = FilterGroups.AllFilter ^ FilterGroups.DebrisFilter;

  dynamicsWorld.rayTest( from, to, rayCallback );

  var epsilon = Math.pow( 2, -52 );
  ok( rayCallback.hasHit(), 'has hit' );
  epsilonNumberCheck( rayCallback.hitPointWorld,
                      Bump.Vector3.create( -2.000000000000000000000000000000,
                                           -9.999999999971644015772653801832,
                                           -1.555560000000000053788085097040 ),
                      epsilon,
                      'correct hitPointWorld' );
  epsilonNumberCheck( rayCallback.hitNormalWorld,
                      Bump.Vector3.create( 0.000000000000008326724726718211,
                                           1.000000000000000000000000000000,
                                           -0.000000000000048503171533133580 ),
                      epsilon,
                      'correct hitNormalWorld' );
  epsilonNumberCheck( { val: rayCallback.closestHitFraction },
                      { val: 0.969726171835015082756115134544 },
                      epsilon,
                      'correct closestHitFraction' );

  // if( rayCallback.hasHit() ) {
  //   console.log( 'rayCallback has hit!' );

    // var bodyHit = rayCallback.collisionObject;
    // if( bodyHit && bodyHit.hasContactResponse() ) {
    //   result.hitPointInWorld = rayCallback.hitPointWorld;
    //   result.hitNormalInWorld = rayCallback.hitNormalWorld;
    //   result.hitNormalInWorld.normalize();
    //   result.distFraction = rayCallback.closestHitFraction;
    //   return body;
    // }
  // }

});