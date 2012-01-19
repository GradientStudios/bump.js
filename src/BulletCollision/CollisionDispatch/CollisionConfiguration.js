(function( window, Bump ) {

  Bump.CollisionConfiguration = Bump.type({
    members: {
      getPersistentManifoldPool: Bump.abstract,
      getCollisionAlgorithmPool: Bump.abstract,
      getStackAllocator: Bump.abstract,
      getCollisionAlgorithmCreateFunc: Bump.abstract
    }
  });

})( this, this.Bump );
