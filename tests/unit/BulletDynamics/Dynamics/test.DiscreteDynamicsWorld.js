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
  ok( rayCallback.hasHit(), 'has hit' );

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