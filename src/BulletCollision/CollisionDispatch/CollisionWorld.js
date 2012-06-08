(function( window, Bump ) {
  var tmpV1 = Bump.Vector3.create();

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

    init: function LocalInfoAdder2( i, user /* RayResultCallback */ ) {
      this.userCallback = user;
      this.i = i;
      this.closestHitFraction = this.userCallback.closestHitFraction;
    },

    members: {
      needsCollision: function( p /* Bump.BroadphaseProxy */ ) {
        return this.userCallback.needsCollision( p );
      },

      addSingleResult: function( r, /* Bump.CollisionWorld.LocalRayResult */
                                 b /* bool */ ) {
        var shapeInfo = Bump.CollisionWorld.LocalShapeInfo.create();
        shapeInfo.shapePart = -1;
        shapeInfo.triangleIndex = this.i;
        if( !r.localShapeInfo /* == NULL */) {
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
      collisionObject, /* btCollisionObject* */
      compoundShape, /* const btCompoundShape* */
      colObjWorldTransform, /* const btTransform& */
      rayFromTrans, /* const btTransform& */
      rayToTrans, /* const btTransform& */
      resultCallback /* RayResultCallback& */
    ) {
      this.collisionObject = collisionObject;
      this.compoundShape = compoundShape;
      this.colObjWorldTransform = colObjWorldTransform.clone();
      this.rayFromTrans = rayFromTrans.clone();
      this.rayToTrans = rayToTrans.clone();
      this.resultCallback = resultCallback;
    },

    members: {
      // ASD: this function actually doesn't overwrite anything in ICollide, so we will leave it named as
      // `Process` for now...
      Process: function( i ) {
        var childCollisionShape = this.compoundShape.getChildShape( i );
        var childTrans = this.compoundShape.getChildTransform( i );
        var childWorldTrans = this.colObjWorldTransform.multiplyTransform( childTrans );

        // replace collision shape so that callback can determine the triangle
        var saveCollisionShape = this.collisionObject.getCollisionShape();
        this.collisionObject.internalSetTemporaryCollisionShape( childCollisionShape );

        var my_cb = LocalInfoAdder2.create( i, this.resultCallback );

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
      },

      ProcessNode: function( leaf )
      {
        this.Process( leaf.dataAsInt );
      }
    }
  });


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

          if ( this.getDispatchInfo().useContinuous && colObj.getInternalType() === Bump.CollisionObject.CollisionObjectTypes.CO_RIGID_BODY && !colObj.isStaticOrKinematicObject() ) {
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
        var rayCB = Bump.CollisionWorld.SingleRayCallback.create( rayFromWorld, rayToWorld, this, resultCallback );

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

        var pointShape = Bump.SphereShape.create( 0.0 );
        pointShape.setMargin( 0 );

        var castShape = pointShape;

        var worldTocollisionObject, rayFromLocal, rayToLocal, rcb;

        if( collisionShape.isConvex() ) {
          // BT_PROFILE("rayTestConvex");
          var castResult = Bump.ConvexCast.CastResult.create();
          castResult.fraction = resultCallback.closestHitFraction;

          var convexShape = collisionShape;
          var simplexSolver = Bump.VoronoiSimplexSolver.create();

          // #define USE_SUBSIMPLEX_CONVEX_CAST 1
          // #ifdef USE_SUBSIMPLEX_CONVEX_CAST
          var convexCaster = Bump.SubsimplexConvexCast.create( castShape, convexShape, simplexSolver );
          // #else
          //            //btGjkConvexCast       convexCaster(castShape,convexShape,&simplexSolver);
          //            //btContinuousConvexCollision convexCaster(castShape,convexShape,&simplexSolver,0);
          // #endif //#USE_SUBSIMPLEX_CONVEX_CAST

          if( convexCaster.calcTimeOfImpact( rayFromTrans,
                                             rayToTrans,
                                             colObjWorldTransform,
                                             colObjWorldTransform,
                                             castResult )) {
            //add hit
            if( castResult.normal.length2() > 0.0001 ) {
              if( castResult.fraction < resultCallback.closestHitFraction ) {
                // #ifdef USE_SUBSIMPLEX_CONVEX_CAST
                //rotate normal into worldspace
                rayFromTrans.getBasis().multiplyVector( castResult.normal, castResult.normal );
                // #endif //USE_SUBSIMPLEX_CONVEX_CAST

                castResult.normal.normalize();
                var  localRayResult = Bump.CollisionWorld.LocalRayResult.create(
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
          if( collisionShape.isConcave() ) {
            // BT_PROFILE("rayTestConcave");
            if( collisionShape.getShapeType() === Bump.BroadphaseNativeTypes.TRIANGLE_MESH_SHAPE_PROXYTYPE ) {
              ///optimized version for btBvhTriangleMeshShape
              var triangleMesh = collisionShape;
              worldTocollisionObject = colObjWorldTransform.inverse();
              rayFromLocal = worldTocollisionObject.transform( rayFromTrans.getOrigin() );
              rayToLocal = worldTocollisionObject.transform( rayToTrans.getOrigin() );

              //ConvexCast::CastResult
              // ASD: in-function declaration of BridgeTriangleRaycastCallback went here

              rcb = BridgeTriangleRaycastCallback.create(
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
              //generic (slower) case
              var concaveShape = collisionShape;

              worldTocollisionObject = colObjWorldTransform.inverse();

              rayFromLocal = worldTocollisionObject.multiplyVector( rayFromTrans.getOrigin() );
              rayToLocal = worldTocollisionObject.multiplyVector( rayToTrans.getOrigin() );

              //ConvexCast::CastResult
              // ASD: There was another in-function declaration of BridgeTriangleRaycastCallback here,
              // but since it was line-for-line identical to the first declaration, the two were
              // were consolidated into a single Bump.type() outside of CollisionWorld.

              rcb = BridgeTriangleRaycastCallback.create(
                rayFromLocal,
                rayToLocal,
                resultCallback,
                collisionObject,
                concaveShape,
                colObjWorldTransform
              );
              rcb.hitFraction = resultCallback.closestHitFraction;

              var rayAabbMinLocal = rayFromLocal.clone();
              rayAabbMinLocal.setMin( rayToLocal );
              var rayAabbMaxLocal = rayFromLocal.clone();
              rayAabbMaxLocal.setMax( rayToLocal );

              concaveShape.processAllTriangles( rcb, rayAabbMinLocal, rayAabbMaxLocal );
            }
          }
          else {
            // BT_PROFILE("rayTestCompound");
            if( collisionShape.isCompound() ) {
              // ASD: in-function declaration of struct LocalInfoAdder2 went here
              // ASD: in-function declaration of struct RayTester went here

              var compoundShape = collisionShape;
              var dbvt = compoundShape.getDynamicAabbTree();


              var rayCB = RayTester.create(
                collisionObject,
                compoundShape,
                colObjWorldTransform,
                rayFromTrans,
                rayToTrans,
                resultCallback
              );
              // #ifndef DISABLE_DBVT_COMPOUNDSHAPE_RAYCAST_ACCELERATION
              if( dbvt ) {
                var localRayFrom = colObjWorldTransform.inverseTimes( rayFromTrans ).getOrigin().clone();
                var localRayTo = colObjWorldTransform.inverseTimes( rayToTrans ).getOrigin().clone();
                Bump.Dbvt.rayTest( dbvt.root, localRayFrom, localRayTo, rayCB );
              }
              else
                // #endif //DISABLE_DBVT_COMPOUNDSHAPE_RAYCAST_ACCELERATION
              {
                for( var i = 0, n = compoundShape.getNumChildShapes(); i < n; ++i ) {
                  rayCB.Process( i );
                }
              }
            }
          }
        }
      }
    }
  });

  Bump.CollisionWorld.SingleRayCallback = Bump.type({
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

      var rayDir = rayToWorld.subtract( rayFromWorld ).normalize();

      // what about division by zero? --> just set rayDirection[i] to INF/BT_LARGE_FLOAT
      this.rayDirectionInverse = Bump.Vector3.create();
      this.signs = Bump.Vector3.create();
      this.rayDirectionInverse[ 0 ] = rayDir[ 0 ] === 0 ? Infinity : 1 / rayDir[ 0 ];
      this.rayDirectionInverse[ 1 ] = rayDir[ 1 ] === 0 ? Infinity : 1 / rayDir[ 1 ];
      this.rayDirectionInverse[ 2 ] = rayDir[ 2 ] === 0 ? Infinity : 1 / rayDir[ 2 ];
      this.signs[ 0 ] = this.rayDirectionInverse[ 0 ] < 0 ? 1 : 0;
      this.signs[ 1 ] = this.rayDirectionInverse[ 1 ] < 0 ? 1 : 0;
      this.signs[ 2 ] = this.rayDirectionInverse[ 2 ] < 0 ? 1 : 0;

      this.lambda_max = rayDir.dot( this.rayToWorld.subtract( this.rayFromWorld ));
    },

    members: {
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
          // if (btRayAabb(this.rayFromWorld,this.rayToWorld,collisionObjectAabbMin,collisionObjectAabbMax,hitLambda,this.hitNormal))
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
