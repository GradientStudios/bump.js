(function( window, Bump ) {
  var RigidBodyConstructionInfo,
      tmpV1 = Bump.Vector3.create(),
      tmpV2 = Bump.Vector3.create(),
      tmpM1 = Bump.Matrix3x3.create(),
      tmpM2 = Bump.Matrix3x3.create(),
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

      // Uses the following temporary variables:
      //
      // - `tmpM1` ← `updateInertiaTensor`
      // - `tmpM2` ← `updateInertiaTensor`
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
        this.invMass = this.linearFactor.multiplyScalar( this.inverseMass );
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

      // Uses the following temporary variables:
      //
      // - `tmpV1` ← `applyCentralForce`
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
      },

      getCollisionShape: function() {
        return this.collisionShape;
      },

      setMassProps: function( mass, inertia ) {
        if ( mass === 0 ) {
          this.collisionFlags |= Bump.CollisionObject.CollisionFlags.CF_STATIC_OBJECT;
          this.inverseMass = 0;
        } else {
          this.collisionFlags &= ( ~Bump.CollisionObject.CollisionFlags.CF_STATIC_OBJECT );
          this.inverseMass = 1 / mass;
        }

        // Fg = m * a
        this.gravity = mass * this.gravity_acceleration;

        this.invInertiaLocal.setValue(
          inertia.x !== 0 ? 1.0 / inertia.x: 0,
          inertia.y !== 0 ? 1.0 / inertia.y: 0,
          inertia.z !== 0 ? 1.0 / inertia.z: 0
        );

        this.invMass = this.linearFactor.multiplyScalar( this.inverseMass, this.invMass );
      },

      getLinearFactor: function() {
        return this.linearFactor;
      },

      setLinearFactor: function( linearFactor ) {
        this.linearFactor.assign( linearFactor );
        this.invMass = this.linearFactor.multiplyScalar( this.inverseMass, this.invMass );
      },

      getInvMass: function() {
        return this.inverseMass;
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      integrateVelocities: function( step ) {
        if ( this.isStaticOrKinematicObject() ) {
          return;
        }

        var MAX_ANGVEL = Math.PI / 2;

        this.linearVelocity.addSelf( this.totalForce.multiplyScalar( this.inverseMass * step ), tmpV1 );
        this.angularVelocity.addSelf(
          this.invInertiaTensorWorld
            .multiplyVector3( this.totalTorque, tmpV1 )
            .multiplyScalar( step, tmpV1 )
        );

        // Clamp angular velocity. Collision calculations will fail on higher
        // angular velocities.
        var angvel = this.angularVelocity.length();
        if ( angvel * step > MAX_ANGVEL ) {
          this.angularVelocity.multiplyScalarSelf( ( MAX_ANGVEL / step ) / angvel );
        }
      },

      // Uses the following temporary variables:
      //
      // - `tmpM1` ← `updateInertiaTensor`
      // - `tmpM2` ← `updateInertiaTensor`
      setCenterOfMassTransform: function( xform ) {
        if ( this.isStaticOrKinematicObject() ) {
          this.interpolationWorldTransform.assign( this.worldTransform );
        } else {
          this.interpolationWorldTransform.assign( xform );
        }
        this.interpolationLinearVelocity.assign( this.getLinearVelocity() );
        this.interpolationAngularVelocity.assign( this.getAngularVelocity() );
        this.worldTransform.assign( xform );
        this.updateInertiaTensor();
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      applyCentralForce: function( force ) {
        this.totalForce.addSelf( force.multiplyVector( this.linearFactor, tmpV1 ) );
      },

      getTotalForce: function() {
        return this.totalForce;
      },

      getTotalTorque: function() {
        return this.totalTorque;
      },

      getInvInertiaDiagLocal: function() {
        return this.invInertiaLocal;
      },

      setInvInertiaDiagLocal: function( diagInvInertia ) {
        this.invInertiaLocal.assign( diagInvInertia );
      },

      setSleepingThresholds: function( linear, angular ) {
        this.linearSleepingThreshold = linear;
        this.angularSleepingThreshold = angular;
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      applyTorque: function( torque ) {
        this.totalTorque.addSelf( torque.multiplyScalar( this.angularFactor, tmpV1 ) );
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1` ← `applyTorque`
      // - `tmpV2`
      applyForce: function( force, rel_pos ) {
        this.applyCentralForce( force );
        this.applyTorque( rel_pos.cross( force.multiplyScalar( this.linearFactor, tmpV2 ), tmpV2 ) );
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      applyCentralImpulse: function( impulse ) {
        this.linearVelocity.addSelf(
          impulse
            .multiplyScalar( this.linearFactor, tmpV1 )
            .multiplyScalar( this.inverseMass, tmpV1 )
        );
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      applyTorqueImpulse: function( torque ) {
        this.angularVelocity.addSelf(
          this.invInertiaTensorWorld
            .multiplyVector( torque, tmpV1 )
            .multiplyScalar( this.angularFactor, tmpV1 )
        );
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1` ← `applyTorqueImpulse`
      // - `tmpV2`
      applyImpulse: function( impulse, rel_pos ) {
        if ( this.inverseMass !== 0 ) {
          this.applyCentralImpulse( impulse );

          if ( this.angularFactor ) {
            this.applyTorqueImpulse(
              rel_pos.cross(
                impulse.multiplyScalar( this.linearFactor, tmpV2 ), tmpV2 )
            );
          }

        }
      },

      clearForces: function() {
        this.totalForce.setValue( 0, 0, 0 );
        this.totalTorque.setValue( 0, 0, 0 );
      },

      // Uses the following temporary variables:
      //
      // - `tmpM1`
      // - `tmpM2`
      updateInertiaTensor: function() {
        this.invInertiaTensorWorld.assign(
          this.worldTransform.basis
            .scaled( this.invInertiaLocal, tmpM1 )
            .multiplyMatrix( this.worldTransform.basis.transpose( tmpM2 ), tmpM1 )
        );
      },

      getCenterOfMassPosition: function() {
        return this.worldTransform.origin;
      },

      getOrientation: function( dest ) {
        dest = dest || Bump.Quaternion.create();

        var orn = dest;
        this.worldTransform.basis.getRotation( orn );
        return orn;
      },

      getCenterOfMassTransform: function() {
        return this.worldTransform;
      },

      getLinearVelocity: function() {
        return this.linearVelocity;
      },

      getAngularVelocity: function() {
        return this.angularVelocity;
      },

      setLinearVelocity: function( lin_vel ) {
        this.linearVelocity.assign( lin_vel );
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
