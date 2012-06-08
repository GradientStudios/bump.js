(function( window, Bump ) {
  Bump.DefaultMotionState = Bump.type({
    parent: Bump.MotionState,

    init: function DefaultMotionState( startTrans, centerOfMassOffset ) {
      this.graphicsWorldTrans =
        startTrans === undefined ?
        Bump.Transform.getIdentity() :
        startTrans.clone();
      this.centerOfMassOffset =
        centerOfMassOffset === undefined ?
        Bump.Transform.getIdentity() :
        centerOfMassOffset.clone();
      this.startWorldTrans =
        startTrans === undefined ?
        Bump.Transform.getIdentity() :
        startTrans.clone();
      this.userPointer = null;
    },

    members: {
      clone: function( dest ) {
        dest = dest || Bump.DefaultMotionState.create();
        this.graphicsWorldTrans.clone( dest.graphicsWorldTrans );
        this.centerOfMassOffset.clone( dest.centerOfMassOffset );
        this.startWorldTrans.clone( dest.startWorldTrans );
        dest.userPointer = this.userPointer;
        return dest;
      },

      getWorldTransform: function( centerOfMassWorldTrans ) {
        centerOfMassWorldTrans = this.centerOfMassOffset
          .inverse( centerOfMassWorldTrans )
          .multiplyTransform( this.graphicsWorldTrans, centerOfMassWorldTrans );
        return this;
      },

      setWorldTransform: function( centerOfMassWorldTrans ) {
        this.graphicsWorldTrans = centerOfMassWorldTrans
          .multiplyTransform( this.centerOfMassOffset, this.graphicsWorldTrans );
        return this;
      }
    }
  });
})( this, this.Bump );
