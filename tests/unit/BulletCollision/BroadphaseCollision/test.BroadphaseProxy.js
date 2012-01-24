module( 'Bump.BroadphaseNativeTypes' );

// Given an object that should represent an enum, make sure that no two properties
// of the enum have the same value.
var testEnumForUniqueValues = function( enumObj ) {
  var values = {};
  for ( var key in enumObj ) {
    values[ enumObj[ key ] ] = values[ enumObj[ key ] ] || [];
    values[ enumObj[ key ] ].push( key );
  }
  for ( var value in values ) {
    if ( values[ value ].length > 1 ) {
      // duplicate values were found
      ok( false, 'Failed because properties ' + values[ value ].toString() + ' share value ' + value );
    }
    else {
      ok( true, 'Property ' + values[ value ][ 0 ] + ' has unique value ' + value );
    }
  }
}

// Takes the given `op`, which must be a unary type member that returns a boolean,
// and evaluates it on all members of the given `enumObj` object.
// `trueValues` is an array of all enum property names for which the expected result is true.
// All other enum values are expected to evaluate to false.
var testUnaryBoolTypeMemberOverEnum = function( type, op, enumObj, trueValues ) {
  if ( typeof op === 'string' ) {
    ok( op in type, 'typeMember ' + op + ' exists' );
    op = type[ op ].bind( type );
  }
  for ( var value in enumObj ) {
    if ( trueValues.indexOf( value ) !== -1 ) {
      // expected to evaluate to true
      ok( op( enumObj[ value ] ), 'true for ' + value );
    }
    else {
      // expected to evaluate to false
      ok( !op( enumObj[ value ] ), 'false for ' + value );
    }
  }
};

test( 'BroadphaseNativeTypes enum', function() {
  ok( Bump.BroadphaseNativeTypes );
  ok( Bump.BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.TRIANGLE_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.TETRAHEDRAL_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.CONVEX_TRIANGLEMESH_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.CONVEX_HULL_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.CONVEX_POINT_CLOUD_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.CUSTOM_POLYHEDRAL_SHAPE_TYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.IMPLICIT_CONVEX_SHAPES_START_HERE !== undefined );
  ok( Bump.BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.MULTI_SPHERE_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.CAPSULE_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.CONE_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.CONVEX_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.CYLINDER_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.UNIFORM_SCALING_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.MINKOWSKI_SUM_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.MINKOWSKI_DIFFERENCE_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.BOX_2D_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.CONVEX_2D_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.CUSTOM_CONVEX_SHAPE_TYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.CONCAVE_SHAPES_START_HERE !== undefined );
  ok( Bump.BroadphaseNativeTypes.TRIANGLE_MESH_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.SCALED_TRIANGLE_MESH_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.FAST_CONCAVE_MESH_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.TERRAIN_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.GIMPACT_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.MULTIMATERIAL_TRIANGLE_MESH_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.EMPTY_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.STATIC_PLANE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.CUSTOM_CONCAVE_SHAPE_TYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.CONCAVE_SHAPES_END_HERE !== undefined );
  ok( Bump.BroadphaseNativeTypes.COMPOUND_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.SOFTBODY_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.HFFLUID_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.HFFLUID_BUOYANT_CONVEX_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.INVALID_SHAPE_PROXYTYPE !== undefined );
  ok( Bump.BroadphaseNativeTypes.MAX_BROADPHASE_COLLISION_TYPES !== undefined );

  testEnumForUniqueValues( Bump.BroadphaseNativeTypes );
});

// TODO : Add test to make sure that the enums each have unique values

module( 'Bump.BroadphaseProxy' );

test( 'BroadphaseProxy exists', function() {
  ok( Bump.BroadphaseProxy );
});

module( 'Bump.BroadphaseProxy basic' );

test( 'createEmpty', function() {
  ok( Bump.BroadphaseProxy.createEmpty, 'createEmpty exists' );
  ok( typeof Bump.BroadphaseProxy.createEmpty() === 'object', 'creates an object' );

  var a = Bump.BroadphaseProxy.createEmpty(),
      b = Bump.BroadphaseProxy.createEmpty();

  ok( a !== b, 'creates different objects' );
  deepEqual( a, b, 'creates similar objects' );
});

test( 'create', function() {
  var aabbMin = Bump.Vector3.create(-5, -5, -5),
  aabbMax = Bump.Vector3.create(5, 5, 5),
  userPtr = { name: 'foo' },
  filterGroup = 2,
  filterMask = 4,
  multiSapParentProxy = { name: 'bar' },
  proxy = Bump.BroadphaseProxy.create( aabbMin, aabbMax, userPtr,
                                       filterGroup, filterMask,
                                       multiSapParentProxy );

  notStrictEqual( proxy.m_aabbMin, aabbMin, 'makes new copy for aabbMin' );
  deepEqual( proxy.m_aabbMin, aabbMin, 'correct m_aabbMin value' );
  notStrictEqual( proxy.m_aabbMin, aabbMax, 'makes new copy for aabbMax' );
  deepEqual( proxy.m_aabbMin, aabbMin, 'correct m_aabbMax value' );
  strictEqual( proxy.m_clientObject, userPtr, 'm_clientObject set correctly' );
  equal( proxy.m_collisionFilterGroup, filterGroup, 'm_collisionFilterGroup set correctly');
  equal( proxy.m_collisionFilterMask, filterMask, 'm_collisionFilterMask set correctly');
  strictEqual( proxy.m_multiSapParentProxy, multiSapParentProxy,
               'm_multiSapParentProxy set correctly' );

});

test( 'getUid', function() {
  var proxy = Bump.BroadphaseProxy.createEmpty();
  ok( proxy.getUid, 'getUid member function exists' );
  equal( proxy.getUid(), 0, 'getUid returns correct value after initialization' );
  proxy.m_uniqueId = 10;
  equal( proxy.getUid(), 10, 'getUid returns correct value after being set' );
});

test( 'CollisionFilterGroups enum', function() {
  ok( Bump.BroadphaseProxy.CollisionFilterGroups );
  ok( Bump.BroadphaseProxy.CollisionFilterGroups.DefaultFilter === 1 );
  ok( Bump.BroadphaseProxy.CollisionFilterGroups.StaticFilter === 2 );
  ok( Bump.BroadphaseProxy.CollisionFilterGroups.KinematicFilter === 4 );
  ok( Bump.BroadphaseProxy.CollisionFilterGroups.DebrisFilter === 8 );
  ok( Bump.BroadphaseProxy.CollisionFilterGroups.SensorTrigger === 16 );
  ok( Bump.BroadphaseProxy.CollisionFilterGroups.CharacterFilter === 32 );
  ok( Bump.BroadphaseProxy.CollisionFilterGroups.AllFilter === -1 );

  testEnumForUniqueValues( Bump.BroadphaseProxy.CollisionFilterGroups );
});

test('isPolyhedral typeMember', function() {
  testUnaryBoolTypeMemberOverEnum( Bump.BroadphaseProxy, 'isPolyhedral', Bump.BroadphaseNativeTypes, [
    'BOX_SHAPE_PROXYTYPE',
    'TRIANGLE_SHAPE_PROXYTYPE',
    'TETRAHEDRAL_SHAPE_PROXYTYPE',
    'CONVEX_TRIANGLEMESH_SHAPE_PROXYTYPE',
    'CONVEX_HULL_SHAPE_PROXYTYPE',
    'CONVEX_POINT_CLOUD_SHAPE_PROXYTYPE',
    'CUSTOM_POLYHEDRAL_SHAPE_TYPE'
  ]);
});

test('isConvex typeMember', function() {
  testUnaryBoolTypeMemberOverEnum( Bump.BroadphaseProxy, 'isConvex', Bump.BroadphaseNativeTypes, [
    'BOX_SHAPE_PROXYTYPE',
    'TRIANGLE_SHAPE_PROXYTYPE',
    'TETRAHEDRAL_SHAPE_PROXYTYPE',
    'CONVEX_TRIANGLEMESH_SHAPE_PROXYTYPE',
    'CONVEX_HULL_SHAPE_PROXYTYPE',
    'CONVEX_POINT_CLOUD_SHAPE_PROXYTYPE',
    'CUSTOM_POLYHEDRAL_SHAPE_TYPE',
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
    'CUSTOM_CONVEX_SHAPE_TYPE'
  ]);
});

test('isConcave typeMember', function() {
  testUnaryBoolTypeMemberOverEnum( Bump.BroadphaseProxy, 'isConcave', Bump.BroadphaseNativeTypes, [
    'TRIANGLE_MESH_SHAPE_PROXYTYPE',
    'SCALED_TRIANGLE_MESH_SHAPE_PROXYTYPE',
    'FAST_CONCAVE_MESH_PROXYTYPE',
    'TERRAIN_SHAPE_PROXYTYPE',
    'GIMPACT_SHAPE_PROXYTYPE',
    'MULTIMATERIAL_TRIANGLE_MESH_PROXYTYPE',
    'EMPTY_SHAPE_PROXYTYPE',
    'STATIC_PLANE_PROXYTYPE',
    'CUSTOM_CONCAVE_SHAPE_TYPE'
  ]);
});

test('isNonMoving typeMember', function() {
  testUnaryBoolTypeMemberOverEnum( Bump.BroadphaseProxy, 'isNonMoving', Bump.BroadphaseNativeTypes, [
    'TRIANGLE_MESH_SHAPE_PROXYTYPE',
    'SCALED_TRIANGLE_MESH_SHAPE_PROXYTYPE',
    'FAST_CONCAVE_MESH_PROXYTYPE',
    'TERRAIN_SHAPE_PROXYTYPE',
    'MULTIMATERIAL_TRIANGLE_MESH_PROXYTYPE',
    'EMPTY_SHAPE_PROXYTYPE',
    'STATIC_PLANE_PROXYTYPE',
    'CUSTOM_CONCAVE_SHAPE_TYPE'
  ]);
});

test('isCompound typeMember', function() {
  testUnaryBoolTypeMemberOverEnum( Bump.BroadphaseProxy, 'isCompound', Bump.BroadphaseNativeTypes, [
    'COMPOUND_SHAPE_PROXYTYPE'
  ]);
});

test('isSoftBody typeMember', function() {
  testUnaryBoolTypeMemberOverEnum( Bump.BroadphaseProxy, 'isSoftBody', Bump.BroadphaseNativeTypes, [
    'SOFTBODY_SHAPE_PROXYTYPE'
  ]);
});

test('isInfinite typeMember', function() {
  testUnaryBoolTypeMemberOverEnum( Bump.BroadphaseProxy, 'isInfinite', Bump.BroadphaseNativeTypes, [
    'STATIC_PLANE_PROXYTYPE'
  ]);
});

test('isConvex2d typeMember', function() {
  testUnaryBoolTypeMemberOverEnum( Bump.BroadphaseProxy, 'isConvex2d', Bump.BroadphaseNativeTypes, [
    'BOX_2D_SHAPE_PROXYTYPE',
    'CONVEX_2D_SHAPE_PROXYTYPE'
  ]);
});


/*** BroadphasePair tests ***/

module( 'Bump.BroadphasePair' );

test( 'BroadphasePair exists', function() {
  ok( Bump.BroadphasePair );
});

module( 'Bump.BroadphasePair basic' );

test( 'createEmpty', function() {
  ok( Bump.BroadphasePair.createEmpty, 'createEmpty exists' );
  ok( typeof Bump.BroadphasePair.createEmpty() === 'object', 'creates an object' );

  var a = Bump.BroadphasePair.createEmpty(),
      b = Bump.BroadphasePair.createEmpty();

  ok( a !== b, 'creates different objects' );
  deepEqual( a, b, 'creates similar objects' );

  strictEqual( a.m_pProxy0, null, 'm_pProxy0 correctly initialized' );
  strictEqual( a.m_pProxy1, null, 'm_pProxy1 correctly initialized' );
  strictEqual( a.m_algorithm, null, 'm_algorithm correctly initialized' );
  strictEqual( a.m_internalInfo1, null, 'm_internalInfo1 correctly initialized' );
  strictEqual( a.m_internalTmpValue, 0, 'm_internalTmpValue correctly initialized' );

});

test( 'create', function() {
  ok( Bump.BroadphasePair.create, 'create exists' );

  var p0 = Bump.BroadphaseProxy.createEmpty(),
  p1 = Bump.BroadphaseProxy.createEmpty(),
  a = Bump.BroadphasePair.create( p0, p1 ),
  b = Bump.BroadphasePair.create( p0, p1 );

  ok( typeof a == 'object', 'creates and object' );
  ok( a !== b, 'creates different objects' );
  deepEqual( a, b, 'creates similar objects' );

  strictEqual( a.m_pProxy0, p1, 'm_pProxy0 correctly initialized' );
  strictEqual( a.m_pProxy1, p0, 'm_pProxy1 correctly initialized' );
  strictEqual( a.m_algorithm, null, 'm_algorithm correctly initialized' );
  strictEqual( a.m_internalInfo1, null, 'm_internalInfo1 correctly initialized' );
  strictEqual( a.m_internalTmpValue, 0, 'm_internalTmpValue correctly initialized' );

  p1.m_uniqueId = 10;

  var c = Bump.BroadphasePair.create( p0, p1 );
  strictEqual( c.m_pProxy0, p0, 'm_pProxy0 correctly stored based on uid' );
  strictEqual( c.m_pProxy1, p1, 'm_pProxy1 correctly stored based on uid' );

});

test( 'clone', function() {
  ok( Bump.BroadphasePair.clone, 'clone exists' );
  var p0 = Bump.BroadphaseProxy.createEmpty(),
  p1 = Bump.BroadphaseProxy.createEmpty(),
  a = Bump.BroadphasePair.create( p0, p1 ),
  b = Bump.BroadphasePair.clone( a );

  ok( typeof b === 'object', 'returns an object' );
  ok( a !== b, 'creates a new object' );
  deepEqual( a, b, 'new object is a correct copy' );
});

test( 'equal', function() {
  var p0 = Bump.BroadphaseProxy.createEmpty(),
  p1 = Bump.BroadphaseProxy.createEmpty(),
  p2 = Bump.BroadphaseProxy.createEmpty(),
  a = Bump.BroadphasePair.create( p0, p1 ),
  b = Bump.BroadphasePair.create( p0, p1 ),
  c = Bump.BroadphasePair.create( p1, p2 );

  ok( a.equal, 'equal member function exists' );
  ok( a.equal( b ), 'pairs made from the same proxies are equal' );
  ok( !a.equal( c ), 'pairs made from different proxies are not equal' );
});

module( 'Bump.BroadphasePairSortPredicate' );

test( 'BroadphasePairSortPredicate exists', function() {
  ok( Bump.BroadphasePairSortPredicate );
});

test( 'create', function() {
  var pred = Bump.BroadphasePairSortPredicate.create(),
      a = Bump.BroadphasePair.createEmpty(),
      b = Bump.BroadphasePair.createEmpty();

  ok( pred === Bump.BroadphasePairSortPredicate._functor, 'correctly returns functor' );
  ok(! pred( a, b ), 'predicate returns expected result for identical pairs' );

  // TODO : Add a test for pairs with realistic values.
});
