(function( window, Bump ) {

  // **OverlappingPairCallback** is the port of the original bullet class
  // `btOverlappingPairCallback`.
  Bump.OverlappingPairCallback = Bump.type({
    members: {
      addOverlappingPair: function( proxy0, proxy1 ) {},
      removeOverlappingPair: function( proxy0, proxy1, dispatcher ) {},
      removeOverlappingPairsContainingProxy: function( proxy0, dispatcher ) {}
    }
  });

})( this, this.Bump );
