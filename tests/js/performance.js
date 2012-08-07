/*global Stats:false THREEWrapper:false*/

(function() {
  var stats = new Stats();
  // stats.setMode(1);

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

  var groundBody;
  (function( size ) {
    var groundHalfExtents = Bump.Vector3.create( size, size, size );
    var groundBoxShape = Bump.BoxShape.create( groundHalfExtents );
    var groundShape = Bump.CompoundShape.create();

    collisionShapes.push( groundShape );
    collisionShapes.push( groundBoxShape );

    var sizeAndHalf = 1.5 * size;
    [
      Bump.Vector3.create( 0, -sizeAndHalf, 0 ),
      Bump.Vector3.create( 0,  sizeAndHalf, 0 ),
      Bump.Vector3.create( -sizeAndHalf, 0, 0 ),
      Bump.Vector3.create(  sizeAndHalf, 0, 0 ),
      Bump.Vector3.create( 0, 0, -sizeAndHalf ),
      Bump.Vector3.create( 0, 0,  sizeAndHalf )
    ].forEach(function( position ) {
      var localTransform = Bump.Transform.getIdentity();
      localTransform.setOrigin( position );

      groundShape.addChildShape( localTransform, groundBoxShape );
    });

    var groundTransform = Bump.Transform.getIdentity();

    var myMotionState = Bump.DefaultMotionState.create( groundTransform );
    var rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create( 0, myMotionState, groundShape, Bump.Vector3.create() );
    // var rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create( 0, myMotionState, groundBoxShape, Bump.Vector3.create() );
    groundBody = Bump.RigidBody.create( rbInfo );

    groundBody.setCollisionFlags( groundBody.getCollisionFlags() | Bump.CollisionObject.CollisionFlags.CF_KINEMATIC_OBJECT );
    groundBody.setActivationState( Bump.CollisionObject.DISABLE_DEACTIVATION );

    dynamicsWorld.addRigidBody( groundBody );
  }( 20 ));

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

    body.setFriction( 0.1 );

    dynamicsWorld.addRigidBody( body );
  };

  var renderer = new THREEWrapper();
  renderer.init();

  renderer.addBox({ size: 20, wireframe: true });

  (function() {
    var num = 7;
    var j = 4;
    for ( var i = 0; i < num; ++i ) {
      for ( var k = 0; k < num; ++k ) {
        createCube( i - (num - 1) / 2, j, k - (num - 1) / 2 );

        renderer.addBox({ size: 1 });

      }
    }
  }());

  var groundRot = Bump.Quaternion.createWithEuler( 0, 0, Math.PI * 0.003 );
  var quat = Bump.Quaternion.create();
  var newTransform = Bump.Transform.create();
  var tmpMat = Bump.Matrix3x3.create();

  var rate = Math.PI / 60 / 5;
  var amp  = rate / 2;

  var startSimulation = function() {
    var time = 0;

    var step = function () {
      time += 16;

      stats.begin();
      groundRot.setEuler( 0, 0, rate + amp * Math.sin( time / 500 ) );
      groundBody.getMotionState().getWorldTransform( newTransform );
      newTransform.basis.multiplyMatrix( tmpMat.setRotation( groundRot ), newTransform.basis );
      groundBody.getMotionState().setWorldTransform( newTransform );

      dynamicsWorld.stepSimulation( 0.016 );

      for ( var i = 0; i < dynamicsWorld.getNumCollisionObjects(); ++i ) {
        var colObj = dynamicsWorld.getCollisionObjectArray()[i];
        var body = Bump.RigidBody.upcast( colObj );
        body.getMotionState().getWorldTransform( newTransform );

        var mesh = renderer.meshes[ i ];
        mesh.position.copy( newTransform.origin );
        mesh.quaternion.copy( newTransform.getRotation( quat ) );
      }

      renderer.render();
      stats.end();

      window.requestAnimationFrame( step );
    };

    window.requestAnimationFrame( step );
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
