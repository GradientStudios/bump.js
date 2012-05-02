(function( window, Bump ) {

  Bump.ConvexConvexAlgorithm = Bump.type({
    parent: Bump.ActivatingCollisionAlgorithm,

    init: function ConvexConvexAlgorithm( mf, ci, body0, body1, simplexSolver, pdSolver, numPerturbationIterations, minimumPointsPerturbationThreshold ) {
      this._super( ci, body0, body1 );

      // Initializer list
      this.simplexSolver = simplexSolver;
      this.pdSolver = pdSolver;
      this.ownManifold = false;
      this.manifoldPtr = mf;
      this.lowLevelOfDetail = false;
      this.numPerturbationIterations = numPerturbationIterations;
      this.minimumPointsPerturbationThreshold = minimumPointsPerturbationThreshold;
      // End initializer list
    },

    members: {
      destruct: function() {
        if ( this.ownManifold ) {
          if ( this.manifoldPtr !== null ) {
            this.dispatcher.releaseManifold( this.manifoldPtr );
          }
        }

        this._super();
      },

      processCollision: Bump.notImplemented,
      calculateTimeOfImpact: Bump.notImplemented,
      getAllContactManifolds: Bump.notImplemented,
      setLowLevelOfDetail: Bump.notImplemented,

      getManifold: function() {
        return this.manifoldPtr;
      }

    },

    typeMembers: {
      CreateFunc: Bump.type({
        parent: Bump.CollisionAlgorithmCreateFunc,

        init: function CreateFunc( simplexSolver, pdSolver ) {
          this.numPerturbationIterations = 0;
          this.minimumPointsPerturbationThreshold = 3;
          this.simplexSolver = simplexSolver;
          this.pdSolver = pdSolver;
        },

        members: {
          CreateCollisionAlgorithm: function( ci, body0, body1 ) {
            return Bump.ConvexConvexAlgorithm.create(
              ci.manifold,
              ci,
              body0, body1,
              this.simplexSolver, this.pdSolver,
              this.numPerturbationIterations,
              this.minimumPointsPerturbationThreshold
            );
          }
        }
      })

    }
  });

})( this, this.Bump );
