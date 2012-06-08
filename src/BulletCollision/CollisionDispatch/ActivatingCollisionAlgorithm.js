(function( window, Bump ) {

  Bump.ActivatingCollisionAlgorithm = Bump.type({
    parent: Bump.CollisionAlgorithm,

    init: function ActivatingCollisionAlgorithm( ci ) {
      return Bump.CollisionAlgorithm.prototype.initWithInfo.call( this, ci );
    },

    members: {
      destruct: function() {
        this._super();
      }
    }
  });

})( this, this.Bump );
