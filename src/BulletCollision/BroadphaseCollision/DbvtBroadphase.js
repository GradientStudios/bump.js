// load: bump.js
// load: LinearMath/Vector3.js
// load: BulletCollision/BroadphaseCollision/BroadphaseProxy.js
// load: BulletCollision/BroadphaseCollision/Dbvt.js
// load: BulletCollision/BroadphaseCollision/BroadphaseInterface.js

// run: LinearMath/AlignedObjectArray.js
// run: BulletCollision/BroadphaseCollision/OverlappingPairCache.js

(function( window, Bump ) {

  // Used in setAabb.
  var tmpSADTC1;
  var tmpSAAabb1 = Bump.DbvtVolume.create();
  var tmpSAVec1  = Bump.Vector3.create();
  var tmpSAVec2  = Bump.Vector3.create();

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

  //
  // Helpers
  //
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
    while ( root ) {
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
      return this;
    },

    members: {
      ProcessNode2: function( na, nb ) {
        // this._super( na, nb );
        if ( na !== nb ) {
          var pa = na.data,
              pb = nb.data;

          this.pbp.paircache.addOverlappingPair( pa, pb );
          ++this.pbp.newpairs;
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
      this.rayCallback = orgCallback; // BroadphaseRayCallback
    },

    members: {
      ProcessNode: function( leaf ) {
        var proxy = leaf.data;
        this.rayCallback.process( proxy );
      }
    }
  });

  Bump.BroadphaseAabbTester = Bump.type({
    parent: Bump.Dbvt.ICollide,

    init: function BroadphaseAabbTester( orgCallback ) {
      this.aabbCallback = orgCallback;
    },

    members: {
      Process: function( leaf ) {
        var proxy = leaf.data;
        this.aabbCallback.process( proxy );
      }
    }
  });

  var tmpBroadphaseRayTester = Bump.BroadphaseRayTester.create();

  Bump.DbvtBroadphase = Bump.type({
    parent: Bump.BroadphaseInterface,

    init: function DbvtBroadphase( paircache ) {
      // Fields
      this.deferedcollide = false; // Defere dynamic/static collision to collide call
      this.needcleanup = true;     // Need to run cleanup?
      this.releasepaircache = paircache ? false : true; // Release pair cache on delete
      this.prediction = 0;     // Velocity prediction (btScalar)
      this.stageCurrent = 0;   // Current stage (int)
      this.fixedleft = 0;      // Fixed optimization left (int)
      this.fupdates = 1;       // % of fixed updates per frame (int)
      this.dupdates = 0;       // % of dynamic updates per frame (int)
      this.cupdates = 10;      // % of cleanup updates per frame (int)
      this.newpairs = 1;       // Number of pairs created (int)
      this.updates_call = 0;   // Number of updates call (unsigned)
      this.updates_done = 0;   // Number of updates done (unsigned)
      this.updates_ratio = 0;  // updates_done/updates_call (btScalar)

      // Pair cache (btOverlappingPairCache*)
      this.paircache = paircache || Bump.HashedOverlappingPairCache.create();
      this.pid = 0; // Parse id (int)
      this.cid = 0; // Cleanup index (int)
      this.gid = 0; // Gen id (int)

      this.stageRoots = new Array( Bump.DbvtBroadphase.Stages.STAGECOUNT + 1 ); // Stages list (btDbvtProxy*)
      for ( var i = 0; i <= Bump.DbvtBroadphase.Stages.STAGECOUNT; ++i ) {
        this.stageRoots[ i ] = 0;
      }

      this.sets = [ Bump.Dbvt.create(), Bump.Dbvt.create() ]; // Dbvt sets
    },

    members: {
      collide: function( dispatcher ) {
        // SPC(this.profiling.total); // not defined without DBVT_BP_PROFILE
        // optimize
        this.sets[ 0 ].optimizeIncremental( 1 + ~~(( this.sets[ 0 ].leaves * this.dupdates ) / 100) );
        if ( this.fixedleft ) {
          var count = 1 + ~~(( this.sets[ 1 ].leaves * this.fupdates ) / 100);
          this.sets[ 1 ].optimizeIncremental( 1 + ~~(( this.sets[ 1 ].leaves * this.fupdates ) / 100) );
          this.fixedleft = Math.max( 0, this.fixedleft - count );
        }

        // dynamic -> fixed set
        this.stageCurrent = ( this.stageCurrent + 1 ) % Bump.DbvtBroadphase.Stages.STAGECOUNT;
        var current = this.stageRoots[ this.stageCurrent ];
        if ( current ) {
          var collider = Bump.DbvtTreeCollider.create( this );
          do {
            var next = current.links[ 1 ];
            listremove( current, this.stageRoots[ current.stage ] );
            listappend( current, this.stageRoots[ Bump.DbvtBroadphase.Stages.STAGECOUNT ] );
            this.sets[ 0 ].remove( current.leaf );
            var curAabb = Bump.DbvtVolume.FromMM( current.aabbMin, current.aabbMax );
            current.leaf = this.sets[ 1 ].insert( curAabb, current );
            current.stage = Bump.DbvtBroadphase.Stages.STAGECOUNT;
            current = next;
          } while ( current );
          this.fixedleft = this.sets[ 1 ].leaves;
          this.needcleanup = true;
        }

        // collide dynamics
        var collider2 = Bump.DbvtTreeCollider.create( this );
        if ( this.deferedcollide ) {
          // SPC(this.profiling.fdcollide);
          this.sets[ 0 ].collideTTpersistentStack( this.sets[ 0 ].root,
                                                   this.sets[ 1 ].root,
                                                   collider2 );
        }

        if ( this.deferedcollide ) {
          // SPC(this.profiling.ddcollide);
          this.sets[ 0 ].collideTTpersistentStack( this.sets[ 0 ].root,
                                                   this.sets[ 0 ].root,
                                                   collider2 );
        }

        // clean up
        if ( this.needcleanup ) {
          // SPC(this.profiling.cleanup);
          var pairs = this.paircache.getOverlappingPairArray();
          if ( pairs.length > 0 ) {
            var ni = Math.min(
              pairs.length,
              Math.max( this.newpairs, ~~(( pairs.length * this.cupdates ) / 100) )
            );

            for ( var i = 0; i < ni; ++i ) {
              var p = pairs[ ( this.cid + i ) % pairs.length ], // btBroadphasePair&
                  pa = p.pProxy0, // btDbvtProxy*
                  pb = p.pProxy1;
              if ( !Bump.Intersect.DbvtVolume2( pa.leaf.volume, pb.leaf.volume ) ) {
                this.paircache.removeOverlappingPair( pa, pb, dispatcher );
                --ni;
                --i;
              }
            }

            if ( pairs.length > 0 ) {
              this.cid = ( this.cid + ni ) % pairs.length;
            } else {
              this.cid = 0;
            }
          }
        }

        ++this.pid;
        this.newpairs = 1;
        this.needcleanup = false;
        if ( this.updates_call > 0 ) {
          this.updates_ratio = ~~( this.updates_done / this.updates_call );
        } else {
          this.updates_ratio = 0;
        }
        this.updates_done = ~~( this.updates_done / 2 );
        this.updates_call = ~~( this.updates_call / 2 );
      },

      optimize: function() {
        this.sets[ 0 ].optimizeTopDown();
        this.sets[ 1 ].optimizeTopDown();
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

        // bproxy->aabb = btDbvtVolume::FromMM(aabbMin,aabbMax);
        proxy.stage = this.stageCurrent;
        proxy.uniqueId = ++this.gid;
        proxy.leaf = this.sets[ 0 ].insert( aabb, proxy );
        listappend( proxy, this.stageRoots[ this.stageCurrent ] );
        if ( !this.deferedcollide ) {
          var collider = Bump.DbvtTreeCollider.create( this );
          collider.proxy = proxy;
          this.sets[ 0 ].collideTV( this.sets[ 0 ].root, aabb, collider );
          this.sets[ 1 ].collideTV( this.sets[ 1 ].root, aabb, collider );
        }
        return proxy;
      },

      destroyProxy: function( absproxy, dispatcher ) {
        var proxy = absproxy;
        if ( proxy.stage === Bump.DbvtBroadphase.Stages.STAGECOUNT ) {
          this.sets[ 1 ].remove( proxy.leaf );
        }
        else {
          this.sets[ 0 ].remove( proxy.leaf );
        }
        listremove( proxy, this.stageRoots[ proxy.stage ] );
        this.paircache.removeOverlappingPairsContainingProxy( proxy, dispatcher );
        // btAlignedFree( proxy );
        this.needcleanup = true;
      },

      setAabb: function( absproxy, aabbMin, aabbMax, dispatcher ) {
        var proxy = absproxy,
            aabb = tmpSAAabb1.setFromMM( aabbMin, aabbMax );

        var docollide = false;
        if ( proxy.stage === Bump.DbvtBroadphase.Stages.STAGECOUNT ) {
          // fixed . dynamic set
          this.sets[ 1 ].remove( proxy.leaf );
          proxy.leaf = this.sets[ 0 ].insert( aabb, proxy );
          docollide = true;
        }

        else {
          // dynamic set
          ++this.updates_call;
          if ( Bump.Intersect.DbvtVolume2( proxy.leaf.volume, aabb ) ) {
            // Moving
            var delta = aabbMin.subtract( proxy.aabbMin, tmpSAVec1 ),
                velocity = proxy.aabbMax.subtract( proxy.aabbMin, tmpSAVec2 )
                  .divideScalarSelf( 2, tmpSAVec2 )
                  .multiplyScalarSelf( this.prediction, tmpSAVec2 );

            if ( delta.x < 0 ) {
              velocity.x = -velocity.x;
            }
            if ( delta.y < 0 ) {
              velocity.y = -velocity.y;
            }
            if ( delta.z < 0 ) {
              velocity.z = -velocity.z;
            }

            if ( this.sets[0].updateLeafVolumeVelocityMargin(
              proxy.leaf,
              aabb,
              velocity,
              Bump.DBVT_BP_MARGIN
            ) ) {
              ++this.updates_done;
              docollide = true;
            }
          }

          else {
            // Teleporting
            this.sets[ 0 ].updateLeafVolume( proxy.leaf, aabb );
            ++this.updates_done;
            docollide = true;
          }
        }

        listremove( proxy, this.stageRoots[ proxy.stage ] );
        proxy.aabbMin.assign( aabbMin );
        proxy.aabbMax.assign( aabbMax );
        proxy.stage = this.stageCurrent;
        listappend( proxy, this.stageRoots[ this.stageCurrent ] );
        if ( docollide ) {
          this.needcleanup = true;
          if ( !this.deferedcollide ) {
            var collider = tmpSADTC1.init( this );
            this.sets[ 1 ].collideTTpersistentStack( this.sets[ 1 ].root, proxy.leaf, collider );
            this.sets[ 0 ].collideTTpersistentStack( this.sets[ 0 ].root, proxy.leaf, collider );
          }
        }
      },

      rayTest: function( rayFrom, rayTo, rayCallback, aabbMin, aabbMax ) {
        aabbMin = aabbMin || Bump.Vector3.create();
        aabbMax = aabbMin || Bump.Vector3.create();

        // var callback = Bump.BroadphaseRayTester.create( rayCallback );
        var callback = tmpBroadphaseRayTester;
        callback.init( rayCallback );

        this.sets[0].rayTestInternal(
          this.sets[0].root,
          rayFrom,
          rayTo,
          rayCallback.rayDirectionInverse,
          rayCallback.signs,
          rayCallback.lambda_max,
          aabbMin,
          aabbMax,
          callback );

        this.sets[1].rayTestInternal(
          this.sets[1].root,
          rayFrom,
          rayTo,
          rayCallback.rayDirectionInverse,
          rayCallback.signs,
          rayCallback.lambda_max,
          aabbMin,
          aabbMax,
          callback );
      },

      aabbTest: function (aabbMin, aabbMax, aabbCallback ) {
        var callback = aabbCallback,
        bounds = Bump.DbvtVolume.FromMM( aabbMin, aabbMax );

        // process all children, that overlap with  the given AABB bounds
        this.sets[ 0 ].collideTV( this.sets[ 0 ].root, bounds, callback );
        this.sets[ 1 ].collideTV( this.sets[ 1 ].root, bounds, callback );
      },

      getAabb: function( absproxy, aabbMin, aabbMax ) {
        var proxy = absproxy;
        proxy.aabbMin.clone( aabbMin );
        proxy.aabbMax.clone( aabbMax );
      },

      calculateOverlappingPairs: function( dispatcher ) {
        this.collide( dispatcher );
        this.performDeferredRemoval( dispatcher );
      },

      getOverlappingPairCache: function() {
        return this.paircache;
      },

      getBroadphaseAabb: function( aabbMin, aabbMax ) {
        var bounds = Bump.DbvtVolume.create();
        if ( !this.sets[ 0 ].empty() ) {
          if ( !this.sets[ 1 ].empty() ) {
            Bump.Merge.DbvtVolume3( this.sets[0].root.volume,
                                    this.sets[1].root.volume,
                                    bounds );
          }
          else {
            this.sets[ 0 ].root.volume.clone( bounds );
          }
        }
        else if ( ! this.sets[1].empty() ) {
          this.sets[1].root.volume.clone( bounds );
        }
        else {
          // TODO : could optimize this to avoid object creation by
          // adding a destination param to FromCR
          bounds = Bump.DbvtVolume.FromCR( Bump.Vector3.create( 0, 0, 0 ), 0 );
        }
        bounds.Mins().clone( aabbMin );
        bounds.Maxs().clone( aabbMax );
      },

      printStats: Bump.noop,

      // reset broadphase internal structures, to ensure determinism/reproducability
      resetPool: function( dispatcher ) {

        var totalObjects = this.sets[ 0 ].leaves + this.sets[ 1 ].leaves;
        if ( totalObjects === 0 ) {
          // reset internal dynamic tree data structures
          this.sets[ 0 ].clear();
          this.sets[ 1 ].clear();

          this.deferedcollide = false;
          this.needcleanup = true;
          this.stageCurrent = 0;
          this.fixedleft = 0;
          this.fupdates = 1;
          this.dupdates = 0;
          this.cupdates = 10;
          this.newpairs = 1;
          this.updates_call = 0;
          this.updates_done = 0;
          this.updates_ratio = 0;

          this.gid = 0;
          this.pid = 0;
          this.cid = 0;

          for ( var i = 0; i <= Bump.DbvtBroadphase.Stages.STAGECOUNT; ++i ) {
            this.stageRoots[ i ] = null;
          }
        }
      },

      performDeferredRemoval: function( dispatcher ) {
        if ( this.paircache.hasDeferredRemoval() ) {

          var overlappingPairArray = this.paircache.getOverlappingPairArray();
          // perform a sort, to find duplicates and to sort 'invalid' pairs to the end
          Bump.quickSort( overlappingPairArray, Bump.BroadphasePairSortPredicate.create() );

          var invalidPair = 0,
              i,
              previousPair = Bump.BroadphasePair.create();
          previousPair.pProxy0 = 0;
          previousPair.pProxy1 = 0;
          previousPair.algorithm = 0;

          for ( i = 0; i < overlappingPairArray.length; i++ ) {
            var pair = overlappingPairArray[i], // btBroadphasePair&
                isDuplicate = ( pair.equal( previousPair ) );

            previousPair = pair;

            var needsRemoval = false;
            if ( !isDuplicate ) {
              // important to perform AABB check that is consistent with the broadphase
              var pa = pair.pProxy0, // btDbvtProxy*
                  pb = pair.pProxy1,
                  hasOverlap = Bump.Intersect.DbvtVolume2( pa.leaf.volume, pb.leaf.volume );

              needsRemoval = !hasOverlap;
            }
            else {
              // remove duplicate
              needsRemoval = true;
              // should have no algorithm
              Bump.Assert( !pair.algorithm );
            }
            if ( needsRemoval ) {
              this.paircache.cleanOverlappingPair( pair, dispatcher );
              pair.pProxy0 = 0;
              pair.pProxy1 = 0;
              invalidPair++;
            }
          }

          // perform a sort, to sort 'invalid' pairs to the end
          Bump.quickSort( overlappingPairArray, Bump.BroadphasePairSortPredicate.create() );
          // overlappingPairArray.resize(overlappingPairArray.size() - invalidPair);
        }
      },

      setVelocityPrediction: function( prediction ) {
        this.prediction = prediction;
      },

      getVelocityPrediction: function() {
        return this.prediction;
      },

      // this setAabbForceUpdate is similar to setAabb but always forces the aabb update.
      // it is not part of the btBroadphaseInterface but specific to btDbvtBroadphase.
      // it bypasses certain optimizations that prevent aabb updates (when the aabb shrinks), see
      // http://code.google.com/p/bullet/issues/detail?id=223
      setAabbForceUpdate: function( absproxy, aabbMin, aabbMax, dispatcher ) {
        var proxy = absproxy,
            aabb = Bump.DbvtVolume.FromMM( aabbMin, aabbMax ),
            docollide = false;

        if ( proxy.stage  === Bump.DbvtBroadphase.Stages.STAGECOUNT ) {
          // fixed . dynamic set
          this.sets[ 1 ].remove( proxy.leaf );
          proxy.leaf = this.sets[ 0 ].insert( aabb, proxy );
          docollide = true;
        }
        else {
          // dynamic set
          ++this.updates_call;
          // Teleporting
          this.sets[ 0 ].update( proxy.leaf, aabb );
          ++this.updates_done;
          docollide = true;
        }
        listremove( proxy, this.stageRoots[ proxy.stage ] );
        aabbMin.clone( proxy.aabbMin );
        aabbMax.clone( proxy.aabbMax );
        proxy.stage = this.stageCurrent;
        listappend( proxy, this.stageRoots[ this.stageCurrent ] );
        if ( docollide ) {
          this.needcleanup = true;
          if ( !this.deferedcollide ) {
            var collider = Bump.DbvtTreeCollider.create( this );
            this.sets[ 1 ].collideTTpersistentStack( this.sets[ 1 ].root, proxy.leaf, collider );
            this.sets[ 0 ].collideTTpersistentStack( this.sets[ 0 ].root, proxy.leaf, collider );
          }
        }
      }
    },

    typeMembers: {
      Stages: Bump.Enum([
        'DYNAMIC_SET',
        'FIXED_SET',
        'STAGECOUNT'
      ]),

      benchmark: Bump.noop
    }
  });

  tmpSADTC1 = Bump.DbvtTreeCollider.create();

})( this, this.Bump );
