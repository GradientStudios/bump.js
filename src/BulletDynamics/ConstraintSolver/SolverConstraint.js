// load: bump.js

// run: LinearMath/Vector3.js

( function( window, Bump ) {

  // **Bump.SolverConstraint** is the port of the Bullet struct
  // `btSolverConstraint`.
  Bump.SolverConstraint = Bump.type({
    init: function SolverConstraint() {
      this.relpos1CrossNormal = Bump.Vector3.create();
      this.contactNormal = Bump.Vector3.create();

      this.relpos2CrossNormal = Bump.Vector3.create();
      // btVector3 contactNormal2; // usually contactNormal2 == -contactNormal

      this.angularComponentA = Bump.Vector3.create();
      this.angularComponentB = Bump.Vector3.create();

      this.appliedPushImpulse = 0;
      this.appliedImpulse = 0;

      this.friction = 0;
      this.jacDiagABInv = 0;

      this.overrideNumSolverIterations = 0;

      this.rhs = 0;
      this.cfm = 0;
      this.lowerLimit = 0;
      this.upperLimit = 0;
      this.rhsPenetration = 0;

      // internal values for unions
      this._union0 = 0;
      this._union1 = 0;
      this._union2 = 0;
      this._union3 = 0;
      this._union4 = 0;
    },

    members: {
      // `setZero` was added for porting situations where `btSolverContact`s are zeroed out using memset
      setZero: function() {
        this.relpos1CrossNormal.setZero();
        this.contactNormal.setZero();
        this.relpos2CrossNormal.setZero();
        this.angularComponentA.setZero();
        this.angularComponentB.setZero();
        this.appliedPushImpulse = 0;
        this.appliedImpulse = 0;
        this.friction = 0;
        this.jacDiagABInv = 0;
        this.rhs = 0;
        this.cfm = 0;
        this.lowerLimit = 0;
        this.upperLimit = 0;
        this.rhsPenetration = 0;
        this._union0 = 0;
        this._union1 = 0;
        this._union2 = 0;
        this._union3 = 0;
        this._union4 = 0;
      }
    },

    typeMembers: {
      SolverConstraintType: Bump.Enum([
        { id: 'BT_SOLVER_CONTACT_1D' },
        { id: 'BT_SOLVER_FRICTION_1D' }
      ])
    },

    properties: {
      numConsecutiveRowsPerKernel: {
        get: function() { return this._union0; },
        set: function( v ) { this._union0 = v; }
      },

      unusedPadding0: {
        get: function() { return this._union0; },
        set: function( v ) { this._union0 = v; }
      },

      frictionIndex: {
        get: function() { return this._union1; },
        set: function( v ) { this._union1 = v; }
      },

      unusedPadding1: {
        get: function() { return this._union1; },
        set: function( v ) { this._union1 = v; }
      },

      solverBodyA: {
        get: function() { return this._union2; },
        set: function( v ) { this._union2 = v; }
      },

      companionIdA: {
        get: function() { return this._union2; },
        set: function( v ) { this._union2 = v; }
      },

      solverBodyB: {
        get: function() { return this._union3; },
        set: function( v ) { this._union3 = v; }
      },

      companionIdB: {
        get: function() { return this._union3; },
        set: function( v ) { this._union3 = v; }
      },

      originalContactPoint: {
        get: function() { return this._union4; },
        set: function( v ) { this._union4 = v; }
      },

      unusedPadding4: {
        get: function() { return this._union4; },
        set: function( v ) { this._union4 = v; }
      }
    }

  });
})( this, this.Bump );
