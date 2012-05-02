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

      processAllTriangles: function( callback, aabbMin, aabbMax ) {
        var MyNodeOverlapCallback = Bump.BvhTriangleMeshShape.__processAllTriangles__MyNodeOverlapCallback;
        var myNodeCallback = MyNodeOverlapCallback.create( callback, this.meshInterface );
        this.bvh.reportAabbOverlappingNodex( myNodeCallback, aabbMin, aabbMax );
      },

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

  Bump.BvhTriangleMeshShape.__processAllTriangles__MyNodeOverlapCallback = Bump.type({
    parent: Bump.NodeOverlapCallback,

    init: function __processAllTriangles__MyNodeOverlapCallback( callback, meshInterface ) {
      // Initializer list
      this.meshInterface = meshInterface;
      this.callback = callback;
      // End initializer list

      // Default initializers
      this.triangle = [
        Bump.Vector3.create(),
        Bump.Vector3.create(),
        Bump.Vector3.create()
      ];
      // End default initializers
    },

    members: {
      processNode: function( nodeSubPart, nodeTriangleIndex ) {
        var PHY_ScalarType = Bump.PHY_ScalarType;
        var PHY_UCHAR      = PHY_ScalarType.PHY_UCHAR;
        var PHY_SHORT      = PHY_ScalarType.PHY_SHORT;
        var PHY_INTEGER    = PHY_ScalarType.PHY_INTEGER;
        var PHY_FLOAT      = PHY_ScalarType.PHY_FLOAT;

        var m_meshInterface = this.meshInterface;
        var m_triangle = this.triangle;

        var data = {
          vertexbase: null,
          numVerts: 0,
          type: 0,
          vertexStride: 0,
          indexbase: null,
          indexStride: 0,
          numFaces: 0,
          indicesType: 0
        };

        m_meshInterface.getLockedReadOnlyVertexIndexBase( data, nodeSubPart );

        var vertexbase  = data.vertexbase;
        // var numverts    = data.numVerts;
        var type        = data.type;
        var stride      = data.vertexStride;
        var indexbase   = data.indexbase;
        var indexstride = data.indexStride;
        // var numfaces    = data.numFaces;
        var indicestype = data.indicesType;

        var gfxbaseType = (
          indicestype === PHY_SHORT ?
            Uint16Array :
            (
              indicestype === PHY_INTEGER ?
                Uint32Array :
                Uint8Array
            )
        );

        var gfxbase = new gfxbaseType( indexbase.buffer, nodeTriangleIndex * indexstride );
        Bump.Assert( indicestype === PHY_INTEGER ||
                     indicestype === PHY_SHORT   ||
                     indicestype === PHY_UCHAR   );

        var meshScaling = m_meshInterface.getScaling();
        for ( var j = 2; j >= 0; --j ) {
          var graphicsindex = gfxbase[j];

          var graphicsbase;
          if ( type === PHY_FLOAT ) {
            graphicsbase = new Float32Array( vertexbase.buffer, graphicsindex * stride );

            m_triangle[j] = Bump.Vector3.create(
              graphicsbase[0] * meshScaling.x,
              graphicsbase[1] * meshScaling.y,
              graphicsbase[2] * meshScaling.z
            );
          } else {
            graphicsbase = new Float64Array( vertexbase.buffer, graphicsindex * stride );

            m_triangle[j] = Bump.Vector3.create(
              graphicsbase[0] * meshScaling.x,
              graphicsbase[1] * meshScaling.y,
              graphicsbase[2] * meshScaling.z
            );
          }
        }

        this.callback.processTriangle( m_triangle, nodeSubPart, nodeTriangleIndex );
        m_meshInterface.unLockReadOnlyVertexBase( nodeSubPart );
      }

    }
  });

})( this, this.Bump );
