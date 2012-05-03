(function( window, Bump ) {

  var FilteredCallback = Bump.type({
    parent: Bump.InternalTriangleIndexCallback,

    init: function FilteredCallback( callback, aabbMin, aabbMax ) {
      this.callback = callback;
      this.aabbMin = aabbMin.clone();
      this.aabbMax = aabbMax.clone();
    },

    members: {
      internalProcessTriangleIndex: function( triangle, partId, triangleIndex ) {
        if ( Bump.testTriangleAgainstAabb2( triangle, this.aabbMin, this.aabbMax ) ) {
          // check aabb in triangle-space, before doing this
          this.callback.processTriangle( triangle, partId, triangleIndex );
        }
      }
    }
  });

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
      localGetSupportingVertex: function( vec, dest ) {
        if ( !dest ) { dest = Bump.Vector3.create(); }

        var supportVertex = dest.setValue( 0, 0, 0 );

        var ident = Bump.Transform.create();
        ident.setIdentity();

        var supportCallback = Bump.TriangleMeshShape.SupportVertexCallback.create( vec, ident );
        var aabbMax = Bump.Vector3.create( Infinity, Infinity, Infinity );
        this.processAllTriangles( supportCallback, aabbMax.negate(), aabbMax );

        // supportVertex.assign( supportCallback.GetSupportVertexLocal() );
        supportCallback.GetSupportVertexLocal( supportVertex );

        return supportVertex;
      },

      localGetSupportingVertexWithoutMargin: function( vec, dest ) {
        Bump.Assert( false );
        return this.localGetSupportingVertex( vec, dest );
      },

      recalcLocalAabb: function() {
        var m_localAabbMin = this.localAabbMin;
        var m_localAabbMax = this.localAabbMax;

        var vec = Bump.Vector3.create();
        var tmpVec1 = Bump.Vector3.create();

        for ( var i = 0; i < 3; ++i ) {
          vec.setValue( 0, 0, 0 );
          vec[i] = 1;
          var tmp = this.localGetSupportingVertex( vec, tmpVec1 );
          m_localAabbMax[i] = tmp[i] + this.collisionMargin;
          vec[i] = -1;
          tmp = this.localGetSupportingVertex( vec, tmpVec1 );
          m_localAabbMin[i] = tmp[i] - this.collisionMargin;
        }
      },

      getAabb: Bump.notImplemented,

      processAllTriangles: function( callback, aabbMin, aabbMax ) {
        var filterCallback = FilteredCallback.create( callback, aabbMin, aabbMax );

        this.meshInterface.InternalProcessAllTriangles( filterCallback, aabbMin, aabbMax );
      },

      calculateLocalInertia: Bump.notImplemented,
      setLocalScaling: Bump.notImplemented,
      getLocalScaling: Bump.notImplemented,

      getMeshInterface: function() {
        return this.meshInterface;
      },

      getLocalAabbMin: function() {
        return this.localAabbMin;
      },

      getLocalAabbMax: function() {
        return this.localAabbMax;
      },

      getName: function() {
        return 'TriangleMesh';
      }

    }
  });

  Bump.TriangleMeshShape.SupportVertexCallback = Bump.type({
    parent: Bump.TriangleCallback,

    init: function SupportVertexCallback( supportVecWorld, trans ) {
      this._super();

      // Initializer list
      this.supportVertexLocal = Bump.Vector3.create( 0, 0, 0 );
      this.worldTrans = trans.clone();
      this.maxDot = -Infinity;
      // End initializer list

      // Default initializers
      // this.supportVecLocal = Bump.Vector3.create();
      // End default initializers

      this.supportVecLocal = this.worldTrans.basis.vectorMultiply( supportVecWorld );
    },

    members: {
      processTriangle: function( triangle, partId, triangleIndex ) {
        for ( var i = 0; i < 3; ++i ) {
          var dot = this.supportVecLocal.dot( triangle[i] );
          if ( dot > this.maxDot ) {
            this.maxDot = dot;
            this.supportVertexLocal.assign( triangle[i] );
          }
        }
      },

      GetSupportVertexWorldSpace: function() {
        return this.worldTrans.transform( this.supportVertexLocal );
      },

      GetSupportVertexLocal: function( dest ) {
        if ( !dest ) {
          return this.supportVertexLocal.clone();
        }

        return dest.assign( this.supportVertexLocal );
      }

    }
  });

  Bump.TriangleMeshShape.__evalInScope__ = function( string ) {
    return eval( string );
  };

})( this, this.Bump );
