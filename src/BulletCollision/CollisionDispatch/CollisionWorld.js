// load: bump.js
// load: LinearMath/Vector3.js
// load: BulletCollision/NarrowPhaseCollision/RaycastCallback.js
// load: BulletCollision/BroadphaseCollision/Dbvt.js
// load: BulletCollision/BroadphaseCollision/BroadphaseInterface.js
// load: BulletCollision/BroadphaseCollision/BroadphaseProxy.js
// load: BulletCollision/CollisionDispatch/CollisionObject.js
// load: BulletCollision/NarrowPhaseCollision/VoronoiSimplexSolver.js
// load: BulletCollision/NarrowPhaseCollision/SubSimplexConvexCast.js
// load: BulletCollision/CollisionShapes/SphereShape.js

// run: LinearMath/Transform.js
// run: LinearMath/TransformUtil.js
// run: BulletCollision/BroadphaseCollision/BroadphaseProxy.js
// run: BulletCollision/BroadphaseCollision/Dispatcher.js


(function( window, Bump ) {

  // memory pool management

  // dummyArgs is an array of arguments to be used when creating
  // a new object of Type, as some Types expect args within their
  // create functions
  var createGetter = function( Type, pool, dummyArgs ) {
    // if there are dummy args, use them
    if( dummyArgs ) {
      return function() {
        return pool.pop() || Type.create.apply( Type, dummyArgs );
      };
    } else {
      return function() {
        return pool.pop() || Type.create();
      };
    }
  };

  var createDeller = function( pool ) {
    return function() {
      for ( var i = 0; i < arguments.length; ++i ) {
        pool.push( arguments[i] );
      }
    };
  };

  var tmpV1 = Bump.Vector3.create();
  var tmpV2 = Bump.Vector3.create();

  // port of btCollisionWorld::RayResultCallback (stored on Bump.CollisionWorld after its
  // definition below
  var RayResultCallback = Bump.type({
    init: function RayResultCallback() {
      this.closestHitFraction = 1.0;
      this.collisionObject = null;
      this.collisionFilterGroup = Bump.BroadphaseProxy.CollisionFilterGroups.DefaultFilter;
      this.collisionFilterMask = Bump.BroadphaseProxy.CollisionFilterGroups.AllFilter;
      this.flags = 0;
    },

    members: {
      hasHit: function() {
        return this.collisionObject; // !== null;
      },

      needsCollision: function( proxy0 ) {
        var collides = ( proxy0.collisionFilterGroup & this.collisionFilterMask ) !== 0;
        collides = collides && ( this.collisionFilterGroup & proxy0.collisionFilterMask );
        return collides;
      },

      addSingleResult: Bump.abstract
    }
  });

  // Port of BridgeTriangleRaycastCallback, which is a struct used by CollisionWorld.rayTestSingle.
  // In the original bullet source, this struct is declared inside the rayTestSingle function.
  var BridgeTriangleRaycastCallback = Bump.type({
    parent: Bump.TriangleRaycastCallback,

    init: function BridgeTriangleRaycastCallback( from,
                                                  to,
                                                  resultCallback,
                                                  collisionObject,
                                                  triangleMesh,
                                                  colObjWorldTransform
                                                ) {
      //@BP Mod
      this._super( from, to, resultCallback.flags );
      this.resultCallback = resultCallback;
      this.collisionObject = collisionObject;
      this.triangleMesh = triangleMesh;
      this.colObjWorldTransform = colObjWorldTransform.clone();
    },

    members: {
      // ASD: added for easy recycling, since init() calls clone
      set: function BridgeTriangleRaycastCallback( from,
                                                    to,
                                                    resultCallback,
                                                    collisionObject,
                                                    triangleMesh,
                                                    colObjWorldTransform
                                                  ) {
        //@BP Mod
        Bump.TriangleRaycastCallback.set.call(
          this, from, to, resultCallback.flags
        );
        this.resultCallback = resultCallback;
        this.collisionObject = collisionObject;
        this.triangleMesh = triangleMesh;
        this.colObjWorldTransform.assign( colObjWorldTransform );
        return this;
      },

      reportHit: function( hitNormalLocal, hitFraction, partId, triangleIndex ) {
        var shapeInfo = Bump.CollisionWorld.LocalShapeInfo.create();
        shapeInfo.shapePart = partId;
        shapeInfo.triangleIndex = triangleIndex;

        var hitNormalWorld = this.colObjWorldTransform.getBasis().multiplyVector( hitNormalLocal );

        var rayResult = Bump.CollisionWorld.LocalRayResult.create(
          this.collisionObject,
          shapeInfo,
          hitNormalWorld,
          hitFraction
        );

        var normalInWorldSpace = true;
        return this.resultCallback.addSingleResult( rayResult, normalInWorldSpace );
      }
    }
  });

  var LocalInfoAdder2 = Bump.type({
    parent: RayResultCallback,

    init: function LocalInfoAdder2(
      i,
      user                      // RayResultCallback
    ) {
      this.userCallback = user;
      this.i = i;
      this.closestHitFraction = this.userCallback.closestHitFraction;
    },

    members: {
      set: function(
        i,
        user
      ) {
        this.userCallback = user;
        this.i = i;
        this.closestHitFraction = this.userCallback.closestHitFraction;
        return this;
      },

      needsCollision: function(
        p                       // Bump.BroadphaseProxy
      ) {
        return this.userCallback.needsCollision( p );
      },

      addSingleResult: function(
        r,                      // Bump.CollisionWorld.LocalRayResult
        b                       // bool
      ) {
        var shapeInfo = Bump.CollisionWorld.LocalShapeInfo.create();
        shapeInfo.shapePart = -1;
        shapeInfo.triangleIndex = this.i;
        if ( !r.localShapeInfo ) {
          r.localShapeInfo = shapeInfo;
        }

        var result = this.userCallback.addSingleResult( r, b );
        this.closestHitFraction = this.userCallback.closestHitFraction;
        return result;
      }
    }
  });

  var RayTester = Bump.type({
    parent: Bump.Dbvt.ICollide,

    init: function RayTester(
      collisionObject,          // btCollisionObject*
      compoundShape,            // const btCompoundShape*
      colObjWorldTransform,     // const btTransform&
      rayFromTrans,             // const btTransform&
      rayToTrans,               // const btTransform&
      resultCallback            // RayResultCallback&
    ) {
      this.collisionObject = collisionObject;
      this.compoundShape = compoundShape;
      this.colObjWorldTransform = colObjWorldTransform.clone();
      this.rayFromTrans = rayFromTrans.clone();
      this.rayToTrans = rayToTrans.clone();
      this.resultCallback = resultCallback;
    },

    members: {

      // ASD: added for easy recycling of RayTester objects, since init calls
      // clone()
      set: function(
        collisionObject,          // btCollisionObject*
        compoundShape,            // const btCompoundShape*
        colObjWorldTransform,     // const btTransform&
        rayFromTrans,             // const btTransform&
        rayToTrans,               // const btTransform&
        resultCallback            // RayResultCallback&
      ) {
        this.collisionObject = collisionObject;
        this.compoundShape = compoundShape;
        this.colObjWorldTransform.assign( colObjWorldTransform );
        this.rayFromTrans.assign( rayFromTrans );
        this.rayToTrans.assign( rayToTrans );
        this.resultCallback = resultCallback;

        return this;
      },

      // ASD: this function actually doesn't overwrite anything in ICollide, so we will leave it named as
      // `Process` for now...
      Process: function( i ) {
        var childCollisionShape = this.compoundShape.getChildShape( i );
        var childTrans = this.compoundShape.getChildTransform( i );
        var childWorldTrans = this.colObjWorldTransform.multiplyTransform( childTrans, getTransform() );

        // replace collision shape so that callback can determine the triangle
        var saveCollisionShape = this.collisionObject.getCollisionShape();
        this.collisionObject.internalSetTemporaryCollisionShape( childCollisionShape );

        // var my_cb = LocalInfoAdder2.create( i, this.resultCallback );
        var my_cb = getLocalAddrInfo2().set( i, this.resultCallback );

        Bump.CollisionWorld.rayTestSingle(
          this.rayFromTrans,
          this.rayToTrans,
          this.collisionObject,
          childCollisionShape,
          childWorldTrans,
          my_cb
        );

        // restore
        this.collisionObject.internalSetTemporaryCollisionShape( saveCollisionShape );

        delTransform( childWorldTrans );
        delLocalAddrInfo2( my_cb );
      },

      ProcessNode: function( leaf ) {
        this.Process( leaf.dataAsInt );
      }
    }
  });

  // port of btCollisionWorld::SingleRayCallback, stored on
  // Bump.CollisionWorld after its definition below
  var SingleRayCallback = Bump.type({
    parent: Bump.BroadphaseRayCallback,

    init: function SingleRayCallback(
      rayFromWorld,            // const btVector3&
      rayToWorld,              // const btVector3&
      world,                   // const btCollisionWorld*
      resultCallback           // btCollisionWorld::RayResultCallback&
    ) {
      this.rayFromWorld = rayFromWorld.clone();
      this.rayToWorld = rayToWorld.clone();
      this.hitNormal = Bump.Vector3.create();

      this.world = world;
      this.resultCallback = resultCallback;

      this.rayFromTrans = Bump.Transform.getIdentity();
      this.rayFromTrans.setOrigin( this.rayFromWorld );
      this.rayToTrans = Bump.Transform.getIdentity();
      this.rayToTrans.setOrigin( this.rayToWorld );

      var rayDir = rayToWorld.subtract( rayFromWorld, tmpV1 ).normalize();

      // what about division by zero? --> just set rayDirection[i] to INF/BT_LARGE_FLOAT
      this.rayDirectionInverse = Bump.Vector3.create();
      this.rayDirectionInverse.x = rayDir.x === 0 ? Infinity : 1 / rayDir.x;
      this.rayDirectionInverse.y = rayDir.y === 0 ? Infinity : 1 / rayDir.y;
      this.rayDirectionInverse.z = rayDir.z === 0 ? Infinity : 1 / rayDir.z;
      this.signs = new Array( 3 );
      this.signs[ 0 ] = this.rayDirectionInverse.x < 0 ? 1 : 0;
      this.signs[ 1 ] = this.rayDirectionInverse.y < 0 ? 1 : 0;
      this.signs[ 2 ] = this.rayDirectionInverse.z < 0 ? 1 : 0;

      this.lambda_max = rayDir.dot( this.rayToWorld.subtract( this.rayFromWorld, tmpV2 ));
    },

    members: {

      // ASD: added for easy recycling without extra allocations
      set: function(
        rayFromWorld,            // const btVector3&
        rayToWorld,              // const btVector3&
        world,                   // const btCollisionWorld*
        resultCallback           // btCollisionWorld::RayResultCallback&
      ) {
        this.rayFromWorld.assign( rayFromWorld );
        this.rayToWorld.assign( rayToWorld );
        this.hitNormal.setZero();

        this.world = world;
        this.resultCallback = resultCallback;

        this.rayFromTrans.setIdentity();
        this.rayFromTrans.setOrigin( this.rayFromWorld );
        this.rayToTrans.setIdentity();
        this.rayToTrans.setOrigin( this.rayToWorld );

        var rayDir = rayToWorld.subtract( rayFromWorld, tmpV1 ).normalize();

        // what about division by zero? --> just set rayDirection[i] to INF/BT_LARGE_FLOAT
        this.rayDirectionInverse.x = rayDir.x === 0 ? Infinity : 1 / rayDir.x;
        this.rayDirectionInverse.y = rayDir.y === 0 ? Infinity : 1 / rayDir.y;
        this.rayDirectionInverse.z = rayDir.z === 0 ? Infinity : 1 / rayDir.z;
        this.signs[ 0 ] = this.rayDirectionInverse.x < 0 ? 1 : 0;
        this.signs[ 1 ] = this.rayDirectionInverse.y < 0 ? 1 : 0;
        this.signs[ 2 ] = this.rayDirectionInverse.z < 0 ? 1 : 0;

        this.lambda_max = rayDir.dot( this.rayToWorld.subtract( this.rayFromWorld, tmpV2 ));

        return this;
      },

      process: function( proxy ) {
        // terminate further ray tests, once the closestHitFraction reached zero
        if ( this.resultCallback.closestHitFraction === 0 ) {
          return false;
        }
        var collisionObject = proxy.clientObject;

        // only perform raycast if filterMask matches
        if ( this.resultCallback.needsCollision( collisionObject.getBroadphaseHandle() )) {
          // RigidcollisionObject* collisionObject = ctrl.GetRigidcollisionObject();
          // btVector3 collisionObjectAabbMin,collisionObjectAabbMax;
          // btScalar hitLambda = this.resultCallback.closestHitFraction;
          // culling already done by broadphase
          // if ( btRayAabb( this.rayFromWorld, this.rayToWorld, collisionObjectAabbMin, collisionObjectAabbMax, hitLambda, this.hitNormal ) )
          this.world.rayTestSingle(
            this.rayFromTrans,
            this.rayToTrans,
            collisionObject,
            collisionObject.getCollisionShape(),
            collisionObject.getWorldTransform(),
            this.resultCallback
          );
        }
        return true;
      }
    }
  });

  // port of btCollisionWorld::LocalRayResult, stored on
  // Bump.CollisionWorld after its definition below
  var LocalRayResult = Bump.type({
    init: function LocalRayResult (
      collisionObject,          // btCollisionObject*
      localShapeInfo,           // LocalShapeInfo*
      hitNormalLocal,           // const btVector3&
      hitFraction               // btScalar
    ) {
      this.collisionObject = collisionObject;
      this.localShapeInfo = localShapeInfo;
      this.hitNormalLocal = hitNormalLocal;
      this.hitFraction = hitFraction;
    }
  });


  // Collision World memory pools and temporaries

  // for rayTest
  var tmpSingleRayCallback = SingleRayCallback.create(
    Bump.Vector3.create(),
    Bump.Vector3.create(),
    undefined,
    undefined
  );

  // for rayTestSingle
  var vector3Pool = [];
  var transformPool = [];
  var sphereShapePool = [];
  var voronoiPool = [];
  var convexCastPool = [];
  var castResultPool = [];
  var localRayResultPool = [];
  var bridgeTriangleRCBPool = [];
  var rayTesterPool = [];
  var localAddrInfo2Pool = [];

  var getVector3 = createGetter( Bump.Vector3, vector3Pool );
  var getTransform = createGetter( Bump.Transform, transformPool );
  var getSphereShape = createGetter( Bump.SphereShape, sphereShapePool, [ 0.0 ] );
  var getVoronoiSimplexSolver = createGetter( Bump.VoronoiSimplexSolver, voronoiPool );
  var getSubsimplexConvexCast = createGetter( Bump.SubsimplexConvexCast, convexCastPool );
  var getCastResult = createGetter( Bump.ConvexCast.CastResult, castResultPool );
  var getLocalRayResult = createGetter( LocalRayResult, localRayResultPool );

  var getBridgeTriangleRaycastCallback = createGetter(
    BridgeTriangleRaycastCallback,
    bridgeTriangleRCBPool,
    [
      Bump.Vector3.create(),
      Bump.Vector3.create(),
      { flags: 0 }, // dummy value for `resultCallback` param
      undefined,
      undefined,
      Bump.Transform.getIdentity()
    ]
  );

  var getRayTester = createGetter( RayTester, rayTesterPool, [
    undefined,
    undefined,
    Bump.Transform.getIdentity(),
    Bump.Transform.getIdentity(),
    Bump.Transform.getIdentity(),
    undefined
  ]);

  var getLocalAddrInfo2 = createGetter( LocalInfoAdder2, localAddrInfo2Pool, [
    undefined,
    {
      closestHitFraction: 0
    }
  ] );

  var delVector3 = createDeller( vector3Pool );
  var delTransform = createDeller( transformPool );
  var delSphereShape = createDeller( sphereShapePool );
  var delVoronoiSimplexSolver = createDeller( voronoiPool );
  var delSubsimplexConvexCast = createDeller( convexCastPool );
  var delCastResult = createDeller( castResultPool );
  var delLocalRayResult = createDeller( localRayResultPool );
  var delBridgeTriangleRaycastCallback = createDeller( bridgeTriangleRCBPool );
  var delRayTester = createDeller( rayTesterPool );
  var delLocalAddrInfo2 = createDeller( localAddrInfo2Pool );

  // used to reinitialize a SphereShape in rayTestSingle
  var emptySphereShape = Bump.SphereShape.create( 0.0 );
  emptySphereShape.setMargin( 0 );

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

        var tmpVec1 = Bump.Vector3.create();
        var tmpVec2 = Bump.Vector3.create();
        var tmpVec3 = Bump.Vector3.create();
        var tmpVec4 = Bump.Vector3.create();
        var tmpVec5 = Bump.Vector3.create();

        return function( colObj ) {
          var minAabb = tmpVec1, maxAabb = tmpVec2;
          colObj.getCollisionShape().getAabb( colObj.getWorldTransform(), minAabb, maxAabb );
          // Need to increase the aabb for contact thresholds.
          var contactThreshold = tmpVec3.setValue( Bump.gContactBreakingThreshold, Bump.gContactBreakingThreshold, Bump.gContactBreakingThreshold );
          minAabb.subtractSelf( contactThreshold );
          maxAabb.addSelf( contactThreshold );

          if ( this.getDispatchInfo().useContinuous && colObj.getInternalType() === Bump.CollisionObject.CollisionObjectTypes.CO_RIGID_BODY && !colObj.isStaticOrKinematicObject() ) {
            var minAabb2 = tmpVec4, maxAabb2 = tmpVec5;
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
        var rayCB = tmpSingleRayCallback.set( rayFromWorld, rayToWorld, this, resultCallback );

        this.broadphasePairCache.rayTest( rayFromWorld, rayToWorld, rayCB, tmpV1, tmpV2 );
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

      // note: rayTestSingle is "static", but at times is called from an instance, so this is a hack
      // to facilitate that
      rayTestSingle: function() {
        Bump.CollisionWorld.rayTestSingle.apply( undefined, arguments );
      },

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
    },

    typeMembers: {
      rayTestSingle: function( rayFromTrans,
                               rayToTrans,
                               collisionObject,
                               collisionShape,
                               colObjWorldTransform,
                               resultCallback ) {
        // allocate temporaries
        // TODO: not all of these are needed for every rayTestSingle call,
        // so allocations could be moved to where they are needed
        var tmpVec1 = getVector3();
        var tmpVec2 = getVector3();
        var tmpTrans = getTransform();
        var tmpSS = getSphereShape();
        var tmpCR = getCastResult();
        var tmpVSS = getVoronoiSimplexSolver();
        var tmpSSCC = getSubsimplexConvexCast();
        var tmpLRR = getLocalRayResult();
        var tmpBTRC = getBridgeTriangleRaycastCallback();
        var tmpRT = getRayTester();

        // re-init the recycled SphereShape using `set`
        var castShape = tmpSS.set( emptySphereShape );

        var worldTocollisionObject, rayFromLocal, rayToLocal, rcb;

        if ( collisionShape.isConvex() ) {
          var castResult = tmpCR;
          castResult.fraction = resultCallback.closestHitFraction;

          var convexShape = collisionShape;
          var simplexSolver = tmpVSS;
          simplexSolver.reset();

          // #define USE_SUBSIMPLEX_CONVEX_CAST 1
          // #ifdef USE_SUBSIMPLEX_CONVEX_CAST
          var convexCaster = tmpSSCC;
          convexCaster.init( castShape, convexShape, simplexSolver );
          // #else
          //            //btGjkConvexCast       convexCaster(castShape,convexShape,&simplexSolver);
          //            //btContinuousConvexCollision convexCaster(castShape,convexShape,&simplexSolver,0);
          // #endif //#USE_SUBSIMPLEX_CONVEX_CAST

          if (
            convexCaster.calcTimeOfImpact(
              rayFromTrans, rayToTrans,
              colObjWorldTransform, colObjWorldTransform,
              castResult
            )
          ) {
            // add hit
            if ( castResult.normal.length2() > 0.0001 ) {
              if ( castResult.fraction < resultCallback.closestHitFraction ) {
                // #ifdef USE_SUBSIMPLEX_CONVEX_CAST
                // rotate normal into worldspace
                rayFromTrans.getBasis().multiplyVector( castResult.normal, castResult.normal );
                // #endif //USE_SUBSIMPLEX_CONVEX_CAST

                castResult.normal.normalize();
                var localRayResult = tmpLRR;
                localRayResult.init(
                  collisionObject,
                  0,
                  castResult.normal,
                  castResult.fraction
                );

                var normalInWorldSpace = true;
                resultCallback.addSingleResult( localRayResult, normalInWorldSpace );

              }
            }
          }
        }

        else {
          if ( collisionShape.isConcave() ) {
            if ( collisionShape.getShapeType() === Bump.BroadphaseNativeTypes.TRIANGLE_MESH_SHAPE_PROXYTYPE ) {
              // optimized version for btBvhTriangleMeshShape
              var triangleMesh = collisionShape;
              worldTocollisionObject = colObjWorldTransform.inverse();
              rayFromLocal = worldTocollisionObject.transform( rayFromTrans.getOrigin() );
              rayToLocal = worldTocollisionObject.transform( rayToTrans.getOrigin() );

              // ConvexCast::CastResult
              // ASD: in-function declaration of BridgeTriangleRaycastCallback went here

              rcb = tmpBTRC.set(
                rayFromLocal,
                rayToLocal,
                resultCallback,
                collisionObject,
                triangleMesh,
                colObjWorldTransform
              );

              rcb.hitFraction = resultCallback.closestHitFraction;
              triangleMesh.performRaycast( rcb, rayFromLocal, rayToLocal );
            }

            else {
              // generic (slower) case
              var concaveShape = collisionShape;

              worldTocollisionObject = colObjWorldTransform.inverse();

              rayFromLocal = worldTocollisionObject.multiplyVector( rayFromTrans.getOrigin() );
              rayToLocal = worldTocollisionObject.multiplyVector( rayToTrans.getOrigin() );

              // ConvexCast::CastResult
              // ASD: There was another in-function declaration of BridgeTriangleRaycastCallback here,
              // but since it was line-for-line identical to the first declaration, the two were
              // were consolidated into a single Bump.type() outside of CollisionWorld.

              rcb = tmpBTRC.set(
                rayFromLocal,
                rayToLocal,
                resultCallback,
                collisionObject,
                concaveShape,
                colObjWorldTransform
              );
              rcb.hitFraction = resultCallback.closestHitFraction;

              var rayAabbMinLocal = rayFromLocal.clone( tmpVec1 );
              rayAabbMinLocal.setMin( rayToLocal );
              var rayAabbMaxLocal = rayFromLocal.clone( tmpVec2 );
              rayAabbMaxLocal.setMax( rayToLocal );

              concaveShape.processAllTriangles( rcb, rayAabbMinLocal, rayAabbMaxLocal );
            }
          }

          else {
            if ( collisionShape.isCompound() ) {
              // ASD: in-function declaration of struct LocalInfoAdder2 went here
              // ASD: in-function declaration of struct RayTester went here

              var compoundShape = collisionShape;
              var dbvt = compoundShape.getDynamicAabbTree();

              var rayCB = tmpRT.set(
                collisionObject,
                compoundShape,
                colObjWorldTransform,
                rayFromTrans,
                rayToTrans,
                resultCallback
              );

              if ( dbvt ) {
                var localRayFrom = colObjWorldTransform
                  .inverseTimes( rayFromTrans, tmpTrans )
                  .getOrigin().clone( tmpVec1 );
                var localRayTo = colObjWorldTransform
                  .inverseTimes( rayToTrans, tmpTrans )
                  .getOrigin().clone( tmpVec2 );
                Bump.Dbvt.rayTest( dbvt.root, localRayFrom, localRayTo, rayCB );
              } else {
                for ( var i = 0, n = compoundShape.getNumChildShapes(); i < n; ++i ) {
                  rayCB.Process( i );
                }
              }
            }
          }

        }

        // free temporaries
        delVector3( tmpVec1 );
        delVector3( tmpVec2 );
        delTransform( tmpTrans );
        delSphereShape( tmpSS );
        delCastResult( tmpCR );
        delVoronoiSimplexSolver( tmpVSS );
        delSubsimplexConvexCast( tmpSSCC );
        delLocalRayResult( tmpLRR );
        delBridgeTriangleRaycastCallback( tmpBTRC );
        delRayTester( tmpRT );
      }
    }
  });

  // defined above for dependency reasons
  Bump.CollisionWorld.SingleRayCallback = SingleRayCallback;

  // port of btCollisionWorld::LocalShapeInfo
  Bump.CollisionWorld.LocalShapeInfo = Bump.type({
    init: function LocalShapeInfo () {
      this.shapePart = 0;
      this.triangleIndex = 0;
    }
  });

  // defined above for dependency reasons
  Bump.CollisionWorld.LocalRayResult = LocalRayResult;
  Bump.CollisionWorld.RayResultCallback = RayResultCallback;

  // port of btCollisionWorld::ClosestRayResultCallback
  Bump.CollisionWorld.ClosestRayResultCallback = Bump.type({
    parent: Bump.CollisionWorld.RayResultCallback,

    init: function ClosestRayResultCallback(
      rayFromWorld,             // const btVector3&
      rayToWorld                // const btVector3&
    ) {
      this._super();
      this.rayFromWorld = rayFromWorld.clone();
      this.rayToWorld = rayToWorld.clone();

      this.hitNormalWorld = Bump.Vector3.create();
      this.hitPointWorld = Bump.Vector3.create();
    },

    members: {
      addSingleResult: function (
        rayResult,              // LocalRayResult&
        normalInWorldSpace      // bool
      ) {
        // caller already does the filter on the m_closestHitFraction
        Bump.Assert( rayResult.hitFraction <= this.closestHitFraction );

        this.closestHitFraction = rayResult.hitFraction;
        this.collisionObject = rayResult.collisionObject;
        if ( normalInWorldSpace ) {
          this.hitNormalWorld = rayResult.hitNormalLocal.clone( this.hitNormalWorld );
        } else {
          // need to transform normal into worldspace
          this.hitNormalWorld = this.collisionObject.getWorldTransform().basis
            .multiplyVector( rayResult.hitNormalLocal, this.hitNormalWorld );
        }
        this.hitPointWorld.setInterpolate3( this.rayFromWorld, this.rayToWorld, rayResult.hitFraction );
        return rayResult.hitFraction;
      }
    }
  });

})( this, this.Bump );
