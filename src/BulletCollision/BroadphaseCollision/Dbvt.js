// load: bump.js

// run: LinearMath/Vector3.js
// run: LinearMath/AlignedObjectArray.js
// run: LinearMath/AabbUtil2.js

// **Bump.Dbvt** is the port of the `btDbvt` class in
// [Bullet](http://bulletphysics.org).
// Original btDbvt implementation by Nathanael Presson.

(function( window, Bump ) {

  var createGetter = function( Type, pool ) {
    return function() {
      return pool.pop() || Type.create();
    };
  };

  var createDeller = function( pool ) {
    return function() {
      for ( var i = 0; i < arguments.length; ++i ) {
        pool.push( arguments[i] );
      }
    };
  };

  // memory pool for recycling Vector3 objects
  var vector3Pool = [];

  var getVector3 = createGetter( Bump.Vector3, vector3Pool );
  var delVector3 = createDeller( vector3Pool );

  // memory pool for recycling arrays
  var arrayPool = [];

  var getArray = function() {
    return arrayPool.pop() || [];
  };
  var delArray = function( arr ) {
    arr.length = 0;
    arrayPool.push( arr );
  };

  // memory pool for recycling arrays for the rayTest function
  var rayTestStackPool = [];
  var getRayTestStackArray = function( length ) {
    return rayTestStackPool.pop() || new Array( length );
  };
  var delRayTestStackArray = function( arr ) {
    rayTestStackPool.push( arr );
  };

  // Used in collideTV
  var tmpCTVVol1;

  // Do not change.
  var sStkNNZero;

  // **Bump.DbvtAabbMm** is the port of the `btDbvtAabbMm` class. "DbvtAabbMm"
  // stands for "Dynamic Bounding Volume Tree Axis-Aligned Bounding Box
  // Minimum/Maximum," meaning that it represents an AABB from 2 `Vector3`s, the
  // minimum `mi` bounds, and the maximum `mx` bounds.
  Bump.DbvtAabbMm = Bump.type({
    // Default constructor, sets mi and mx to zeroed `Vector3`s
    init: function DbvtAabbMm() {
      this.mi = Bump.Vector3.create();
      this.mx = Bump.Vector3.create();
    },

    members: {
      // Creates a deep copy of `this` DbvtAabbMm, storing the result in `dest`
      // if provided. Otherwise creates and returns a new DbvtAabbMm.
      clone: function( dest ) {
        var box = dest || Bump.DbvtAabbMm.create();
        box.mi.assign( this.mi );
        box.mx.assign( this.mx );
        return box;
      },

      assign: function( other ) {
        this.mi.assign( other.mi );
        this.mx.assign( other.mx );
        return this;
      },

      // A convenience function to replicate the static FromMM, but on an
      // existing DbvtAabbMm.
      setFromMM: function( mi, mx ) {
        this.mi.assign( mi );
        this.mx.assign( mx );
        return this;
      },

      // Compute the center of `this` bounding box. The result is stored in the
      // the `Vector3` `dest` if provided. Otherwise a new `Vector3` is created.
      Center: function( dest ) {
        if ( dest ) {
          return this.mi.add( this.mx, dest ).divideScalar( 2, dest );
        }
        var res = Bump.Vector3.create();
        return this.mi.add( this.mx, res ).divideScalar( 2, res );
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
        if ( dest ) {
          return this.mx.subtract( this.mi, dest ).divideScalar( 2, dest );
        }
        var res = Bump.Vector3.create();
        return this.mx.subtract( this.mi, res ).divideScalar( 2, res );
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
        if ( e.x > 0 ) {
          this.mx.x += e.x;
        }
        else{
          this.mi.x += e.x;
        }
        if ( e.y > 0 ) {
          this.mx.y += e.y;
        }
        else{
          this.mi.y += e.y;
        }
        if ( e.z > 0 ) {
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
        return( ( this.mi.x <= a.mi.x ) &&
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

        switch ( s ) {
        case ( 0 + 0 + 0 ):
          px.setValue( this.mi.x, this.mi.y, this.mi.z );
          pi.setValue( this.mx.x, this.mx.y, this.mx.z );
          break;
        case ( 1 + 0 + 0 ):
          px.setValue( this.mx.x, this.mi.y, this.mi.z );
          pi.setValue( this.mi.x, this.mx.y, this.mx.z );
          break;
        case ( 0 + 2 + 0 ):
          px.setValue( this.mi.x, this.mx.y, this.mi.z );
          pi.setValue( this.mx.x, this.mi.y, this.mx.z );
          break;
        case ( 1 + 2 + 0 ):
          px.setValue( this.mx.x, this.mx.y, this.mi.z );
          pi.setValue( this.mi.x, this.mi.y, this.mx.z );
          break;
        case ( 0 + 0 + 4 ):
          px.setValue( this.mi.x, this.mi.y, this.mx.z );
          pi.setValue( this.mx.x, this.mx.y, this.mi.z );
          break;
        case ( 1 + 0 + 4 ):
          px.setValue( this.mx.x, this.mi.y, this.mx.z );
          pi.setValue( this.mi.x, this.mx.y, this.mi.z );
          break;
        case ( 0 + 2 + 4 ):
          px.setValue( this.mi.x, this.mx.y, this.mx.z );
          pi.setValue( this.mx.x, this.mi.y, this.mi.z );
          break;
        case ( 1 + 2 + 4 ):
          px.setValue( this.mx.x, this.mx.y, this.mx.z );
          pi.setValue( this.mi.x, this.mi.y, this.mi.z );
          break;
        }

        if ( ( n.dot( px ) + o ) < 0 ) {
          return -1;
        }

        if ( ( n.dot( pi ) + o ) >= 0 ) {
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
      AddSpan: function( d, span ) {
        // unrolled to avoid array-like access of Vector3
        // properties, which is slow
        if ( d.x < 0 ) {
          span.smi += this.mx.x * d.x;
          span.smx += this.mi.x * d.x;
        }
        else{
          span.smi += this.mi.x * d.x;
          span.smx += this.mx.x * d.x;
        }
        if ( d.y < 0 ) {
          span.smi += this.mx.y * d.y;
          span.smx += this.mi.y * d.y;
        }
        else{
          span.smi += this.mi.y * d.y;
          span.smx += this.mx.y * d.y;
        }
        if ( d.z < 0 ) {
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
        for ( var i = 1; i < n; ++i ) {
          box.mi.setMin( pts[ i ] );
          box.mx.setMax( pts[ i ] );
        }
        return box;
      }
    }
  });

  // emulates typedef btDbvtAabbMm btDbvtVolume
  Bump.DbvtVolume = Bump.DbvtAabbMm;

  Bump.Intersect = {}; // object to hold global intersect functions
  Bump.Intersect.DbvtAabbMm = {}; // intersect tests for DbvtAabbMm
  Bump.Intersect.DbvtVolume = Bump.Intersect.DbvtAabbMm; // typedef consistency

  // Intersect test for 2 `DbvtAabbMm`s
  Bump.Intersect.DbvtAabbMm2 = function( a, b ) {
    return ( ( a.mi.x <= b.mx.x ) &&
             ( a.mx.x >= b.mi.x ) &&
             ( a.mi.y <= b.mx.y ) &&
             ( a.mx.y >= b.mi.y ) &&
             ( a.mi.z <= b.mx.z ) &&
             ( a.mx.z >= b.mi.z ) );
  };
  Bump.Intersect.DbvtVolume2 = Bump.Intersect.DbvtAabbMm2; // typedef consistency

  // Intersect test for `DbvtAabbMm` `a` and `Vector3` `b`
  Bump.Intersect.DbvtAabbMm.Vector3 = function( a, b ) {
    return ( ( b.x >= a.mi.x ) &&
             ( b.y >= a.mi.y ) &&
             ( b.z >= a.mi.z ) &&
             ( b.x <= a.mx.x ) &&
             ( b.y <= a.mx.y ) &&
             ( b.z <= a.mx.z ) );
  };

  Bump.Proximity = {};

  var tmpProxVec1 = Bump.Vector3.create();
  var tmpProxVec2 = Bump.Vector3.create();
  // Given `DbvtAabbMm`s `a` and `b`, compute the "proximity", which is twice the
  // Manhattan distance between the centers
  Bump.Proximity.DbvtAabbMm2 = function( a, b ) {
    var d = a.mi.add( a.mx, tmpProxVec1 )
      .subtractSelf( b.mi.add( b.mx, tmpProxVec2 ) );

    return Math.abs( d.x ) + Math.abs( d.y ) + Math.abs( d.z );
  };
  Bump.Proximity.DbvtVolume2 = Bump.Proximity.DbvtAabbMm2; // typedef consistency

  Bump.Select = {};
  // Given `DbvtAabbMm`s `o`, `a`, and `b`, returns 0 if `o` is closer to `a`
  // than to `b`, else returns 1. Distance is measured using `Proximity`.
  Bump.Select.DbvtAabbMm3 = function( o, a, b ) {
    return ( Bump.Proximity.DbvtAabbMm2( o, a ) <
             Bump.Proximity.DbvtAabbMm2( o, b ) ) ? 0 : 1;
  };
  Bump.Select.DbvtVolume3 = Bump.Select.DbvtAabbMm3; // typedef consistency

  Bump.Merge = {};
  Bump.Merge.DbvtAabbMm3 = function( a, b, r ) {
    // unrolled to avoid array-like vector access (for speed)
    if ( a.mi.x < b.mi.x ) {
      r.mi.x = a.mi.x;
    }
    else {
      r.mi.x = b.mi.x;
    }
    if ( a.mx.x > b.mx.x ) {
      r.mx.x = a.mx.x;
    }
    else {
      r.mx.x = b.mx.x;
    }

    if ( a.mi.y < b.mi.y ) {
      r.mi.y = a.mi.y;
    }
    else {
      r.mi.y = b.mi.y;
    }
    if ( a.mx.y > b.mx.y ) {
      r.mx.y = a.mx.y;
    }
    else {
      r.mx.y = b.mx.y;
    }

    if ( a.mi.z < b.mi.z ) {
      r.mi.z = a.mi.z;
    }
    else {
      r.mi.z = b.mi.z;
    }
    if ( a.mx.z > b.mx.z ) {
      r.mx.z = a.mx.z;
    }
    else {
      r.mx.z = b.mx.z;
    }
  };
  Bump.Merge.DbvtVolume3 = Bump.Merge.DbvtAabbMm3; // typedef consistency

  Bump.NotEqual = {};
  Bump.NotEqual.DbvtAabbMm2 = function( a, b ) {
    return (( a.mi.x !== b.mi.x ) ||
            ( a.mi.y !== b.mi.y ) ||
            ( a.mi.z !== b.mi.z ) ||
            ( a.mx.x !== b.mx.x ) ||
            ( a.mx.y !== b.mx.y ) ||
            ( a.mx.z !== b.mx.z ));
  };
  Bump.NotEqual.DbvtVolume2 = Bump.NotEqual.DbvtAabbMm2; // typedef consistency


  // **Bump.DbvtNode** is the port of the `btDbvtNode` struct.
  Bump.DbvtNode = Bump.type({
    init: function DbvtNode() {
      this.volume = Bump.DbvtVolume.create();
      this.parent = 0;
      // _unionValue should not be modified directly by outside code
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
        // unrolled to avoid property access, which is slower
        // return this.childs[1] === 0;
        return this._unionValue[ 1 ] === 0;
      },

      isinternal: function() {
        // unrolled to avoid extra function call
        // return !this.isleaf();
        return this._unionValue[ 1 ] !== 0;
      }
    }
  });


  // The following are functions are ported from the static helper functions
  // defined in `btDbvt.cpp`, external to the btDbvt struct.
  // Since these functions do not appear to be used outside of Dbvt.js, they
  // don't need to be publically accessible, for now at least.

  // static DBVT_INLINE int indexof(const btDbvtNode* node)
  var indexof = function( node ) {
    return node.parent.childs[ 1 ] === node ? 1 : 0;
  },

  merge = function( a, b ) {
    var res = Bump.DbvtVolume.create();
    Bump.Merge.DbvtVolume3( a, b, res );
    return res;
  },

  size = function( a ) {
    var edges = a.Lengths();
    return edges.x * edges.y * edges.z + edges.x + edges.y + edges.z;
  },

  getmaxdepth = function( node, depth, maxdepthRef ) {
    if ( node.isinternal() ) {
      getmaxdepth( node.childs[ 0 ], depth + 1, maxdepthRef );
      getmaxdepth( node.childs[ 1 ], depth + 1, maxdepthRef );
    }
    else {
      maxdepthRef.value = Math.max( maxdepthRef.value, depth );
    }
  },

  deletenode = function( pdbvt, node ) {
    // btAlignedFree(pdbvt->free);
    pdbvt.free = node;
  },

  recursedeletenode = function( pdbvt, node ) {
    if ( node.isleaf() ) {
      recursedeletenode( pdbvt, node.childs[ 0 ] );
      recursedeletenode( pdbvt, node.childs[ 1 ] );
    }

    if ( node === pdbvt.root ) {
      pdbvt.root = 0;
    }

    deletenode( pdbvt, node );
  },

  // overloaded createnode functions have been renamed
  createnodeTreeParentData = function( pdbvt, parent, data ) {
    var node;
    if ( pdbvt.free ) {
      node = pdbvt.free;
      pdbvt.free = 0;
    } else {
      node = Bump.DbvtNode.create();
    }

    node.parent = parent;
    node.data = data;
    node.childs[ 1 ] = 0; // redundant?
    return node;
  },

  createnodeTreeParentVolumeData = function( pdbvt, parent, volume, data ) {
    var node = createnodeTreeParentData( pdbvt, parent, data );
    volume.clone( node.volume );
    return node;
  },

  createnodeTreeParentVolume2Data = function( pdbvt, parent, volume0, volume1, data ) {
    var node = createnodeTreeParentData( pdbvt, parent, data );
    Bump.Merge.DbvtVolume3( volume0, volume1, node.volume );
    return node;
  },

  insertleaf = function( pdbvt, root, leaf ) {
    if ( !pdbvt.root ) {
      pdbvt.root = leaf;
      leaf.parent = 0;
    }

    else {
      if ( !root.isleaf() ) {
        do {
          root = root.childs[
            Bump.Select.DbvtVolume3( leaf.volume,
                                     root.childs[0].volume,
                                     root.childs[1].volume )
          ];
        } while ( !root.isleaf() );
      }

      var prev = root.parent;
      var node = createnodeTreeParentVolume2Data( pdbvt, prev, leaf.volume, root.volume, 0 );
      if ( prev ) {
        prev.childs[ indexof( root ) ] = node;
        node.childs[ 0 ] = root;
        root.parent = node;
        node.childs[ 1 ] = leaf;
        leaf.parent = node;
        do {
          if ( !prev.volume.Contain( node.volume ) ) {
            Bump.Merge.DbvtVolume3( prev.childs[ 0 ].volume, prev.childs[ 1 ].volume, prev.volume );
          } else {
            break;
          }
          node = prev;
          prev = node.parent;
        } while ( 0 !== prev );
      }

      else {
        node.childs[ 0 ] = root;
        root.parent = node;
        node.childs[ 1 ] = leaf;
        leaf.parent = node;
        pdbvt.root = node;
      }
    }
  },

  removeleaf = function( pdbvt, leaf ) {
    if ( leaf === pdbvt.root ) {
                pdbvt.root = 0;
                return 0;
    }

    else {
      var parent = leaf.parent,
      prev = parent.parent,
      sibling = parent.childs[ 1 - indexof( leaf ) ];
      if ( prev ) {
        prev.childs[ indexof( parent ) ] = sibling;
        sibling.parent = prev;
        deletenode( pdbvt, parent );
        while ( prev ) {
          var pb = prev.volume;
          Bump.Merge.DbvtVolume3( prev.childs[ 0 ].volume, prev.childs[ 1 ].volume, prev.volume );
          if ( Bump.NotEqual.DbvtVolume2( pb, prev.volume ) ) {
            prev = prev.parent;
          } else {
            break;
          }
        }
        return prev || pdbvt.root;
      }

      else {
        pdbvt.root = sibling;
        sibling.parent = 0;
        deletenode( pdbvt, parent );
        return pdbvt.root;
      }
    }
  },

  fetchleaves = function( pdbvt, root, leaves, depth ) {
    depth = ( depth === undefined ) ? -1 : depth;
    if ( root.isinternal() && depth ) {
      fetchleaves( pdbvt, root.childs[ 0 ], leaves, depth - 1 );
      fetchleaves( pdbvt, root.childs[ 1 ], leaves, depth - 1 );
      deletenode( pdbvt, root );
    } else {
      leaves.push( root );
    }
  },

  split = function( leaves, left, right, org, axis ) {
    left.splice( 0 );           // left.resize( 0 );
    right.splice( 0 );          // right.resize( 0 );
    var tmpVector3 = Bump.Vector3.create();
    for ( var i = 0, ni = leaves.length; i < ni; ++i ) {
      if ( axis.dot( leaves[ i ].volume.Center().subract( org, tmpVector3 ) ) < 0 ) {
        left.push( leaves[ i ] );
      } else {
        right.push( leaves[ i ] );
      }
    }
  },

  bounds = function( leaves ) {
    var volume = leaves[0].volume.clone();
    for ( var i = 1, ni = leaves.length; i < ni; ++i ) {
      Bump.Merge.DbvtVolume3( volume, leaves[i].volume, volume );
    }
    return volume;
  },

  bottomup = function( pdbvt, leaves ) {
    while ( leaves.length > 1 ) {
      var minsize = Bump.SIMD_INFINITY,
      minidx = [ -1, -1 ];
      for ( var i = 0; i < leaves.length; ++i ) {
        for ( var j = i + 1; j < leaves.length; ++j ) {
          var sz = size( merge( leaves[i].volume, leaves[j].volume ) );
          if ( sz < minsize ) {
            minsize = sz;
            minidx[ 0 ] = i;
            minidx[ 1 ] = j;
          }
        }
      }
      var n = [ leaves[ minidx[0] ], leaves[ minidx[1] ] ],
          p = createnodeTreeParentVolume2Data( pdbvt, 0, n[0].volume, n[1].volume, 0 );
      p.childs[0] = n[0];
      p.childs[1] = n[1];
      n[0].parent = p;
      n[1].parent = p;
      leaves[ minidx[0] ] = p;
      leaves[ minidx[1] ] = leaves[ leaves.length - 1 ]; // instead of swap
      leaves.pop();
    }
  },

  topdown = function( pdbvt, leaves, bu_threshold ) {
    var axis = [
      Bump.Vector3.create( 1, 0, 0 ),
      Bump.Vector3.create( 0, 1, 0 ),
      Bump.Vector3.create( 0, 0, 1 )
    ];

    if ( leaves.length > 1 ) {
      if ( leaves.length > bu_threshold ) {
        var vol = bounds( leaves ),
            org = vol.Center().clone(),
            sets = [],
            bestaxis = -1,
            bestmidp = leaves.length,
            splitcount = [ [ 0, 0 ], [ 0, 0 ], [ 0, 0 ] ],
            i;

        for ( i = 0; i < leaves.length; ++i ) {
          var x = leaves[i].volume.Center().subtract( org );
          for ( var j = 0; j < 3; ++j ) {
            ++splitcount[ j ][ x.dot( axis[j] ) > 0 ? 1 : 0 ];
          }
        }

        for ( i = 0; i < 3; ++i ) {
          if ( ( splitcount[i][0] > 0 ) && ( splitcount[i][1] > 0 ) ) {
            var midp = Math.abs( splitcount[i][0] - splitcount[i][1] );
            if ( midp < bestmidp ) {
              bestaxis = i;
              bestmidp = midp;
            }
          }
        }

        if ( bestaxis >= 0 ) {
          // sets[ 0 ].reserve( splitcount[ bestaxis ][ 0 ] );
          // sets[ 1 ].reserve( splitcount[ bestaxis ][ 1 ] );
          split( leaves, sets[0], sets[1], org, axis[ bestaxis ] );
        } else {
          // sets[0].reserve(leaves.size()/2+1);
          // sets[1].reserve(leaves.size()/2);
          for ( var k = 0, ni = leaves.length; k < ni; ++k ) {
            sets[ k & 1 ].push( leaves[k] );
          }
        }
        var node = createnodeTreeParentVolumeData( pdbvt, 0, vol, 0 );
        node.childs[0] = topdown( pdbvt, sets[0], bu_threshold );
        node.childs[1] = topdown( pdbvt, sets[1], bu_threshold );
        node.childs[0].parent = node;
        node.childs[1].parent = node;
        return( node );
      } else {
        bottomup( pdbvt, leaves );
        return leaves[0];
      }
    }

    return leaves[0];
  },

  // `n` : `DbvtNode`,
  // `rRef` : a "by-reference" `DbvtNode`
  sort = function( n, rRef ) {
    var p = n.parent;
    // Bump.Assert( n.isinternal() );
    if ( p > n ) {
      var i = indexof( n ),
      j = 1 - i,
      s = p.childs[ j ],
      q = p.parent;
      // Bump.Assert( n === p.childs[i] );

      if ( q ) {
        q.childs[ indexof( p ) ] = n;
      }
      else {
        rRef.value = n;
      }
      s.parent = n;
      p.parent = n;
      n.parent = q;
      p.childs[ 0 ] = n.childs[ 0 ];
      p.childs[ 1 ] = n.childs[ 1 ];
      n.childs[ 0 ].parent = p;
      n.childs[ 1 ].parent = p;
      n.childs[ i ] = p;
      n.childs[ j ] = s;
      // btSwap(p->volume,n->volume);
      var tmp = p.volume;
      p.volume = n.volume;
      n.volume = tmp;

      return p;
    }
    return n;
  };

  // Used in updateLeafVolumeMargin and updateLeafVolumeVelocityMargin
  var tmpMargin = Bump.Vector3.create();

  // **Bump.Dbvt** is the port of the `btDbvt` struct. Original documentation
  // as follows:
  //
  // The `btDbvt` class implements a fast dynamic bounding volume tree based on
  // axis aligned bounding boxes (aabb tree). This `btDbvt` is used for soft
  // body collision detection and for the `btDbvtBroadphase`. It has a fast
  // insert, remove and update of nodes. Unlike the `btQuantizedBvh`, nodes can
  // be dynamically moved around, which allows for change in topology of the
  // underlying data structure.
  Bump.Dbvt = Bump.type({
    init: function Dbvt() {
      // Default initializers
      this.stkStack = [];       // array of `Dbvt.sStkNN`
      this.rayTestStack = [];   // array of `DbvtNode`
      // End default initializers

      // !!!: The pointers should be `null`! >:o
      this.root   = 0;          // DbvtNode*
      this.free   = 0;          // DbvtNode*
      this.lkhd   = -1;         // int
      this.leaves = 0;          // int
      this.opath  = 0;          // unsigned
    },

    members: {
      clear: function() {
        if ( this.root ) {
          // recursedeletenode( this, this.root );
          this.root = 0; // added because this because recursedelete is no longer called
          this.leaves = 0; // added because this because recursedelete is no longer called
          // btAlignedFree(this.free);
          this.free = 0;
          this.lkhd = -1;
          this.stkStack.splice( 0 );
          this.opath = 0;
        }
      },

      empty: function() { return ( 0 === this.root ); },

      optimizeBottomUp: function() {
        if ( this.root ) {
          var leaves = [];
          // leaves.reserve(this.leaves);
          fetchleaves( this, this.root, leaves );
          bottomup( this, leaves );
          this.root = leaves[ 0 ];
        }
      },

      optimizeTopDown: function( bu_threshold ) {
        bu_threshold = bu_threshold || 128;
        if ( this.root ) {
          var leaves = [];
          // leaves.reserve(this.leaves);
          fetchleaves( this, this.root, leaves );
          this.root = topdown( this, leaves, bu_threshold );
        }
      },

      optimizeIncremental: function( passes ) {
        if ( passes < 0 ) {
          passes = this.leaves;
        }
        if ( this.root && ( passes > 0 ) ) {
          do {
            var node = this.root,
                bit = 0;
            while ( node.isinternal() ) {
              node = sort( node, this.root ).childs[ ( this.opath >> bit ) & 1 ];
              // bit = ( bit + 1 ) & ( sizeof ( unsigned ) * 8 - 1 );
              bit = ( bit + 1 ) & 31;
            }
            this.updateLeafLookahead( node );
            ++this.opath;
          } while ( --passes );
        }
      },

      insert: function( volume, data ) {
        var leaf = createnodeTreeParentVolumeData( this, 0, volume, data );
        insertleaf( this, this.root, leaf );
        ++this.leaves;
        return leaf;
      },

      // The `updateLeafLookahead` and `updateLeafVolume` functions have been renamed from
      // overloaded versions of `btDbvt`s `update` function.
      updateLeafLookahead: function( leaf, lookahead ) {
        lookahead = lookahead === undefined ? -1 : lookahead;
        var root = removeleaf( this, leaf );
        if ( root ) {
          if ( lookahead >= 0 ) {
            for ( var i = 0; ( i < lookahead ) && root.parent; ++i ) {
              root = root.parent;
            }
          } else {
            root = this.root;
          }
        }
        insertleaf( this, root, leaf );
      },

      updateLeafVolume: function( leaf, volume ) {
        var root = removeleaf( this, leaf );
        if ( root ) {
          if ( this.lkhd >= 0 ) {
            for ( var i = 0; ( i < this.lkhd ) && root.parent; ++i ) {
              root = root.parent;
            }
          } else {
            root = this.root;
          }
        }

        leaf.volume.assign( volume );
        insertleaf( this, root, leaf );
      },

      updateLeafVolumeVelocityMargin: function(  leaf, volume, velocity, margin  ) {
        if ( leaf.volume.Contain( volume ) ) {
          return false;
        }

        volume.Expand( tmpMargin.setValue( margin, margin, margin ) );
        volume.SignedExpand( velocity );
        this.updateLeafVolume( leaf, volume );
        return true;

      },

      updateLeafVolumeVelocity: function(  leaf, volume, velocity  ) {
        if ( leaf.volume.Contain( volume ) ) {
          return false;
        }

        volume.SignedExpand( velocity );
        this.updateLeafVolume( leaf, volume );
        return true;
      },

      updateLeafVolumeMargin: function(  leaf, volume, margin  ) {
        if ( leaf.volume.Contain( volume ) ) {
          return false;
        }

        volume.Expand( tmpMargin.setValue( margin, margin, margin ) );
        this.updateLeafVolume( leaf, volume );
        return true;
      },

      remove: function( leaf ) {
        removeleaf( this, leaf );
        deletenode( this, leaf );
        --this.leaves;
      },

      write: function( iwriter ) {
        var nodes = Bump.DbvtNodeEnumerator.create();
        // nodes.nodes.reserve(leaves*2);
        Bump.Dbvt.enumNodes( this.root, nodes );
        iwriter.Prepare( this.root, nodes.nodes.length );
        for ( var i = 0; i < nodes.nodes.length; ++i ) {
          var n = nodes.nodes[ i ],
              p = -1;
          if ( n.parent ) {
            p = nodes.nodes.indexOf( n.parent );
          }
          if ( n.isinternal() ) {
            var c0 = nodes.nodes.indexOf( n.childs[0] );
            var c1 = nodes.nodes.indexOf( n.childs[1] );
            iwriter.WriteNode( n, i, p, c0, c1 );
          }
          else {
            iwriter.WriteLeaf( n, i, p );
          }
        }
      },

      clone: function( dest, iclone ) {
        dest.clear();
        if ( this.root !== 0 ) {
          var stack = [];
          // stack.reserve(this.leaves);
          stack.push( Bump.Dbvt.sStkCLN.create( this.root, 0 ) );
          do {
            // Note that this was altered to ensure that the cloned tree is EXACTLY the same as the
            // original. Previously there was an issue with children swapping indices, creating a
            // copy that, while equivalent in tree structure, is techincally not identical.
            // var i = stack.length - 1,
            //     e = stack[i],
            var e = stack.pop(),
            n = createnodeTreeParentVolumeData( dest, e.parent, e.node.volume, e.node.data );
            // stack.pop();
            if ( e.parent !== 0 ) {
              // e.parent.childs[ i & 1 ] = n; nice trick, but doesn't work if you want an exact clone
              e.parent.childs[ indexof( e.node ) ] = n;
            }
            else {
              dest.root = n;
            }
            if ( e.node.isinternal() ) {
              stack.push( Bump.Dbvt.sStkCLN.create(e.node.childs[0], n ) );
              stack.push( Bump.Dbvt.sStkCLN.create(e.node.childs[1], n ) );
            }
            else if ( iclone ) { // added if to make sure iclone is defined
              iclone.CloneLeaf( n );
            }
          } while ( stack.length > 0 );
        }
      },

      // Process collision between two `Dbvt` trees with roots `root0` and `root1`, according
      // to the given `iCollide` `policy`.
      // TODO : Add description of use.
      collideTT: function( root0, root1, policy ) {
        if ( root0 && root1 ) {
          var depth = 1,
              threshold = Bump.Dbvt.DOUBLE_STACKSIZE - 4,
              stkStack = [];
          stkStack[ Bump.Dbvt.DOUBLE_STACKSIZE - 1 ] = undefined; // stkStack.resize( DOUBLE_STACKSIZE );
          stkStack[ 0 ] = Bump.Dbvt.sStkNN.create( root0, root1 );

          do {
            var p = stkStack[ --depth ];
            if ( depth > threshold ) {
              stkStack[ stkStack.length * 2 - 1 ] = undefined; // stkStack.resize( stkStack.size() * 2 );
              threshold = stkStack.length - 4;
            }
            if ( p.a === p.b ) {
              if ( p.a.isinternal() ) {
                stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a.childs[ 0 ], p.a.childs[ 0 ] );
                stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a.childs[ 1 ], p.a.childs[ 1 ] );
                stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a.childs[ 0 ], p.a.childs[ 1 ] );
              }
            }
            else if ( Bump.Intersect.DbvtVolume2( p.a.volume, p.b.volume ) ) {
              if ( p.a.isinternal() ) {
                if ( p.b.isinternal() ) {
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
                if ( p.b.isinternal() ) {
                  stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a, p.b.childs[ 0 ] );
                  stkStack[ depth++ ] = Bump.Dbvt.sStkNN.create( p.a, p.b.childs[ 1 ] );
                }
                else {
                  policy.ProcessNode2( p.a, p.b );
                }
              }
            }
          } while ( depth );
        }
      },

      collideTTpersistentStack: function( root0, root1, policy ) {
        if ( root0 && root1 ) {
          var depth = 1,
              threshold = Bump.Dbvt.DOUBLE_STACKSIZE - 4;

          Bump.resize( this.stkStack, Bump.Dbvt.DOUBLE_STACKSIZE, sStkNNZero );
          this.stkStack[0].set( root0, root1 );

          do {
            var p = this.stkStack[ --depth ];

            // So for some reason, using the getter property p.a.childs causes
            // some weird bugs, and for some unknown reason, saving it first to
            // a variable bypasses it. I don't know why. T_T
            //
            // - EL
            var a0, a1;

            if ( depth > threshold ) {
              Bump.resize( this.stkStack, this.stkStack.length * 2, sStkNNZero );
              threshold = this.stkStack.length - 4;
            }

            if ( p.a === p.b ) {
              if ( p.a.isinternal() ) {
                a0 = p.a.childs[0];
                a1 = p.a.childs[1];
                this.stkStack[ depth++ ].set( a0, a0 );
                this.stkStack[ depth++ ].set( a1, a1 );
                this.stkStack[ depth++ ].set( a0, a1 );
              }
            }

            else if ( Bump.Intersect.DbvtVolume2( p.a.volume, p.b.volume ) ) {
              if ( p.a.isinternal() ) {
                a0 = p.a.childs[0];
                a1 = p.a.childs[1];
                if ( p.b.isinternal() ) {
                  this.stkStack[ depth++ ].set( a0, p.b.childs[0] );
                  this.stkStack[ depth++ ].set( a1, p.b.childs[0] );
                  this.stkStack[ depth++ ].set( a0, p.b.childs[1] );
                  this.stkStack[ depth++ ].set( a1, p.b.childs[1] );
                } else {
                  this.stkStack[ depth++ ].set( a0, p.b );
                  this.stkStack[ depth++ ].set( a1, p.b );
                }
              }

              else {
                if ( p.b.isinternal() ) {
                  this.stkStack[ depth++ ].set( p.a, p.b.childs[0] );
                  this.stkStack[ depth++ ].set( p.a, p.b.childs[1] );
                } else {
                  policy.ProcessNode2( p.a, p.b );
                }
              }
            }
          } while ( depth );
        }
      },

      // Process collision between a `Dbvt` tree, starting at `root`, and
      // `DbvtVolume` `vol` according to the given policy. ???
      collideTV: function( root, vol, policy ) {
        if ( root ) {
          var volume = vol.clone( tmpCTVVol1 ),
              stack = [];
          // stack.resize( 0 );
          // stack.reserve( SIMPLE_STACKSIZE );
          stack.push( root );
          do {
            var n = stack[stack.length - 1];
            stack.pop();
            if ( Bump.Intersect.DbvtVolume2( n.volume, volume ) ) {
              if ( n.isinternal() ) {
                stack.push( n.childs[ 0 ] );
                stack.push( n.childs[ 1 ] );
              } else {
                policy.ProcessNode( n );
              }
            }
          } while ( stack.length > 0 );
        }
      },

      rayTestInternal: function(
        root,
        rayFrom,
        rayTo,
        rayDirectionInverse,
        signs,
        lambda_max,
        aabbMin,
        aabbMax,
        policy
      ) {
        if ( root ) {
          // not used
          // var resultNormal = Bump.Vector3.create();

          var depth = 1,
              threshold = Bump.Dbvt.DOUBLE_STACKSIZE - 2,
              stack = this.rayTestStack,
              bounds = [ getVector3(), getVector3() ];
          Bump.resize( stack, Bump.Dbvt.DOUBLE_STACKSIZE, undefined );
          stack[ 0 ] = root;
          do {
            var node = stack[ --depth ];
            node.volume.Mins().subtract( aabbMax, bounds[ 0 ] );
            node.volume.Maxs().subtract( aabbMin, bounds[ 1 ] );
            var tmin = { tmin: 1 }, // primitive "passed by reference"
                lambda_min = 0,
                result1 = false;
            result1 = Bump.RayAabb2( rayFrom, rayDirectionInverse, signs, bounds,
                                     tmin, lambda_min, lambda_max );
            if ( result1 ) {
              if ( node.isinternal() ) {
                if ( depth > threshold ) {
                  stack[ stack.length * 2 - 1 ] = undefined; // stack.resize( stack.size() * 2 );
                  threshold = stack.length - 2;
                }
                stack[ depth++ ] = node.childs[ 0 ];
                stack[ depth++ ] = node.childs[ 1 ];
              }

              else {
                policy.ProcessNode( node );
              }
            }
          } while ( depth );

          delVector3( bounds[ 0 ], bounds[ 1 ] )
        }
      }

    },

    typeMembers: {
      maxdepth: function( node ) {
        var depth = { value: 0 };
        if ( node ) {
          getmaxdepth( node, 1, depth );
        }
        return depth.value;
      },

      countLeaves: function( node ) {
        if ( node.isinternal() ) {
          return( Bump.Dbvt.countLeaves( node.childs[ 0 ] ) +
                  Bump.Dbvt.countLeaves( node.childs[ 1 ] ) );
        }
        else {
          return 1;
        }
      },

      extractLeaves: function( node, leaves ) {
        if ( node.isinternal() ) {
          Bump.Dbvt.extractLeaves( node.childs[ 0 ], leaves );
          Bump.Dbvt.extractLeaves( node.childs[ 1 ], leaves );
        }
        else {
          leaves.push( node );
        }
      },

      // omitting this function for now
      benchmark: Bump.noop,

      // iterate over all nodes and process according to the given policy
      enumNodes: function( root, policy ) {
        policy.ProcessNode( root );
        if ( root.isinternal() ) {
          Bump.Dbvt.enumNodes( root.childs[ 0 ], policy );
          Bump.Dbvt.enumNodes( root.childs[ 1 ], policy );
        }
      },

      // iterate over only the leaf nodes and process according to the given policy
      enumLeaves: function( root, policy ) {
        if ( root.isinternal() ) {
          Bump.Dbvt.enumLeaves( root.childs[ 0 ], policy );
          Bump.Dbvt.enumLeaves( root.childs[ 1 ], policy );
        }
        else {
          policy.ProcessNode( root );
        }
      },

      rayTest: function( root, rayFrom, rayTo, policy ) {
        if ( root ) {
          var tmpV1 = getVector3();
          var tmpV2 = getVector3();
          var tmpV3 = getVector3();

          var diff = rayTo.subtract( rayFrom, tmpV1 ),
          rayDir = diff.normalized( tmpV2 );

          var rayDirectionInverse = tmpV3.setValue(
            rayDir.x === 0 ? Infinity : 1 / rayDir.x,
            rayDir.y === 0 ? Infinity : 1 / rayDir.y,
            rayDir.z === 0 ? Infinity : 1 / rayDir.z
          );

          var signs = getArray();
          signs[ 0 ] = rayDirectionInverse.x < 0 ? 1 : 0;
          signs[ 1 ] = rayDirectionInverse.y < 0 ? 1 : 0;
          signs[ 2 ] = rayDirectionInverse.z < 0 ? 1 : 0;

          var lambda_max = rayDir.dot( diff );
          var resultNormal;
          var stack = getRayTestStackArray( Bump.Dbvt.DOUBLE_STACKSIZE );
          // note that it is possible that stack's length is greater than the
          // requested size, if it has been recycled from a previous call

          var depth = 1;
          var threshold = stack.length - 2;

          stack[ 0 ] = root;

          var bounds = getArray();

          do {
            var node = stack[ --depth ];
            bounds[ 0 ] = node.volume.Mins();
            bounds[ 1 ] = node.volume.Maxs();

            var tmin = { tmin: 1 },
            lambda_min = 0,
            result1 = Bump.RayAabb2( rayFrom, rayDirectionInverse, signs,
                                     bounds, tmin, lambda_min, lambda_max );
            if ( result1 ) {
              if ( node.isinternal() ) {
                if ( depth > threshold ) {
                  // if we are resizing, just discard the old array
                  Bump.resize( stack, stack.length * 2 );
                  threshold = stack.length - 2;
                }
                stack[ depth++ ] = node.childs[ 0 ];
                stack[ depth++ ] = node.childs[ 1 ];
              }
              else {
                policy.ProcessNode( node );
              }
            }
          } while ( depth );

          delVector3( tmpV1, tmpV2, tmpV3, tmpV4, tmpV5 );
          delRayTestStackArray( stack );
          delArray( signs, bounds );
        }
      },

      collideKDOP: function( root, normals, offsets, count, policy ) {
        if ( root ) {
          var inside = ( 1 << count ) - 1,
              stack = [],
              signs = [],
              i, j;
          // Bump.Assert( count < sizeof(signs) / sizeof(signs[0]) );

          for ( i = 0; i < count; i++ ) {
            signs[ i ] = ( ( normals[ i ].x >= 0 ) ? 1 : 0 ) +
              ( ( normals[ i ].y >= 0 ) ? 2 : 0 ) +
              ( ( normals[ i ].z >= 0 ) ? 4 : 0 );
          }

          // stack.reserve( SIMPLE_STACKSIZE );
          stack.push( Bump.Dbvt.sStkNP.create( root, 0 ) );
          do {
            var se = stack[ stack.length() - 1 ],
                out = false;
            stack.pop();

            for ( i = 0, j = 1; ( !out ) && ( i < count ); ++i, j <<= 1 ) {
              if ( 0 === ( se.mask & j ) ) {
                var side = se.node.volume.Classify( normals[i], offsets[i], signs[i] );
                switch ( side ) {
                case -1:
                  out=true; break;
                case +1:
                  se.mask |= j; break;
                }
              }
            }
            if ( !out ) {
              if ( (se.mask !== inside) && (se.node.isinternal()) ) {
                stack.push( Bump.Dbvt.sStkNP.create( se.node.childs[0],se.mask ) );
                stack.push( Bump.Dbvt.sStkNP.create( se.node.childs[1],se.mask ) );
              }
              else {
                if ( policy.AllLeaves( se.node ) ) {
                  Bump.Dbvt.enumLeaves( se.node, policy );
                }
              }
            }
          } while ( stack.length );
        }
      },

      collideOCL: function( root, normals, offsets, sortaxis, count, policy, fsort ) {
        fsort = ( fsort === undefined ) || fsort;

        if ( root ) {
          var srtsgns = ( sortaxis.x >= 0 ? 1 : 0 ) +
                        ( sortaxis.y >= 0 ? 2 : 0 ) +
                        ( sortaxis.z >= 0 ? 4 : 0 ),
              inside = (1 << count ) - 1,
              stock = [],
              ifree= [],
              stack = [],
              signs = [],
              i, j, k;
          // Bump.Assert( count < sizeof(signs) / sizeof(signs[0]) );
          for ( i = 0; i < count; ++i ) {
            signs[ i ] = ( ( normals[ i ].x >= 0 ) ? 1 : 0 ) +
              ( ( normals[ i ].y >= 0 ) ? 2 : 0 ) +
              ( ( normals[ i ].z >= 0 ) ? 4 : 0 );
          }
          // stock.reserve(SIMPLE_STACKSIZE);
          // stack.reserve(SIMPLE_STACKSIZE);
          // ifree.reserve(SIMPLE_STACKSIZE);
          stack.push( Bump.Dbvt.allocate( ifree,
                                          stock,
                                          Bump.Dbvt.sStkNPS.create( root,
                                                                    0,
                                                                    root.volume.ProjectMinimum(
                                                                      sortaxis, srtsgns ) ) ) );
          do {
            var id = stack[ stack.length - 1 ],
            se = stock[ id ];
            stack.pop();
            ifree.push( id );
            if ( se.mask !== inside ) {
              var out = false;
              for ( i=0, j=1; ( !out ) && ( i < count ); ++i, j <<= 1 ) {
                if ( 0 === ( se.mask & j ) ) {
                  var side = se.node.volume.Classify( normals[i], offsets[i], signs[i] );
                  switch ( side ) {
                  case -1:
                    out = true; break;
                  case +1:
                    se.mask |= j; break;
                  }
                }
              }
              if ( out ) {
                continue;
              }
            }
            if ( policy.Descent( se.node ) ) {
              if ( se.node.isinternal() ) {
                var pns = [ se.node.childs[ 0 ], se.node.childs[ 1 ] ],
                    nes = [
                      Bump.Dbvt.sStkNPS.create( pns[ 0 ],
                                                se.mask,
                                                pns[ 0 ].volume.ProjectMinimum( sortaxis,
                                                                                srtsgns ) ),
                      Bump.Dbvt.sStkNPS.create( pns[ 1 ],
                                                se.mask,
                                                pns[ 1 ].volume.ProjectMinimum( sortaxis,
                                                                                srtsgns ) )
                    ],
                    q = nes[ 0 ].value < nes[ 1 ].value ? 1 : 0;

                j = stack.length;

                if ( fsort && ( j > 0 ) ) {
                  // Insert 0
                  j = Bump.Dbvt.nearest( stack[ 0 ], stock[ 0 ], nes[ q ].value, 0, stack.length );
                  stack.push( 0 );
                  for ( k = stack.length - 1; k > j; --k ) {
                    stack[ k ] = stack[ k - 1 ];
                  }
                  stack[ j ] = Bump.Dbvt.allocate( ifree, stock, nes[ q ] );
                  // Insert 1
                  j = Bump.Dbvt.nearest( stack[0], stock[0], nes[ 1 - q ].value, j, stack.length );
                  stack.push( 0 );
                  for ( k = stack.length - 1; k > j; --k ) {
                    stack[ k ] = stack[ k - 1 ];
                  }
                  stack[ j ] = Bump.Dbvt.allocate( ifree, stock, nes[ 1 - q ] );
                }
                else {
                  stack.push( Bump.Dbvt.allocate( ifree, stock, nes[ q ] ) );
                  stack.push( Bump.Dbvt.allocate( ifree, stock, nes[ 1 - q ] ) );
                }
              }
              else {
                policy.Process( se.node, se.value );
              }
            }
          } while ( stack.length );
        }
      },

      collideTU: function( root, policy ) {
        if ( root ) {
          var stack = [];
          // stack.reserve(SIMPLE_STACKSIZE);
          stack.push( root );
          do {
            var n = stack[ stack.length - 1 ];
            stack.pop();
            if ( policy.Descent( n ) ) {
              if ( n.isinternal() ) {
                stack.push( n.childs[ 0 ] );
                stack.push( n.childs[ 1 ] );
              }
              else {
                policy.Process( n );
              }
            }
          } while ( stack.length > 0 );
        }
      },


      // i: array of integers,
      // a: array of `sStkNPS`,
      // v: float,
      // l: integer,
      // h: integer,
      nearest: function( i, a, v, l, h ) {
        var m = 0;
        while ( l < h ) {
          m = ( l + h ) >> 1;
          if ( a[ i[ m ] ].value >= v ) {
            l = m + 1;
          }
          else {
            h = m;
          }
        }
        return h;
      },

      // Place `sStkNPS` `value` in array `stock`. The array `ifree` contains a list
      // of indices in `stock` that are empty, so `value` is first placed in one and
      // `ifree` is updated appropriately. If there is no such empty index, then
      // `value` is pushed onto the end.
      allocate: function( ifree, stock, value ) {
        var i;
        if ( ifree.length > 0 ) {
          i = ifree[ ifree.length - 1 ];
          ifree.pop();
          stock[ i ] = value;
        } else {
          i = stock.length;
          stock.push( value );
        }
        return i;
      }
    }
  });

  // Stack element structs
  var uuid = 0;
  Bump.Dbvt.sStkNN = Bump.type({
    // initialize from two `DbvtNode`s
    init: function sStkNN( na, nb ) {
      this.a = na || 0;
      this.b = nb || 0;
      this.uuid = uuid++;

      return this;
    },

    members: {
      clone: function( dest ) {
        if ( !dest ) {
          dest = Bump.Dbvt.sStkNN.create( this.a, this.b );
        } else {
          dest.a = this.a;
          dest.b = this.b;
        }

        return dest;
      },

      set: function( a, b ) {
        this.a = a;
        this.b = b;
        return this;
      },

      assign: function( other ) {
        this.a = other.a;
        this.b = other.b;
        return this;
      }
    }
  });

  Bump.Dbvt.sStkNP = Bump.type({
    // initialize from `DbvtNode` `n` and int mask `m`
    init: function sStkNP( n, m ) {
      this.node = n || 0;
      this.mask = m || 0;
    }
  });

  Bump.Dbvt.sStkNPS = Bump.type({
    // initialize from `DbvtNode` `n`, int mask `m`, and float `v`
    init: function sStkNPS( n, m, v ) {
      this.node = n || 0;
      this.mask = m || 0;
      this.value = v || 0;
    }
  });

  Bump.Dbvt.sStkCLN = Bump.type({
    // initialize from two `DbvtNode`s
    init: function sStkCLN( n, p ) {
      this.node = n || 0;
      this.parent = p || 0;
    }
  });

  // Policies/Interfaces

  Bump.Dbvt.ICollide = Bump.type({
    init: function ICollide() {},
    members: {
      // originally ICollide specified 3 overloaded Process functions, which have
      // been renamed here based on their expected arguments
      ProcessNode2: function( node1, node2 ) {},
      ProcessNode: function( node ) {},
      ProcessNodeScalar: function( n, s ) {
        this.ProcessNode( n );
      },

      Descent: function( node ) {
        return true;
      },

      AllLeaves: function( node ) {
        return true;
      }
    }
  });

  Bump.Dbvt.IWriter = Bump.type({
    init: function IWriter() {},
    members: {
      Prepare: Bump.abstract,
      WriteNode: Bump.abstract,
      WriteLeaf: Bump.abstract
    }
  });

  Bump.Dbvt.IClone = Bump.type({
    init: function IClone() {},
    members: {
      CloneLeaf: Bump.noop
    }
  });

  // Constants
  Bump.Dbvt.SIMPLE_STACKSIZE = 64;
  Bump.Dbvt.DOUBLE_STACKSIZE = Bump.Dbvt.SIMPLE_STACKSIZE * 2;

  Bump.DbvtNodeEnumerator = Bump.type({
    parent: Bump.Dbvt.ICollide,

    init: function DbvtNodeEnumerator() {
      this._super();
      this.nodes = [];
    },

    members: {
      ProcessNode: function( n ) {
        this.nodes.push( n );
      }
    }
  });

  tmpCTVVol1 = Bump.DbvtVolume.create();
  sStkNNZero = Bump.Dbvt.sStkNN.create();

})( this, this.Bump );
 
