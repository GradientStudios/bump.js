module( 'LoadStaticMesh' );

test( 'basic load OBJ', function() {
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

  var scaledShape = Bump.ScaledBvhTriangleMeshShape.create(
    shape,
    Bump.Vector3.create( 1, 1, 1 )
  );
  ok( scaledShape instanceof Bump.ScaledBvhTriangleMeshShape.prototype.constructor );

});
