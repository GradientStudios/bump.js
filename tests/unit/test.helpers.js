// Given an object, checks the types of the properties to ensure that they are
// of the correct types compared to the expected values.
var checkTypes = function( obj, checks ) {
  for ( var i = 0; i < checks.length; ++i ) {
    var propName = checks[i][0];
    var propType = checks[i][1];
    if ( typeof propType === 'object' ) {
      if ( propType !== null ) {
        ok( obj[ propName ] instanceof propType.prototype.constructor, propName );
      } else {
        if ( obj[ propName ] === null ) {
          strictEqual( obj[ propName ], propType, propName );
        } else {
          ok( typeof obj[ propName ] === 'object', propName );
        }
      }
    } else {
      if ( propType === 'array' ) {
        ok( Array.isArray( obj[ propName ] ), propName );
      } else {
        strictEqual( typeof obj[ propName ], propType, propName );
      }
    }
  }

  checks = checks.map(function( elem ) {
    return elem[0];
  });

  for ( var prop in obj ) {
    if ( obj.hasOwnProperty( prop ) ) {
      if ( checks.indexOf( prop ) === -1 ) {
        ok( false, 'has no extra property "' + prop + '"' );
      }
    }
  }
};

// Given an object that should represent an enum, make sure that no two properties
// of the enum have the same value.
var testEnumForUniqueValues = function( enumObj ) {
  var values = {};
  for ( var key in enumObj ) {
    values[ enumObj[ key ] ] = values[ enumObj[ key ] ] || [];
    values[ enumObj[ key ] ].push( key );
  }
  for ( var value in values ) {
    if ( values[ value ].length > 1 ) {
      // duplicate values were found
      ok( false, 'Failed because properties ' + values[ value ].toString() + ' share value ' + value );
    }
    else {
      ok( true, 'Property ' + values[ value ][ 0 ] + ' has unique value ' + value );
    }
  }
};

// Checks `result` against `expected` in a way similar to `deepEqual` but only
// checks equality of numbers, and does this with a given `epsilon`.
var epsilonNumberCheck = function( result, expected, epsilon, message ) {
  message = message !== undefined ? message + ': ' : '';

  var key, expectedKeys = [], checkedObjects = [ expected ];
  for ( key in expected ) {
    if ( expected.hasOwnProperty( key ) ) {
      expectedKeys.push( [ key, expected, result, [ key ] ] );
    }
  }

  while ( expectedKeys.length ) {
    key = expectedKeys.shift();
    var eProp = key[1][ key[0] ],
        rProp = key[2][ key[0] ],
        path  = key[3].join( '.' );

    if ( checkedObjects.indexOf( eProp ) === -1 ) {

      if ( typeof eProp === 'number' ) {
        var expectedValue = ( Math.abs( rProp - eProp ) < epsilon ?
                              rProp :
                              eProp );
        equal( rProp, expectedValue, message + path );
      } else if ( Array.isArray( eProp ) ) {
        checkedObjects.push( eProp );
        for ( key in eProp ) {
          if ( eProp.hasOwnProperty( key ) ) {
            expectedKeys.push( [ key, eProp, rProp, [ path, key ] ] );
          }
        }
      } else if ( typeof eProp === 'object' ) {
        checkedObjects.push( eProp );
        for ( key in eProp ) {
          if ( eProp.hasOwnProperty( key ) ) {
            expectedKeys.push( [ key, eProp, rProp, [ path, key ] ] );
          }
        }
      }
    }
  }
};

var testFunc = function( objType, func, options ) {
  options = options || {};
  options.isStaticFunc = options.isStaticFunc || false;
  options.epsilon = options.epsilon || 0;
  options.modifiesSelf = options.modifiesSelf || false;
  options.pointerMembers = options.pointerMembers || [];

  var i, j, epsilonDeepEqual = deepEqual;
  var savedReferences = {};
  var descPrefix = '';

  if ( options.epsilon > 0 ) {
    // Using epsilon to test numeric values instead of the normal deepEqual
    epsilonDeepEqual = function( result, expected, message ) {
      epsilonNumberCheck( result, expected, options.epsilon, message );
    };
  }

  // A ton of utility functions
  var check = function( expression, message ) {
    if ( !expression ) {
      ok( expression, message );
    }
  };

  var checkEqual = function( result, expected, message ) {
    if ( result !== expected ) {
      equal( result, expected, message );
    }
  };

  var extractArgs = function( element, index, array ) {
    return element.param;
  };

  var resetA = (function() {
    if ( options.isStaticFunc ) {
      return function() {};
    } else {
      return function() { aClone.clone( a ); };
    }
  })();

  var checkA = (function() {
    if ( options.isStaticFunc ) {
      return function() {};
    } else {
      return function( message ) {
        message = descPrefix + ( message === undefined ? 'does not modify object' : message );
        epsilonDeepEqual( a, aClone, message );
      };
    }
  })();

  var checkExpected = (function() {
    if ( options.ignoreExpected ) {
      return function() {};
    } else {
      return epsilonDeepEqual;
    }
  })();

  var applyFunc = (function() {
    if ( options.isStaticFunc ) {
      return function( a, args ) {
        func.apply( undefined, args );
      };
    } else {
      return function( a, args ) {
        func.apply( a, args );
      };
    }
  })();

  var preFuncSaveReferences = (function() {
    return function() {
      savedReferences = {};
      for ( var prop in a ) {
        if ( a.hasOwnProperty( prop ) ) {
          if ( typeof a[ prop ] === 'object' ) {
            if ( options.pointerMembers.indexOf( prop ) === -1 ) {
              savedReferences[ prop ] = a[ prop ];
            }
          }
        }
      }
    };
  })();

  var postFuncCheckReferences = (function() {
    return function() {
      for ( var prop in savedReferences ) {
        if ( savedReferences.hasOwnProperty( prop ) ) {
          strictEqual( a[ prop ], savedReferences[ prop ], descPrefix + prop + ' reference not changed' );
        }
      }
    };
  })();

  var postFuncObjCheck = (function() {
    if ( options.modifiesSelf ) {
      return function() {
        checkExpected( a, expected, descPrefix + 'modifies itself to be expected value' );
        a.clone( a );
      };
    } else {
      return function() {
        checkA();
      };
    }
  })();

  var postFuncArgCheck = function( exception ) {
    var argIndex;
    for ( argIndex = 0; argIndex < argsClone.length; ++argIndex ) {
      var arg = options.args[i][argIndex];
      if ( arg.isConst && argIndex !== exception ) {
        if ( !( options.modifiesSelf && a === arg.param ) ) {
          if ( !arg.param.clone ) {
            strictEqual( args[argIndex], argsClone[argIndex], descPrefix + 'const arg ' + argIndex + ' is not modified' );
          } else {
            epsilonDeepEqual( args[argIndex], argsClone[argIndex], descPrefix + 'const arg ' + argIndex + ' is not modified' );
          }
        }
      }

      if ( arg.expected !== undefined ) {
        epsilonDeepEqual( args[argIndex], arg.expected, descPrefix + 'test index ' + i + ': reference arg ' + argIndex + ' has correct expected value' );
        if ( argsClone[argIndex].clone ) {
          argsClone[argIndex].clone( args[argIndex] );
        } else {
          for ( var prop in argsClone[argIndex] ) {
            if ( argsClone.hasOwnProperty( prop ) ) {
              var type = typeof argsClone[argIndex][prop];
              check( type === 'string' || type === 'number' || type === 'boolean',
                     "Can't handle nontrivial objects" );
              args[argIndex][prop] = argsClone[argIndex][prop];
            }
          }
        }
      }
    }
  };

  var postFuncCheck = function() {
    postFuncObjCheck();
    postFuncArgCheck();
  };

  check( !( options.modifiesSelf && options.isStaticFunc ), 'cannot be static and modify self' );

  if ( typeof func === 'string' ) {
    if ( !options.isStaticFunc ) {
      ok( func in objType.prototype, func + ' exists' );
      func = objType.prototype[ func ];
    } else {
      ok( func in objType, func + ' exists' );
      func = objType[ func ];
    }
  } else {
    strictEqual( typeof func, 'function' );
  }

  var addDestArg = function( dest ) {
    var arr = args.slice( 0 );
    arr.push( dest );
    return arr;
  };

  var objs = options.objects || {};

  var argsLength = Array.isArray( objs ) ? objs.length : undefined;
  if ( options.args ) {
    argsLength = options.args.length;
    check( Array.isArray( options.args ), 'args is an array of args' );

    for ( i = 0; i < options.args.length; ++i ) {
      check( Array.isArray( options.args[i] ), 'args is an array of arrays' );

      for ( j = 0; j < options.args[i].length; ++j ) {
        var arg = options.args[i][j];
        if ( !arg.param ) {
          options.args[i][j] = { param: arg };
          arg = options.args[i][j];
        }

        arg.isConst = arg.isConst === undefined ? arg.expected == null : arg.isConst;
      }
    }
  }

  var expectedLength = Array.isArray( objs ) ? objs.length : undefined;
  if ( options.expected ) {
    expectedLength = options.expected.length;
    check( Array.isArray( options.expected ), 'expected is an array of results' );
  }

  if ( Array.isArray( objs ) ) {
    checkEqual( argsLength, objs.length, 'args is the correct length' );
    checkEqual( expectedLength, objs.length, 'expected is the correct length' );
  } else {
    if ( argsLength && expectedLength ) {
      check( argsLength === expectedLength, 'args and expected match length' );
    }

    objs = [ objs ];
    var numOps = Math.max( argsLength || 0, expectedLength || 0 );
    for ( i = 1; i < numOps; ++i ) {
      objs.push( objs[0] );
    }
  }

  var argMap = function( elem, idx, arr ) {
    if ( elem.clone ) {
      return elem.clone();
    } else {
      return elem;
    }
  };

  for ( i = 0; i < objs.length; ++i ) {
    var a = objs[i],
        aClone,
        args = options.args === undefined ? [] : options.args[i].map( extractArgs ),
        argsClone = args.map( argMap ),
        expected = options.expected === undefined ? undefined : options.expected[i],
        ret;
    descPrefix = 'test #' + (i + 1) + ': ';

    if ( !options.isStaticFunc ) {
      aClone = a.clone();
    }

    preFuncSaveReferences();
    checkExpected( func.apply( a, args ), expected, descPrefix + 'returns expected value' );
    postFuncCheckReferences();
    postFuncCheck();

    var prefixes = [];
    if ( options.destType ) {
      prefixes.push( descPrefix );
      descPrefix += 'with dest set: ';

      var dest = options.destType.create(), destRef = dest;

      preFuncSaveReferences();
      ret = func.apply( a, addDestArg( dest ) );
      postFuncCheckReferences();

      strictEqual( ret, dest, descPrefix + 'answer is placed in specified destination' );
      checkExpected( dest, expected, descPrefix + 'setting destination works correctly' );

      postFuncCheck();

      if ( options.destType === objType ) {
        prefixes.push( descPrefix );
        descPrefix += 'with self dest: ';

        preFuncSaveReferences();
        ret = func.apply( a, addDestArg( a ) );
        postFuncCheckReferences();
        strictEqual( ret, a, descPrefix + 'answer is placed in specified destination' );
        checkExpected( a, expected, descPrefix + 'setting yourself as destination works correctly' );

        postFuncArgCheck();
        resetA();

        descPrefix = prefixes.pop();
      }

      for ( j = 0; j < args.length; ++j ) {
        var argCorrectType = args[j].constructor.prototype === options.destType.prototype;
        if ( argCorrectType ) {
          prefixes.push( descPrefix );
          descPrefix += 'with arg ' + j + ' as dest: ';

          epsilonDeepEqual( args[j], argsClone[j], descPrefix + 'arg ' + j + ' is not modified' );

          preFuncSaveReferences();
          ret = func.apply( a, addDestArg( args[j] ) );
          postFuncCheckReferences();

          strictEqual( ret, args[j], descPrefix + 'answer is placed in specified destination' );
          checkExpected( args[j], expected, descPrefix + 'setting argument as destination works correctly' );

          postFuncObjCheck();
          postFuncArgCheck( j );

          argsClone[j].clone( args[j] );

          descPrefix = prefixes.pop();
        }
      }

      descPrefix = prefixes.pop();
    }

    // postFuncArgCheck();

    resetA();
  }

};
