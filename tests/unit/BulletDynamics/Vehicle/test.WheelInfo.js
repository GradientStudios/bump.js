module( 'WheelInfoConstructionInfo.create' );

test( 'basic', function() {
  var wici = Bump.WheelInfoConstructionInfo.create();

  ok( wici instanceof Bump.WheelInfoConstructionInfo.prototype.constructor );
});

test( 'correctTypes', function() {
  var wici = Bump.WheelInfoConstructionInfo.create();

  var checks = [
    [ 'chassisConnectionCS', Bump.Vector3 ],
    [ 'wheelDirectionCS', Bump.Vector3 ],
    [ 'wheelAxleCS', Bump.Vector3 ],
    [ 'suspensionRestLength', 'number' ],
    [ 'maxSuspensionTravelCm', 'number' ],
    [ 'wheelRadius', 'number' ],
    [ 'suspensionStiffness', 'number' ],
    [ 'wheelsDampingCompression', 'number' ],
    [ 'wheelsDampingRelaxation', 'number' ],
    [ 'frictionSlip', 'number' ],
    [ 'maxSuspensionForce', 'number' ],
    [ 'bIsFrontWheel', 'boolean' ]
  ];

  checkTypes( wici, checks );
});

module( 'WheelInfo.create' );

test( 'basic', function() {
  var wici = Bump.WheelInfoConstructionInfo.create();
  var wi = Bump.WheelInfo.create( wici );

  ok( wi instanceof Bump.WheelInfo.prototype.constructor );
});

test( 'correctTypes', function() {
  var wici = Bump.WheelInfoConstructionInfo.create();
  var wi = Bump.WheelInfo.create( wici );

  var checks = [
    [ 'suspensionRestLength1', 'number' ],
    [ 'maxSuspensionTravelCm', 'number' ],
    [ 'wheelsRadius', 'number' ],
    [ 'suspensionStiffness', 'number' ],
    [ 'wheelsDampingCompression', 'number' ],
    [ 'wheelsDampingRelaxation', 'number' ],
    [ 'chassisConnectionPointCS', Bump.Vector3 ],
    [ 'wheelDirectionCS', Bump.Vector3 ],
    [ 'wheelAxleCS', Bump.Vector3 ],
    [ 'frictionSlip', 'number' ],
    [ 'steering', 'number' ],
    [ 'engineForce', 'number' ],
    [ 'rotation', 'number' ],
    [ 'deltaRotation', 'number' ],
    [ 'brake', 'number' ],
    [ 'rollInfluence', 'number' ],
    [ 'bIsFrontWheel', 'boolean' ],
    [ 'maxSuspensionForce', 'number' ],
    [ 'raycastInfo', Bump.WheelInfo.RaycastInfo ],
    [ 'worldTransform', Bump.Transform ],
    [ 'clientInfo', null ],
    [ 'clippedInvContactDotSuspension', 'number' ],
    [ 'suspensionRelativeVelocity', 'number' ],
    [ 'wheelsSuspensionForce', 'number' ],
    [ 'skidInfo', 'number' ]
  ];

  checkTypes( wi, checks );
});

module( 'WheelInfo member functions' );

test( 'getSuspensionRestLength', function() {
  var wici = Bump.WheelInfoConstructionInfo.create();
  var wi = Bump.WheelInfo.create( wici );

  ok( wi.getSuspensionRestLength, 'function exists' );
  strictEqual( wi.getSuspensionRestLength(), 0, 'default value correct' );

  wici.suspensionRestLength = 1;
  wi = Bump.WheelInfo.create( wici );

  strictEqual( wi.getSuspensionRestLength(), 1, 'value from WheelInfoConstructionInfo correct' );
});

module( 'WheelInfo.updateWheel' );

test( 'test skipped', function() {
  expect( 0 );
});