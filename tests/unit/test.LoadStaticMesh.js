module( 'LoadStaticMesh' );

test( 'basic load OBJ', function() {
  var collisionConfiguration = Bump.DefaultCollisionConfiguration.create();
  var dispatcher = Bump.CollisionDispatcher.create( collisionConfiguration );
  var overlappingPairCache = Bump.DbvtBroadphase.create();
  var solver = Bump.SequentialImpulseConstraintSolver.create();
  var dynamicsWorld = Bump.DiscreteDynamicsWorld.create( dispatcher, overlappingPairCache, solver, collisionConfiguration );
  dynamicsWorld.setGravity( Bump.Vector3.create( 0, -9.8, 0 ) );

  var mesh = Bump.TriangleMesh.create();
  ok( mesh instanceof Bump.TriangleMesh.prototype.constructor );

  mesh.addTriangle(
    Bump.Vector3.create( 0, 0, 0 ),
    Bump.Vector3.create( 1, 1, 0 ),
    Bump.Vector3.create( 0, 1, 1 ),
    true
  );

  var shape = Bump.BvhTriangleMeshShape.create( mesh, true );
  ok( shape instanceof Bump.BvhTriangleMeshShape.prototype.constructor );

  var terrain = Bump.ScaledBvhTriangleMeshShape.create(
    shape,
    Bump.Vector3.create( 1, 1, 1 )
  );
  ok( terrain instanceof Bump.ScaledBvhTriangleMeshShape.prototype.constructor );

  var collisionShapes = [ terrain ];

  (function() {
    var intertia = Bump.Vector3.create( 0, 0, 0 );
    var startTransform = Bump.Transform.getIdentity();
    var myMotionState = Bump.DefaultMotionState.create( startTransform );
    var rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create( 0, myMotionState, terrain, intertia );
    var body = Bump.RigidBody.create( rbInfo );
    dynamicsWorld.addRigidBody( body );
  })();

});
