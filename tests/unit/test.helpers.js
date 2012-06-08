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
        var expectedValue = ( Math.abs( rProp - eProp ) < epsilon
                              ? rProp
                              : eProp );
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

// Assuming that clone works, tests `op` on `a` with a list of arguments `b` and
// expected values `expected`.
//
// Options include:
//
// - a test for setting a destination, `create`d from given `destType`
// - a test for whether `a` is supposed to modify itself
var testUnaryOp = function( objType, op, objs, expected, options ) {
  options = options || {};
  options.epsilon = options.epsilon || 0;
  options.modifiesSelf = options.modifiesSelf === undefined ? false : options.modifiesSelf;

  if ( typeof op === 'string' ) {
    ok( op in objType.prototype, op + ' exists' );
    op = objType.prototype[ op ];
  }

  var epsilonDeepEqual = deepEqual;
  if ( options.epsilon > 0 ) {
    // Using epsilon to test numeric values instead of the normal deepEqual
    epsilonDeepEqual = function( result, expected, message ) {
      epsilonNumberCheck( result, expected, options.epsilon, message );
    };
  }

  objs = Array.isArray( objs ) ? objs : [ objs ];
  expected = Array.isArray( expected ) ? expected : [ expected ];

  for ( var i = 0; i < objs.length; ++i ) {
    var c, o = objs[i], oClone = o.clone();

    epsilonDeepEqual( op.apply( objs[i], [] ), expected[i], 'basic equality' );
    if ( options.modifiesSelf ) {
      epsilonDeepEqual( objs[i], expected[i], 'self modification check' );
      oClone.clone( objs[i] );
    } else {
      deepEqual( o, oClone, 'does not modify object' );
    }

    if ( options.destType ) {
      var d = options.destType.create(), dRef = d;

      c = op.apply( o, [ d ] );
      strictEqual( c, dRef, 'answer is placed in specified destination' );
      epsilonDeepEqual( d, expected[i], 'setting destination works correctly' );

      if ( !options.modifiesSelf ) {
        deepEqual( o, oClone, 'does not modify object' );
      }

      if ( options.destType === objType ) {
        c = op.apply( o, [ o ] );
        strictEqual( c, o, 'answer is placed in specified destination' );
        epsilonDeepEqual( o, expected[i], 'setting yourself as destination works correctly' );

        // reset o after done
        oClone.clone( o );
      }
    }
  }
};

var testBinaryOp = function( objType, op, a, b, expected, options ) {
  options = options || {};
  options.epsilon = options.epsilon || 0;
  options.modifiesSelf = options.modifiesSelf === undefined ? false : options.modifiesSelf;

  if ( typeof op === 'string' ) {
    ok( op in objType.prototype, op + ' exists' );
    op = objType.prototype[ op ];
  }

  var epsilonDeepEqual = deepEqual;
  if ( options.epsilon > 0 ) {
    // Using epsilon to test numeric values instead of the normal deepEqual
    epsilonDeepEqual = function( result, expected, message ) {
      epsilonNumberCheck( result, expected, options.epsilon, message );
    };
  }

  b = Array.isArray( b ) ? b : [ b ];
  expected = Array.isArray( expected ) ? expected : [ expected ];

  var aClone = a.clone();

  for ( var i = 0; i < b.length; ++i ) {
    var bRef = b[i], bClone, c;

    if ( bRef.clone ) {
      bClone = b[i].clone();
    } else {
      bClone = b[i];
    }

    epsilonDeepEqual( op.apply( a, [ b[i] ] ), expected[i], 'basic equality' );
    if ( options.modifiesSelf ) {
      epsilonDeepEqual( a, expected[i], 'self modification check' );
      aClone.clone( a );
    } else {
      deepEqual( a, aClone, 'does not modify a' );
    }

    if ( options.destType ) {
      var d = options.destType.create(),
          dRef = d;

      c = op.apply( a, [ b[i], d ] );
      strictEqual( c, dRef, 'answer is placed in specified destination' );
      epsilonDeepEqual( d, expected[i], 'setting destination works correctly' );

      if ( options.modifiesSelf ) {
        // reset a
        aClone.clone( a );
      } else {
        deepEqual( a, aClone, 'does not modify a' );
      }

      // self destination test modifies a
      if ( options.destType === objType ) {
        deepEqual( a, aClone, 'ensure a starts off the same' );

        c = op.apply( a, [ b[i], a ] );
        strictEqual( c, a, 'answer is placed in specified self-destination' );
        epsilonDeepEqual( a, expected[i], 'setting yourself as destination works correctly' );

        // reset a after done
        aClone.clone( a );
      }

      if ( bRef.constructor.prototype === options.destType.prototype ) {
        deepEqual( b[i], bClone, 'ensure b starts off the same' );

        c = op.apply( a, [ b[i], b[i] ] );
        strictEqual( c, bRef, 'answer is placed in specified arg-destination' );
        epsilonDeepEqual( b[i], expected[i], 'setting arg as destination works correctly' );

        // reset b after done
        bClone.clone( b[i] );
      }
    }

    deepEqual( b[i], bClone, 'does not modify b' );

    aClone.clone( a );
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
    if ( !(result === expected) ) {
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
        message = message === undefined ? 'does not modify object' : message;
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
          strictEqual( a[ prop ], savedReferences[ prop ], prop + ' reference not changed' );
        }
      }
    };
  })();

  var postFuncObjCheck = (function() {
    if ( options.modifiesSelf ) {
      return function() {
        checkExpected( a, expected, 'modifies itself to be expected value' );
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
            strictEqual( args[argIndex], argsClone[argIndex], 'const arg ' + argIndex + ' is not modified' );
          } else {
            epsilonDeepEqual( args[argIndex], argsClone[argIndex], 'const arg ' + argIndex + ' is not modified' );
          }
        }
      }

      if ( arg.expected !== undefined ) {
        epsilonDeepEqual( args[argIndex], arg.expected, 'test index ' + i + ': reference arg ' + argIndex + ' has correct expected value' );
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

  for ( i = 0; i < objs.length; ++i ) {
    var a = objs[i],
        aClone,
        args = options.args === undefined ? [] : options.args[i].map( extractArgs ),
        argsClone = args.map(function( elem, idx, arr ) {
          if ( elem.clone ) {
            return elem.clone();
          } else {
            return elem;
          }
        }),
        expected = options.expected === undefined ? undefined : options.expected[i],
        ret;

    if ( !options.isStaticFunc ) {
      aClone = a.clone();
    }

    preFuncSaveReferences();
    checkExpected( func.apply( a, args ), expected, 'returns expected value' );
    postFuncCheckReferences();
    postFuncCheck();

    if ( options.destType ) {
      var dest = options.destType.create(), destRef = dest;

      preFuncSaveReferences();
      ret = func.apply( a, addDestArg( dest ) );
      postFuncCheckReferences();

      strictEqual( ret, dest, 'answer is placed in specified destination' );
      checkExpected( dest, expected, 'setting destination works correctly' );

      postFuncCheck();

      if ( options.destType === objType ) {
        preFuncSaveReferences();
        ret = func.apply( a, addDestArg( a ) );
        postFuncCheckReferences();
        strictEqual( ret, a, 'answer is placed in specified destination' );
        checkExpected( a, expected, 'setting yourself as destination works correctly' );

        postFuncArgCheck();
        resetA();
      }

      for ( j = 0; j < args.length; ++j ) {
        var argCorrectType = args[j].constructor.prototype === options.destType.prototype;
        if ( argCorrectType ) {
          epsilonDeepEqual( args[j], argsClone[j], 'arg is not modified' );

          preFuncSaveReferences();
          ret = func.apply( a, addDestArg( args[j] ) );
          postFuncCheckReferences();

          strictEqual( ret, args[j], 'answer is placed in specified destination' );
          checkExpected( args[j], expected, 'setting argument as destination works correctly' );

          postFuncObjCheck();
          postFuncArgCheck( j );

          argsClone[j].clone( args[j] );
        }
      }
    }

    // postFuncArgCheck();

    resetA();
  }

};
