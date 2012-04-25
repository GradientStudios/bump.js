(function( window, Bump ) {
  var tmpV1 = Bump.Vector3.create();

  Bump.CollisionWorld = Bump.type({

    // Bullet doesn't hide the default constructor, but it really should.
    init: function CollisionWorld( dispatcher, pairCache, collisionConfiguration ) {
      this.collisionObjects = [];
      this.dispatcher1 = dispatcher;
      this.dispatchInfo = Bump.DispatcherInfo.create();
      this.broadphasePairCache = pairCache;
      this.debugDrawer = null;

      // `forceUpdateAllAabbs` can be set to false as an optimization to only
      // update active object AABBs. It is `true` by default, because it is
      // error-prone (setting the position of static objects wouldn't update
      // their AABB).
      this.forceUpdateAllAabbs = true;

      this.stackAlloc = collisionConfiguration.getStackAllocator();
      this.dispatchInfo.stackAllocator = this.stackAlloc;

      return this;
    },

    members: {

      destruct: function() {
        var i, collisionObject, bp;

        for ( i = 0; i < this.collisionObjects.length; ++i ) {
          collisionObject = this.collisionObjects[i];
          bp = collisionObject.getBroadphaseHandle();

          if ( bp !== null ) {
            // Only clear the cached algorithms.
            this.getBroadphase().getOverlappingPairCache().cleanProxyFromPairs( bp, this.dispatcher1 );
            this.getBroadphase().destroyProxy( bp, this.dispatcher1 );
            collisionObject.setBroadphaseHandle( null );
          }
        }
      },

      setBroadphase: function( pairCache ) {
        this.broadphasePairCache = pairCache;
      },

      getBroadphase: function() {
        return this.broadphasePairCache;
      },

      getPairCache: function() {
        return this.broadphasePairCache.getOverlappingPairCache();
      },

      getDispatcher: function() {
        return this.dispatcher1;
      },

      // Use the broadphase to accelerate the search for objects, based on their
      // aabb and for each object with ray-aabb overlap, perform an exact ray
      // test unfortunately the implementation for `rayTest` and
      // `convexSweepTest` duplicated, albeit practically identical.
      updateSingleAabb: (function() {
        var reportMe;

        return function( colObj ) {
          var minAabb = Bump.Vector3.create(), maxAabb = Bump.Vector3.create();
          colObj.getCollisionShape().getAabb( colObj.getWorldTransform(), minAabb, maxAabb );
          // Need to increase the aabb for contact thresholds.
          var contactThreshold = Bump.Vector3.create( Bump.gContactBreakingThreshold, Bump.gContactBreakingThreshold, Bump.gContactBreakingThreshold );
          minAabb.subtractSelf( contactThreshold );
          maxAabb.addSelf( contactThreshold );

          if ( this.getDispatchInfo().useContinuous && colObj.getInternalType() === Bump.CollisionObject.CollisionObjectTypes.CO_RIGID_BODY ) {
            var minAabb2 = Bump.Vector3.create(), maxAabb2 = Bump.Vector3.create();
            colObj.getCollisionShape().getAabb( colObj.getInterpolationWorldTransform(), minAabb2, maxAabb2 );
            minAabb2.subtractSelf( contactThreshold );
            maxAabb2.addSelf( contactThreshold );
            minAabb.setMin( minAabb2 );
            maxAabb.setMax( maxAabb2 );
          }

          var bp = this.broadphasePairCache;

          // Moving objects should be moderately sized, probably something wrong
          // if not.
          if (
            colObj.isStaticObject() ||
              ( maxAabb.subtract( minAabb, tmpV1 ).length2() < 1e12 )
          ) {
            bp.setAabb( colObj.getBroadphaseHandle(), minAabb, maxAabb, this.dispatcher1 );
          }

          // Something went wrong, investigate.
          else {
            // This assert is unwanted in 3D modelers (danger of loosing work).
            colObj.setActivationState( Bump.CollisionObject.DISABLE_SIMULATION );

            if ( reportMe === undefined ) { reportMe = true; }

            if ( reportMe && this.debugDrawer !== null ) {
              reportMe = false;
              this.debugDrawer.reportErrorWarning( "Overflow in AABB, object removed from simulation" );
              this.debugDrawer.reportErrorWarning( "If you can reproduce this, please email bugs@continuousphysics.com\n" );
              this.debugDrawer.reportErrorWarning( "Please include above information, your Platform, version of OS.\n" );
              this.debugDrawer.reportErrorWarning( "Thanks.\n" );
            }
          }
        };
      })(),

      updateAabbs: function() {
        for ( var i = 0; i < this.collisionObjects.length; ++i ) {
          var colObj = this.collisionObjects[i];

          // Only update aabb of active objects
          if ( this.forceUpdateAllAabbs || colObj.isActive() ) {
            this.updateSingleAabb( colObj );
          }
        }
      },

      setDebugDrawer: function( debugDrawer ) {
        this.debugDrawer = debugDrawer;
      },

      getDebugDrawer: function() {
        return this.debugDrawer;
      },

      debugDrawWorld: Bump.notImplemented,

      debugDrawObject: Bump.notImplemented,

      getNumCollisionObjects: function() {
        return this.collisionObjects.length;
      },

      // Use the broadphase to accelerate the search for objects, based on their
      // aabb and for each object with ray-aabb overlap, perform an exact ray
      // test.
      rayTest: function( rayFromWorld, rayToWorld, resultCallback ) {
        var rayCB = Bump.SingleRayCallback.create( rayFromWorld, rayToWorld, this, resultCallback );

        this.broadphasePairCache.rayTest( rayFromWorld, rayToWorld, rayCB );
      },

      // Use the broadphase to accelerate the search for objects, based on their
      // aabb and for each object with ray-aabb overlap, perform an exact ray
      // test unfortunately the implementation for `rayTest` and
      // `convexSweepTest` duplicated, albeit practically identical.
      convexSweepTest: function( castShape, convexFromWorld, convexToWorld, resultCallback, allowedCcdPenetration ) {
        var convexFromTrans = Bump.Transform.create();
        var convexToTrans = Bump.Transform.create();
        convexFromTrans.assign( convexFromWorld );
        convexToTrans.assign( convexToWorld );

        var castShapeAabbMin = Bump.Vector3.create();
        var castShapeAabbMax = Bump.Vector3.create();

        // Compute AABB that encompasses angular movement.
        var linVel = Bump.Vector3.create(), angVel = Bump.Vector3.create();
        Bump.TransformUtil.calculateVelocity( convexFromTrans, convexToTrans, 1, linVel, angVel );
        var zeroLinVel = Bump.Vector3.create();
        zeroLinVel.setValue( 0, 0, 0 );
        var R = Bump.Transform.create();
        R.setIdentity();
        R.setRotation( convexFromTrans.getRotation() );
        castShape.calculateTemporalAabb( R, zeroLinVel, angVel, 1, castShapeAabbMin, castShapeAabbMax );

        var convexCB = Bump.SingleSweepCallback.create( castShape, convexFromWorld, convexToWorld, this, resultCallback, allowedCcdPenetration );
        this.broadphasePairCache.rayTest( convexFromTrans.origin, convexToTrans.origin, convexCB, castShapeAabbMin, castShapeAabbMax );
      },

      contactTest: function( colObj, resultCallback ) {
        var aabbMin = Bump.Vector3.create(), aabbMax = Bump.Vector3.create();
        colObj.getCollisionShape().getAabb( colObj.getWorldTransform(), aabbMin, aabbMax );
        var contactCB = Bump.SingleContactCallback.create( colObj, this, resultCallback );

        this.broadphasePairCache.aabbTest( aabbMin, aabbMax, contactCB );
      },

      contactPairTest: function( colObjA, colObjB, resultCallback ) {
        var algorithm = this.getDispatcher().findAlgorithm( colObjA, colObjB );
        if ( algorithm !== null ) {
          var contactPointResult = Bump.BridgedManifoldResult.create( colObjA, colObjB, resultCallback );
          // Discrete collision detection query
          algorithm.processCollision( colObjA, colObjB, this.getDispatchInfo() , contactPointResult );

          algorithm.destruct();
          this.getDispatcher().freeCollisionAlgorithm( algorithm );
        }
      },

      rayTestSingle: Bump.notImplemented,

      objectQuerySingle: Bump.notImplemented,

      addCollisionObject: function( collisionObject, collisionFilterGroup, collisionFilterMask ) {
        Bump.Assert( collisionObject !== null );

        // Check that the object isn't already added
        Bump.Assert( this.collisionObjects.indexOf( collisionObject ) === -1 );

        this.collisionObjects.push( collisionObject );

        // calculate new AABB
        var trans = collisionObject.getWorldTransform();

        var minAabb = Bump.Vector3.create(), maxAabb = Bump.Vector3.create();
        collisionObject.getCollisionShape().getAabb( trans, minAabb, maxAabb );

        var type = collisionObject.getCollisionShape().getShapeType();
        collisionObject.setBroadphaseHandle(
          this.getBroadphase().createProxy(
            minAabb,
            maxAabb,
            type,
            collisionObject,
            collisionFilterGroup,
            collisionFilterMask,
            this.dispatcher1,
            0
          )
        );
      },

      getCollisionObjectArray: function() {
        return this.collisionObjects;
      },

      removeCollisionObject: function( collisionObject ) {
        var bp = collisionObject.getBroadphaseHandle();
        if ( bp !== null ) {
          // Only clear the cached algorithms
          this.getBroadphase().getOverlappingPairCache().cleanProxyFromPairs( bp, this.dispatcher1 );
          this.getBroadphase().destroyProxy( bp, this.dispatcher1 );
          collisionObject.setBroadphaseHandle( null );
        }

        // Swapremove
        Bump.remove( this.collisionObjects, collisionObject );
      },

      performDiscreteCollisionDetection: function() {
        var dispatchInfo = this.getDispatchInfo();

        this.updateAabbs();

        this.broadphasePairCache.calculateOverlappingPairs( this.dispatcher1 );

        var dispatcher = this.getDispatcher();
        if ( dispatcher !== null ) {
          dispatcher.dispatchAllCollisionPairs( this.broadphasePairCache.getOverlappingPairCache(), dispatchInfo, this.dispatcher1 );
        }
      },

      getDispatchInfo: function() {
        return this.dispatchInfo;
      },

      getForceUpdateAllAabbs: function() {
        return this.forceUpdateAllAabbs;
      },

      setForceUpdateAllAabbs: function( forceUpdateAllAabbs ) {
        this.forceUpdateAllAabbs = forceUpdateAllAabbs;
      }
    }
  });

  // port of btCollisionWorld::LocalShapeInfo
  Bump.CollisionWorld.LocalShapeInfo = Bump.type({
    init: function LocalShapeInfo () {
      this.shapePart = 0;
      this.triangleIndex = 0;
    }
  });

  // port of btCollisionWorld::LocalRayResult
  Bump.CollisionWorld.LocalRayResult = Bump.type({
    init: function LocalRayResult (
      collisionObject, /* btCollisionObject* */
      localShapeInfo, /* LocalShapeInfo* */
      hitNormalLocal, /* const btVector3& */
      hitFraction /* btScalar */
    ) {
      this.collisionObject = collisionObject;
      this.localShapeInfo = localShapeInfo;
      this.hitNormalLocal = hitNormalLocal;
      this.hitFraction = hitFraction;
    }
  });

  // port of btCollisionWorld::RayResultCallback
  Bump.CollisionWorld.RayResultCallback = Bump.type({
    init: function RayResultCallback() {
      this.closestHitFraction = 1.0;
      this.collisionObject = null;
      this.collisionFilterGroup = Bump.BroadphaseProxy.CollisionFilterGroups.DefaultFilter;
      this.collisionFilterMask = Bump.BroadphaseProxy.CollisionFilterGroups.AllFilter;
      this.flags = 0;
    },

    members: {
      needsCollision: function( proxy0 /* btBroadphaseProxy* */) {
        var collides = ( proxy0.collisionFilterGroup & this.collisionFilterMask ) !== 0;
        collides = collides && ( this.collisionFilterGroup & proxy0.collisionFilterMask );
        return collides;
      },

      addSingleResult: function( rayResult, /* LocalRayResult& */
                                 normalInWorldSpace /* bool */ ) {
        // pure virtual in original codebase
      }
    }
  });

  // port of btCollisionWorld::ClosestRayResultCallback
  Bump.CollisionWorld.ClosestRayResultCallback = Bump.type({
    parent: Bump.CollisionWorld.RayResultCallback,

    init: function ClosestRayResultCallback( rayFromWorld, /* const btVector3 & */
                                             rayToWorld /* const btVector3 & */ ) {
      this._super();
      this.rayFromWorld = rayFromWorld.clone();
      this.rayToWorld = rayToWorld.clone();

      this.hitNormalWorld = Bump.Vector3.create();
      this.hitPointWorld = Bump.Vector3.create();
    },

    members: {
      addSingleResult: function (
        rayResult, /* LocalRayResult& */
        normalInWorldSpace /* bool */
      ) {
        //caller already does the filter on the m_closestHitFraction
        Bump.Assert( rayResult.hitFraction <= this.closestHitFraction);

        this.closestHitFraction = rayResult.hitFraction;
        this.collisionObject = rayResult.collisionObject;
        if (normalInWorldSpace) {
          this.hitNormalWorld = rayResult.hitNormalLocal.clone( this.hitNormalWorld );
        }
        else {
          ///need to transform normal into worldspace
          this.hitNormalWorld = this.collisionObject.getWorldTransform().getBasis().
            multiplyVector( rayResult.hitNormalLocal, this.hitNormalWorld );
        }
        this.hitPointWorld.setInterpolate3( this.rayFromWorld, this.rayToWorld, rayResult.hitFraction);
        return rayResult.hitFraction;
      }
    }
  });

})( this, this.Bump );
