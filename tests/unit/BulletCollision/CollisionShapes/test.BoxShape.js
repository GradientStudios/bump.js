module( 'BoxShape' );

test( 'basic', function() {
  var shape = Bump.BoxShape.create( Bump.Vector3.create() );
  strictEqual( shape.getNumPlanes(), 6, 'number of planes' );
  strictEqual( shape.getNumVertices(), 8, 'number of vertices' );
  strictEqual( shape.getNumEdges(), 12, 'number of edges' );
  strictEqual( shape.getName(), 'Box', 'name' );
  strictEqual( shape.getNumPreferredPenetrationDirections(), 6, 'number of preferred penetration directions' );
});

test( 'CollisionShape abstract methods', function() {
  var shape = Bump.BoxShape.create( Bump.Vector3.create() );
  strictEqual( typeof shape.getAabb, 'function', 'implements getAabb' );
  strictEqual( typeof shape.setLocalScaling, 'function', 'implements setLocalScaling' );
  strictEqual( typeof shape.getLocalScaling, 'function', 'implements getLocalScaling' );
  strictEqual( typeof shape.calculateLocalInertia, 'function', 'implements calculateLocalInertia' );
  strictEqual( typeof shape.setMargin, 'function', 'implements setMargin' );
  strictEqual( typeof shape.getMargin, 'function', 'implements getMargin' );
});

test( 'ConvexShape abstract methods', function() {
  var shape = Bump.BoxShape.create( Bump.Vector3.create() );
  strictEqual( typeof shape.localGetSupportingVertex, 'function', 'implements localGetSupportingVertex' );
  strictEqual( typeof shape.localGetSupportingVertexWithoutMargin, 'function', 'implements localGetSupportingVertexWithoutMargin' );
  strictEqual( typeof shape.batchedUnitVectorGetSupportingVertexWithoutMargin, 'function', 'implements batchedUnitVectorGetSupportingVertexWithoutMargin' );
  strictEqual( typeof shape.getAabbSlow, 'function', 'implements getAabbSlow' );
  strictEqual( typeof shape.getNumPreferredPenetrationDirections, 'function', 'implements getNumPreferredPenetrationDirections' );
});

test( 'PolyhedralConvexShape abstract methods', function() {
  var shape = Bump.BoxShape.create( Bump.Vector3.create() );
  strictEqual( typeof shape.getNumVertices, 'function', 'implements getNumVertices' );
  strictEqual( typeof shape.getNumEdges, 'function', 'implements getNumEdges' );
  strictEqual( typeof shape.getEdge, 'function', 'implements getEdge' );
  strictEqual( typeof shape.getVertex, 'function', 'implements getVertex' );
  strictEqual( typeof shape.getNumPlanes, 'function', 'implements getNumPlanes' );
  strictEqual( typeof shape.getPlane, 'function', 'implements getPlane' );
  strictEqual( typeof shape.isInside, 'function', 'implements isInside' );
});

module( 'BoxShape.create' );

test( 'basic', function() {
  var a = Bump.BoxShape.create( Bump.Vector3.create( 1, 1, 1 ) );

  strictEqual( a.shapeType, Bump.BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE, 'shape type' );
  strictEqual( a.userPointer, null, 'user data' );
  deepEqual( a.localScaling, Bump.Vector3.create( 1, 1, 1 ), 'local scaling' );
  deepEqual( a.implicitShapeDimensions, Bump.Vector3.create( 0.96, 0.96, 0.96 ), 'implicit shape dimensions' );
  strictEqual( a.collisionMargin, 0.04, 'margin' );
  strictEqual( a.polyhedron, null, 'polyhedron' );
});

module( 'BoxShape.clone' );

test( 'basic', function() {
  var a = Bump.BoxShape.create( Bump.Vector3.create( 1, 1, 1 ) ),
      b = a.clone();

  deepEqual( a, b );
  notStrictEqual( a, b );

  notStrictEqual( a.localScaling, b.localScaling );
  notStrictEqual( a.implicitShapeDimensions, b.implicitShapeDimensions );
  strictEqual( a.polyhedron, b.polyhedron );
});

module( 'BoxShape.getAabb' );

test( 'basic', function() {
  var shape = Bump.BoxShape.create( Bump.Vector3.create( 1, 1, 1 ) ),
      t0 = Bump.Transform.getIdentity(),
      t1 = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle(
          Bump.Vector3.create( 1, 1, 1 ).normalized(),
          Math.PI / 3
        ),
        Bump.Vector3.create( 1, 2, 3 )
      ),
      aabbMin = Bump.Vector3.create(),
      aabbMax = Bump.Vector3.create();

  testFunc( Bump.BoxShape, 'getAabb', {
    objects: shape,
    epsilon: Math.pow( 2, -48 ),
    args: [
      [
        t0,
        { param: aabbMin, expected: Bump.Vector3.create( -1, -1, -1 ) },
        { param: aabbMax, expected: Bump.Vector3.create(  1,  1,  1 ) }
      ],
      [
        t1,
        { param: aabbMin, expected: Bump.Vector3.create( -2/3,  1/3,  4/3 ) },
        { param: aabbMax, expected: Bump.Vector3.create(  8/3, 11/3, 14/3 ) }
      ]
    ]
  });
});

module( 'BoxShape.getAabbSlow' );

test( 'basic', function() {
  var shape = Bump.BoxShape.create( Bump.Vector3.create( 1, 1, 1 ) ),
      t0 = Bump.Transform.getIdentity(),
      t1 = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle(
          Bump.Vector3.create( 1, 1, 1 ).normalized(),
          Math.PI / 3
        ),
        Bump.Vector3.create( 1, 2, 3 )
      ),
      aabbMin = Bump.Vector3.create(),
      aabbMax = Bump.Vector3.create();

  testFunc( Bump.BoxShape, 'getAabbSlow', {
    objects: shape,
    epsilon: Math.pow( 2, -48 ),
    args: [
      [
        t0,
        { param: aabbMin, expected: Bump.Vector3.create( -1 - 0.04, -1 - 0.04, -1 - 0.04 ) },
        { param: aabbMax, expected: Bump.Vector3.create(  1 + 0.04,  1 + 0.04,  1 + 0.04 ) }
      ],
      [
        t1,
        { param: aabbMin, expected: Bump.Vector3.create( -2/3 - 0.04,  1/3 - 0.04,  4/3 - 0.04 ) },
        { param: aabbMax, expected: Bump.Vector3.create(  8/3 + 0.04, 11/3 + 0.04, 14/3 + 0.04 ) }
      ]
    ]
  });
});

module( 'BoxShape.setLocalScaling' );

test( 'basic', function() {
  var shape = Bump.BoxShape.create( Bump.Vector3.create( 1, 2, 3 ) ),
      scaling = Bump.Vector3.create( 3, 1.5, 1 ),
      expected = shape.clone();

  expected.implicitShapeDimensions = Bump.Vector3.create( 3, 3, 3 )
    .subtract( Bump.Vector3.create( 0.04, 0.04, 0.04 ) );
  expected.localScaling = scaling.clone();

  testFunc( Bump.BoxShape, 'setLocalScaling', {
    modifiesSelf: true,
    objects: shape,
    args: [ [ scaling ] ],
    expected: [ expected ]
  });
});

module( 'BoxShape.getHalfExtentsWithMargin' );

test( 'basic', function() {
  var halfExtents = Bump.Vector3.create( 1, 2, 3 ),
      shape = Bump.BoxShape.create( halfExtents );

  testFunc( Bump.BoxShape, 'getHalfExtentsWithMargin', {
    destType: Bump.Vector3,
    objects: shape,
    expected: [ halfExtents ]
  });
});

module( 'BoxShape.localGetSupportingVertex' );

test( 'basic', function() {
  var normal = Bump.Vector3.create( 0, 0, 1 ),
      shape = Bump.BoxShape.create( Bump.Vector3.create( 3, 1, 2 ) )
        .setLocalScaling( Bump.Vector3.create( 1, 1, 2 ) );

  testFunc( Bump.BoxShape, 'localGetSupportingVertex', {
    destType: Bump.Vector3,
    objects: shape,
    args: [ [ normal ] ],
    expected: [ Bump.Vector3.create( 3, 1, 4 ) ]
  });
});

module( 'BoxShape.localGetSupportingVertexWithoutMargin' );

test( 'basic', function() {
  var normal = Bump.Vector3.create( 0, 0, 1 ),
      shape = Bump.BoxShape.create( Bump.Vector3.create( 3, 1, 2 ) );
  shape.setLocalScaling( Bump.Vector3.create( 1, 1, 2 ) );

  testFunc( Bump.BoxShape, 'localGetSupportingVertexWithoutMargin', {
    destType: Bump.Vector3,
    objects: shape,
    args: [ [ normal ] ],
    expected: [ Bump.Vector3.create( 2.96, 0.96, 3.96 ) ]
  });
});

module( 'BoxShape.calculateLocalInertia' );

test( 'basic', function() {
  var shape = Bump.BoxShape.create( Bump.Vector3.create( 3, 1, 2 ) ),
      mass = 3,
      inertia = Bump.Vector3.create();

  testFunc( Bump.BoxShape, 'calculateLocalInertia', {
    objects: shape,
    args: [
      [ mass, { param: inertia, expected: Bump.Vector3.create( 5, 13, 10 ) } ]
    ],
    expected: [ shape.clone() ]
  });
});

module( 'BoxShape.getVertex' );

test( 'basic', function() {
  var shape = Bump.BoxShape.create( Bump.Vector3.create( 1, 2, 3 ) ),
      vertex = Bump.Vector3.create(),
      expected = [ 0, 1, 2, 3, 4, 5, 6, 7 ].map(function() {
        return shape.clone();
      });

  testFunc( Bump.BoxShape, 'getVertex', {
    objects: shape,
    args: [
      [ 0, { param: vertex, expected: Bump.Vector3.create( 1, 2, 3 ) } ],
      [ 1, { param: vertex, expected: Bump.Vector3.create( -1, 2, 3 ) } ],
      [ 2, { param: vertex, expected: Bump.Vector3.create( 1, -2, 3 ) } ],
      [ 3, { param: vertex, expected: Bump.Vector3.create( -1, -2, 3 ) } ],
      [ 4, { param: vertex, expected: Bump.Vector3.create( 1, 2, -3 ) } ],
      [ 5, { param: vertex, expected: Bump.Vector3.create( -1, 2, -3 ) } ],
      [ 6, { param: vertex, expected: Bump.Vector3.create( 1, -2, -3 ) } ],
      [ 7, { param: vertex, expected: Bump.Vector3.create( -1, -2, -3 ) } ]
    ],
    expected: expected
  });

  shape.setLocalScaling( Bump.Vector3.create( 3, 1.5, 1 ) );

  expected = [ 0, 1, 2, 3, 4, 5, 6, 7 ].map(function() {
    return shape.clone();
  });

  testFunc( Bump.BoxShape, 'getVertex', {
    objects: shape,
    args: [
      [ 0, { param: vertex, expected: Bump.Vector3.create( 3, 3, 3 ) } ],
      [ 1, { param: vertex, expected: Bump.Vector3.create( -3, 3, 3 ) } ],
      [ 2, { param: vertex, expected: Bump.Vector3.create( 3, -3, 3 ) } ],
      [ 3, { param: vertex, expected: Bump.Vector3.create( -3, -3, 3 ) } ],
      [ 4, { param: vertex, expected: Bump.Vector3.create( 3, 3, -3 ) } ],
      [ 5, { param: vertex, expected: Bump.Vector3.create( -3, 3, -3 ) } ],
      [ 6, { param: vertex, expected: Bump.Vector3.create( 3, -3, -3 ) } ],
      [ 7, { param: vertex, expected: Bump.Vector3.create( -3, -3, -3 ) } ]
    ],
    expected: expected
  });
});

module( 'BoxShape.getEdge' );

test( 'test skipped', function() {
  expect( 0 );
});

module( 'BoxShape.getPlane' );

test( 'basic', function() {
  var shape = Bump.BoxShape.create( Bump.Vector3.create( 1, 2, 3 ) ),
      planeNormal = Bump.Vector3.create(),
      planeSupport = Bump.Vector3.create(),
      expected = [ 0, 1, 2, 3, 4, 5 ].map(function() {
        return shape.clone();
      });

  testFunc( Bump.BoxShape, 'getPlane', {
    objects: shape,
    args: [
      [ { param: planeNormal,  expected: Bump.Vector3.create( 1, 0, 0 ) },
        { param: planeSupport, expected: Bump.Vector3.create( -1, 2, 3 ) }, 0 ],
      [ { param: planeNormal,  expected: Bump.Vector3.create( -1, 0, 0 ) },
        { param: planeSupport, expected: Bump.Vector3.create( 1, 2, 3 ) }, 1 ],
      [ { param: planeNormal,  expected: Bump.Vector3.create( 0, 1, 0 ) },
        { param: planeSupport, expected: Bump.Vector3.create( 1, -2, 3 ) }, 2 ],
      [ { param: planeNormal,  expected: Bump.Vector3.create( 0, -1, 0 ) },
        { param: planeSupport, expected: Bump.Vector3.create( 1, 2, 3 ) }, 3 ],
      [ { param: planeNormal,  expected: Bump.Vector3.create( 0, 0, 1 ) },
        { param: planeSupport, expected: Bump.Vector3.create( 1, 2, -3 ) }, 4 ],
      [ { param: planeNormal,  expected: Bump.Vector3.create( 0, 0, -1 ) },
        { param: planeSupport, expected: Bump.Vector3.create( 1, 2, 3 ) }, 5 ]
    ],
    expected: expected
  });
});

module( 'BoxShape.isInside' );

test( 'basic', function() {
  var shape = Bump.BoxShape.create( Bump.Vector3.create( 1, 2, 3 ) ),
      eps = Math.pow( 2, -32 );

  testFunc( Bump.BoxShape, 'isInside', {
    objects: shape,
    args: [
      [ Bump.Vector3.create( 0.96, 1.96, 2.96 ), 0 ],
      [ Bump.Vector3.create( 0.96 + eps, 1.96, 2.96 ), 0 ],
      [ Bump.Vector3.create( 0.96, 1.96 + eps, 2.96 ), 0 ],
      [ Bump.Vector3.create( 0.96, 1.96, 2.96 + eps ), 0 ]
    ],
    expected: [
      true,
      false,
      false,
      false
    ]
  });
});

module( 'BoxShape.getBoundingSphere' );

test( 'basic', function() {
  var shape  = Bump.BoxShape.create( Bump.Vector3.create( 1, 1, 1 ) ),
      center = Bump.Vector3.create(),
      radius = { value: 0 };

  testFunc( Bump.BoxShape, 'getBoundingSphere', {
    objects: shape,
    args: [
      [
        { param: center, expected: Bump.Vector3.create( 0, 0, 0 ) },
        { param: radius, expected: { value: Math.sqrt( 3 ) } }
      ]
    ],
    expected: [ shape.clone() ]
  });
});

module( 'BoxShape.getAngularMotionDisc' );

test( 'basic', function() {
  var shape = Bump.BoxShape.create( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.BoxShape, 'getAngularMotionDisc', {
    objects: shape,
    expected: [ Math.sqrt( 3 ) ]
  });
});

module( 'BoxShape.getContactBreakingThreshold' );

test( 'test skipped', function() {
  expect( 0 );
});

module( 'BoxShape.calculateTemporalAabb' );

test( 'basic', function() {
  var shape = Bump.BoxShape.create( Bump.Vector3.create( 1, 1, 1 ) ),
      curTrans = Bump.Transform.getIdentity(),
      linVel = Bump.Vector3.create( 0, 0, 3 ),
      angVel = Bump.Vector3.create( Math.PI / 6, 0, 0 ),
      timeStep = 1 / 60,
      aabbMin = Bump.Vector3.create(),
      aabbMax = Bump.Vector3.create();

  testFunc( Bump.BoxShape, 'calculateTemporalAabb', {
    objects: shape,
    epsilon: Math.pow( 2, -48 ),
    args: [
      [
        curTrans, linVel, angVel, timeStep,
        { param: aabbMin, expected: Bump.Vector3.create( -1.015114994701952, -1.015114994701952, -1.015114994701952 ) },
        { param: aabbMax, expected: Bump.Vector3.create( 1.015114994701952, 1.015114994701952, 1.065114994701952 ) }
      ]
    ],
    expected: [ shape.clone() ]
  });
});

module( 'BoxShape miscellaneous' );

test( 'isType', function() {
  var shape = Bump.BoxShape.create( Bump.Vector3.create() );

  testFunc( Bump.BoxShape, 'isPolyhedral', { objects: shape, expected: [ true  ] } );
  testFunc( Bump.BoxShape, 'isConvex2d',   { objects: shape, expected: [ false ] } );
  testFunc( Bump.BoxShape, 'isConvex',     { objects: shape, expected: [ true  ] } );
  testFunc( Bump.BoxShape, 'isNonMoving',  { objects: shape, expected: [ false ] } );
  testFunc( Bump.BoxShape, 'isConcave',    { objects: shape, expected: [ false ] } );
  testFunc( Bump.BoxShape, 'isCompound',   { objects: shape, expected: [ false ] } );
  testFunc( Bump.BoxShape, 'isSoftBody',   { objects: shape, expected: [ false ] } );
  testFunc( Bump.BoxShape, 'isInfinite',   { objects: shape, expected: [ false ] } );
});
