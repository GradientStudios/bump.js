// **Bump.BroadphaseProxy** is the port of the `btBroadphaseProxy` class in
// [Bullet](http://bulletphysics.org).

(function( window, Bump ) {

  // ## BroadphaseNativeTypes enum
  // The values declared will be integers for now.
  (function( Bump ) {
    var _broadphaseNativeTypes = [
      'BOX_SHAPE_PROXYTYPE',
      'TRIANGLE_SHAPE_PROXYTYPE',
      'TETRAHEDRAL_SHAPE_PROXYTYPE',
      'CONVEX_TRIANGLEMESH_SHAPE_PROXYTYPE',
      'CONVEX_HULL_SHAPE_PROXYTYPE',
      'CONVEX_POINT_CLOUD_SHAPE_PROXYTYPE',
      'CUSTOM_POLYHEDRAL_SHAPE_TYPE',
//implicit convex shapes
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
//concave shapes
'CONCAVE_SHAPES_START_HERE',
      //keep all the convex shapetype below here', for the check IsConvexShape in broadphase proxy!
      'TRIANGLE_MESH_SHAPE_PROXYTYPE',
      'SCALED_TRIANGLE_MESH_SHAPE_PROXYTYPE',
      ///used for demo integration FAST/Swift collision library and Bullet
      'FAST_CONCAVE_MESH_PROXYTYPE',
      //terrain
      'TERRAIN_SHAPE_PROXYTYPE',
///Used for GIMPACT Trimesh integration
      'GIMPACT_SHAPE_PROXYTYPE',
///Multimaterial mesh
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
    for( var i = 0; i < _broadphaseNativeTypes.length; i++) {
      Bump.BroadphaseNativeTypes[ _broadphaseNativeTypes ] = i;
    }
  } )( Bump );

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
    properties: {

    },

    // ## Member functions
    members: {
      getUid: function() {
        return this.m_uniqueId;
      }

    },

    // ## Type members
    typeMembers: {

      isPolyhedral: function( proxyType ) {
	return (proxyType  < Bump.BroadphaseNativeTypes.IMPLICIT_CONVEX_SHAPES_START_HERE);
      },

      isConvex: function( proxyType ) {
	return (proxyType < Bump.BroadphaseNativeTypes.CONCAVE_SHAPES_START_HERE);
      },

      isNonMoving: function( proxyType ) {
	return (this.isConcave(proxyType) &&
                (proxyType!==Bump.BroadphaseNativeTypes.GIMPACT_SHAPE_PROXYTYPE));
      },

      isConcave: function( proxyType ) {
	return ((proxyType > Bump.BroadphaseNativeTypes.CONCAVE_SHAPES_START_HERE) &&
		(proxyType < Bump.BroadphaseNativeTypes.CONCAVE_SHAPES_END_HERE));
      },

      isCompound: function( proxyType ) {
	return (proxyType === Bump.BroadphaseNativeTypes.COMPOUND_SHAPE_PROXYTYPE);
      },

      isSoftBody: function( proxyType ) {
	return (proxyType === Bump.BroadphaseNativeTypes.SOFTBODY_SHAPE_PROXYTYPE);
      },

      isInfinite: function( proxyType ) {
	return (proxyType === Bump.BroadphaseNativeTypes.STATIC_PLANE_PROXYTYPE);
      },

      isConvex2d: function( proxyType ) {
	return (proxyType === Bump.BroadphaseNativeTypes.BOX_2D_SHAPE_PROXYTYPE) ||
          (proxyType === Bump.BroadphaseNativeTypes.CONVEX_2D_SHAPE_PROXYTYPE);
      }

    }

  } );
} )( this, this.Bump );