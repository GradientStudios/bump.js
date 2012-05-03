module( 'VehicleRaycaster.create' );

test( 'basic', function() {
  var vr = Bump.VehicleRaycaster.create();

  ok( vr instanceof Bump.VehicleRaycaster.prototype.constructor );
});

test( 'correctTypes', function() {
  var vr = Bump.VehicleRaycaster.create();

  var checks = [
    [ 'distFraction', 'number' ],
    [ 'hitPointInWorld', Bump.Vector3 ],
    [ 'hitNormalInWorld', Bump.Vector3 ],
    [ 'distFraction', 'number' ]
  ];

  checkTypes( vr, checks );
});
