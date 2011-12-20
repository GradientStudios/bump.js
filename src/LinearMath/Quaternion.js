// **Bump.Quaternion** is the port of the `btQuaternion` class in
// [Bullet](http://bulletphysics.org). It implements
// (quaternions)[http://en.wikipedia.org/wiki/Quaternion].

(function( window, Bump ) {
  var EPSILON = Math.pow( 2, -52 );

  Bump.Quaternion = Bump.type({
    // Given *exactly* four arguments, initializes a quaternion.
    init: function Matrix3x3( x, y, z, w ) {
      this.m_floats = [ x, y, z, w ];

      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
    }
  });
})( this, this.Bump );
