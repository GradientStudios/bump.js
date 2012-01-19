(function( window, Bump ) {
  Bump.MotionState = Bump.type({
    members: {
      getWorldTransform: Bump.abstract,
      setWorldPosition: Bump.abstract
    }
  });
})( this, this.Bump );
