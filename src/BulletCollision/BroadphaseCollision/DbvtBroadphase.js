(function( window, Bump ) {

  Bump.DbvtProxy = Bump.type( {
    parent: Bump.BroadphaseProxy,

    init: function DbvtProxy( aabbMin, aabbMax, userPtr, collisionFilterGroup, collisionFilterMask ) {
      this._super( aabbMin, aabbMax, userPtr, collisionFilterGroup, collisionFilterMask );
      this.leaf = null;
      this.links = [ null, null ];
      this.stage = 0;
    }
  } );

  ///
  /// Helpers
  ///
  // There don't need to be publicly accessible outside of DbvtBroadphase.js

  // listRef is an object with property `list` to simulate by-reference passing of pointer
  var listappend = function( item, listRef ) {
    item.links[ 0 ] = 0;
    item.links[ 1 ] = listRef.list;
    if( listRef.list ) {
      listRef.list.links[ 0 ] = item;
    }
    listRef.list = item;
  },
  listremove = function( item, listRef ) {
    if( item.links[ 0 ] ) {
      item.links[ 0 ].links[ 1 ] = item.links[ 1 ];
    }
    else {
      listRef.list = item.links[ 1 ];
    }
    if( item.links[ 1 ] ) {
      item.links[ 1 ].links[ 0 ] = item.links[ 0 ];
    }
  },
  listcount = function( root ) {
    var n = 0;
    while( root ) {
      ++n;
      root = root.links[ 1 ];
    }
    return n;
  },
  clear = function( valueRef ) {
    valueRef.value = {}; // set to empty object?
  };

  Bump.DbvtTreeCollider = Bump.type( {
    parent: Bump.Dbvt.ICollide,

    init: function( p ) {
      this.pbp = p;
      this.proxy = null;
    },

    members: {
      ProcessNode2: function( na, nb ) {
        /* this._super( na, nb ); */
        if( na != nb ) {
          var pa = na.data,
              pb = nb.data;

/* #if DBVT_BP_SORTPAIRS
          if( pa.m_uniqueId > pb.m_uniqueId ) {
            //btSwap(pa,pb);
            var tmp = pa;
            pa = pb;
            pb = pa;
          }
#endif */
          this.pbp.m_paircache.addOverlappingPair( pa, pb );
          ++this.pbp.m_newpairs;
        }
      },

      ProcessNode: function( n ) {
        this.ProcessNode2( n, this.proxy.leaf );
      }
    }
  } );

  Bump.DbvtBroadphase = Bump.type( {
    parent: Bump.BroadphaseInterface,

    init: function( paircache ) {
      /* Fields */
      this.m_sets = [ Bump.Dbvt.create(), Bump.Dbvt.create() ]; // Dbvt sets
      this.m_stageRoots = new Array( Bump.DbvtBroadphase.Stages.STAGECOUNT + 1 ); // Stages list (btDbvtProxy*)
      this.m_paircache = null; // Pair cache (btOverlappingPairCache*)
      this.m_prediction = 0; // Velocity prediction (btScalar)
      this.m_stageCurrent = 0; // Current stage (int)
      this.m_fupdates = 0; // % of fixed updates per frame (int)
      this.m_dupdates = 0; // % of dynamic updates per frame (int)
      this.m_cupdates = 0; // % of cleanup updates per frame (int)
      this.m_newpairs = 0; // Number of pairs created (int)
      this.m_fixedleft = 0; // Fixed optimization left (int)
      this.m_updates_call = 0; // Number of updates call (unsigned)
      this.m_updates_done = 0; // Number of updates done (unsigned)
      this.m_updates_ratio = 0; // m_updates_done/m_updates_call (btScalar)
      this.m_pid = 0; // Parse id (int)
      this.m_cid = 0; // Cleanup index (int)
      this.m_gid = 0; // Gen id (int)
      this.m_releasepaircache = false; // Release pair cache on delete
      this.m_deferedcollide = false; // Defere dynamic/static collision to collide call
      this.m_needcleanup = false; // Need to run cleanup?

/* omitting for now
#if DBVT_BP_PROFILE
        btClock m_clock;
        struct  {
                unsigned long m_total;
                unsigned long m_ddcollide;
                unsigned long m_fdcollide;
                unsigned long m_cleanup;
                unsigned long m_jobcount;
        } m_profiling;
#endif
*/

    },

    members: {
      collide: function( dispatched ) {
      },

      optimize: function() {
      },

      createProxy: function() {
      },

      destroyProxy: function( proxy, dispatcher ) {
      },

      setAabb: function( proxy, aabbMin, aabbMax, dispatcher ) {

      },

      rayTest: function( rayFrom, rayTo, rayCallback, aabbMin, aabbMax) {
        aabbMin = aabbMin || Bump.Vector3.create();
        aabbMax = aabbMin || Bump.Vector3.create();
      },

      aabbTest: function (aabbMin, aabbMax, callback ){
      },

      getAabb: function( proxy, aabbMin, aabbMax ) {
      },

      calculateOverlappingPairs: function( dispatcher ) {
      },

      getOverlappingPairCache: function() {
      },

      getBroadphaseAabb: function( aabbMin, aabbMax ) {
      },

      printStats: function() {
      },

      ///reset broadphase internal structures, to ensure determinism/reproducability
      resetPool: function( dispatcher ) {
      },

      performDeferredRemoval: function( dispatcher ) {
      },

      setVelocityPrediction: function( prediction ) {
        this.m_prediction = prediction;
      },

      getVelocityPrediction: function() {
        return this.m_prediction;
      },

      ///this setAabbForceUpdate is similar to setAabb but always forces the aabb update.
      ///it is not part of the btBroadphaseInterface but specific to btDbvtBroadphase.
      ///it bypasses certain optimizations that prevent aabb updates (when the aabb shrinks), see
      ///http://code.google.com/p/bullet/issues/detail?id=223
      setAabbForceUpdate: function( absproxy, aabbMin, aabbMax, dispatcher ) {
      }
    },

    typeMembers: {
      Stages: Bump.Enum( [
        { id: 'DYNAMIC_SET' },
        { id: 'FIXED_SET' },
        { id: 'STAGECOUNT' }
      ] ),

      benchmark: function( broadphaseInterface ) {
      }
    }
  } );
} )( this, this.Bump );