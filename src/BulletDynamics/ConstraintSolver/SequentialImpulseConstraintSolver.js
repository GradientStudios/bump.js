( function( window, Bump) {
  // *** Bump.SequentialImpulseConstraintSolver *** is a port of the bullet
  // class `btSequentialImpulseConstraintSolver`. Original documentation:
  // The btSequentialImpulseConstraintSolver is a fast SIMD implementation of
  // the Projected Gauss Seidel (iterative LCP) method.
  Bump.SequentialImpulseConstraintSolver = Bump.type( {
    parent: Bump.ConstraintSolver,

    init: function SequentialImpulseConstraintSolver() {
      this.m_tmpSolverContactConstraintPool = [];
      this.m_tmpSolverNonContactConstraintPool = [];
      this.m_tmpSolverContactFrictionConstraintPool = [];
      this.m_orderTmpConstraintPool = [];
      this.m_orderFrictionConstraintPool = [];
      this.m_tmpConstraintSizesPool = [];

      ///m_btSeed2 is used for re-arranging the constraint rows. improves convergence/quality of friction
      this.m_btSeed2 = 0; /* unsigned long */
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
      },

      setupContactConstraint: function( solverConstraint,
                                        colObj0,
                                        colObj1,
                                        cp,
                                        infoGlobal,
                                        vel,
                                        rel_vel,
                                        relaxation,
                                        rel_pos1,
                                        rel_pos2 ) {
      },

      setFrictionConstraintImpulse: function( solverConstraint,
                                              rb0,
                                              rb1,
                                              cp,
                                              infoGlobal ) {
      },

      //        void    initSolverBody: function(btSolverBody* solverBody, btCollisionObject* collisionObject);
      restitutionCurve: function( rel_vel, restitution) {
      },

      convertContact: function( manifold, infoGlobal ) {
      },

      resolveSplitPenetrationSIMD: function( body1,
                                             body2,
                                             contactConstraint ) {
      },

      resolveSplitPenetrationImpulseCacheFriendly: function( body1,
                                                             body2,
                                                             contactConstraint ) {
      },

      //internal method
      getOrInitSolverBody: function( body ) {
      },

      resolveSingleConstraintRowGeneric: function( body1,
                                                   body2,
                                                   contactConstraint ) {
      },

      resolveSingleConstraintRowGenericSIMD: function( body1, body2, contactConstraint ) {
      },

      resolveSingleConstraintRowLowerLimit: function( body1, body2, contactConstraint ) {
      },

      resolveSingleConstraintRowLowerLimitSIMD: function( body1, body2, contactConstraint ) {
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
      },

      solveGroup: function( bodies,
                            numBodies,
                            manifold,
                            numManifolds,
                            constraints,
                            numConstraints,
                            info,
                            debugDrawer,
                            stackAlloc,
                            dispatcher ) {
      },

      ///clear internal cached data and reset random seed
      reset: function() {
      },

      btRand2: function() {
      },

      btRandInt2: function( n ) {
      },

      setRandSeed: function( seed ) {
	this.m_btSeed2 = seed;
      },

      getRandSeed: function() {
	return this.m_btSeed2;
      }
    },

    typeMembers: {
      getFixedBody: function() {
      }
    }
  } );

} )( this, this.Bump );