// load: bump.js

// run: LinearMath/Vector3.js

// **Bump.BroadphaseProxy** is the port of the `btBroadphaseProxy` class in
// [Bullet](http://bulletphysics.org).

(function( window, Bump ) {

  // ## BroadphaseNativeTypes enum
  // The values declared will be integers for now.
  // To anyone editing: the indentation in the original bullet source seems intentional,
  // so it was maintained here.
  (function( Bump ) {
    var _broadphaseNativeTypes = [
      'BOX_SHAPE_PROXYTYPE',
      'TRIANGLE_SHAPE_PROXYTYPE',
      'TETRAHEDRAL_SHAPE_PROXYTYPE',
      'CONVEX_TRIANGLEMESH_SHAPE_PROXYTYPE',
      'CONVEX_HULL_SHAPE_PROXYTYPE',
      'CONVEX_POINT_CLOUD_SHAPE_PROXYTYPE',
      'CUSTOM_POLYHEDRAL_SHAPE_TYPE',
// implicit convex shapes
'IMPLICIT_CONVEX_SHAPES_START_HERE',
      'SPHERE_SHAPE_PROXYTYPE',
      'MULTI_SPHERE_SHAPE_PROXYTYPE',
      'CAPSULE_SHAPE_PROXYTYPE',
      'CONE_SHAPE_PROXYTYPE',
      'CONVEX_SHAPE_PROXYTYPE',
      'CYLINDER_SHAPE_PROXYTYPE',
      'UNIFORM_SCALING_SHAPE_PROXYTYPE',
      'MINKOWSKI_SUM_SHAPE_PROXYTYPE',
      'MINKOWSKI_DIFFERENCE_SHAPE_PROXYTYPE',
      'BOX_2D_SHAPE_PROXYTYPE',
      'CONVEX_2D_SHAPE_PROXYTYPE',
      'CUSTOM_CONVEX_SHAPE_TYPE',
// concave shapes
'CONCAVE_SHAPES_START_HERE',
      // keep all the convex shapetype below here', for the check IsConvexShape in broadphase proxy!
      'TRIANGLE_MESH_SHAPE_PROXYTYPE',
      'SCALED_TRIANGLE_MESH_SHAPE_PROXYTYPE',
      // used for demo integration FAST/Swift collision library and Bullet
      'FAST_CONCAVE_MESH_PROXYTYPE',
      // terrain
      'TERRAIN_SHAPE_PROXYTYPE',
// Used for GIMPACT Trimesh integration
      'GIMPACT_SHAPE_PROXYTYPE',
// Multimaterial mesh
  'MULTIMATERIAL_TRIANGLE_MESH_PROXYTYPE',

      'EMPTY_SHAPE_PROXYTYPE',
      'STATIC_PLANE_PROXYTYPE',
      'CUSTOM_CONCAVE_SHAPE_TYPE',
'CONCAVE_SHAPES_END_HERE',

      'COMPOUND_SHAPE_PROXYTYPE',

      'SOFTBODY_SHAPE_PROXYTYPE',
      'HFFLUID_SHAPE_PROXYTYPE',
      'HFFLUID_BUOYANT_CONVEX_SHAPE_PROXYTYPE',
      'INVALID_SHAPE_PROXYTYPE',

      'MAX_BROADPHASE_COLLISION_TYPES'
    ];

    Bump.BroadphaseNativeTypes = {};
    for ( var i = 0; i < _broadphaseNativeTypes.length; i++ ) {
      Bump.BroadphaseNativeTypes[ _broadphaseNativeTypes[ i ] ] = i;
    }
  })( Bump );

  // The **btBroadphaseProxy** is the main class that can be used with the
  // Bullet broadphases. It stores collision shape type information, collision
  // filter information and a client object, typically a `btCollisionObject` or
  // `btRigidBody`.

  Bump.BroadphaseProxy = Bump.type({

    // Given *exactly* the following arguments, initializes the BroadphaseProxy:
    //
    // - `aabbMin` : A Vector3 representing the minimum x, y, x values of the axis aligned bounding box.
    // - `aabbMax` : A Vector3 representing the maximum x, y, x values of the axis aligned bounding box.
    // - `userPtr` : The client object for the proxy (usually a CollisionObject or Rigidbody).
    // - `collisionFilterGroup` : The unsigned integer collision filter group. ???
    // - `collisionFilterMask` : The unsigned integer collision filter mask. ???
    // - `multiSapParentProxy` : ???
    init: function BroadphaseProxy( aabbMin, aabbMax, userPtr, collisionFilterGroup,
                                    collisionFilterMask, multiSapParentProxy ) {
      // Usually the client CollisionObject or Rigidbody class
      this.clientObject = userPtr;

      this.collisionFilterGroup = collisionFilterGroup;
      this.collisionFilterMask = collisionFilterMask;

      this.multiSapParentProxy = multiSapParentProxy || null;
      this.uniqueId = 0;

      this.aabbMin = aabbMin.clone();
      this.aabbMax = aabbMax.clone();

    },

    // ## Properties
    properties: {

    },

    // ## Member functions
    members: {
      getUid: function() {
        return this.uniqueId;
      }

    },

    // ## Type members
    typeMembers: {

      isPolyhedral: function( proxyType ) {
        return ( proxyType < Bump.BroadphaseNativeTypes.IMPLICIT_CONVEX_SHAPES_START_HERE );
      },

      isConvex: function( proxyType ) {
        return ( proxyType < Bump.BroadphaseNativeTypes.CONCAVE_SHAPES_START_HERE );
      },

      isNonMoving: function( proxyType ) {
        return ( this.isConcave( proxyType ) &&
                 ( proxyType !== Bump.BroadphaseNativeTypes.GIMPACT_SHAPE_PROXYTYPE ) );
      },

      isConcave: function( proxyType ) {
        return ( ( proxyType > Bump.BroadphaseNativeTypes.CONCAVE_SHAPES_START_HERE ) &&
                 ( proxyType < Bump.BroadphaseNativeTypes.CONCAVE_SHAPES_END_HERE ) );
      },

      isCompound: function( proxyType ) {
        return ( proxyType === Bump.BroadphaseNativeTypes.COMPOUND_SHAPE_PROXYTYPE );
      },

      isSoftBody: function( proxyType ) {
        return ( proxyType === Bump.BroadphaseNativeTypes.SOFTBODY_SHAPE_PROXYTYPE );
      },

      isInfinite: function( proxyType ) {
        return ( proxyType === Bump.BroadphaseNativeTypes.STATIC_PLANE_PROXYTYPE );
      },

      isConvex2d: function( proxyType ) {
        return ( ( proxyType === Bump.BroadphaseNativeTypes.BOX_2D_SHAPE_PROXYTYPE ) ||
                 ( proxyType === Bump.BroadphaseNativeTypes.CONVEX_2D_SHAPE_PROXYTYPE ) );
      },

      // Create an empty `BroadphaseProxy.` This is analogous to the default constructor
      // of `btBroadphaseProxy`.
      createEmpty: function() {
        var newProxy = Object.create( Bump.BroadphaseProxy.prototype );

        newProxy.clientObject = null;
        newProxy.collisionFilterGroup = 0;
        newProxy.collisionFilterMask = 0;
        newProxy.multiSapParentProxy = null;
        newProxy.uniqueId = 0;
        newProxy.aabbMin = Bump.Vector3.create();
        newProxy.aabbMax = Bump.Vector3.create();

        return newProxy;
      },

      // Emulates the `CollisionFilterGroup` enum from `btBroadphaseProxy`.
      CollisionFilterGroups: {
        DefaultFilter: 1,
        StaticFilter: 2,
        KinematicFilter: 4,
        DebrisFilter: 8,
        SensorTrigger: 16,
        CharacterFilter: 32,
        AllFilter: -1 // all bits sets: DefaultFilter | StaticFilter | KinematicFilter | DebrisFilter | SensorTrigger
      }

    }

  });

  // The **BroadphasePair** class contains a pair of aabb-overlapping objects.
  // A `Dispatcher` can search a `CollisionAlgorithm` that performs exact/narrowphase collision
  // detection on the actual collision shapes.

  Bump.BroadphasePair = Bump.type({
    init: function BroadphasePair( proxy0, proxy1 ) {
      if ( proxy0.uniqueId < proxy1.uniqueId ) {
        this.pProxy0 = proxy0;
        this.pProxy1 = proxy1;
      }
      else {
        this.pProxy0 = proxy1;
        this.pProxy1 = proxy0;
      }

      this.algorithm = null;

      // Note: The original btBroadphaseProxy source has internalInfo1 and internalTmpValue
      // lumped into a union, meaning that only one value can be used at a time. However, comments
      // suggest that these values should not be used.

      // don't use this data, it will be removed in future version.
      this.internalInfo1 = null;
      this.internalTmpValue = 0;
    },

    members: {
      // The `equal` function replaces the operator== for `btBroadphasePair`
      // objects, which previously was not a member function. Also note that
      // this function compares proxies *with* consideration of order. Consider
      // 2 different proxies, `p0` and `p1`. If `p0` and `p1` somehow both
      // receive the same `uid`, then `create( p0, p1 )` and `create( p1, p0 )`
      // will return results that are *not* considered equal. If `uid`s are
      // managed correctly, this should never happen.
      equal: function( other ) {
        return ( this.pProxy0 === other.pProxy0 ) && ( this.pProxy1 === other.pProxy1 );
      }
    },

    typeMembers: {
      // Create a new `BroadphasePair` with values copied from `other`. This
      // is analogous to the copy constructor of `btBroadphasePair`.
      clone: function( other ) {
        var newPair = Object.create( Bump.BroadphasePair.prototype );

        newPair.pProxy0 = other.pProxy0;
        newPair.pProxy1 = other.pProxy1;
        newPair.algorithm = other.algorithm;
        newPair.internalInfo1 = other.internalInfo1;
        newPair.internalTmpValue = other.internalTmpValue;

        return newPair;
      },

      // Create an empty `BroadphasePair`. This is analogous to the default
      // constructor of `btBroadphasePair`.
      createEmpty: function() {
        var newPair = Object.create( Bump.BroadphasePair.prototype );

        newPair.pProxy0 = null;
        newPair.pProxy1 = null;
        newPair.algorithm = null;
        newPair.internalInfo1 = null;
        newPair.internalTmpValue = 0;

        return newPair;
      }
    }
  });

  // BroadphasePairSortPredicate attempts to emulate btBroadphasePairSortPredicate, which
  // is a functor, while remaining faithful to Bump's style of object creation.
  Bump.BroadphasePairSortPredicate = Bump.type({
    init: function BroadphasePairSortPredicate() {},
    typeMembers: {
      _functor: function BroadphasePairSortPredicate( a, b ) {
        var uidA0 = a.pProxy0 ? a.pProxy0.uniqueId : -1,
            uidB0 = b.pProxy0 ? b.pProxy0.uniqueId : -1,
            uidA1 = a.pProxy1 ? a.pProxy1.uniqueId : -1,
            uidB1 = b.pProxy1 ? b.pProxy1.uniqueId : -1;

        return uidA0 > uidB0 ||
          ( a.pProxy0 === b.pProxy0 && uidA1 > uidB1 ) ||
          ( a.pProxy0 === b.pProxy0 && a.pProxy1 === b.pProxy1 && a.algorithm > b.algorithm );
      },

      create: function() {
        return this._functor;
      }
    }
  });

})( this, this.Bump );
