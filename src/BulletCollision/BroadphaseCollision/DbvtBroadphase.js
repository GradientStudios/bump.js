(function( window, Bump ) {

  Bump.DbvtProxy = Bump.type( {
    parent: Bump.BroadphaseProxy,

    init: function DbvtProxy( aabbMin, aabbMax, userPtr, collisionFilterGroup, collisionFilterMask ) {
      this._super( aabbMin, aabbMax, userPtr, collisionFilterGroup, collisionFilterMask );

      this.leaf = 0;
      this.links = [ 0, 0 ];
      this.stage = 0;
    }
  } );

  Bump.DbvtBroadphase = Bump.type( {
    parent: Bump.BroadphaseInterface
  } );
} )( this, this.Bump );