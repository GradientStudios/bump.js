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
  Bump.HashedOverlappingPairCache = Bump.type( {
    parent: Bump.OverlappingPairCache,

    init: function() {
      this.m_overlappingPairArray = [];
      this.m_overlapFilterCallback = null;
      this.m_blockedForChanges = false;
    }

    members: {
      removeOverlappingPairsContainingProxy: function( proxy, dispatched ) {}, // TODO
      removeOverlappingPair: function( proxy0, proxy1, dispatcher ) {}, // TODO

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

      cleanProxyFromPairs: function( proxy,btDispatcher* dispatcher) {}, // TODO
      processAllOverlappingPairs: function( callback, dispatcher) {}, // TODO

      getOverlappingPairArrayPtr: function() {
        return this.m_overlappingPairArray;
      },

      getOverlappingPairArray: function() {
        return this.m_overlappingPairArray;
      },

      cleanOverlappingPair: function( pair, dispatcher ) {}, // TODO

      findPair: function( proxy0, proxy1 ) {}, // TODO

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
      }

      internalAddPair: function( proxy0, proxy1) {}, // TODO

      growTables: function() {}, // TODO

      equalsPair: function( pair, proxyId1, proxyId2 ) {
        return ( pair.this.m_pProxy0.getUid() == proxyId1 ) && ( pair.this.m_pProxy1.getUid() == proxyId2 );
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
            index = this.this.m_hashTable[ hash ];
/*
#if 0 // wrong, 'equalsPair' use unsorted uids, copy-past devil striked again. Nat.
        if (proxyId1 > proxyId2)
          btSwap(proxyId1, proxyId2);
#endif
*/
        while( index != BT_NULL_PAIR &&
               equalsPair( this.m_overlappingPairArray[ index ], proxyId1, proxyId2) == false) {
          index = this.m_next[index];
        }

        if ( index == BT_NULL_PAIR ) {
          return NULL;
        }

        /* btAssert(index < this.m_overlappingPairArray.size()); */

        return this.m_overlappingPairArray[index];
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