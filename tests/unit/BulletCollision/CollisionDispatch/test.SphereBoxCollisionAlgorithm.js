module( 'SphereBoxCollisionAlgorithm.getSphereDistance' );

function truncate( v, precision ) {
  v.x = Math.ceil( v.x * precision ) / precision;
  v.y = Math.ceil( v.y * precision ) / precision;
  v.z = Math.ceil( v.z * precision ) / precision;
  return v;
}

test( 'sphere-box X axis', function() {

  expect( 16 );

  var manifold = Bump.PersistentManifold.create();
  var caci = Bump.CollisionAlgorithmConstructionInfo.create();

  var sphereShape = Bump.SphereShape.create( 0.5 );
  var boxShape = Bump.BoxShape.create( Bump.Vector3.create( 0.5, 0.5, 0.5 ) );

  var localInertia = Bump.Vector3.create();
  sphereShape.calculateLocalInertia( 1, localInertia );

  var startTransform = Bump.Transform.create();
  startTransform.setIdentity();
  startTransform.setOrigin( Bump.Vector3.create( 0, 0, 0 ) );

  var myMotionState = Bump.DefaultMotionState.create( startTransform );
  var rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create(
    1, myMotionState, sphereShape, localInertia );

  var sphereBody = Bump.RigidBody.create( rbInfo );

  startTransform = Bump.Transform.create();
  startTransform.setIdentity();
  startTransform.setOrigin( Bump.Vector3.create( 0.9, 0, 0 ) );

  myMotionState = Bump.DefaultMotionState.create( startTransform );
  rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create(
    1, myMotionState, boxShape, localInertia );

  var boxBody = Bump.RigidBody.create( rbInfo );

  var sbca = Bump.SphereBoxCollisionAlgorithm.create(
    manifold, caci, sphereBody, boxBody );

  ok( sbca, 'SphereBoxCollisionAlgorithm created.' );

  var normal = Bump.Vector3.create(),
      pOnBox = Bump.Vector3.create(),
      pOnSphere = Bump.Vector3.create(),
      sphereCenter = Bump.Vector3.create( 0, 0, 0 ),
      penetrationDepthRef = { value: 0 },
      dist;

  dist = sbca.getSphereDistance(
    boxBody, pOnBox, normal, penetrationDepthRef, sphereCenter, sphereShape.getRadius(), 10 );

  ok( dist, 'sphereDistance returns true.' );
  deepEqual( sphereCenter, Bump.Vector3.create( 0, 0, 0 ), 'sphereCenter unchanged.' );
  deepEqual( boxShape.getHalfExtentsWithMargin(), Bump.Vector3.create( 0.5, 0.5, 0.5 ) );
  deepEqual( boxBody.getWorldTransform().getOrigin(), Bump.Vector3.create( 0.9, 0, 0 ) );
  // deepEqual( pOnSphere, Bump.Vector3.create( 0.5, 0, 0 ), 'point on sphere is correct.' );
  deepEqual( normal, Bump.Vector3.create( -1, 0, 0 ) );
  equal( Math.ceil( penetrationDepthRef.value * 1000 ) / 1000, -0.1 );
  deepEqual( pOnBox, Bump.Vector3.create( 0.9 - boxShape.getHalfExtentsWithMargin().x, 0, 0 ), 'point on box is correct.' );

  boxBody.getWorldTransform().setOrigin( Bump.Vector3.create( 0.1, 0, 0 ) );
  dist = sbca.getSphereDistance(
    boxBody, pOnBox, normal, penetrationDepthRef, sphereCenter, sphereShape.getRadius(), 10 );

  ok( dist, 'sphereDistance returns true' );
  deepEqual( normal, Bump.Vector3.create( -1, 0, 0 ) );
  equal( Math.ceil( penetrationDepthRef.value * 1000 ) / 1000, -0.9 );
  deepEqual(
    truncate( pOnBox, 1000 ),
    Bump.Vector3.create(
      0.1 -
        boxShape.getHalfExtentsWithMargin().x,
      0,
      0 ),
    'point on box is correct.' );

  boxBody.getWorldTransform().setOrigin( Bump.Vector3.create( -0.1, 0, 0 ) );
  dist = sbca.getSphereDistance(
    boxBody, pOnBox, normal, penetrationDepthRef, sphereCenter, sphereShape.getRadius(), 10 );

  ok( dist, 'sphereDistance returns true' );
  deepEqual( normal, Bump.Vector3.create( 1, 0, 0 ) );
  equal( Math.ceil( penetrationDepthRef.value * 1000 ) / 1000, -0.9 );
  deepEqual(
    truncate( pOnBox, 1000 ),
    Bump.Vector3.create(
      -0.1 +
        boxShape.getHalfExtentsWithMargin().x,
      0,
      0 ),
    'point on box is correct.' );

});


test( 'sphere-box Y axis', function() {

  expect( 16 );

  var manifold = Bump.PersistentManifold.create();
  var caci = Bump.CollisionAlgorithmConstructionInfo.create();

  var sphereShape = Bump.SphereShape.create( 0.5 );
  var boxShape = Bump.BoxShape.create( Bump.Vector3.create( 20, 20, 20 ) );

  var localInertia = Bump.Vector3.create();
  sphereShape.calculateLocalInertia( 1, localInertia );

  var startTransform = Bump.Transform.create();
  startTransform.setIdentity();
  startTransform.setOrigin( Bump.Vector3.create( 0, 0, 0 ) );

  var myMotionState = Bump.DefaultMotionState.create( startTransform );
  var rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create(
    1, myMotionState, sphereShape, localInertia );

  var sphereBody = Bump.RigidBody.create( rbInfo );

  startTransform = Bump.Transform.create();
  startTransform.setIdentity();
  startTransform.setOrigin( Bump.Vector3.create( 0, 0.9, 0 ) );

  myMotionState = Bump.DefaultMotionState.create( startTransform );
  rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create(
    1, myMotionState, boxShape, localInertia );

  var boxBody = Bump.RigidBody.create( rbInfo );

  var sbca = Bump.SphereBoxCollisionAlgorithm.create(
    manifold, caci, sphereBody, boxBody );

  ok( sbca, 'SphereBoxCollisionAlgorithm created.' );

  var normal = Bump.Vector3.create(),
      pOnBox = Bump.Vector3.create(),
      pOnSphere = Bump.Vector3.create(),
      sphereCenter = Bump.Vector3.create( 0, 0, 0 ),
      penetrationDepthRef = { value: 0 },
      dist;

  dist = sbca.getSphereDistance(
    boxBody, pOnBox, normal, penetrationDepthRef, sphereCenter, sphereShape.getRadius(), 10 );

  ok( dist, 'sphereDistance returns true.' );
  deepEqual( sphereCenter, Bump.Vector3.create( 0, 0, 0 ), 'sphereCenter unchanged.' );
  deepEqual( boxShape.getHalfExtentsWithMargin(), Bump.Vector3.create( 20, 20, 20 ) );
  deepEqual( boxBody.getWorldTransform().getOrigin(), Bump.Vector3.create( 0, 0.9, 0 ) );
  // deepEqual( pOnSphere, Bump.Vector3.create( 0.5, 0, 0 ), 'point on sphere is correct.' );
  deepEqual( normal, Bump.Vector3.create( 0, -1, 0 ) );
  equal( Math.ceil( penetrationDepthRef.value * 1000 ) / 1000, -0.6 );
  deepEqual( pOnBox, Bump.Vector3.create( 0, 0.9 - boxShape.getHalfExtentsWithMargin().y, 0 ), 'point on box is correct.' );

  boxBody.getWorldTransform().setOrigin( Bump.Vector3.create( 0, 0.1, 0 ) );
  dist = sbca.getSphereDistance(
    boxBody, pOnBox, normal, penetrationDepthRef, sphereCenter, sphereShape.getRadius(), 10 );

  ok( dist, 'sphereDistance returns true' );
  deepEqual( normal, Bump.Vector3.create( 0, -1, 0 ) );
  equal( Math.ceil( penetrationDepthRef.value * 1000 ) / 1000, -1.4 );
  deepEqual(
    truncate( pOnBox, 1000 ),
    Bump.Vector3.create(
      0,
      0.1 -
        boxShape.getHalfExtentsWithMargin().y,
      0 ),
    'point on box is correct.' );

  boxBody.getWorldTransform().setOrigin( Bump.Vector3.create( 0, -0.1, 0 ) );
  dist = sbca.getSphereDistance(
    boxBody, pOnBox, normal, penetrationDepthRef, sphereCenter, sphereShape.getRadius(), 10 );

  ok( dist, 'sphereDistance returns true' );
  deepEqual( normal, Bump.Vector3.create( 0, 1, 0 ) );
  equal( Math.ceil( penetrationDepthRef.value * 1000 ) / 1000, -1.4 );
  deepEqual(
    truncate( pOnBox, 1000 ),
    Bump.Vector3.create(
      0,
      -0.1 +
        boxShape.getHalfExtentsWithMargin().y,
      0 ),
    'point on box is correct.' );

});
