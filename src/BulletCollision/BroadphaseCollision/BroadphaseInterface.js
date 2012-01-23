(function( window, Bump ) {

  Bump.BroadphaseAabbCallback = Bump.type( {
    members: {
      process: function( proxy ) {
        Bump.Assert( false );
      }
    }
  } )( this, this.Bump );

  Bump.BroadphaseRayCallback = Bump.type( {
    parent: Bump.BroadphaseAabbCallback,

    init: function() {
      this.m_rayDirectionInverse = Bump.Vector3.create();
      this.m_signs = [];
      this.m_lambda_max = 0;
    }
  } )( this, this.Bump );

  Bump.BroadphaseInterface = Bump.type({
    members: {
      createProxy: function() {
        Bump.Assert( false );
      },

      destroyProxy: function() {
        Bump.Assert( false );
      },

      setAabb: function() {
        Bump.Assert( false );
      },

      getAabb: function() {
        Bump.Assert( false );
      },

      rayTest: function() {
        Bump.Assert( false );
      },

      aabbTest: function() {
        Bump.Assert( false );
      },

      calculateOverlappingPairs: function() {
        Bump.Assert( false );
      },

      getOverlappingPairCache: function() {
        Bump.Assert( false );
      },

      getBroadphaseAabb: function() {
        Bump.Assert( false );
      },

      resetPool: function() {},

      printStats: function() {
        Bump.Assert( false );
      }
    }
  });
})( this, this.Bump );
