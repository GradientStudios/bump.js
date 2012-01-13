var RigidBodyDeepCopyCheck = function( a, b ) {
  CollisionObjectDeepCopyCheck( a, b );

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

var RigidBodyPointerMembers = CollisionObjectPointerMembers.concat(
  'optionalMotionState'
);

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
    [ 'checkCollideWith',           'boolean' ],

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
    [ 'additionalAngularDampingFactor',       'number' ],
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
