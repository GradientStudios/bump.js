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

  var superTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  // The type function will be used for object inheritance.
  // Objects are instantiated with Object.create()
  Bump.type = function type( options ) {
    options = options || {};
    
    var exports = options.constructor || {},
        parent = ( options.parent || {} ).prototype,
        prototype = options.prototype || {},
        properties = options.properties || {},
        typeMethods = options.typeMethods || {},
        key,
        otter;

    for ( key in properties ) {
      for ( otter in [ 'get', 'set' ] ) {
        if ( properties[ key ][ otter ] && superTest.test( properties[ key ][ otter ] ) ) {
          properties[ key ][ otter ] = superWrap( walkProtoChain( parent, function( prototype ) {
            var desc = Object.getOwnPropertyDescriptor( prototype, key );
            if ( desc ) {
              return desc.get;
            }
            return undefined;
          } ), properties[ key ][ otter ] );
        }
      }
    }

    exports.prototype = Object.create(
      parent,
      properties );

    for ( key in prototype ) {
      if ( typeof prototype[ key ] === 'function' && superTest.test( prototype[ key ] ) ) {
        prototype[ key ] = superWrap( parent[ key ], prototype[ key ] );
      }
      
      exports.prototype[ key ] = prototype[ key ];
    }

    if ( !exports.prototype.init ) {
      exports.prototype.init = options.constructor || Bump.noop;
    }

    for ( key in typeMethods ) {
      exports[ key ] = typeMethods[ key ];
    }

    if ( !exports.create ) {
      exports.create = function() {
        var o = Object.create( exports.prototype );
        o.init.apply( o, arguments );
        return o;
      };
    }

    return exports;
  }

  Bump.TypedObject = Bump.type();

})( this, this.Bump );