// **Bump.Transform** is the port of the `btTransform` class in
// [Bullet](http://bulletphysics.org).

(function( window, Bump ) {
  Bump.Transform = Bump.type({

    typeMembers: {
      // ## Constructors

      // Creates a new transform from a [Quaternion](Quaternion.html) `q` and an
      // optional [Vector3](vector3.html) `c` which represents the translation.
      create: function( q, c ) {
        var transform = Object.create( Bump.Transform.prototype );
        if ( !q ) {
          return transform._initEmpty();
        }

        return transform.init( q, c );
      },

      // Creates a clone of an `other` transform.
      clone: function( other ) {
        var transform = Object.create( Bump.Transform.prototype );
        transform._initEmpty();
        other.basis.clone( transform.basis );
        other.origin.clone( transform.origin );
        return transform;
      },

      getIdentity: function() {
        var transform = Object.create( Bump.Transform.prototype );
        transform._initEmpty();
        return transform.setIdentity();
      }
    },

    // ### Initialization
    // Used by the constructors. Not recommended for normal use.

    // Initialize `this` transform with a Quaternion and optional Vector3.
    init: function Transform( q, c ) {
      this.basis = Bump.Matrix3x3.createFromQuaternion( q );
      this.origin = ( c ? c.clone() : Bump.Vector3.create() );
      return this;
    },

    members: {
      // Initialize a transform with all zeros.
      _initEmpty: function Transform() {
        this.basis = Bump.Matrix3x3.create();
        this.origin = Bump.Vector3.create();
        return this;
      },

      // ## Members

      // Clones `this` transform to `dest`.
      clone: function( dest ) {
        dest = dest || Bump.Transform.create();
        this.basis.clone( dest.basis );
        this.origin.clone( dest.origin );
        return dest;
      },

      getOrigin: function() {
        return this.origin;
      },

      getBasis: function() {
        return this.basis;
      },

      getRotation: function( dest ) {
        return this.basis.getRotation( dest );
      },

      setOrigin: function( origin ) {
        origin.clone( this.origin );
        return this;
      },

      setBasis: function( basis ) {
        basis.clone( this.basis );
        return this;
      },

      setRotation: function( quat ) {
        this.basis.setRotation( quat );
        return this;
      },

      setIdentity: function() {
        this.basis.setIdentity();
        this.origin.setValue( 0, 0, 0 );
        return this;
      }
    }
  });
})( this, this.Bump );
