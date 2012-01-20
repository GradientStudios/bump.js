(function( window, Bump ) {

  // *** OverlapCallback *** is the port of the original bullet struct `btOverlapCallback`.
  Bump.OverlapCallback = Bump.type( {
    members: {
      processOverlap: function( pair ) { }
    }
  } );

  // *** OverlapFilterCallback *** is the port of the original bullet struct `btOverlapFilterCallback`.
  Bump.OverlapFilterCallback = Bump.type( {
    members: {
      needBroadphaseCollision: function( proxy0, proxy1 ) { }
    }
  } );

  // These globals shouldn't need to be accessible outside of OverlappingPairCache.js.
  var gRemovePairs = 0,
      gAddedPairs = 0,
      gFindPairs = 0;

  // *** OverlappingPairCache *** is the port of the original bullet class `btOverlappingPairCallback`.
  /// The btOverlappingPairCache provides an interface for overlapping pair management
  /// (add, remove, storage), used by the btBroadphaseInterface broadphases.
  /// The btHashedOverlappingPairCache and btSortedOverlappingPairCache classes are two implementations.
  Bump.OverlappingPairCache = Bump.type( {
    parent: Bump.OverlappingPairCallback,

    members: {
      getOverlappingPairArrayPtr: function() {},
      getOverlappingPairArray: function() {},
      cleanOverlappingPair: function( pair, dispatcher ) {},
      getNumOverlappingPairs: function() {},
      cleanProxyFromPairs: function( proxy, dispatcher ) {},
      setOverlapFilterCallback: function( callback ) {},
      processAllOverlappingPairs: function( callback, dispatcher ) {},
      findPair: function( proxy0, proxy1) {},
      hasDeferredRemoval: function() {},
      setInternalGhostPairCallback: function( ghostPairCallback ) {},
      sortOverlappingPairs: function( dispatcher ) {}
    }

  } );

  // *** HashedOverlappingPairCache *** is the port of the original
  // bullet class `btHashedOverlappingPairCache`.
  /// Hash-space based Pair Cache, thanks to Erin Catto, Box2D,
  /// http://www.box2d.org, and Pierre Terdiman, Codercorner, http://codercorner.com
  var BT_NULL_PAIR = 0xffffffff,
      CAPACITY     = 0x80000000;

  Bump.HashedOverlappingPairCache = Bump.type( {
    parent: Bump.OverlappingPairCache,

    init: function() {
      this.m_overlapFilterCallback = null;
      this.m_blockedForChanges = false;
      this.m_ghostPairCallback = null;

      /* var initialAllocatedSize = 2;
      m_overlappingPairArray.reserve(initialAllocatedSize); */

      this.m_overlappingPairArray = [];
      this.m_hashTable = [];
      this.m_next = [];

      /* this.growTables(); */
    },

    members: {
      removeOverlappingPairsContainingProxy: function( proxy, dispatcher ) {
        // think about moving this out of the function so that the type
        // doesn't get rebuilt every time
        var RemovePairCallback = Bump.type( {
          parent: Bump.OverlapCallback,

          init: function( obseleteProxy ) {
            this.m_obsoleteProxy = obseleteProxy;
          },

          members: {
            processOverlap: function( pair) {
              return ( ( pair.m_pProxy0 === this.m_obsoleteProxy ) ||
                       ( pair.m_pProxy1 === this.m_obsoleteProxy ) );
            }
          }
        } ),
        removeCallback = RemovePairCallback.create( proxy );

        this.processAllOverlappingPairs( removeCallback, dispatcher );
      },

      removeOverlappingPair: function( proxy0, proxy1, dispatcher ) {
        gRemovePairs++;
        if( proxy0.m_uniqueId > proxy1.m_uniqueId ) {
          /* btSwap(proxy0,proxy1); */
          var tmp = proxy0;
          proxy0 = proxy1;
          proxy1 = tmp;
        }
        var proxyId1 = proxy0.getUid(),
            proxyId2 = proxy1.getUid();

        /*if (proxyId1 > proxyId2)
                btSwap(proxyId1, proxyId2);*/

        /* int  hash = static_cast<int>(getHash(static_cast<unsigned int>(proxyId1),static_cast<unsigned int>(proxyId2)) & (m_overlappingPairArray.capacity()-1)); */
        var hash = ( this.getHash( proxyId1 << 0, proxyId2 << 0 ) & ( CAPACITY - 1 ) ) << 0,
            pair = this.internalFindPair( proxy0, proxy1, hash );
        if( pair === undefined ) {
                return 0;
        }

        this.cleanOverlappingPair( pair, dispatcher );

        var userData = pair.m_internalInfo1;

        /* btAssert(pair->m_pProxy0->getUid() == proxyId1);
        btAssert(pair->m_pProxy1->getUid() == proxyId2); */

        /* int pairIndex = int(pair - &m_overlappingPairArray[0]); */
        var pairIndex = this.m_overlappingPairArray.indexOf( pair );
        /* btAssert(pairIndex < m_overlappingPairArray.size()); */

        // Remove the pair from the hash table.
        var index = this.m_hashTable[ hash ];
        /* btAssert(index != BT_NULL_PAIR); */

        var previous = BT_NULL_PAIR;
        while( index !== pairIndex  ) {
          previous = index;
          index = this.m_next[ index ];
        }

        if( previous != BT_NULL_PAIR ) {
          /* btAssert(m_next[previous] == pairIndex); */
          this.m_next[ previous ] = this.m_next[ pairIndex ];
        }
        else {
          this.m_hashTable[ hash ] = this.m_next[ pairIndex ];
        }

        // We now move the last pair into spot of the
        // pair being removed. We need to fix the hash
        // table indices to support the move.

        var lastPairIndex = this.m_overlappingPairArray.length() - 1;

        if( this.m_ghostPairCallback ) {
          this.m_ghostPairCallback.removeOverlappingPair( proxy0, proxy1, dispatcher );
        }

        // If the removed pair is the last pair, we are done.
        if( lastPairIndex === pairIndex ) {
          this.m_overlappingPairArray.pop();
          return userData;
        }

        // Remove the last pair from the hash table.
        var last = this.m_overlappingPairArray[ lastPairIndex ],
        /* missing swap here too, Nat. */
        /* int lastHash = static_cast<int>(getHash(static_cast<unsigned int>(last->m_pProxy0->getUid()), static_cast<unsigned int>(last->m_pProxy1->getUid())) & (m_overlappingPairArray.capacity()-1)); */
            lastHash = ( this.getHash( last.m_pProxy0.getUid() << 0,
                                       last.m_pProxy1.getUid() << 0) & ( CAPACITY - 1) ) << 0;

        index = this.m_hashTable[ lastHash ];
        /* btAssert(index != BT_NULL_PAIR); */

        previous = BT_NULL_PAIR;
        while( index !== lastPairIndex ) {
          previous = index;
          index = this.m_next[ index ];
        }

        if( previous !== BT_NULL_PAIR ) {
          /* btAssert(m_next[previous] == lastPairIndex); */
          this.m_next[ previous ] = this.m_next[ lastPairIndex ];
        }
        else {
          this.m_hashTable[ lastHash ] = this.m_next[ lastPairIndex ];
        }

        // Copy the last pair into the remove pair's spot.
        this.m_overlappingPairArray[ pairIndex ] = this.m_overlappingPairArray[ lastPairIndex ];

        // Insert the last pair into the hash table
        this.m_next[ pairIndex ] = this.m_hashTable[ lastHash ];
        this.m_hashTable[ lastHash ] = pairIndex;

        this.m_overlappingPairArray.pop();

        return userData;

      },

      needsBroadphaseCollision: function( proxy0, proxy1 ) {
        if( this.m_overlapFilterCallback ) {
          return this.m_overlapFilterCallback.needBroadphaseCollision( proxy0, proxy1 );
        }
        var collides = ( proxy0.m_collisionFilterGroup & proxy1.m_collisionFilterMask ) !== 0;
        collides = collides && ( proxy1.m_collisionFilterGroup & proxy0.m_collisionFilterMask );
        return collides;
      },

      // Add a pair and return the new pair. If the pair already exists,
      // no new pair is created and the old one is returned.
      addOverlappingPair: function( proxy0, proxy1 ) {
        gAddedPairs++;
        if( !this.needsBroadphaseCollision( proxy0, proxy1 ) ) {
          return 0;
        }
        return this.internalAddPair( proxy0, proxy1 );
      },

      cleanProxyFromPairs: function( proxy, dispatcher ) {
        var CleanPairCallback = Bump.type( {
          parent: Bump.OverlapCallback,

          init: function( cleanProxy, pairCache, dispatcher) {
            this.m_cleanProxy = cleanProxy;
            this.m_pairCache = pairCache;
            this.m_dispatcher = dispatcher;
          },

          members: {
            processOverlap: function( pair ) {
              if( ( pair.m_pProxy0 === this.m_cleanProxy ) ||
                  ( pair.m_pProxy1 === this.m_cleanProxy ) ) {
                this.m_pairCache.cleanOverlappingPair( pair, this.m_dispatcher );
              }
              return false;
            }
          }
        } ),

        cleanPairs = CleanPairCallback.create( proxy, this, dispatcher );
        this.processAllOverlappingPairs( cleanPairs, dispatcher );
      },

      processAllOverlappingPairs: function( callback, dispatcher ) {}, // TODO

      getOverlappingPairArrayPtr: function() {
        return this.m_overlappingPairArray;
      },

      getOverlappingPairArray: function() {
        return this.m_overlappingPairArray;
      },

      cleanOverlappingPair: function( pair, dispatcher ) {
        if( pair.algorithm ) {
          /* pair->m_algorithm->~CollisionAlgorithm(); */
          dispatcher.freeCollisionAlgorithm( pair.m_algorithm );
          pair.m_algorithm = null;
        }
      },

      findPair: function( proxy0, proxy1 ) {
        gFindPairs++;
        if( proxy0.m_uniqueId > proxy1.m_uniqueId ) {
          /* btSwap(proxy0,proxy1); */
          var tmp = proxy0;
          proxy0 = proxy1;
          proxy1 = tmp;
        }
        var proxyId1 = proxy0.getUid(),
            proxyId2 = proxy1.getUid(),

        /*if (proxyId1 > proxyId2)
                btSwap(proxyId1, proxyId2);*/

        /* int hash = static_cast<int>(getHash(static_cast<unsigned int>(proxyId1),
           static_cast<unsigned int>(proxyId2)) & (m_overlappingPairArray.capacity()-1)); */

        hash = ( this.getHash( proxyId1 << 0, proxyId2 << 0 ) &
                 ( CAPACITY - 1 ) ) << 0;


        if ( hash >= this.m_hashTable.length() ) {
                return undefined;
        }

        // Because we don't need to constantly grow the hash table, we also
        // don't get a chance to initialize all the values to be `BT_NULL_PAIR`.
        // Therefore, we check for `undefined`s and replace them with
        // `BT_NULL_PAIR`s.
        var index = this.m_hashTable[ hash ];
        index = index === undefined ? BT_NULL_PAIR : index;
        while( index != BT_NULL_PAIR && this.equalsPair( this.m_overlappingPairArray[index],
                                                         proxyId1, proxyId2) === false ) {
          index = this.m_next[ index ];
          index = index === undefined ? BT_NULL_PAIR : index;
        }

        if( index === BT_NULL_PAIR ) {
          return undefined;
        }

        /* btAssert(index < m_overlappingPairArray.size()); */

        return this.m_overlappingPairArray[ index ];
      },

      GetCount: function() {
        return this.m_overlappingPairArray.length();
      },
      /* btBroadphasePair* GetPairs() { return m_pairs; } */

      getOverlapFilterCallback: function() {
        return this.m_overlapFilterCallback;
      },

      setOverlapFilterCallback: function( callback ) {
        this.m_overlapFilterCallback = callback;
      },

      getNumOverlappingPairs: function() {
        return this.m_overlappingPairArray.length();
      },

      internalAddPair: function( proxy0, proxy1) {
        if( proxy0.m_uniqueId > proxy1.m_uniqueId ) {
          /* btSwap(proxy0,proxy1); */
          var tmp = proxy0;
          proxy0 = proxy1;
          proxy1 = tmp;
        }
        var proxyId1 = proxy0.getUid(),
            proxyId2 = proxy1.getUid();

        /*if (proxyId1 > proxyId2)
                btSwap(proxyId1, proxyId2);*/

       /*int     hash = static_cast<int>(getHash(static_cast<unsigned int>(proxyId1),static_cast<unsigned int>(proxyId2)) & (m_overlappingPairArray.capacity()-1));      // New hash value with new mask */

        // New hash value with new mask
        var hash = ( this.getHash( proxyId1 << 0, proxyId2 << 0 ) & ( CAPACITY - 1 ) ) << 0,
            pair = this.internalFindPair( proxy0, proxy1, hash );
        if ( pair !== undefined ) {
          return pair;
        }
        /*for(int i=0;i<m_overlappingPairArray.size();++i)
          {
          if(     (m_overlappingPairArray[i].m_pProxy0==proxy0)&&
          (m_overlappingPairArray[i].m_pProxy1==proxy1))
          {
          printf("Adding duplicated %u<>%u\r\n",proxyId1,proxyId2);
          internalFindPair(proxy0, proxy1, hash);
          }
          }*/

        var count = this.m_overlappingPairArray.length();

        //this is where we add an actual pair, so also call the 'ghost'
        if( this.m_ghostPairCallback ) {
          this.m_ghostPairCallback.addOverlappingPair( proxy0, proxy1 );
        }

        pair = Bump.BroadphasePair.create( proxy0, proxy1 );
        /* pair.m_pProxy0 = proxy0; */
        /* pair.m_pProxy1 = proxy1; */
        pair.m_algorithm = 0;
        pair.m_internalTmpValue = 0;

        this.m_overlappingPairArray.push( pair );

        this.m_next[ count ] = this.m_hashTable[ hash ];
        this.m_hashTable[ hash ] = count;

        return pair;
      },

      equalsPair: function( pair, proxyId1, proxyId2 ) {
        return ( pair.m_pProxy0.getUid() == proxyId1 ) && ( pair.m_pProxy1.getUid() == proxyId2 );
      },

        /*
        // Thomas Wang's hash, see: http://www.concentric.net/~Ttwang/tech/inthash.htm
        // This assumes proxyId1 and proxyId2 are 16-bit.
        SIMD_FORCE_INLINE int getHash(int proxyId1, int proxyId2)
        {
                int key = (proxyId2 << 16) | proxyId1;
                key = ~key + (key << 15);
                key = key ^ (key >> 12);
                key = key + (key << 2);
                key = key ^ (key >> 4);
                key = key * 2057;
                key = key ^ (key >> 16);
                return key;
        }
        */

      getHash: function( proxyId1, proxyId2 ) {
        //int key = static_cast<int>(((unsigned int)proxyId1) | (((unsigned int)proxyId2) <<16));
        var key = ( proxyId1 << 0 ) | ( proxyId2 << 0 ) << 16;
        // Thomas Wang's hash

        key += ~(key << 15);
        key ^=  (key >> 10);
        key +=  (key << 3);
        key ^=  (key >> 6);
        key += ~(key << 11);
        key ^=  (key >> 16);
        return key << 0;
      },

      internalFindPair: function( proxy0, proxy1, hash ) {
        var proxyId1 = proxy0.getUid(),
            proxyId2 = proxy1.getUid(),
            index = this.m_hashTable[ hash ];
/*
#if 0 // wrong, 'equalsPair' use unsorted uids, copy-past devil striked again. Nat.
        if (proxyId1 > proxyId2)
          btSwap(proxyId1, proxyId2);
#endif
*/
        index = index === undefined ? BT_NULL_PAIR : index;
        while( index != BT_NULL_PAIR &&
               this.equalsPair( this.m_overlappingPairArray[ index ], proxyId1, proxyId2) === false) {
          index = this.m_next[index];
          index = index === undefined ? BT_NULL_PAIR : index;
        }

        if ( index == BT_NULL_PAIR ) {
          return undefined;
        }

        /* btAssert(index < this.m_overlappingPairArray.size()); */

        return this.m_overlappingPairArray[ index ];
      },

      hasDeferredRemoval: function() {
        return false;
      },

      setInternalGhostPairCallback: function( ghostPairCallback ) {
        this.m_ghostPairCallback = ghostPairCallback;
      },

      sortOverlappingPairs: function( dispatcher ) {} // TODO

    }
  } );

} )( this, this.Bump );