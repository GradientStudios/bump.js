(function() {
  var stats = new Stats();

  // Align top-left
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';

  document.body.appendChild( stats.domElement );

  var collisionConfiguration = Bump.DefaultCollisionConfiguration.create();
  var dispatcher = Bump.CollisionDispatcher.create( collisionConfiguration );
  var overlappingPairCache = Bump.DbvtBroadphase.create();
  var solver = Bump.SequentialImpulseConstraintSolver.create();
  var dynamicsWorld = Bump.DiscreteDynamicsWorld.create( dispatcher, overlappingPairCache, solver, collisionConfiguration );
  dynamicsWorld.setGravity( Bump.Vector3.create( 0, -9.8, 0 ) );

  var collisionShapes = [];

  (function() {
    var groundHalfExtents = Bump.Vector3.create( 500, 500, 500 );
    var groundShape = Bump.BoxShape.create( groundHalfExtents );
    collisionShapes.push( groundShape );

    var groundTransform = Bump.Transform.create();
    groundTransform.setIdentity();
    groundTransform.setOrigin( Bump.Vector3.create( 0, -500, 0 ) );

    var myMotionState = Bump.DefaultMotionState.create( groundTransform );
    var rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create( 0, myMotionState, groundShape, Bump.Vector3.create() );
    var body = Bump.RigidBody.create( rbInfo );

    dynamicsWorld.addRigidBody( body );
  }());

  var boxCubeShape = Bump.BoxShape.create( Bump.Vector3.create( 0.5, 0.5, 0.5 ) );
  collisionShapes.push( boxCubeShape );

  var createCube = function( i, j, k, startRotation ) {
    if ( !startRotation ) {
      startRotation = Bump.Quaternion.getIdentity();
    }

    var localInertia = Bump.Vector3.create();
    boxCubeShape.calculateLocalInertia( 1, localInertia );

    var startTransform = Bump.Transform.create();
    startTransform.setIdentity();
    startTransform.setRotation( startRotation );
    startTransform.setOrigin( Bump.Vector3.create( i, j, k ) );

    var myMotionState = Bump.DefaultMotionState.create( startTransform );
    var rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create( 1, myMotionState, boxCubeShape, localInertia );
    var body = Bump.RigidBody.create( rbInfo );

    dynamicsWorld.addRigidBody( body );
  };

  (function() {
    var j = 4;
    for ( var i = -2; i < 3; ++i ) {
      for ( var k = -2; k < 3; ++k ) {
        createCube( i, j, k );
      }
    }
  }());

  var startSimulation = function() {
    setInterval(function () {
      stats.begin();

      dynamicsWorld.stepSimulation( 1 / 60, 10 );

      stats.end();
    }, 1000 / 60 );
  };

  var keylistener = function( evt ) {
    // Enter key
    if ( evt.keyCode === 13 ) {
      document.body.removeEventListener( 'keyup', keylistener );

      startSimulation();
    }
  };

  document.body.addEventListener( 'keyup', keylistener );

}());
