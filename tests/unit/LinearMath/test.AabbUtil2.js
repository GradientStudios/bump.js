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
      halfExtent = aabbMax.subtract( aabbMin ).multiplyScalar( 0.5 ),
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
      [ rayStart, rayInvDir, signs, bounds, { param: tMin, expected: { value: 0 } }, 0, 1 ]
    ],
    expected: [
      false
    ]
  });
});

module( 'AabbUtil2.RayAabb' );

test( 'basic', function() {
  var aabbMin = Bump.Vector3.create( 0, 0, 0 ),
      aabbMax = Bump.Vector3.create( 1, 1, 1 ),
      hitLambdaA = { param: 1 },
      hitLambdaB = { param: 1 },
      hitLambdaC = { param: 1 },
      normal = Bump.Vector3.create();

  testFunc( Bump, 'RayAabb', {
    isStaticFunc: true,
    args: [
      [
        Bump.Vector3.create( 0.5, 3, 0.5 ),
        Bump.Vector3.create( 0.5, 0.5, 0.5 ),
        aabbMin, aabbMax,
        { param: hitLambdaA, expected: { param: 0.8 } },
        { param: normal, expected: Bump.Vector3.create( 0, -1, 0 ) }
      ],
      [
        Bump.Vector3.create( 0, 1.5, 0 ),
        Bump.Vector3.create( 0, 0.5, 0 ),
        aabbMin, aabbMax,
        { param: hitLambdaB, expected: { param: 0.5 } },
        { param: normal, expected: Bump.Vector3.create( 0, -1, 0 ) }
      ],
      [
        Bump.Vector3.create( -Math.pow( 2, -48 ), 3, 0 ),
        Bump.Vector3.create( 0, 0.5, 0 ),
        aabbMin, aabbMax,
        { param: hitLambdaC, expected: { param: 1 } },
        { param: normal, expected: Bump.Vector3.create( 1, 0, 0 ) }
      ]
    ],
    expected: [
      true,
      true,
      true
    ]
  });
});

module( 'AabbUtil2.TransformAabbWithExtents' );

test( 'basic', function() {
  var t = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, 1, 1 ), Math.PI / 2 ),
        Bump.Vector3.create( 0.5, 0.5, 0.5 )
      ),
      aabbMin = Bump.Vector3.create(),
      aabbMax = Bump.Vector3.create();

  testFunc( Bump, 'TransformAabbWithExtents', {
    isStaticFunc: true,
    epsilon: Math.pow( 2, -48 ),
    args: [
      [
        Bump.Vector3.create( 0.48, 0.48, 0.48 ), 0.02, t,
        { param: aabbMin, expected: Bump.Vector3.create( -0.2440169358562926, -0.2440169358562926, -0.2440169358562925 ) },
        { param: aabbMax, expected: Bump.Vector3.create( 1.244016935856293, 1.244016935856293, 1.244016935856292 ) }
      ]
    ]
  });
});

module( 'AabbUtil2.TransformAabb' );

test( 'basic', function() {
  var t = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, 1, 1 ), Math.PI / 2 ),
        Bump.Vector3.create( 0.5, 0.5, 0.5 )
      ),
      aabbMin = Bump.Vector3.create(),
      aabbMax = Bump.Vector3.create();

  testFunc( Bump, 'TransformAabb', {
    isStaticFunc: true,
    epsilon: Math.pow( 2, -48 ),
    args: [
      [
        Bump.Vector3.create( -0.48, -0.48, -0.48 ),
        Bump.Vector3.create( 0.48, 0.48, 0.48 ),
        0.02,
        t,
        { param: aabbMin, expected: Bump.Vector3.create( -0.2440169358562926, -0.2440169358562926, -0.2440169358562925 ) },
        { param: aabbMax, expected: Bump.Vector3.create( 1.244016935856293, 1.244016935856293, 1.244016935856292 ) }
      ]
    ]
  });
});

module( 'AabbUtil2.testQuantizedAabbAgainstQuantizedAabb' );

test( 'test skipped', function() {
  expect( 0 );
});
