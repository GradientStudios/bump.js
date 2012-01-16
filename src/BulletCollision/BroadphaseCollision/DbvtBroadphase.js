(function( window, Bump ) {

  Bump.DbvtProxy = Bump.type( {
    parent: Bump.BroadphaseProxy,

    init: function DbvtProxy( aabbMin, aabbMax, userPtr, collisionFilterGroup, collisionFilterMask ) {
      this._super( aabbMin, aabbMax, userPtr, collisionFilterGroup, collisionFilterMask );

      this.leaf = null;
      this.links = [ null, null ];
      this.stage = 0;
    }
  } );

  Bump.DbvtBroadphase = Bump.type( {
    parent: Bump.BroadphaseInterface,

    init: function() {
    },

    typeMembers: {
      Stages: Bump.Enum( [
        { id: 'DYNAMIC_SET' },
        { id: 'FIXED_SET' },
        { id: 'STAGECOUNT' }
      ] )
    }
  } );
} )( this, this.Bump );