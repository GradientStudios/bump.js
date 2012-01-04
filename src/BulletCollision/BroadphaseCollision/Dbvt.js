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

      FromCE: function( c, e ) {
        var box = Bump.DbvtAabbMm.create();
        box.mi = c;
        box.mx = c + e;
        return box;
      },

      FromCR: function( c, r ) {
        // unrolled instead of calling CE
        var box = Bump.DbvtAabbMm.create();
        box.mi = c;
        box.mx = Bump.Vector3.create( r, r, r );
        return box;
      },

      FromMM: function( mi, mx ) {
        var box = Bump.DbvtAabbMm.create();
        box.mi = mi;
        box.mx = mx;
        return box;
      },

      // note that there were two of these, for pts as type btVector3* and btVector3**
      FromPoints: function( pts, n ) {
        var box = Bump.DbvtAabbMm.create();
        n = n || pts.length; // added this, since pts is now an array object with stored length
        box.mi = box.mx = pts[ 0 ];
        for( var i = 1; i < n; ++i ) {
          box.mi.setMin( pts[ i ] );
          box.mx.setMax( pts[ i ] );
        }
        return box;
      },

      Expand: function( e ) {
        this.mi -= e;
        this.mx += e;
      },

      SignedExpand: function( e ) {
        if( e.x() > 0 ) {
          this.mx.setX( this.mx.x() + e[ 0 ] );
        }
        else{
          this.mi.setX( this.mi.x() + e[ 0 ] );
        }
        if( e.y() > 0 ) {
          this.mx.setY( this.mx.y() + e[ 1 ] );
        }
        else{
          this.mi.setY( this.mi.y() + e[ 1 ] );
        }
        if( e.z() > 0 ) {
          this.mx.setZ( this.mx.z() + e[ 2 ] );
        }
        else{
          this.mi.setZ( this.mi.z() + e[ 2 ] );
        }
      },

      Contain: function( a ) {
        return(	( this.mi.x() <= a.mi.x() ) &&
		( this.mi.y() <= a.mi.y() ) &&
		( this.mi.z() <= a.mi.z() ) &&
		( this.mx.x() >= a.mx.x() ) &&
		( this.mx.y() >= a.mx.y() ) &&
		( this.mx.z() >= a.mx.z() ) );
      },

      Classify: function( n, o, s ) {
        var pi = Bump.Vector3.create(),
        px = Bump.Vector3.create();

        switch( s ) {
        case (0+0+0):
          px = Bump.Vector3.create( this.mi.x(), this.mi.y(), this.mi.z() );
          pi = Bump.Vector3.create( this.mx.x(), this.mx.y(), this.mx.z() );
          break;
        case (1+0+0):
          px = Bump.Vector3.create( this.mx.x(), this.mi.y(), this.mi.z() );
          pi = Bump.Vector3.create( this.mi.x(), this.mx.y(), this.mx.z() );
          break;
        case (0+2+0):
          px = Bump.Vector3.create( this.mi.x(), this.mx.y(), this.mi.z() );
          pi = Bump.Vector3.create( this.mx.x(), this.mi.y(), this.mx.z() );
          break;
        case (1+2+0):
          px = Bump.Vector3.create( this.mx.x(), this.mx.y(), this.mi.z() );
          pi = Bump.Vector3.create( this.mi.x(), this.mi.y(), this.mx.z() );
          break;
        case (0+0+4):
          px = Bump.Vector3.create( this.mi.x(), this.mi.y(), this.mx.z() );
          pi = Bump.Vector3.create( this.mx.x(), this.mx.y(), this.mi.z() );
          break;
        case (1+0+4):
          px = Bump.Vector3.create( this.mx.x(), this.mi.y(), this.mx.z() );
          pi = Bump.Vector3.create( this.mi.x(), this.mx.y(), this.mi.z() );
          break;
        case (0+2+4):
          px = Bump.Vector3.create( this.mi.x(), this.mx.y(), this.mx.z() );
          pi = Bump.Vector3.create( this.mx.x(), this.mi.y(), this.mi.z() );
          break;
        case (1+2+4):
          px = Bump.Vector3.create( this.mx.x(), this.mx.y(), this.mx.z() );
          pi = Bump.Vector3.create( this.mi.x(), this.mi.y(), this.mi.z() );
          break;
        }

        if( ( n.dot( px ) + o ) < 0 ) {
          return -1;
        }

        if( ( n.dot( pi ) + o ) >= 0 ) {
          return 1;
        }

        return 0;
      },

      ProjectMinimum: function( v, signs ) {
        var b = [ this.mx, this.mi ],
        p = Bump.Vector3.create( b[ (signs >> 0) & 1 ].x(),
                                 b[ (signs >> 1) & 1 ].y(),
                                 b[ (signs >> 2) & 1 ].z() );
        return p.dot( v );
      },

      AddSpan: function( d, smi, smx ){},
      Intersect: function( a, b ) {}, // note that there are two of these... need to combine or rename?
      Proximity: function( a, b ) {},
      Select: function( o, a, b ) {},
      Merge: function( a, b ) {},
      NotEqual: function( a, b ) {}
    }
  } );

} )( this, this.Bump );