(function( window, Bump ) {

  Bump.TriangleMeshShape = Bump.type({
    parent: Bump.ConcaveShape,

    init: function TriangleMeshShape( meshInterface ) {
      this._super();

      // Initializer list
      this.meshInterface = meshInterface;
      // End initializer list

      // Default initializers
      this.localAabbMin = Bump.Vector3.create();
      this.localAabbMax = Bump.Vector3.create();
      // End default initializers

      this.shapeType = Bump.BroadphaseNativeTypes.TRIANGLE_MESH_SHAPE_PROXYTYPE;
      if ( meshInterface.hasPremadeAabb() ) {
        meshInterface.getPremadeAabb( this.localAabbMin, this.localAabbMax );
      } else {
        this.recalcLocalAabb();
      }
    },

    members: {

    }

  });

})( this, this.Bump );
