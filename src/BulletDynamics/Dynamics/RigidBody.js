(function( window, Bump ) {
  var RigidBodyConstructionInfo,
      tmpV1 = Bump.Vector3.create(),
      tmpV2 = Bump.Vector3.create(),
      uniqueId = 0;

  Bump.RigidBody = Bump.type({
    parent: Bump.CollisionObject,

    init: function RigidBody() {
      this._super();

      this.invInertiaTensorWorld = Bump.Matrix3x3.create();
      this.linearVelocity = Bump.Vector3.create();
      this.angularVelocity = Bump.Vector3.create();
      this.inverseMass = 0;
      this.linearFactor = Bump.Vector3.create();

      this.gravity = Bump.Vector3.create();
      this.gravity_acceleration = Bump.Vector3.create();
      this.invInertiaLocal = Bump.Vector3.create();
      this.totalForce = Bump.Vector3.create();
      this.totalTorque = Bump.Vector3.create();

      this.linearDamping = 0;
      this.angularDamping = 0;

      this.additionalDamping = false;
      this.additionalDampingFactor = 0;
      this.additionalLinearDampingThresholdSqr = 0;
      this.additionalAngularDampingThresholdSqr = 0;
      this.additionalAngularDampingFactor = 0;

      this.linearSleepingThreshold = 0;
      this.angularSleepingThreshold = 0;

      // `optionalMotionState` allows to automatic synchronize the world
      // transform for active objects.
      this.optionalMotionState = null;

      // Keep track of typed constraints referencing this rigid body.
      this.constraintRefs = [];

      this.rigidbodyFlags = 0;

      this.debugBodyId = 0;

      this.deltaLinearVelocity = Bump.Vector3.create();
      this.deltaAngularVelocity = Bump.Vector3.create();
      this.angularFactor = Bump.Vector3.create();
      this.invMass = Bump.Vector3.create();
      this.pushVelocity = Bump.Vector3.create();
      this.turnVelocity = Bump.Vector3.create();

      this.contactSolverType = 0;
      this.frictionSolverType = 0;

      var constructionInfo = arguments[0];
      if ( constructionInfo instanceof RigidBodyConstructionInfo.prototype.constructor ) {
        this.setupRigidBody( constructionInfo );
      } else {
        constructionInfo = RigidBodyConstructionInfo.create.apply( undefined, arguments );
        this.setupRigidBody( constructionInfo );
      }
      return this;
    },

    members: {

      setupRigidBody: function( constructionInfo ) {
        this.internalType = Bump.CollisionObject.CollisionObjectTypes.CO_RIGID_BODY;

        this.linearVelocity.setValue( 0, 0, 0 );
        this.angularVelocity.setValue( 0, 0, 0 );
        this.angularFactor.setValue( 1, 1, 1 );
        this.linearFactor.setValue( 1, 1, 1 );
        this.gravity.setValue( 0, 0, 0 );
        this.gravity_acceleration.setValue( 0, 0, 0 );
        this.totalForce.setValue( 0, 0, 0 );
        this.totalTorque.setValue( 0, 0, 0 );
        this.setDamping( constructionInfo.linearDamping, constructionInfo.angularDamping );

        this.linearSleepingThreshold = constructionInfo.linearSleepingThreshold;
        this.angularSleepingThreshold = constructionInfo.angularSleepingThreshold;
        this.optionalMotionState = constructionInfo.motionState;
        this.contactSolverType = 0;
        this.frictionSolverType = 0;
        this.additionalDamping = constructionInfo.additionalDamping;
        this.additionalDampingFactor = constructionInfo.additionalDampingFactor;
        this.additionalLinearDampingThresholdSqr = constructionInfo.additionalLinearDampingThresholdSqr;
        this.additionalAngularDampingThresholdSqr = constructionInfo.additionalAngularDampingThresholdSqr;
        this.additionalAngularDampingFactor = constructionInfo.additionalAngularDampingFactor;

        if ( this.optionalMotionState ) {
          this.optionalMotionState.getWorldTransform( this.worldTransform );
        } else {
          this.worldTransform.assign( constructionInfo.startWorldTransform );
        }

        this.interpolationWorldTransform.assign( this.worldTransform );
        this.interpolationLinearVelocity.setValue( 0, 0, 0 );
        this.interpolationAngularVelocity.setValue( 0, 0, 0 );

        // Moved to `CollisionObject`.
        this.friction = constructionInfo.friction;
        this.restitution = constructionInfo.restitution;

        this.setCollisionShape( constructionInfo.collisionShape );
        this.debugBodyId = uniqueId++;

        this.setMassProps( constructionInfo.mass, constructionInfo.localInertia );
        this.updateInertiaTensor();

        this.rigidbodyFlags = 0;

        this.deltaLinearVelocity.setZero();
        this.deltaAngularVelocity.setZero();
        this.invMass = this.inverseMass * this.linearFactor;
        this.pushVelocity.setZero();
        this.turnVelocity.setZero();
      },

      proceedToTransform: function( newTrans ) {
        this.setCenterOfMassTransform( newTrans );
      },

      predictIntegratedTransform: function( timeStep, predictedTransform ) {
        Bump.TransformUtil.integrateTransform(
          this.worldTransform,
          this.linearVelocity,
          this.angularVelocity,
          timeStep,
          predictedTransform
        );
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      saveKinematicState: function( timeStep ) {
        // **TODO:** Clamp to some (user definable) safe minimum timestep, to
        // limit maximum angular/linear velocities.
        if ( timeStep !== 0 ) {
          // If we use motionstate to synchronize world transforms, get the new
          // kinematic/animated world transform.
          if ( this.getMotionState() ) {
            this.getMotionState().getWorldTransform( this.worldTransform );
          }

          var linVel = tmpV1, angVel = tmpV2;

          Bump.TransformUtil.calculateVelocity(
            this.interpolationWorldTransform,
            this.worldTransform,
            timeStep,
            this.linearVelocity,
            this.angularVelocity
          );
          this.interpolationLinearVelocity.assign( this.linearVelocity );
          this.interpolationAngularVelocity.assign( this.angularVelocity );
          this.interpolationWorldTransform.assign( this.worldTransform );
        }
      },

      applyGravity: function() {
        if ( this.isStaticOrKinematicObject() ) {
          return;
        }

        this.applyCentralForce( this.gravity );
      },

      setGravity: function( acceleration ) {
        if ( this.inverseMass !== 0 ) {
          this.gravity = acceleration * ( 1 / this.inverseMass );
        }
        this.gravity_acceleration = acceleration;
      },

      getGravity: function() {
        return this.gravity_acceleration;
      },

      setDamping: function( lin_damping, ang_damping ) {
        this.linearDamping = Bump.Clamped( lin_damping, 0, 1 );
        this.angularDamping = Bump.Clamped( ang_damping, 0, 1 );
      },

      getLinearDamping: function() {
        return this.linearDamping;
      },

      getAngularDamping: function() {
        return this.angularDamping;
      },

      getLinearSleepingThreshold: function() {
        return this.linearSleepingThreshold;
      },

      getAngularSleepingThreshold: function() {
        return this.angularSleepingThreshold;
      },

      // On new damping: see discussion/issue report [here](http://code.google.com/p/bullet/issues/detail?id=74).
      // **TODO:** Do some performance comparisons, but other parts of the
      // engine are probably bottleneck anyway.
      //
      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      applyDamping: function( timeStep ) {
        var dir;

        this.linearVelocity.multiplyScalarSelf( Math.pow( 1 - this.linearDamping, timeStep ) );
        this.angularVelocity.multiplyScalarSelf( Math.pow( 1 - this.angularDamping, timeStep ) );

        // Additional damping can help avoiding lowpass jitter motion, help
        // stability for ragdolls etc. Such damping is undesirable, so once the
        // overall simulation quality of the rigid body dynamics system has
        // improved, this should become obsolete.
        if ( this.additionalDamping ) {
          if (
            ( this.angularVelocity.length2() < this.additionalAngularDampingThresholdSqr ) &&
              ( this.linearVelocity.length2() < this.additionalLinearDampingThresholdSqr )
          ) {
            this.angularVelocity.multiplyScalarSelf( this.additionalDampingFactor );
            this.linearVelocity.multiplyScalarSelf( this.additionalDampingFactor );
          }

          var speed = this.linearVelocity.length();
          if ( speed < this.linearDamping ) {
            var dampVel = 0.005;
            if ( speed > dampVel ) {
              dir = this.linearVelocity.normalized( tmpV1 );
              this.linearVelocity.subtractSelf( dir.multiplyScalar( dampVel, tmpV2 ) );
            } else {
              this.linearVelocity.setValue( 0, 0, 0 );
            }
          }

          var angSpeed = this.angularVelocity.length();
          if ( angSpeed < this.angularDamping ) {
            var angDampVel = 0.005;
            if ( angSpeed > angDampVel ) {
              dir = this.angularVelocity.normalized( tmpV1 );
              this.angularVelocity.subtractSelf( dir.multiplyScalar( angDampVel, tmpV2 ) );
            } else {
              this.angularVelocity.setValue( 0, 0, 0 );
            }
          }
        }
      }

    }
  });

  Bump.RigidBody.RigidBodyConstructionInfo = Bump.type({
    init: function RigidBodyConstructionInfo( mass, motionState, collisionShape, localInertia ) {
      localInertia = localInertia === undefined ? tmpV1.setValue( 0, 0, 0 ) : localInertia;

      this.mass = mass;
      this.motionState = motionState;
      this.startWorldTransform = Bump.Transform.create();
      this.collisionShape = collisionShape;
      this.localInertia = localInertia.clone();
      this.linearDamping = 0;
      this.angularDamping = 0;
      this.friction = 0.5;
      this.restitution = 0;
      this.linearSleepingThreshold = 0.8;
      this.angularSleepingThreshold = 1;
      this.additionalDamping = false;
      this.additionalDampingFactor = 0.005;
      this.additionalLinearDampingThresholdSqr = 0.01;
      this.additionalAngularDampingThresholdSqr = 0.01;
      this.additionalAngularDampingFactor = 0.01;

      this.startWorldTransform.setIdentity();
    }
  });

  RigidBodyConstructionInfo = Bump.RigidBody.RigidBodyConstructionInfo;

})( this, this.Bump );
