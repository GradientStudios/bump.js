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
        if ( !arg.param.clone ) {
          strictEqual( args[argIndex], argsClone[argIndex], 'const arg ' + argIndex + ' is not modified' );
        } else {
          epsilonDeepEqual( args[argIndex], argsClone[argIndex], 'const arg ' + argIndex + ' is not modified' );
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
    check( argsLength === objs.length, 'args is the correct length' );
    check( expectedLength === objs.length, 'expected is the correct length' );
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

module( 'Bump.Transform' );

test( 'Transform exists', function() {
  var transform = Bump.Transform || {};
  strictEqual( typeof transform.create, 'function', 'Bump.Transform exists' );
});

test( 'Transform creation', function() {
  var t = Bump.Transform.create() || {};
  ok( t instanceof Bump.Transform.prototype.init, 'creation without `new` operator' );
});

module( 'Bump.Transform constructor' );

test( 'empty', function() {
  var transform = Bump.Transform.create();
  deepEqual( transform.basis, Bump.Matrix3x3.create(), 'basis zeroed out' );
  deepEqual( transform.origin, Bump.Vector3.create(), 'origin zeroed out' );
});

test( 'arguments (Quaternion)', function() {
  var quaternion = Bump.Quaternion.getIdentity(),
      transform = Bump.Transform.create( quaternion );

  deepEqual( transform.basis, Bump.Matrix3x3.getIdentity(), 'basis is identity matrix' );
  deepEqual( transform.origin, Bump.Vector3.create(), 'origin zeroed out' );
});

test( 'arguments (Quaternion, Vector3)', function() {
  var quaternion = Bump.Quaternion.getIdentity(),
      origin = Bump.Vector3.create( 42, Math.PI, Math.E ),
      transform = Bump.Transform.create( quaternion, origin );

  deepEqual( transform.basis, Bump.Matrix3x3.getIdentity(), 'basis is identity matrix' );
  deepEqual( transform.origin, origin, 'origin is set' );
  notStrictEqual( transform.origin, origin, 'transform origin is new copy' );
});

module( 'Bump.Transform.clone' );

test( 'static', function() {
  var a = Bump.Transform.create( Bump.Quaternion.getIdentity(), Bump.Vector3.create() ),
      aRef = a,
      b = Bump.Transform.clone( a );

  deepEqual( a, b, 'clone is equivalent' );
  notStrictEqual( a, b, 'clones object' );
  ok( a.basis !== b.basis && a.origin !== b.basis, 'deep clones properties' );
  strictEqual( a, aRef, 'a is not reallocated' );
});

test( 'member clone without destination', function() {
  var a = Bump.Transform.create( Bump.Quaternion.getIdentity(), Bump.Vector3.create() ),
      aRef = a,
      b = a.clone();

  deepEqual( a, b, 'clone is equivalent' );
  notStrictEqual( a, b, 'clones object' );
  ok( a.basis !== b.basis && a.origin !== b.origin, 'deep clones properties' );
  strictEqual( a, aRef, 'a is not reallocated' );
});

test( 'member clone to destination', function() {
  var a = Bump.Transform.create( Bump.Quaternion.getIdentity(), Bump.Vector3.create() ),
      aRef = a,
      b = Bump.Transform.create(),
      bRef = b;

  a.clone( b );
  deepEqual( a, b, 'clone is equivalent' );
  notStrictEqual( a, b, 'clones object' );
  ok( a.basis !== b.basis && a.origin !== b.origin, 'deep clones properties' );
  strictEqual( a, aRef, 'a is not reallocated' );
  strictEqual( b, bRef, 'b is not reallocated' );
});

module( 'Transform.assign' );
test( 'basic', function() {
  var a = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, 1, 1 ), Math.PI ),
        Bump.Vector3.create( 1, 2, 3 )
      ),
      b = Bump.Transform.getIdentity();

  notDeepEqual( a, b );
  a.assign( b );
  deepEqual( a, b );

  notStrictEqual( a.basis, b.basis );
  notStrictEqual( a.basis.m_el0, b.basis.m_el0 );
  notStrictEqual( a.basis.m_el1, b.basis.m_el1 );
  notStrictEqual( a.basis.m_el2, b.basis.m_el2 );
  notStrictEqual( a.origin, b.origin );
});

module( 'Bump.Transform.setOrigin' );
test( 'basic', function() {
  var a = Bump.Transform.create(),
      aRef = a,
      aOriginRef = a.origin,
      o = Bump.Vector3.create( 1, 1, 1 ),
      oRef = o,
      oClone = o.clone(),
      n = a.setOrigin( o );

  strictEqual( n, aRef, 'returns original transform' );
  deepEqual( a.origin, o, 'sets origin' );
  strictEqual( a, aRef, 'a is not reallocated' );
  strictEqual( a.origin, aOriginRef, 'a.origin is not reallocated' );
  deepEqual( o, oClone, 'o is not modified' );
  strictEqual( o, oRef, 'o is not reallocated' );
});

module( 'Bump.Transform.setBasis' );
test( 'basic', function() {
  var a = Bump.Transform.create(),
      aRef = a,
      aBasisRef = a.basis,
      b = Bump.Matrix3x3.create( 1, 2, 3, 4, 5, 6, 7, 8, 9 ),
      bRef = b,
      bClone = b.clone(),
      n = a.setBasis( b );

  strictEqual( n, aRef, 'returns original transform' );
  deepEqual( a.basis, b, 'sets basis' );
  strictEqual( a, aRef, 'a is not reallocated' );
  strictEqual( a.basis, aBasisRef, 'a.basis is not reallocated' );
  deepEqual( b, bClone, 'b is not modified' );
  strictEqual( b, bRef, 'b is not reallocated' );
});

module( 'Bump.Transform.setRotation' );
test( 'basic', function() {
  var a = Bump.Transform.create(),
      aRef = a,
      aBasisRef = a.basis,
      q = Bump.Quaternion.getIdentity(),
      qRef = q,
      qClone = q.clone(),
      n = a.setRotation( q );

  strictEqual( n, aRef, 'returns original transform' );
  deepEqual( a.basis, Bump.Matrix3x3.getIdentity(), 'sets basis to identity rotation' );
  strictEqual( a, aRef, 'a is not reallocated' );
  strictEqual( a.basis, aBasisRef, 'a.basis is not reallocated' );
  deepEqual( q, qClone, 'q is not modified' );
  strictEqual( q, qRef, 'q is not reallocated' );
});

module( 'Bump.Transform.setIdentity' );
test( 'basic', function() {
  var a = Bump.Transform.create( Bump.Quaternion.create(), Bump.Vector3.create( 1, 1, 1 ) ),
      aRef = a,
      aBasisRef = a.basis,
      aOriginRef = a.origin,
      n = a.setIdentity();

  strictEqual( n, aRef, 'returns original transform' );
  deepEqual( a.basis, Bump.Matrix3x3.getIdentity(), 'sets basis to identity rotation' );
  deepEqual( a.origin, Bump.Vector3.create( 0, 0, 0 ), 'zeroes out origin' );
  strictEqual( a, aRef, 'a is not reallocated' );
  strictEqual( a.basis, aBasisRef, 'a.basis is not reallocated' );
  strictEqual( a.origin, aOriginRef, 'a.origin is not reallocated' );
});

module( 'Bump.Transform.equal' );
test( 'basic', function() {
  var a = Bump.Transform.getIdentity(),
      aRef = a,
      aClone = a.clone(),
      b = Bump.Transform.getIdentity(),
      bRef = b,
      bClone = b.clone();

  equal( a.equal( b ), true, 'identity equals identity' );
  deepEqual( a, aClone, 'a is not changed' );
  deepEqual( b, bClone, 'b is not changed' );
  strictEqual( a, aRef, 'a is not reallocated' );
  strictEqual( b, bRef, 'b is not reallocated' );
});

module( 'Bump.Transform.mult' );
test( 'basic', function() {
  var a = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, -1, 1 ), Math.PI / 3 ),
        Bump.Vector3.create( -1, -1, -1 )
      ),
      aRef = a,
      aClone = a.clone(),
      b = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, 1, 1 ), Math.PI ),
        Bump.Vector3.create( 1, 1, 1 )
      ),
      bRef = b,
      bClone = b.clone(),
      expected = Bump.Transform.create(
        Bump.Matrix3x3.create(
          -0.8888888888888891, 0.4444444444444444, 0.1111111111111114,
          -0.11111111111111094, -0.44444444444444464, 0.8888888888888891,
          0.4444444444444445, 0.7777777777777779, 0.4444444444444444
        ),
        Bump.Vector3.create( -1.3333333333333333, -0.6666666666666666, 0.6666666666666667 )
      ),
      c = Bump.Transform.create();

  c.mult( a, b );
  deepEqual( c, expected );

  deepEqual( a, aClone, 'does not change a' );
  deepEqual( b, bClone, 'does not change b' );
  strictEqual( a, aRef, 'does not reallocate a' );
  strictEqual( b, bRef, 'does not reallocate b' );
});

module( 'Bump.Transform.multiplyTransform' );
test( 'basic', function() {
  var a = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, -1, 1 ), Math.PI / 3 ),
        Bump.Vector3.create( -1, -1, -1 )
      ),
      b = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, 1, 1 ), Math.PI ),
        Bump.Vector3.create( 1, 1, 1 )
      ),
      expected = Bump.Transform.create(
        Bump.Matrix3x3.create(
          -0.8888888888888891, 0.4444444444444444, 0.1111111111111114,
          -0.11111111111111094, -0.44444444444444464, 0.8888888888888891,
          0.4444444444444445, 0.7777777777777779, 0.4444444444444444
        ),
        Bump.Vector3.create( -1.3333333333333333, -0.6666666666666666, 0.6666666666666667 )
      );

  testFunc( Bump.Transform, 'multiplyTransform', {
    destType: Bump.Transform,
    objects: a,
    args: [ [ b ] ],
    expected: [ expected ]
  });

  // testBinaryOp( Bump.Transform, "multiplyTransform", a, b, expected, {
  //   destType: Bump.Transform
  // });
});

module( 'Bump.Transform.multiplyTransformSelf' );
test( 'basic', function() {
  var a = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, -1, 1 ), Math.PI / 3 ),
        Bump.Vector3.create( -1, -1, -1 )
      ),
      b = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, 1, 1 ), Math.PI ),
        Bump.Vector3.create( 1, 1, 1 )
      ),
      expected = Bump.Transform.create(
        Bump.Matrix3x3.create(
          -0.8888888888888891, 0.4444444444444444, 0.1111111111111114,
          -0.11111111111111094, -0.44444444444444464, 0.8888888888888891,
          0.4444444444444445, 0.7777777777777779, 0.4444444444444444
        ),
        Bump.Vector3.create( -1.3333333333333333, -0.6666666666666666, 0.6666666666666667 )
      );

  testBinaryOp( Bump.Transform, "multiplyTransformSelf", a, b, expected, {
    modifiesSelf: true
  });
});

module( 'Bump.Transform.multiplyQuaternion' );
test( 'basic', function() {
  var a = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, -1, 1 ), Math.PI / 3 ),
        Bump.Vector3.create( -1, -1, -1 )
      ),
      b = Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, 1, 1 ), Math.PI ),
      expected = Bump.Quaternion.create( 0.16666666666666655, 0.5, 0.8333333333333335, -0.16666666666666666 );

  testBinaryOp( Bump.Transform, "multiplyQuaternion", a, b, expected, {
    destType: Bump.Quaternion
  });
});

module( 'Bump.Transform.multiplyVector' );
test( 'basic', function() {
  var a = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, -1, 1 ), Math.PI / 3 ),
        Bump.Vector3.create( -1, -1, -1 )
      ),
      b = Bump.Vector3.create( 1, 1, 1 ),
      expected = Bump.Vector3.create( -1.3333333333333333, -0.6666666666666666, 0.6666666666666667 );

  testBinaryOp( Bump.Transform, "multiplyVector", a, b, expected, {
    destType: Bump.Vector3
  });
});

module( 'Bump.Transform.inverse' );
test( 'basic', function() {
  var a = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, -1, 1 ), Math.PI / 3 ),
        Bump.Vector3.create( -1, -1, -1 )
      ),
      aRef = a,
      aClone = a.clone(),
      expected = Bump.Transform.create(
        Bump.Matrix3x3.create(
          0.6666666666666667, 0.33333333333333337, 0.6666666666666666,
          -0.6666666666666666, 0.6666666666666667, 0.33333333333333337,
          -0.33333333333333337, -0.6666666666666666, 0.6666666666666667
        ),
        Bump.Vector3.create( 1.6666666666666665, 0.3333333333333335, -0.33333333333333326 )
      );

  deepEqual( a.inverse(), expected );
  deepEqual( a, aClone, 'does not modify a' );

  deepEqual( a.inverse(), a.inverse( a ) );
  strictEqual( a, aRef, 'does not allocate new a' );
});

module( 'Bump.Transform.invXform' );
test( 'basic', function() {
  // testBinaryOp( Bump.Transform, "invXform", a, b, expected, {
  //   destType: Bump.Vector3
  // });
});

module( 'Bump.Transform.inverseTimes' );
test( 'basic', function() {
  var a = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, -1, 1 ), Math.PI / 3 ),
        Bump.Vector3.create( -1, -1, -1 )
      ),
      b = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, 1, 1 ), Math.PI ),
        Bump.Vector3.create( 1, 1, 1 )
      ),
      expected = Bump.Transform.create(
        Bump.Matrix3x3.create(
          0.4444444444444444, 0.7777777777777779, 0.44444444444444453,
          0.8888888888888892, -0.4444444444444444, -0.11111111111111123,
          0.1111111111111111, 0.44444444444444475, -0.8888888888888891
        ),
        Bump.Vector3.create( 3.333333333333333, 0.666666666666667, -0.6666666666666665 )
      );

  testBinaryOp( Bump.Transform, "inverseTimes", a, b, expected, {
    destType: Bump.Transform
  });
});
