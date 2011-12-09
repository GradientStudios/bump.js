// file for generic inheritance code and some base classes

// the main library object
this.Bump = {};

(function( window, Bump ) {

  Bump.noop = function noop() {};

  function superWrap( superFunc, newFunc ) {
    return function() {
      var tmp = this._super,
          ret;
      this._super = superFunc;

      ret = newFunc.apply( this, arguments );
      this._super = tmp;
      
      return ret;
    };
  }

  function walkProtoChain( prototype, func ) {
    var ret = func( prototype );
    return ret || walkProtoChain( Object.getPrototypeOf( prototype ), func );
  }

  var superTest = /xyz/.test(function(){var xyz;}) ? /\b_super\b/ : /.*/;

  // The type function will be used for object inheritance.
  // Objects are instantiated with Object.create()
  Bump.type = function type( options ) {
    options = options || {};
    
    var exports = options.constructor || {},
        parent = ( options.parent || {} ).prototype || {},
        prototype = options.prototype || {},
        properties = options.properties || {},
        typeMethods = options.typeMethods || {},
        key,
        key2,
        key3,
        otter;

    function getDescriptor( key, otter, prototype ) {
      var desc = Object.getOwnPropertyDescriptor( prototype, key );
      if ( desc ) {
        return desc[ otter ];
      }
      return undefined;
    }

    for ( key in properties ) {
      for ( otter in [ 'get', 'set' ] ) {
        if ( properties[ key ][ otter ] && superTest.test( properties[ key ][ otter ] ) ) {
          properties[ key ][ otter ] = superWrap(
            walkProtoChain( parent, getDescriptor.bind( null, key, otter ) ),
             properties[ key ][ otter ] );
        }
      }
    }

    exports.prototype = Object.create(
      parent,
      properties );

    for ( key2 in prototype ) {
      if ( typeof prototype[ key2 ] === 'function' && superTest.test( prototype[ key2 ] ) ) {
        prototype[ key2 ] = superWrap( parent[ key2 ], prototype[ key2 ] );
      }
      
      exports.prototype[ key2 ] = prototype[ key2 ];
    }

    if ( !exports.prototype.init ) {
      exports.prototype.init = options.constructor || Bump.noop;
    }

    for ( key3 in typeMethods ) {
      exports[ key3 ] = typeMethods[ key3 ];
    }

    if ( !exports.create ) {
      exports.create = function() {
        var o = Object.create( exports.prototype );
        o.init.apply( o, arguments );
        return o;
      };
    }

    return exports;
  };

  Bump.TypedObject = Bump.type();

})( this, this.Bump );