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
      aabbMax = Bump.Vector3.create( 2, 3, 4 ),
      expansionMin = Bump.Vector3.create( -1, -1, -1 ),
      expansionMax = Bump.Vector3.create( 1, 1, 1 ),
      expectedMin = Bump.Vector3.create( 0, 1, 2 ),
      expectedMax = Bump.Vector3.create( 3, 4, 5 );

  testFunc( Bump, 'aabbExpand', {
    isStaticFunc: true,
    args: [
      [
        { param: aabbMin, expected: expectedMin },
        { param: aabbMax, expected: expectedMax },
        expansionMin,
        expansionMax
      ]
    ]
  });
});

module( 'AabbUtil2.testPointAgainstAabb2' );

test( 'basic', function() {
  var aabbMin = Bump.Vector3.create( 1, 2, 3 ),
      aabbMax = Bump.Vector3.create( 2, 3, 4 ),
      a = Bump.Vector3.create(),
      b = Bump.Vector3.create( 1.5, 2.5, 3.5 );

  testFunc( Bump, 'testPointAgainstAabb2', {
    isStaticFunc: true,
    args: [
      [ aabbMin, aabbMax, a ],
      [ aabbMin, aabbMax, b ]
    ],
    expected: [
      false, true
    ]
  });
});

module( 'AabbUtil2.testAabbAgainstAabb2' );

test( 'basic', function() {
  var aMin = Bump.Vector3.create( 0, 0, 0 ),
      aMax = Bump.Vector3.create( 1, 1, 1 ),
      bMin = Bump.Vector3.create( 0.5, 0.5, 0.5 ),
      bMax = Bump.Vector3.create( 1.5, 1.5, 1.5 ),
      cMin = Bump.Vector3.create( 1 + Math.pow( 2, -52 ), 0, 0 ),
      cMax = Bump.Vector3.create( 2 + Math.pow( 2, -52 ), 1, 1 );

  testFunc( Bump, 'testAabbAgainstAabb2', {
    isStaticFunc: true,
    args: [
      [ aMin, aMax, bMin, bMax ],
      [ aMin, aMax, cMin, cMax ],
      [ bMin, bMax, cMin, cMax ],
      [ bMin, bMax, aMin, aMax ],
      [ cMin, cMax, aMin, aMax ],
      [ cMin, cMax, bMin, bMax ]
    ],
    expected: [
      true,
      false,
      true,
      true,
      false,
      true
    ]
  });
});

module( 'AabbUtil2.testTriangleAgainstAabb2' );

test( 'basic', function() {
  var triangle = [
    Bump.Vector3.create( 0, 0, 0 ),
    Bump.Vector3.create( 0, 1, 1 ),
    Bump.Vector3.create( 1, 0, 1 )
  ];

  testFunc( Bump, 'testTriangleAgainstAabb2', {
    isStaticFunc: true,
    args: [
      [
        triangle,
        Bump.Vector3.create( 0.5, 0.5, -2 ),
        Bump.Vector3.create( 1, 1, 0 )
      ],
      [
        triangle,
        Bump.Vector3.create( 0.5, 0.5, -2 ),
        Bump.Vector3.create( 1, 1, 0 - Math.pow( 2, -52 ) )
      ]
    ],
    expected: [
      true,
      false
    ]
  });
});

module( 'AabbUtil2.Outcode' );

test( 'basic', function() {
  var aabbMin = Bump.Vector3.create( 0, 0, 0 ),
      aabbMax = Bump.Vector3.create( 2, 4, 6 ),
      halfExtent = aabbMax.subtract( aabbMin ).multiply( 0.5 ),
      source = Bump.Vector3.create( 6, 3, 5 );

  testFunc( Bump, 'Outcode', {
    isStaticFunc: true,
    args: [
      [ source, halfExtent ]
    ],
    expected: [
      56
    ]
  });
});

module( 'AabbUtil2.RayAabb2' );

test( 'basic', function() {
  var rayStart = Bump.Vector3.create( 0.75, -1, -1 ),
      rayInvDir = Bump.Vector3.create( 0, 1, 0 ),
      signs = [ 0, 0, 0 ],
      bounds = [ Bump.Vector3.create( -10, -10, -10 ),
                 Bump.Vector3.create(  10,  10,  10 ) ],
      tMin = {};

  testFunc( Bump, 'RayAabb2', {
    isStaticFunc: true,
    args: [
      [ rayStart, rayInvDir, signs, bounds, { param: tMin, expected: { tmin: 0 } }, 0, 1 ]
    ],
    expected: [
      false
    ]
  });
});

module( 'AabbUtil2.RayAabb' );

test( 'test skipped', function() {
  // var rayFrom = Bump.Vector3.create( 0.5, 0.5, 0.5),
  //     rayTo = Bump.Vector3.create( 1.5, 0.5, 0.5 ),
  //     aabbMin = Bump.Vector3.create( 0, 0, 0 ),
  //     aabbMax = Bump.Vector3.create( 1, 1, 1 ),
  //     param = { param: 0 },
  //     normal = Bump.Vector3.create();

  // testFunc( Bump, 'RayAabb', {
  //   isStaticFunc: true,
  //   args: [
  //     [
  //       rayFrom, rayTo,
  //       aabbMin, aabbMax,
  //       { param: param, isConst: false },
  //       { param: normal, isConst: false }
  //     ]
  //   ],
  //   expected: [
  //     true
  //   ]
  // });
});

module( 'AabbUtil2.TransformAabbWithExtents' );

test( 'test skipped', function() {});

module( 'AabbUtil2.TransformAabb' );

test( 'test skipped', function() {});

module( 'AabbUtil2.testQuantizedAabbAgainstQuantizedAabb' );

test( 'test skipped', function() {});
