// **Bump.Quaternion** is the port of the `btQuaternion` class in
// [Bullet](http://bulletphysics.org). It implements
// [quaternions](http://en.wikipedia.org/wiki/Quaternion) in the physics engine.
//
// In Bullet, `btQuaternion` subclasses `btQuadWord`, which currently is only
// used in-engine by `btQuaternion`. They have been rolled together into one
// single class in this port.

(function( window, Bump ) {
  var tmpQ1, tmpQ2, tmpV1, tmpV2, tmpV3, EPSILON = Math.pow( 2, -52 );

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
      },

      // ### btQuaternion members

      // Sets `this` rotation given an `axis` and `angle` in radians.
      setRotation: function( axis, angle ) {
        var d = axis.length();
        // btAssert( d != 0 );
        var s = Math.sin( angle * 0.5 ) / d;
        return this.setValue( axis.x * s, axis.y * s, axis.z * s, Math.cos( angle * 0.5 ) );
      },

      // Sets `this` rotation given `yaw`, `pitch`, and `roll` Euler angles.
      setEuler: function( yaw, pitch, roll ) {
        var halfYaw = yaw * 0.5,
            halfPitch = pitch * 0.5,
            halfRoll = roll * 0.5,
            cosYaw = Math.cos( halfYaw ),
            sinYaw = Math.sin( halfYaw ),
            cosPitch = Math.cos( halfPitch ),
            sinPitch = Math.sin( halfPitch ),
            cosRoll = Math.cos( halfRoll ),
            sinRoll = Math.sin( halfRoll );

        this.setValue(
          cosRoll * sinPitch * cosYaw + sinRoll * cosPitch * sinYaw,
          cosRoll * cosPitch * sinYaw - sinRoll * sinPitch * cosYaw,
          sinRoll * cosPitch * cosYaw - cosRoll * sinPitch * sinYaw,
          cosRoll * cosPitch * cosYaw + sinRoll * sinPitch * sinYaw
        );
      },

      setEulerZYX: function( yaw, pitch, roll ) {
        var halfYaw = yaw * 0.5,
            halfPitch = pitch * 0.5,
            halfRoll = roll * 0.5,
            cosYaw = Math.cos( halfYaw ),
            sinYaw = Math.sin( halfYaw ),
            cosPitch = Math.cos( halfPitch ),
            sinPitch = Math.sin( halfPitch ),
            cosRoll = Math.cos( halfRoll ),
            sinRoll = Math.sin( halfRoll );

        this.setValue(
          sinRoll * cosPitch * cosYaw - cosRoll * sinPitch * sinYaw, // x
          cosRoll * sinPitch * cosYaw + sinRoll * cosPitch * sinYaw, // y
          cosRoll * cosPitch * sinYaw - sinRoll * sinPitch * cosYaw, // z
          cosRoll * cosPitch * cosYaw + sinRoll * sinPitch * sinYaw  // formerly yzx
        );
      },

      // ### Math operator functions

      // Negates each element and stores the resulting quaternion in `dest`.
      negate: function( dest ) {
        dest = dest || Bump.Quaternion.create();
        return dest.setValue( -this.x, -this.y, -this.z, -this.w );
      },

      add: function( quat, dest ) {
        dest = dest || Bump.Quaternion.create();
        return dest.setValue(
          this.x + quat.x,
          this.y + quat.y,
          this.z + quat.z,
          this.w + quat.w
        );
      },

      addSelf: function( quat ) {
        return this.setValue(
          this.x + quat.x,
          this.y + quat.y,
          this.z + quat.z,
          this.w + quat.w
        );
      },

      subtract: function( quat, dest ) {
        dest = dest || Bump.Quaternion.create();
        return dest.setValue(
          this.x - quat.x,
          this.y - quat.y,
          this.z - quat.z,
          this.w - quat.w
        );
      },

      subtractSelf: function( quat ) {
        return this.setValue(
          this.x - quat.x,
          this.y - quat.y,
          this.z - quat.z,
          this.w - quat.w
        );
      },

      multiplyQuaternion: function( quat, dest ) {
        dest = dest || Bump.Quaternion.create();
        return dest.setValue(
          this.w * quat.x + this.x * quat.w + this.y * quat.z - this.z * quat.y,
          this.w * quat.y + this.y * quat.w + this.z * quat.x - this.x * quat.z,
          this.w * quat.z + this.z * quat.w + this.x * quat.y - this.y * quat.x,
          this.w * quat.w - this.x * quat.x - this.y * quat.y - this.z * quat.z
        );
      },

      multiplyQuaternionSelf: function( quat ) {
        return this.setValue(
          this.w * quat.x + this.x * quat.w + this.y * quat.z - this.z * quat.y,
          this.w * quat.y + this.y * quat.w + this.z * quat.x - this.x * quat.z,
          this.w * quat.z + this.z * quat.w + this.x * quat.y - this.y * quat.x,
          this.w * quat.w - this.x * quat.x - this.y * quat.y - this.z * quat.z
        );
      },

      multiplyVector: function( vec, dest ) {
        dest = dest || Bump.Quaternion.create();
        return dest.setValue(
          this.w * vec.x + this.y * vec.z - this.z * vec.y,
          this.w * vec.y + this.z * vec.x - this.x * vec.z,
          this.w * vec.z + this.x * vec.y - this.y * vec.x,
          -this.x * vec.x - this.y * vec.y - this.z * vec.z
        );
      },

      vectorMultiply: function( vec, dest ) {
        dest = dest || Bump.Quaternion.create();
        return dest.setValue(
          vec.x * this.w + vec.y * this.z - vec.z * this.y,
          vec.y * this.w + vec.z * this.x - vec.x * this.z,
          vec.z * this.w + vec.x * this.y - vec.y * this.x,
          -vec.x * this.x - vec.y * this.y - vec.z * this.z
        );
      },

      multiplyScalar: function( s, dest ) {
        dest = dest || Bump.Quaternion.create();
        return dest.setValue( this.x * s, this.y * s, this.z * s, this.w * s );
      },

      multiplyScalarSelf: function( s ) {
        return this.setValue( this.x * s, this.y * s, this.z * s, this.w * s );
      },

      divideScalar: function( s, dest ) {
        // btAssert( s !== 0 );
        dest = dest || Bump.Quaternion.create();
        var i = 1 / s;
        return dest.setValue( this.x * i, this.y * i, this.z * i, this.w * i );
      },

      divideScalarSelf: function( s ) {
        // btAssert( s !== 0 );
        var i = 1 / s;
        return this.setValue( this.x * i, this.y * i, this.z * i, this.w * i );
      },

      // ### Other math functions

      dot: function( quat ) {
        return this.x * quat.x + this.y * quat.y + this.z * quat.z + this.w * quat.w;
      },

      length2: function() {
        return this.dot( this );
      },

      length: function() {
        return Math.sqrt( this.length2() );
      },

      normalized: function( dest ) {
        dest = dest || Bump.Quaternion.create();
        return this.divideScalar( this.length(), dest );
      },

      normalize: function() {
        return this.divideScalarSelf( this.length() );
      },

      // Get the angle between `this` quaternion and the quaternion `quat`.
      angle: function( quat ) {
        var s = Math.sqrt( this.length2() * quat.length2() );
        // btAssert( s !== 0 );
        return Math.acos( this.dot( quat ) / s );
      },

      // Get the angle of rotation represented by `this` quaternion.
      getAngle: function() {
        return 2 * Math.acos( this.w );
      },

      // Get the axis of the rotation represented by `this` quaternion.
      getAxis: function( dest ) {
        dest = dest || Bump.Vector3.create();
        var s_squared = 1 - this.w * this.w;

        // Check for divide by zero
        if ( s_squared < 10 * EPSILON ) {
          // Arbitrary
          return dest.setValue( 1, 0, 0 );
        }

        var s = 1 / Math.sqrt( s_squared );
        return dest.setValue( this.x * s, this.y * s, this.z * s );
      },

      inverse: function( dest ) {
        dest = dest || Bump.Quaternion.create();
        return dest.setValue( -this.x, -this.y, -this.z, this.w );
      },

      // ## Utility functions

      farthest: function( quat, dest ) {
        dest = dest || Bump.Quaternion.create();

        var diff = tmpQ1, sum = tmpQ2;
        this.subtract( quat, diff );
        this.add( quat, sum );
        if ( diff.dot( diff ) > sum.dot( sum ) ) {
          return quat.clone( dest );
        }
        return quat.negate( dest );
      },

      nearest: function( quat, dest ) {
        dest = dest || Bump.Quaternion.create();

        var diff = tmpQ1, sum = tmpQ2;
        this.subtract( quat, diff );
        this.add( quat, sum );
        if( diff.dot( diff ) < sum.dot( sum ) ) {
          return quat.clone( dest );
        }
        return quat.negate( dest );
      },

      slerp: function( quat, t, dest ) {
        dest = dest || Bump.Quaternion.create();

        var theta = this.angle( quat );
        if ( theta !== 0 ) {
          var d = 1 / Math.sin( theta ),
              s0 = Math.sin( ( 1 - t ) * theta ),
              s1 = Math.sin( t * theta );

          // Take care of long angle case.
          // See [Slerp](http://en.wikipedia.org/wiki/Slerp).
          if ( this.dot( quat ) < 0 ) {
            return dest.setValue(
              ( this.x * s0 + -quat.x * s1 ) * d,
              ( this.y * s0 + -quat.y * s1 ) * d,
              ( this.z * s0 + -quat.z * s1 ) * d,
              ( this.w * s0 + -quat.w * s1 ) * d
            );
          }

          return dest.setValue(
            ( this.x * s0 + quat.x * s1 ) * d,
            ( this.y * s0 + quat.y * s1 ) * d,
            ( this.z * s0 + quat.z * s1 ) * d,
            ( this.w * s0 + quat.w * s1 ) * d
          );
        }

        return this.clone( dest );
      }
    },

    // ## Static methods
    typeMembers: {

      // ### Constructors

      // Given *up to* four arguments, **creates** a new quaternion.
      create: function( x, y, z, w ) {
        var quat = Object.create( Bump.Quaternion.prototype );
        quat.init( x || 0, y || 0, z || 0, w || 0 );
        return quat;
      },

      createWithAxisAngle: function( axis, angle ) {
        var d = axis.length();
        // btAssert( d !== 0 );
        var s = Math.sin( angle * 0.5 ) / d,
            quat = Object.create( Bump.Quaternion.prototype );

        quat.init( axis.x * s, axis.y * s, axis.z * s, Math.cos( angle * 0.5 ) );
        return quat;
      },

      getIdentity: function() {
        var quat = Object.create( Bump.Quaternion.prototype );
        quat.init( 0, 0, 0, 1 );
        return quat;
      },

      // **Creates** a new quaternion and copies the given quaternion to it.
      clone: function( quat ) {
        var newQuat = Object.create( Bump.Quaternion.prototype );
        newQuat.init( quat.x, quat.y, quat.z, quat.w );
        return newQuat;
      },

      dot: function( q1, q2 ) {
        return q1.dot( q2 );
      },

      length: function( quat ) {
        return quat.length();
      },

      angle: function( q1, q2 ) {
        return q1.angle( q2 );
      },

      inverse: function( quat ) {
        return quat.inverse();
      },

      slerp: function( q1, q2, t ) {
        return q1.slerp( q2, t );
      },

      quatRotation: function( rotation, v, dest ) {
        dest = dest || Bump.Vector3.create();

        var q = rotation.multiplyVector( v, tmpQ1 );
        q.multiplyQuaternionSelf( rotation.inverse( tmpQ2 ) );
        return dest.setValue( q.x, q.y, q.z );
      },

      shortestArcQuat: function( v0, v1, dest ) {
        dest = dest || Bump.Quaternion.create();

        var c = v0.cross( v1, tmpV1 ),
            d = v0.dot( v1 );

        if ( d < -1 + EPSILON ) {
          var n = tmpV2, unused = tmpV3;
          Bump.PlaneSpace1( v0, n, unused );
          // Just pick any vector that is orthogonal to `v0`.
          return dest.setValue( n.x, n.y, n.z, 0 );
        }

        var s = Math.sqrt( ( 1 + d ) * 2 ),
            rs = 1 / s;

        return dest.setValue( c.x * rs, c.y * rs, c.z * rs, s * 0.5 );
      },

      shortestArcQuatNormalize2: function( v0, v1, dest ) {
        v0.normalize();
        v1.normalize();
        return this.shortestArcQuat( v0, v1, dest );
      }
    }
  });

  // Setup temporary variables
  tmpQ1 = Bump.Quaternion.create();
  tmpQ2 = Bump.Quaternion.create();
  tmpV1 = Bump.Vector3.create();
  tmpV2 = Bump.Vector3.create();
  tmpV3 = Bump.Vector3.create();
})( this, this.Bump );
