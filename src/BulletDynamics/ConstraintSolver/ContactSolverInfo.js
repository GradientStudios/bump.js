// load: bump.js

(function( window, Bump ) {

  Bump.SolverMode = Bump.Enum([
    { id: 'SOLVER_RANDMIZE_ORDER',                                value:   1 },
    { id: 'SOLVER_FRICTION_SEPARATE',                             value:   2 },
    { id: 'SOLVER_USE_WARMSTARTING',                              value:   4 },
    { id: 'SOLVER_USE_FRICTION_WARMSTARTING',                     value:   8 },
    { id: 'SOLVER_USE_2_FRICTION_DIRECTIONS',                     value:  16 },
    { id: 'SOLVER_ENABLE_FRICTION_DIRECTION_CACHING',             value:  32 },
    { id: 'SOLVER_DISABLE_VELOCITY_DEPENDENT_FRICTION_DIRECTION', value:  64 },
    { id: 'SOLVER_CACHE_FRIENDLY',                                value: 128 },
    { id: 'SOLVER_SIMD',                                          value: 256 },
    { id: 'SOLVER_CUDA',                                          value: 512 }
  ]);

  Bump.ContactSolverInfo = Bump.type({
    init: function ContactSolverInfo() {
      this.tau = 0.6;
      this.damping = 1;
      this.friction = 0.3;
      this.timeStep = 0;
      this.restitution = 0;
      this.numIterations = 10;
      this.maxErrorReduction = 20;
      this.sor = 1;
      this.erp = 0.2;
      this.erp2 = 0.1;
      this.globalCfm = 0;
      this.splitImpulse = false;
      this.splitImpulsePenetrationThreshold = -0.02;
      this.linearSlop = 0;
      this.warmstartingFactor = 0.85;

      this.solverMode = Bump.SolverMode.SOLVER_USE_WARMSTARTING | Bump.SolverMode.SOLVER_SIMD;
      this.restingContactRestitutionThreshold = 2;
      this.minimumSolverBatchSize = 128;

      return this;
    },

    members: {
      clone: function( dest ) {
        dest = dest || Bump.ContactSolverInfo.create();

        dest.tau = this.tau;
        dest.damping = this.damping;
        dest.friction = this.friction;
        dest.timeStep = this.timeStep;
        dest.restitution = this.restitution;
        dest.numIterations = this.numIterations;
        dest.maxErrorReduction = this.maxErrorReduction;
        dest.sor = this.sor;
        dest.erp = this.erp;
        dest.erp2 = this.erp2;
        dest.globalCfm = this.globalCfm;
        dest.splitImpulse = this.splitImpulse;
        dest.splitImpulsePenetrationThreshold = this.splitImpulsePenetrationThreshold;
        dest.linearSlop = this.linearSlop;
        dest.warmstartingFactor = this.warmstartingFactor;

        dest.solverMode = this.solverMode;
        dest.restingContactRestitutionThreshold = this.restingContactRestitutionThreshold;
        dest.minimumSolverBatchSize = this.minimumSolverBatchSize;

        return dest;
      },

      assign: function( other ) {
        this.tau = other.tau;
        this.damping = other.damping;
        this.friction = other.friction;
        this.timeStep = other.timeStep;
        this.restitution = other.restitution;
        this.numIterations = other.numIterations;
        this.maxErrorReduction = other.maxErrorReduction;
        this.sor = other.sor;
        this.erp = other.erp;
        this.erp2 = other.erp2;
        this.globalCfm = other.globalCfm;
        this.splitImpulse = other.splitImpulse;
        this.splitImpulsePenetrationThreshold = other.splitImpulsePenetrationThreshold;
        this.linearSlop = other.linearSlop;
        this.warmstartingFactor = other.warmstartingFactor;

        this.solverMode = other.solverMode;
        this.restingContactRestitutionThreshold = other.restingContactRestitutionThreshold;
        this.minimumSolverBatchSize = other.minimumSolverBatchSize;

        return this;
      }
    }
  });

})( this, this.Bump );
