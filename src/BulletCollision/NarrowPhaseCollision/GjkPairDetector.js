(function( window, Bump ) {

  Bump.GjkPairDetector = Bump.type({
    parent: Bump.DiscreteCollisionDetectorInterface,

    init: function GjkPairDetector() {
      this._super();
    },

    members: {
      getClosestPoints: Bump.notImplemented,
      getClosestPointsNonVirtual: Bump.notImplemented,

      setMinkowskiA: function( minkA ) {
        this.minkowskiA = minkA;
      },

      setMinkowskiB: function( minkB ) {
        this.minkowskiB = minkB;
      },

      setCachedSeperatingAxis: function( seperatingAxis ) {
        this.cachedSeparatingAxis.assign( seperatingAxis );
      },

      getCachedSeparatingAxis: function() {
        return this.cachedSeparatingAxis;
      },

      setPenetrationDepthSolver: function( penetrationDepthSolver ) {
        this.penetrationDepthSolver = penetrationDepthSolver;
      },

      setIgnoreMargin: function( ignoreMargin ) {
        this.ignoreMargin = ignoreMargin;
      }

    },

    typeMembers: {
      ClosestPointInput: Bump.DiscreteCollisionDetectorInterface.ClosestPointInput,
      Result: Bump.DiscreteCollisionDetectorInterface.Result
    }
  });

})( this, this.Bump );
