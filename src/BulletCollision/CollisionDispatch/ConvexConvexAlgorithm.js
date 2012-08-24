// load: bump.js
// load: BulletCollision/CollisionDispatch/ActivatingCollisionAlgorithm.js
// load: BulletCollision/CollisionDispatch/CollisionAlgorithmCreateFunc.js
// load: BulletCollision/NarrowPhaseCollision/DiscreteCollisionDetectorInterface.js

// run: LinearMath/Vector3.js
// run: LinearMath/Quaternion.js
// run: LinearMath/Matrix3x3.js
// run: LinearMath/Transform.js
// run: LinearMath/AlignedObjectArray.js
// run: BulletCollision/NarrowPhaseCollision/GjkPairDetector.js
// run: BulletCollision/BroadphaseCollision/BroadphaseProxy.js

(function( window, Bump ) {

  // Defined at bottom of file
  var DummyResult;

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

      processCollision: function( body0, body1, dispatchInfo, resultOut ) {
        var m_manifoldPtr = this.manifoldPtr;
        var m_ownManifold = this.ownManifold;

        var tmpVec1 = Bump.Vector3.create();

        if ( !m_manifoldPtr ) {
          // swapped?
          this.manifoldPtr = m_manifoldPtr = this.dispatcher.getNewManifold( body0, body1 );
          this.ownManifold = m_ownManifold = true;
        }
        resultOut.setPersistentManifold( m_manifoldPtr );

        var min0 = body0.getCollisionShape();
        var min1 = body1.getCollisionShape();

        var normalOnB = Bump.Vector3.create();
        var pointOnBWorld = Bump.Vector3.create();

        if ( Bump.CapsuleShape ) {
          // See below
          Bump.notImplemented();
        }

        // if ( (min0.getShapeType() === CAPSULE_SHAPE_PROXYTYPE) && (min1.getShapeType() === CAPSULE_SHAPE_PROXYTYPE) ) {
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

        var input = Bump.GjkPairDetector.ClosestPointInput.create();

        var gjkPairDetector = Bump.GjkPairDetector.create( min0, min1, this.simplexSolver, this.pdSolver );
        gjkPairDetector.setMinkowskiA( min0 );
        gjkPairDetector.setMinkowskiB( min1 );

        input.maximumDistanceSquared  = min0.getMargin() + min1.getMargin() + m_manifoldPtr.getContactBreakingThreshold();
        input.maximumDistanceSquared *= input.maximumDistanceSquared;

        input.stackAlloc = dispatchInfo.stackAllocator;
        input.transformA.assign( body0.getWorldTransform() );
        input.transformB.assign( body1.getWorldTransform() );

        var threshold, sepNormalWorldSpace, foundSepAxis, minDist, l2;
        if ( min0.isPolyhedral() && min1.isPolyhedral() ) {
          var dummy = DummyResult.create();

          var polyhedronA = min0;
          var polyhedronB = min1;
          if ( polyhedronA.getConvexPolyhedron() && polyhedronB.getConvexPolyhedron() ) {
            threshold = m_manifoldPtr.getContactBreakingThreshold();

            minDist = -1e30;
            sepNormalWorldSpace = Bump.Vector3.create();
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
              var vertices = Bump.Vector3Array.create();
              var tri = polyhedronB;
              vertices.push( body1.getWorldTransform().transform( tri.vertices10, tmpVec1 ) );
              vertices.push( body1.getWorldTransform().transform( tri.vertices11, tmpVec1 ) );
              vertices.push( body1.getWorldTransform().transform( tri.vertices12, tmpVec1 ) );

              threshold = m_manifoldPtr.getContactBreakingThreshold();

              sepNormalWorldSpace = Bump.Vector3.create();
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
          var v0 = Bump.Vector3.create();
          var v1 = Bump.Vector3.create();
          sepNormalWorldSpace = Bump.Vector3.create();
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

            var unPerturbedTransform = Bump.Transform.create();
            if ( perturbeA ) {
              unPerturbedTransform.assign( input.transformA );
            } else {
              unPerturbedTransform.assign( input.transformB );
            }

            for ( i = 0; i < this.numPerturbationIterations; ++i ) {
              if ( v0.length2() > Bump.SIMD_EPSILON ) {
                var perturbeRot = Bump.Quaternion.createWithAxisAngle( v0, perturbeAngle );
                var iterationAngle = i * ( Math.PI * 2 / this.numPerturbationIterations );
                var rotq = Bump.Quaternion.createWithAxisAngle( sepNormalWorldSpace, iterationAngle );

                if ( perturbeA ) {
                  // input.transformA.setBasis(
                  Bump.Matrix3x3.createWithQuaternion( rotq.inverse().multiplyQuaternion( perturbeRot ).multiplyQuaternion( rotq ) )
                    .multiplyMatrix( body0.getWorldTransform().basis, input.transformA );
                  input.transformB.assign( body1.getWorldTransform() );
                } else {
                  input.transformA.assign( body0.getWorldTransform() );
                  // input.transformB.setBasis(
                  Bump.Matrix3x3.createWithQuaternion( rotq.inverse().multiplyQuaternion( perturbeRot ).multiplyQuaternion( rotq ) )
                    .multiplyMatrix( body1.getWorldTransform().basis, input.transformB );
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
      // getAllContactManifolds: Bump.notImplemented,
      setLowLevelOfDetail: Bump.notImplemented,

      getManifold: function() {
        return this.manifoldPtr;
      },

      getAllContactManifolds: function( manifoldArray ) {
        if ( this.manifoldPtr && this.ownManifold ) {
          manifoldArray.push( this.manifoldPtr );
        }
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
            return Bump.ConvexConvexAlgorithm.create(
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

})( this, this.Bump );
