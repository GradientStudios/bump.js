(function( window, Bump ) {

  // **OverlappingPairCallback** is the port of the original bullet class
  // `btOverlappingPairCallback`.
  Bump.OverlappingPairCallback = Bump.type({
    init: function OverlappingPairCallback() {},
    members: {
      addOverlappingPair: Bump.abstract,
      removeOverlappingPair: Bump.abstract,
      removeOverlappingPairsContainingProxy: Bump.abstract
    }
  });

})( this, this.Bump );
