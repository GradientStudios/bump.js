(function( window, Bump ) {

  Bump.ActionInterface = Bump.type({
    init: function ActionInterface() {},

    members: {
      destruct: Bump.noop,
      updateAction: Bump.abstract,
      debugDraw: Bump.abstract
    },

    typeMembers: {
      // This will get overwritten/implemented elsewhere.
      getFixedBody: Bump.noop
    }
  });

})( this, this.Bump );
