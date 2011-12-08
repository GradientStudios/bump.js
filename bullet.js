// file for generic inheritance code and some base classes

// the main library object
this.Bump = {};

(function( window, Bump ) {

  // The type function will be used for object inheritance.
  // Objects are instantiated with Object.create()
  Bump.type = function( options ) {
    var exports = {}, key;

    properties = properties || {};
    objectMembers = objectMembers || {};

    exports.prototype = Object.create( (options.parent || {}).prototype, options.properties || {} );

    for ( key in members ) {
      exports.prototype[key] = members[key];
    }

    if ( !exports.prototype.init ) {
      exports.prototype.init = function() {};
    }

    for ( key in objectMembers ) {
      exports[key] = objectMembers[key];
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

  Bump.btTypedObject = Bump.type( {}, {
    init: function() {
    }
  });


})(this, this.Bump);