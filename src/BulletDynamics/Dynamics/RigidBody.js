(function( window, Bump ) {
  var RigidBodyConstructionInfo,
      tmpV1 = Bump.Vector3.create(),
      tmpV2 = Bump.Vector3.create(),
      tmpV3 = Bump.Vector3.create(),
      tmpM1 = Bump.Matrix3x3.create(),
      tmpM2 = Bump.Matrix3x3.create(),
      tmpT1 = Bump.Transform.create(),
      uniqueId = 0;

  Bump.gDeactivationTime = 2;
  Bump.gDisableDeactivation = false;

  Bump.RigidBodyFlags = Bump.Enum([
    { id: 'BT_DISABLE_WORLD_GRAVITY', value: 1 }
  ]);

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

    typeMembers: {
      upcast: function( colObj ) {
        if ( colObj.getInternalType() & Bump.CollisionObject.CollisionObjectTypes.CO_RIGID_BODY ) {
          return colObj;
        }
        return null;
      }
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

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      setMassProps: function( mass, inertia ) {
        if ( mass === 0 ) {
          this.collisionFlags |= Bump.CollisionObject.CollisionFlags.CF_STATIC_OBJECT;
          this.inverseMass = 0;
        } else {
          this.collisionFlags &= ( ~Bump.CollisionObject.CollisionFlags.CF_STATIC_OBJECT );
          this.inverseMass = 1 / mass;
        }

        // Fg = m * a
        this.gravity.assign( this.gravity_acceleration.multiplyScalar( mass, tmpV1 ) );

        this.invInertiaLocal.setValue(
          inertia.x !== 0 ? 1.0 / inertia.x: 0,
          inertia.y !== 0 ? 1.0 / inertia.y: 0,
          inertia.z !== 0 ? 1.0 / inertia.z: 0
        );

        this.invMass.assign( this.linearFactor.multiplyScalar( this.inverseMass, tmpV1 ) );
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

      getInvInertiaTensorWorld: function() {
        return this.invInertiaTensorWorld;
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
      },

      setAngularVelocity: function( ang_vel ) {
        this.angularVelocity.assign( ang_vel );
      },

      getVelocityInLocalPoint: function( rel_pos, dest ) {
        dest = dest || Bump.Vector3.create();

        // We also calculate lin/ang velocity for kinematic objects.
        return this.linearVelocity
          .add( this.angularVelocity.cross( rel_pos, dest ), dest );

        // For kinematic objects, we could also use use:
        //     return (this.worldTransform(rel_pos) - this.interpolationWorldTransform(rel_pos)) / this.kinematicTimeStep;
      },

      translate: function( v ) {
        this.worldTransform.origin.addSelf( v );
      },

      getAabb: function( aabbMin, aabbMax ) {
        this.getCollisionShape().getAabb( this.worldTransform, aabbMin, aabbMax );
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      // - `tmpV3`
      computeImpulseDenominator: function( pos, normal ) {
        var r0 = pos.subtract( this.getCenterOfMassPosition(), tmpV1 ),
            c0 = r0.cross( normal, tmpV2 ),
            vec = this.getInvInertiaTensorWorld()
              .vectorMultiply( c0, tmpV3 )
              .cross( r0, tmpV3 );

        return this.inverseMass + normal.dot( vec );
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      computeAngularImpulseDenominator: function( axis ) {
        var vec = this.getInvInertiaTensorWorld().vectorMultiply( axis, tmpV1 );
        return axis.dot( vec );
      },

      updateDeactivation: function( timeStep ) {
        if (
          ( this.getActivationState() === Bump.CollisionObject.ISLAND_SLEEPING) ||
            ( this.getActivationState() === Bump.CollisionObject.DISABLE_DEACTIVATION )
        ) {
          return;
        }

        if (
          ( this.getLinearVelocity().length2() < this.linearSleepingThreshold * this.linearSleepingThreshold ) &&
            ( this.getAngularVelocity().length2() < this.angularSleepingThreshold * this.angularSleepingThreshold )
        ) {
          this.deactivationTime += timeStep;
        } else {
          this.deactivationTime = 0;
          this.setActivationState( 0 );
        }
      },

      wantsSleeping: function() {
        if ( this.getActivationState() === Bump.CollisionObject.DISABLE_DEACTIVATION ) {
          return false;
        }

        // Disable deactivation.
        if ( Bump.gDisableDeactivation || ( Bump.gDeactivationTime === 0 ) ) {
          return false;
        }

        if (
          ( this.getActivationState() === Bump.CollisionObject.ISLAND_SLEEPING) ||
            ( this.getActivationState() === Bump.CollisionObject.WANTS_DEACTIVATION )
        ) {
          return true;
        }

        if ( this.deactivationTime > Bump.gDeactivationTime ) {
          return true;
        }

        return false;
      },

      getBroadphaseProxy: function() {
        return this.broadphaseHandle;
      },

      setNewBroadphaseProxy: function( broadphaseProxy ) {
        this.broadphaseHandle = broadphaseProxy;
      },

      // `MotionState` allows to automatic synchronize the world transform for
      // active objects.
      getMotionState: function() {
        return this.optionalMotionState;
      },

      setMotionState: function( motionState ) {
        this.optionalMotionState = motionState;
        if ( this.optionalMotionState !== null ) {
          motionState.getWorldTransform( this.worldTransform );
        }
      },

      setAngularFactor: function( angFac ) {
        if ( typeof angFac === 'number' ) {
          this.angularFactor.assign( tmpV1.setValue( angFac, angFac, angFac ) );
        } else {
          this.angularFactor.assign( angFac );
        }
      },

      getAngularFactor: function() {
        return this.angularFactor;
      },

      isInWorld: function() {
        return ( this.getBroadphaseProxy() !== 0 );
      },

      checkCollideWithOverride: function( co ) {
        var otherRb = Bump.RigidBody.upcast( co );
        if ( otherRb === null ) {
          return true;
        }

        for ( var i = 0; i < this.constraintRefs.length; ++i ) {
          var c = this.constraintRefs[i];
          if ( c.getRigidBodyA() === otherRb || c.getRigidBodyB() === otherRb ) {
            return false;
          }
        }

        return true;
      },

      addConstraintRef: function( c ) {
        var index = this.constraintRefs.indexOf( c );
        if ( index === -1 ) {
          this.constraintRefs.push( c );
        }

        this.checkCollideWith = true;
      },

      removeConstraintRef: function( c ) {
        //     this.constraintRefs.remove( c );
        var idx = this.constraintRefs.indexOf( c );
        if ( idx !== -1 ) {
          //     var last = this.constraintRefs.pop();
          //     if ( idx < this.constraintRefs.length ) {
          //       this.constraintRefs[ idx ] = last;
          //     }
          this.constraintRefs[ idx ] = this.constraintRefs[ this.constraintRefs.length - 1 ];
          this.constraintRefs.pop();
        }

        this.checkCollideWith = this.constraintRefs.length > 0;
      },

      getConstraintRef: function( index ) {
        return this.constraintRefs[ index ];
      },

      getNumConstraintRefs: function() {
        return this.constraintRefs.length;
      },

      setFlags: function( flags ) {
        this.rigidbodyFlags = flags;
      },

      getFlags: function() {
        return this.rigidbodyFlags;
      },

      getDeltaLinearVelocity: function() {
        return this.deltaLinearVelocity;
      },

      getDeltaAngularVelocity: function() {
        return this.deltaAngularVelocity;
      },

      getPushVelocity: function() {
        return this.pushVelocity;
      },

      getTurnVelocity: function() {
        return this.turnVelocity;
      },

      // ### Internal methods
      //
      // Do not use.

      internalGetDeltaLinearVelocity: function() {
        return this.deltaLinearVelocity;
      },

      internalGetDeltaAngularVelocity: function() {
        return this.deltaAngularVelocity;
      },

      internalGetAngularFactor: function() {
        return this.angularFactor;
      },

      internalGetInvMass: function() {
        return this.invMass;
      },

      internalGetPushVelocity: function() {
        return this.pushVelocity;
      },

      internalGetTurnVelocity: function() {
        return this.turnVelocity;
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      internalGetVelocityInLocalPointObsolete: function( rel_pos, velocity ) {
        velocity.assign(
          this.getLinearVelocity()
            .add( this.deltaLinearVelocity, tmpV2 )
            .add(
              this.getAngularVelocity()
                .add( this.deltaAngularVelocity, tmpV1 )
                .cross( rel_pos, tmpV1 ),
              tmpV1
            )
        );
      },

      internalGetAngularVelocity: function( angVel ) {
        angVel.assign(
          this.getAngularVelocity()
            .add( this.deltaAngularVelocity, tmpV1 )
        );
      },

      // Optimization for the iterative solver—avoid calculating constant terms
      // involving inertia, normal, relative position.
      //
      // Uses the following temporary variables:
      //
      // - `tmpV1`
      internalApplyImpulse: function( linearComponent, angularComponent, impulseMagnitude ) {
        if ( this.inverseMass ) {
          this.deltaLinearVelocity.addSelf(
            linearComponent.multiplyScalar( impulseMagnitude, tmpV1 )
          );
          this.deltaAngularVelocity.addSelf(
            angularComponent
              .multiplyScalar( impulseMagnitude * this.angularFactor, tmpV1 )
          );
        }
      },

      internalApplyPushImpulse: function( linearComponent, angularComponent, impulseMagnitude ) {
        if ( this.inverseMass ) {
          this.pushVelocity.addSelf(
            linearComponent.multiplyScalar( impulseMagnitude, tmpV1 )
          );
          this.turnVelocity.addSelf(
            angularComponent
              .multiplyScalar( impulseMagnitude * this.angularFactor, tmpV1 )
          );
        }
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      internalWritebackVelocity: function( timeStep ) {
        if ( this.inverseMass ) {
          this.setLinearVelocity( this.getLinearVelocity().add( this.deltaLinearVelocity, tmpV1 ) );
          this.setAngularVelocity( this.getAngularVelocity().add( this.deltaAngularVelocity, tmpV1 ) );

          if ( timeStep !== undefined ) {
            // Correct the position/orientation based on push/turn recovery.
            var newTransform = tmpT1;
            Bump.TransformUtil.integrateTransform(
              this.getWorldTransform(),
              this.pushVelocity,
              this.turnVelocity,
              timeStep,
              newTransform
            );
            this.setWorldTransform( newTransform );
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
