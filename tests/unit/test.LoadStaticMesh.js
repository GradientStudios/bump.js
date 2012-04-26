module( 'LoadStaticMesh' );

test( 'basic load OBJ', function() {
  var mesh = Bump.TriangleMesh.create();

  ok( mesh instanceof Bump.TriangleMesh.prototype.constructor, 'create TriangleMesh' );

  mesh.addTriangle(
    Bump.Vector3.create( 0, 0, 0 ),
    Bump.Vector3.create( 0, 0, 0 ),
    Bump.Vector3.create( 0, 0, 0 ),
    true
  );

  equal( mesh.getNumTriangles(), 1, 'correct number of triangles' );
});
