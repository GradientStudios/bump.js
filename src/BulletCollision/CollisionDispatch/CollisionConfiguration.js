// load: bump.js

(function( window, Bump ) {

  Bump.CollisionConfiguration = Bump.type({
    init: function CollisionConfiguration() {},
    members: {
      getPersistentManifoldPool: Bump.abstract,
      getCollisionAlgorithmPool: Bump.abstract,
      getStackAllocator: Bump.abstract,
      getCollisionAlgorithmCreateFunc: Bump.abstract
    }
  });

})( this, this.Bump );
