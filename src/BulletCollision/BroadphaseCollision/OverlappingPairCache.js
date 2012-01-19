(function( window, Bump ) {

  // *** OverlapCallback *** is the port of the original bullet struct `btOverlapCallback`.
  Bump.OverlapCallback = Bump.type( {
    members: {
      processOverlap( pair ) { }
    }
  } );

  // *** OverlapFilterCallback *** is the port of the original bullet struct `btOverlapFilterCallback`.
  Bump.OverlapFilterCallback = Bump.type( {
    members: {
      needBroadphaseCollision( proxy0, proxy1 ) { }
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

    }
  } );

} )( this, this.Bump );