(function( window, Bump ) {

  // excluding the btRaycastVehicle port for now

  Bump.DefaultVehicleRaycaster = Bump.type({
    parent: Bump.VehicleRaycaster,

    init: function DefaultVehicleRaycaster( world ) {
      this._super();
      this.dynamicsWorld = world;
    },

    members: {
      castRay: function(
        from,                   // const btVector3&
        to,                     // const btVector3&
        result                  // btVehicleRaycasterResult&
      ) {
        // RayResultCallback& resultCallback;

        var rayCallback = Bump.CollisionWorld.ClosestRayResultCallback.create( from, to );

        this.dynamicsWorld.rayTest( from, to, rayCallback );

        if ( rayCallback.hasHit() ) {

          var body = rayCallback.collisionObject;
          if ( body && body.hasContactResponse() ) {
            result.hitPointInWorld = rayCallback.hitPointWorld;
            result.hitNormalInWorld = rayCallback.hitNormalWorld;
            result.hitNormalInWorld.normalize();
            result.distFraction = rayCallback.closestHitFraction;
            return body;
          }
        }

        return null;
      }
    }

  });

})( this, this.Bump );