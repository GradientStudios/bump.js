/*
 * Vector3 provides vector math functionality with an API similar
 * to Three.js : Math operations are member functions that use the
 * context Vector3 object as the destination.
 */
(function( window, Bump ) {

  var trunc = function( v ) {
    return Math.floor( v * 1000 ) / 1000;
  };

  Bump.printVector3 = function( vec, message, precision ) {
    message = message || '';
    precision = ( precision === undefined ) ? 20 : precision;

    console.log( message + ' ' + vec.x.toFixed( precision ) + ' ' +
                 vec.y.toFixed( precision ) + ' ' +
                 vec.z.toFixed( precision ) );
  };

  Bump.Vector3 = Bump.type({

    init: function Vector3( x, y, z, w ) {
      this.x = x || 0;
      this.y = y || 0;
      this.z = z || 0;
      this.w = w || 0;
    },

    // ## Properties
    properties: {
      // The properties 0, 1, 2, 3 provide array-like access, emulating
      // `btVector3`'s `operator[]` overload.
      // Note that using these properties is much slower than accessing
      // the members directly or by name.

      0: {
        get: function() { return this.x; },
        set: function( v ) { this.x = v; }
      },

      1: {
        get: function() { return this.y; },
        set: function( v ) { this.y = v; }
      },

      2: {
        get: function() { return this.z; },
        set: function( v ) { this.z = v; }
      },

      3: {
        get: function() { return this.w; },
        set: function( v ) { this.w = v; }
      }
    },

    // ## Member functions
    members: {
      // ### JSON Helper

      // create a basic representation of btQuaternion for quick JSON stringify
      toJSON: function() {
        return [ trunc( this.x ), trunc( this.y ), trunc( this.z ) ];
      },

      // Clones `this` vector into `dest`. If `dest` is not provided,
      // a new Vector3 is created and returned.
      clone: function( dest ) {
        if ( dest ) {
          dest.x = this.x;
          dest.y = this.y;
          dest.z = this.z;
          dest.w = this.w;
          return dest;
        }
        return Bump.Vector3.create( this.x, this.y, this.z );
      },

      // Assigns `other` vector into `this` vector.
      assign: function( other ) {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
        this.w = other.w;
        return this;
      },

      // Add `this` to `vec`, storing the result in `dest` if provided.
      // If not, a new Vector3 is created and returned.
      // This function is analogous to `btVector3`'s `operator+`.
      add: function( vec, dest ) {
        if ( dest ) {
          dest.x = this.x + vec.x;
          dest.y = this.y + vec.y;
          dest.z = this.z + vec.z;
          return dest;
        }
        return Bump.Vector3.create( this.x + vec.x,
                                    this.y + vec.y,
                                    this.z + vec.z );
      },

      // Add `this` vector to `v`, storing the result in `this`.
      // This function is analogous to `btVector3`'s `operator+=`.
      addSelf: function( v ) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
      },

      // Subtract `vec` from `this`, storing thee result in `dest` if provided.
      // If not, a new Vector3 is created and returned.
      // This function is analogous to `btVector3`'s `operator-`.
      subtract: function( vec, dest ) {
        if ( dest ) {
          dest.x = this.x - vec.x;
          dest.y = this.y - vec.y;
          dest.z = this.z - vec.z;
          return dest;
        }
        return Bump.Vector3.create( this.x - vec.x,
                                    this.y - vec.y,
                                    this.z - vec.z );
      },

      // Subtract `v` from `this`, storing the result in `this`.
      // This function is analogous to `btVector3`'s `operator-=`.
      subtractSelf: function( v ) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
      },

      // Multiply `this` vector by the given `scalar`, storing result in `dest`
      // if provided. If not, a new Vector3 is created and returned.
      // This function is analogous to `btVector3`'s `operator*` for `btScalar`.
      multiplyScalar: function( scalar, dest ) {
        if ( dest ) {
          dest.x = this.x * scalar;
          dest.y = this.y * scalar;
          dest.z = this.z * scalar;
          return dest;
        }
        return Bump.Vector3.create( this.x * scalar,
                                    this.y * scalar,
                                    this.z * scalar );
      },

      // Multiply `this` by the given `scalar`, storing the result in `this`.
      // This function is analogous to `btVector3`'s `operator*=` for `btScalar`.
      multiplyScalarSelf: function( scalar ) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
      },

      // Performs element-wise multiplication, multiply the elements of `this` by
      // the corresponding elements of `vec`, and storing the result in `dest` if
      // provided. If not, a new Vector3 is created and returned.
      // This function is analogous to `btVector3`'s `operator*` for `btVector3`.
      multiplyVector: function( vec, dest ) {
        if ( dest ) {
          dest.x = this.x * vec.x;
          dest.y = this.y * vec.y;
          dest.z = this.z * vec.z;
          return dest;
        }
        return Bump.Vector3.create( this.x * vec.x,
                                    this.y * vec.y,
                                    this.z * vec.z );
      },

      // Performs in-place element-wise multiplication, multiply the elements of
      // `this` by the corresponding elements of `vec`, and storing the result
      // in `this`.
      // This function is analogous to `btVector3`'s `operator*=` for `btVector3`.
      multiplyVectorSelf: function( vec ) {
        this.x *= vec.x;
        this.y *= vec.y;
        this.z *= vec.z;
        return this;
      },

      // Divides `this` vector by the given `scalar`, storing the result in `dest`
      // if provided. If not, a new Vector3 is created and returned.
      // This function is analogous to `btVector3`'s `operator/` for `btScalar`.
      divideScalar: function( scalar, dest ) {
        if ( dest ) {
          dest.x = this.x / scalar;
          dest.y = this.y / scalar;
          dest.z = this.z / scalar;
          return dest;
        }
        return Bump.Vector3.create( this.x / scalar,
                                    this.y / scalar,
                                    this.z / scalar );
      },

      // Divides `this` vector by the given `scalar`, storing the result in `this`.
      // This function is analogous to `btVector3`'s `operator/=` for `btScalar`.
      divideScalarSelf: function( scalar ) {
        this.x /= scalar;
        this.y /= scalar;
        this.z /= scalar;
        return this;
      },

      // Performs element-wise division, dividing the elements of `this` by
      // the corresponding elements of `vec`, and storing the result in `dest` if
      // provided. If not, a new Vector3 is created and returned.
      // This function is analogous to `btVector3`'s `operator/` for `btVector3`.
      divideVector: function( vec, dest ) {
        if ( dest ) {
          dest.x = this.x / vec.x;
          dest.y = this.y / vec.y;
          dest.z = this.z / vec.z;
          return dest;
        }
        return Bump.Vector3.create( this.x / vec.x,
                                    this.y / vec.y,
                                    this.z / vec.z );
      },

      // Performs in-place element-wise division, dividing the elements of
      // `this` by the corresponding elements of `vec`, and storing the result
      // in `this`.
      // This function is analogous to `btVector3`'s `operator/=` for `btVector3`.
      divideVectorSelf: function( vec ) {
        this.x /= vec.x;
        this.y /= vec.y;
        this.z /= vec.z;
        return this;
      },

      // Computes and returns the dot product of `this` vector and `vec`.
      dot: function( vec ) {
        return this.x * vec.x + this.y * vec.y + this.z * vec.z;
      },

      // Computes and returns the squared magnitude of `this` vector.
      length2: function() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
      },

      // Computes and returns the magnitude of `this` vector.
      length: function() {
        return Math.sqrt( this.x * this.x +
                          this.y * this.y +
                          this.z * this.z );
      },

      // Computes and returns the squared distance between
      // `this` vector and `vec`.
      distance2: function( vec ) {
        return vec.subtract( this ).length2();
      },


      // Computes and returns the squared distance between
      // `this` vector and `vec`.
      distance: function( vec ) {
        return vec.subtract( this ).length();
      },

      // Normalizes `this` vector in place, safely checking for cases
      // of division by zero.
      safeNormalize: function( ) {
        // Altered slightly from `btVector3`'s original source to to
        // avoid index [] notation, which is slow.
        var absMax = this.absolute().max();

        if ( absMax > 0 ) {
          this.divideScalarSelf( absMax );
          return this.divideScalarSelf( this.length() );
        }
        this.setValue( 1, 0, 0 );
        return this;
      },

      // Normalizes `this` vector in place.
      normalize: function( ) {
        return this.divideScalarSelf( this.length() );
      },

      // Computes normalized version of `this` vector, stores result in
      // `dest` if provided. If not, creates and returns new Vector3.
      normalized: function( dest ) {
        // divide function will check if dest is null
        return this.divideScalar( this.length(), dest );
      },

      // Returns a rotated version of `this` vector, rotating around `wAxis` by `angle`.
      // Stores result in `dest` if provided. If not, creates and returns a new Vector3.
      rotate: function( wAxis, angle, dest ) {
        // wAxis must be a unit length vector
        var o = wAxis.multiplyScalar( wAxis.dot( this ), dest ), // new temp if dest unspecified
        x = this.subtract( o ).multiplyScalarSelf( Math.cos( angle ) ), // new temp
        y = wAxis.cross( this ).multiplyScalarSelf( Math.sin( angle ) ); // new temp

        return o.addSelf( x.add( y ) );
      },

      // Returns angle between `this` vector and `vec`.
      angle: function( v ) {
        var s = Math.sqrt( this.length2() * v.length2() );
        // btFullAssert( s != 0.0 )
        return Math.acos( this.dot( v ) / s );
      },

      // Negates the elements of `this` vector and returns it. Corresponds to
      // the unary operator `operator-`.
      negate: function( dest ) {
        if ( dest ) {
          dest.x = -this.x;
          dest.y = -this.y;
          dest.z = -this.z;

          return dest;
        }

        return Bump.Vector3.create( -this.x, -this.y, -this.z );
      },

      // Returns a Vector3 with the absolute values of `this` vector's elements.
      // Stores the result in `dest` if provided. If not, a new Vector3 is
      // created and returned.
      absolute: function( dest ) {
        if ( dest ) {
          dest.x = Math.abs( this.x );
          dest.y = Math.abs( this.y );
          dest.z = Math.abs( this.z );

          return dest;
        }
        return Bump.Vector3.create( Math.abs( this.x ),
                                    Math.abs( this.y ),
                                    Math.abs( this.z ) );
      },

      // Computes the cross product of `this` and `vec`, storing the result in
      // `dest` if provided. If not a new Vector3 is created and returned.
      // Note that this will fail if `dest` === `this`. Instead, use the
      // `crossSelf` function.
      cross: function( vec, dest ) {
        if ( dest ) {
          return dest.setValue(
            this.y * vec.z - this.z * vec.y,
            this.z * vec.x - this.x * vec.z,
            this.x * vec.y - this.y * vec.x
          );
        }

        return Bump.Vector3.create(
          this.y * vec.z - this.z * vec.y,
          this.z * vec.x - this.x * vec.z,
          this.x * vec.y - this.y * vec.x
        );
      },

      // Computes the cross product of `this` and `vec`, storing the result
      // in `this`. This function is not a part of the original `btVector3`.
      crossSelf: function( vec ) {
        var x = this.y * vec.z - this.z * vec.y,
        y = this.z * vec.x - this.x * vec.z,
        z = this.x * vec.y - this.y * vec.x;

        this.x = x;
        this.y = y;
        this.z = z;

        return this;
      },

      // Returns the triple scalar product between `this`, `vec`, and `vec2`.
      triple: function( vec, vec2 ) {
        return this.x * ( vec.y * vec2.z - vec.z * vec2.y ) +
          this.y * ( vec.z * vec2.x - vec.x * vec2.z ) +
          this.z * ( vec.x * vec2.y - vec.y * vec2.x );
      },

      // Returns the array index (0, 1, or 2) of the minimum value in `this`.
      // Note that accessing vector properties using [] notation is slow and
      // should be avoided.
      minAxis: function() {
        return this.x < this.y ?
          ( this.x < this.z ? 0 : 2 ) :
          ( this.y < this.z ? 1 : 2 );
      },

      // Returns the member name ('x', 'y', 'z') of the minimum value in `this`.
      // This function was added because property access by name is faster than
      // by array index.
      minProperty: function() {
        return this.x < this.y ?
          ( this.x < this.z ? 'x' : 'z' ) :
          ( this.y < this.z ? 'y' : 'z' );
      },

      // Returns the minimum value stored in `this`, (not considering w).
      min: function() {
        return this.x < this.y ?
          ( this.x < this.z ? this.x : this.z ) :
          ( this.y < this.z ? this.y : this.z );
      },

      // Returns the array index (0, 1, or 2) of the maximum value in `this`.
      // Note that accessing vector properties using [] notation is slow and
      // should be avoided.
      maxAxis: function() {
        return this.x < this.y ?
          ( this.y < this.z ? 2 : 1 ) :
          ( this.x < this.z ? 2 : 0 );
      },

      // Returns the member name ('x', 'y', 'z') of the maximum value in `this`.
      // This function was added because property access by name is faster than
      // by array index.
      maxProperty: function() {
        return this.x < this.y ?
          ( this.y < this.z ? 'z' : 'y' ) :
          ( this.x < this.z ? 'z' : 'x' );
      },

      // Returns the maximum value stored in `this`.
      max: function() {
        return this.x > this.y ?
          ( this.x > this.z ? this.x : this.z ) :
          ( this.y > this.z ? this.y : this.z );
      },

      /* Note: the furthestAxis and closestAxis functions seem
       *  backwards...
       */
      // Returns the array index (0, 1, or 2) of the "furthest" value in `this`,
      // which `btVector3` defines as the axis with the least absolute value.
      // Note that accessing vector properties using [] notation is slow and
      // should be avoided.
      furthestAxis: function() {
        return this.absolute().minAxis();
      },

      // Returns the "furthest" value stored in `this`.
      furthest: function() {
        return this.absolute().min();
      },

      // Returns the array index (0, 1, or 2) of the "closest" value in `this`,
      // which `btVector3` defines as the axis with the greatest absolute value.
      // Note that accessing vector properties using [] notation is slow and
      // should be avoided.
      closestAxis: function() {
        return this.absolute().maxAxis();
      },

      // Returns the "closest" value stored in `this`.
      closest: function() {
        return this.absolute().max();
      },

      // Linearly interpolate between the vectors `vec` and `vec2`, using `rt`
      // as the weight of `vec`. The result is stored in `this`.
      setInterpolate3: function( vec, vec2, rt ) {
        var s = 1 - rt;
        this.x = s * vec.x + rt * vec2.x;
        this.y = s * vec.y + rt * vec2.y;
        this.z = s * vec.z + rt * vec2.z;

        return this;
      },

      // Linearly interpolates between `this` and `vec`, using t as the weight
      // of 'vec'. Stores the result in dest if provided. If not, a new Vector3
      // is created and returned.
      lerp: function( vec, t, dest ) {
        if ( dest ) {
          dest.x = this.x + ( vec.x - this.x ) * t;
          dest.y = this.y + ( vec.y - this.y ) * t;
          dest.z = this.z + ( vec.z - this.z ) * t;
          return dest;
        }

        return Bump.Vector3.create( this.x + ( vec.x - this.x ) * t,
                                    this.y + ( vec.y - this.y ) * t,
                                    this.z + ( vec.z - this.z ) * t );
      },

      // Perform element-wise comparison of `this` and `vec` and return true if
      // the two vectors are equal.
      // This function is analogous to `btVector3`'s `operator==`.
      // Note that values are compared directly, with no consideration of floating point
      // rounding errors. Also note that the comparison ignores w values.
      equal: function( vec ) {
        return ( this.x == vec.x ) && ( this.y == vec.y ) && ( this.z == vec.z );
      },

      // Perform element-wise comparison of `this` and `vec`, and return true if
      // the two vectors are not equal.
      // This function is analogous to `btVector3`'s `operator!=`.
      // Note that values are compared directly, with no consideration of floating point
      // rounding errors. Also note that the comparison ignores w values.
      notEqual: function( vec ) {
        return ( this.x != vec.x ) || ( this.y != vec.y ) || ( this.z != vec.z );
      },

      // Clamp each value of `this` to be less than or equal to the maximum value
      // specified by the corresponding element of `vec`.
      setMax: function( vec ) {
        this.x = Math.max( this.x, vec.x );
        this.y = Math.max( this.y, vec.y );
        this.z = Math.max( this.z, vec.z );
        this.w = Math.max( this.w, vec.w );

        return this;
      },

      // Clamp each value of `this` to be greater than or equal to the minimum
      // value specified by the corresponding element of `vec`.
      setMin: function( vec ) {
        this.x = Math.min( this.x, vec.x );
        this.y = Math.min( this.y, vec.y );
        this.z = Math.min( this.z, vec.z );
        this.w = Math.min( this.w, vec.w );

        return this;
      },

      // Set the elements of `this` equal to the specified `x`, `y`, `z` values.
      // Note that this also sets `this.w` to 0.
      setValue: function( x, y, z ) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = 0;

        return this;
      },

      // Set the column vectors `v0`, `v1`, and `v2` equal to the columns of
      // the skew symmetric matrix defined by `this` as follows:
      //
      //     ┌                ┐    ┌                           ┐
      //     │ v0.x v1.x v2.x │    │ 0        this.z   -this.y │
      //     │ v0.y v1.y v2.y │ =  │ -this.z  0        this.x  │
      //     │ v0.z v1.z v2.z │    │ this.y   -this.x  0       │
      //     └                ┘    └                           ┘
      //
      getSkewSymmetricMatrix: function( v0, v1, v2 ) {
        v0.setValue( 0, -this.z, this.y );
        v1.setValue( this.z, 0, -this.x );
        v2.setValue( -this.y, this.x, 0 );
      },

      // Set the values of `this` matrix to 0, including w.
      setZero: function() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 0;

        return this;
      },

      // Return true if all elements of `this` matrix are 0.
      // Note that this does not include w.
      isZero: function() {
        return ( this.x === 0 ) && ( this.y === 0 ) && ( this.z === 0 );
      },

      // Return true if `this` vector is "close" to zero, meaning that
      // its squared magnitude is less than `Bump.SIMD_EPSILON`.
      fuzzyZero: function() {
        return this.length2() < Bump.SIMD_EPSILON;
      },

      toString: function() {
        var precision = 6;
        return ( '{ x: ' + this.x.toFixed( precision ) +
                 ', y: ' + this.y.toFixed( precision ) +
                 ', z: ' + this.z.toFixed( precision ) +
                 ' }' );
      }
    },

    // ## Type member functions
    typeMembers: {

      // Create and return a clone of `vec`.
      clone: function( vec ) {
        return this.create( vec.x, vec.y, vec.z );
      }
    }
  });

  var tmpVec41;

  Bump.Vector4 = Bump.type({
    parent: Bump.Vector3,

    init: function Vector4( x, y, z, w ) {
      this._super( x, y, z, w );
    },

    members: {
      clone: function( dest ) {
        dest = dest || Bump.Vector4.create();

        return dest.setValue( this.x, this.y, this.z, this.w );
      },

      absolute4: function( dest ) {
        dest = dest || Bump.Vector4.create();
        return dest.setValue(
          Math.abs( this.x ),
          Math.abs( this.y ),
          Math.abs( this.z ),
          Math.abs( this.w )
        );
      },

      getW: function() {
        return this.w;
      },

      maxAxis4: function() {
        var maxIndex = -1,
            maxVal = -Infinity;

        if ( this.x > maxVal ) {
          maxIndex = 0;
          maxVal = this.x;
        }
        if ( this.y > maxVal ) {
          maxIndex = 1;
          maxVal = this.y;
        }
        if ( this.z > maxVal ) {
          maxIndex = 2;
          maxVal =this.z;
        }
        if ( this.w > maxVal ) {
          maxIndex = 3;
          maxVal = this.w;
        }
        return maxIndex;
      },

      minAxis4: function() {
        var minIndex = -1,
            minVal = Infinity;

        if ( this.x < minVal ) {
          minIndex = 0;
          minVal = this.x;
        }
        if ( this.y < minVal ) {
          minIndex = 1;
          minVal = this.y;
        }
        if ( this.z < minVal ) {
          minIndex = 2;
          minVal =this.z;
        }
        if ( this.w < minVal ) {
          minIndex = 3;
          minVal = this.w;
        }

        return minIndex;
      },

      // Uses the following temporary variables:
      //
      // - `tmpVec41`
      closestAxis4: function() {
        return this.absolute4( tmpVec41 ).maxAxis4();
      },

      setValue: function( x, y, z, w ) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;

        return this;
      }
    }
  });

  tmpVec41 = Bump.Vector4.create();

  // PlaneSpace1 optimized for Vector3s
  Bump.PlaneSpace1Vector3 = function( n, p, q ) {
    var n0 = n.x;
    var n1 = n.y;
    var n2 = n.z;

    var a, k;

    if ( Math.abs( n2 ) > Bump.SIMDSQRT12 ) {
      // Choose p in y-z plane.
      a = n1 * n1 + n2 * n2;
      k = Bump.RecipSqrt( a );

      p.x = 0;
      p.y = -n2 * k;
      p.z = n1 * k;
      // Set `q = n x p`.
      q.x = a * k;
      q.y = -n0 * p.z;
      q.z = n0 * p.y;
    } else {
      // Choose p in x-y plane.
      a = n0 * n0 + n1 * n1;
      k = Bump.RecipSqrt( a );
      p.x = -n1 * k;
      p.y = n0 * k;
      p.z = 0;
      // Set `q = n x p`.
      q.x = -n2 * p.y;
      q.y = n2 * p.x;
      q.z = a * k;
    }
  };

  Bump.PlaneSpace1 = function( n, p, q ) {
    var n0 = n[0];
    var n1 = n[1];
    var n2 = n[2];

    var a, k;

    if ( Math.abs( n2 ) > Bump.SIMDSQRT12 ) {
      // Choose p in y-z plane.
      a = n1 * n1 + n2 * n2;
      k = Bump.RecipSqrt( a );

      p[0] = 0;
      p[1] = -n2 * k;
      p[2] = n1 * k;
      // Set `q = n x p`.
      q[0] = a * k;
      q[1] = -n0 * p[2];
      q[2] = n0 * p[1];
    } else {
      // Choose p in x-y plane.
      a = n0 * n0 + n1 * n1;
      k = Bump.RecipSqrt( a );
      p[0] = -n1 * k;
      p[1] = n0 * k;
      p[2] = 0;
      // Set `q = n x p`.
      q[0] = -n2 * p[1];
      q[1] = n2 * p[0];
      q[2] = a * k;
    }
  };

})( this, this.Bump );
