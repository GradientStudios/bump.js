// file for generic inheritance code and some base classes

// the main library object
this.Bump = {};

(function( window, Bump ) {

  Bump.INCOMPLETE_IMPLEMENTATION = true;

  Bump.noop = function noop() {};
  Bump.abstract = function abstract() {
    Bump.Assert( false );
  };
  Bump.notImplemented = function notImplemented() {
    throw new Error( 'Function not implemented (yet)!' );
  };

  // This regex is not exhaustive, but will not return false positives.
  var functionNameTest = /^function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/;

  var InvalidSuperError = function InvalidSuperError( message ) {
    this.name = 'InvalidSuperError';
    this.message = message || '_super function invoked without parent or function in parent';
  };

  InvalidSuperError.prototype = new Error();
  InvalidSuperError.constructor = InvalidSuperError;
  Bump.InvalidSuperError = InvalidSuperError;

  var badSuperFunc = function _superNotFound() {
    throw new Bump.InvalidSuperError();
  };

  function superWrap( superFunc, newFunc ) {
    if ( superFunc == null ) {
      superFunc = badSuperFunc;
      console.error( '_super call without parent' );
    }

    var wrappedFunc = function superWrappedFunc() {
      var ret;

      this._super = superFunc;
      ret = superWrappedFunc.__origFunc__.apply( this, arguments );
      delete this._super;

      return ret;
    };

    var matches = functionNameTest.exec( newFunc );
    if ( matches !== null ) {
      var functionName = matches[1];
      var wrappedFuncBody = wrappedFunc.toString();
      var newFuncBody = wrappedFuncBody.replace( new RegExp( 'superWrappedFunc', 'g' ), functionName );
      wrappedFunc = eval( '(' + newFuncBody + ')' );
    }

    wrappedFunc.__origFunc__ = newFunc;

    return wrappedFunc;
  }

  function walkProtoChain( prototype, func ) {
    if ( prototype == null ) {
      return;
    }

    var ret = func( prototype );
    return ret || prototype && walkProtoChain( Object.getPrototypeOf( prototype ), func );
  }

  var superTest = /xyz/.test( function() { return 'var xyz'; } ) ? /\b_super\b/ : /.*/;

  // all objects created by Bump.type
  function Type() {}

  Bump.isType = function isType( obj ) {
    return obj instanceof Type;
  };

  var potentiallyProblematicCtors = [];
  var potentiallyProblematicDetails = [];

  var uid = 0;

  // The type function will be used for object inheritance.
  // Objects are instantiated with Object.create()
  Bump.type = function type( options ) {
    var defaultInit = function defaultInit() {};

    options = options || {};
    options.init = options.init || defaultInit;

    var exports = Object.create( Type.prototype, options.typeProperties || {} ),
        parent = ( options.parent || {} ).prototype || {},
        members = options.members || {},
        properties = options.properties || {},
        typeMembers = options.typeMembers || {},
        getsetValues = [ 'get', 'set' ],
        key,
        getset,
        getsetIndex;

    var findThisCalls = function( func ) {
      if ( typeof func !== 'function' ) {
        return [];
      }

      var foundFuncs = [];
      var funcBody = func.toString();
      var funcCallRe = /this\s*\.\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g;
      var matches;
      while ( (matches = funcCallRe.exec( funcBody )) !== null ) {
        if ( matches[1] !== '_super' ) {
          if ( foundFuncs.indexOf( matches[1] ) === -1 ) {
            foundFuncs.push( matches[1] );
          }
        }
      }
      return foundFuncs;
    };

    // Consider the following situation in C++:
    //
    //     struct A {
    //       unsigned int value;
    //       A() { foo(); }
    //       virtual void foo() { bar(); }
    //       virtual void bar() { value = 1; }
    //     };
    //
    //     struct B : public A {
    //       virtual void bar() { value = 2; }
    //     };
    //
    //     B b;
    //
    // What is the value of b.value? In C++, it would be 1. With a normal
    // prototypal inheritance port, this would probably resolve to be 2. In
    // efforts to keep more in line with C++ (which is probably A Bad Thing),
    // the following chunk of code attempts to locate such occurances and
    // eliminate them by creating copies of functions with mangled names.
    //
    // Unfortunately, eval is used here to rewrite the code, and thus the
    // scoping of the code is actually different than from the original source.
    // This may prove to be problematic, and is probably Evil. You have been
    // warned.
    //
    // - EL
    var idx = potentiallyProblematicCtors.indexOf( parent.init );
    if ( idx !== -1 ) {
      var badFuncs = potentiallyProblematicDetails[ idx ].funcs;
      for ( var i = 0; i < badFuncs.length; ++i ) {
        var unmangledFuncName = badFuncs[i].name;
        if ( unmangledFuncName in members ) {
          var parentUid = options.parent.__uid__;
          var parentTypeName = parent.init.name;
          var childTypeName = options.init.name;
          console.warn( 'Bump.type: Ctor for ' + parentTypeName + ' calls ' + badFuncs[i].name +
                        ' which is overridden in ' + childTypeName + '. This behavior ' +
                        'is inconsistent with behaviour in C++.' );

          var funcsToMangle = badFuncs[i].callStack.slice(0);
          funcsToMangle.push( unmangledFuncName );

          var re, callerBody, callerFunc, newCallerBody, mangledFuncName;
          var unmangledCallerName = 'init', mangledCallerName = 'init';
          while ( funcsToMangle.length ) {
            unmangledFuncName = funcsToMangle.shift();
            mangledFuncName = '__' + parentTypeName + parentUid + '_' + unmangledFuncName + '__';
            if ( mangledCallerName in parent ) {
              callerFunc = parent[ mangledCallerName ];
            } else {
              callerFunc = parent[ unmangledCallerName ];
            }
            callerBody = callerFunc.toString();

            re = new RegExp( '\\bthis\\s*\\.\\s*' + unmangledFuncName + '\\s*\\(', 'g' );
            if ( !callerFunc.__origFunc__ ) {
              newCallerBody = callerBody.replace( re, 'this.' + mangledFuncName + '(' );
              parent[ mangledCallerName ] = eval( '(' + newCallerBody + ')' );
            } else {
              callerBody = callerFunc.__origFunc__.toString();
              newCallerBody = callerBody.replace( re, 'this.' + mangledFuncName + '(' );
              callerFunc.__origFunc__ = eval( '(' + newCallerBody + ')' );
            }

            unmangledCallerName = unmangledFuncName;
            mangledCallerName = mangledFuncName;
          }

          if ( !( mangledCallerName in parent ) ) {
            parent[ mangledCallerName ] = parent[ unmangledCallerName ];
          }
        }
      }
    }

    var potentiallyProblematicFuncs = findThisCalls( options.init ).map(function( elem ) {
      return {
        name: elem,
        callStack: []
      };
    });

    function getDescriptor( key, getset, prototype ) {
      var desc = Object.getOwnPropertyDescriptor( prototype, key );
      if ( desc ) {
        return desc[ getset ];
      }
      return undefined;
    }

    for ( key in properties ) {
      for ( getsetIndex = 0; getsetIndex < 2; getsetIndex++ ) {
        getset = getsetValues[ getsetIndex ];

        if ( properties[ key ][ getset ] && superTest.test( properties[ key ][ getset ] ) ) {
          properties[ key ][ getset ] = superWrap(
            walkProtoChain( parent, getDescriptor.bind( null, key, getset ) ),
            properties[ key ][ getset ]
          );
        }
      }
    }

    if ( superTest.test( options.init ) ) {
      options.init = superWrap( parent.init, options.init );
    }

    exports.prototype = Object.create( parent, properties );
    exports.prototype.constructor = options.init;
    exports.prototype.constructor.prototype = exports.prototype;

    for ( key in members ) {
      if ( typeof members[ key ] === 'function' && superTest.test( members[ key ] ) ) {
        members[ key ] = superWrap( parent[ key ], members[ key ] );
      }

      exports.prototype[ key ] = members[ key ];
    }

    var tmpMembers = Object.create( exports.prototype );
    var stack = potentiallyProblematicFuncs.slice(0);
    var funcInfo, funcName;
    var moreFuncMapper = function( elem ) {
      var callStack = funcInfo.callStack.slice(0);
      callStack.push( funcName );
      return {
        name: elem,
        // callStack: funcInfo.callStack.slice(0).push( funcName )
        callStack: callStack
      };
    };

    while ( (funcInfo = stack.pop()) != null ) {
      funcName = funcInfo.name;

      if ( funcInfo.callStack.indexOf( funcName ) !== -1 ) {
        continue;
      }

      var moreFuncs = findThisCalls( tmpMembers[ funcName ] );
      if ( moreFuncs.length ) {
        moreFuncs = moreFuncs.map( moreFuncMapper );
        Array.prototype.push.apply( potentiallyProblematicFuncs, moreFuncs );
        Array.prototype.push.apply( stack, moreFuncs );
      }
    }

    if ( potentiallyProblematicFuncs.length ) {
      potentiallyProblematicCtors.push( options.init );
      potentiallyProblematicDetails.push({
        funcs: potentiallyProblematicFuncs
      });
    }

    // If `init` is not specified within the `members` object…
    if ( !exports.prototype.hasOwnProperty( 'init' ) ) {
      // …but is defined separately, or no parent has an `init`…
      if ( options.init !== defaultInit || !exports.prototype.init ) {
        // …then assign the `init`.
        exports.prototype.init = options.init;
      }
    }

    for ( key in typeMembers ) {
      exports[ key ] = typeMembers[ key ];
    }

    if ( !exports.create ) {
      exports.create = function defaultCreate() {
        var o = Object.create( exports.prototype );
        o.init.apply( o, arguments );
        return o;
      };
    }

    exports.__uid__ = uid++;

    return exports;
  };

  Bump.TypedObject = Bump.type();

  Bump.Enum = function( values ) {
    var myEnum = {}, currentValue = 0;

    for ( var i = 0; i < values.length; ++i ) {
      if ( typeof values[i] === 'object' ) {
        var id = values[i].id || values[i].name || values[i].string;
        currentValue = Math.round( values[i].value ) || currentValue;
        myEnum[id] = currentValue;
      } else {
        myEnum[ values[i] ] = currentValue;
      }

      ++currentValue;
    }

    return myEnum;
  };

})( this, this.Bump );
