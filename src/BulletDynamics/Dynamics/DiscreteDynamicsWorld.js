// load: bump.js
// load: LinearMath/Vector3.js
// load: BulletCollision/CollisionDispatch/SimulationIslandManager.js
// load: BulletDynamics/ConstraintSolver/TypedConstraint.js
// load: BulletDynamics/Dynamics/DynamicsWorld.js

// run: LinearMath/AlignedObjectArray.js
// run: LinearMath/Transform.js
// run: LinearMath/TransformUtil.js
// run: BulletDynamics/ConstraintSolver/SequentialImpulseConstraintSolver.js
// run: BulletDynamics/Dynamics/RigidBody.js
// run: BulletCollision/BroadphaseCollision/BroadphaseProxy.js
// run: BulletCollision/CollisionShapes/SphereShape.js

(function( window, Bump ) {
  var zeroVec = Bump.Vector3.create( 0, 0, 0 );

  // not sure that this needs to be globally accessible through Bump
  Bump.GetConstraintIslandId = function( lhs ) {
    var islandId = 0,
        rcolObj0 = lhs.getRigidBodyA(), // const btCollisionObject&
        rcolObj1 = lhs.getRigidBodyB(); // const btCollisionObject&
    islandId = rcolObj0.getIslandTag() >= 0 ? rcolObj0.getIslandTag() : rcolObj1.getIslandTag();
    return islandId;
  };

  // *** SortConstraintOnIslandPredicate *** is ported from the
  // `btSortConstraintOnIslandPredicate` functor class
  Bump.SortConstraintOnIslandPredicate = Bump.type({
    init: function SortConstraintOnIslandPredicate() {},
    typeMembers: {
      create: function() {
        // sort two `TypedConstraint`s
        return function SortConstraintOnIslandPredicate( lhs, rhs ) {
          var rIslandId0 = Bump.GetConstraintIslandId( rhs ),
              lIslandId0 = Bump.GetConstraintIslandId( lhs );
          return lIslandId0 < rIslandId0;
        };
      }
    }
  });

  Bump.InplaceSolverIslandCallback = Bump.type({
    parent: Bump.SimulationIslandManager.IslandCallback,

    init: function InplaceSolverIslandCallback( solver, stackAlloc, dispatcher ) {
      this._super();

      // Initializer list
      this.solverInfo = null;
      this.solver = solver;
      this.sortedConstraints = null;
      this.numConstraints = 0;
      this.debugDrawer = null;
      this.stackAlloc = stackAlloc;
      this.dispatcher = dispatcher;
      // End initializer list

      // Default initializers
      this.bodies = [];
      this.manifolds = [];
      this.constraints = [];
      // End default initializers

      return this;
    },

    members: {
      clone: function( dest ) {
        Bump.Assert( false );
        return dest;
      },

      assign: function( other ) {
        Bump.Assert( false );
        return this;
      },

      setup: function( solverInfo, sortedConstraints, numConstraints, debugDrawer ) {
        Bump.Assert( solverInfo );
        this.solverInfo = solverInfo;
        this.sortedConstraints = sortedConstraints;
        this.numConstraints = numConstraints;
        this.debugDrawer = debugDrawer;
        Bump.resize( this.bodies, 0 );
        Bump.resize( this.manifolds, 0 );
        Bump.resize( this.constraints, 0 );
      },

      processIsland: function( bodies, numBodies, manifolds, numManifolds, islandId ) {
        if ( islandId < 0 ) {
          if ( numManifolds + this.numConstraints ) {
            // We don't split islands, so all constraints/contact
            // manifolds/bodies are passed into the solver regardless the
            // island id
            this.solver.solveGroup(
              bodies, numBodies,
              manifolds, numManifolds,
              this.sortedConstraints[0], this.numConstraints,
              this.solverInfo,
              this.debugDrawer,
              this.stackAlloc,
              this.dispatcher
            );
          }
        } else {
          // Also add all non-contact constraints/joints for this island
          var startConstraint = null;
          var numCurConstraints = 0;
          var i;

          // Find the first constraint for this island
          for ( i = 0; i < this.numConstraints; ++i ) {
            if ( Bump.GetConstraintIslandId( this.sortedConstraints[i] ) === islandId ) {
              startConstraint = this.sortedConstraints.slice( i );
              break;
            }
          }

          // Count the number of constraints in this island
          for ( ; i < this.numConstraints; ++i ) {
            if ( Bump.GetConstraintIslandId( this.sortedConstraints[i] ) === islandId ) {
              ++numCurConstraints;
            }
          }

          if ( this.solverInfo.minimumSolverBatchSize <= 1 ) {
            // Only call `solveGroup` if there is some work: avoid virtual
            // function call, its overhead can be excessive.
            if ( numManifolds + numCurConstraints ) {
              this.solver.solveGroup(
                bodies, numBodies,
                manifolds, numManifolds,
                startConstraint, numCurConstraints,
                this.solverInfo,
                this.debugDrawer,
                this.stackAlloc,
                this.dispatcher
              );
            }
          } else {

            for ( i = 0; i < numBodies; ++i ) {
              this.bodies.push( bodies[i] );
            }

            for ( i = 0; i < numManifolds; ++i ) {
              this.manifolds.push( manifolds[i] );
            }

            for ( i = 0; i < numCurConstraints; ++i ) {
              this.constraints.push( startConstraint[i] );
            }

            if ( ( this.constraints.length + this.manifolds.length ) > this.solverInfo.minimumSolverBatchSize ) {
              this.processConstraints();
            }

          }
        }
      },

      processConstraints: function() {
        if ( this.manifolds.length + this.constraints.length > 0 ) {
          var bodies = this.bodies.length ? this.bodies : null;
          var manifold = this.manifolds.length ? this.manifolds : null;
          var constraints = this.constraints.length ? this.constraints : null;

          this.solver.solveGroup( bodies, this.bodies.length, manifold, this.manifolds.length, constraints, this.constraints.length, this.solverInfo, this.debugDrawer, this.stackAlloc, this.dispatcher );
        }

        this.bodies.length = 0;
        this.manifolds.length = 0;
        this.constraints.length = 0;
      }

    }
  });

  // Used in integrateTransforms
  var tmpITVec1   = Bump.Vector3.create();
  var tmpITTrans1 = Bump.Transform.create();
  var tmpITTrans2 = Bump.Transform.create();

  // Used in synchronizeSingleMotionState
  var tmpSSMTrans1 = Bump.Transform.create();

  // Used in solveConstraints
  var emptyTypedConstraint = Bump.TypedConstraint.create();

  Bump.DiscreteDynamicsWorld = Bump.type({
    parent: Bump.DynamicsWorld,

    init: function DiscreteDynamicsWorld( dispatcher, pairCache, constraintSolver, collisionConfiguration ) {
      this._super( dispatcher, pairCache, collisionConfiguration );

      // Initializer list
      this.constraintSolver = constraintSolver;
      this.gravity = Bump.Vector3.create( 0, -10, 0 );
      this.localTime = 0;
      this.synchronizeAllMotionStates = false;
      this.profileTimings = 0;
      this.sortedConstraints = [];
      this.solverIslandCallback = null;
      // End initializer list

      // Default initializers
      this.islandManager = null;
      this.constraints = [];
      this.nonStaticRigidBodies = [];

      this.ownsIslandManager = false;
      this.ownsConstraintSolver = false;

      this.actions = [];
      // End default initializers

      // Start constructor body
      if ( this.constraintSolver === null ) {
        this.constraintSolver = Bump.SequentialImpulseConstraintSolver.create();
        this.ownsConstraintSolver = true;
      } else {
        this.ownsConstraintSolver = false;
      }

      this.islandManager = Bump.SimulationIslandManager.create();

      this.ownsIslandManager = true;

      this.solverIslandCallback = Bump.InplaceSolverIslandCallback.create( constraintSolver, this.stackAlloc, dispatcher );

      return this;
    },

    members: {
      destruct: function() {
        if ( this.ownsIslandManager ) {
          this.islandManager.destruct();
        }

        if ( this.solverIslandCallback ) {
          this.solverIslandCallback.destruct();
        }

        if ( this.ownsConstraintSolver ) {
          this.constraintSolver.destruct();
        }
      },

      stepSimulation: function( timeStep, maxSubSteps, fixedTimeStep ) {
        maxSubSteps = maxSubSteps === undefined ? 1 : maxSubSteps;
        fixedTimeStep = fixedTimeStep === undefined ? 1 / 60 : fixedTimeStep;

        var numSimulationSubSteps = 0;

        // Fixed timestep with interpolation
        if ( maxSubSteps ) {
          this.localTime += timeStep;
          if ( this.localTime >= fixedTimeStep ) {
            numSimulationSubSteps = ~~( this.localTime / fixedTimeStep );
            this.localTime -= numSimulationSubSteps * fixedTimeStep;
          }
        }

        // Variable timestep
        else {
          fixedTimeStep = timeStep;
          this.localTime = timeStep;
          if ( Bump.FuzzyZero( timeStep ) ) {
            numSimulationSubSteps = 0;
            maxSubSteps = 0;
          } else {
            numSimulationSubSteps = 1;
            maxSubSteps = 1;
          }
        }

        // Process some debugging flags.
        if ( this.getDebugDrawer() !== null ) {
          var debugDrawer = this.getDebugDrawer();
          Bump.gDisableDeactivation = ( debugDrawer.getDebugMode() & Bump.IDebugDraw.DebugDrawModes.DBG_NoDeactivation ) !== 0;
        }

        // Clamp the number of substeps, to prevent simulation grinding spiralling down to a halt
        if ( numSimulationSubSteps ) {
          var clampedSimulationSteps = ( numSimulationSubSteps > maxSubSteps ) ? maxSubSteps : numSimulationSubSteps;

          this.saveKinematicState( fixedTimeStep * clampedSimulationSteps );

          this.applyGravity();

          for ( var i = 0; i < clampedSimulationSteps; ++i ) {
            this.internalSingleStepSimulation( fixedTimeStep );
            this.synchronizeMotionStates();
          }

        } else {
          this.synchronizeMotionStates();
        }

        this.clearForces();

        return numSimulationSubSteps;
      },

      synchronizeMotionStates: function() {
        var i, body;

        if ( this.synchronizeAllMotionStates ) {
          // Iterate over all collision objects.
          for ( i = 0; i < this.collisionObjects.length; ++i ) {
            var colObj = this.collisionObjects[i];
            body = Bump.RigidBody.upcast( colObj );
            if ( body !== null ) {
              this.synchronizeSingleMotionState( body );
            }
          }
        } else {
          // Iterate over all active rigid bodies.
          for ( i = 0; i < this.nonStaticRigidBodies.length; ++i ) {
            body = this.nonStaticRigidBodies[i];
            if ( body.isActive() ) {
              this.synchronizeSingleMotionState( body );
            }
          }
        }
      },

      synchronizeSingleMotionState: function( body ) {
        Bump.Assert( body !== null );

        if ( body.getMotionState() !== null && !body.isStaticOrKinematicObject() ) {
          // We need to call the update at least once, even for sleeping objects
          // otherwise the 'graphics' transform never updates properly.
          //
          // **TODO:** Add 'dirty' flag.
          var interpolatedTransform = tmpSSMTrans1;
          Bump.TransformUtil.integrateTransform(
            body.getInterpolationWorldTransform(),
            body.getInterpolationLinearVelocity(),
            body.getInterpolationAngularVelocity(),
            this.localTime * body.getHitFraction(),
            interpolatedTransform
          );
          body.getMotionState().setWorldTransform( interpolatedTransform );
        }
      },

      addConstraint: function( constraint, disableCollisionsBetweenLinkedBodies ) {
        this.constraints.push( constraint );
        if ( disableCollisionsBetweenLinkedBodies ) {
          constraint.getRigidBodyA().addConstraintRef( constraint );
          constraint.getRigidBodyB().addConstraintRef( constraint );
        }
      },

      removeConstraint: function( constraint ) {
        Bump.remove( this.constraints, constraint );

        constraint.getRigidBodyA().removeConstraintRef( constraint );
        constraint.getRigidBodyB().removeConstraintRef( constraint );
      },

      addAction: function( action ) {
        this.actions.push( action );
      },

      removeAction: function( action ) {
        Bump.remove( this.actions, action );
      },

      getSimulationIslandManager: function() {
        return this.islandManager;
      },

      getCollisionWorld: function() {
        return this;
      },

      setGravity: function( gravity ) {
        this.gravity = gravity;
        for ( var i = 0; i < this.nonStaticRigidBodies.length; ++i ) {
          var body = this.nonStaticRigidBodies[i];
          if ( body.isActive() && !( body.getFlags() & Bump.RigidBodyFlags.BT_DISABLE_WORLD_GRAVITY ) ) {
            body.setGravity( gravity );
          }
        }
      },

      getGravity: function() {
        return this.gravity;
      },

      // Propose to remove this, as this merely adds a layer of redirection.
      addCollisionObject: function( collisionObject, collisionFilterGroup, collisionFilterMask ) {
        this._super( collisionObject, collisionFilterGroup, collisionFilterMask );
      },

      addRigidBody: function( body ) {
        if ( !body.isStaticOrKinematicObject() && !( body.getFlags() & Bump.RigidBodyFlags.BT_DISABLE_WORLD_GRAVITY ) ) {
          body.setGravity( this.gravity );
        }

        if ( body.getCollisionShape() !== null ) {
          if ( !body.isStaticObject() ) {
            this.nonStaticRigidBodies.push( body );
          } else {
            body.setActivationState( Bump.CollisionObject.ISLAND_SLEEPING );
          }

          var isDynamic = !( body.isStaticObject() || body.isKinematicObject() ),
              collisionFilterGroup = isDynamic ?
                Bump.BroadphaseProxy.CollisionFilterGroups.DefaultFilter :
                Bump.BroadphaseProxy.CollisionFilterGroups.StaticFilter,
              collisionFilterMask = isDynamic ?
                Bump.BroadphaseProxy.CollisionFilterGroups.AllFilter :
                ( Bump.BroadphaseProxy.CollisionFilterGroups.AllFilter ^ Bump.BroadphaseProxy.CollisionFilterGroups.StaticFilter );

          this.addCollisionObject( body, collisionFilterGroup, collisionFilterMask );
        }
      },

      addRigidBodyWithGroup: function( body, group, mask ) {
        if ( !body.isStaticOrKinematicObject() && !( body.getFlags() & Bump.RigidBodyFlags.BT_DISABLE_WORLD_GRAVITY ) ) {
          body.setGravity( this.gravity );
        }

        if ( body.getCollisionShape() ) {
          if ( !body.isStaticObject() ) {
            this.nonStaticRigidBodies.push( body );
          } else {
            body.setActivationState( Bump.CollisionObject.ISLAND_SLEEPING );
          }
          this.addCollisionObject( body, group, mask );
        }
      },

      removeRigidBody: function( body ) {
        Bump.remove( this.nonStaticRigidBodies, body );

        Bump.CollisionWorld.prototype.removeCollisionObject.apply( this, [ body ] );
      },

      removeCollisionObject: function( collisionObject ) {
        var body = Bump.RigidBody.upcast( collisionObject );
        if ( body !== null ) {
          this.removeRigidBody( body );
        } else {
          this._super( collisionObject );
        }
      },

      debugDrawConstraint: Bump.notImplemented,
      debugDrawWorld: Bump.notImplemented,

      setConstraintSolver: function( solver ) {
        //    if ( this.ownsConstraintSolver ) {
        //      btAlignedFree( this.constraintSolver );
        //    }

        this.ownsConstraintSolver = false;
        this.constraintSolver = solver;
      },

      getConstraintSolver: function() {
        return this.constraintSolver;
      },

      getNumConstraints: function() {
        return this.constraints.length;
      },

      getConstraint: function( index ) {
        return this.constraints[index];
      },

      getWorldType: function() {
        return Bump.DynamicsWorldType.BT_DISCRETE_DYNAMICS_WORLD;
      },

      clearForces: function() {
        // **TODO:** Iterate over awake simulation islands!
        for ( var i = 0; i < this.nonStaticRigidBodies.length; ++i ) {
          var body = this.nonStaticRigidBodies[i];
          // Need to check if next line is ok. It might break backward
          // compatibility (people applying forces on sleeping objects get
          // never cleared and accumulate on wake-up).
          body.clearForces();
        }
      },

      applyGravity: function() {
        // **TODO:** Iterate over awake simulation islands!
        for ( var i = 0; i < this.nonStaticRigidBodies.length; ++i ) {
          var body = this.nonStaticRigidBodies[i];
          if ( body.isActive() ) {
            body.applyGravity();
          }
        }
      },

      setNumTasks: Bump.noop,

      // `updateVehicles` is obselete. Please use `updateActions` instead.
      updateVehicles: function( timeStep ) {
        this.updateActions( timeStep );
      },

      // **Obselete.** Please use `addAction` instead.
      addVehicle: function( vehicle ) {
        this.addAction( vehicle );
      },

      // **Obselete.** Please use `removeAction` instead.
      removeVehicle: function( vehicle ) {
        this.removeAction( vehicle );
      },

      // **Obselete.** Please use `addAction` instead.
      addCharacter: function( character ) {
        this.addAction( character );
      },

      // **Obselete.** Please use `removeAction` instead.
      removeCharacter: function( character ) {
        this.removeAction( character );
      },

      // ## Protected methods

      predictUnconstraintMotion: function( timeStep ) {
        for ( var i = 0; i < this.nonStaticRigidBodies.length; ++i ) {
          var body = this.nonStaticRigidBodies[i];
          if ( !body.isStaticOrKinematicObject() ) {
            body.integrateVelocities( timeStep );
            body.applyDamping( timeStep );
            body.predictIntegratedTransform( timeStep, body.getInterpolationWorldTransform() );
          }
        }
      },

      integrateTransforms: function( timeStep ) {
        var predictedTrans = tmpITTrans1;
        for ( var i = 0; i < this.nonStaticRigidBodies.length; ++i ) {
          var body = this.nonStaticRigidBodies[i];
          body.setHitFraction( 1 );

          if ( body.isActive() && ( !body.isStaticOrKinematicObject() ) ) {
            body.predictIntegratedTransform( timeStep, predictedTrans );
            var squareMotion = predictedTrans.origin.subtract( body.getWorldTransform().origin, tmpITVec1 ).length2();

            if ( this.getDispatchInfo().useContinuous && body.getCcdSquareMotionThreshold() && body.getCcdSquareMotionThreshold() < squareMotion ) {
              if ( body.getCollisionShape().isConvex() ) {
                ++Bump.gNumClampedCcdMotions;
                var sweepResults = Bump.ClosestNotMeConvexResultCallback.create(
                  body,
                  body.getWorldTransform().origin,
                  predictedTrans.origin,
                  this.getBroadphase().getOverlappingPairCache(),
                  this.getDispatcher()
                );

                var tmpSphere = Bump.SphereShape.create( body.getCcdSweptSphereRadius() );
                sweepResults.allowedPenetration = this.getDispatchInfo().allowedCcdPenetration;

                sweepResults.collisionFilterGroup = body.getBroadphaseProxy().collisionFilterGroup;
                sweepResults.collisionFilterMask  = body.getBroadphaseProxy().collisionFilterMask;

                var modifiedPredictedTrans = tmpITTrans2.assign( predictedTrans );
                modifiedPredictedTrans.setBasis( body.getWorldTransform().basis );

                this.convexSweepTest( tmpSphere, body.getWorldTransform(), modifiedPredictedTrans, sweepResults );
                if ( sweepResults.hasHit() && ( sweepResults.closestHitFraction < 1 ) ) {
                  body.setHitFraction( sweepResults.closestHitFraction );
                  body.predictIntegratedTransform( timeStep * body.getHitFraction(), predictedTrans );
                  body.setHitFraction( 0 );
                  body.proceedToTransform( predictedTrans );

                  // Response between two dynamic objects without friction,
                  // assuming 0 penetration depth.
                  var appliedImpulse = 0;
                  var depth = 0;
                  appliedImpulse = this.resolveSingleCollision( body, sweepResults.hitCollisionObject, sweepResults.hitPointWorld, sweepResults.hitNormalWorld, this.getSolverInfo(), depth );

                  continue;
                }
              }
            }

            body.proceedToTransform( predictedTrans );
          }
        }
      },

      calculateSimulationIslands: function() {
        this.getSimulationIslandManager().updateActivationState(
          this.getCollisionWorld(),
          this.getCollisionWorld().getDispatcher()
        );

        var i, numConstraints = this.constraints.length;

        for ( i = 0; i < numConstraints; ++i ) {
          var constraint = this.constraints[i];

          if ( constraint.isEnabled() ) {
            var colObj0 = constraint.getRigidBodyA();
            var colObj1 = constraint.getRigidBodyB();

            if (( (colObj0 !== null) && (!colObj0.isStaticOrKinematicObject()) ) &&
                ( (colObj1 !== null) && (!colObj1.isStaticOrKinematicObject()) ))
            {
              if ( colObj0.isActive() || colObj1.isActive() ) {
                this.getSimulationIslandManager().getUnionFind().unite(
                  colObj0.getIslandTag(),
                  colObj1.getIslandTag()
                );
              }
            }
          }
        }

        // Store the island id in each body.
        this.getSimulationIslandManager().storeIslandActivationState( this.getCollisionWorld() );
      },

      solveConstraints: function( solverInfo ) {
        var m_sortedConstraints = this.sortedConstraints;
        var m_constraints = this.constraints;
        var m_solverIslandCallback = this.solverIslandCallback;

        Bump.resize( m_sortedConstraints, m_constraints.length, emptyTypedConstraint );
        var i;
        for ( i = 0; i < this.getNumConstraints(); ++i ) {
          m_sortedConstraints[i] = m_constraints[i];
        }

        Bump.quickSort( m_sortedConstraints, Bump.SortConstraintOnIslandPredicate.create() );

        var constraintsPtr = this.getNumConstraints() ? m_sortedConstraints : null;

        m_solverIslandCallback.setup( solverInfo, constraintsPtr, m_sortedConstraints.length, this.getDebugDrawer() );
        this.constraintSolver.prepareSolve( this.getCollisionWorld().getNumCollisionObjects(), this.getCollisionWorld().getDispatcher().getNumManifolds() );

        // Solve all the constraints for this island.
        this.islandManager.buildAndProcessIslands( this.getCollisionWorld().getDispatcher(), this.getCollisionWorld(), m_solverIslandCallback );

        m_solverIslandCallback.processConstraints();

        this.constraintSolver.allSolved( solverInfo, this.debugDrawer, this.stackAlloc );
      },

      updateActivationState: function( timeStep ) {
        for ( var i = 0; i < this.nonStaticRigidBodies.length; ++i ) {
          var body = this.nonStaticRigidBodies[i];
          if ( body !== null ) {
            body.updateDeactivation( timeStep );

            if ( body.wantsSleeping() ) {
              if ( body.isStaticOrKinematicObject() ) {
                body.setActivationState( Bump.CollisionObject.ISLAND_SLEEPING );
              } else {
                if ( body.getActivationState() === Bump.CollisionObject.ACTIVE_TAG ) {
                  body.setActivationState( Bump.CollisionObject.WANTS_DEACTIVATION );
                }
                if ( body.getActivationState() === Bump.CollisionObject.ISLAND_SLEEPING ) {
                  body.setAngularVelocity( zeroVec );
                  body.setLinearVelocity( zeroVec );
                }
              }
            } else {
              if ( body.getActivationState() !== Bump.CollisionObject.DISABLE_DEACTIVATION ) {
                body.setActivationState( Bump.CollisionObject.ACTIVE_TAG );
              }
            }
          }
        }
      },

      updateActions: function( timeStep ) {
        for ( var i = 0; i < this.actions.length; ++i ) {
          this.actions[i].updateAction( this, timeStep );
        }
      },

      internalSingleStepSimulation: function( timeStep ) {
        if ( null !== this.internalPreTickCallback ) {
          this.internalPreTickCallback( this, timeStep );
        }

        // Apply gravity, predict motion.
        this.predictUnconstraintMotion( timeStep );

        var dispatchInfo = this.getDispatchInfo();

        dispatchInfo.timeStep = timeStep;
        dispatchInfo.stepCount = 0;
        dispatchInfo.debugDraw = this.getDebugDrawer();

        // Perform collision detection
        this.performDiscreteCollisionDetection();

        this.calculateSimulationIslands();

        this.getSolverInfo().timeStep = timeStep;

        // Solve contact and other joint constraints
        this.solveConstraints( this.getSolverInfo() );

        // Integrate transforms
        this.integrateTransforms( timeStep );

        // Update vehicle simulation
        this.updateActions( timeStep );

        this.updateActivationState( timeStep );

        if ( null !== this.internalTickCallback ) {
          this.internalTickCallback( this, timeStep );
        }
      },

      // Would like to iterate over `nonStaticRigidBodies`, but unfortunately
      // old API allows to switch status *after* adding kinematic objects to the
      // world. Fix it for Bullet 3.x release.
      saveKinematicState: function( timeStep ) {
        for ( var i = 0; i < this.collisionObjects.length; ++i ) {
          var colObj = this.collisionObjects[i];
          var body = Bump.RigidBody.upcast( colObj );
          if ( body !== null && body.getActivationState() !== Bump.CollisionObject.ISLAND_SLEEPING ) {
            if ( body.isKinematicObject() ) {
              // To calculate velocities next frame
              body.saveKinematicState( timeStep );
            }
          }
        }
      }

    }
  });

})( this, this.Bump );
