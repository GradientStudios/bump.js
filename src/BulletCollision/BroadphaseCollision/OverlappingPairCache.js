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

  // Find these:
  // extern int gRemovePairs;
  // extern int gAddedPairs;
  // extern int gFindPairs;

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
      removeOverlappingPairsContainingProxy( proxy, dispatched ) {}
    }
  } );

} )( this, this.Bump );