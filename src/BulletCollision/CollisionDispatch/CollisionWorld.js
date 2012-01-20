(function( window, Bump ) {
  var tmpV1 = Bump.Vector3.create(),
      tmpV2 = Bump.Vector3.create(),
      tmpV3 = Bump.Vector3.create(),
      tmpV4 = Bump.Vector3.create(),
      tmpV5 = Bump.Vector3.create(),
      tmpT1 = Bump.Transform.create(),
      tmpT2 = Bump.Transform.create(),
      tmpT3 = Bump.Transform.create();

  Bump.CollisionWorld = Bump.type({
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

    member: {

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
      //
      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      // - `tmpV3`
      // - `tmpV4`
      // - `tmpV5`
      updateSingleAabb: (function() {
        var reportMe;

        return function( colObj ) {
          var minAabb = tmpV1, maxAabb = tmpV2;
          colObj.getCollisionShape().getAabb( colObj.getWorldTransform(), minAabb, maxAabb );
          // Need to increase the aabb for contact thresholds.
          var contactThreshold = tmpV3.setValue( Bump.gContactBreakingThreshold, Bump.gContactBreakingThreshold, Bump.gContactBreakingThreshold );
          minAabb.subtractSelf( contactThreshold );
          maxAabb.addSelf( contactThreshold );

          if ( this.getDispatchInfo().useContinuous && colObj.getInternalType() === Bump.CollisionObject.CollisionObjectTypes.CO_RIGID_BODY ) {
            var minAabb2 = tmpV4, maxAabb2 = tmpV5;
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
              ( maxAabb.subtract( minAabb, tmpV4 ).length2() < 1e12 )
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

      debugDrawWorld: Bump.noop,

      debugDrawObject: Bump.noop,

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
      //
      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      // - `tmpV3`
      // - `tmpV4`
      // - `tmpV5`
      // - `tmpT1`
      // - `tmpT2`
      // - `tmpT3`
      convexSweepTest: function( castShape, convexFromWorld, convexToWorld, resultCallback, allowedCcdPenetration ) {
        var convexFromTrans = tmpT1, convexToTrans = tmpT2;
        convexFromTrans.assign( convexFromWorld );
        convexToTrans.assign( convexToWorld );
        var castShapeAabbMin = tmpV1, castShapeAabbMax = tmpV2;

        // Compute AABB that encompasses angular movement.
        var linVel = tmpV3, angVel = tmpV4;
        Bump.TransformUtil.calculateVelocity( convexFromTrans, convexToTrans, 1, linVel, angVel );
        var zeroLinVel = tmpV5;
        zeroLinVel.setValue( 0, 0, 0 );
        var R = tmpT3;
        R.setIdentity();
        R.setRotation( convexFromTrans.getRotation() );
        castShape.calculateTemporalAabb( R, zeroLinVel, angVel, 1, castShapeAabbMin, castShapeAabbMax );

        var convexCB = Bump.SingleSweepCallback.create( castShape, convexFromWorld, convexToWorld, this, resultCallback, allowedCcdPenetration );
        this.broadphasePairCache.rayTest( convexFromTrans.origin, convexToTrans.origin, convexCB, castShapeAabbMin, castShapeAabbMax );
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      contactTest: function( colObj, resultCallback ) {
        var aabbMin = tmpV1, aabbMax = tmpV2;
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

      rayTestSingle: Bump.noop,

      objectQuerySingle: Bump.noop,

      addCollisionObject: function( collisionObject, collisionFilterGroup, collisionFilterMask ) {
        Bump.Assert( collisionObject !== null );

        // Check that the object isn't already added
        Bump.Assert( this.collisionObjects.indexOf( collisionObject ) === -1 );

        this.collisionObjects.push( collisionObject );

        // calculate new AABB
        var trans = collisionObject.getWorldTransform();

        var minAabb = tmpV1, maxAabb = tmpV2;
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
        var idx = this.collisionObjects.indexOf( collisionObject );
        this.collisionObjects[ idx ] = this.collisionObjects[ this.collisionObjects.length - 1 ];
        this.collisionObjects.pop();
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

})( this, this.Bump );
