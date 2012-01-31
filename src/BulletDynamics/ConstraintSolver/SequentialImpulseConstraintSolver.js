( function( window, Bump) {
  // *** Bump.SequentialImpulseConstraintSolver *** is a port of the bullet
  // class `btSequentialImpulseConstraintSolver`. Original documentation:
  // The btSequentialImpulseConstraintSolver is a fast SIMD implementation of
  // the Projected Gauss Seidel (iterative LCP) method.

 // globals used by SequentialImpulseConstraintSolver
  var gNumSplitImpulseRecoveries = 0;

  var applyAnisotropicFriction = function( colObj, frictionDirection ) {
    if( colObj && colObj.hasAnisotropicFriction ) {
      // transform to local coordinates
      var loc_lateral = colObj.getWorldTransform().getBasis().vectorMultiply( frictionDirection ),
          friction_scaling = colObj.getAnisotropicFriction();

      //apply anisotropic friction
      loc_lateral.multiplyVectorSelf( friction_scaling );
      // ... and transform it back to global coordinates
      colObj.getWorldTransform().getBasis().multiplyVector( loc_lateral, frictionDirection );
    }
  };

  Bump.SequentialImpulseConstraintSolver = Bump.type( {
    parent: Bump.ConstraintSolver,

    init: function SequentialImpulseConstraintSolver() {
      ///btSeed2 is used for re-arranging the constraint rows. improves convergence/quality of friction
      this.btSeed2 = 0; /* unsigned long */

      this.tmpSolverContactConstraintPool = []; /* Bump.SolverConstraint */
      this.tmpSolverNonContactConstraintPool = []; /* Bump.SolverConstraint */
      this.tmpSolverContactFrictionConstraintPool = []; /* Bump.SolverConstraint */
      this.orderTmpConstraintPool = []; /* int */
      this.orderFrictionConstraintPool = []; /* int */
      this.tmpConstraintSizesPool = []; /* Bump.TypedConstraint.ConstraintInfo1 */
    },

    members: {
      setupFrictionConstraint: function( solverConstraint,
                                         normalAxis,
                                         solverBodyA,
                                         solverBodyIdB,
                                         cp,
                                         rel_pos1,
                                         rel_pos2,
                                         colObj0,
                                         colObj1,
                                         relaxation,
                                         desiredVelocity,
                                         cfmSlip ) {
        desiredVelocity = desiredVelocity || 0;
        cfmSlip = cfmSlip || 0;

        var body0 = Bump.RigidBody.upcast( colObj0 );
        var body1 = Bump.RigidBody.upcast( colObj1 );

        solverConstraint.contactNormal = normalAxis;

        solverConstraint.solverBodyA = body0 ? body0 : this.getFixedBody();
        solverConstraint.solverBodyB = body1 ? body1 : this.getFixedBody();

        solverConstraint.friction = cp.combinedFriction;
        solverConstraint.originalContactPoint = 0;

        solverConstraint.appliedImpulse = 0;
        solverConstraint.appliedPushImpulse = 0;

        var ftorqueAxis1 = rel_pos1.cross( solverConstraint.contactNormal );
        solverConstraint.relpos1CrossNormal = ftorqueAxis1;
        solverConstraint.angularComponentA = body0 ?
          body0.getInvInertiaTensorWorld().multiplyVector( ftorqueAxis1, solverConstraint.angularComponentA )
          .multiplyVector( body0.getAngularFactor(), solverConstraint.angularComponentA ) :
          Bump.Vector3.create();

        ftorqueAxis1 = rel_pos2.cross(-solverConstraint.contactNormal);
        solverConstraint.relpos2CrossNormal = ftorqueAxis1;
        solverConstraint.angularComponentB = body1 ?
          body1.getInvInertiaTensorWorld().multiplyVector( ftorqueAxis1, solverConstraint.angularComponentB )
          .multiplyVector( body1.getAngularFactor(), solverConstraint.angularComponentB ) :
          Bump.Vector3.create();

/* #ifdef COMPUTE_IMPULSE_DENOM
        btScalar denom0 = rb0.computeImpulseDenominator(pos1,solverConstraint.contactNormal);
        btScalar denom1 = rb1.computeImpulseDenominator(pos2,solverConstraint.contactNormal);
#else */
        var vec,
            denom0 = 0,
            denom1 = 0;
        if( body0 ) {
          vec = ( solverConstraint.angularComponentA ).cross( rel_pos1 );
          denom0 = body0.getInvMass() + normalAxis.dot( vec );
        }
        if( body1 ) {
          vec = ( solverConstraint.angularComponentB.negate() ).cross( rel_pos2 );
          denom1 = body1.getInvMass() + normalAxis.dot( vec );
        }
/* #endif //COMPUTE_IMPULSE_DENOM */

        var denom = relaxation / ( denom0 + denom1 );
        solverConstraint.jacDiagABInv = denom;

/* #ifdef _USE_JACOBIAN
        solverConstraint.jac =  btJacobianEntry (
          rel_pos1,rel_pos2,solverConstraint.contactNormal,
          body0.getInvInertiaDiagLocal(),
          body0.getInvMass(),
          body1.getInvInertiaDiagLocal(),
          body1.getInvMass());
#endif //_USE_JACOBIAN */

        var rel_vel,
            vel1Dotn,
           vel2Dotn;

        vel1Dotn =
          solverConstraint.contactNormal.dot(
            body0 ? body0.getLinearVelocity() : Bump.Vector3.create() ) +
          solverConstraint.relpos1CrossNormal.dot(
            body0 ? body0.getAngularVelocity() : Bump.Vector3.create() );

        vel2Dotn =
          -solverConstraint.contactNormal.dot(
            body1 ? body1.getLinearVelocity() : Bump.Vector3.create() ) +
          solverConstraint.relpos2CrossNormal.dot(
            body1 ? body1.getAngularVelocity() : Bump.Vector3.create() );

        rel_vel = vel1Dotn + vel2Dotn;

        //              btScalar positionalError = 0;
        var velocityError =  desiredVelocity - rel_vel,
            velocityImpulse = velocityError * solverConstraint.jacDiagABInv;

        solverConstraint.rhs = velocityImpulse;
        solverConstraint.cfm = cfmSlip;
        solverConstraint.lowerLimit = 0;
        solverConstraint.upperLimit = 1e10;
      },

      addFrictionConstraint: function( normalAxis,
                                       solverBodyA,
                                       solverBodyB,
                                       frictionIndex,
                                       cp,
                                       rel_pos1,
                                       rel_pos2,
                                       colObj0,
                                       colObj1,
                                       relaxation,
                                       desiredVelocity,
                                       cfmSlip ) {
        desiredVelocity = desiredVelocity || 0;
        cfmSlip = cfmSlip || 0;

        var solverConstraint = Bump.SolverConstraint.create();
        this.tmpSolverContactFrictionConstraintPool.push( solverConstraint );
        solverConstraint.frictionIndex = frictionIndex;
        this.setupFrictionConstraint(solverConstraint, normalAxis, solverBodyA,
                                     solverBodyB, cp, rel_pos1, rel_pos2,
                                     colObj0, colObj1, relaxation, desiredVelocity, cfmSlip);
        return solverConstraint;
      },

      // Note: `relaxationRef` and `rel_velRef` arguments are expected to be objects with
      // property `value`, in order to emulate passing in a btScalar by reference.
      setupContactConstraint: function( solverConstraint,
                                        colObj0,
                                        colObj1,
                                        cp,
                                        infoGlobal,
                                        vel,
                                        rel_velRef,
                                        relaxationRef,
                                        rel_pos1,
                                        rel_pos2 ) {
        var rb0 = Bump.RigidBody.upcast(colObj0),
            rb1 = Bump.RigidBody.upcast(colObj1),
            pos1 = cp.getPositionWorldOnA(),
            pos2 = cp.getPositionWorldOnB(),
            torqueAxis0,
            torqueAxis1,
            tmpVec = Bump.Vector3.create(),
            zeroVec = Bump.Vector3.create();

//                      Bump.Vector3 rel_pos1 = pos1 - colObj0->getWorldTransform().getOrigin();
//                      Bump.Vector3 rel_pos2 = pos2 - colObj1->getWorldTransform().getOrigin();
        pos1.subtract( colObj0.getWorldTransform().getOrigin(), rel_pos1 );
        pos2.subtract( colObj1.getWorldTransform().getOrigin(), rel_pos2 );
        relaxationRef.value = 1;

        torqueAxis0 = rel_pos1.cross( cp.normalWorldOnB );
        solverConstraint.angularComponentA.assign(
          rb0 ?
            rb0.getInvInertiaTensorWorld().multiplyVector( torqueAxis0, tmpVec )
            .multiplyVector( rb0.getAngularFactor(), tmpVec ) :
            zeroVec );

        torqueAxis1 = rel_pos2.cross( cp.normalWorldOnB );
        solverConstraint.angularComponentB.assign(
          rb1 ?
            rb1.getInvInertiaTensorWorld().multiplyVector( torqueAxis1.negate( tmpVec ), tmpVec )
            .multiplyVector( rb1.getAngularFactor(), tmpVec ) :
            zeroVec );
/* #ifdef COMPUTE_IMPULSE_DENOM
                                        Bump.Scalar denom0 = rb0.computeImpulseDenominator(pos1,cp.normalWorldOnB);
                                        Bump.Scalar denom1 = rb1.computeImpulseDenominator(pos2,cp.normalWorldOnB);
#else */
        var vec,
        denom0 = 0,
        denom1 = 0;

        if( rb0 ) {
          vec = solverConstraint.angularComponentA.cross( rel_pos1 );
          denom0 = rb0.getInvMass() + cp.normalWorldOnB.dot( vec );
        }
        if (rb1) {
          vec = solverConstraint.angularComponentB.negate( tmpVec ).cross( rel_pos2 );
          denom1 = rb1.getInvMass() + cp.normalWorldOnB.dot( vec );
        }
/* #endif //COMPUTE_IMPULSE_DENOM */

        var denom = relaxationRef.value / ( denom0 + denom1 );
        solverConstraint.jacDiagABInv = denom;

        solverConstraint.contactNormal = cp.normalWorldOnB;
        rel_pos1.cross( cp.normalWorldOnB, solverConstraint.relpos1CrossNormal );
        rel_pos2.cross( cp.normalWorldOnB.negate( tmpVec ), solverConstraint.relpos2CrossNormal );

        var vel1 = rb0 ? rb0.getVelocityInLocalPoint( rel_pos1 ) : Bump.Vector3.create(),
            vel2 = rb1 ? rb1.getVelocityInLocalPoint(rel_pos2) : Bump.Vector3().create();
        vel1.subtract( vel2, vel );
        rel_velRef.value = cp.normalWorldOnB.dot( vel );

        var penetration = cp.getDistance() + infoGlobal.linearSlop;

        solverConstraint.friction = cp.combinedFriction;

        var restitution = 0;
        if( cp.lifeTime > infoGlobal.restingContactRestitutionThreshold ) {
          restitution = 0;
        }
        else {
          restitution = this.restitutionCurve( rel_velRef.value, cp.combinedRestitution );
          if( restitution <= 0 ) {
            restitution = 0;
          }
        }
        ///warm starting (or zero if disabled)
        if( infoGlobal.solverMode & Bump.SolverMode.SOLVER_USE_WARMSTARTING ) {
          solverConstraint.appliedImpulse = cp.appliedImpulse * infoGlobal.warmstartingFactor;
          if( rb0 ) {
            rb0.internalApplyImpulse(
              solverConstraint.contactNormal.multiplyScalar( rb0.getInvMass(), tmpVec )
                .multiplyVector( rb0.getLinearFactor(), tmpVec ),
              solverConstraint.angularComponentA,
              solverConstraint.appliedImpulse );
          }
          if( rb1 ) {
            rb1.internalApplyImpulse(
              solverConstraint.contactNormal.multiplyScalar( rb1.getInvMass(), tmpVec )
                .multiplyVector( rb1.getLinearFactor(), tmpVec ),
              solverConstraint.angularComponentB.negate(),
                -solverConstraint.appliedImpulse );
          }
        }
        else {
          solverConstraint.appliedImpulse = 0;
        }

        solverConstraint.appliedPushImpulse = 0;

        var rel_vel2,  ///renamed to avoid needing a closure
            vel1Dotn,
            vel2Dotn;
        vel1Dotn =
          solverConstraint.contactNormal.dot(
            rb0 ? rb0.getLinearVelocity() : zeroVec ) +
          solverConstraint.relpos1CrossNormal.dot(
            rb0 ? rb0.getAngularVelocity() : zeroVec );
        vel2Dotn =
          -solverConstraint.contactNormal.dot(
            rb1 ? rb1.getLinearVelocity() : zeroVec ) +
          solverConstraint.relpos2CrossNormal.dot(
            rb1 ? rb1.getAngularVelocity() : zeroVec );

        rel_vel2 = vel1Dotn + vel2Dotn;

        var positionalError = 0;
        var velocityError = restitution - rel_vel2; // * damping;

        if( penetration > 0 ) {
          positionalError = 0;
          velocityError -= penetration / infoGlobal.timeStep;
        }
        else {
          positionalError = -penetration * infoGlobal.erp/infoGlobal.timeStep;
        }

        var penetrationImpulse = positionalError * solverConstraint.jacDiagABInv;
        var velocityImpulse = velocityError * solverConstraint.jacDiagABInv;
        if( !infoGlobal.splitImpulse ||
            ( penetration > infoGlobal.splitImpulsePenetrationThreshold ) ) {
          //combine position and velocity into rhs
          solverConstraint.rhs = penetrationImpulse + velocityImpulse;
          solverConstraint.rhsPenetration = 0;
        }
        else {
          //split position and velocity into rhs and rhsPenetration
          solverConstraint.rhs = velocityImpulse;
          solverConstraint.rhsPenetration = penetrationImpulse;
        }

        solverConstraint.cfm = 0;
        solverConstraint.lowerLimit = 0;
        solverConstraint.upperLimit = 1e10;
      },

      setFrictionConstraintImpulse: function( solverConstraint,
                                              rb0,
                                              rb1,
                                              cp,
                                              infoGlobal ) {
        var tmpVec1 = Bump.Vector3.create(),
        tmpVec2 = Bump.Vector3.create(),
        frictionConstraint1,
        frictionConstraint2;

        if( infoGlobal.solverMode & Bump.SolverMode.SOLVER_USE_FRICTION_WARMSTARTING ) {

          frictionConstraint1 = this.tmpSolverContactFrictionConstraintPool[
            solverConstraint.frictionIndex ];
          if( infoGlobal.solverMode & Bump.SolverMode.SOLVER_USE_WARMSTARTING ){
            frictionConstraint1.appliedImpulse =
              cp.appliedImpulseLateral1 * infoGlobal.warmstartingFactor;
            if( rb0 ) {
              rb0.internalApplyImpulse(
                frictionConstraint1.contactNormal.multiplyScalar( rb0.getInvMass(), tmpVec1 )
                  .multiplyVector( rb0.getLinearFactor(), tmpVec1 ),
                frictionConstraint1.angularComponentA,
                frictionConstraint1.appliedImpulse
              );
            }
            if( rb1 ) {
              rb1.internalApplyImpulse(
                frictionConstraint1.contactNormal.multiplyScalar( rb1.getInvMass(), tmpVec1 )
                  .multiplyVector( rb1.getLinearFactor(), tmpVec1 ),
                frictionConstraint1.angularComponentB.negate( tmpVec2 ),
                  -frictionConstraint1.appliedImpulse
              );
            }
          }
          else {
            frictionConstraint1.appliedImpulse = 0;
          }

          if( ( infoGlobal.solverMode & Bump.SolverMode.SOLVER_USE_2_FRICTION_DIRECTIONS ) ) {
            frictionConstraint2 =
              this.tmpSolverContactFrictionConstraintPool[ solverConstraint.frictionIndex + 1 ];
            if (infoGlobal.solverMode & Bump.SolverMode.SOLVER_USE_WARMSTARTING) {
              frictionConstraint2.appliedImpulse =
                cp.appliedImpulseLateral2 * infoGlobal.warmstartingFactor;
              if( rb0 ) {
                rb0.internalApplyImpulse(
                  frictionConstraint2.contactNormal.multiplyScalar( rb0.getInvMass(), tmpVec1 ),
                  frictionConstraint2.angularComponentA,
                  frictionConstraint2.appliedImpulse
                );
              }
              if( rb1 ) {
                rb1.internalApplyImpulse(
                  frictionConstraint2.contactNormal.multiplyScalar( rb1.getInvMass(), tmpVec1 ),
                  frictionConstraint2.angularComponentB.negate( tmpVec2 ),
                    -frictionConstraint2.appliedImpulse
                );
              }
            }
            else {
              frictionConstraint2.appliedImpulse = 0;
            }
          }
        }
        else {
          frictionConstraint1 =
            this.tmpSolverContactFrictionConstraintPool[ solverConstraint.frictionIndex ];
          frictionConstraint1.appliedImpulse = 0;
          if( ( infoGlobal.solverMode & Bump.SolverMode.SOLVER_USE_2_FRICTION_DIRECTIONS ) ) {
            frictionConstraint2 =
              this.tmpSolverContactFrictionConstraintPool[ solverConstraint.frictionIndex + 1 ];
            frictionConstraint2.appliedImpulse = 0;
          }
        }
      },

      //        void    initSolverBody: function(btSolverBody* solverBody, btCollisionObject* collisionObject);
      restitutionCurve: function( rel_vel, restitution) {
        var rest = restitution * -rel_vel;
	return rest;
      },

      convertContact: function( manifold, infoGlobal ) {
        var colObj0 = null, /* btCollisionObject* */
            colObj1 = null; /* btCollisionObject* */

        colObj0 = manifold.getBody0();
        colObj1 = manifold.getBody1();


        var solverBodyA = Bump.RigidBody.upcast( colObj0 ), /* btRigidbody* */
            solverBodyB = Bump.RigidBody.upcast( colObj1 );

        ///avoid collision response between two static objects
        if( ( !solverBodyA || !solverBodyA.getInvMass() ) && ( !solverBodyB || !solverBodyB.getInvMass() ) ) {
          return;
        }

        for( var j = 0 ; j < manifold.getNumContacts(); j++) {
          var cp = manifold.getContactPoint( j ); /* btManifoldPoint& */

          if( cp.getDistance() <= manifold.getContactProcessingThreshold() ) {
            var rel_pos1 = Bump.Vector3.create(), /* btVector3 */
                rel_pos2 = Bump.Vector3.create(), /* btVector3 */
                relaxationRef = { value: 0 }, /* btScalar */
                rel_velRef = { value: 0 }, /* btScalar */
                vel = Bump.Vector3.create(), /* btVector3 */
                frictionIndex = this.tmpSolverContactConstraintPool.length, /* int */
                /* btSolverConstraint& */
                // solverConstraint = this.tmpSolverContactConstraintPool.expandNonInitializing(),
                solverConstraint = Bump.SolverConstraint.create(),
                rb0 = Bump.RigidBody.upcast( colObj0 ), /* btRigidBody* */
                rb1 = Bump.RigidBody.upcast( colObj1 ), /* btRigidBody* */
                tmpVec1 = Bump.Vector3.create();

            this.tmpSolverContactConstraintPool.push( solverConstraint );

            solverConstraint.solverBodyA = rb0 ? rb0 : this.getFixedBody();
            solverConstraint.solverBodyB = rb1 ? rb1 : this.getFixedBody();
            solverConstraint.originalContactPoint = cp;

            this.setupContactConstraint( solverConstraint, colObj0, colObj1, cp, infoGlobal, vel,
                                         rel_velRef, relaxationRef, rel_pos1, rel_pos2);
            var relaxation = relaxationRef.value,
                rel_vel = rel_velRef.value;
            /* const btVector3& pos1 = cp.getPositionWorldOnA(); */
            /* const btVector3& pos2 = cp.getPositionWorldOnB(); */

            /////setup the friction constraints

            solverConstraint.frictionIndex = this.tmpSolverContactFrictionConstraintPool.length;

            if( !( infoGlobal.solverMode & Bump.SolverMode.SOLVER_ENABLE_FRICTION_DIRECTION_CACHING) ||
                !cp.lateralFrictionInitialized) {

              vel.subtract( cp.normalWorldOnB.multiplyScalar( rel_vel, tmpVec1 ), cp.lateralFrictionDir1 );
              var lat_rel_vel = cp.lateralFrictionDir1.length2();
              if( !( infoGlobal.solverMode &
                    Bump.SolverMode.SOLVER_DISABLE_VELOCITY_DEPENDENT_FRICTION_DIRECTION ) &&
                  lat_rel_vel > Bump.SIMD_EPSILON) {

                cp.lateralFrictionDir1.divideScalarSelf( Math.sqrt( lat_rel_vel ) );
                if( ( infoGlobal.solverMode & Bump.SolverMode.SOLVER_USE_2_FRICTION_DIRECTIONS ) ) {
                  cp.lateralFrictionDir1.cross( cp.normalWorldOnB, cp.lateralFrictionDir2 );
                  cp.lateralFrictionDir2.normalize(); //??
                  applyAnisotropicFriction( colObj0, cp.lateralFrictionDir2 );
                  applyAnisotropicFriction( colObj1, cp.lateralFrictionDir2 );
                  this.addFrictionConstraint( cp.lateralFrictionDir2, solverBodyA, solverBodyB,
                                              frictionIndex, cp, rel_pos1, rel_pos2,
                                              colObj0, colObj1, relaxation);
                }

                applyAnisotropicFriction( colObj0, cp.lateralFrictionDir1 );
                applyAnisotropicFriction( colObj1, cp.lateralFrictionDir1 );
                this.addFrictionConstraint( cp.lateralFrictionDir1, solverBodyA, solverBodyB,
                                            frictionIndex, cp, rel_pos1, rel_pos2,
                                            colObj0, colObj1, relaxation );
                cp.lateralFrictionInitialized = true;
              }
              else {
                // re-calculate friction direction every frame, todo: check if this is really needed
                Bump.PlaneSpace1( cp.normalWorldOnB, cp.lateralFrictionDir1, cp.lateralFrictionDir2 );
                if( ( infoGlobal.solverMode & Bump.SolverMode.SOLVER_USE_2_FRICTION_DIRECTIONS ) ) {
                  applyAnisotropicFriction( colObj0, cp.lateralFrictionDir2 );
                  applyAnisotropicFriction( colObj1, cp.lateralFrictionDir2 );
                  this.addFrictionConstraint( cp.lateralFrictionDir2, solverBodyA, solverBodyB,
                                              frictionIndex, cp, rel_pos1, rel_pos2,
                                              colObj0, colObj1, relaxation);
                }

                applyAnisotropicFriction( colObj0, cp.lateralFrictionDir1);
                applyAnisotropicFriction( colObj1, cp.lateralFrictionDir1);
                this.addFrictionConstraint( cp.lateralFrictionDir1, solverBodyA, solverBodyB,
                                            frictionIndex, cp, rel_pos1, rel_pos2,
                                            colObj0, colObj1, relaxation );

                cp.lateralFrictionInitialized = true;
              }

            }
            else {
              this.addFrictionConstraint( cp.lateralFrictionDir1, solverBodyA, solverBodyB,
                                          frictionIndex, cp, rel_pos1, rel_pos2, colObj0, colObj1,
                                          relaxation, cp.contactMotion1, cp.contactCFM1 );
              if( ( infoGlobal.solverMode & Bump.SolverMode.SOLVER_USE_2_FRICTION_DIRECTIONS ) ) {
                this.addFrictionConstraint( cp.lateralFrictionDir2, solverBodyA, solverBodyB,
                                            frictionIndex, cp, rel_pos1, rel_pos2, colObj0, colObj1,
                                            relaxation, cp.contactMotion2, cp.contactCFM2);
              }
            }

            this.setFrictionConstraintImpulse( solverConstraint, rb0, rb1, cp, infoGlobal );

          }
        }
      },

      resolveSplitPenetrationSIMD: function( body1,
                                             body2,
                                             contactConstraint ) {
        this.resolveSplitPenetrationImpulseCacheFriendly( body1, body2, contactConstraint );
      },

      resolveSplitPenetrationImpulseCacheFriendly: function( body1,
                                                             body2,
                                                             contactConstraint ) {
        if( contactConstraint.rhsPenetration ) {
        var deltaImpulse,
            deltaVel1Dotn,
            deltaVel2Dotn;

          gNumSplitImpulseRecoveries++;
          deltaImpulse = contactConstraint.rhsPenetration -
            contactConstraint.appliedPushImpulse * contactConstraint.cfm;
          deltaVel1Dotn = contactConstraint.contactNormal.dot( body1.internalGetPushVelocity() ) +
            contactConstraint.relpos1CrossNormal.dot( body1.internalGetTurnVelocity() );
          deltaVel2Dotn = -contactConstraint.contactNormal.dot( body2.internalGetPushVelocity() ) +
            contactConstraint.relpos2CrossNormal.dot( body2.internalGetTurnVelocity() );

          deltaImpulse -= deltaVel1Dotn * contactConstraint.jacDiagABInv;
          deltaImpulse -= deltaVel2Dotn * contactConstraint.jacDiagABInv;
          var sum = contactConstraint.appliedPushImpulse + deltaImpulse;
          if (sum < contactConstraint.lowerLimit) {
            deltaImpulse = contactConstraint.lowerLimit - contactConstraint.appliedPushImpulse;
            contactConstraint.appliedPushImpulse = contactConstraint.lowerLimit;
          }
          else {
            contactConstraint.appliedPushImpulse = sum;
          }
          body1.internalApplyPushImpulse( contactConstraint.contactNormal * body1.internalGetInvMass(),
                                          contactConstraint.angularComponentA,
                                          deltaImpulse);
          body2.internalApplyPushImpulse( -contactConstraint.contactNormal * body2.internalGetInvMass(),
                                          contactConstraint.angularComponentB,
                                          deltaImpulse);
        }
      },

      //internal method
      getOrInitSolverBody: function( body ) {
        return 0;
      },

      resolveSingleConstraintRowGeneric: function( body1,
                                                   body2,
                                                   contactConstraint ) {
        var deltaImpulse,
            deltaVel1Dotn,
            deltaVel2Dotn;

        deltaImpulse = contactConstraint.rhs -
          contactConstraint.appliedImpulse * contactConstraint.cfm;
        deltaVel1Dotn = contactConstraint.contactNormal.dot( body1.internalGetDeltaLinearVelocity() ) +
          contactConstraint.relpos1CrossNormal.dot( body1.internalGetDeltaAngularVelocity() );
        deltaVel2Dotn = -contactConstraint.contactNormal.dot( body2.internalGetDeltaLinearVelocity() ) +
          contactConstraint.relpos2CrossNormal.dot( body2.internalGetDeltaAngularVelocity() );

        //      const btScalar delta_rel_vel    =       deltaVel1Dotn-deltaVel2Dotn;
        deltaImpulse -= deltaVel1Dotn * contactConstraint.jacDiagABInv;
        deltaImpulse -= deltaVel2Dotn * contactConstraint.jacDiagABInv;

        var sum = contactConstraint.appliedImpulse + deltaImpulse;
        if( sum < contactConstraint.lowerLimit) {
          deltaImpulse = contactConstraint.lowerLimit - contactConstraint.appliedImpulse;
          contactConstraint.appliedImpulse = contactConstraint.lowerLimit;
        }
        else if( sum > contactConstraint.upperLimit) {
          deltaImpulse = contactConstraint.upperLimit - contactConstraint.appliedImpulse;
          contactConstraint.appliedImpulse = contactConstraint.upperLimit;
        }
        else {
          contactConstraint.appliedImpulse = sum;
        }
        body1.internalApplyImpulse( contactConstraint.contactNormal * body1.internalGetInvMass(),
                                    contactConstraint.angularComponentA,
                                    deltaImpulse);
        body2.internalApplyImpulse( -contactConstraint.contactNormal * body2.internalGetInvMass(),
                                    contactConstraint.angularComponentB,
                                    deltaImpulse);

      },

      resolveSingleConstraintRowGenericSIMD: function( body1, body2, contactConstraint ) {
        this.resolveSingleConstraintRowGeneric( body1, body2, contactConstraint );
      },

      resolveSingleConstraintRowLowerLimit: function( body1, body2, contactConstraint ) {
        var deltaImpulse,
            deltaVel1Dotn,
            deltaVel2Dotn;

        deltaImpulse = contactConstraint.rhs -
          contactConstraint.appliedImpulse * contactConstraint.cfm;
        deltaVel1Dotn = contactConstraint.contactNormal.dot( body1.internalGetDeltaLinearVelocity() ) +
          contactConstraint.relpos1CrossNormal.dot( body1.internalGetDeltaAngularVelocity() );
        deltaVel2Dotn = -contactConstraint.contactNormal.dot( body2.internalGetDeltaLinearVelocity() ) +
          contactConstraint.relpos2CrossNormal.dot( body2.internalGetDeltaAngularVelocity() );

        deltaImpulse -= deltaVel1Dotn * contactConstraint.jacDiagABInv;
        deltaImpulse -= deltaVel2Dotn * contactConstraint.jacDiagABInv;
        var sum = contactConstraint.appliedImpulse + deltaImpulse;
        if( sum < contactConstraint.lowerLimit ) {
          deltaImpulse = contactConstraint.lowerLimit - contactConstraint.appliedImpulse;
          contactConstraint.appliedImpulse = contactConstraint.lowerLimit;
        }
        else {
          contactConstraint.appliedImpulse = sum;
        }

        body1.internalApplyImpulse(
          contactConstraint.contactNormal.multiplyVector( body1.internalGetInvMass() ),
          contactConstraint.angularComponentA,
          deltaImpulse
        );
        body2.internalApplyImpulse(
          contactConstraint.contactNormal.negate()
            .multiplyVector( body2.internalGetInvMass() ),
          contactConstraint.angularComponentB,
          deltaImpulse
        );
      },

      resolveSingleConstraintRowLowerLimitSIMD: function( body1, body2, contactConstraint ) {
        this.resolveSingleConstraintRowLowerLimit( body1, body2, contactConstraint );
      },

      solveGroupCacheFriendlySplitImpulseIterations: function( bodies,
                                                               numBodies,
                                                               manifoldPtr,
                                                               numManifolds,
                                                               constras,
                                                               numConstras,
                                                               infoGlobal,
                                                               debugDrawer,
                                                               stackAlloc ) {
        var iteration,
            numPoolConstraints,
            j,
            solveManifold; /* const btSolverConstraint&  */

        if( infoGlobal.splitImpulse ) {
          if( infoGlobal.solverMode & Bump.SolverMode.SOLVER_SIMD ) {
            for( iteration = 0; iteration < infoGlobal.numIterations; iteration++ ) {

              numPoolConstraints = this.tmpSolverContactConstraintPool.length;
              for( j = 0; j < numPoolConstraints; j++ ) {
                solveManifold = this.tmpSolverContactConstraintPool[ this.orderTmpConstraintPool[ j ] ];
                this.resolveSplitPenetrationSIMD( solveManifold.solverBodyA,
                                                  solveManifold.solverBodyB,
                                                  solveManifold);
              }
            }
          }
          else {
            for( iteration = 0; iteration < infoGlobal.numIterations; iteration++ ) {
              numPoolConstraints = this.tmpSolverContactConstraintPool.length;
              for ( j = 0; j < numPoolConstraints; j++ ) {
                solveManifold = this.tmpSolverContactConstraintPool[ this.orderTmpConstraintPool[ j ] ];
                this.resolveSplitPenetrationImpulseCacheFriendly( solveManifold.solverBodyA,
                                                                  solveManifold.solverBodyB,
                                                                  solveManifold);
              }
            }
          }
        }
      },

      solveGroupCacheFriendlyFinish: function( bodies,
                                               numBodies,
                                               manifoldPtr,
                                               numManifolds,
                                               constraints,
                                               numConstraints,
                                               infoGlobal,
                                               debugDrawer,
                                               stackAlloc ) {
        var numPoolConstraints = this.tmpSolverContactConstraintPool.length,
            i,
            j;

        for ( j = 0; j < numPoolConstraints; j++ ) {
          var solveManifold = this.tmpSolverContactConstraintPool[ j ],  /* const btSolverConstraint& */
              pt = solveManifold.originalContactPoint; /* btManifoldPoint* */
          Bump.Assert( pt );
          pt.appliedImpulse = solveManifold.appliedImpulse;
          if( infoGlobal.solverMode & Bump.SolverMode.SOLVER_USE_FRICTION_WARMSTARTING ) {
            pt.appliedImpulseLateral1 =
              this.tmpSolverContactFrictionConstraintPool[ solveManifold.frictionIndex ].appliedImpulse;
            pt.appliedImpulseLateral2 =
              this.tmpSolverContactFrictionConstraintPool[ solveManifold.frictionIndex + 1 ].appliedImpulse;
          }

          ///do a callback here?
        }

        numPoolConstraints = this.tmpSolverNonContactConstraintPool.length;
        for ( j = 0; j < numPoolConstraints; j++ ) {
          var solverConstr = this.tmpSolverNonContactConstraintPool[j], /* const btSolverConstraint& */
              constr = solverConstr.originalContactPoint; /* btTypedConstraint* */
          constr.internalSetAppliedImpulse (solverConstr.appliedImpulse );
          if( Math.abs( solverConstr.appliedImpulse ) >= constr.getBreakingImpulseThreshold() ) {
            constr.setEnabled(false);
          }
        }

        var body; /* btRigidBody* */
        if( infoGlobal.splitImpulse ) {
          for( i = 0; i < numBodies; i++ ) {
            body = Bump.RigidBody.upcast( bodies[ i ] ); /* btRigidBody* */
            if (body) {
              body.internalWritebackVelocity( infoGlobal.timeStep );
            }
          }
        }
        else {
          for ( i = 0; i < numBodies; i++ ) {
            body = Bump.RigidBody.upcast( bodies[ i ] );
            if( body ) {
              body.internalWritebackVelocity();
            }
          }
        }

        /* not sure if splice( 0 ) is the best thing to do here */
        Bump.resize( this.tmpSolverContactConstraintPool, 0 );
        Bump.resize( this.tmpSolverNonContactConstraintPool, 0 );
        Bump.resize( this.tmpSolverContactFrictionConstraintPool, 0 );

        return 0;
      },

      solveSingleIteration: function( iteration,
                                      bodies,
                                      numBodies,
                                      manifoldPtr,
                                      numManifolds,
                                      constraints,
                                      numConstraints,
                                      infoGlobal,
                                      debugDrawer,
                                      stackAlloc ) {
        var numConstraintPool = this.tmpSolverContactConstraintPool.length,
            numFrictionPool = this.tmpSolverContactFrictionConstraintPool.length;

        var j,
            tmp,
            swapi,
            numPoolConstraints,
            totalImpulse, /* btScalar */
            constraint, /* btSolverConstraint& */
            solveManifold; /* const btSolverConstraint& */

        if( infoGlobal.solverMode & Bump.SolverMode.SOLVER_RANDMIZE_ORDER ) {
          if( ( iteration & 7) === 0) {
            for( j = 0; j < numConstraintPool; ++j ) {
              tmp = this.orderTmpConstraintPool[ j ];
              swapi = this.randInt2( j + 1 );
              this.orderTmpConstraintPool[ j ] = this.orderTmpConstraintPool[ swapi ];
              this.orderTmpConstraintPool[ swapi ] = tmp;
            }

            for ( j = 0; j < numFrictionPool; ++j ) {
              tmp = this.orderFrictionConstraintPool[ j ];
              swapi = this.randInt2( j + 1 );
              this.orderFrictionConstraintPool[ j ] = this.orderFrictionConstraintPool [swapi ];
              this.orderFrictionConstraintPool[ swapi ] = tmp;
            }
          }
        }

        if( infoGlobal.solverMode & Bump.SolverMode.SOLVER_SIMD ) {
          ///solve all joint constraints, using SIMD, if available
          for( j = 0; j < this.tmpSolverNonContactConstraintPool.length; j++ ) {
            constraint = this.tmpSolverNonContactConstraintPool[ j ]; /* btSolverConstraint& */
            this.resolveSingleConstraintRowGenericSIMD( constraint.solverBodyA, constraint.solverBodyB, constraint);
          }

          for( j = 0; j < numConstraints; j++ ) {
            constraints[ j ].solveConstraintObsolete( constraints[ j ].getRigidBodyA(),
                                                      constraints[j].getRigidBodyB(),
                                                      infoGlobal.timeStep );
          }

          ///solve all contact constraints using SIMD, if available
          numPoolConstraints = this.tmpSolverContactConstraintPool.length;
          for( j = 0; j < numPoolConstraints; j++ ) {
            /* const btSolverConstraint& */
            solveManifold = this.tmpSolverContactConstraintPool[ this.orderTmpConstraintPool[ j ] ];
            this.resolveSingleConstraintRowLowerLimitSIMD( solveManifold.solverBodyA,
                                                           solveManifold.solverBodyB,
                                                           solveManifold );
          }
          ///solve all friction constraints, using SIMD, if available
          numFrictionPoolConstraints = this.tmpSolverContactFrictionConstraintPool.length;
          for ( j = 0; j < numFrictionPoolConstraints; j++ ) {
            /* btSolverConstraint& */
            solveManifold = this.tmpSolverContactFrictionConstraintPool[ this.orderFrictionConstraintPool[ j ] ];
            totalImpulse = this.tmpSolverContactConstraintPool[ solveManifold.frictionIndex ].appliedImpulse;

            if( totalImpulse > 0 ) {
              solveManifold.lowerLimit = -(solveManifold.friction * totalImpulse);
              solveManifold.upperLimit = solveManifold.friction * totalImpulse;

              this.resolveSingleConstraintRowGenericSIMD( solveManifold.solverBodyA,
                                                          solveManifold.solverBodyB,
                                                          solveManifold);
            }
          }
        }
        else {
          ///solve all joint constraints
          for( j = 0; j < this.tmpSolverNonContactConstraintPool.length; j++ ) {
            constraint = this.tmpSolverNonContactConstraintPool[ j ]; /* btSolverConstraint&  */
            this.resolveSingleConstraintRowGeneric( constraint.solverBodyA, constraint.solverBodyB, constraint);
          }
          for( j = 0; j < numConstraints; j++ ) {
            constraints[j].solveConstraintObsolete( constraints[j].getRigidBodyA(),
                                                    constraints[j].getRigidBodyB(),
                                                    infoGlobal.timeStep );
          }
                ///solve all contact constraints
          numPoolConstraints = this.tmpSolverContactConstraintPool.length;
          for( j = 0; j < numPoolConstraints; j++ ) {
            /* const btSolverConstraint& */
            solveManifold = this.tmpSolverContactConstraintPool[ this.orderTmpConstraintPool[ j ] ];
            this.resolveSingleConstraintRowLowerLimit( solveManifold.solverBodyA,
                                                       solveManifold.solverBodyB,
                                                       solveManifold );
          }
          ///solve all friction constraints
          var numFrictionPoolConstraints = this.tmpSolverContactFrictionConstraintPool.length;
          for( j = 0; j < numFrictionPoolConstraints; j++ ) {
            /* btSolverConstraint& */
            solveManifold = this.tmpSolverContactFrictionConstraintPool[ this.orderFrictionConstraintPool[ j ] ];
            totalImpulse = this.tmpSolverContactConstraintPool[ solveManifold.frictionIndex ].appliedImpulse;

            if( totalImpulse > 0 ) {
              solveManifold.lowerLimit = -( solveManifold.friction * totalImpulse );
              solveManifold.upperLimit = solveManifold.friction * totalImpulse;

              this.resolveSingleConstraintRowGeneric( solveManifold.solverBodyA,
                                                      solveManifold.solverBodyB,
                                                      solveManifold);
            }
          }
        }
        return 0;

      },

      solveGroupCacheFriendlySetup: function( bodies,
                                              numBodies,
                                              manifoldPtr,
                                              numManifolds,
                                              constraints,
                                              numConstraints,
                                              infoGlobal,
                                              debugDrawer,
                                              stackAlloc ) {
        /*
        BT_PROFILE("solveGroupCacheFriendlySetup");
        (void)stackAlloc;
        (void)debugDrawer;
        */

        if( ( numConstraints + numManifolds ) === 0 ) {
          //              printf("empty\n");
          return 0;
        }

        var body,  /* btRigidBody* */
            i;

        if( infoGlobal.splitImpulse ) {
          for( i = 0; i < numBodies; i++) {
            body = Bump.RigidBody.upcast(bodies[i]);
            if( body ) {
              body.internalGetDeltaLinearVelocity().setZero();
              body.internalGetDeltaAngularVelocity().setZero();
              body.internalGetPushVelocity().setZero();
              body.internalGetTurnVelocity().setZero();
            }
          }
        }
        else {
          for( i = 0; i < numBodies; i++ ) {
            body = Bump.RigidBody.upcast( bodies[ i ] );
            if( body ) {
              body.internalGetDeltaLinearVelocity().setZero();
              body.internalGetDeltaAngularVelocity().setZero();
            }
          }
        }

        var j,
            constraint; /* btTypedConstraint* */
        for( j = 0; j < numConstraints; j++ ) {
          constraint = constraints[ j ]; /* btTypedConstraint* */
          constraint.buildJacobian();
          constraint.internalSetAppliedImpulse( 0.0 );
        }
        var rb0 = null, /* btRigidBody* */
            rb1 = null, /* btRigidBody* */
            info1; /* Bump.TypedConstraint.ConstraintInfo1& */

        var totalNumRows = 0;

        /* necessary ? */
        Bump.resize( this.tmpConstraintSizesPool, numConstraints, Bump.TypedConstraint.create() );

        //calculate the total number of contraint rows
        for( i = 0 ; i < numConstraints; i++ ) {
          info1 = this.tmpConstraintSizesPool[ i ];
          if( constraints[ i ].isEnabled() ) {
            constraints[ i ].getInfo1( info1 );
          }
          else {
            info1.numConstraintRows = 0;
            info1.nub = 0;
          }
          totalNumRows += info1.numConstraintRows;
        }
        Bump.resize( this.tmpSolverNonContactConstraintPool, totalNumRows, Bump.SolverConstraint.create() );

        ///setup the btSolverConstraints
        var currentRow = 0;

        for ( i = 0; i < numConstraints; i++ ) {
          info1 = this.tmpConstraintSizesPool[ i ]; /* const btTypedConstraint::btConstraintInfo1& */

          if( info1.numConstraintRows ) {
            Bump.Assert( currentRow < totalNumRows );
            /* btSolverConstraint* */
            var currentConstraintRow = this.tmpSolverNonContactConstraintPool[ currentRow ];
            constraint = constraints[ i ]; /* btTypedConstraint* */

            var rbA = constraint.getRigidBodyA(), /* btRigidBody& */
                rbB = constraint.getRigidBodyB(); /* btRigidBody& */

            for ( j = 0; j < info1.numConstraintRows; j++ ) {
              currentConstraintRow[ j ].setZero(); /* replacement for memset */
              currentConstraintRow[ j ].lowerLimit = -Bump.SIMD_INFINITY;
              currentConstraintRow[ j ].upperLimit = Bump.SIMD_INFINITY;
              currentConstraintRow[ j ].appliedImpulse = 0;
              currentConstraintRow[ j ].appliedPushImpulse = 0;
              currentConstraintRow[ j ].solverBodyA = rbA;
              currentConstraintRow[ j ].solverBodyB = rbB;
            }

            rbA.internalGetDeltaLinearVelocity().setValue( 0, 0, 0 );
            rbA.internalGetDeltaAngularVelocity().setValue( 0, 0, 0 );
            rbB.internalGetDeltaLinearVelocity().setValue( 0, 0, 0 );
            rbB.internalGetDeltaAngularVelocity().setValue( 0, 0, 0 );

            var info2 = Bump.TypedConstraint.ConstraintInfo2.create();
            info2.fps = 1 / infoGlobal.timeStep;
            info2.erp = infoGlobal.erp;
            info2.J1linearAxis = currentConstraintRow.contactNormal;
            info2.J1angularAxis = currentConstraintRow.relpos1CrossNormal;
            info2.J2linearAxis = 0;
            info2.J2angularAxis = currentConstraintRow.relpos2CrossNormal;
            // TODO: figure out what to do about this
            /* info2.rowskip = sizeof(btSolverConstraint)/sizeof(btScalar); */ //check this
            info2.rowskip = 38; /* for now, this is the "correct" number, but what its used for
                                   is probably not JavaScript-friendly */
            ///the size of btSolverConstraint needs be a multiple of btScalar
            /* btAssert(info2.rowskip*sizeof(btScalar)== sizeof(btSolverConstraint)); */
            info2.constraintError = currentConstraintRow.rhs;
            currentConstraintRow.cfm = infoGlobal.globalCfm;
            info2.damping = infoGlobal.damping;
            info2.cfm = currentConstraintRow.cfm;
            info2.lowerLimit = currentConstraintRow.lowerLimit;
            info2.upperLimit = currentConstraintRow.upperLimit;
            info2.numIterations = infoGlobal.numIterations;
            constraints[ i ].getInfo2( info2 );

            ///finalize the constraint setup
            for ( j = 0; j < info1.numConstraintRows; j++ ) {
              var solverConstraint = currentConstraintRow[ j ]; /* btSolverConstraint& */

              if( solverConstraint.upperLimit >= constraints[ i ].getBreakingImpulseThreshold() ) {
                solverConstraint.upperLimit = constraints[ i ].getBreakingImpulseThreshold();
              }

              if( solverConstraint.lowerLimit <= -constraints[ i ].getBreakingImpulseThreshold() ) {
                solverConstraint.lowerLimit = -constraints[i].getBreakingImpulseThreshold();
              }

              solverConstraint.originalContactPoint = constraint;

              var ftorqueAxis1 = solverConstraint.relpos1CrossNormal; /* const btVector3&  */
              solverConstraint.angularComponentA.assign(
                constraint.getRigidBodyA().getInvInertiaTensorWorld()
                  .multiplyVector( ftorqueAxis1 )
                  .multiplyVector( constraint.getRigidBodyA().getAngularFactor() )
              );
              var ftorqueAxis2 = solverConstraint.relpos2CrossNormal; /* const btVector3& */
              solverConstraint.angularComponentB.assign(
                constraint.getRigidBodyB().getInvInertiaTensorWorld()
                  .multiplyVector( ftorqueAxis2 )
                  .multiplyVector( constraint.getRigidBodyB().getAngularFactor() )
              );

              /* btVector3 */
              var iMJlA = solverConstraint.contactNormal.multiplyScalar( rbA.getInvMass() ),
              iMJaA = rbA.getInvInertiaTensorWorld().multiplyVector( solverConstraint.relpos1CrossNormal ),
              iMJlB = solverConstraint.contactNormal.multiplyScalar( rbB.getInvMass() ), //sign of normal?
              iMJaB = rbB.getInvInertiaTensorWorld().multiplyVector( solverConstraint.relpos2CrossNormal ),
              sum = iMJlA.dot( solverConstraint.contactNormal); /* btScalar */

              sum += iMJaA.dot( solverConstraint.relpos1CrossNormal );
              sum += iMJlB.dot( solverConstraint.contactNormal );
              sum += iMJaB.dot( solverConstraint.relpos2CrossNormal );

              solverConstraint.jacDiagABInv = 1 / sum;

              ///fix rhs
              ///todo: add force/torque accelerators
              var rel_vel,
                  vel1Dotn,
                  vel2Dotn;

              vel1Dotn = solverConstraint.contactNormal.dot( rbA.getLinearVelocity() ) +
                solverConstraint.relpos1CrossNormal.dot( rbA.getAngularVelocity() );
              vel2Dotn = -solverConstraint.contactNormal.dot( rbB.getLinearVelocity() ) +
                solverConstraint.relpos2CrossNormal.dot( rbB.getAngularVelocity() );

              rel_vel = vel1Dotn + vel2Dotn;

              var restitution = 0,
                  positionalError = solverConstraint.rhs, //already filled in by getConstraintInfo2
                  velocityError = restitution - rel_vel * info2.damping,
                  penetrationImpulse = positionalError*solverConstraint.jacDiagABInv,
                  velocityImpulse = velocityError *solverConstraint.jacDiagABInv;

              solverConstraint.rhs = penetrationImpulse + velocityImpulse;
              solverConstraint.appliedImpulse = 0;
            }
          }
          currentRow += this.tmpConstraintSizesPool[ i ].numConstraintRows;
        }


        var manifold = null; /* btPersistentManifold* */
        //                      btCollisionObject* colObj0=0,*colObj1=0;

        for ( i = 0; i < numManifolds; i++ ) {
          manifold = manifoldPtr[ i ];
          this.convertContact( manifold, infoGlobal );
        }

        var info = infoGlobal, /* btContactSolverInfo */
            numConstraintPool = this.tmpSolverContactConstraintPool.length,
            numFrictionPool = this.tmpSolverContactFrictionConstraintPool.length;

        ///@todo: use stack allocator for such temporarily memory, same for solver bodies/constraints
        Bump.resize( this.orderTmpConstraintPool, numConstraintPool, 0 ); /* needed? */
        Bump.resize( this.orderFrictionConstraintPool, numFrictionPool, 0 ); /* needed? */

        for ( i = 0; i < numConstraintPool; i++ ) {
          this.orderTmpConstraintPool[i] = i;
        }
        for ( i = 0 ; i < numFrictionPool; i++ ) {
          this.orderFrictionConstraintPool[i] = i;
        }

        return 0;
      },

      solveGroupCacheFriendlyIterations: function( bodies,
                                                   numBodies,
                                                   manifoldPtr,
                                                   numManifolds,
                                                   constraints,
                                                   numConstraints,
                                                   infoGlobal,
                                                   debugDrawer,
                                                   stackAlloc ) {
	/* BT_PROFILE("solveGroupCacheFriendlyIterations"); */
        /// should traverse the contacts random order...
        var iteration;
        this.solveGroupCacheFriendlySplitImpulseIterations( bodies, numBodies, manifoldPtr, numManifolds,
                                                            constraints, numConstraints, infoGlobal,
                                                            debugDrawer, stackAlloc);
        for ( iteration = 0; iteration < infoGlobal.numIterations; iteration++ ) {
          this.solveSingleIteration( iteration, bodies, numBodies, manifoldPtr, numManifolds, constraints,
                                     numConstraints,infoGlobal,debugDrawer,stackAlloc);
        }
        return 0;
      },

      solveGroup: function( bodies,
                            numBodies,
                            manifoldPtr,
                            numManifolds,
                            constraints,
                            numConstraints,
                            infoGlobal,
                            debugDrawer,
                            stackAlloc,
                            dispatcher ) {
        /* BT_PROFILE("solveGroup"); */
        // You need to provide at least some bodies.
        Bump.Assert( bodies );
        Bump.Assert( numBodies );

        this.solveGroupCacheFriendlySetup( bodies, numBodies, manifoldPtr, numManifolds, constraints,
                                           numConstraints, infoGlobal, debugDrawer, stackAlloc );
        this.solveGroupCacheFriendlyIterations( bodies, numBodies, manifoldPtr, numManifolds, constraints,
                                                numConstraints, infoGlobal, debugDrawer, stackAlloc );
        this.solveGroupCacheFriendlyFinish( bodies, numBodies, manifoldPtr, numManifolds, constraints,
                                            numConstraints, infoGlobal, debugDrawer, stackAlloc );
        return 0;
      },

      // Clear internal cached data and reset random seed.
      reset: function() {
        this.btSeed2 = 0;
      },

      rand2: function() {
        this.btSeed2 = (1664525 * this.btSeed2 + 1013904223 ) & 0xffffffff;
	return this.btSeed2;
      },

      /* Red flags here... this probably does not evaluate to the same as the original C++ */
      randInt2: function( n ) {
        // seems good; xor-fold and modulus
        var un = n << 0,
            r = this.rand2();

        // note: probably more aggressive than it needs to be -- might be
        //       able to get away without one or two of the innermost branches.
        if( un <= 0x00010000 ) {
          r ^= (r >> 16 );
          if( un <= 0x00000100 ) {
            r ^= (r >> 8);
            if( un <= 0x00000010 ) {
              r ^= (r >> 4);
              if( un <= 0x00000004 ) {
                r ^= (r >> 2);
                if( un <= 0x00000002 ) {
                  r ^= (r >> 1);
                }
              }
            }
          }
        }

        return (r % un) << 0;
      },

      setRandSeed: function( seed ) {
	this.btSeed2 = seed;
      },

      getRandSeed: function() {
	return this.btSeed2;
      }
    },

    typeMembers: {
      s_fixed: null,

      getFixedBody: function() {
        var s_fixed = Bump.SequentialImpulseConstraintSolver.s_fixed ||
          Bump.RigidBody.create();
        s_fixed.setMassProps( 0, Bump.Vector3.create() );
        return s_fixed;
      }
    }
  } );

} )( this, this.Bump );
