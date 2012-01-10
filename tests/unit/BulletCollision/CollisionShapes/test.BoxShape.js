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
