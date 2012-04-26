module( 'DefaultVehicleRaycaster.create' );

test( 'basic', function() {
  var rv = Bump.DefaultVehicleRaycaster.create();

  ok( rv instanceof Bump.VehicleRaycaster.prototype.constructor );
});

test( 'correctTypes', function() {
  var cc = Bump.DefaultCollisionConfiguration.create();
  var d = Bump.CollisionDispatcher.create( cc );
  var opc = Bump.DbvtBroadphase.create();
  var dw = Bump.DynamicsWorld.create( d, opc, cc );

  var rv = Bump.DefaultVehicleRaycaster.create( dw );

  var checks = [
    [ 'dynamicsWorld', Bump.DynamicsWorld ],
    [ 'distFraction', 'number' ],
    [ 'hitPointInWorld', Bump.Vector3 ],
    [ 'hitNormalInWorld', Bump.Vector3 ],
    [ 'distFraction', 'number' ]
  ];

  checkTypes( rv, checks );
});