(function( window, Bump ) {

  Bump.BroadphaseInterface = Bump.type({
    members: {
      createProxy: Bump.abstract,
      destroyProxy: Bump.abstract,
      setAabb: Bump.abstract,
      getAabb: Bump.abstract,
      rayTest: Bump.abstract,
      aabbTest: Bump.abstract,
      calculateOverlappingPairs: Bump.abstract,
      getOverlappingPairCache: Bump.abstract,
      getBroadphaseAabb: Bump.abstract,
      resetPool: Bump.noop,
      printStats: Bump.abstract
    }
  });
})( this, this.Bump );
