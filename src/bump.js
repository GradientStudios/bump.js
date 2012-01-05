// file for generic inheritance code and some base classes

// the main library object
this.Bump = {};

(function( window, Bump ) {

  Bump.noop = function noop() {};

  function superWrap( superFunc, newFunc ) {
    if ( superFunc == null ) {
      throw {
        short: 'no parent function',
        message: 'trying to access _super function without parent or function in parent'
      };
    }

    return function superWrappedFunc() {
      var ret, tmp = this._super;

      this._super = superFunc;
      ret = newFunc.apply( this, arguments );
      this._super = tmp;

      return ret;
    };
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

})( this, this.Bump );
