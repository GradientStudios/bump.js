// load: bump.js
// load: LinearMath/Vector3.js
// load: BulletCollision/CollisionShapes/ConcaveShape.js
// load: BulletCollision/CollisionShapes/TriangleCallback.js

// run: BulletCollision/BroadphaseCollision/BroadphaseProxy.js

(function( window, Bump ) {
  var tmpTriangleArray = [
    Bump.Vector3.create(),
    Bump.Vector3.create(),
    Bump.Vector3.create()
  ];

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
      set: function( originalCallback, localScaling ) {
        this.originalCallback = originalCallback;
        this.localScaling.assign( localScaling );
        return this;
      },

      // Uses the following temporary variables:
      //
      // - `tmpTriangleArray`
      processTriangle: function( triangle, partId, triangleIndex ) {
        var m_localScaling = this.localScaling;

        var newTriangle = tmpTriangleArray;
        newTriangle[0] = triangle[0].multiplyVector( m_localScaling, newTriangle[0] );
        newTriangle[1] = triangle[1].multiplyVector( m_localScaling, newTriangle[1] );
        newTriangle[2] = triangle[2].multiplyVector( m_localScaling, newTriangle[2] );
        this.originalCallback.processTriangle( newTriangle, partId, triangleIndex );
      }

    }
  });


  var tmpV1 = Bump.Vector3.create();
  var tmpV2 = Bump.Vector3.create();
  var tmpV3 = Bump.Vector3.create();
  var tmpV4 = Bump.Vector3.create();

  var tmpM1 = Bump.Matrix3x3.create();

  var tmpScaledTriangleCallback = ScaledTriangleCallback.create( null, Bump.Vector3.create() );

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
      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      // - `tmpV3`
      // - `tmpV4`
      // - `tmpM1`
      getAabb: function( trans, aabbMin, aabbMax ) {
        var m_bvhTriMeshShape = this.bvhTriMeshShape;
        var m_localScaling = this.localScaling;

        var localAabbMin = tmpV1.assign( m_bvhTriMeshShape.localAabbMin );
        var localAabbMax = tmpV2.assign( m_bvhTriMeshShape.localAabbMax );

        var tmpLocalAabbMin = localAabbMin.multiplyVector( m_localScaling, tmpV3 );
        var tmpLocalAabbMax = localAabbMax.multiplyVector( m_localScaling, tmpV4 );

        localAabbMin.x = ( m_localScaling.x >= 0 ) ? tmpLocalAabbMin.x : tmpLocalAabbMax.x;
        localAabbMin.y = ( m_localScaling.y >= 0 ) ? tmpLocalAabbMin.y : tmpLocalAabbMax.y;
        localAabbMin.z = ( m_localScaling.z >= 0 ) ? tmpLocalAabbMin.z : tmpLocalAabbMax.z;
        localAabbMax.x = ( m_localScaling.x <= 0 ) ? tmpLocalAabbMin.x : tmpLocalAabbMax.x;
        localAabbMax.y = ( m_localScaling.y <= 0 ) ? tmpLocalAabbMin.y : tmpLocalAabbMax.y;
        localAabbMax.z = ( m_localScaling.z <= 0 ) ? tmpLocalAabbMin.z : tmpLocalAabbMax.z;

        // !!!: tmpV3 and tmpV4 no longer used.

        var localHalfExtents = localAabbMax.subtract( localAabbMin, tmpV3 ).multiplyScalar( 0.5, tmpV3 );
        var margin = m_bvhTriMeshShape.getMargin();
        localHalfExtents.addSelf( tmpV4.setValue( margin, margin, margin ) );
        var localCenter = localAabbMax.add( localAabbMin, tmpV4 ).multiplyScalar( 0.5, tmpV4 );

        // !!!: tmpV1 and tmpV2 no longer used.

        var abs_b = trans.basis.absolute( tmpM1 );

        var center = trans.transform( localCenter, tmpV1 );

        var extent = tmpV2.setValue(
          abs_b.el0.dot( localHalfExtents ),
          abs_b.el1.dot( localHalfExtents ),
          abs_b.el2.dot( localHalfExtents )
        );
        center.subtract( extent, aabbMin );
        center.add( extent, aabbMax );
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      // - `tmpScaledTriangleCallback`
      processAllTriangles: function( callback, aabbMin, aabbMax ) {
        var m_localScaling = this.localScaling;

        var scaledCallback = tmpScaledTriangleCallback.set( callback, m_localScaling );

        // var invLocalScaling = Bump.Vector3.create( 1 / m_localScaling.x, 1 / m_localScaling.y, 1 / m_localScaling.z );
        var invLocalScalingX = 1 / m_localScaling.x;
        var invLocalScalingY = 1 / m_localScaling.y;
        var invLocalScalingZ = 1 / m_localScaling.z;
        var scaledAabbMin = tmpV1;
        var scaledAabbMax = tmpV2;

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
