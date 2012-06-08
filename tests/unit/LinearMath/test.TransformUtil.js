module( 'TransformUtil.integrateTransform' );

test( 'basic', function() {
  var curTrans = Bump.Transform.create(),
      linVel = Bump.Vector3.create( 1, 2, 3 ),
      angVel = Bump.Vector3.create( 0, 0, 0 ),
      predictedTransform = Bump.Transform.create(),
      expectedTransform = Bump.Transform.create();
  expectedTransform.origin.setValue( 0.1, 0.2, 0.3 );
  expectedTransform.basis.setValue( 1, 0, 0, 0, -1, 0, 0, 0, -1 );

  testFunc( Bump.TransformUtil, 'integrateTransform', {
    isStaticFunc: true,
    epsilon: Math.pow( 2, -52 ),
    args: [
      [
        curTrans, linVel, angVel, 0.1,
        { param: predictedTransform, expected: expectedTransform }
      ]
    ]
  });
});

module( 'TransformUtil.calculateDiffAxisAngleQuaternion' );

test( 'basic', function() {
  var orn0a = Bump.Quaternion.create(),
      orn0b = orn0a.clone().setRotation( Bump.Vector3.create( 1, 0, 0 ),  Math.PI / 2 ),
      orn1a = Bump.Quaternion.create(),
      orn1b = orn1a.clone().setRotation( Bump.Vector3.create( 0, 1, 0 ), -Math.PI / 3 ),
      axis = Bump.Vector3.create(),
      angle = { angle: 0 };

  testFunc( Bump.TransformUtil, 'calculateDiffAxisAngleQuaternion', {
    isStaticFunc: true,
    epsilon: Math.pow( 2, -48 ),
    args: [
      [
        orn0a, orn1a,
        { param: axis, expected: Bump.Vector3.create( 1, 0, 0 ) },
        { param: angle, expected: { angle: Math.PI } }
      ],
      [
        orn0b, orn1b,
        { param: axis, expected: Bump.Vector3.create( -0.7745966692414835, -0.447213595499958, -0.4472135954999579 ) },
        { param: angle, expected: { angle: 1.823476581936975 } }
      ]
    ]
  });
});

module( 'TransformUtil.calculateVelocityQuaternion' );

test( 'basic', function() {
  var pos0 = Bump.Vector3.create( 5, 4, 3 ),
      pos1 = Bump.Vector3.create( 2, 3, 4 ),
      orn0 = Bump.Quaternion.create(),
      orn1 = Bump.Quaternion.create(),
      timeStep = 0.1,
      linVel = Bump.Vector3.create(),
      angVel = Bump.Vector3.create(),
      expectedLinVel = Bump.Vector3.create( -30, -10, 10 ),
      expectedAngVel = Bump.Vector3.create( -14.12458886808226, -8.154835185180083, -8.154835185180083 );

  orn0.setRotation( Bump.Vector3.create( 1, 0, 0 ),  Math.PI / 2 );
  orn1.setRotation( Bump.Vector3.create( 0, 1, 0 ), -Math.PI / 3 )

  testFunc( Bump.TransformUtil, 'calculateVelocityQuaternion', {
    isStaticFunc: true,
    epsilon: Math.pow( 2, -48 ),
    args: [
      [
        pos0, pos1, orn0, orn1, timeStep,
        { param: linVel, expected: expectedLinVel },
        { param: angVel, expected: expectedAngVel }
      ]
    ]
  });
});

module( 'TransformUtil.calculateVelocity' );

test( 'basic', function() {
  var transform0a = Bump.Transform.getIdentity(),
      transform1a = Bump.Transform.getIdentity(),
      timeStep = 0.1,
      linVel = Bump.Vector3.create(),
      angVel = Bump.Vector3.create(),
      orn0 = Bump.Quaternion.create(),
      orn1 = Bump.Quaternion.create();

  orn0.setRotation( Bump.Vector3.create( 1, 0, 0 ),  Math.PI / 2 );
  orn1.setRotation( Bump.Vector3.create( 0, 1, 0 ), -Math.PI / 3 )

  var transform0b = Bump.Transform.create( orn0, Bump.Vector3.create( 1, 2, 3 ) ),
      transform1b = Bump.Transform.create( orn1, Bump.Vector3.create( 4, 3, 2 ) );

  testFunc( Bump.TransformUtil, 'calculateVelocity', {
    isStaticFunc: true,
    epsilon: Math.pow( 2, -46 ),
    args: [
      [
        transform0a, transform1a, timeStep,
        { param: linVel, expected: Bump.Vector3.create() },
        { param: angVel, expected: Bump.Vector3.create() }
      ],
      [
        transform0b, transform1b, timeStep,
        { param: linVel, expected: Bump.Vector3.create( 30, 10, -10 ) },
        { param: angVel, expected: Bump.Vector3.create( -14.12458886808226, -8.154835185180083, -8.15483518518008 ) }
      ]
    ]
  });
});
