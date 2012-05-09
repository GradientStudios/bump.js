module( 'TriangleMesh.create' );

test( 'basic', function() {
  var mesh = Bump.TriangleMesh.create();

  ok( mesh instanceof Bump.TriangleMesh.prototype.constructor, 'create TriangleMesh' );
});

module( 'TriangleMesh.addTriangle' );

test( 'basic', function() {
  var mesh = Bump.TriangleMesh.create();

  mesh.addTriangle(
    Bump.Vector3.create( 0, 0, 0 ),
    Bump.Vector3.create( 0, 0, 0 ),
    Bump.Vector3.create( 0, 0, 0 ),
    true
  );

  equal( mesh.getNumTriangles(), 1, 'correct number of triangles' );
  equal( mesh._4componentVertices.length, 1, 'correct number of vertices (detect duplicates)' );
});
