(function( window, Bump ) {

  Bump.BvhTriangleMeshShape = Bump.type({
    parent: Bump.TriangleMeshShape,

    init: function BvhTriangleMeshShape( meshInterface, useQuantizedAabbCompression, buildBvh ) {
      if ( arguments.length < 3 ) {
        buildBvh = true;
      }

      this._super( meshInterface );

      // Initializer list
      this.bvh = null;
      this.triangleInfoMap = null;
      this.useQuantizedAabbCompression = useQuantizedAabbCompression;
      this.ownsBvh = false;
      // End initializer list

      this.shapeType = Bump.BroadphaseNativeTypes.TRIANGLE_MESH_SHAPE_PROXYTYPE;

      if ( buildBvh ) {
        this.buildOptimizedBvh();
      }
    },

    members: {
      destruct: function() {
        if ( this.ownsBvh ) {
          this.bvh.destruct();
        }
      },

      performRaycast: Bump.notImplemented,
      performConvexcast: Bump.notImplemented,
      processAllTriangles: Bump.notImplemented,
      refitTree: Bump.notImplemented,
      partialRefitTree: Bump.notImplemented,

      getName: function() {
        return 'BvhTrianglMesh';
      },

      setLocalScaling: Bump.notImplemented,

      getOptimizedBvh: function() {
        return this.bvh;
      },

      // Note: has default arguments
      setOptimizedBvh: Bump.notImplemented,

      buildOptimizedBvh: function() {
        if ( this.ownsBvh ) {
          this.bvh.destruct();
          this.bvh = null;
        }

        // localAabbMin / localAabbMax is already re-calculated in
        // btTriangleMeshShape. We could just scale aabb, but this needs some
        // more work.
        this.bvh = Bump.OptimizedBvh.create();
        // Rebuild the bvh...
        this.bvh.build( this.meshInterface, this.useQuantizedAabbCompression, this.localAabbMin, this.localAabbMax );
        this.ownsBvh = true;
      },

      usesQuantizedAabbCompression: function() {
        return this.useQuantizedAabbCompression;
      },

      setTriangleInfoMap: function( triangleInfoMap ) {
        this.triangleInfoMap = triangleInfoMap;
      },

      getTriangleInfoMap: function() {
        return this.triangleInfoMap;
      }

    }
  });

})( this, this.Bump );
