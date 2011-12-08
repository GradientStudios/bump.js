// file for generic inheritance code and some base classes

// the main library object
this.Bump = {};

(function( window, Bump ) {

  // The type function will be used for object inheritance.
  // Objects are instantiated with Object.create()
  Bump.type = function type( options ) {
    var exports = options.constructor || {},
        properties = options.properties || {},
        typeMethods = options.typeMethods || {},
        key;

    exports.prototype = Object.create(
      ( options.parent || {} ).prototype,
      properties );

    for ( key in members ) {
      exports.prototype[key] = members[key];
    }

    if ( !exports.prototype.init ) {
      exports.prototype.init = function() {};
    }

    for ( key in typeMethods ) {
      exports[key] = typeMethods[key];
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

})(this, this.Bump);