(function( window, Bump ) {

  // btContactConstraint can be automatically created to solve contact
  // constraints using the unified btTypedConstraint interface
  Bump.ContactConstraint = Bump.type({
    parent: Bump.TypedConstraint,

    init: function ContactConstraint(
      contactManifold,          // btPersistentManifold*
      rbA,                      // btRigidBody&
      rbB                       // btRigidBody&
    ) {
      this._super( Bump.TypedConstraintType.CONTACT_CONSTRAINT_TYPE, rbA, rbB );
      this.contactManifold = contactManifold.clone(); // btPersistentManifold
    },

    members: {
      setContactManifold: function( contactManifold ) {
        this.contactManifold = contactManifold.clone();
      },

      getContactManifold: function() {
        return this.contactManifold;
      },

      // virtual ~btContactConstraint();

      getInfo1: Bump.noop,
      getInfo2: Bump.noop,

      // obsolete methods
      buildJacobian: Bump.noop
    }
  });

  // very basic collision resolution without friction
  Bump.resolveSingleCollision = function (
    body1,                      // btRigidBody*
    colObj2,                    // class btCollisionObject*
    contactPositionWorld,       // const btVector3&
    contactNormalOnB,           // const btVector3&
    solverInfo,                 // const struct btContactSolverInfo&
    distance                    // btScalar
  ) {
    var body2 = colObj2;
    var normal = contactNormalOnB;
    var rel_pos1 = contactPositionWorld.subtract( body1.getWorldTransform().getOrigin() );
    var rel_pos2 = contactPositionWorld.subtract( colObj2.getWorldTransform().getOrigin() );

    var vel1 = body1.getVelocityInLocalPoint( rel_pos1 );
    var vel2 = body2 ? body2.getVelocityInLocalPoint( rel_pos2 ) : Bump.Vector3.create( 0, 0, 0 );
    var vel = vel1.subtract( vel2 );
    var rel_vel = normal.dot( vel );

    var combinedRestitution = body1.getRestitution() * colObj2.getRestitution();
    var restitution = combinedRestitution * -rel_vel;

    var positionalError = solverInfo.erp * -distance /solverInfo.timeStep;
    var velocityError = -( 1.0 + restitution ) * rel_vel; // * damping;
    var denom0 = body1.computeImpulseDenominator( contactPositionWorld, normal );
    var denom1 = body2 ? body2.computeImpulseDenominator( contactPositionWorld, normal ) : 0.0;
    var relaxation = 1.0;
    var jacDiagABInv = relaxation / ( denom0 + denom1 );

    var penetrationImpulse = positionalError * jacDiagABInv;
    var velocityImpulse = velocityError * jacDiagABInv;

    var normalImpulse = penetrationImpulse + velocityImpulse;
    normalImpulse = 0.0 > normalImpulse ? 0.0 : normalImpulse;

    body1.applyImpulse( normal * normalImpulse, rel_pos1 );
    if ( body2 ) {
      body2.applyImpulse( -normal * normalImpulse, rel_pos2 );
    }
    return normalImpulse;
  };


  // resolveSingleBilateral is an obsolete methods used for vehicle friction between two dynamic objects
  Bump.resolveSingleBilateral = function (
    body1,                      // btRigidBody&
    pos1,                       // const btVector3&
    body2,                      // btRigidBody&
    pos2,                       // const btVector3&
    distance,                   // btScalar
    normal,                     // const btVector3&
    impulseRef,                 // btScalar&
    timeStep                    // btScalar
  ) {

    var normalLenSqr = normal.length2();
    Bump.Assert( Math.abs( normalLenSqr ) < 1.1 );

    if ( normalLenSqr > 1.1 ) {
      impulseRef.value = 0;
      return impulseRef.value;
    }

    var rel_pos1 = pos1.subtract( body1.getCenterOfMassPosition() );
    var rel_pos2 = pos2.subtract( body2.getCenterOfMassPosition() );

    // this jacobian entry could be re-used for all iterations

    var vel1 = body1.getVelocityInLocalPoint( rel_pos1 );
    var vel2 = body2.getVelocityInLocalPoint( rel_pos2 );
    var vel = vel1.subtract( vel2 );

    var jac = Bump.JacobianEntry.create(
      body1.getCenterOfMassTransform().getBasis().transpose(),
      body2.getCenterOfMassTransform().getBasis().transpose(),
      rel_pos1,
      rel_pos2,
      normal,
      body1.getInvInertiaDiagLocal(),
      body1.getInvMass(),
      body2.getInvInertiaDiagLocal(),
      body2.getInvMass()
    );

    var jacDiagAB = jac.getDiagonal();
    var jacDiagABInv = 1.0 / jacDiagAB;

    var rel_vel = jac.getRelativeVelocity(
      body1.getLinearVelocity(),
      body1.getCenterOfMassTransform().getBasis().transpose()
        .multiplyVector( body1.getAngularVelocity() ),
      body2.getLinearVelocity(),
      body2.getCenterOfMassTransform().getBasis().transpose()
        .multiplyVector( body2.getAngularVelocity() )
    );

    var a = jacDiagABInv;

    rel_vel = normal.dot( vel );

    // todo: move this into proper structure
    var contactDamping = 0.2;

// #ifdef ONLY_USE_LINEAR_MASS
//     var massTerm = 1.0 / ( body1.getInvMass() + body2.getInvMass() );
//     impulseRef.value = -contactDamping * rel_vel * massTerm;
// #else
    var velocityImpulse = -contactDamping * rel_vel * jacDiagABInv;
    impulseRef.value = velocityImpulse;
// #endif

    return impulseRef.value;
  };

})( this, this.Bump );
