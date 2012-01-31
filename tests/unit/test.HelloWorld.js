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

  dynamicsWorld.setGravity( Bump.Vector3.create( 0.1, -10, -0.2 ) );

  var groundShape = Bump.BoxShape.create( Bump.Vector3.create( 50, 50, 50 ) );
  ok( groundShape instanceof Bump.BoxShape.prototype.constructor );

  var collisionShapes = [ groundShape ];

  var groundTransform = Bump.Transform.create();
  ok( groundTransform instanceof Bump.Transform.prototype.constructor );
  groundTransform.setIdentity();
  groundTransform.setOrigin( Bump.Vector3.create( 0, -56, 0 ) );

  var mass = 0,
  isDynamic = ( mass !== 0 ),
  localInertia = Bump.Vector3.create();

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

  // create a dynamic rigidbody
  var colShape = new Bump.BoxShape.create( Bump.Vector3.create( 1, 1, 1 ) );
  ok( colShape instanceof Bump.BoxShape.prototype.constructor );
  // var colShape = Bump.SphereShape.create( 1 );
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

  var trans = Bump.Transform.create();
  for( var i = 0; i < 1000; i++ ) {
    // console.log( '\n*** FRAME ' + i + ' ***********************************************\n\n' );

    dynamicsWorld.stepSimulation( 1 / 60, 10 );
    dynamicsWorld.getCollisionObjectArray()[ 1 ].getMotionState().getWorldTransform( trans );

    var epsilon = Math.pow( 2, -12 );
    switch( i ) {
    case 102:
      epsilonNumberCheck(
        trans.origin,
        Bump.Vector3.create(
           2.14877777777777767554,
          -4.87777777777776933021,
          -0.29755555555555540659
        ),
        epsilon,
        'Frame 102'
      );
      break;

    case 103:
      epsilonNumberCheck(
        trans.origin,
        Bump.Vector3.create(
           2.15166666666666639429,
          -5.16666666666665808094,
          -0.30333333333333317716
        ),
        epsilon,
        'Frame 103'
      );
      break;

    case 104:
      epsilonNumberCheck(
        trans.origin,
        Bump.Vector3.create(
           2.15168070891395624145,
          -5.13333995838584389304,
          -0.30336141782791259391
        ),
        epsilon,
        'Frame 104'
      );
      break;

    case 105:
      epsilonNumberCheck(
        trans.origin,
        Bump.Vector3.create(
           2.15172252893902360427,
          -5.10279102788280702896,
          -0.30344505787804759711
        ),
        epsilon,
        'Frame 105'
      );
      break;

    case 106:
      epsilonNumberCheck(
        trans.origin,
        Bump.Vector3.create(
           2.15179212674186892684,
          -5.07501987515754837688,
          -0.30358425348373813124
        ),
        epsilon,
        'Frame 106'
      );
      break;

    }
    // Print positions of all objects
    for( var j = dynamicsWorld.getNumCollisionObjects() - 1; j >= 0; j-- ) {
      var obj = dynamicsWorld.getCollisionObjectArray()[ j ];
      body = Bump.RigidBody.upcast( obj );
      if( body && body.getMotionState() ) {
        body.getMotionState().getWorldTransform( trans );

        var precision = 20;
        // console.log( 'world pos = ' + trans.getOrigin().x.toFixed( precision ) + ' ' +
        //              trans.getOrigin().y.toFixed( precision ) + ' ' +
        //              trans.getOrigin().z.toFixed( precision ) );
      }
    }
  }

  strictEqual( dynamicsWorld.getNumCollisionObjects(), 2 );
  dynamicsWorld.getCollisionObjectArray()[0].getMotionState().getWorldTransform( trans );
  deepEqual( trans.origin, Bump.Vector3.create( 0, -56, 0 ) );

  dynamicsWorld.getCollisionObjectArray()[1].getMotionState().getWorldTransform( trans );
  // result after removing unnecessary type-casting from bullet's HelloWorld:
  epsilonNumberCheck(
    trans.origin,
    Bump.Vector3.create(
       2.15648442570698284371,
      -5.00000057541053610777,
      -0.31261228615625574756
    ),
    Math.pow( 2, -12 )
  );

  ok( true, 'finish' );

});
