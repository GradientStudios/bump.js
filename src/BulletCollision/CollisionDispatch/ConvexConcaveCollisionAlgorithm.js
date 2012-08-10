// load: bump.js
// load: BulletCollision/CollisionShapes/TriangleCallback.js
// load: BulletCollision/CollisionDispatch/ActivatingCollisionAlgorithm.js
// load: BulletCollision/CollisionDispatch/CollisionAlgorithmCreateFunc.js

// run: LinearMath/Vector3.js
// run: LinearMath/Transform.js
// run: BulletCollision/BroadphaseCollision/CollisionAlgorithm.js
// run: BulletCollision/CollisionShapes/TriangleShape.js

(function( window, Bump ) {

  Bump.ConvexTriangleCallback = Bump.type({
    parent: Bump.TriangleCallback,

    init: function ConvexTriangleCallback( dispatcher, body0, body1, isSwapped ) {
      // Initializer list
      this.dispatcher = dispatcher;
      this.dispatchInfoPtr = null;
      // End initializer list

      // Default initializers
      this.aabbMin = Bump.Vector3.create();
      this.aabbMax = Bump.Vector3.create();

      this.resultOut = null;
      this.collisionMarginTriangle = 0;
      this.triangleCount = 0;
      // End default initializers

      this.convexBody = isSwapped ? body1 : body0;
      this.triBody    = isSwapped ? body0 : body1;

      this.manifoldPtr = this.dispatcher.getNewManifold( this.convexBody, this.triBody );

      this.clearCache();
    },

    members: {
      destruct: function() {
        this.clearCache();
        this.dispatcher.releaseManifold( this.manifoldPtr );
      },

      setTimeStepAndCounters: function( collisionMarginTriangle, dispatchInfo, resultOut ) {
        this.dispatchInfoPtr = dispatchInfo;
        this.collisionMarginTriangle = collisionMarginTriangle;
        this.resultOut = resultOut;

        // recalc aabbs
        var convexInTriangleSpace = Bump.Transform.create();
        this.triBody.getWorldTransform().inverse().multiplyTransform( this.convexBody.getWorldTransform(), convexInTriangleSpace );
        var convexShape = this.convexBody.getCollisionShape();
        convexShape.getAabb( convexInTriangleSpace, this.aabbMin, this.aabbMax );
        var extraMargin = collisionMarginTriangle;
        var extra = Bump.Vector3.create( extraMargin, extraMargin, extraMargin );

        this.aabbMax.addSelf( extra );
        this.aabbMin.subtractSelf( extra );
      },

      processTriangle: function( triangle, partId, triangleIndex ) {
        var m_convexBody = this.convexBody;
        var m_triBody = this.triBody;
        var m_resultOut = this.resultOut;

        // aabb filter is already applied!
        var ci = Bump.CollisionAlgorithmConstructionInfo.create();
        ci.dispatcher1 = this.dispatcher;

        var ob = m_triBody;

        if ( m_convexBody.getCollisionShape().isConvex() ) {
          var tm = Bump.TriangleShape.create( triangle[0], triangle[1], triangle[2] );
          tm.setMargin( this.collisionMarginTriangle );

          var tmpShape = ob.getCollisionShape();
          ob.internalSetTemporaryCollisionShape( tm );

          var colAlgo = ci.dispatcher1.findAlgorithm( m_convexBody, m_triBody, this.manifoldPtr );

          if ( m_resultOut.getBody0Internal() === m_triBody ) {
            m_resultOut.setShapeIdentifiersA( partId, triangleIndex );
          } else {
            m_resultOut.setShapeIdentifiersB( partId, triangleIndex );
          }

          colAlgo.processCollision( m_convexBody, m_triBody, this.dispatchInfoPtr, m_resultOut );
          colAlgo.destruct();
          ci.dispatcher1.freeCollisionAlgorithm( colAlgo );
          ob.internalSetTemporaryCollisionShape( tmpShape );
        }

      },

      clearCache: function() {
        this.dispatcher.clearManifold( this.manifoldPtr );
      },

      getAabbMin: function() {
        return this.aabbMin;
      },

      getAabbMax: function() {
        return this.aabbMax;
      }

    }
  });

  Bump.ConvexConcaveCollisionAlgorithm = Bump.type({
    parent: Bump.ActivatingCollisionAlgorithm,

    init: function ConvexConcaveCollisionAlgorithm( ci, body0, body1, isSwapped ) {
      this._super( ci, body0, body1 );

      // Initializer list
      this.isSwapped = isSwapped;
      this.btConvexTriangleCallback = Bump.ConvexTriangleCallback.create( ci.dispatcher1, body0, body1, isSwapped );
      // End initializer list
    },

    members: {
      processCollision: function( body0, body1, dispatchInfo, resultOut ) {
        var m_btConvexTriangleCallback = this.btConvexTriangleCallback;

        var convexBody = this.isSwapped ? body1 : body0;
        var triBody    = this.isSwapped ? body0 : body1;

        if ( triBody.getCollisionShape().isConcave() ) {
          var triOb = triBody;
          var concaveShape = triOb.getCollisionShape();

          if ( convexBody.getCollisionShape().isConvex() ) {
            var collisionMarginTriangle = concaveShape.getMargin();

            resultOut.setPersistentManifold( m_btConvexTriangleCallback.manifoldPtr );
            m_btConvexTriangleCallback.setTimeStepAndCounters( collisionMarginTriangle, dispatchInfo, resultOut );

            // Disable persistency. Previously, some older algorithm calculated
            // all contacts in one go, so you can clear it here.
            // this.dispatcher.clearManifold( m_btConvexTriangleCallback.manifoldPtr );

            m_btConvexTriangleCallback.manifoldPtr.setBodies( convexBody, triBody );

            concaveShape.processAllTriangles( m_btConvexTriangleCallback, m_btConvexTriangleCallback.getAabbMin(), m_btConvexTriangleCallback.getAabbMax() );

            resultOut.refreshContactPoints();
          }
        }

      },

      getAllContactManifolds: function( manifoldArray ) {
        if ( this.btConvexTriangleCallback.manifoldPtr ) {
          manifoldArray.push( this.btConvexTriangleCallback.manifoldPtr );
        }
      }

    },

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
