/// original btDbvt implementation by Nathanael Presson

(function( window, Bump ) {

  Bump.DbvtAabbMm = Bump.type( {
    init: function DbvtAabbMm() {
      this.mi = Bump.Vector3.create();
      this.mx = Bump.Vector3.create();
    },

    members: {
      Center: function() {
        return ( ( this.mi + this.mx ) / 2 );
      },

      Lengths: function() {
        return this.mx - this.mi;
      },

      Extents: function() {
        return ( this.mx - this.mi ) / 2;
      },

      Mins: function() {
        return this.mi;
      },

      Maxs: function() {
        return this.mx;
      },

      FromCE: function( c, e ) {},
      FromCR: function( c, r ) {},
      FromMM: function( mi, mx ) {},
      FromPoints: function( pts, n ) {}, // note that there are two of these... need to combine or rename?
      Expand: function( e ) {},
      SignedExpand: function( e ) {},
      Contain: function( a ) {},
      Classify: function( n, o, s ) {},
      ProjectMinimum: function( v, signs ) {},
      Intersect: function( a, b ) {}, // note that there are two of these... need to combine or rename?
      Proximity: function( a, b ) {},
      Select: function( o, a, b ) {},
      Merge: function( a, b ) {},
      NotEqual: function( a, b ) {},
      AddSpan: function( d, smi, smx ){}
    }
  } );

} )( this, this.Bump );