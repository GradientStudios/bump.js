/*
 * Vector3 provides vector math functionality with an API similar
 * to Three.js : Math operations are member functions that use the
 * context Vector3 object as the destination.
 */
(function( window, Bump ) {

  Bump.SIMD_EPSILON = Math.pow(2, -52);

  Bump.Vector3 = Bump.type( {

    init: function( x, y, z, w ) {
      this.x = x || 0;
      this.y = y || 0;
      this.z = z || 0;
      this.w = w || 0;
    },

    /* Adding properties 0, 1, 2, 3 to provide array-like access.
     * Note that using these properties is much slower than accessing
     * the members directly.
     */
    properties: {
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

    members: {

      clone: function( v ) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        this.w = 0;
        return this;
      },

      // add this to v, return result in dest if provided
      // if not, a new vector3 is created and returned
      add: function( vec, dest ) {
        if( dest ) {
          dest.x = this.x + vec.x;
          dest.y = this.y + vec.y;
          dest.z = this.z + vec.z;
          return dest;
        }
        return Bump.Vector3.create( this.x + vec.x,
                                    this.y + vec.y,
                                    this.z + vec.z );
      },

      // this = this + v
      addSelf: function( v ) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
      },

      subtract: function( vec, dest ) {
        if( dest ) {
          dest.x = this.x - vec.x;
          dest.y = this.y - vec.y;
          dest.z = this.z - vec.z;
          return dest;
        }
        return Bump.Vector3.create( this.x - vec.x,
                                    this.y - vec.y,
                                    this.z - vec.z );
      },

      // subtract v from this, return result in dest if provided
      // if not, a new vector3 is created and returned
      subtractSelf: function( v ) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
      },

      // multiply this by scalar
      // store result in dest if provided, create new vector3 if not
      multiply: function( scalar, dest ) {
        if( dest ) {
          dest.x = this.x * scalar;
          dest.y = this.y * scalar;
          dest.z = this.z * scalar;
          return dest;
        }
        return Bump.Vector3.create( this.x * scalar,
                                    this.y * scalar,
                                    this.z * scalar );
      },

      multiplySelf: function( scalar ) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
      },

      // element-wise multiplication: multiply this by the elements of vec
      // store result in dest if provided, create new vector3 if not
      scale: function( vec, dest ) {
        if( dest ) {
          dest.x = this.x * vec.x;
          dest.y = this.y * vec.y;
          dest.z = this.z * vec.z;
          return dest;
        }
        return Bump.Vector3.create( this.x * vec.x,
                                    this.y * vec.y,
                                    this.z * vec.z );
      },

      // element-wise multiplication in place: this = this * vec
      scaleSelf: function( vec ) {
        this.x *= vec.x;
        this.y *= vec.y;
        this.z *= vec.z;
        return this;
      },

      // scalar division : divide this by scalar
      // store result in dest if provided, else create new vector3
      divide: function( scalar, dest ) {
        if( dest ) {
          dest.x = this.x / scalar;
          dest.y = this.y / scalar;
          dest.z = this.z / scalar;
          return dest;
        }
        return Bump.Vector3.create( this.x / scalar,
                                    this.y / scalar,
                                    this.z / scalar );
      },

      // in-place scalar division
      divideSelf: function( scalar ) {
        this.x /= scalar;
        this.y /= scalar;
        this.z /= scalar;
        return this;
      },

      // element-wise vector division : divide this by elements of vec
      // store result in dest if provided, else create new vector3
      // not sure on this naming convention
      inverseScale: function( vec, dest ) {
        if( dest ) {
          dest.x = this.x / vec.x;
          dest.y = this.y / vec.y;
          dest.z = this.z / vec.z;
          return dest;
        }
        return Bump.Vector3.create( this.x / vec.x,
                                    this.y / vec.y,
                                    this.z / vec.z );
      },

      // element-wise vector division in place:
      // this = this / vec
      inverseScaleSelf: function( vec ) {
        this.x /= vec.x;
        this.y /= vec.y;
        this.z /= vec.z;
        return this;
      },

      // dot product between this vector and the provided one
      dot: function( vec ) {
        return this.x * vec.x + this.y * vec.y + this.z * vec.z;
      },

      // squared magnitude of this vector
      length2: function() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
      },

      // magnitude of this vector
      length: function() {
        return Math.sqrt( this.x * this.x +
                          this.y * this.y +
                          this.z * this.z);
      },

      // squared distance between this vector and vec
      distance2: function( vec ) {
        return vec.subtract( this ).length2();
      },

      // distance between this vector and vec
      distance: function( vec ) {
        return vec.subtract( this ).length();
      },

      // Normalize this vector in place, safely checking for cases
      // of division by zero.
      // Altered slightly to avoid index [] notation.
      safeNormalize: function( ) {
        var absMax = this.absolute().max();

        if( absMax > 0 ) {
          this.divideSelf( absMax );
          return this.divideSelf( this.length() );
        }
        this.setValue( 1, 0, 0 );
        return this;
      },

      // Normalize this vector in place.
      normalize: function( ) {
        return this.divideSelf( this.length() );
      },

      // Compute normalized version of this vector. Store result in dest
      // if provided, create new vector3 if not.
      normalized: function( dest ) {
        // divide function will check if dest is null
        return this.divide( this.length(), dest );
      },

      // Return a rotated version of this vector, rotating around wAxis by angle
      // Store result in dest if provided, else create new Vector3.
      rotate: function( wAxis, angle, dest ) {
        // wAxis must be a unit length vector
        var o = wAxis.multiply( wAxis.dot( this ), dest ), // new temp if dest unspecified
        x = this.subtract( o ).multiplySelf( Math.cos( angle ) ), // new temp
        y = wAxis.cross( this ).multiplySelf( Math.sin( angle ) ); // new temp

        return o.addSelf( x.add( y ) );
      },

      // Return angle between this vector and vec.
      angle: function( v ) {
        var s = Math.sqrt( this.length2() * v.length2() );
        // btFullAssert( s != btScalar( 0.0 ) )
        return Math.acos( this.dot( v ) / s );
      },

      // Return a vector3 with the absolute values of this vector's elements.
      // Store the result in dest if provided, else create a new Vector3.
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

      // Compute cross product of this and vec.
      // Store result in dest if provided, else create new Vector3.
      // Note that this will fail if dest === this
      cross: function( vec, dest ) {
        if( dest ) {
          dest.x = this.y * vec.z - this.z * vec.y;
          dest.y = this.z * vec.x - this.x * vec.z;
          dest.z = this.x * vec.y - this.y * vec.x;
          return dest;
        }

        return Bump.Vector3.create( this.y * vec.z - this.z * vec.y,
                                    this.z * vec.x - this.x * vec.z,
                                    this.x * vec.y - this.y * vec.x );
      },

      // Compute cross product of this and vec, storing result in this
      crossSelf: function( vec ) {
        var x = this.y * vec.z - this.z * vec.y,
        y = this.z * vec.x - this.x * vec.z,
        z = this.x * vec.y - this.y * vec.x;

        this.x = x;
        this.y = y;
        this.z = z;

        return this;
      },

      // return triple scalar product between this, vec, and vec2
      triple: function( vec, vec2 ) {
        return this.x * ( vec.y * vec2.z - vec.z * vec2.y ) +
          this.y * ( vec.z * vec2.x - vec.x * vec2.z ) +
          this.z * ( vec.x * vec2.y - vec.y * vec2.x );
      },

      // return the array index of the minimum value (0,1,2)
      minAxis: function() {
        return this.x < this.y ?
          ( this.x < this.z ? 0 : 2 ) :
          ( this.y < this.z ? 1 : 2 );
      },

      // return the property of the minimum value ('x', 'y', 'z')
      // added because property access by name is faster than by index
      minProperty: function() {
        return this.x < this.y ?
          ( this.x < this.z ? 'x' : 'z' ) :
          ( this.y < this.z ? 'y' : 'z' );
      },

      // return the min value
      min: function() {
        return this.x < this.y ?
          ( this.x < this.z ? this.x : this.z ) :
          ( this.y < this.z ? this.y : this.z );
      },

      // return the array index of the maximum value (0,1,2)
      maxAxis: function() {
        return this.x > this.y ?
          ( this.x > this.z ? 0 : 2 ) :
          ( this.y > this.z ? 1 : 2 );
      },

      // return the property of the minimum value ('x', 'y', 'z')
      // added because property access by name is faster than by index
      maxProperty: function() {
        return this.x > this.y ?
          ( this.x > this.z ? 'x' : 'z' ) :
          ( this.y > this.z ? 'y' : 'z' );
      },

      // return the max value
      max: function() {
        return this.x > this.y ?
          ( this.x > this.z ? this.x : this.z ) :
          ( this.y > this.z ? this.y : this.z );
      },

      /* Note: the furthestAxis and closestAxis functions seem
       *  backwards...
       */
      furthestAxis: function() {
        return this.absolute().minAxis();
      },

      furthest: function() {
        return this.absolute().min();
      },

      closestAxis: function() {
        return this.absolute().maxAxis();
      },

      closest: function() {
        return this.absolute().max();
      },

      // Linearly interpolate between the two vectors and place the
      // result in this
      setInterpolate3 : function( vec, vec2, rt ) {
        var s = 1 - rt;
        this.x = s * vec.x + rt * vec2.x;
        this.y = s * vec.y + rt * vec2.y;
        this.z = s * vec.z + rt * vec2.z;

        return this;
      },

      // Linearly interpolate between this and vec
      // Store the result in dest if provided, else create a new Vector3.
      lerp : function( vec, t, dest ) {
        if( dest ) {
          dest.x = this.x + ( vec.x - this.x ) * t;
          dest.y = this.y + ( vec.y - this.y ) * t;
          dest.z = this.z + ( vec.z - this.z ) * t;
          return dest;
        }

        return Bump.Vector3.create( this.x + ( vec.x - this.x ) * t,
                                    this.y + ( vec.y - this.y ) * t,
                                    this.z + ( vec.z - this.z ) * t );
      },

      // element-wise comparison of vectors ( note : ignores w values )
      equal : function( vec ) {
        return ( this.x == vec.x ) && ( this.y == vec.y ) && ( this.z == vec.z );
      },

      notEqual : function( vec ) {
        return ( this.x != vec.x ) || ( this.y != vec.y ) || ( this.z != vec.z );
      },

      // set elements to be the max of the original elements and vec's elements
      setMax : function( vec ) {
        this.x = Math.max( this.x, vec.x );
        this.y = Math.max( this.y, vec.y );
        this.z = Math.max( this.z, vec.z );
        this.w = Math.max( this.w, vec.w );

        return this;
      },

      // set elements to be the min of the original elements and vec's elements
      setMin : function( vec ) {
        this.x = Math.min( this.x, vec.x );
        this.y = Math.min( this.y, vec.y );
        this.z = Math.min( this.z, vec.z );
        this.w = Math.min( this.w, vec.w );

        return this;
      },

      // set elements equal to x, y, z
      setValue : function( x, y, z ) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = 0;

        return this;
      },

      // set the column(?) vectors v0, v1, v2 equal to the columns of the skew symmetric matrix
      getSkewSymmetricMatrix : function( v0, v1, v2 ) {
        v0.setValue( 0, -this.z, this.y );
        v1.setValue( this.z, 0, -this.x );
        v2.setValue( -this.y, this.x, 0 );
      },

      setZero : function() {
        this.setValue( 0, 0, 0 );

        return this;
      },

      isZero : function() {
        return ( this.x === 0 ) && ( this.y === 0 ) && ( this.z === 0 );
      },

      fuzzyZero : function() {
        return this.length2() < Bump.SIMD_EPSILON;
      }
    },

    typeMembers: {

      clone: function( vec ) {
        return this.create( vec.x, vec.y, vec.z );
      }
    }
  } );

} )( this, this.Bump );
