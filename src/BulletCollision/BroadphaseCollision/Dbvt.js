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
        return this;
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
        return this;
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

      // Classify `this` DbvtAabbMm based on which side of a specified plane it
      // lies. The plane is specified by normal `Vector3` `n`, and the offset
      // `o` along that normal from the origin. The `s` parameter should be an
      // integer 0-7 such that its bits correspond to the signs of the components of
      // the normal vector (0 for negative, 1 otherwise). For example, normal
      // vector <0.707106781, -0.707106781, 0 > would correspond to `s` = 1+0+4
      // = 5. Returns 1 if the bounding box is 'in front' of the plane (direction
      // of normal), -1 if 'behind' the plane (opposite of normal), or 0 for
      // neither (plane intersects the AABB).

      // Note: Not sure why `s` needs to be passed in separately, since it can
      // be computed from the value of `n`. Leaving it for now in case there is
      // a situation where `s` should differ from the signs of `n`.

      // Note: There seems to be a bug here, in which intersections are not
      // reliably detected...
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

      // Expects `Vector3` `v`, unsigned int signs.
      // TODO : Better description of use.
      ProjectMinimum: function( v, signs ) {
        var b = [ this.mx, this.mi ],
        p = Bump.Vector3.create( b[ (signs >> 0) & 1 ].x,
                                 b[ (signs >> 1) & 1 ].y,
                                 b[ (signs >> 2) & 1 ].z );
        return p.dot( v );
      },

      // Note that the original parameters `smi` and `smx` are wrapped
      // inside an object `span`, because the original function passes
      // them by reference.
      // TODO : Better description of use.
      AddSpan: function( d, span ){
        // unrolled to avoid array-like access of Vector3
        // properties, which is slow
        if( d.x < 0 ){
          span.smi += this.mx.x * d.x;
          span.smx += this.mi.x * d.x;
        }
        else{
          span.smi += this.mi.x * d.x;
          span.smx += this.mx.x * d.x;
        }
        if( d.y < 0 ){
          span.smi += this.mx.y * d.y;
          span.smx += this.mi.y * d.y;
        }
        else{
          span.smi += this.mi.y * d.y;
          span.smx += this.mx.y * d.y;
        }
        if( d.z < 0 ){
          span.smi += this.mx.z * d.z;
          span.smx += this.mi.z * d.z;
        }
        else{
          span.smi += this.mi.z * d.z;
          span.smx += this.mx.z * d.z;
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


  // **Bump.DbvtNode** is the port of the `btDbvtNode` struct.
  Bump.DbvtNode = Bump.type( {
    init: function DbvtNode(){
      this.volume = Bump.DbvtVolume.create();
      this.parent = 0;
      /* _unionValue should not be modified directly by outside code */
      this._unionValue = [ 0, 0 ];
    },

    // Properties to mimic c++ union behavior as much as possible.
    properties: {
      // Originally a static array `btDbvtNode*[2]`
      childs: {
        get: function() { return this._unionValue; },
        set: function( v ) { this._unionValue = v; }
      },
      // Originally of type `void*`
      data: {
        get: function() { return this._unionValue[ 0 ]; },
        set: function( v ) { this._unionValue[ 0 ] = v; }
      },
      // Originally of type `int`. Note that attempting to interpret an object's
      // pointer value as an integer is not possible...
      dataAsInt: {
        get: function() { return this._unionValue[ 0 ]; },
        set: function( v ) { this._unionValue[ 0 ] = v; }
      }
    },

    members: {
      isleaf: function() {
        /* unrolled to avoid property access, which is slower
           return(childs[1]==0); */
        return this._unionValue[ 1 ] === 0;
      },

      isinternal: function() {
        /* unrolled to avoid extra function call
           return(!isleaf()); */
        return this._unionValue[ 1 ] !== 0;
      }
    }
  } );

  // ***Bump.Dbvt*** is the port of the `btDbvt` struct.
  Bump.Dbvt = Bump.type( {
    init: function(){
      this.m_root = 0; // DbvtNode
      this.m_free = 0; // DbvtNode
      this.m_lkhd = 0; // int
      this.m_leaves = 0; // int
      this.m_opath = 0; // unsigned
      this.m_stkStack = []; // array of `Dbvt.sStkNN`
    },

    members: {
    }
  } );

  // Stack element structs

  Bump.Dbvt.sStkNN = Bump.type( {
    // initialize from two `DbvtNode`s
    init: function( na, nb ) {
      this.a = na || 0;
      this.b = nb || 0;
    }
  } );

  Bump.Dbvt.sStkNP = Bump.type( {
    // initialize from `DbvtNode` `n` and int mask `m`
    init: function( n, m ) {
      this.node = n || 0;
      this.mask = m || 0;
    }
  } );

  Bump.Dbvt.sStkNPS = Bump.type( {
    // initialize from `DbvtNode` `n`, int mask `m`, and float `v`
    init: function( n, m, v ) {
      this.node = n || 0;
      this.mask = m || 0;
      this.value = v || 0;
    }
  } );

  Bump.Dbvt.sStkCLN = Bump.type( {
    // initialize from two `DbvtNode`s
    init: function( n, p ) {
      this.node = n || 0;
      this.parent = p || 0;
    }
  } );

  // Policies/Interfaces

  Bump.Dbvt.ICollide = Bump.type( {
    members: {
      // originally ICollide specified 3 overloaded Process functions, which have
      // been renamed here based on their expected arguments
      ProcessNode2: function( node1, node2 ){},
      ProcessNode: function( node ){},
      ProcessNodeFloat: function( n, s ) {
        this.ProcessNode( n );
      },
      Descent: function( node ){
        return true;
      },
      AllLeaves: function( node ){
        return true;
      }
    }
  } );

  Bump.Dbvt.IWriter = Bump.type( {
    members: {
      Prepare: function( root, numnodes ){},
      WriteNode: function( node, index, parent, child0, child1){},
      WriteLeaf: function( node, index, parent){}
    }
  } );

  Bump.Dbvt.IClone = Bump.type( {
    members: {
      CloneLeaf: function( node ) {}
    }
  } );

  // Constants
  Bump.Dbvt.SIMPLE_STACKSIZE = 64;
  Bump.Dbvt.DOUBLE_STACKSIZE = Bump.Dbvt.SIMPLE_STACKSIZE * 2;

} )( this, this.Bump );