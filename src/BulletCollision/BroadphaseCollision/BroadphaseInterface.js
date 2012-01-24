(function( window, Bump ) {

  Bump.BroadphaseAabbCallback = Bump.type({
    members: {
      process: function( proxy ) {
        Bump.Assert( false );
      }
    }
  });

  Bump.BroadphaseRayCallback = Bump.type({
    parent: Bump.BroadphaseAabbCallback,

    init: function BroadphaseRayCallback() {
      this.m_rayDirectionInverse = Bump.Vector3.create();
      this.m_signs = [];
      this.m_lambda_max = 0;
    }
  });

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
