// load: bump.js

// run: LinearMath/Vector3.js

(function( window, Bump ) {

  Bump.BroadphaseAabbCallback = Bump.type({
    init: function BroadphaseAabbCallback() {},
    members: {
      process: function( proxy ) {
        Bump.Assert( false );
      }
    }
  });

  Bump.BroadphaseRayCallback = Bump.type({
    parent: Bump.BroadphaseAabbCallback,

    init: function BroadphaseRayCallback() {
      this.rayDirectionInverse = Bump.Vector3.create();
      this.signs = [];
      this.lambda_max = 0;
    }
  });

  Bump.BroadphaseInterface = Bump.type({
    init: function BroadphaseInterface() {},
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
