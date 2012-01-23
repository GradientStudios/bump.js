( function( window, Bump) {

  // *** Bump.SolverConstraint *** is the port of the Bullet struct `btSolverConstraint`.
  Bump.SolverConstraint = Bump.type( {
    init: function SolverConstraint() {
      this.m_relpos1CrossNormal = Bump.Vector3.create();
      this.m_contactNormal = Bump.Vector3.create();

      this.m_relpos2CrossNormal = Bump.Vector3.create();
        //btVector3             m_contactNormal2;//usually m_contactNormal2 == -m_contactNormal

      this.m_angularComponentA = Bump.Vector3.create();
      this.m_angularComponentB = Bump.Vector3.create();

      this.m_appliedPushImpulse = 0;
      this.m_appliedImpulse = 0;

      this.m_friction = 0;
      this.m_jacDiagABInv = 0;

      this.m_rhs = 0;
      this.m_cfm = 0;
      this.m_lowerLimit = 0;
      this.m_upperLimit = 0;
      this.m_rhsPenetration = 0;

      // internal values for unions
      this._union0 = 0;
      this._union1 = 0;
      this._union2 = 0;
      this._union3 = 0;
      this._union4 = 0;
    },

    typeMembers: {
      SolverConstraintType: Bump.Enum( [
        { id: 'BT_SOLVER_CONTACT_1D' },
        { id: 'BT_SOLVER_FRICTION_1D' }
      ] )
    },

    properties: {
      m_numConsecutiveRowsPerKernel: {
        get: function() { return this._union0; },
        set: function( v ) { this._union0 = v; }
      },

      m_unusedPadding0: {
        get: function() { return this._union0; },
        set: function( v ) { this._union0 = v; }
      },

      m_frictionIndex: {
        get: function() { return this._union1; },
        set: function( v ) { this._union1 = v; }
      },

      m_unusedPadding1: {
        get: function() { return this._union1; },
        set: function( v ) { this._union1 = v; }
      },

      m_solverBodyA: {
        get: function() { return this._union2; },
        set: function( v ) { this._union2 = v; }
      },

      m_companionIdA: {
        get: function() { return this._union2; },
        set: function( v ) { this._union2 = v; }
      },

      m_solverBodyB: {
        get: function() { return this._union3; },
        set: function( v ) { this._union3 = v; }
      },

      m_companionIdB: {
        get: function() { return this._union3; },
        set: function( v ) { this._union3 = v; }
      },

      m_originalContactPoint: {
        get: function() { return this._union4; },
        set: function( v ) { this._union4 = v; }
      },

      m_unusedPadding4: {
        get: function() { return this._union4; },
        set: function( v ) { this._union4 = v; }
      }
    }

  } );
} )( this, this.Bump );