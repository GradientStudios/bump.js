// Math stuff that bullet defines.
(function( window, Bump ) {

  // Arccosine calculation with bounds checking.
  // Port of `btAcos` from `btScalar.h`.
  if ( !Bump.Acos ) {
    Bump.Acos = function btAcos( x ) {
      if ( x < -1 ) { x = -1; }
      if ( x >  1 ) { x =  1; }
      return Math.acos( x );
    };
  }

  // Arcsine calculation with bounds checking.
  // Port of `btAsin` from `btScalar.h`.
  if ( !Bump.Asin ) {
    Bump.Asin = function btAsin( x ) {
      if ( x < -1 ) { x = -1; }
      if ( x >  1 ) { x =  1; }
      return Math.asin( x );
    };
  }

  if ( !Bump.Fsels ) {
    Bump.Fsels = function btFsels( a, b, c ) {
      return a >= 0 ? b : c;
    };
  }

})( this, this.Bump );
