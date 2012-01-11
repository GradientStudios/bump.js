(function( window, Bump ) {

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
