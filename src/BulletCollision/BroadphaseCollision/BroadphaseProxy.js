// **Bump.BroadphaseProxy** is the port of the `btBroadphaseProxy` class in
// [Bullet](http://bulletphysics.org).

(function( window, Bump ) {
  Bump.BroadphaseProxy = Bump.type( {

    // The `args` param is an object that may contain any of the following properties:
    // `aabbMin` : A Vector3 representing the minimum x, y, x values of the axis aligned bounding box.
    // `aabbMax` : A Vector3 representing the maximum x, y, x values of the axis aligned bounding box.
    // `userPtr` : The client object for the proxy (usually a CollisionObject or Rigidbody).
    // `collisionFilterGroup` : The unsigned integer collision filter group. ???
    // `collisionFilterMask` : The unsigned integer collision filter mask. ???
    // `multiSapParentProxy` : ???
    init: function BroadphaseProxy( args ) {

      args = args || {};

      // Usually the client CollisionObject or Rigidbody class
      this.m_clientObject = args.userPtr || null;

      this.m_collisionFilterGroup = args.collisionFilterGroup || 0;
      this.m_collisionFilterMask = args.collisionFilterMask || 0;

      this.m_multiSapParentProxy = args.multiSapParentProxy || null;
      this.m_uniqueID = null;

      this.m_aabbMin = args.aabbMin || Bump.Vector3.create( );
      this.m_aabbMax = args.aabbMax || Bump.Vector3.create( );
    },

    // ## Properties
    properties : {

    },

    // ## Member functions
    members : {
      getUid : function() {
        return m_uniqueId;
      }

    }

  } );
} )( this, this.Bump );