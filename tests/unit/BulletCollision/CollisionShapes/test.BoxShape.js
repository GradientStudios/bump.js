module( 'Bump.BoxShape' );

test( 'scratch', function() {
  var shape = Bump.ConvexPolyhedron.create();
  shape.initialize();
  shape.project( Bump.Transform.create, Bump.Vector3.create(), {} );
});
