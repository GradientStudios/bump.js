(function( window, Bump ) {
  Bump.ConvexCast = Bump.type({
    init: function ConvexCast() {},

    members: {
      destruct: Bump.noop,
      calcTimeOfImpact: Bump.abstract
    }
  });

  Bump.ConvexCast.CastResult = Bump.type({

    init: function CastResult() {
      this.fraction = Infinity;
      this.allowedPenetration = 0;

      this.hitTransformA = Bump.Transform.create();
      this.hitTransformB = Bump.Transform.create();
      this.normal = Bump.Vector3.create();
      this.hitPoint = Bump.Vector3.create();
      // btIDebugDraw* this.debugDrawer;
    },

    members: {
      // DebugDraw: function( fraction) {},
      // drawCoordSystem: function( trans ) {},
      reportFailure: Bump.noop,
      destruct: Bump.noop
    }
  });

})( this, this.Bump );
