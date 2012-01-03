module( 'Bump.BroadphaseNativeTypes' );

test( 'native types exist', function() {
  ok( Bump.BroadphaseNativeTypes );
  ok( Bump.BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.TRIANGLE_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.TETRAHEDRAL_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.CONVEX_TRIANGLEMESH_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.CONVEX_HULL_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.CONVEX_POINT_CLOUD_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.CUSTOM_POLYHEDRAL_SHAPE_TYPE );
  ok( Bump.BroadphaseNativeTypes.IMPLICIT_CONVEX_SHAPES_START_HERE );
  ok( Bump.BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.MULTI_SPHERE_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.CAPSULE_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.CONE_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.CONVEX_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.CYLINDER_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.UNIFORM_SCALING_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.MINKOWSKI_SUM_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.MINKOWSKI_DIFFERENCE_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.BOX_2D_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.CONVEX_2D_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.CUSTOM_CONVEX_SHAPE_TYPE );
  ok( Bump.BroadphaseNativeTypes.CONCAVE_SHAPES_START_HERE );
  ok( Bump.BroadphaseNativeTypes.TRIANGLE_MESH_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.SCALED_TRIANGLE_MESH_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.FAST_CONCAVE_MESH_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.TERRAIN_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.GIMPACT_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.MULTIMATERIAL_TRIANGLE_MESH_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.EMPTY_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.STATIC_PLANE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.CUSTOM_CONCAVE_SHAPE_TYPE );
  ok( Bump.BroadphaseNativeTypes.CONCAVE_SHAPES_END_HERE );
  ok( Bump.BroadphaseNativeTypes.COMPOUND_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.SOFTBODY_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.HFFLUID_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.HFFLUID_BUOYANT_CONVEX_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.INVALID_SHAPE_PROXYTYPE );
  ok( Bump.BroadphaseNativeTypes.MAX_BROADPHASE_COLLISION_TYPES );
} );

// TODO : Add test to make sure that the enums each have unique values

module( 'Bump.BroadphaseProxy' );

test( 'BroadphaseProxy exists', function() {
  ok( Bump.BroadphaseProxy );
} );

module( 'Bump.BroadphaseProxy basic' );

test( 'createEmpty', function() {
  ok( Bump.BroadphaseProxy.createEmpty, 'createExists' );
  ok( typeof Bump.BroadphaseProxy.createEmpty() === 'object', 'creates an object' );

  var a = Bump.BroadphaseProxy.createEmpty(),
      b = Bump.BroadphaseProxy.createEmpty();

  ok( a !== b, 'creates different objects' );
  deepEqual( a, b, 'creates similar objects' );
} );