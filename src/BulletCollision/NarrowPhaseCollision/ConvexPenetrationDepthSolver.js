// load: bump.js

(function( window, Bump ) {

  Bump.ConvexPenetrationDepthSolver = Bump.type({
    init: function ConvexPenetrationDepthSolver() {},
    members: {
      destruct: Bump.noop,
      calcPenDepth: Bump.abstract
    }
  });

})( this, this.Bump );
