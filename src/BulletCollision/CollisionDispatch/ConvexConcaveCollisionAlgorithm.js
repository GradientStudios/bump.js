(function( window, Bump ) {

  Bump.ConvexTriangleCallback = Bump.type({
    parent: Bump.TriangleCallback
  });

  Bump.ConvexConcaveCollisionAlgorithm = Bump.type({
    parent: Bump.ActivatingCollisionAlgorithm,

    typeMembers: {
      CreateFunc: Bump.type({
        parent: Bump.CollisionAlgorithmCreateFunc,
        init: function CreateFunc() { this._super(); },
        members: {
          CreateCollisionAlgorithm: function( ci, body0, body1 ) {
            return Bump.ConvexConcaveCollisionAlgorithm.create( ci, body0, body1, false );
          }
        }
      }),

      SwappedCreateFunc: Bump.type({
        parent: Bump.CollisionAlgorithmCreateFunc,
        init: function SwappedCreateFunc() { this._super(); },
        members: {
          CreateCollisionAlgorithm: function( ci, body0, body1 ) {
            return Bump.ConvexConcaveCollisionAlgorithm.create( ci, body0, body1, true );
          }
        }
      })

    }
  });

})( this, this.Bump );
