module( 'VehicleRaycaster.create' );

test( 'basic', function() {
  var vr = Bump.VehicleRaycaster.create();

  ok( vr instanceof Bump.VehicleRaycaster.prototype.constructor );
});

module( 'VehicleRaycaster.VehicleRaycasterResult.create' );

test( 'basic', function() {
  var vrr = Bump.VehicleRaycaster.VehicleRaycasterResult.create();

  ok( vrr instanceof Bump.VehicleRaycaster.VehicleRaycasterResult.prototype.constructor );
});

test( 'correctTypes', function() {
  var vrr = Bump.VehicleRaycaster.VehicleRaycasterResult.create();

  var checks = [
    [ 'distFraction', 'number' ],
    [ 'hitPointInWorld', Bump.Vector3 ],
    [ 'hitNormalInWorld', Bump.Vector3 ],
    [ 'distFraction', 'number' ]
  ];

  checkTypes( vrr, checks );
});
