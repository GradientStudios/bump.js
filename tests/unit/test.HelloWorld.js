module( 'HelloWorld' );

test( 'basic', function() {
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

  dynamicsWorld.setGravity( Bump.Vector3.create( 0, -10, 0 ) );

  var groundShape = Bump.BoxShape.create( Bump.Vector3.create( 50, 50, 50 ) );
  ok( groundShape instanceof Bump.BoxShape.prototype.constructor );

  var collisionShapes = [ groundShape ];

  var groundTransform = Bump.Transform.create();
  ok( groundTransform instanceof Bump.Transform.prototype.constructor );
  groundTransform.setIdentity();
  groundTransform.setOrigin( Bump.Vector3.create( 0, -56, 0 ) );

  var mass = 0,
  isDynamic = (mass !== 0 ),
  localInertia = Bump.Vector3.create();

  if( isDynamic ) {
    groundShape.calculateLocalInertia( mass, localInertia );
  }

  var myMotionState = Bump.DefaultMotionState.create( groundTransform );
  ok( myMotionState instanceof Bump.DefaultMotionState.prototype.constructor );

  var rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create( mass, myMotionState, groundShape, localInertia );
  ok( rbInfo instanceof Bump.RigidBody.RigidBodyConstructionInfo.prototype.constructor );

  var body = Bump.RigidBody.create( rbInfo );
  ok( body instanceof Bump.RigidBody.prototype.constructor );

  dynamicsWorld.addRigidBody( body );

  // create a dynamic rigidbody

  var colShape = new Bump.BoxShape.create( Bump.Vector3.create( 1, 1, 1 ) );
  ok( colShape instanceof Bump.BoxShape.prototype.constructor );
  // var colShape = new Bump.SphereShape.create( 1 );
  // ok( colShape instanceof Bump.SphereShape.prototype.constructor );

  collisionShapes.push( colShape );

  var startTransform = Bump.Transform.create();
  startTransform.setIdentity();

  mass = 1;
  isDynamic = ( mass !== 0 );
  localInertia = Bump.Vector3.create();

  if( isDynamic ) {
    colShape.calculateLocalInertia( mass, localInertia );
  }

  startTransform.setOrigin( Bump.Vector3.create( 2, 10, 0 ) );

  //using motionstate is recommended, it provides interpolation capabilities, and only synchronizes 'active' objects
  myMotionState = Bump.DefaultMotionState.create( startTransform );
  rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create( mass, myMotionState, colShape, localInertia );
  body = Bump.RigidBody.create( rbInfo );

  dynamicsWorld.addRigidBody(body);

  /// Do some simulation
/*
  for( i = 0; i < 100; i++ ) {
    dynamicsWorld.stepSimulation( 1 / 60, 10 );

    //print positions of all objects
    for( var j = dynamicsWorld.getNumCollisionObjects() - 1; j >= 0; j-- ) {
      var obj = dynamicsWorld.getCollisionObjectArray()[ j ];
      body = Bump.RigidBody.upcast( obj );
      if( body && body.getMotionState() ) {
        var trans = Bump.Transform.create();
        body.getMotionState().getWorldTransform( trans );
        console.log("world pos = " + trans.getOrigin().getX() +
                    trans.getOrigin().getY() + trans.getOrigin().getZ() );
      }
    }
  }
*/
  ok( true, 'finish' );

});
