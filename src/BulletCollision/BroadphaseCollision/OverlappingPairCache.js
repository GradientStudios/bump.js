// load: bump.js
// load: BulletCollision/BroadphaseCollision/OverlappingPairCallback.js

// run: BulletCollision/BroadphaseCollision/BroadphaseProxy.js

(function( window, Bump ) {

  // **OverlapCallback** is the port of the original bullet struct
  // `btOverlapCallback`.
  Bump.OverlapCallback = Bump.type({
    init: function OverlapCallback() {},
    members: {
      processOverlap: Bump.abstract
    }
  });

  // **OverlapFilterCallback** is the port of the original bullet struct `btOverlapFilterCallback`.
  Bump.OverlapFilterCallback = Bump.type({
    init: function OverlapFilterCallback() {},
    members: {
      needBroadphaseCollision: Bump.abstract
    }
  });

  // These globals shouldn't need to be accessible outside of OverlappingPairCache.js.
  var gOverlappingPairs = 0,
      gRemovePairs = 0,
      gAddedPairs = 0,
      gFindPairs = 0;

  // **OverlappingPairCache** is the port of the original bullet class `btOverlappingPairCallback`.
  // The btOverlappingPairCache provides an interface for overlapping pair management
  // (add, remove, storage), used by the btBroadphaseInterface broadphases.
  // The btHashedOverlappingPairCache and btSortedOverlappingPairCache classes are two implementations.
  Bump.OverlappingPairCache = Bump.type({
    parent: Bump.OverlappingPairCallback,

    init: function OverlappingPairCache() {
      this._super();
    },

    members: {
      getOverlappingPairArrayPtr: Bump.abstract,
      getOverlappingPairArray: Bump.abstract,
      cleanOverlappingPair: Bump.abstract,
      getNumOverlappingPairs: Bump.abstract,
      cleanProxyFromPairs: Bump.abstract,
      setOverlapFilterCallback: Bump.abstract,
      processAllOverlappingPairs: Bump.abstract,
      findPair: Bump.abstract,
      hasDeferredRemoval: Bump.abstract,
      setInternalGhostPairCallback: Bump.abstract,
      sortOverlappingPairs: Bump.abstract

    }
  });

  // **HashedOverlappingPairCache** is the port of the original
  // bullet class `btHashedOverlappingPairCache`.
  // Hash-space based Pair Cache, thanks to Erin Catto, Box2D,
  // http://www.box2d.org, and Pierre Terdiman, Codercorner, http://codercorner.com
  var BT_NULL_PAIR = 0xffffffff,
      CAPACITY     = 0x80000000;

  Bump.HashedOverlappingPairCache = Bump.type({
    parent: Bump.OverlappingPairCache,

    init: function HashedOverlappingPairCache() {
      this.overlapFilterCallback = null;
      this.blockedForChanges = false;
      this.ghostPairCallback = null;

      // var initialAllocatedSize = 2;
      // overlappingPairArray.reserve(initialAllocatedSize);

      this.overlappingPairArray = [];
      this.hashTable = [];
      this.next = [];

      // this.growTables();
    },

    members: {
      removeOverlappingPairsContainingProxy: function( proxy, dispatcher ) {
        // think about moving this out of the function so that the type
        // doesn't get rebuilt every time
        var RemovePairCallback = Bump.type({
          parent: Bump.OverlapCallback,

          init: function RemovePairCallback( obseleteProxy ) {
            this.obsoleteProxy = obseleteProxy;
          },

          members: {
            processOverlap: function( pair ) {
              return ( ( pair.pProxy0 === this.obsoleteProxy ) ||
                       ( pair.pProxy1 === this.obsoleteProxy ) );
            }
          }
        }),
        removeCallback = RemovePairCallback.create( proxy );

        this.processAllOverlappingPairs( removeCallback, dispatcher );
      },

      removeOverlappingPair: function( proxy0, proxy1, dispatcher ) {
        gRemovePairs++;
        if ( proxy0.uniqueId > proxy1.uniqueId ) {
          // btSwap(proxy0,proxy1);
          var tmp = proxy0;
          proxy0 = proxy1;
          proxy1 = tmp;
        }
        var proxyId1 = proxy0.getUid(),
            proxyId2 = proxy1.getUid();

        // if ( proxyId1 > proxyId2 )
        //   btSwap( proxyId1, proxyId2 );

        // int  hash = static_cast<int>(getHash(static_cast<unsigned int>(proxyId1),static_cast<unsigned int>(proxyId2)) & (overlappingPairArray.capacity()-1));
        var hash = ( this.getHash( proxyId1 << 0, proxyId2 << 0 ) & ( CAPACITY - 1 ) ) << 0,
            pair = this.internalFindPair( proxy0, proxy1, hash );
        if ( pair === undefined ) {
                return 0;
        }

        this.cleanOverlappingPair( pair, dispatcher );

        var userData = pair.internalInfo1;

        // Bump.Assert( pair.pProxy0.getUid() === proxyId1 );
        // Bump.Assert( pair.pProxy1.getUid() === proxyId2 );

        // int pairIndex = int(pair - &overlappingPairArray[0]);
        var pairIndex = this.overlappingPairArray.indexOf( pair );
        // Bump.Assert( pairIndex < overlappingPairArray.length );

        // Remove the pair from the hash table.
        var index = this.hashTable[ hash ];
        // Bump.Assert( index !== BT_NULL_PAIR );

        var previous = BT_NULL_PAIR;
        while ( index !== pairIndex  ) {
          previous = index;
          index = this.next[ index ];
        }

        if ( previous !== BT_NULL_PAIR ) {
          // Bump.Assert( next[previous] === pairIndex );
          this.next[ previous ] = this.next[ pairIndex ];
        } else {
          this.hashTable[ hash ] = this.next[ pairIndex ];
        }

        // We now move the last pair into spot of the
        // pair being removed. We need to fix the hash
        // table indices to support the move.

        var lastPairIndex = this.overlappingPairArray.length - 1;

        if ( this.ghostPairCallback ) {
          this.ghostPairCallback.removeOverlappingPair( proxy0, proxy1, dispatcher );
        }

        // If the removed pair is the last pair, we are done.
        if ( lastPairIndex === pairIndex ) {
          this.overlappingPairArray.pop();
          return userData;
        }

        // Remove the last pair from the hash table.
        var last = this.overlappingPairArray[ lastPairIndex ],
        // missing swap here too, Nat.
        // int lastHash = static_cast<int>(getHash(static_cast<unsigned int>(last->pProxy0->getUid()), static_cast<unsigned int>(last->pProxy1->getUid())) & (overlappingPairArray.capacity()-1));
        lastHash = ( this.getHash( last.pProxy0.getUid() << 0,
                                   last.pProxy1.getUid() << 0 ) & ( CAPACITY - 1 ) ) << 0;

        index = this.hashTable[ lastHash ];
        // Bump.Assert( index !== BT_NULL_PAIR );

        previous = BT_NULL_PAIR;
        while ( index !== lastPairIndex ) {
          previous = index;
          index = this.next[ index ];
        }

        if ( previous !== BT_NULL_PAIR ) {
          // Bump.Assert( next[previous] === lastPairIndex );
          this.next[ previous ] = this.next[ lastPairIndex ];
        } else {
          this.hashTable[ lastHash ] = this.next[ lastPairIndex ];
        }

        // Copy the last pair into the remove pair's spot.
        this.overlappingPairArray[ pairIndex ] = this.overlappingPairArray[ lastPairIndex ];

        // Insert the last pair into the hash table
        this.next[ pairIndex ] = this.hashTable[ lastHash ];
        this.hashTable[ lastHash ] = pairIndex;

        this.overlappingPairArray.pop();

        return userData;

      },

      needsBroadphaseCollision: function( proxy0, proxy1 ) {
        if ( this.overlapFilterCallback ) {
          return this.overlapFilterCallback.needBroadphaseCollision( proxy0, proxy1 );
        }
        var collides = ( proxy0.collisionFilterGroup & proxy1.collisionFilterMask ) !== 0;
        collides = collides && ( proxy1.collisionFilterGroup & proxy0.collisionFilterMask );
        return collides;
      },

      // Add a pair and return the new pair. If the pair already exists,
      // no new pair is created and the old one is returned.
      addOverlappingPair: function( proxy0, proxy1 ) {
        gAddedPairs++;
        if ( !this.needsBroadphaseCollision( proxy0, proxy1 ) ) {
          return 0;
        }
        return this.internalAddPair( proxy0, proxy1 );
      },

      cleanProxyFromPairs: function( proxy, dispatcher ) {
        var CleanPairCallback = Bump.type({
          parent: Bump.OverlapCallback,

          init: function CleanPairCallback( cleanProxy, pairCache, dispatcher ) {
            this.cleanProxy = cleanProxy;
            this.pairCache = pairCache;
            this.dispatcher = dispatcher;
          },

          members: {
            processOverlap: function( pair ) {
              if ( ( pair.pProxy0 === this.cleanProxy ) ||
                  ( pair.pProxy1 === this.cleanProxy ) ) {
                this.pairCache.cleanOverlappingPair( pair, this.dispatcher );
              }
              return false;
            }
          }
        }),

        cleanPairs = CleanPairCallback.create( proxy, this, dispatcher );
        this.processAllOverlappingPairs( cleanPairs, dispatcher );
      },

      processAllOverlappingPairs: function( callback, dispatcher ) {
        var i;
        // printf("overlappingPairArray.size()=%d\n",overlappingPairArray.size());
        for ( i = 0; i < this.overlappingPairArray.length; ) {
          var pair = this.overlappingPairArray[i];
          if ( callback.processOverlap( pair ) ) {
            this.removeOverlappingPair( pair.pProxy0, pair.pProxy1, dispatcher );
            gOverlappingPairs--;
          }
          else {
            i++;
          }
        }
      },

      getOverlappingPairArrayPtr: function() {
        return this.overlappingPairArray;
      },

      getOverlappingPairArray: function() {
        return this.overlappingPairArray;
      },

      cleanOverlappingPair: function( pair, dispatcher ) {
        if ( pair.algorithm ) {
          // pair->algorithm->~CollisionAlgorithm();
          dispatcher.freeCollisionAlgorithm( pair.algorithm );
          pair.algorithm = null;
        }
      },

      findPair: function( proxy0, proxy1 ) {
        gFindPairs++;
        if ( proxy0.uniqueId > proxy1.uniqueId ) {
          // btSwap(proxy0,proxy1);
          var tmp = proxy0;
          proxy0 = proxy1;
          proxy1 = tmp;
        }
        var proxyId1 = proxy0.getUid(),
            proxyId2 = proxy1.getUid(),

        // if ( proxyId1 > proxyId2 )
        //   btSwap( proxyId1, proxyId2 );

        // int hash = static_cast<int>(getHash(static_cast<unsigned int>(proxyId1),
        //                                     static_cast<unsigned int>(proxyId2)) & (overlappingPairArray.capacity()-1));

        hash = ( this.getHash( proxyId1 << 0, proxyId2 << 0 ) &
                 ( CAPACITY - 1 ) ) << 0;


        if ( hash >= this.hashTable.length ) {
                return undefined;
        }

        // Because we don't need to constantly grow the hash table, we also
        // don't get a chance to initialize all the values to be `BT_NULL_PAIR`.
        // Therefore, we check for `undefined`s and replace them with
        // `BT_NULL_PAIR`s.
        var index = this.hashTable[ hash ];
        index = index === undefined ? BT_NULL_PAIR : index;
        while ( index !== BT_NULL_PAIR && this.equalsPair( this.overlappingPairArray[index],
                                                           proxyId1, proxyId2 ) === false ) {
          index = this.next[ index ];
          index = index === undefined ? BT_NULL_PAIR : index;
        }

        if ( index === BT_NULL_PAIR ) {
          return undefined;
        }

        // Bump.Assert( index < overlappingPairArray.length );

        return this.overlappingPairArray[ index ];
      },

      GetCount: function() {
        return this.overlappingPairArray.length;
      },

      getOverlapFilterCallback: function() {
        return this.overlapFilterCallback;
      },

      setOverlapFilterCallback: function( callback ) {
        this.overlapFilterCallback = callback;
      },

      getNumOverlappingPairs: function() {
        return this.overlappingPairArray.length;
      },

      internalAddPair: function( proxy0, proxy1 ) {
        if ( proxy0.uniqueId > proxy1.uniqueId ) {
          // btSwap( proxy0, proxy1 );
          var tmp = proxy0;
          proxy0 = proxy1;
          proxy1 = tmp;
        }

        var proxyId1 = proxy0.getUid(),
            proxyId2 = proxy1.getUid();

        // if ( proxyId1 > proxyId2 )
        //   btSwap( proxyId1, proxyId2 );

        // int hash = static_cast<int>(getHash(static_cast<unsigned int>(proxyId1),static_cast<unsigned int>(proxyId2)) & (overlappingPairArray.capacity()-1));      // New hash value with new mask

        // New hash value with new mask
        var hash = ( this.getHash( proxyId1 << 0, proxyId2 << 0 ) & ( CAPACITY - 1 ) ) << 0,
            pair = this.internalFindPair( proxy0, proxy1, hash );
        if ( pair !== undefined ) {
          return pair;
        }

        // for ( int i=0; i < overlappingPairArray.size(); ++i ) {
        //   if ( (overlappingPairArray[i].pProxy0 === proxy0) &&
        //        (overlappingPairArray[i].pProxy1 === proxy1) )
        //   {
        //     printf("Adding duplicated %u<>%u\r\n",proxyId1,proxyId2);
        //     internalFindPair( proxy0, proxy1, hash );
        //   }
        // }

        var count = this.overlappingPairArray.length;

        // this is where we add an actual pair, so also call the 'ghost'
        if ( this.ghostPairCallback ) {
          this.ghostPairCallback.addOverlappingPair( proxy0, proxy1 );
        }

        pair = Bump.BroadphasePair.create( proxy0, proxy1 );
        // pair.pProxy0 = proxy0;
        // pair.pProxy1 = proxy1;
        pair.algorithm = 0;
        pair.internalTmpValue = 0;

        this.overlappingPairArray.push( pair );

        this.next[ count ] = this.hashTable[ hash ];
        this.hashTable[ hash ] = count;

        return pair;
      },

      equalsPair: function( pair, proxyId1, proxyId2 ) {
        return ( pair.pProxy0.getUid() === proxyId1 ) && ( pair.pProxy1.getUid() === proxyId2 );
      },

      // // Thomas Wang's hash, see: http://www.concentric.net/~Ttwang/tech/inthash.htm
      // // This assumes proxyId1 and proxyId2 are 16-bit.
      // SIMD_FORCE_INLINE int getHash(int proxyId1, int proxyId2)
      // {
      //         int key = (proxyId2 << 16) | proxyId1;
      //         key = ~key + (key << 15);
      //         key = key ^ (key >> 12);
      //         key = key + (key << 2);
      //         key = key ^ (key >> 4);
      //         key = key * 2057;
      //         key = key ^ (key >> 16);
      //         return key;
      // }

      getHash: function( proxyId1, proxyId2 ) {
        // int key = static_cast<int>(((unsigned int)proxyId1) | (((unsigned int)proxyId2) <<16));
        var key = ( proxyId1 << 0 ) | ( proxyId2 << 0 ) << 16;
        // Thomas Wang's hash

        key += ~( key << 15 );
        key ^=  ( key >> 10 );
        key +=  ( key <<  3 );
        key ^=  ( key >>  6 );
        key += ~( key << 11 );
        key ^=  ( key >> 16 );
        return key << 0;
      },

      internalFindPair: function( proxy0, proxy1, hash ) {
        var proxyId1 = proxy0.getUid(),
            proxyId2 = proxy1.getUid(),
            index = this.hashTable[ hash ];
        index = index === undefined ? BT_NULL_PAIR : index;
        while ( index !== BT_NULL_PAIR &&
                this.equalsPair( this.overlappingPairArray[ index ], proxyId1, proxyId2 ) === false ) {
          index = this.next[index];
          index = index === undefined ? BT_NULL_PAIR : index;
        }

        if ( index === BT_NULL_PAIR ) {
          return undefined;
        }

        // Bump.Assert( index < this.overlappingPairArray.length );

        return this.overlappingPairArray[ index ];
      },

      hasDeferredRemoval: function() {
        return false;
      },

      setInternalGhostPairCallback: function( ghostPairCallback ) {
        this.ghostPairCallback = ghostPairCallback;
      },

      sortOverlappingPairs: function( dispatcher ) {
        // need to keep hashmap in sync with pair address, so rebuild all
        var tmpPairs = [],
            i;
        for ( i = 0; i < this.overlappingPairArray.length; i++ ) {
          tmpPairs.push( this.overlappingPairArray[ i ] );
        }

        for ( i = 0 ; i < tmpPairs.length; i++ ) {
          this.removeOverlappingPair( tmpPairs[ i ].pProxy0, tmpPairs[ i ].pProxy1, dispatcher );
        }

        for ( i = 0; i < this.next.length; i++ ) {
          this.next[ i ] = BT_NULL_PAIR;
        }

        Bump.quickSort( tmpPairs, Bump.BroadphasePairSortPredicate.create() );

        for ( i = 0; i < tmpPairs.length; i++ ) {
          this.addOverlappingPair( tmpPairs[ i ].pProxy0, tmpPairs[ i ].pProxy1 );
        }
      }
    }
  });

})( this, this.Bump );
