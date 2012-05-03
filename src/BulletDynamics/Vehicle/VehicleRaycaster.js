(function( window, Bump ) {

  Bump.VehicleRaycaster = Bump.type({
    init: function() {
      this.distFraction = -1;
      this.hitPointInWorld = Bump.Vector3.create();
      this.hitNormalInWorld = Bump.Vector3.create();
      this.distFraction = 0;
    }
  });

})( this, this.Bump );