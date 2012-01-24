(function( window, Bump ) {

  Bump.DBVT_BP_MARGIN = 0.05;

  Bump.DbvtProxy = Bump.type({
    parent: Bump.BroadphaseProxy,

    init: function DbvtProxy( aabbMin, aabbMax, userPtr, collisionFilterGroup, collisionFilterMask ) {
      this._super( aabbMin, aabbMax, userPtr, collisionFilterGroup, collisionFilterMask );
      this.leaf = null;
      this.links = [ null, null ];
      this.stage = 0;
    }
  });

  ///
  /// Helpers
  ///
  // There don't need to be publicly accessible outside of DbvtBroadphase.js

  // listRef is an object with property `list` to simulate by-reference passing of pointer
  var listappend = function( item, listRef ) {
    item.links[ 0 ] = 0;
    item.links[ 1 ] = listRef.list;
    if ( listRef.list ) {
      listRef.list.links[ 0 ] = item;
    }
    listRef.list = item;
  },
  listremove = function( item, listRef ) {
    if ( item.links[ 0 ] ) {
      item.links[ 0 ].links[ 1 ] = item.links[ 1 ];
    }
    else {
      listRef.list = item.links[ 1 ];
    }
    if ( item.links[ 1 ] ) {
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

  Bump.DbvtTreeCollider = Bump.type({
    parent: Bump.Dbvt.ICollide,

    init: function DbvtTreeCollider( p ) {
      this.pbp = p;
      this.proxy = null;
    },

    members: {
      ProcessNode2: function( na, nb ) {
        /* this._super( na, nb ); */
        if ( na != nb ) {
          var pa = na.data,
              pb = nb.data;

/* #if DBVT_BP_SORTPAIRS
          if ( pa.m_uniqueId > pb.m_uniqueId ) {
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
  });

  Bump.BroadphaseRayTester = Bump.type({
    parent: Bump.Dbvt.ICollide,

    init: function BroadphaseRayTester( orgCallback ) {
      this.m_rayCallback = orgCallback; /* BroadphaseRayCallback */
    },

    members: {
      ProcessNode: function( leaf ) {
        var proxy = leaf.data;
        this.m_rayCallback.process( proxy );
      }
    }
  });

  Bump.BroadphaseAabbTester = Bump.type({
    parent: Bump.Dbvt.ICollide,

    init: function BroadohaseAabbTester ( orgCallback ) {
      this.m_aabbCallback = orgCallback;
    },

    members: {
      Process: function( leaf ) {
        var proxy = leaf.data;
        this.m_aabbCallback.process( proxy );
      }
    }
  });

  Bump.DbvtBroadphase = Bump.type({
    parent: Bump.BroadphaseInterface,

    init: function DbvtBroadphase( paircache ) {
      /* Fields */
      this.m_deferedcollide = false; // Defere dynamic/static collision to collide call
      this.m_needcleanup = true; // Need to run cleanup?
      this.m_releasepaircache = paircache ? false : true; // Release pair cache on delete
      this.m_prediction = 0; // Velocity prediction (btScalar)
      this.m_stageCurrent = 0; // Current stage (int)
      this.m_fixedleft = 0; // Fixed optimization left (int)
      this.m_fupdates = 1; // % of fixed updates per frame (int)
      this.m_dupdates = 0; // % of dynamic updates per frame (int)
      this.m_cupdates = 10; // % of cleanup updates per frame (int)
      this.m_newpairs = 1; // Number of pairs created (int)
      this.m_updates_call = 0; // Number of updates call (unsigned)
      this.m_updates_done = 0; // Number of updates done (unsigned)
      this.m_updates_ratio = 0; // m_updates_done/m_updates_call (btScalar)

      // Pair cache (btOverlappingPairCache*)
      this.m_paircache = paircache || Bump.HashedOverlappingPairCache.create();
      this.m_pid = 0; // Parse id (int)
      this.m_cid = 0; // Cleanup index (int)
      this.m_gid = 0; // Gen id (int)

      this.m_stageRoots = new Array( Bump.DbvtBroadphase.Stages.STAGECOUNT + 1 ); // Stages list (btDbvtProxy*)
      for ( var i = 0; i <= Bump.DbvtBroadphase.Stages.STAGECOUNT; ++i ) {
        this.m_stageRoots[ i ] = 0;
      }

      this.m_sets = [ Bump.Dbvt.create(), Bump.Dbvt.create() ]; // Dbvt sets

/* omitting for now
#if DBVT_BP_PROFILE
	clear(m_profiling);
#endif */

    },

    members: {

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

      collide: function( dispatcher ) {
        /* SPC(this.m_profiling.m_total); // not defined without DBVT_BP_PROFILE */
        /* optimize                             */
        this.m_sets[ 0 ].optimizeIncremental( 1 + ( this.m_sets[ 0 ].m_leaves * this.m_dupdates ) / 100 );
        if ( this.m_fixedleft ) {
          var count = 1 + ( this.m_sets[ 1 ].m_leaves * this.m_fupdates ) / 100;
          this.m_sets[ 1 ].optimizeIncremental( 1 + ( this.m_sets[ 1 ].m_leaves * this.m_fupdates ) / 100 );
          this.m_fixedleft = Math.max( 0, this.m_fixedleft - count );
        }
        /* dynamic -> fixed set */
        this.m_stageCurrent = ( this.m_stageCurrent + 1 ) % Bump.DbvtBroadphase.Stages.STAGECOUNT;
        var current = this.m_stageRoots[ this.m_stageCurrent ];
        if ( current ) {
          var collider = Bump.DbvtTreeCollider.create( this );
          do {
            var next = current.links[ 1 ];
            listremove( current, this.m_stageRoots[ current.stage ] );
            listappend( current, this.m_stageRoots[ Bump.DbvtBroadphase.Stages.STAGECOUNT ] );
/*#if DBVT_BP_ACCURATESLEEPING
                        this.m_paircache.removeOverlappingPairsContainingProxy(current,dispatcher);
                        collider.proxy=current;
                        btDbvt::collideTV(this.m_sets[0].m_root,current.aabb,collider);
                        btDbvt::collideTV(this.m_sets[1].m_root,current.aabb,collider);
#endif*/
            this.m_sets[ 0 ].remove( current.leaf );
            var curAabb = Bump.DbvtVolume.FromMM( current.m_aabbMin, current.m_aabbMax );
            current.leaf = this.m_sets[ 1 ].insert( curAabb, current );
            current.stage = Bump.DbvtBroadphase.Stages.STAGECOUNT;
            current = next;
          } while( current );
          this.m_fixedleft = this.m_sets[ 1 ].m_leaves;
          this.m_needcleanup = true;
        }
        /* collide dynamics */
        var collider2 = Bump.DbvtTreeCollider.create( this );
        if ( this.m_deferedcollide ) {
          /* SPC(this.m_profiling.m_fdcollide); */
          this.m_sets[ 0 ].collideTTpersistentStack( this.m_sets[ 0 ].m_root,
                                                     this.m_sets[ 1 ].m_root,
                                                     collider2 );
        }
        if ( this.m_deferedcollide ) {
          /* SPC(this.m_profiling.m_ddcollide); */
          this.m_sets[ 0 ].collideTTpersistentStack( this.m_sets[ 0 ].m_root,
                                                     this.m_sets[ 0 ].m_root,
                                                     collider2 );
        }
        /* clean up */
        if ( this.m_needcleanup ) {
          /* SPC(this.m_profiling.m_cleanup); */
          var pairs = this.m_paircache.getOverlappingPairArray();
          if ( pairs.length > 0 ) {
            var ni = Math.min( pairs.length,
                               Math.max( this.m_newpairs, (pairs.length * this.m_cupdates ) / 100 ) );
            for (var i = 0; i < ni; ++i ) {
              var p = pairs[ ( this.m_cid + i ) % pairs.length ], /* btBroadphasePair& */
                  pa = p.m_pProxy0, /* btDbvtProxy* */
                  pb = p.m_pProxy1;
              if ( !Bump.Intersect.DbvtVolume( pa.leaf.volume, pb.leaf.volume ) ) {
/*#if DBVT_BP_SORTPAIRS
                                        if (pa.m_uniqueId>pb.m_uniqueId)
                                                btSwap(pa,pb);
#endif*/
                this.m_paircache.removeOverlappingPair( pa, pb, dispatcher );
                --ni;
                --i;
              }
            }
            if ( pairs.length > 0 ) {
              this.m_cid = ( this.m_cid + ni ) % pairs.length;
            }
            else {
              this.m_cid = 0;
            }
          }
        }
        ++this.m_pid;
        this.m_newpairs = 1;
        this.m_needcleanup = false;
        if ( this.m_updates_call > 0 ) {
          this.m_updates_ratio = this.m_updates_done / this.m_updates_call;
        }
        else {
          this.m_updates_ratio = 0;
        }
        this.m_updates_done /= 2;
        this.m_updates_call /= 2;

      },

      optimize: function() {
        this.m_sets[ 0 ].optimizeTopDown();
        this.m_sets[ 1 ].optimizeTopDown();
      },

      createProxy: function( aabbMin,
                             aabbMax,
                             shapeType,
                             userPtr,
                             collisionFilterGroup,
                             collisionFilterMask,
                             dispatcher,
                             multiSapProxy
                           ) {
        var proxy = Bump.DbvtProxy.create( aabbMin, aabbMax, userPtr,
                                           collisionFilterGroup,
                                           collisionFilterMask ),
            aabb = Bump.DbvtVolume.FromMM( aabbMin, aabbMax );

        //bproxy->aabb                  =       btDbvtVolume::FromMM(aabbMin,aabbMax);
        proxy.stage = this.m_stageCurrent;
        proxy.m_uniqueId = ++this.m_gid;
        proxy.leaf = this.m_sets[ 0 ].insert( aabb, proxy );
        listappend( proxy, this.m_stageRoots[ this.m_stageCurrent ] );
        if ( !this.m_deferedcollide ) {
          var collider = Bump.DbvtTreeCollider.create( this );
          collider.proxy = proxy;
          this.m_sets[ 0 ].collideTV( this.m_sets[ 0 ].m_root, aabb, collider );
          this.m_sets[ 1 ].collideTV( this.m_sets[ 1 ].m_root, aabb, collider );
        }
        return proxy;
      },

      destroyProxy: function( absproxy, dispatcher ) {
        var proxy = absproxy;
        if ( proxy.stage === Bump.DbvtBroadphase.Stages.STAGECOUNT ) {
          this.m_sets[ 1 ].remove( proxy.leaf );
        }
        else {
          this.m_sets[ 0 ].remove( proxy.leaf );
        }
        listremove( proxy, this.m_stageRoots[ proxy.stage ] );
        this.m_paircache.removeOverlappingPairsContainingProxy( proxy, dispatcher );
        /* btAlignedFree( proxy ); */
        this.m_needcleanup = true;
      },

      setAabb: function( absproxy, aabbMin, aabbMax, dispatcher ) {
        var proxy = absproxy,
        aabb = Bump.DbvtVolume.FromMM( aabbMin, aabbMax );
/* #if DBVT_BP_PREVENTFALSEUPDATE
        if (NotEqual(aabb,proxy->leaf->volume))
#endif
        { */
        var docollide = false;
        if ( proxy.stage === Bump.DbvtBroadphase.Stages.STAGECOUNT ) {
          /* fixed . dynamic set */
          this.m_sets[ 1 ].remove( proxy.leaf );
          proxy.leaf = this.m_sets[ 0 ].insert( aabb, proxy );
          docollide = true;
        }
        else {
          /* dynamic set */
          ++this.m_updates_call;
          if ( Bump.Intersect.DbvtVolume2( proxy.leaf.volume, aabb ) ) {
            /* Moving */
            var delta = aabbMin.subtract( proxy.m_aabbMin ),
                velocity = proxy.m_abbMax.subtract( proxy.m_aabbMin )
                  .divideScalarSelf( 2 )
                  .multiplyScalarSelf( this.m_prediction );

            if ( delta.x < 0 ) {
              velocity.x = -velocity.x;
            }
            if ( delta.y < 0 ) {
              velocity.y = -velocity.y;
            }
            if ( delta.z < 0 ) {
              velocity.z = -velocity.z;
            }
            if (
/*#ifdef DBVT_BP_MARGIN */
              this.m_sets[0].update( proxy.leaf, aabb, velocity, Bump.DBVT_BP_MARGIN )
/*#else
                                        m_sets[0].update(proxy.leaf,aabb,velocity)
#endif*/
            ) {
              ++this.m_updates_done;
              docollide = true;
            }
          }
          else {
            /* Teleporting */
            this.m_sets[ 0 ].update( proxy.leaf, aabb );
            ++this.m_updates_done;
            docollide = true;
          }
        }
        listremove( proxy, this.m_stageRoots[ proxy.stage ] );
        aabbMin.clone( proxy.m_aabbMin );
        aabbMax.clone( proxy.m_aabbMax );
        proxy.stage = this.m_stageCurrent;
        listappend( proxy, this.m_stageRoots[ this.m_stageCurrent ] );
        if ( docollide ) {
          this.m_needcleanup = true;
          if ( !this.m_deferedcollide ) {
            var collider = Bump.DbvtTreeCollider.create( this );
            this.m_sets[ 1 ].collideTTpersistentStack( this.m_sets[ 1 ].m_root, proxy.leaf, collider );
            this.m_sets[ 0 ].collideTTpersistentStack( this.m_sets[ 0 ].m_root, proxy.leaf, collider );
          }
        }
      },

      rayTest: function( rayFrom, rayTo, rayCallback, aabbMin, aabbMax ) {
        aabbMin = aabbMin || Bump.Vector3.create();
        aabbMax = aabbMin || Bump.Vector3.create();

        var callback = Bump.BroadphaseRayTester.create( rayCallback );

        this.m_sets[0].rayTestInternal(
          this.m_sets[0].m_root,
          rayFrom,
          rayTo,
          rayCallback.m_rayDirectionInverse,
          rayCallback.m_signs,
          rayCallback.m_lambda_max,
          aabbMin,
          aabbMax,
          callback );

        this.m_sets[1].rayTestInternal(
          this.m_sets[1].m_root,
          rayFrom,
          rayTo,
          rayCallback.m_rayDirectionInverse,
          rayCallback.m_signs,
          rayCallback.m_lambda_max,
          aabbMin,
          aabbMax,
          callback );
      },

      aabbTest: function (aabbMin, aabbMax, aabbCallback ) {
        var callback = aabbCallback,
	bounds = Bump.DbvtVolume.FromMM( aabbMin, aabbMax );

	//process all children, that overlap with  the given AABB bounds
	this.m_sets[ 0 ].collideTV( this.m_sets[ 0 ].m_root, bounds, callback );
	this.m_sets[ 1 ].collideTV( this.m_sets[ 1 ].m_root, bounds, callback );
      },

      getAabb: function( absproxy, aabbMin, aabbMax ) {
        var proxy = absproxy;
	proxy.m_aabbMin.clone( aabbMin );
	proxy.m_aabbMax.clone( aabbMax );
      },

      calculateOverlappingPairs: function( dispatcher ) {
        this.collide( dispatcher );
/*
#if DBVT_BP_PROFILE
        if (0==(m_pid%DBVT_BP_PROFILING_RATE))
        {
                printf("fixed(%u) dynamics(%u) pairs(%u)\r\n",m_sets[1].m_leaves,m_sets[0].m_leaves,m_paircache->getNumOverlappingPairs());
                unsigned int    total=m_profiling.m_total;
                if (total<=0) total=1;
                printf("ddcollide: %u%% (%uus)\r\n",(50+m_profiling.m_ddcollide*100)/total,m_profiling.m_ddcollide/DBVT_BP_PROFILING_RATE);
                printf("fdcollide: %u%% (%uus)\r\n",(50+m_profiling.m_fdcollide*100)/total,m_profiling.m_fdcollide/DBVT_BP_PROFILING_RATE);
                printf("cleanup:   %u%% (%uus)\r\n",(50+m_profiling.m_cleanup*100)/total,m_profiling.m_cleanup/DBVT_BP_PROFILING_RATE);
                printf("total:     %uus\r\n",total/DBVT_BP_PROFILING_RATE);
                const unsigned long     sum=m_profiling.m_ddcollide+
                        m_profiling.m_fdcollide+
                        m_profiling.m_cleanup;
                printf("leaked: %u%% (%uus)\r\n",100-((50+sum*100)/total),(total-sum)/DBVT_BP_PROFILING_RATE);
                printf("job counts: %u%%\r\n",(m_profiling.m_jobcount*100)/((m_sets[0].m_leaves+m_sets[1].m_leaves)*DBVT_BP_PROFILING_RATE));
                clear(m_profiling);
                m_clock.reset();
        }
#endif
*/
        this.performDeferredRemoval( dispatcher );
      },

      getOverlappingPairCache: function() {
        return this.m_paircache;
      },

      getBroadphaseAabb: function( aabbMin, aabbMax ) {
        var bounds = Bump.DbvtVolume.create();
        if ( !this.m_sets[ 0 ].empty() ) {
          if ( !this.m_sets[ 1 ].empty() ) {
            Bump.Merge.DbvtVolume3( this.m_sets[0].m_root.volume,
                                    this.m_sets[1].m_root.volume,
                                    bounds );
          }
          else {
            this.m_sets[ 0 ].m_root.volume.clone( bounds );
          }
        }
        else if ( ! this.m_sets[1].empty() ) {
          this.m_sets[1].m_root.volume.clone( bounds );
        }
        else {
          /* TODO : could optimize this to avoid object creation by
             adding a destination param to FromCR */
          bounds = Bump.DbvtVolume.FromCR( Bump.Vector3.create( 0, 0, 0 ), 0 );
        }
        bounds.Mins().clone( aabbMin );
        bounds.Maxs().clone( aabbMax );
      },

      printStats: function() {},

      ///reset broadphase internal structures, to ensure determinism/reproducability
      resetPool: function( dispatcher ) {

        var totalObjects = this.m_sets[ 0 ].m_leaves + this.m_sets[ 1 ].m_leaves;
        if ( totalObjects === 0 ) {
          //reset internal dynamic tree data structures
          this.m_sets[ 0 ].clear();
          this.m_sets[ 1 ].clear();

          this.m_deferedcollide = false;
          this.m_needcleanup = true;
          this.m_stageCurrent = 0;
          this.m_fixedleft = 0;
          this.m_fupdates = 1;
          this.m_dupdates = 0;
          this.m_cupdates = 10;
          this.m_newpairs = 1;
          this.m_updates_call = 0;
          this.m_updates_done = 0;
          this.m_updates_ratio = 0;

          this.m_gid = 0;
          this.m_pid = 0;
          this.m_cid = 0;

          for ( var i = 0; i <= Bump.DbvtBroadphase.Stages.STAGECOUNT; ++i ) {
            this.m_stageRoots[ i ] = null;
          }
        }
      },

      performDeferredRemoval: function( dispatcher ) {
        if ( this.m_paircache.hasDeferredRemoval() ) {

          var overlappingPairArray = this.m_paircache.getOverlappingPairArray();
          //perform a sort, to find duplicates and to sort 'invalid' pairs to the end
          Bump.quickSort( overlappingPairArray, Bump.BroadphasePairSortPredicate.create() );

          var invalidPair = 0,
              i,
              previousPair = Bump.BroadphasePair.create();
          previousPair.m_pProxy0 = 0;
          previousPair.m_pProxy1 = 0;
          previousPair.m_algorithm = 0;

          for ( i = 0; i < overlappingPairArray.length; i++ ) {
            var pair = overlappingPairArray[i], /* btBroadphasePair& */
                isDuplicate = ( pair.equal( previousPair ) );

            previousPair = pair;

            var needsRemoval = false;
            if ( !isDuplicate ) {
              //important to perform AABB check that is consistent with the broadphase
              var pa = pair.m_pProxy0, /* (btDbvtProxy*) */
                  pb = pair.m_pProxy1,
                  hasOverlap = Bump.Intersect.DbvtVolume2( pa.leaf.volume, pb.leaf.volume );

              needsRemoval = !hasOverlap;
            }
            else {
              //remove duplicate
              needsRemoval = true;
              //should have no algorithm
              Bump.Assert( !pair.m_algorithm );
            }
            if ( needsRemoval ) {
              this.m_paircache.cleanOverlappingPair( pair, dispatcher );
              pair.m_pProxy0 = 0;
              pair.m_pProxy1 = 0;
              invalidPair++;
            }
          }

          //perform a sort, to sort 'invalid' pairs to the end
          Bump.quickSort( overlappingPairArray, Bump.BroadphasePairSortPredicate.create() );
          /* overlappingPairArray.resize(overlappingPairArray.size() - invalidPair); */
        }
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
        var proxy = absproxy,
            aabb = Bump.DbvtVolume.FromMM( aabbMin, aabbMax ),
            docollide = false;

        if ( proxy.stage  === Bump.DbvtBroadphase.Stages.STAGECOUNT ) {
          /* fixed . dynamic set */
          this.m_sets[ 1 ].remove( proxy.leaf );
          proxy.leaf = this.m_sets[ 0 ].insert( aabb, proxy );
          docollide = true;
        }
        else {
          /* dynamic set */
          ++this.m_updates_call;
          /* Teleporting */
          this.m_sets[ 0 ].update( proxy.leaf, aabb );
          ++this.m_updates_done;
          docollide = true;
        }
        listremove( proxy, this.m_stageRoots[ proxy.stage ] );
        aabbMin.clone( proxy.m_aabbMin );
        aabbMax.clone( proxy.m_aabbMax );
        proxy.stage = this.m_stageCurrent;
        listappend( proxy, this.m_stageRoots[ this.m_stageCurrent ] );
        if ( docollide ) {
          this.m_needcleanup = true;
          if ( !this.m_deferedcollide ) {
            var collider = Bump.DbvtTreeCollider.create( this );
            this.m_sets[ 1 ].collideTTpersistentStack( this.m_sets[ 1 ].m_root, proxy.leaf, collider );
            this.m_sets[ 0 ].collideTTpersistentStack( this.m_sets[ 0 ].m_root, proxy.leaf, collider );
          }
        }
      }
    },

    typeMembers: {
      Stages: Bump.Enum([
        { id: 'DYNAMIC_SET' },
        { id: 'FIXED_SET' },
        { id: 'STAGECOUNT' }
      ]),

      benchmark: function( broadphaseInterface ) {}
    }
  });
})( this, this.Bump );
