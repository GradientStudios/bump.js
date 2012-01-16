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

module( 'TypedConstraintType enum' );

test( 'basic', function() {
  equal( Bump.TypedConstraintType.POINT2POINT_CONSTRAINT_TYPE, 3, 'POINT2POINT_CONSTRAINT_TYPE' );
  equal( Bump.TypedConstraintType.HINGE_CONSTRAINT_TYPE,       4, 'HINGE_CONSTRAINT_TYPE'       );
  equal( Bump.TypedConstraintType.CONETWIST_CONSTRAINT_TYPE,   5, 'CONETWIST_CONSTRAINT_TYPE'   );
  equal( Bump.TypedConstraintType.D6_CONSTRAINT_TYPE,          6, 'D6_CONSTRAINT_TYPE'          );
  equal( Bump.TypedConstraintType.SLIDER_CONSTRAINT_TYPE,      7, 'SLIDER_CONSTRAINT_TYPE'      );
  equal( Bump.TypedConstraintType.CONTACT_CONSTRAINT_TYPE,     8, 'CONTACT_CONSTRAINT_TYPE'     );
  equal( Bump.TypedConstraintType.D6_SPRING_CONSTRAINT_TYPE,   9, 'D6_SPRING_CONSTRAINT_TYPE'   );
  equal( Bump.TypedConstraintType.MAX_CONSTRAINT_TYPE,        10, 'MAX_CONSTRAINT_TYPE'         );
});

module( 'ConstraintParams enum' );

test( 'basic', function() {
 equal( Bump.ConstraintParams.BT_CONSTRAINT_ERP,      1, 'POINT2POINT_CONSTRAINT_TYPE' );
 equal( Bump.ConstraintParams.BT_CONSTRAINT_STOP_ERP, 2, 'HINGE_CONSTRAINT_TYPE'       );
 equal( Bump.ConstraintParams.BT_CONSTRAINT_CFM,      3, 'CONETWIST_CONSTRAINT_TYPE'   );
 equal( Bump.ConstraintParams.BT_CONSTRAINT_STOP_CFM, 4, 'D6_CONSTRAINT_TYPE'          );
});

module( 'TypedConstraint.getMotorFactor' );

test( 'bare bones', function() {
  var tc = Bump.TypedConstraint.create( 0, Bump.RigidBody.create( 1, null, null ) );

  testFunc( Bump.TypedConstraint, 'getMotorFactor', {
    ignoreExpected: true,
    objects: tc,
    args: [ [ 0.5, 0, 1, 0.1, 0.1 ] ]
  });
});
