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

    [ 'userConstraintType',       'number'  ],
    [ 'userConstraintId',         'number'  ],
    [ 'breakingImpulseThreshold', 'number'  ],
    [ 'isEnabled',                'boolean' ],
    [ 'needsFeedback',            'boolean' ],
    [ 'appliedImpulse',           'number'  ],
    [ 'dbgDrawSize',              'number'  ]
  ];

  for ( var i = 0; i < checks.length; ++i ) {
    if ( typeof checks[i][1] === 'object' ) {
      if ( checks[i][1] !== null ) {
        ok( tc[ checks[i][0] ] instanceof checks[i][1].prototype.constructor, checks[i][0] );
      } else {
        strictEqual( tc[ checks[i][0] ], checks[i][1], checks[i][0] );
      }
    } else {
      strictEqual( typeof tc[ checks[i][0] ], checks[i][1], checks[i][0] );
    }
  }
});
