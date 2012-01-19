(function( window, Bump ) {

  // *** OverlappingPairCallback *** is the port of the original bullet class `btOverlappingPairCallback`
  Bump.OverlappingPairCallback = Bump.type( {
    members: {
      addOverlappingPair( proxy0, proxy1 ) {},
      removeOverlappingPair( proxy0, proxy1, dispatcher ) {},
      removeOverlappingPairsContainingProxy( proxy0, dispatcher ) {}
    }
  } );

} )( this, this.Bump );
