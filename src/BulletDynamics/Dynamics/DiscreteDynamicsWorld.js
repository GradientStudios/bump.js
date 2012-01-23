(function( window, Bump ) {

  Bump.DiscreteDynamicsWorld = Bump.type({
    parent: Bump.DynamicsWorld,

    init: function DiscreteDynamicsWorld( dispatcher, pairCache, constraintSolver, collisionConfiguration ) {
      this._super( dispatcher, pairCache, collisionConfiguration );

      this.constraintSolver = constraintSolver;
      this.gravity = Bump.Vector3.create( 0, -10, 0 );
      this.localTime = 0;
      this.synchronizeAllMotionStates = false;
      this.profileTimings = 0;

      this.islandManager = null;
      this.constraints = [];
      this.nonStaticRigidBodies = [];

      this.ownsIslandManager = false;
      this.ownsConstraintSolver = false;

      this.actions = [];

      if ( this.constraintSolver === null ) {
        this.constraintSolver = Bump.SequentialImpulseConstraintSolver.create();
        this.ownsConstraintSolver = true;
      } else {
        this.ownsConstraintSolver = false;
      }

      this.islandManager = Bump.SimulationIslandManager.create();
      this.ownsIslandManager = true;

      return this;
    },

    members: {
      destruct: function() {
        if ( this.ownsIslandManager ) {
          this.islandManager.destruct();
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
          var interpolatedTransform = Bump.Transform.create();
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
        //     this.constraints.remove( constraint );
        var idx = this.constraints.indexOf( constraint );
        if ( idx !== -1 ) {
          this.constraints[ idx ] = this.constraints[ this.constraints.length - 1 ];
          this.constraints.pop();
        }

        constraint.getRigidBodyA().removeConstraintRef( constraint );
        constraint.getRigidBodyB().removeConstraintRef( constraint );
      },

      addAction: function( action ) {
        this.actions.push( action );
      },

      removeAction: function( action ) {
        //     this.actions.remove( action );
        var idx = this.actions.indexOf( action );
        if ( idx !== -1 ) {
          this.actions[ idx ] = this.actions[ this.actions.length - 1 ];
          this.actions.pop();
        }
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

          var isDynamic = !( body.isStaticObject() || body.isKinematicObject() );
          var collisionFilterGroup = isDynamic ?
            Bump.BroadphaseProxy.CollisionFilterGroups.DefaultFilter :
            Bump.BroadphaseProxy.CollisionFilterGroups.StaticFilter;
          var collisionFilterMask = isDynamic ?
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
        //     this.nonStaticRigidBodies.remove( body );
        var idx = this.nonStaticRigidBodies.indexOf( body );
        if ( idx !== -1 ) {
          this.nonStaticRigidBodies[ idx ] = this.nonStaticRigidBodies[ this.nonStaticRigidBodies.length - 1 ];
          this.nonStaticRigidBodies.pop();
        }

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
        this.addAction(vehicle);
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
      }

    }
  });

})( this, this.Bump );
