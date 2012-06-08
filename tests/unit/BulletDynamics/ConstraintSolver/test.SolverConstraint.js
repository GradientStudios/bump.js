var unionTest = function( obj, unionName, checks ) {
  ok( obj[ unionName ] !== undefined,
      'internal union value ' + unionName + ' exists' );

  var maxSize = 1,
  i;
  for ( i = 0; i < checks.length; i++ ) {
    if ( !Array.isArray( checks[ i ] ) ) {
      checks[ i ] = [ checks[ i ], 1 ];
    }
    checks[ i ][ 1 ] = checks[ i ][ 1 ] || 1
    maxSize = Math.max( maxSize, checks[ i ][ 1 ] );
  }
  if ( maxSize > 1 ) {
    ok( Array.isArray( obj[ unionName ] ), 'internal union value is an array' );
    ok( obj[ unionName ].length === maxSize, 'initialized to correct length' );

    for ( i = 0; i < checks.length; i++ ) {
      var propName = checks[ i ][ 0 ],
      size = checks[ i ][ 1 ];

      ok( obj[ propName ] !== undefined, propName + ' exists' );

      if ( size > 1 ) {
        var testValue = [];

        for ( var j = 0; j < size; j++ ) {
          testValue.push( i + 1 );
        }
        obj[ propName ] = testValue;
        deepEqual( obj[ unionName ].splice( 0, size ), testValue,
                   propName + ' setter sets first ' + size + ' indices of ' + unionName );
        deepEqual( obj[ propName ], testValue,
                   propName + ' getter returns first ' + size + ' indices of ' + unionName );
      }
      else {
        var testValue = i + 1,
        propName = checks[ i ][ 0 ];
        obj[ propName ] = testValue;
        ok( obj[ unionName ][ 0 ] === testValue,
            propName + ' setter changes ' + unionName + '[ 0 ]' );
        ok( obj[ propName ] === testValue,
            propName + ' getter returns ' + unionName + '[ 0 ]' );
      }
    }
  }
  else {
    for ( i = 0; i < checks.length; i++ ) {
      var testValue = i + 1,
      propName = checks[ i ][ 0 ];
      ok( obj[ propName ] !== undefined, propName + ' exists' );
      obj[ propName ] = testValue;
      ok( obj[ unionName ] === testValue,
          propName + ' setter changes ' + unionName );
      ok( obj[ propName ] === testValue,
          propName + ' getter returns ' + unionName );
    }
  }
}

module( 'SolverConstraint.create' );

test( 'basic', function() {
  ok( Bump.SolverConstraint, 'SolverConstraint exists' );

  var sc = Bump.SolverConstraint.create();

  ok( sc, 'creates an object' );
  ok( sc instanceof Bump.SolverConstraint.prototype.constructor );
});

test( 'correct types', function() {
  var sc = Bump.SolverConstraint.create(),
  checks = [
    [ 'relpos1CrossNormal', Bump.Vector3 ],
    [ 'contactNormal',      Bump.Vector3 ],
    [ 'relpos2CrossNormal', Bump.Vector3 ],
    [ 'angularComponentA',  Bump.Vector3 ],
    [ 'angularComponentB',  Bump.Vector3 ],

    [ 'appliedPushImpulse',          'number' ],
    [ 'appliedImpulse',              'number' ],
    [ 'friction',                    'number' ],
    [ 'jacDiagABInv',                'number' ],
    [ 'overrideNumSolverIterations', 'number' ],

    [ 'rhs',            'number' ],
    [ 'cfm',            'number' ],
    [ 'lowerLimit',     'number' ],
    [ 'upperLimit',     'number' ],
    [ 'rhsPenetration', 'number' ],

    // internal values for unions
    [ '_union0', 'number' ],
    [ '_union1', 'number' ],
    [ '_union2', 'number' ],
    [ '_union3', 'number' ],
    [ '_union4', 'number' ]
  ];

  checkTypes( sc, checks );
});

module( 'SolverConstraint union properties' );

test( 'union 0', function() {
  var sc = Bump.SolverConstraint.create();

  unionTest( sc, '_union0', [ 'numConsecutiveRowsPerKernel', 'unusedPadding0' ] );
  unionTest( sc, '_union1', [ 'frictionIndex', 'unusedPadding1' ] );
  unionTest( sc, '_union2', [ 'solverBodyA', 'companionIdA' ] );
  unionTest( sc, '_union3', [ 'solverBodyB', 'companionIdB' ] );
  unionTest( sc, '_union4', [ 'originalContactPoint', 'unusedPadding4' ] );

});

module( 'SolverConstraint.SolverConstraintType enum' );

test( 'basic', function() {
  var sct = Bump.SolverConstraint.SolverConstraintType;
  ok( sct !== undefined, 'enum exists' );
  ok( sct.BT_SOLVER_CONTACT_1D === 0, 'BT_SOLVER_CONTACT_1D has correct value' );
  ok( sct.BT_SOLVER_FRICTION_1D === 1, 'BT_SOLVER_FRICTION_1D has correct value' );
});
