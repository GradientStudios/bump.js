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

  // create a dynamic rigidbody
  (function() {
    var colShape = Bump.BoxShape.create( Bump.Vector3.create( 1, 1, 1 ) );
    ok( colShape instanceof Bump.BoxShape.prototype.constructor );
    // var colShape = Bump.SphereShape.create( 1 );
    // ok( colShape instanceof Bump.SphereShape.prototype.constructor );

    collisionShapes.push( colShape );

    var startTransform = Bump.Transform.create();
    startTransform.setIdentity();

    mass = 1;
    isDynamic = ( mass !== 0 );
    localInertia = Bump.Vector3.create();

    if ( isDynamic ) {
      colShape.calculateLocalInertia( mass, localInertia );
    }

    startTransform.setOrigin( Bump.Vector3.create( 2, 10, 0 ) );

    // using motionstate is recommended, it provides interpolation capabilities, and only synchronizes 'active' objects
    myMotionState = Bump.DefaultMotionState.create( startTransform );
    rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create( mass, myMotionState, colShape, localInertia );
    body = Bump.RigidBody.create( rbInfo );

    dynamicsWorld.addRigidBody(body);
  })();

  // create a dynamic rigidbody
  (function() {
    var colShape = Bump.CompoundShape.create();
    ok( colShape instanceof Bump.CompoundShape.prototype.constructor );

    collisionShapes.push( colShape );

    var aShape = Bump.BoxShape.create( Bump.Vector3.create( 0.5, 0.5, 0.5 ) );
    var bShape = Bump.BoxShape.create( Bump.Vector3.create( 0.5, 0.5, 0.5 ) );
    collisionShapes.push( aShape );
    collisionShapes.push( bShape );

    var a = Bump.Transform.getIdentity();
    var b = Bump.Transform.getIdentity();
    a.setOrigin( Bump.Vector3.create( 0, 0, 0 ) );
    b.setOrigin( Bump.Vector3.create( 0.75, 0.25, -0.5 ) );
    colShape.addChildShape( a, aShape );
    colShape.addChildShape( b, bShape );

    var startTransform = Bump.Transform.create();
    startTransform.setIdentity();

    mass = 1;
    isDynamic = ( mass !== 0 );
    localInertia = Bump.Vector3.create();

    if ( isDynamic ) {
      colShape.calculateLocalInertia( mass, localInertia );
    }

    startTransform.setOrigin( Bump.Vector3.create( -3, 10, 0 ) );

    // using motionstate is recommended, it provides interpolation capabilities, and only synchronizes 'active' objects
    myMotionState = Bump.DefaultMotionState.create( startTransform );
    rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create( mass, myMotionState, colShape, localInertia );
    body = Bump.RigidBody.create( rbInfo );

    dynamicsWorld.addRigidBody(body);
  })();

  /// Do some simulation
  var trans = Bump.Transform.create();
  for( var i = 0; i < 1000; i++ ) {

    // Step simulation
    dynamicsWorld.stepSimulation( 1 / 60, 10 );

    // Get BoxShape transform
    dynamicsWorld.getCollisionObjectArray()[ 1 ].getMotionState().getWorldTransform( trans );

    var epsilon = Math.pow( 2, -12 );
    var shapeName = 'BoxShape';
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
        shapeName + ': Frame ' + i
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
        shapeName + ': Frame ' + i
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
        shapeName + ': Frame ' + i
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
        shapeName + ': Frame ' + i
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
        shapeName + ': Frame ' + i
      );
      break;

    }

    // Get CompoundShape transform
    dynamicsWorld.getCollisionObjectArray()[ 2 ].getMotionState().getWorldTransform( trans );

    shapeName = 'CompoundShape';
    switch ( i ) {
    case 102:
      epsilonNumberCheck( trans.origin, Bump.Vector3.create( -2.8512222222, -4.8777777778, -0.2975555556 ), epsilon, shapeName + ': Frame ' + i );
      epsilonNumberCheck( trans.basis, Bump.Matrix3x3.create(  1.0000000000,  0.0000000000,  0.0000000000,  0.0000000000,  1.0000000000,  0.0000000000,  0.0000000000,  0.0000000000,  1.0000000000 ), epsilon, shapeName + ': Frame ' + i );
      break;

    case 103:
      epsilonNumberCheck( trans.origin, Bump.Vector3.create( -2.8483333333, -5.1666666667, -0.3033333333 ), epsilon, shapeName + ': Frame ' + i );
      epsilonNumberCheck( trans.basis, Bump.Matrix3x3.create(  1.0000000000,  0.0000000000,  0.0000000000,  0.0000000000,  1.0000000000,  0.0000000000,  0.0000000000,  0.0000000000,  1.0000000000 ), epsilon, shapeName + ': Frame ' + i );
      break;

    case 104:
      epsilonNumberCheck( trans.origin, Bump.Vector3.create( -2.8454166667, -5.4583333333, -0.3091666667 ), epsilon, shapeName + ': Frame ' + i );
      epsilonNumberCheck( trans.basis, Bump.Matrix3x3.create(  1.0000000000,  0.0000000000,  0.0000000000,  0.0000000000,  1.0000000000,  0.0000000000,  0.0000000000,  0.0000000000,  1.0000000000 ), epsilon, shapeName + ': Frame ' + i );
      break;

    case 105:
      epsilonNumberCheck( trans.origin, Bump.Vector3.create( -2.8424722222, -5.7527777778, -0.3150555556 ), epsilon, shapeName + ': Frame ' + i );
      epsilonNumberCheck( trans.basis, Bump.Matrix3x3.create(  1.0000000000,  0.0000000000,  0.0000000000,  0.0000000000,  1.0000000000,  0.0000000000,  0.0000000000,  0.0000000000,  1.0000000000 ), epsilon, shapeName + ': Frame ' + i );
      break;

    case 106:
      epsilonNumberCheck( trans.origin, Bump.Vector3.create( -2.8424690823, -5.7022221662, -0.3150618355 ), epsilon, shapeName + ': Frame ' + i );
      epsilonNumberCheck( trans.basis, Bump.Matrix3x3.create(  0.9999999999,  0.0000020797,  0.0000098834, -0.0000020798,  1.0000000000,  0.0000097183, -0.0000098834, -0.0000097183,  0.9999999999 ), epsilon, shapeName + ': Frame ' + i );
      break;

    case 107:
      epsilonNumberCheck( trans.origin, Bump.Vector3.create( -2.8424381645, -5.6544443324, -0.3151236710 ), epsilon, shapeName + ': Frame ' + i );
      epsilonNumberCheck( trans.basis, Bump.Matrix3x3.create(  0.9999999998,  0.0000041593,  0.0000197668, -0.0000041597,  0.9999999998,  0.0000194365, -0.0000197667, -0.0000194366,  0.9999999996 ), epsilon, shapeName + ': Frame ' + i );
      break;

    case 108:
      epsilonNumberCheck( trans.origin, Bump.Vector3.create( -2.8423794690, -5.6094442764, -0.3152410620 ), epsilon, shapeName + ': Frame ' + i );
      epsilonNumberCheck( trans.basis, Bump.Matrix3x3.create(  0.9999999995,  0.0000062388,  0.0000296502, -0.0000062397,  0.9999999996,  0.0000291547, -0.0000296500, -0.0000291549,  0.9999999991 ), epsilon, shapeName + ': Frame ' + i );
      break;

    case 109:
      epsilonNumberCheck( trans.origin, Bump.Vector3.create( -2.8422929957, -5.5672219982, -0.3154140086 ), epsilon, shapeName + ': Frame ' + i );
      epsilonNumberCheck( trans.basis, Bump.Matrix3x3.create(  0.9999999992,  0.0000083182,  0.0000395336, -0.0000083197,  0.9999999992,  0.0000388729, -0.0000395333, -0.0000388732,  0.9999999985 ), epsilon, shapeName + ': Frame ' + i );
      break;

    case 110:
      epsilonNumberCheck( trans.origin, Bump.Vector3.create( -2.8421787446, -5.5277774977, -0.3156425107 ), epsilon, shapeName + ': Frame ' + i );
      epsilonNumberCheck( trans.basis, Bump.Matrix3x3.create(  0.9999999987,  0.0000103975,  0.0000494171, -0.0000103999,  0.9999999988,  0.0000485911, -0.0000494166, -0.0000485916,  0.9999999976 ), epsilon, shapeName + ': Frame ' + i );
      break;

    case 111:
      epsilonNumberCheck( trans.origin, Bump.Vector3.create( -2.8420367158, -5.4911107751, -0.3159265684 ), epsilon, shapeName + ': Frame ' + i );
      epsilonNumberCheck( trans.basis, Bump.Matrix3x3.create(  0.9999999982,  0.0000124767,  0.0000593005, -0.0000124802,  0.9999999982,  0.0000583092, -0.0000592998, -0.0000583100,  0.9999999965 ), epsilon, shapeName + ': Frame ' + i );
      break;

    case 112:
      epsilonNumberCheck( trans.origin, Bump.Vector3.create( -2.8418669091, -5.4572218302, -0.3162661817 ), epsilon, shapeName + ': Frame ' + i );
      epsilonNumberCheck( trans.basis, Bump.Matrix3x3.create(  0.9999999975,  0.0000145558,  0.0000691840, -0.0000145605,  0.9999999976,  0.0000680274, -0.0000691830, -0.0000680284,  0.9999999953 ), epsilon, shapeName + ': Frame ' + i );
      break;

    case 113:
      epsilonNumberCheck( trans.origin, Bump.Vector3.create( -2.8416693247, -5.4261106631, -0.3166613505 ), epsilon, shapeName + ': Frame ' + i );
      epsilonNumberCheck( trans.basis, Bump.Matrix3x3.create(  0.9999999967,  0.0000166348,  0.0000790675, -0.0000166410,  0.9999999968,  0.0000777455, -0.0000790662, -0.0000777468,  0.9999999939 ), epsilon, shapeName + ': Frame ' + i );
      break;

    case 114:
      epsilonNumberCheck( trans.origin, Bump.Vector3.create( -2.8414439626, -5.3977772737, -0.3171120749 ), epsilon, shapeName + ': Frame ' + i );
      epsilonNumberCheck( trans.basis, Bump.Matrix3x3.create(  0.9999999959,  0.0000187138,  0.0000889511, -0.0000187215,  0.9999999960,  0.0000874636, -0.0000889494, -0.0000874652,  0.9999999922 ), epsilon, shapeName + ': Frame ' + i );
      break;

    case 115:
      epsilonNumberCheck( trans.origin, Bump.Vector3.create( -2.8411908226, -5.3722216622, -0.3176183548 ), epsilon, shapeName + ': Frame ' + i );
      epsilonNumberCheck( trans.basis, Bump.Matrix3x3.create(  0.9999999949,  0.0000207926,  0.0000988346, -0.0000208022,  0.9999999951,  0.0000971816, -0.0000988326, -0.0000971837,  0.9999999904 ), epsilon, shapeName + ': Frame ' + i );
      break;

    case 116:
      epsilonNumberCheck( trans.origin, Bump.Vector3.create( -2.8409099048, -5.3494438284, -0.3181801903 ), epsilon, shapeName + ': Frame ' + i );
      epsilonNumberCheck( trans.basis, Bump.Matrix3x3.create(  0.9999999938,  0.0000228713,  0.0001087182, -0.0000228829,  0.9999999940,  0.0001068997, -0.0001087158, -0.0001069022,  0.9999999884 ), epsilon, shapeName + ': Frame ' + i );
      break;

    case 117:
      epsilonNumberCheck( trans.origin, Bump.Vector3.create( -2.8406012093, -5.3294437724, -0.3187975813 ), epsilon, shapeName + ': Frame ' + i );
      epsilonNumberCheck( trans.basis, Bump.Matrix3x3.create(  0.9999999927,  0.0000249500,  0.0001186018, -0.0000249638,  0.9999999929,  0.0001166177, -0.0001185989, -0.0001166207,  0.9999999862 ), epsilon, shapeName + ': Frame ' + i );
      break;

    case 118:
      epsilonNumberCheck( trans.origin, Bump.Vector3.create( -2.8402647360, -5.3122214941, -0.3194705279 ), epsilon, shapeName + ': Frame ' + i );
      epsilonNumberCheck( trans.basis, Bump.Matrix3x3.create(  0.9999999914,  0.0000270285,  0.0001284854, -0.0000270447,  0.9999999917,  0.0001263357, -0.0001284820, -0.0001263392,  0.9999999838 ), epsilon, shapeName + ': Frame ' + i );
      break;

    case 119:
      epsilonNumberCheck( trans.origin, Bump.Vector3.create( -2.8399004850, -5.2977769937, -0.3201990301 ), epsilon, shapeName + ': Frame ' + i );
      epsilonNumberCheck( trans.basis, Bump.Matrix3x3.create(  0.9999999900,  0.0000291069,  0.0001383690, -0.0000291258,  0.9999999903,  0.0001360537, -0.0001383651, -0.0001360577,  0.9999999812 ), epsilon, shapeName + ': Frame ' + i );
      break;

    case 120:
      epsilonNumberCheck( trans.origin, Bump.Vector3.create( -2.8395084561, -5.2861102710, -0.3209830878 ), epsilon, shapeName + ': Frame ' + i );
      epsilonNumberCheck( trans.basis, Bump.Matrix3x3.create(  0.9999999885,  0.0000311853,  0.0001482527, -0.0000312069,  0.9999999889,  0.0001457717, -0.0001482481, -0.0001457763,  0.9999999784 ), epsilon, shapeName + ': Frame ' + i );
      break;
    }

    // // Print positions of all objects
    // for( var j = dynamicsWorld.getNumCollisionObjects() - 1; j >= 0; j-- ) {
    //   var obj = dynamicsWorld.getCollisionObjectArray()[ j ];
    //   body = Bump.RigidBody.upcast( obj );
    //   if( body && body.getMotionState() ) {
    //     body.getMotionState().getWorldTransform( trans );

    //     var precision = 20;
    //     console.log( 'world pos = ' + trans.getOrigin().x.toFixed( precision ) + ' ' +
    //                  trans.getOrigin().y.toFixed( precision ) + ' ' +
    //                  trans.getOrigin().z.toFixed( precision ) );
    //   }
    // }

  }

  strictEqual( dynamicsWorld.getNumCollisionObjects(), 3 );
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
