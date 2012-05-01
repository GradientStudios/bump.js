// file for generic inheritance code and some base classes

// the main library object
this.Bump = {};

(function( window, Bump ) {

  Bump.INCOMPLETE_IMPLEMENTATION = true;

  Bump.noop = function noop() {};
  Bump.abstract = function abstract() {
    Bump.Assert( false );
  };
  Bump.notImplemented = function() {
    console.log( 'Not implemented (yet)!' );
  };

  // This regex is not exhaustive, but will not return false positives.
  var functionNameTest = /^function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/;

  function superWrap( superFunc, newFunc ) {
    if ( superFunc == null ) {
      throw {
        short: 'no parent function',
        message: 'trying to access _super function without parent or function in parent'
      };
    }

    var superWrappedFunc = function superWrappedFunc() {
      var ret;

      this._super = superFunc;
      ret = newFunc.apply( this, arguments );
      delete this._super;

      return ret;
    };

    var matches = functionNameTest.exec( newFunc );
    if ( matches !== null ) {
      var functionName = matches[1];
      var superWrappedFuncBody = superWrappedFunc.toString();
      var newFuncBody = superWrappedFuncBody.replace( 'superWrappedFunc', functionName );
      return eval( '(' + newFuncBody + ')' );
    }

    return superWrappedFunc;
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

    var idx = potentiallyProblematicCtors.indexOf( parent.init );
    if ( idx !== -1 ) {
      var badFuncs = potentiallyProblematicDetails[ idx ].funcs;
      for ( var i = 0; i < badFuncs.length; ++i ) {
        if ( badFuncs[i] in members ) {
          var parentFuncName = parent.init.name;
          var childFuncName = options.init.name;
          console.error( 'Bump.type: Ctor for ' + parentFuncName + ' calls ' + badFuncs[i] +
                         ' which is overridden in ' + childFuncName + '. This behavior ' +
                         'is inconsistent with behaviour in C++.' );
          break;
        }
      }
    }

    var potentiallyProblematicFuncs = findThisCalls( options.init );

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
    var funcName, stack = potentiallyProblematicFuncs.slice(0);
    while ( (funcName = stack.pop()) != null ) {
      var moreFuncs = findThisCalls( tmpMembers[ funcName ] );
      Array.prototype.push.apply( potentiallyProblematicFuncs, moreFuncs );
      Array.prototype.push.apply( stack, moreFuncs );
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
