/// original btDbvt implementation by Nathanael Presson

(function( window, Bump ) {

  Bump.DbvtAabbMm = Bump.type( {
    init: function DbvtAabbMm() {
      this.mi = Bump.Vector3.create();
      this.mx = Bump.Vector3.create();
    },

    members: {

      // Creates a deep copy of `this` DbvtAabbMm, storing the result in `dest` if
      // provided. Otherwise creates and returns a new DbvtAabbMm.
      // The original `btDbvtAabbMm` does not have a clone function or explicit
      // copy constructor, but this is needed for the current unit test code.
      clone: function( dest ) {
        var box = dest || Bump.DbvtAabbMm.create();
        this.mi.clone( box.mi );
        this.mx.clone( box.mx );
        return box;
      },

      Center: function( dest ) {
        if( dest ){
          return this.mi.add( this.mx, dest ).divide( 2, dest );
        }
        var res = Bump.Vector3.create();
        return this.mi.add(this.mx, res ).divide( 2, res );
      },

      Lengths: function( dest ) {
        return this.mx.subtract( this.mi, dest );
      },

      Extents: function( dest ) {
        if( dest ){
          return this.mx.subtract( this.mi, dest ).divide( 2, dest );
        }
        var res = Bump.Vector3.create();
        return this.mx.subtract( this.mi, res ).divide( 2, res );
      },

      Mins: function() {
        return this.mi;
      },

      Maxs: function() {
        return this.mx;
      },

      Expand: function( e ) {
        this.mi -= e;
        this.mx += e;
      },

      SignedExpand: function( e ) {
        if( e.x > 0 ) {
          this.mx.setX( this.mx.x + e[ 0 ] );
        }
        else{
          this.mi.setX( this.mi.x + e[ 0 ] );
        }
        if( e.y > 0 ) {
          this.mx.setY( this.mx.y + e[ 1 ] );
        }
        else{
          this.mi.setY( this.mi.y + e[ 1 ] );
        }
        if( e.z > 0 ) {
          this.mx.setZ( this.mx.z + e[ 2 ] );
        }
        else{
          this.mi.setZ( this.mi.z + e[ 2 ] );
        }
      },

      Contain: function( a ) {
        return(	( this.mi.x <= a.mi.x ) &&
		( this.mi.y <= a.mi.y ) &&
		( this.mi.z <= a.mi.z ) &&
		( this.mx.x >= a.mx.x ) &&
		( this.mx.y >= a.mx.y ) &&
		( this.mx.z >= a.mx.z ) );
      },

      Classify: function( n, o, s ) {
        var pi = Bump.Vector3.create(),
        px = Bump.Vector3.create();

        switch( s ) {
        case (0+0+0):
          px = Bump.Vector3.create( this.mi.x, this.mi.y, this.mi.z );
          pi = Bump.Vector3.create( this.mx.x, this.mx.y, this.mx.z );
          break;
        case (1+0+0):
          px = Bump.Vector3.create( this.mx.x, this.mi.y, this.mi.z );
          pi = Bump.Vector3.create( this.mi.x, this.mx.y, this.mx.z );
          break;
        case (0+2+0):
          px = Bump.Vector3.create( this.mi.x, this.mx.y, this.mi.z );
          pi = Bump.Vector3.create( this.mx.x, this.mi.y, this.mx.z );
          break;
        case (1+2+0):
          px = Bump.Vector3.create( this.mx.x, this.mx.y, this.mi.z );
          pi = Bump.Vector3.create( this.mi.x, this.mi.y, this.mx.z );
          break;
        case (0+0+4):
          px = Bump.Vector3.create( this.mi.x, this.mi.y, this.mx.z );
          pi = Bump.Vector3.create( this.mx.x, this.mx.y, this.mi.z );
          break;
        case (1+0+4):
          px = Bump.Vector3.create( this.mx.x, this.mi.y, this.mx.z );
          pi = Bump.Vector3.create( this.mi.x, this.mx.y, this.mi.z );
          break;
        case (0+2+4):
          px = Bump.Vector3.create( this.mi.x, this.mx.y, this.mx.z );
          pi = Bump.Vector3.create( this.mx.x, this.mi.y, this.mi.z );
          break;
        case (1+2+4):
          px = Bump.Vector3.create( this.mx.x, this.mx.y, this.mx.z );
          pi = Bump.Vector3.create( this.mi.x, this.mi.y, this.mi.z );
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
        p = Bump.Vector3.create( b[ (signs >> 0) & 1 ].x,
                                 b[ (signs >> 1) & 1 ].y,
                                 b[ (signs >> 2) & 1 ].z );
        return p.dot( v );
      },

      AddSpan: function( d, smi, smx ){
        for( var i = 0; i < 3; ++i ) {
          if( d[ i ] < 0 ){
            smi += this.mx[ i ] * d [ i ];
            smx += this.mi[ i ] * d [ i ];
          }
          else{
            smi += this.mi[ i ] * d [ i ];
            smx += this.mx[ i ] * d [ i ];
          }
        }
      }
    },

    typeMembers: {
      // static functions that handle construction
      FromCE: function( c, e ) {
        var box = Bump.DbvtAabbMm.create();
        box.mi = c;
        box.mx = c.add( e, box.mi );
        return box;
      },

      FromCR: function( c, r ) {
        // unrolled instead of calling CE
        var box = Bump.DbvtAabbMm.create();
        box.mi = c;
        box.mx = c.add( Bump.Vector3.create( r, r, r ), box.mx );
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
      }
    }
  } );

  // emulates typedef btDbvtAabbMm btDbvtVolume
  Bump.DbvtVolume = Bump.AdvtAabbMm;

  Bump.Intersect = {}; // object to hold global intersect functions
  Bump.Intersect.DbvtAabbMm = {}; // intersect tests for DbvtAabbMm
  Bump.Intersect.DbvtVolume = Bump.Intersect.DbvtAabbMm; // typedef consistency

  // Intersect test for 2 `DbvtAabbMm`s
  Bump.Intersect.DbvtAabbMm2 = function( a, b ) {
    /*#if	DBVT_INT0_IMPL == DBVT_IMPL_SSE
	const __m128	rt(_mm_or_ps(	_mm_cmplt_ps(_mm_load_ps(b.mx),_mm_load_ps(a.mi)),
		_mm_cmplt_ps(_mm_load_ps(a.mx),_mm_load_ps(b.mi))));
	const __int32*	pu((const __int32*)&rt);
	return((pu[0]|pu[1]|pu[2])==0);
    #else*/
    return( ( a.mi.x <= b.mx.x ) &&
            ( a.mx.x >= b.mi.x ) &&
            ( a.mi.y <= b.mx.y ) &&
            ( a.mx.y >= b.mi.y ) &&
            ( a.mi.z <= b.mx.z ) &&
            ( a.mx.z >= b.mi.z ) );
    //#endif
  };
  Bump.Intersect.DbvtVolume2 = Bump.Intersect.DbvtAabbMm2; // typedef consistency

  // Intersect test for `DbvtAabbMm` `a` and `Vector3` `b`
  Bump.Intersect.DbvtAabbMm.Vector3 = function( a, b ) {
    return( ( b.x >= a.mi.x ) &&
            ( b.y >= a.mi.y ) &&
            ( b.z >= a.mi.z ) &&
            ( b.x <= a.mx.x ) &&
            ( b.y <= a.mx.y ) &&
            ( b.z <= a.mx.z ) );
  };

  Bump.Proximity = {}; // proximity tests

  // Proximity test for 2 `DbvtAabbMm`s
  Bump.Proximity.DbvtAabbMm2 = function( a, b ) {
    var d = a.mi.add( a.mx );
    d = d.subtractSelf( b.mi.subtract( b.mx ) );

    return ( Math.Abs( d.x ) + Math.Abs( d.y ) + Math.Abs( d.z ) );
  };
  Bump.Proximity.DbvtVolume2 = Bump.Proximity.DbvtAabbMm2; // typedef consistency

  Bump.Select = {};
  Bump.Select.DbvtAabbMm3 = function( o, a, b ) {
    return ( Bump.Proximity.DbvtAabbMm2( o, a ) <
             Bump.Proximity.DbvtAabbMm2( o, b ) ) ? 0 : 1;
  };
  Bump.Select.DbvtVolume3 = Bump.Select.DbvtAabbMm3; // typedef consistency

  Bump.Merge = {};
  Bump.Merge.DbvtAabbMm3 = function( a, b, r ) {
    // unrolled for to avoid array-like vector access (for speed)
    if( a.mi.x < b.mi.x ) {
      r.mi.x = a.mi.x;
    }
    else {
      r.mi.x = b.mi.x;
    }
    if( a.mi.y < b.mi.y ) {
      r.mi.y = a.mi.y;
    }
    else {
      r.mi.y = b.mi.y;
    }
    if( a.mi.z < b.mi.z ) {
      r.mi.z = a.mi.z;
    }
    else {
      r.mi.z = b.mi.z;
    }
  };
  Bump.Merge.DbvtVolume3 = Bump.Merge.DbvtAabbMm3; // typedef consistency

  Bump.NotEqual = {};
  Bump.NotEqual.DbvtAabbMm = function( a, b ) {
    return( (a.mi.x != b.mi.x ) ||
            (a.mi.y != b.mi.y ) ||
            (a.mi.z != b.mi.z ) ||
            (a.mx.x != b.mx.x ) ||
            (a.mx.y != b.mx.y ) ||
            (a.mx.z != b.mx.z ) );
  };
  Bump.NotEqual.DbvtVolume = Bump.NotEqual.DbvtAabbMm; // typedef consistency

} )( this, this.Bump );