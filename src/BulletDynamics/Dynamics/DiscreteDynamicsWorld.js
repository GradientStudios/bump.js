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
      }

    }
  });

})( this, this.Bump );
