(function( window, Bump ) {

  Bump.CollisionConfiguration = Bump.type({
    members: {
      getPersistentManifoldPool: function() { Bump.Assert( false ); },
      getCollisionAlgorithmPool: function() { Bump.Assert( false ); },
      getStackAllocator: function() { Bump.Assert( false ); },
      getCollisionAlgorithmCreateFunc: function() { Bump.Assert( false ); }
    }
  });

})( this, this.Bump );
