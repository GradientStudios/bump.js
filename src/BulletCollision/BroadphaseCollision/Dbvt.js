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

  // ***Bump.Dbvt*** is the port of the `btDbvt` struct. Original documenation as follows:
  // The btDbvt class implements a fast dynamic bounding volume tree based on axis aligned bounding boxes (aabb tree).
  // This btDbvt is used for soft body collision detection and for the btDbvtBroadphase. It has a fast insert, remove and update of nodes.
  // Unlike the btQuantizedBvh, nodes can be dynamically moved around, which allows for change in topology of the underlying data structure.
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
      clear: function() {},        // TODO

      empty: function() { return (0 === this.m_root); },

      optimizeBottomUp: function() {},        // TODO

      optimizeTopDown: function( bu_threshold ) {
        bu_threshold = bu_threshold || 128;
        // TODO
      },

      optimizeIncremental: function( passes ) {},        // TODO

      insert: function( box, data ) {},        // TODO

      updateLeafLookahead: function( leaf, lookahead ){
        lookahead = lookahead === undefined ? -1 : lookahead;
        // TODO
      },

      updateLeafVolume: function( leaf, volume ) {},        // TODO

      updateLeafVolumeVelocityMargin: function( leaf, volumeRef, velocity, margin ) {},        // TODO

      updateLeafVolumeVelocity: function( leaf, volumeRef, velocity ) {},        // TODO

      updateLeafVolumeMargin: function( leaf, volumeRef, margin ) {},        // TODO

      remove: function( leaf ) {},        // TODO

      write: function( iwriter ) {},        // TODO

      clone: function( dest, iclone ) {
        iclone = iclone || 0;
        // TODO
      },

      // Process collision between two `Dbvt` trees with roots `root0` and `root1`, according
      // to the given policy.
      // Note that `policyRef` is a by-reference `iCollide`, that is, an
      // object with an expected property named 'value' set to an `iCollide`.
      // TODO : Add description of use.
      collideTT: function( root0, root1, policyRef ) {
        if( root0 && root1 ) {
          var depth = 1,
              threshold = Bump.Dbvt.DOUBLE_STACKSIZE - 4,
              stkStack = [];
          stkStack[ Bump.Dbvt.DOUBE_STACKSIZE - 1 ] = undefined; /* stkStack.resize( DOUBLE_STACKSIZE ); */
          stkStack[ 0 ] = Bump.Dbvt.sStkNN.create( root0, root1 );

          do {
            var p = stkStack[ --depth ];
            if( depth > threshold ) {
              stkStack[ stkStack.length * 2 - 1 ] = undefined; /* stkStack.resize( stkStack.size() * 2 ); */
              threshold = stkStack.length - 4;
            }
            if( p.a === p.b ) {
              if( p.a.isinternal() ) {
                stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a.childs[ 0 ], p.a.childs[ 0 ] );
                stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a.childs[ 1 ], p.a.childs[ 1 ] );
                stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a.childs[ 0 ], p.a.childs[ 1 ] );
              }
            }
            else if( Bump.Intersect.DbvtVolume2( p.a.volume, p.b.volume ) ) {
              if( p.a.isinternal() ) {
                if( p.b.isinternal() ) {
                  stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a.childs[ 0 ], p.b.childs[ 0 ] );
                  stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a.childs[ 1 ], p.b.childs[ 0 ] );
                  stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a.childs[ 0 ], p.b.childs[ 1 ] );
                  stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a.childs[ 1 ], p.b.childs[ 1 ] );
                }
                else {
                  stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a.childs[ 0 ], p.b );
                  stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a.childs[ 1 ], p.b );
                }
              }
              else {
                if( p.b.isinternal() ) {
                  stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a, p.b.childs[ 0 ] );
                  stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a, p.b.childs[ 1 ] );
                }
                else {
                  policyRef.value.ProcessNode2( p.a, p.b );
                }
              }
            }
          } while( depth );
        }
      },

      collideTTpersistentStack: function( root0, root1, policyRef ) {
        if( root0 && root1 ) {
          var depth = 1,
              threshold = Bump.Dbvt.DOUBLE_STACKSIZE - 4;
          this.m_stkStack[ Bump.Dbvt.DOUBE_STACKSIZE - 1 ] = undefined; /* m_stkStack.resize( DOUBLE_STACKSIZE ); */
          this.m_stkStack[ 0 ] = Bump.Dbvt.sStkNN.create( root0, root1 );
          do {
            var p = this.m_stkStack[ --depth ];
            if( depth > threshold ) {
              this.m_stkStack[ this.m_stkStack.length * 2 - 1 ] = undefined; /* m_stkStack.resize( this.m_stkStack.size() * 2 ); */
              threshold = this.m_stkStack.length - 4;
            }
            if( p.a === p.b ) {
              if( p.a.isinternal() ) {
                this.m_stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a.childs[ 0 ], p.a.childs[ 0 ] );
                this.m_stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a.childs[ 1 ], p.a.childs[ 1 ] );
                this.m_stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a.childs[ 0 ], p.a.childs[ 1 ] );
              }
            }
            else if( Bump.Intersect.DbvtVolume2( p.a.volume, p.b.volume ) ) {
              if( p.a.isinternal() ) {
                if( p.b.isinternal() ) {
                  this.m_stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a.childs[ 0 ], p.b.childs[ 0 ] );
                  this.m_stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a.childs[ 1 ], p.b.childs[ 0 ] );
                  this.m_stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a.childs[ 0 ], p.b.childs[ 1 ] );
                  this.m_stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a.childs[ 1 ], p.b.childs[ 1 ] );
                }
                else {
                  this.m_stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a.childs[ 0 ], p.b );
                  this.m_stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a.childs[ 1 ], p.b );
                }
              }
              else {
                if( p.b.isinternal() ) {
                  this.m_stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a, p.b.childs[ 0 ] );
                  this.m_stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a, p.b.childs[ 1 ] );
                }
                else {
                  policyRef.value.ProcessNode2( p.a, p.b );
                }
              }
            }
          } while( depth );
        }
      },

      // Process collision between a `Dbvt` tree, starting at `root`, and `DbvtVolume` `vol` according
      // to the given policy. ???
      collideTV: function( root, vol, policyRef ) {
        if( root ) {
          var volume = vol.clone(),
              stack = [];
          /* stack.resize( 0 ); */
          /* stack.reserve( SIMPLE_STACKSIZE ); */
          stack.push( root );
          do {
            var n = stack[stack.length - 1];
            stack.pop();
            if ( Bump.Intersect.DbvtVolume2( n.volume, volume ) ) {
              if( n.isinternal() ) {
                stack.push( n.childs[ 0 ] );
                stack.push( n.childs[ 1 ] );
              }
              else {
                policyRef.value.Process( n );
              }
            }
          } while( stack.length > 0 );
        }
      },

      rayTestInternal: function( root,
                                 rayFrom,
                                 rayTo,
                                 rayDirectionInverse,
                                 signs,
                                 lambda_max,
                                 aabbMin,
                                 aabbMax,
                                 policyRef ) {
        var rayTo;
        if( root ) {
          var resultNormal = Bump.Vector3.create(),
              depth = 1,
              threshold = Bump.Dbvt.DOUBLE_STACKSIZE - 2,
              stack = [],
              bounds = [ Bump.Vector3.create(), Bump.Vector3.create() ];
          stack[ Bump.Dbvt.DOUBE_STACKSIZE - 1 ] = undefined; / * stack.resize( DOUBLE_STACKSIZE ); * /
          stack[ 0 ] = root;
          do {
            var node = stack[ --depth ];
            node.volume.Mins().subtract( AabbMax, bounds[ 0 ] );
            node.volume.Maxs().subtract( AabbMin, bounds[ 1 ] );
            var tmin = 1,
                lambda_min = 0,
                result1 = false;
            result1 = Bump.rayAabb2.create( rayFrom, rayDirectionInverse, signs, bounds,
                                            tmin, lambda_min, lambda_max );
            if( result1 ) {
              if( node.isinternal() ) {
                if( depth > threshold ) {
                  stack[ stack.length * 2 - 1 ] = undefined; / * stack.resize( stack.size() * 2 ); * /
                  threshold = stkStack.length - 2;
                }
                stack[ depth++ ] = node.childs[ 0 ];
                stack[ depth++ ] = node.childs[ 1 ];
              }
              else {
                policy.value.Process( node );
              }
            }
          } while( depth );
        }
      }
    },

    typeMembers: {
      maxdepth: function( node ) {}, // TODO
      countLeaves: function( node ) {}, // TODO
      extractLeaves: function( node, leavesRef ) {}, // TODO
      benchmark: function() {},
      // Note that policyRef is a by-reference icollide

      // iterate over all nodes and process according to the given policy
      enumNodes: function( root, policyRef ) {
        policyRef.value.ProcessNode( root );
        if( root.isinternal() ) {
          Bump.Dbvt.enumNodes( root.childs[ 0 ], policyRef );
          Bump.Dbvt.enumNodes( root.childs[ 1 ], policyRef );
        }
      },

      // iterate over only the leaf nodes and process according to the given policy
      enumLeaves: function( root, policyRef ) {
        if( root.isinternal() ) {
          Bump.Dbvt.enumLeaves( root.childs[ 0 ], policyRef );
          Bump.Dbvt.enumLeaves( root.childs[ 1 ], policyRef );
        }
        else {
          policyRef.value.ProcessNode( root );
        }
      },

      rayTest: function( root, rayFrom, rayTo, policyRef ) {
        if( root ) {
          var diff = rayTo.subtract( rayFrom ),
          rayDir = diff.normalized();

          var rayDirectionInverse;
          rayDirectionInverse.x = rayDir.x == 0 ? Bump.LARGE_FLOAT : 1 / rayDir.x;
          rayDirectionInverse.y = rayDir.y == 0 ? Bump.LARGE_FLOAT : 1 / rayDir.y;
          rayDirectionInverse.z = rayDir.z == 0 ? Bump.LARGE_FLOAT : 1 / rayDir.z;

          var signs = [
               rayDirectionInverse.x < 0,
               rayDirectionInverse.y < 0,
               rayDirectionInverse.z < 0
             ],
             lambda_max = rayDir.dot( diff ),
             resultNormal,
             stack = [],
             depth = -1,
             threshold = Bump.Dbvt.DOUBLE_STACKSIZE - 2;

          stack[ Bump.Dbvt.DOUBLE_STACKSIZE - 1 ] = undefined;
          stack[ 0 ] = root;

          var bounds = [];

          do {
            var node = stack[ --depth ];
            bounds[ 0 ] = node.volume.Mins();
            bounds[ 1 ] = node.volume.Maxs();

            var tmin = 1,
            lambda_min = 0,
            result1 = Bump.rayAabb2( rayFrom, rayDirectionInverse, signs,
                                     bounds, tmin, lambda_min, lambda_max);
/*
#ifdef COMPARE_BTRAY_AABB
				btScalar param=1.f;
				bool result2 = btRayAabb(rayFrom,rayTo,node->volume.Mins(),node->volume.Maxs(),param,resultNormal);
				btAssert(result1 == result2);
#endif //TEST_BTRAY_AABB2
*/
            if( result1 ) {
              if( node.isinternal() ) {
                if( depth > threshold ) {
                  stack[ stack.length * 2 - 1] = undefined;
                  threshold = stack.length - 2;
                }
                stack[ depth++ ] = node.childs[ 0 ];
                stack[ depth++ ] = node.childs[ 1 ];
              }
              else {
                policy.value.Process( node );
              }
            }
          } while( depth );
        }
      },

      collideKDOP: function( root, normals, offsets, count, policyRef ) {
        if( root ) {
          var inside = (1 << count) - 1,
              stack = [],
              signs = [];
          /* btAssert(count<int (sizeof(signs)/sizeof(signs[0]))); */

          for( var i = 0; i < count; i++ ) {
            signs[ i ] = ( ( normals[ i ].x >= 0) ? 1 : 0 ) +
              ( ( normals[ i ].y >= 0 ) ? 2 : 0 ) +
              ( ( normals[ i ].z >= 0 ) ? 4 : 0 );
          }

          /* stack.reserve( SIMPLE_STACKSIZE ); */
          stack.push( Bump.Dbvt.sStkNP.create( root, 0 ) );
          do {
            var se = stack[ stack.length() - 1 ],
                out = false;
            stack.pop();

            for( var i = 0, j = 1; ( !out ) && ( i < count ); ++i, j <<= 1 ) {
              if( 0 == ( se.mask & j ) ) {
                var side = se.node.volume.Classify( normals[i], offsets[i], signs[i] );
                switch(side) {
                case -1:
                  out=true; break;
                case +1:
                  se.mask |= j; break;
                }
              }
            }
            if( !out ) {
              if( (se.mask != inside ) && ( se.node->isinternal() ) ) {
                stack.push( Bump.Dbvt.sStkNP.create( se.node->childs[0],se.mask ) );
                stack.push( Bump.Dbvt.sStkNP.create( se.node->childs[1],se.mask ) );
              }
              else {
                if( policyRef.value.AllLeaves( se.node ) ) {
                  enumLeaves( se.node, policy );
                }
              }
            }
          } while( stack.length );
        }
      },

      collideOCL: function( root, normals, offsets, sortaxis, count, iPolicy, fullsort) {
        fullsort = (fullsort === undefined) || fullsort;
        // TODO
      },
      collideTU: function( root, policyRef ) {}, // TODO

      // i: array of integers,
      // a: array of `sStkNPS`,
      // v: float,
      // l: integer,
      // h: integer,
      nearest: function( i, a, v, l, h ) {
        var m = 0;
        while( l < h ) {
          m = ( l + h ) >> 1;
          if( a[ i[ m ] ].value >= v ) {
            l = m + 1;
          }
          else {
            h = m;
          }
        }
        return h;
      },

      allocate: function( ifree, stockRef ) {
        // TODO ?
      }
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
      ProcessNodeScalar: function( n, s ) {
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