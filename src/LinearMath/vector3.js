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

      clone: function( ) {
        return Bump.Vector3.create( this.x, this.y, this.z );
      },

      add: function( vec, vec2 ) {
        this.x = vec.x + vec2.x;
        this.y = vec.y + vec2.y;
        this.z = vec.z + vec2.z;
        return this;
      },

      addSelf: function( v ) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
      },

      subtract: function( vec, vec2 ) {
        this.x = vec.x - vec2.x;
        this.y = vec.y - vec2.y;
        this.z = vec.z - vec2.z;
        return this;
      },

      subtractSelf: function( v ) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
      },

      // scalar multiplication
      multiply: function( vec, scalar ) {
        this.x = vec.x * scalar;
        this.y = vec.y * scalar;
        this.z = vec.z * scalar;
        return this;
      },

      multiplySelf: function( scalar ) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
      },

      // elementwise vector multiplication
      scale: function( vec, vec2 ) {
        this.x = vec.x * vec2.x;
        this.y = vec.y * vec2.y;
        this.z = vec.z * vec2.z;
        return this;
      },

      scaleSelf: function( vec ) {
        this.x *= vec.x;
        this.y *= vec.y;
        this.z *= vec.z;
        return this;
      },

      // scalar division
      divide: function( vec, scalar ) {
        this.x = vec.x / scalar;
        this.y = vec.y / scalar;
        this.z = vec.z / scalar;
        return this;
      },

      divideSelf: function( scalar ) {
        this.x /= scalar;
        this.y /= scalar;
        this.z /= scalar;
        return this;
      },

      // elementwise vector division
      // not sure on this naming convention
      inverseScale: function( vec, vec2 ) {
        this.x = vec.x / vec2.x;
        this.y = vec.y / vec2.y;
        this.z = vec.z / vec2.z;
        return this;
      },

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

      length2: function() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
      },

      length: function() {
        return Math.sqrt( this.x * this.x +
                          this.y * this.y +
                          this.z * this.z);
      },

      distance2: function( vec ) {
        return Bump.Vector3.create().subtract( vec, this ).length2();
      },

      distance: function( vec ) {
        return Bump.Vector3.create().subtract( vec, this ).length();
      },

      // altered slightly to avoid index [] notation
      safeNormalize: function( ) {
        var absMax = Bump.Vector3.create().absolute( this ).max();

        if( absMax > 0 ) {
          this.divideSelf( absMax );
          return this.divideSelf( this.length() );
        }
        this.setValue( 1, 0, 0 );
        return this;
      },

      normalize: function( ) {
        return this.divideSelf( this.length() );
      },

      normalized: function( vec ) {
        return this.divide( vec, vec.length() );
      },

      // rotate vec around wAxis by angle
      rotate: function( vec, wAxis, angle ) {
        // wAxis must be a unit length vector
        var o = Bump.Vector3.create().multiply( wAxis, wAxis.dot( vec ) ),
        x = Bump.Vector3.create().subtract( vec, o ),
        y = Bump.Vector3.create().cross( wAxis, vec );

        return this.add( o, this.add( x.multiplySelf( Math.cos( angle ) ),
                                      y.multiplySelf( Math.sin( angle ) )
                                    )
                       );
      },

      // return angle between this vector and vec
      angle: function( v ) {
        var s = Math.sqrt( this.length2() * v.length2() );
        // btFullAssert( s != btScalar( 0.0 ) )
        return Math.acos( this.dot( v ) / s );
      },

      absolute: function( vec ) {
        this.x = Math.abs( vec.x );
        this.y = Math.abs( vec.y );
        this.z = Math.abs( vec.z );

        return this;
      },

      // compute cross product of vec and vec2, store result in this
      cross: function( vec, vec2 ) {
        if( this === vec || this === vec2 ){
          // just in case
          var x = vec.y * vec2.z - vec.z * vec2.y,
          y = vec.z * vec2.x - vec.x * vec2.z,
          z = vec.x * vec2.y - vec.y * vec2.x;

          this.x = x;
          this.y = y;
          this.z = z;

          return this;
        }

        this.x = vec.y * vec2.z - vec.z * vec2.y;
        this.y = vec.z * vec2.x - vec.x * vec2.z;
        this.z = vec.x * vec2.y - vec.y * vec2.x;

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
        return Bump.Vector3.create().absolute( this ).minAxis();
      },

      furthest: function() {
        return Bump.Vector3.create().absolute( this ).min();
      },

      closestAxis: function() {
        return Bump.Vector3.create().absolute( this ).maxAxis();
      },

      closest: function() {
        return Bump.Vector3.create().absolute( this ).max();
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

      // Linearly interpolate between this and vec, place the result in this
      lerp : function( vec, t ) {
        this.x += ( vec.x - this.x ) * t;
        this.y += ( vec.y - this.y ) * t;
        this.z += ( vec.z - this.z ) * t;

        return this;
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
