(function( window, Bump ) {

  var ScaledTriangleCallback = Bump.type({
    parent: Bump.TriangleCallback,

    init: function ScaledTriangleCallback( originalCallback, localScaling ) {
      this._super();

      // Initializer list
      this.originalCallback = originalCallback;
      this.localScaling = localScaling.clone();
      // End initializer list
    },

    members: {
      processTriangle: function( triangle, partId, triangleIndex ) {
        var m_localScaling = this.localScaling;

        var newTriangle = new Array(3);
        newTriangle[0] = triangle[0].multiplyVector( m_localScaling );
        newTriangle[1] = triangle[1].multiplyVector( m_localScaling );
        newTriangle[2] = triangle[2].multiplyVector( m_localScaling );
        this.originalCallback.processTriangle( newTriangle, partId, triangleIndex );
      }

    }
  });

  Bump.ScaledBvhTriangleMeshShape = Bump.type({
    parent: Bump.ConcaveShape,

    init: function ScaledBvhTriangleMeshShape( childShape, localScaling ) {
      this._super();

      // Initializer list
      this.localScaling = localScaling.clone();
      this.bvhTriMeshShape = childShape;
      // End initializer list

      this.shapeType = Bump.BroadphaseNativeTypes.SCALED_TRIANGLE_MESH_SHAPE_PROXYTYPE;
    },

    members: {
      processAllTriangles: function( callback, aabbMin, aabbMax ) {
        var m_localScaling = this.localScaling;

        var scaledCallback = ScaledTriangleCallback.create( callback, m_localScaling );

        // var invLocalScaling = Bump.Vector3.create( 1 / m_localScaling.x, 1 / m_localScaling.y, 1 / m_localScaling.z );
        var invLocalScalingX = 1 / m_localScaling.x;
        var invLocalScalingY = 1 / m_localScaling.y;
        var invLocalScalingZ = 1 / m_localScaling.z;
        var scaledAabbMin = Bump.Vector3.create();
        var scaledAabbMax = Bump.Vector3.create();

        // support negative scaling
        scaledAabbMin.x = m_localScaling.x >= 0 ? aabbMin.x * invLocalScalingX : aabbMax.x * invLocalScalingX;
        scaledAabbMin.y = m_localScaling.y >= 0 ? aabbMin.y * invLocalScalingY : aabbMax.y * invLocalScalingY;
        scaledAabbMin.z = m_localScaling.z >= 0 ? aabbMin.z * invLocalScalingZ : aabbMax.z * invLocalScalingZ;
        scaledAabbMin.w = 0;

        scaledAabbMax.x = m_localScaling.x <= 0 ? aabbMin.x * invLocalScalingX : aabbMax.x * invLocalScalingX;
        scaledAabbMax.y = m_localScaling.y <= 0 ? aabbMin.y * invLocalScalingY : aabbMax.y * invLocalScalingY;
        scaledAabbMax.z = m_localScaling.z <= 0 ? aabbMin.z * invLocalScalingZ : aabbMax.z * invLocalScalingZ;
        scaledAabbMax.w = 0;

        this.bvhTriMeshShape.processAllTriangles( scaledCallback, scaledAabbMin, scaledAabbMax );
      },

      getChildShape: function() {
        return this.bvhTriMeshShape;
      },

      getName: function() {
        return 'ScaledBvhTriangleMesh';
      }

    }
  });

})( this, this.Bump );
