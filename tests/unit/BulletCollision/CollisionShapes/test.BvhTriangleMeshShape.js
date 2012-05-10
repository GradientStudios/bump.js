module( 'BvhTriangleMeshShape.create' );

test( 'basic', function() {
  var mesh = Bump.TriangleMesh.create();

  mesh.addTriangle(
    Bump.Vector3.create( 0, 0, 0 ),
    Bump.Vector3.create( 1, 1, 0 ),
    Bump.Vector3.create( 0, 1, 1 ),
    true
  );

  var shape = Bump.BvhTriangleMeshShape.create( mesh, true );

  ok( shape instanceof Bump.BvhTriangleMeshShape.prototype.constructor, 'correct type' );

  equal( mesh._4componentVertices.length, 3 );
  deepEqual( mesh._4componentVertices.at(0), Bump.Vector3.create( 0, 0, 0 ) );
  deepEqual( mesh._4componentVertices.at(1), Bump.Vector3.create( 1, 1, 0 ) );
  deepEqual( mesh._4componentVertices.at(2), Bump.Vector3.create( 0, 1, 1 ) );

  equal( mesh._32bitIndices.length, 3 );
  equal( mesh._32bitIndices.at(0), 0 );
  equal( mesh._32bitIndices.at(1), 1 );
  equal( mesh._32bitIndices.at(2), 2 );

  equal( mesh.indexedMeshes[0].numTriangles, 1, 'triangles in IndexedMesh' );
  equal( mesh.indexedMeshes[0].triangleIndexBase.buffer, mesh._32bitIndices.data );
  equal( mesh.indexedMeshes[0].numVertices, 3, 'vertices in IndexedMesh' );
  equal( mesh.indexedMeshes[0].vertexBase.buffer, mesh._4componentVertices.data );

  equal( shape.shapeType, 21, 'shape type' );
  equal( shape.collisionMargin, 0, 'collision margin' );
  deepEqual( shape.localAabbMin, Bump.Vector3.create( 0, 0, 0 ) );
  deepEqual( shape.localAabbMax, Bump.Vector3.create( 1, 1, 1 ) );

  var bvh = shape.bvh;
  deepEqual( bvh.bvhQuantization, Bump.Vector3.create( 21844.333333333332112, 21844.333333333332121, 21844.333333333332121 ), 'bvh quantization' );
  deepEqual( bvh.bvhAabbMin, Bump.Vector3.create( -1, -1, -1 ), 'bvh aabb min' );
  deepEqual( bvh.bvhAabbMax, Bump.Vector3.create(  2,  2,  2 ), 'bvh aabb max' );
  equal( bvh.subtreeHeaderCount, 1 );
  equal( bvh.quantizedContiguousNodes.length, 2, 'number of quantized contiguous node' );
  equal( bvh.quantizedLeafNodes.length, 0, 'number of quantized leaf node' );

  var node;
  node = bvh.quantizedContiguousNodes.at(0);
  equal( node.quantizedAabbMin[0], 21844 );
  equal( node.quantizedAabbMin[1], 21844 );
  equal( node.quantizedAabbMin[2], 21844 );
  equal( node.quantizedAabbMax[0], 43689 );
  equal( node.quantizedAabbMax[1], 43689 );
  equal( node.quantizedAabbMax[2], 43689 );
  equal( node.escapeIndexOrTriangleIndex[0], 0 );

  node = bvh.quantizedContiguousNodes.at(1);
  equal( node.quantizedAabbMin[0], 0 );
  equal( node.quantizedAabbMin[1], 0 );
  equal( node.quantizedAabbMin[2], 0 );
  equal( node.quantizedAabbMax[0], 0 );
  equal( node.quantizedAabbMax[1], 0 );
  equal( node.quantizedAabbMax[2], 0 );
  equal( node.escapeIndexOrTriangleIndex[0], 0 );

  equal( bvh.SubtreeHeaders.length, 1, 'number of subtree headers' );
  node = bvh.SubtreeHeaders.at(0);
  equal( node.quantizedAabbMin[0], 21844 );
  equal( node.quantizedAabbMin[1], 21844 );
  equal( node.quantizedAabbMin[2], 21844 );
  equal( node.quantizedAabbMax[0], 43689 );
  equal( node.quantizedAabbMax[1], 43689 );
  equal( node.quantizedAabbMax[2], 43689 );
  equal( node.rootNodeIndex[0], 0 );
  equal( node.subtreeSize[0], 1 );

});
