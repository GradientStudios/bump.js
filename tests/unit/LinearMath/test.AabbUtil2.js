module( 'AabbUtil2' );

test( 'AabbUtil2 exists', function() {
  var aabb = Bump || {};

  ok( aabb.aabbExpand, 'Bump.aabbExpand' );
  ok( aabb.testPointAgainstAabb2, 'Bump.testPointAgainstAabb2' );
  ok( aabb.testAabbAgainstAabb2, 'Bump.testAabbAgainstAabb2' );
  ok( aabb.testTriangleAgainstAabb2, 'Bump.testTriangleAgainstAabb2' );
  ok( aabb.Outcode, 'Bump.Outcode' );
  ok( aabb.RayAabb2, 'Bump.RayAabb2' );
  ok( aabb.RayAabb, 'Bump.RayAabb' );
  ok( aabb.TransformAabbWithExtents, 'Bump.TransformAabbWithExtents' );
  ok( aabb.TransformAabb, 'Bump.TransformAabb' );
  ok( aabb.testQuantizedAabbAgainstQuantizedAabb, 'Bump.testQuantizedAabbAgainstQuantizedAabb' );
});

module( 'AabbUtil2.aabbExpand' );

test( 'basic', function() {
  var aabbMin = Bump.Vector3.create( 1, 2, 3 ),
      aabbMinRef = aabbMin,
      aabbMax = Bump.Vector3.create( 2, 3, 4 ),
      aabbMaxRef = aabbMax,
      expansionMin = Bump.Vector3.create( -1, -1, -1 ),
      expansionMinClone = expansionMin.clone(),
      expansionMax = Bump.Vector3.create( 1, 1, 1 ),
      expansionMaxClone = expansionMax.clone();

  Bump.aabbExpand( aabbMin, aabbMax, expansionMin, expansionMax );

  deepEqual( expansionMin, expansionMinClone, 'expansionMin is not changed' );
  deepEqual( expansionMax, expansionMaxClone, 'expansionMax is not changed' );
});

module( 'AabbUtil2.testPointAgainstAabb2' );

test( 'basic', function() {
  var aabbMin = Bump.Vector3.create( 1, 2, 3 ),
      aabbMinClone = aabbMin.clone(),
      aabbMax = Bump.Vector3.create( 2, 3, 4 ),
      aabbMaxClone = aabbMax.clone(),
      a = Bump.Vector3.create(),
      aClone = a.clone(),
      b = Bump.Vector3.create( 1.5, 2.5, 3.5 ),
      bClone = b.clone();

  equal( Bump.testPointAgainstAabb2( aabbMin, aabbMax, a ), false );
  equal( Bump.testPointAgainstAabb2( aabbMin, aabbMax, b ), true );

  deepEqual( aabbMin, aabbMinClone, 'aabbMin is not changed' );
  deepEqual( aabbMax, aabbMaxClone, 'aabbMax is not changed' );

  deepEqual( a, aClone, 'a is not changed' );
  deepEqual( b, bClone, 'b is not changed' );
});

module( 'AabbUtil2.testAabbAgainstAabb2' );

test( 'basic', function() {
  var aMin = Bump.Vector3.create( 0, 0, 0 ),
      aMinClone = aMin.clone(),
      aMax = Bump.Vector3.create( 1, 1, 1 ),
      aMaxClone = aMax.clone(),
      bMin = Bump.Vector3.create( 0.5, 0.5, 0.5 ),
      bMinClone = bMin.clone(),
      bMax = Bump.Vector3.create( 1.5, 1.5, 1.5 ),
      bMaxClone = bMax.clone(),
      cMin = Bump.Vector3.create( 1 + Math.pow( 2, -52 ), 0, 0 ),
      cMinClone = cMin.clone(),
      cMax = Bump.Vector3.create( 2 + Math.pow( 2, -52 ), 1, 1 ),
      cMaxClone = cMax.clone();

  equal( Bump.testAabbAgainstAabb2( aMin, aMax, bMin, bMax ), true );
  equal( Bump.testAabbAgainstAabb2( aMin, aMax, cMin, cMax ), false );
  equal( Bump.testAabbAgainstAabb2( bMin, bMax, cMin, cMax ), true );
  equal( Bump.testAabbAgainstAabb2( bMin, bMax, aMin, aMax ), true );
  equal( Bump.testAabbAgainstAabb2( cMin, cMax, aMin, aMax ), false );
  equal( Bump.testAabbAgainstAabb2( cMin, cMax, bMin, bMax ), true );

  deepEqual( aMin, aMinClone, 'aMin is not changed' );
  deepEqual( aMax, aMaxClone, 'aMax is not changed' );
  deepEqual( bMin, bMinClone, 'bMin is not changed' );
  deepEqual( bMax, bMaxClone, 'bMax is not changed' );
  deepEqual( cMin, cMinClone, 'cMin is not changed' );
  deepEqual( cMax, cMaxClone, 'cMax is not changed' );
});

module( 'AabbUtil2.testTriangleAgainstAabb2' );

test( 'test skipped', function() {});

module( 'AabbUtil2.Outcode' );

test( 'basic', function() {
  var aabbMin = Bump.Vector3.create( 0, 0, 0 ),
      aabbMax = Bump.Vector3.create( 2, 4, 6 ),
      halfExtent = aabbMax.subtract( aabbMin ).multiply( 0.5 ),
      halfExtentClone = halfExtent.clone(),
      source = Bump.Vector3.create( 6, 3, 5 ),
      sourceClone = source.clone(),
      outcode = Bump.Outcode( source, halfExtent );

  equal( outcode, 56 );
  deepEqual( halfExtent, halfExtentClone, 'does not modify halfExtent' );
  deepEqual( source, sourceClone, 'does not modify p' );
});

module( 'AabbUtil2.rayAabb2' );

test( 'test skipped', function() {});

module( 'AabbUtil2.rayAabb' );

test( 'test skipped', function() {});

module( 'AabbUtil2.TransformAabbWithExtents' );

test( 'test skipped', function() {});

module( 'AabbUtil2.TransformAabb' );

test( 'test skipped', function() {});

module( 'AabbUtil2.testQuantizedAabbAgainstQuantizedAabb' );

test( 'test skipped', function() {});
