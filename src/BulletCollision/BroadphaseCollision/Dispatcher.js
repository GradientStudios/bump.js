(function( window, Bump ) {

  Bump.DispatcherInfo = Bump.type({
    init: function DispatcherInfo() {
      this.timeStep = 0;
      this.stepCount = 0;
      this.dispatchFunc = Bump.DispatcherInfo.DispatchFunc.DISPATCH_DISCRETE;
      this.timeOfImpact = 1;
      this.useContinuous = true;
      this.debugDraw = null;
      this.enableSatConvex = false;
      this.enableSPU = true;
      this.useEpa = true;
      this.allowedCcdPenetration = 0.04;
      this.useConvexConservativeDistanceUtil = false;
      this.convexConservativeDistanceThreshold = 0;
      this.stackAllocator = null;

      return this;
    },

    members: {
      clone: function( dest ) {
        dest = dest || Bump.DispatcherInfo.create();

        dest.timeStep = this.timeStep;
        dest.stepCount = this.stepCount;
        dest.dispatchFunc = this.dispatchFunc;
        dest.timeOfImpact = this.timeOfImpact;
        dest.useContinuous = this.useContinuous;
        dest.debugDraw = this.debugDraw;
        dest.enableSatConvex = this.enableSatConvex;
        dest.enableSPU = this.enableSPU;
        dest.useEpa = this.useEpa;
        dest.allowedCcdPenetration = this.allowedCcdPenetration;
        dest.useConvexConservativeDistanceUtil = this.useConvexConservativeDistanceUtil;
        dest.convexConservativeDistanceThreshold = this.convexConservativeDistanceThreshold;
        dest.stackAllocator = this.stackAllocator;

        return dest;
      },

      assign: function( other ) {
        this.timeStep = other.timeStep;
        this.stepCount = other.stepCount;
        this.dispatchFunc = other.dispatchFunc;
        this.timeOfImpact = other.timeOfImpact;
        this.useContinuous = other.useContinuous;
        this.debugDraw = other.debugDraw;
        this.enableSatConvex = other.enableSatConvex;
        this.enableSPU = other.enableSPU;
        this.useEpa = other.useEpa;
        this.allowedCcdPenetration = other.allowedCcdPenetration;
        this.useConvexConservativeDistanceUtil = other.useConvexConservativeDistanceUtil;
        this.convexConservativeDistanceThreshold = other.convexConservativeDistanceThreshold;
        this.stackAllocator = other.stackAllocator;

        return this;
      }
    }
  });

  Bump.DispatcherInfo.DispatchFunc = Bump.Enum([
    { id: 'DISPATCH_DISCRETE', value: 1 },
    'DISPATCH_CONTINUOUS'
  ]);

  Bump.Dispatcher = Bump.type({
    members: {
      findAlgorithm: Bump.abstract,
      getNewManifold: Bump.abstract,
      releaseManifold: Bump.abstract,
      clearManifold: Bump.abstract,
      needsCollision: Bump.abstract,
      needsResponse: Bump.abstract,
      dispatchAllCollisionPairs: Bump.abstract,
      getNumManifolds: Bump.abstract,
      getManifoldByIndexInternal: Bump.abstract,
      getInternalManifoldPointer: Bump.abstract,
      getInternalManifoldPool: Bump.abstract,
      allocateCollisionAlgorithm: Bump.abstract,
      freeCollisionAlgorithm: Bump.abstract
    }
  });

})( this, this.Bump );
