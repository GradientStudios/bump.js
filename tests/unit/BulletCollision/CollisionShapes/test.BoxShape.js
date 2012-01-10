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
