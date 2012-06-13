// load: bump.js

(function( window, Bump ) {
  Bump.MotionState = Bump.type({
    init: function MotionState() {},
    members: {
      getWorldTransform: Bump.abstract,
      setWorldTransform: Bump.abstract
    }
  });
})( this, this.Bump );
