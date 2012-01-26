(function( window, Bump ) {
  Bump.MotionState = Bump.type({
    members: {
      getWorldTransform: Bump.abstract,
      setWorldTransform: Bump.abstract
    }
  });
})( this, this.Bump );
