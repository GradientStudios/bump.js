// **Bump.Dbvt** is the port of the `btDbvt` class in
// [Bullet](http://bulletphysics.org).
// Original btDbvt implementation by Nathanael Presson.

(function( window, Bump ) {

  // **Bump.DbvtAabbMm** is the port of the `btDbvtAabbMm` class.
  // "DbvtAabbMm" stands for "Dynamic Bounding Volume Tree Axis-Aligned
  // Bounding Box Minimum/Maximum," meaning that it represents an AABB
  // from 2 `Vector3`s, the minimum `mi` bounds, and the maximum `mx`
  // bounds.
  Bump.DbvtAabbMm = Bump.type( {
    // Default constructor, sets mi and mx to zeroed `Vector3`s
    init: function DbvtAabbMm() {
      this.mi = Bump.Vector3.create();
      this.mx = Bump.Vector3.create();
    },

    members: {

      // Creates a deep copy of `this` DbvtAabbMm, storing the result in `dest` if
      // provided. Otherwise creates and returns a new DbvtAabbMm.
      clone: function( dest ) {
        var box = dest || Bump.DbvtAabbMm.create();
        this.mi.clone( box.mi );
        this.mx.clone( box.mx );
        return box;
      },

      // Compute the center of `this` bounding box. The result is stored in the
      // the `Vector3` `dest` if provided. Otherwise a new `Vector3` is created.
      Center: function( dest ) {
        if( dest ){
          return this.mi.add( this.mx, dest ).divide( 2, dest );
        }
        var res = Bump.Vector3.create();
        return this.mi.add(this.mx, res ).divide( 2, res );
      },

      // Compute the XYZ lengths of the bounding box. The result is stored in the
      // the `Vector3` `dest` if provided. Otherwise a new `Vector3` is created.
      Lengths: function( dest ) {
        return this.mx.subtract( this.mi, dest );
      },

      // Compute the half-lengths of the bounding box, that is, how far it extends
      // in on each axis from its center. The result is stored in the
      // the `Vector3` `dest` if provided. Otherwise a new `Vector3` is created.
      Extents: function( dest ) {
        if( dest ){
          return this.mx.subtract( this.mi, dest ).divide( 2, dest );
        }
        var res = Bump.Vector3.create();
        return this.mx.subtract( this.mi, res ).divide( 2, res );
      },

      // Return a reference to the minimum `Vector3` bounds of the bounding box.
      // Note that modifying this value directly affects `mi`.
      Mins: function() {
        return this.mi;
      },

      // Return a reference to the maximum `Vector3` bounds of the bounding box.
      // Note that modifying this value directly affects `mx`.
      Maxs: function() {
        return this.mx;
      },

      // Expand the bounding box by the values of `Vector3` `e` in *both*
      // directions along each axis. Note that negative values are not expected.
      Expand: function( e ) {
        this.mi.subtractSelf( e );
        this.mx.addSelf( e );
      },

      // Expand the bounding box by the values of `Vector3` `e`, expanding only
      // in the positive direction for positive values, and only in the negative
      // direction for negative values.
      SignedExpand: function( e ) {
        if( e.x > 0 ) {
          this.mx.x += e.x;
        }
        else{
          this.mi.x += e.x;
        }
        if( e.y > 0 ) {
          this.mx.y += e.y;
        }
        else{
          this.mi.y += e.y;
        }
        if( e.z > 0 ) {
          this.mx.z += e.z;
        }
        else{
          this.mi.z += e.z;
        }
      },

      // Given `DbvtAabbMm` `a`, return true if `a`s bounding box is contained
      // within `this` bounding box.
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
          px.setValue( this.mi.x, this.mi.y, this.mi.z );
          pi.setValue( this.mx.x, this.mx.y, this.mx.z );
          break;
        case (1+0+0):
          px.setValue( this.mx.x, this.mi.y, this.mi.z );
          pi.setValue( this.mi.x, this.mx.y, this.mx.z );
          break;
        case (0+2+0):
          px.setValue( this.mi.x, this.mx.y, this.mi.z );
          pi.setValue( this.mx.x, this.mi.y, this.mx.z );
          break;
        case (1+2+0):
          px.setValue( this.mx.x, this.mx.y, this.mi.z );
          pi.setValue( this.mi.x, this.mi.y, this.mx.z );
          break;
        case (0+0+4):
          px.setValue( this.mi.x, this.mi.y, this.mx.z );
          pi.setValue( this.mx.x, this.mx.y, this.mi.z );
          break;
        case (1+0+4):
          px.setValue( this.mx.x, this.mi.y, this.mx.z );
          pi.setValue( this.mi.x, this.mx.y, this.mi.z );
          break;
        case (0+2+4):
          px.setValue( this.mi.x, this.mx.y, this.mx.z );
          pi.setValue( this.mx.x, this.mi.y, this.mi.z );
          break;
        case (1+2+4):
          px.setValue( this.mx.x, this.mx.y, this.mx.z );
          pi.setValue( this.mi.x, this.mi.y, this.mi.z );
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
        c.subtract( e, box.mi );
        c.add( e, box.mx );
        return box;
      },

      FromCR: function( c, r ) {
        // unrolled instead of calling CE
        var box = Bump.DbvtAabbMm.create(),
        e = Bump.Vector3.create( r, r, r );
        c.subtract( e, box.mi );
        c.add( e, box.mx );
        return box;
      },

      FromMM: function( mi, mx ) {
        var box = Bump.DbvtAabbMm.create();
        mi.clone( box.mi );
        mx.clone( box.mx );
        return box;
      },

      // note that there were two of these, for pts as type btVector3* and btVector3**
      FromPoints: function( pts, n ) {
        var box = Bump.DbvtAabbMm.create();
        n = n || pts.length; // added this, since pts is now an array object with stored length
        pts[ 0 ].clone( box.mi );
        pts[ 0 ].clone( box.mx );
        for( var i = 1; i < n; ++i ) {
          box.mi.setMin( pts[ i ] );
          box.mx.setMax( pts[ i ] );
        }
        return box;
      }
    }
  } );

  // emulates typedef btDbvtAabbMm btDbvtVolume
  Bump.DbvtVolume = Bump.DbvtAabbMm;

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

  Bump.Proximity = {};

  // Given `DbvtAabbMm`s `a` and `b`, compute the "proximity", which is twice the
  // Manhattan distance between the centers
  Bump.Proximity.DbvtAabbMm2 = function( a, b ) {
    var d = a.mi.add( a.mx ).subtractSelf( b.mi.add( b.mx ) );

    return ( Math.abs( d.x ) + Math.abs( d.y ) + Math.abs( d.z ) );
  };
  Bump.Proximity.DbvtVolume2 = Bump.Proximity.DbvtAabbMm2; // typedef consistency

  Bump.Select = {};
  // Given `DbvtAabbMm`s `o`, `a`, and `b`, returns 0 if `o` is closer to `a` than to `b`,
  // else returns 1. Distance is measured using `Proximity`.
  Bump.Select.DbvtAabbMm3 = function( o, a, b ) {
    return ( Bump.Proximity.DbvtAabbMm2( o, a ) <
             Bump.Proximity.DbvtAabbMm2( o, b ) ) ? 0 : 1;
  };
  Bump.Select.DbvtVolume3 = Bump.Select.DbvtAabbMm3; // typedef consistency

  Bump.Merge = {};
  Bump.Merge.DbvtAabbMm3 = function( a, b, r ) {
    // unrolled to avoid array-like vector access (for speed)
    if( a.mi.x < b.mi.x ) {
      r.mi.x = a.mi.x;
    }
    else {
      r.mi.x = b.mi.x;
    }
    if( a.mx.x > b.mx.x ) {
      r.mx.x = a.mx.x;
    }
    else {
      r.mx.x = b.mx.x;
    }

    if( a.mi.y < b.mi.y ) {
      r.mi.y = a.mi.y;
    }
    else {
      r.mi.y = b.mi.y;
    }
    if( a.mx.y > b.mx.y ) {
      r.mx.y = a.mx.y;
    }
    else {
      r.mx.y = b.mx.y;
    }

    if( a.mi.z < b.mi.z ) {
      r.mi.z = a.mi.z;
    }
    else {
      r.mi.z = b.mi.z;
    }
    if( a.mx.z > b.mx.z ) {
      r.mx.z = a.mx.z;
    }
    else {
      r.mx.z = b.mx.z;
    }
  };
  Bump.Merge.DbvtVolume3 = Bump.Merge.DbvtAabbMm3; // typedef consistency

  Bump.NotEqual = {};
  Bump.NotEqual.DbvtAabbMm2 = function( a, b ) {
    return( (a.mi.x != b.mi.x ) ||
            (a.mi.y != b.mi.y ) ||
            (a.mi.z != b.mi.z ) ||
            (a.mx.x != b.mx.x ) ||
            (a.mx.y != b.mx.y ) ||
            (a.mx.z != b.mx.z ) );
  };
  Bump.NotEqual.DbvtVolume2 = Bump.NotEqual.DbvtAabbMm2; // typedef consistency

} )( this, this.Bump );