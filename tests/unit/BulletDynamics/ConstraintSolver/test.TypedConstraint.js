module( 'TypedConstraint.create' );

test( 'basic', function() {
  ok( Bump.TypedConstraint, 'TypedConstraint exists' );

  var tc = Bump.TypedConstraint.create( 0, Bump.RigidBody.create( 1, null, null ) );

  ok( tc instanceof Bump.TypedObject.prototype.constructor );
  ok( tc instanceof Bump.TypedConstraint.prototype.constructor );
});

test( 'correct types', function() {
  var tc = Bump.TypedConstraint.create( 0, Bump.RigidBody.create( 1, null, null ) );

  var checks = [
    [ 'rbA', Bump.RigidBody ],
    [ 'rbB', Bump.RigidBody ],

    [ 'objectType',               'number'  ],
    [ 'userConstraintType',       'number'  ],
    [ 'userConstraintId',         'number'  ],
    [ 'breakingImpulseThreshold', 'number'  ],
    [ 'isEnabled',                'boolean' ],
    [ 'needsFeedback',            'boolean' ],
    [ 'appliedImpulse',           'number'  ],
    [ 'dbgDrawSize',              'number'  ]
  ];

  checkTypes( tc, checks );
});
