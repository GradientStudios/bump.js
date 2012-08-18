// load: bump.js
// load: LinearMath/AlignedObjectArray.js
// load: LinearMath/Vector3.js
// load: LinearMath/Quaternion.js
// laod: LinearMath/Matrix3x3.js
// load: LinearMath/Transform.js
// load: BulletCollision/CollisionDispatch/ActivatingCollisionAlgorithm.js
// load: BulletCollision/CollisionDispatch/CollisionAlgorithmCreateFunc.js
// load: BulletCollision/NarrowPhaseCollision/DiscreteCollisionDetectorInterface.js
// load: BulletCollision/NarrowPhaseCollision/GjkPairDetector.js

// run: LinearMath/AlignedObjectArray.js
// run: BulletCollision/BroadphaseCollision/BroadphaseProxy.js

(function( window, Bump ) {
  var tmpV1 = Bump.Vector3.create();
  var tmpV2 = Bump.Vector3.create();
  var tmpV3 = Bump.Vector3.create();

  var tmpQ1 = Bump.Quaternion.create();
  var tmpQ2 = Bump.Quaternion.create();
  var tmpQ3 = Bump.Quaternion.create();

  var tmpM1 = Bump.Matrix3x3.create();

  var tmpT1 = Bump.Transform.create();

  var tmpVector3Array = Bump.Vector3Array.create();
  var tmpClosestPointInput = Bump.GjkPairDetector.ClosestPointInput.create();
  var tmpGjkPairDetector = Bump.GjkPairDetector.create();

  // Defined at bottom of file
  var DummyResult;
  var tmpDummyResult;
  var tmpConvexConvexAlgorithm;

  Bump.ConvexConvexAlgorithm = Bump.type({
    parent: Bump.ActivatingCollisionAlgorithm,

    init: function ConvexConvexAlgorithm( mf, ci, body0, body1, simplexSolver, pdSolver, numPerturbationIterations, minimumPointsPerturbationThreshold ) {
      this._super( ci, body0, body1 );

      // Initializer list
      this.simplexSolver = simplexSolver;
      this.pdSolver = pdSolver;
      this.ownManifold = false;
      this.manifoldPtr = mf;
      this.lowLevelOfDetail = false;
      this.numPerturbationIterations = numPerturbationIterations;
      this.minimumPointsPerturbationThreshold = minimumPointsPerturbationThreshold;
      // End initializer list
    },

    members: {
      destruct: function() {
        if ( this.ownManifold ) {
          if ( this.manifoldPtr !== null ) {
            this.dispatcher.releaseManifold( this.manifoldPtr );
          }
        }

        this._super();
      },

      set: function( mf, ci, body0, body1, simplexSolver, pdSolver, numPerturbationIterations, minimumPointsPerturbationThreshold ) {
        // CollisionAlgorithm's ctor
        this.dispatcher = ci.dispatcher1;

        // ConvexConvexAlgorithm's ctor
        this.simplexSolver = simplexSolver;
        this.pdSolver = pdSolver;
        this.ownManifold = false;
        this.manifoldPtr = mf;
        this.lowLevelOfDetail = false;
        this.numPerturbationIterations = numPerturbationIterations;
        this.minimumPointsPerturbationThreshold = minimumPointsPerturbationThreshold;

        return this;
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      // - `tmpV3`
      // - `tmpQ1`
      // - `tmpQ2`
      // - `tmpQ3`
      // - `tmpM1`
      // - `tmpT1`
      // - `tmpVector3Array`
      // - `tmpClosestPointInput`
      // - `tmpGjkPairDetector`
      // - `tmpDummyResult`
      processCollision: function( body0, body1, dispatchInfo, resultOut ) {
        var m_manifoldPtr = this.manifoldPtr;
        var m_ownManifold = this.ownManifold;

        if ( !m_manifoldPtr ) {
          // swapped?
          this.manifoldPtr = m_manifoldPtr = this.dispatcher.getNewManifold( body0, body1 );
          this.ownManifold = m_ownManifold = true;
        }
        resultOut.setPersistentManifold( m_manifoldPtr );

        var min0 = body0.getCollisionShape();
        var min1 = body1.getCollisionShape();

        // if ( (min0.getShapeType() === CAPSULE_SHAPE_PROXYTYPE) && (min1.getShapeType() === CAPSULE_SHAPE_PROXYTYPE) ) {
        //   var normalOnB = Bump.Vector3.create();
        //   var pointOnBWorld = Bump.Vector3.create();
        //
        //   var capsuleA = min0;
        //   var capsuleB = min1;
        //   btVector3 localScalingA = capsuleA->getLocalScaling();
        //   btVector3 localScalingB = capsuleB->getLocalScaling();
        //
        //   btScalar threshold = m_manifoldPtr->getContactBreakingThreshold();
        //
        //   btScalar dist = capsuleCapsuleDistance( normalOnB, pointOnBWorld,
        //                                           capsuleA.getHalfHeight(),  capsuleA.getRadius(),
        //                                           capsuleB.getHalfHeight(),  capsuleB.getRadius(),
        //                                           capsuleA.getUpAxis(),      capsuleB.getUpAxis(),
        //                                           body0.getWorldTransform(), body1.getWorldTransform(),
        //                                           threshold );
        //
        //   if ( dist < threshold ) {
        //     Bump.Assert( normalOnB.length2() >= SIMD_EPSILON * SIMD_EPSILON );
        //     resultOut.addContactPoint( normalOnB, pointOnBWorld, dist );
        //   }
        //   resultOut.refreshContactPoints();
        //   return;
        // }

        var input = tmpClosestPointInput.reset();

        var gjkPairDetector = tmpGjkPairDetector.set( min0, min1, this.simplexSolver, this.pdSolver );
        gjkPairDetector.setMinkowskiA( min0 );
        gjkPairDetector.setMinkowskiB( min1 );

        input.maximumDistanceSquared  = min0.getMargin() + min1.getMargin() + m_manifoldPtr.getContactBreakingThreshold();
        input.maximumDistanceSquared *= input.maximumDistanceSquared;

        input.stackAlloc = dispatchInfo.stackAllocator;
        input.transformA.assign( body0.getWorldTransform() );
        input.transformB.assign( body1.getWorldTransform() );

        var threshold, sepNormalWorldSpace, foundSepAxis, minDist, l2;
        if ( min0.isPolyhedral() && min1.isPolyhedral() ) {
          var dummy = tmpDummyResult;

          var polyhedronA = min0;
          var polyhedronB = min1;
          if ( polyhedronA.getConvexPolyhedron() && polyhedronB.getConvexPolyhedron() ) {
            threshold = m_manifoldPtr.getContactBreakingThreshold();

            minDist = -1e30;
            sepNormalWorldSpace = tmpV1;
            foundSepAxis = true;

            if ( dispatchInfo.enableSatConvex ) {
              foundSepAxis = Bump.PolyhedralContactClipping.findSeparatingAxis(
                polyhedronA.getConvexPolyhedron(), polyhedronB.getConvexPolyhedron(),
                body0.getWorldTransform(),
                body1.getWorldTransform(),
                sepNormalWorldSpace
              );
            } else {
              // gjkPairDetector.getClosestPoints(input,*resultOut,dispatchInfo.m_debugDraw);
              gjkPairDetector.getClosestPoints( input, dummy, dispatchInfo.debugDraw );

              l2 = gjkPairDetector.getCachedSeparatingAxis().length2();
              if ( l2 > Bump.SIMD_EPSILON ) {
                // sepNormalWorldSpace =
                gjkPairDetector.getCachedSeparatingAxis().multiplyScalar( 1 / l2, sepNormalWorldSpace );
                minDist = gjkPairDetector.getCachedSeparatingDistance() - min0.getMargin() - min1.getMargin();

                foundSepAxis = gjkPairDetector.getCachedSeparatingDistance() < ( min0.getMargin() + min1.getMargin() );
              }
            }

            if ( foundSepAxis ) {
              Bump.PolyhedralContactClipping.clipHullAgainstHull(
                sepNormalWorldSpace, polyhedronA.getConvexPolyhedron(), polyhedronB.getConvexPolyhedron(),
                body0.getWorldTransform(),
                body1.getWorldTransform(), minDist - threshold, threshold, resultOut
              );
            }

            if ( m_ownManifold ) {
              resultOut.refreshContactPoints();
            }
            return;

          } else {
            // we can also deal with convex versus triangle (without
            // connectivity data)
            if ( polyhedronA.getConvexPolyhedron() && polyhedronB.getShapeType() === Bump.BroadphaseNativeTypes.TRIANGLE_SHAPE_PROXYTYPE ) {
              var vertices = tmpVector3Array; vertices.resize( 0 );
              var tri = polyhedronB;
              // push copies the vector, so we can use a cached Vector3
              vertices.push( body1.getWorldTransform().transform( tri.vertices10, tmpV1 ) );
              vertices.push( body1.getWorldTransform().transform( tri.vertices11, tmpV1 ) );
              vertices.push( body1.getWorldTransform().transform( tri.vertices12, tmpV1 ) );

              threshold = m_manifoldPtr.getContactBreakingThreshold();

              sepNormalWorldSpace = tmpV1;
              minDist = -1e30;
              var maxDist = threshold;

              foundSepAxis = false;
              if ( false ) {
                polyhedronB.initializePolyhedralFeatures();
                foundSepAxis = Bump.PolyhedralContactClipping.findSeparatingAxis(
                    polyhedronA.getConvexPolyhedron(), polyhedronB.getConvexPolyhedron(),
                  body0.getWorldTransform(),
                  body1.getWorldTransform(),
                  sepNormalWorldSpace
                );
              } else {
                gjkPairDetector.getClosestPoints( input, dummy, dispatchInfo.debugDraw );

                l2 = gjkPairDetector.getCachedSeparatingAxis().length2();
                if ( l2 > Bump.SIMD_EPSILON ) {
                  //  sepNormalWorldSpace =
                  gjkPairDetector.getCachedSeparatingAxis().multiplyScalar( 1 / l2, sepNormalWorldSpace );
                  minDist = gjkPairDetector.getCachedSeparatingDistance() - min0.getMargin() - min1.getMargin();
                  foundSepAxis = true;
                }
              }

              if ( foundSepAxis ) {
                Bump.PolyhedralContactClipping.clipFaceAgainstHull(
                  sepNormalWorldSpace, polyhedronA.getConvexPolyhedron(),
                  body0.getWorldTransform(), vertices, minDist - threshold, maxDist, resultOut
                );
              }

              if ( m_ownManifold ) {
                resultOut.refreshContactPoints();
              }

              return;
            }

          }

        }

        gjkPairDetector.getClosestPoints( input, resultOut, dispatchInfo.debugDraw );

        // now perform `this.numPerturbationIterations` collision queries with
        // the perturbated collision objects

        // perform perturbation when more then
        // `this.minimumPointsPerturbationThreshold` points
        if ( this.numPerturbationIterations && resultOut.getPersistentManifold().getNumContacts() < this.minimumPointsPerturbationThreshold ) {
          var i;
          var v0 = tmpV1;
          var v1 = tmpV2;
          sepNormalWorldSpace = tmpV3;
          l2 = gjkPairDetector.getCachedSeparatingAxis().length2();

          if ( l2 > Bump.SIMD_EPSILON ) {
            // sepNormalWorldSpace =
            gjkPairDetector.getCachedSeparatingAxis().multiplyScalar( 1 / l2, sepNormalWorldSpace );

            // Normally Bump.PlaneSpace1
            Bump.PlaneSpace1Vector3( sepNormalWorldSpace, v0, v1 );

            var perturbeA = true;
            var angleLimit = 0.125 * Math.PI;
            var perturbeAngle = 0;
            var radiusA = min0.getAngularMotionDisc();
            var radiusB = min1.getAngularMotionDisc();
            if ( radiusA < radiusB ) {
              perturbeAngle = Bump.gContactBreakingThreshold / radiusA;
              perturbeA = true;
            } else {
              perturbeAngle = Bump.gContactBreakingThreshold / radiusB;
              perturbeA = false;
            }

            if ( perturbeAngle > angleLimit ) {
              perturbeAngle = angleLimit;
            }

            var unPerturbedTransform = tmpT1;
            if ( perturbeA ) {
              unPerturbedTransform.assign( input.transformA );
            } else {
              unPerturbedTransform.assign( input.transformB );
            }

            for ( i = 0; i < this.numPerturbationIterations; ++i ) {
              if ( v0.length2() > Bump.SIMD_EPSILON ) {
                var perturbeRot = tmpQ1.setRotation( v0, perturbeAngle );
                var iterationAngle = i * ( Math.PI * 2 / this.numPerturbationIterations );
                var rotq = tmpQ2.setRotation( sepNormalWorldSpace, iterationAngle );

                if ( perturbeA ) {
                  // input.transformA.setBasis(
                  tmpM1.setRotation( rotq.inverse( tmpQ3 ).multiplyQuaternion( perturbeRot, tmpQ3 ).multiplyQuaternion( rotq, tmpQ3 ) )
                    .multiplyMatrix( body0.getWorldTransform().basis, input.transformA.basis );
                  input.transformB.assign( body1.getWorldTransform() );
                } else {
                  input.transformA.assign( body0.getWorldTransform() );
                  // input.transformB.setBasis(
                  tmpM1.setRotation( rotq.inverse( tmpQ3 ).multiplyQuaternion( perturbeRot, tmpQ3 ).multiplyQuaternion( rotq, tmpQ3 ) )
                    .multiplyMatrix( body1.getWorldTransform().basis, input.transformB.basis );
                }

                var perturbedResultOut = Bump.PerturbedContactResult.create( resultOut, input.transformA, input.transformB, unPerturbedTransform, perturbeA, dispatchInfo.debugDraw );
                gjkPairDetector.getClosestPoints( input, perturbedResultOut, dispatchInfo.debugDraw );
              }
            }

          }
        }

        if ( m_ownManifold ) {
          resultOut.refreshContactPoints();
        }
      },

      calculateTimeOfImpact: Bump.notImplemented,
      getAllContactManifolds: Bump.notImplemented,
      setLowLevelOfDetail: Bump.notImplemented,

      getManifold: function() {
        return this.manifoldPtr;
      }

    },

    typeMembers: {
      CreateFunc: Bump.type({
        parent: Bump.CollisionAlgorithmCreateFunc,

        init: function CreateFunc( simplexSolver, pdSolver ) {
          this.numPerturbationIterations = 0;
          this.minimumPointsPerturbationThreshold = 3;
          this.simplexSolver = simplexSolver;
          this.pdSolver = pdSolver;
        },

        members: {
          CreateCollisionAlgorithm: function( ci, body0, body1 ) {
            return tmpConvexConvexAlgorithm.set(
              ci.manifold,
              ci,
              body0, body1,
              this.simplexSolver, this.pdSolver,
              this.numPerturbationIterations,
              this.minimumPointsPerturbationThreshold
            );
          }
        }
      })

    }
  });

  tmpConvexConvexAlgorithm = Bump.ConvexConvexAlgorithm.create( null, { dispatcher1: null }, null, null, null, null, 0, 0 );

  DummyResult = Bump.ConvexConvexAlgorithm.__processCollision__DummyResult = Bump.type({
    parent: Bump.DiscreteCollisionDetectorInterface.Result,

    init: function DummyResult() {
      this._super();
    },

    members: {
      setShapeIdentifiersA: Bump.noop,
      setShapeIdentifiersB: Bump.noop,
      addContactPoint: Bump.noop
    }
  });

  tmpDummyResult = DummyResult.create();

})( this, this.Bump );
