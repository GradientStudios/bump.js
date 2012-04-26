module( 'BvhTriangleMeshShape.create' );

test( 'basic', function() {
  var mesh = Bump.TriangleMesh.create();

  mesh.addTriangle(
    Bump.Vector3.create( 0, 0, 0 ),
    Bump.Vector3.create( 0, 0, 0 ),
    Bump.Vector3.create( 0, 0, 0 ),
    true
  );

  var shape = Bump.BvhTriangleMeshShape.create( mesh, true );

  ok( shape instanceof Bump.BvhTriangleMeshShape.prototype.constructor, 'correct type' );

});
