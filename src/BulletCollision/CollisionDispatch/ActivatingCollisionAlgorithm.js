(function( window, Bump ) {

  Bump.ActivatingCollisionAlgorithm = Bump.type({
    parent: Bump.CollisionAlgorithm,

    init: function ActivatingCollisionAlgorithm( ci ) {
      return this._super( ci );
    },

    members: {
      destruct: function() {
        this._super();
      }
    }
  });

})( this, this.Bump );
