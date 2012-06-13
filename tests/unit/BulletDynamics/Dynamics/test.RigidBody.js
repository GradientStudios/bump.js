var RigidBodyDeepCopyCheck = function( a, b ) {
  notStrictEqual( a.worldTransform, b.worldTransform );
  notStrictEqual( a.interpolationWorldTransform, b.interpolationWorldTransform );
  notStrictEqual( a.interpolationLinearVelocity, b.interpolationLinearVelocity );
  notStrictEqual( a.interpolationAngularVelocity, b.interpolationAngularVelocity );
  notStrictEqual( a.anisotropicFriction, b.anisotropicFriction );

  strictEqual( a.broadphaseHandle, b.broadphaseHandle );
  strictEqual( a.collisionShape, b.collisionShape );
  strictEqual( a.extensionPointer, b.extensionPointer );
  strictEqual( a.rootCollisionShape, b.rootCollisionShape );
  strictEqual( a.userObjectPointer, b.userObjectPointer );

  notStrictEqual( a.invInertiaTensorWorld, b.invInertiaTensorWorld );
  notStrictEqual( a.linearVelocity, b.linearVelocity );
  notStrictEqual( a.angularVelocity, b.angularVelocity );
  notStrictEqual( a.linearFactor, b.linearFactor );
  notStrictEqual( a.gravity, b.gravity );
  notStrictEqual( a.gravity_acceleration, b.gravity_acceleration );
  notStrictEqual( a.invInertiaLocal, b.invInertiaLocal );
  notStrictEqual( a.totalForce, b.totalForce );
  notStrictEqual( a.totalTorque, b.totalTorque );

  strictEqual( a.optionalMotionState, b.optionalMotionState );
  for ( var i = 0; i < a.constraintRefs.length; ++i ) {
    strictEqual( a.constraintRefs[i], b.constraintRefs[i] );
  }

  notStrictEqual( a.deltaLinearVelocity, b.deltaLinearVelocity );
  notStrictEqual( a.deltaAngularVelocity, b.deltaAngularVelocity );
  notStrictEqual( a.invMass, b.invMass );
  notStrictEqual( a.pushVelocity, b.pushVelocity );
  notStrictEqual( a.turnVelocity, b.turnVelocity );
};

var RigidBodyPointerMembers = [
  'broadphaseHandle',
  'collisionShape',
  'extensionPointer',
  'rootCollisionShape',
  'userObjectPointer',
  'optionalMotionState'
];

module( 'RigidBody.create' );

test( 'basic', function() {
  var rb = Bump.RigidBody.create( 1, null, null );

  ok( rb instanceof Bump.CollisionObject.prototype.constructor );
  ok( rb instanceof Bump.RigidBody.prototype.constructor );
});

test( 'correct types', function() {
  var rb = Bump.RigidBody.create( 1, null, null );

  var checks = [
    // CollisionObject stuff
    [ 'worldTransform',               Bump.Transform ],
    [ 'interpolationWorldTransform',  Bump.Transform ],
    [ 'interpolationLinearVelocity',  Bump.Vector3   ],
    [ 'interpolationAngularVelocity', Bump.Vector3   ],
    [ 'anisotropicFriction',          Bump.Vector3   ],

    [ 'hasAnisotropicFriction',     'boolean' ],
    [ 'contactProcessingThreshold', 'number'  ],
    [ 'broadphaseHandle',           null      ],
    [ 'collisionShape',             null      ],
    [ 'extensionPointer',           null      ],
    [ 'rootCollisionShape',         null      ],
    [ 'collisionFlags',             'number'  ],
    [ 'islandTag1',                 'number'  ],
    [ 'companionId',                'number'  ],
    [ 'activationState1',           'number'  ],
    [ 'deactivationTime',           'number'  ],
    [ 'friction',                   'number'  ],
    [ 'restitution',                'number'  ],
    [ 'internalType',               'number'  ],
    [ 'userObjectPointer',          null      ],
    [ 'hitFraction',                'number'  ],
    [ 'ccdSweptSphereRadius',       'number'  ],
    [ 'ccdMotionThreshold',         'number'  ],
    [ 'm_checkCollideWith',         'boolean' ],

    // RigidBody stuff
    [ 'invInertiaTensorWorld', Bump.Matrix3x3 ],
    [ 'linearVelocity',        Bump.Vector3   ],
    [ 'angularVelocity',       Bump.Vector3   ],
    [ 'linearFactor',          Bump.Vector3   ],
    [ 'gravity',               Bump.Vector3   ],
    [ 'gravity_acceleration',  Bump.Vector3   ],
    [ 'invInertiaLocal',       Bump.Vector3   ],
    [ 'totalForce',            Bump.Vector3   ],
    [ 'totalTorque',           Bump.Vector3   ],
    [ 'deltaLinearVelocity',   Bump.Vector3   ],
    [ 'deltaAngularVelocity',  Bump.Vector3   ],
    [ 'angularFactor',         Bump.Vector3   ],
    [ 'invMass',               Bump.Vector3   ],
    [ 'pushVelocity',          Bump.Vector3   ],
    [ 'turnVelocity',          Bump.Vector3   ],

    [ 'optionalMotionState',      null      ],
    [ 'inverseMass',              'number'  ],
    [ 'linearDamping',            'number'  ],
    [ 'angularDamping',           'number'  ],
    [ 'additionalDamping',        'boolean' ],
    [ 'additionalDampingFactor',  'number'  ],
    [ 'linearSleepingThreshold',  'number'  ],
    [ 'angularSleepingThreshold', 'number'  ],
    [ 'constraintRefs',           'array'   ],
    [ 'rigidbodyFlags',           'number'  ],
    [ 'debugBodyId',              'number'  ],
    [ 'contactSolverType',        'number'  ],
    [ 'frictionSolverType',       'number'  ],

    [ 'additionalLinearDampingThresholdSqr',  'number' ],
    [ 'additionalAngularDampingThresholdSqr', 'number' ],
    [ 'additionalAngularDampingFactor',       'number' ]
  ];

  checkTypes( rb, checks );
});

module( 'RigidBodyFlags enum' );

test( 'basic', function() {
  strictEqual( Bump.RigidBodyFlags.BT_DISABLE_WORLD_GRAVITY, 1, 'BT_DISABLE_WORLD_GRAVITY' );
});

module( 'RigidBody.clone' );

test( 'basic', function() {
  var rb = Bump.RigidBody.create( 1, null, null ),
      clone = rb.clone();

  deepEqual( rb, clone );
  RigidBodyDeepCopyCheck( rb, clone );
});

/////////////////////////////////////////
// module( 'RigidBody.XXX' );
//
// test( 'bare bones', function() {
//   var rb = Bump.RigidBody.create( 1, null, null );
//   rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
//   rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );
//
//   testFunc( Bump.RigidBody, 'XXX', {
//     pointerMembers: RigidBodyPointerMembers,
//     ignoreExpected: true,
//     objects: rb,
//     args: [ [  ] ]
//   });
// });
/////////////////////////////////////////

module( 'RigidBody.proceedToTransform' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );

  testFunc( Bump.RigidBody, 'proceedToTransform', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    objects: rb,
    args: [ [ Bump.Transform.getIdentity() ] ]
  });
});

module( 'RigidBody.predictIntegratedTransform' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'predictIntegratedTransform', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    objects: rb,
    args: [ [
      0.1, { param: Bump.Transform.create(), isConst: false } ] ]
  });
});

module( 'RigidBody.saveKinematicState' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'saveKinematicState', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ 0.1 ] ]
  });
});

module( 'RigidBody.applyGravity' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setGravity( Bump.Vector3.create( 0, -9.8, 0 ) );

  testFunc( Bump.RigidBody, 'applyGravity', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb
  });
});

module( 'RigidBody.setGravity' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'setGravity', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ Bump.Vector3.create( 0, -9.8, 0 ) ] ]
  });
});

module( 'RigidBody.setDamping' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'setDamping', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ 0.5, 0.5 ] ]
  });
});

module( 'RigidBody.applyDamping' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setGravity( Bump.Vector3.create( 0, -9.8, 0 ) );
  rb.setDamping( 0.5, 0.5 );

  testFunc( Bump.RigidBody, 'applyDamping', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ 0.1 ] ]
  });
});

module( 'RigidBody.setMassProps' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'setMassProps', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ 1, Bump.Vector3.create( 1, 1, 1 ) ] ]
  });
});

module( 'RigidBody.setLinearFactor' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'setLinearFactor', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ Bump.Vector3.create() ] ]
  });
});

module( 'RigidBody.integrateVelocities' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'integrateVelocities', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ 0.1 ] ]
  });
});

module( 'RigidBody.setCenterOfMassTransform' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'setCenterOfMassTransform', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ Bump.Transform.getIdentity() ] ]
  });
});

module( 'RigidBody.applyCentralForce' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'applyCentralForce', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ Bump.Vector3.create( 1, 2, 3 ) ] ]
  });
});

module( 'RigidBody.setInvInertiaDiagLocal' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'setInvInertiaDiagLocal', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    objects: rb,
    args: [ [ Bump.Vector3.create() ] ]
  });
});

module( 'RigidBody.setSleepingThresholds' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'setSleepingThresholds', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ 0.5, 0.5 ] ]
  });
});

module( 'RigidBody.applyTorque' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'applyTorque', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ Bump.Vector3.create() ] ]
  });
});

module( 'RigidBody.applyForce' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'applyForce', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ Bump.Vector3.create( 1, 1, 1 ), Bump.Vector3.create( 3, 2, 1 ) ] ]
  });
});

module( 'RigidBody.applyCentralImpulse' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'applyCentralImpulse', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ Bump.Vector3.create( 1, 1, 1 ) ] ]
  });
});

module( 'RigidBody.applyTorqueImpulse' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'applyTorqueImpulse', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ Bump.Vector3.create( 2, 2, 2 ) ] ]
  });
});

module( 'RigidBody.applyImpulse' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'applyImpulse', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ Bump.Vector3.create( 3, 2, 1 ), Bump.Vector3.create( 1, 2, 3 ) ] ]
  });
});

module( 'RigidBody.clearForces' );

test( 'test skipped', function() {
  expect( 0 );
});

module( 'RigidBody.updateInertiaTensor' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'updateInertiaTensor', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb
  });
});

module( 'RigidBody.getVelocityInLocalPoint' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'getVelocityInLocalPoint', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    objects: rb,
    args: [ [ Bump.Vector3.create( 1, 1, 1 ) ] ]
  });
});

module( 'RigidBody.translate' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'translate', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ Bump.Vector3.create( 1, 1, 1 ) ] ]
  });
});

module( 'RigidBody.getAabb' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setCollisionShape( Bump.BoxShape.create( Bump.Vector3.create( 1, 1, 1 ) ) );

  testFunc( Bump.RigidBody, 'getAabb', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    objects: rb,
    args: [
      [
        { param: Bump.Vector3.create(), isConst: false },
        { param: Bump.Vector3.create(), isConst: false }
      ]
    ]
  });
});

module( 'RigidBody.computeImpulseDenominator' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'computeImpulseDenominator', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    objects: rb,
    args: [ [ Bump.Vector3.create(), Bump.Vector3.create( 1, 0, 0 ) ] ]
  });
});

module( 'RigidBody.updateDeactivation' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'updateDeactivation', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ 0.1 ] ]
  });
});

module( 'RigidBody.wantsSleeping' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'wantsSleeping', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    objects: rb
  });
});

module( 'RigidBody.setMotionState' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'setMotionState', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ Bump.DefaultMotionState.create() ] ]
  });
});

module( 'RigidBody.setAngularFactor' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'setAngularFactor', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ Bump.Vector3.create( 1, 2, 3 ) ] ]
  });
});

module( 'RigidBody.checkCollideWithOverride' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'checkCollideWithOverride', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    objects: rb,
    args: [ [ Bump.RigidBody.create( 1, null, null ) ] ]
  });
});

module( 'RigidBody.addConstraintRef' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'addConstraintRef', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ Bump.TypedConstraint.create( 0, Bump.RigidBody.create( 1, null, null ) ) ] ]
  });
});

module( 'RigidBody.removeConstraintRef' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  var c = Bump.TypedConstraint.create( 0, Bump.RigidBody.create( 1, null, null ) );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.addConstraintRef( c );

  testFunc( Bump.RigidBody, 'removeConstraintRef', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ c ] ]
  });

  rb.removeConstraintRef( c );
});

module( 'RigidBody.internalWritebackVelocity' );

test( 'bare bones', function() {
  var rb = Bump.RigidBody.create( 1, null, null );
  rb.setLinearVelocity( Bump.Vector3.create( 1, 1, 1 ) );
  rb.setAngularVelocity( Bump.Vector3.create( 1, 1, 1 ) );

  testFunc( Bump.RigidBody, 'internalWritebackVelocity', {
    pointerMembers: RigidBodyPointerMembers,
    ignoreExpected: true,
    modifiesSelf: true,
    objects: rb,
    args: [ [ 0.1 ] ]
  });
});
