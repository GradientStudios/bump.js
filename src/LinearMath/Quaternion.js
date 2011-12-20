// **Bump.Quaternion** is the port of the `btQuaternion` class in
// [Bullet](http://bulletphysics.org). It implements
// [quaternions](http://en.wikipedia.org/wiki/Quaternion) in the physics engine.
//
// In Bullet, `btQuaternion` subclasses `btQuadWord`, which currently is only
// used in-engine by `btQuaternion`. They have been rolled together into one
// single class in this port.

(function( window, Bump ) {
  var EPSILON = Math.pow( 2, -52 );

  Bump.Quaternion = Bump.type({
    // Given *exactly* four arguments, initializes a quaternion.
    init: function Quaternion( x, y, z, w ) {
      this.m_floats = [ x, y, z, w ];

      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
    },

    // ## Properties
    properties: {
      // The properties for 0, 1, 2, and 3 are used to emulate `btQuaternion`'s
      // `operator*` overload. This is purely for maintaining the interface, as
      // they are much slower. It is faster to access the properties directly on
      // the object.
      0: {
        get: function() { return this.x; },
        set: function( x ) {
          this.x = x;
          this.m_floats[0] = x;
        }
      },

      1: {
        get: function() { return this.y; },
        set: function( y ) {
          this.y = y;
          this.m_floats[1] = y;
        }
      },

      2: {
        get: function() { return this.z; },
        set: function( z ) {
          this.z = z;
          this.m_floats[2] = z;
        }
      },

      3: {
        get: function() { return this.w; },
        set: function( w ) {
          this.w = w;
          this.m_floats[3] = w;
        }
      }
    },

    // ## Member functions
    members: {
      // ### btQuadword members

      clone: function( dest ) {
        dest = dest || Bump.Quaternion.create();
        dest.x = this.x;
        dest.y = this.y;
        dest.z = this.z;
        dest.w = this.w;

        dest.m_floats[0] = this.m_floats[0];
        dest.m_floats[1] = this.m_floats[1];
        dest.m_floats[2] = this.m_floats[2];
        dest.m_floats[3] = this.m_floats[3];
        return dest;
      },

      getX: function() {
        return this.m_floats[0];
      },

      getY: function() {
        return this.m_floats[1];
      },

      getZ: function() {
        return this.m_floats[2];
      },

      getW: function() {
        return this.m_floats[3];
      },

      setX: function( x ) {
        this.m_floats[0] = x;
        this.x = x;
        return this;
      },

      setY: function( y ) {
        this.m_floats[1] = y;
        this.y = y;
        return this;
      },

      setZ: function( z ) {
        this.m_floats[2] = z;
        this.z = z;
        return this;
      },

      setW: function( w ) {
        this.m_floats[3] = w;
        this.w = w;
        return this;
      },

      equal: function( other ) {
        return this.x === other.x &&
          this.y === other.y &&
          this.z === other.z &&
          this.w === other.w;
      },

      notEqual: function( other ) {
        return this.x !== other.x ||
          this.y !== other.y ||
          this.z !== other.z ||
          this.w !== other.w;
      },

      setValue: function( x, y, z, w ) {
        this.x = this.m_floats[0] = x;
        this.y = this.m_floats[1] = y;
        this.z = this.m_floats[2] = z;
        this.w = this.m_floats[3] = w || 0;
        return this;
      },

      setMin: function( other ) {
        if ( other.x < this.x ) { this.x = other.x; }
        if ( other.y < this.y ) { this.y = other.y; }
        if ( other.z < this.z ) { this.z = other.z; }
        if ( other.w < this.w ) { this.w = other.w; }

        if ( other.m_floats[0] < this.m_floats[0] ) { this.m_floats[0] = other.m_floats[0]; }
        if ( other.m_floats[1] < this.m_floats[1] ) { this.m_floats[1] = other.m_floats[1]; }
        if ( other.m_floats[2] < this.m_floats[2] ) { this.m_floats[2] = other.m_floats[2]; }
        if ( other.m_floats[3] < this.m_floats[3] ) { this.m_floats[3] = other.m_floats[3]; }
        return this;
      },

      setMax: function( other ) {
        if ( other.x > this.x ) { this.x = other.x; }
        if ( other.y > this.y ) { this.y = other.y; }
        if ( other.z > this.z ) { this.z = other.z; }
        if ( other.w > this.w ) { this.w = other.w; }

        if ( other.m_floats[0] > this.m_floats[0] ) { this.m_floats[0] = other.m_floats[0]; }
        if ( other.m_floats[1] > this.m_floats[1] ) { this.m_floats[1] = other.m_floats[1]; }
        if ( other.m_floats[2] > this.m_floats[2] ) { this.m_floats[2] = other.m_floats[2]; }
        if ( other.m_floats[3] > this.m_floats[3] ) { this.m_floats[3] = other.m_floats[3]; }
        return this;
      }
    },

    // ## Static functions
    typeMembers: {
      // Given *up to* four arguments, **creates** a new quaternion.
      create: function( x, y, z, w ) {
        var quat = Object.create( Bump.Quaternion.prototype );
        quat.init( x || 0, y || 0, z || 0, w || 0 );
        return quat;
      },

      // **Creates** a new quaternion and copies the given quaternion to it.
      clone: function( quat ) {
        var newQuat = Object.create( Bump.Quaternion.prototype );
        newQuat.init( quat.x, quat.y, quat.z, quat.w );
        return newQuat;
      }
    }
  });
})( this, this.Bump );
