module( 'Vector3' );

test( 'Bump.Vector3 exists', 1, function() {
  ok( Bump.Vector3, 'Bump.Vector3 exists' );
});

test( 'type members exist', 2, function() {
  ok( Bump.Vector3.create, 'create exists' );
  ok( Bump.Vector3.clone, 'clone exists' );
});

test( 'create', 2, function() {

  var v0 = Bump.Vector3.create(),
  v1 = Bump.Vector3.create( 1, 2, 3 );

  ok( v0, 'object created' );
  ok( v1, 'object created' );
});

test( 'member functions exist', 48, function() {
  var v0 = Bump.Vector3.create();

  ok( v0.clone, 'clone exists' );
  ok( v0.add, 'add exists' );
  ok( v0.addSelf, 'addSelf exists' );
  ok( v0.subtract, 'subtract exists' );
  ok( v0.subtractSelf, 'subtractSelf exists' );
  ok( v0.multiplyScalar, 'multiplyScalar exists' );
  ok( v0.multiplyScalarSelf, 'multiplyScalarSelf exists' );
  ok( v0.multiplyVector, 'mulitplyVector exists' );
  ok( v0.multiplyVectorSelf, 'multiplyVectorSelf exists' );
  ok( v0.divideScalar, 'divideScalar exists' );
  ok( v0.divideScalarSelf, 'divideScalarSelf exists' );
  ok( v0.divideVector, 'divideVector exists' );
  ok( v0.divideVectorSelf, 'divideVectorSelf exists' );
  ok( v0.dot, 'dot exists' );
  ok( v0.length2, 'length2 exists' );
  ok( v0.length, 'length exists' );
  ok( v0.distance2, 'distance2 exists' );
  ok( v0.distance, 'distance exists' );
  ok( v0.safeNormalize, 'safeNormalize exists' );
  ok( v0.normalize, 'normalize exists' );
  ok( v0.normalized, 'normalized exists' );
  ok( v0.rotate, 'rotate exists' );
  ok( v0.angle, 'angle exists' );
  ok( v0.negate, 'negate exists' );
  ok( v0.absolute, 'absolute exists' );
  ok( v0.cross, 'cross exists' );
  ok( v0.triple, 'triple exists' );
  ok( v0.minAxis, 'minAxis exists' );
  ok( v0.minAxis, 'minProperty exists' );
  ok( v0.min, 'min exists' );
  ok( v0.maxAxis, 'maxAxis exists' );
  ok( v0.maxAxis, 'maxProperty exists' );
  ok( v0.max, 'max exists' );
  ok( v0.furthestAxis, 'furthestAxis exists' );
  ok( v0.furthest, 'furthest exists' );
  ok( v0.closestAxis, 'closestAxis exists' );
  ok( v0.closest, 'closest exists' );
  ok( v0.setInterpolate3, 'setInterpolate3 exists' );
  ok( v0.lerp, 'lerp exists' );
  ok( v0.equal, 'equal exists' );
  ok( v0.notEqual, 'notEqual exists' );
  ok( v0.setMax, 'setMax exists' );
  ok( v0.setMin, 'setMin exists' );
  ok( v0.setValue, 'setValue exists' );
  ok( v0.getSkewSymmetricMatrix, 'getSkewSymmetricMatrix exists' );
  ok( v0.setZero, 'setZero exists' );
  ok( v0.isZero, 'isZero exists' );
  ok( v0.fuzzyZero, 'fuzzyZero exists' );
});

module( 'Vector3.assign' );

test( 'basic', function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 ),
      v1 = Bump.Vector3.create();

  notDeepEqual( v0, v1 );
  v1.assign( v0 );
  deepEqual( v0, v1 );
});

module( 'Vector3 properties' );

test( 'basic', 16, function() {
  var v0 = Bump.Vector3.create(),
      v1 = Bump.Vector3.create( 1, 2, 3 );

  equal( v0.x, 0, 'initialization : x == 0' );
  equal( v0.y, 0, 'initialization : y == 0' );
  equal( v0.z, 0, 'initialization : z == 0' );
  equal( v0.w, 0, 'initialization : w == 0' );

  equal( v1.x, 1, 'initialization : x == 1' );
  equal( v1.y, 2, 'initialization : y == 2' );
  equal( v1.z, 3, 'initialization : z == 3' );
  equal( v1.w, 0, 'initialization : w == 0' );

  equal( v1[0], 1, 'initialization : property [0] getter works' );
  equal( v1[1], 2, 'initialization : property [1] getter works' );
  equal( v1[2], 3, 'initialization : property [2] getter works' );
  equal( v1[3], 0, 'initialization : property [3] getter works' );

  v1[0] = 10;
  v1[1] = 9;
  v1[2] = 8;
  v1[3] = 7;

  equal( v1.x, 10, 'setter for property [0] changes x' );
  equal( v1.y, 9, 'setter for property [1] changes y' );
  equal( v1.z, 8, 'setter for property [2] changes z' );
  equal( v1.w, 7, 'setter for property [3] changes w' );

});

module( 'Vector3.add' );

test( 'basic', 15, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 ),
      v1 = Bump.Vector3.create( 1, -2, 0 );

  testFunc( Bump.Vector3, 'add', {
    objects: v0,
    args: [ [ v1 ] ],
    expected: [ Bump.Vector3.create( 2, 0, 3 ) ],
    destType: Bump.Vector3
  });
});

module( 'Vector3.addSelf' );

test( 'basic', 4, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 ),
      v1 = Bump.Vector3.create( 1, -2, 0 );

  testFunc( Bump.Vector3, 'addSelf', {
    objects: v0,
    args: [ [ v1 ] ],
    expected: [ Bump.Vector3.create( 2, 0, 3 ) ],
    modifiesSelf: true
  });
});

module( 'Vector3.subtract' );

test( 'subtract', 15, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 ),
      v1 = Bump.Vector3.create( 1, -2, 0 );

  testFunc( Bump.Vector3, 'subtract', {
    objects: v0,
    args: [ [ v1 ] ],
    expected: [ Bump.Vector3.create( 0, 4, 3 ) ],
    destType: Bump.Vector3
  });
});

module( 'Vector3.subtractSelf' );

test( 'basic', 4, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 ),
      v1 = Bump.Vector3.create( 1, -2, 0 );

  testFunc( Bump.Vector3, 'subtractSelf', {
    objects: v0,
    args: [ [ v1 ] ],
    expected: [ Bump.Vector3.create( 0, 4, 3 ) ],
    modifiesSelf: true
  });
});

module( 'Vector3.multiplyScalar' );

test( 'basic', 11, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 );

  testFunc( Bump.Vector3, 'multiplyScalar', {
    objects: v0,
    args: [ [ 2 ] ],
    expected: [ Bump.Vector3.create( 2, 4, 6 ) ],
    destType: Bump.Vector3
  });
});

module( 'Vector3.multiplyScalarSelf' );

test( 'basic', 4, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 );

  testFunc( Bump.Vector3, 'multiplyScalarSelf', {
    objects: v0,
    args: [ [ 2 ] ],
    expected: [ Bump.Vector3.create( 2, 4, 6 ) ],
    modifiesSelf: true
  });
});

module( 'Vector3.multiplyVector' );

test( 'basic', 15, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 ),
      v1 = Bump.Vector3.create( 2, -1, 0 );

  testFunc( Bump.Vector3, 'multiplyVector', {
    objects: v0,
    args: [ [ v1 ] ],
    expected: [ Bump.Vector3.create( 2, -2, 0 ) ],
    destType: Bump.Vector3
  });
});

module( 'Vector3.multiplyVectorSelf' );

test( 'basic', 4, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 ),
      v1 = Bump.Vector3.create( 2, -1, 0 );

  testFunc( Bump.Vector3, 'multiplyVectorSelf', {
    objects: v0,
    args: [ [ v1 ] ],
    expected: [ Bump.Vector3.create( 2, -2, 0 ) ],
    modifiesSelf: true
  });
});

module( 'Vector3.divideScalar' );

test( 'basic', 11, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 );

  testFunc( Bump.Vector3, 'divideScalar', {
    objects: v0,
    args: [ [ 2 ] ],
    expected: [ Bump.Vector3.create( 0.5, 1, 1.5 ) ],
    destType: Bump.Vector3
  });
});

module( 'Vector3.divideScalarSelf' );

test( 'basic', 4, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 );

  testFunc( Bump.Vector3, 'divideScalarSelf', {
    objects: v0,
    args: [ [ 2 ] ],
    expected: [ Bump.Vector3.create( 0.5, 1, 1.5 ) ],
    modifiesSelf: true
  });
});

module( 'Vector3.divideVector' );

test( 'divideVector', 15, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 ),
      v1 = Bump.Vector3.create( 2, 1, -3 );

  testFunc( Bump.Vector3, 'divideVector', {
    objects: v0,
    args: [ [ v1 ] ],
    expected: [ Bump.Vector3.create( 0.5, 2, -1 ) ],
    destType: Bump.Vector3
  });
});

module( 'Vector3.divideVectorSelf' );

test( 'basic', 4, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 ),
      v1 = Bump.Vector3.create( 2, 1, -3 );

  testFunc( Bump.Vector3, 'divideVectorSelf', {
    objects: v0,
    args: [ [ v1 ] ],
    expected: [ Bump.Vector3.create( 0.5, 2, -1 ) ],
    modifiesSelf: true
  });
});

module( 'Vector3.dot' );

test( 'basic', 4, function() {
  var v0 = Bump.Vector3.create( 1, 1, 1 ),
      v1 = Bump.Vector3.create( 2, 2, 2 );

  testFunc( Bump.Vector3, 'dot', {
    objects: v0,
    args: [ [ v1 ] ],
    expected: [ 6 ]
  });
});

module( 'Vector3.length2' );

test( 'basic', 3, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 );

  testFunc( Bump.Vector3, 'length2', {
    objects: v0,
    expected: [ 14 ]
  });
});

module( 'Vector3.length' );

test( 'length function', 5, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 );

  testFunc( Bump.Vector3, 'length', {
    objects: [
      Bump.Vector3.create( 1, 2, 3 ),
      Bump.Vector3.create( 0, 1, -1 )
    ],
    expected: [
      Math.sqrt( 14 ),
      Math.sqrt( 2 )
    ]
  });
});

module( 'Vector3.distance2' );

test( 'basic', 4, function() {
  var v0 = Bump.Vector3.create( 2, 2, 2 ),
      v1 = Bump.Vector3.create( -1, -1, -1 );

  testFunc( Bump.Vector3, 'distance2', {
    objects: v0,
    args: [ [ v1 ] ],
    expected: [ 27 ]
  });
});

module( 'Vector3.distance' );

test( 'distance function', 4, function() {
  var v0 = Bump.Vector3.create( 2, 2, 2 ),
      v1 = Bump.Vector3.create( -1, -1, -1 );

  testFunc( Bump.Vector3, 'distance', {
    objects: v0,
    args: [ [ v1 ] ],
    expected: [ Math.sqrt( 27 ) ]
  });
});

module( 'Vector3.safeNormalize' );

test( 'safeNormalize', 7, function() {
  testFunc( Bump.Vector3, 'safeNormalize', {
    objects: [
      Bump.Vector3.create( 2, 0, 0 ),
      Bump.Vector3.create( 0, 1, -1 ),
      Bump.Vector3.create( 0, 0, 0 )
    ],
    expected: [
      Bump.Vector3.create( 1, 0, 0 ),
      Bump.Vector3.create( 0, 7.07106781186547462e-01, -7.07106781186547462e-01 ),
      Bump.Vector3.create( 1, 0, 0 )
    ],
    modifiesSelf: true
  });
});

module( 'Vector3.normalize' );

test( 'basic', 5, function() {
  testFunc( Bump.Vector3, 'normalize', {
    objects: [
      Bump.Vector3.create( 2, 0, 0 ),
      Bump.Vector3.create( 0, 1, -1 )
    ],
    expected: [
      Bump.Vector3.create( 1, 0, 0 ),
      Bump.Vector3.create( 0, 7.07106781186547462e-01, -7.07106781186547462e-01 )
    ],
    modifiesSelf: true
  });
});

module( 'Vector3.normalized' );

test( 'basic', 15, function() {
  var v0 = Bump.Vector3.create( 2, 0, 0 ),
      v1 = Bump.Vector3.create( 0, 1, -1 );

  testFunc( Bump.Vector3, 'normalized', {
    objects: [ v0, v1 ],
    expected: [
      Bump.Vector3.create( 1, 0, 0 ),
      Bump.Vector3.create( 0, 7.07106781186547462e-01, -7.07106781186547462e-01 )
    ],
    destType: Bump.Vector3
  });
});

module( 'Vector3.rotate' );

// definitely should add more tests for this one
test( 'basic', 19, function() {
  var v0 = Bump.Vector3.create( 1, 0, 0 ),
      zAxis = Bump.Vector3.create( 0, 0, 1 );

  testFunc( Bump.Vector3, 'rotate', {
    objects: v0,
    args: [ [ zAxis, Math.PI / 2 ] ],
    expected: [
      Bump.Vector3.create( 6.12323399573676604e-17, 1, 0 )
    ],
    destType: Bump.Vector3
  });
});

module( 'Vector3.angle' );

test( 'basic', 22, function() {
  var right = Bump.Vector3.create( 1, 0, 0 ),
      up = Bump.Vector3.create( 0, 1, 0 ),
      left = Bump.Vector3.create( -1, 0, 0 ),
      forward = Bump.Vector3.create( 0, 0, 1 ),
      upRight = Bump.Vector3.create( 1, 1, 0 );

  testFunc( Bump.Vector3, 'angle', {
    objects: [
      right,
      right,
      right,
      right,
      left,
      up,
      forward
    ],
    args: [
      [ up ],
      [ forward ],
      [ left ],
      [ upRight ],
      [ upRight ],
      [ upRight ],
      [ upRight ]
    ],
    expected: [
      1.57079632679489656e+00,
      1.57079632679489656e+00,
      3.14159265358979312e+00,
      7.85398163397448390e-01,
      2.35619449019234484e+00,
      7.85398163397448390e-01,
      1.57079632679489656e+00
    ]
  });
});

module( 'Vector3.negate' );

test( 'basic', 8, function() {
  var v0 = Bump.Vector3.create( -1, -2, 3 );

  testFunc( Bump.Vector3, 'negate', {
    objects: v0,
    expected: [ Bump.Vector3.create( 1, 2, -3 ) ],
    destType: Bump.Vector3
  });
});

module( 'Vector3.absolute' );

test( 'basic', 8, function() {
  var v0 = Bump.Vector3.create( -1, -2, 3 );

  testFunc( Bump.Vector3, 'absolute', {
    objects: v0,
    expected: [ Bump.Vector3.create( 1, 2, 3 ) ],
    destType: Bump.Vector3
  });
});

module( 'Vector3.cross' );

test( 'basic', 426, function() {
  // given params for a "right", "up" and "forward" perpendicular vectors,
  // checks cross products between them (5 tests total)
  var crossTest = function( right, up, forward ) {
    right.safeNormalize();
    up.safeNormalize();
    forward.safeNormalize();

    testFunc( Bump.Vector3, 'cross', {
      objects: [ right, up, forward ],
      args: [ [ up ], [ forward ], [ right ] ],
      expected: [ forward, right, up ],
      epsilon: Math.pow( 2, -48 ),
      destType: Bump.Vector3
    });
  }

  crossTest(
    Bump.Vector3.create( 1, 0, 0 ),
    Bump.Vector3.create( 0, 1, 0 ),
    Bump.Vector3.create( 0, 0, 1 )
  );
  crossTest(
    Bump.Vector3.create( 1, 1, 0 ),
    Bump.Vector3.create(-1, 1, 0 ),
    Bump.Vector3.create( 0, 0, 1 )
  );
  crossTest(
    Bump.Vector3.create( 1, 0, 1 ),
    Bump.Vector3.create( 0, 1, 0 ),
    Bump.Vector3.create(-1, 0, 1 )
  );
});

module( 'Vector3.crossSelf' );

test( 'basic', 111, function() {
  // given params for a "right", "up" and "forward" perpendicular vectors,
  // checks cross products between them (5 tests total)
  var crossTest = function( right, up, forward ) {
    right.safeNormalize();
    up.safeNormalize();
    forward.safeNormalize();

    testFunc( Bump.Vector3, 'crossSelf', {
      objects: [ right, up, forward ],
      args: [ [ up ], [ forward ], [ right ] ],
      expected: [ forward, right, up ],
      epsilon: Math.pow( 2, -48 ),
      modifiesSelf: true
    });
  }

  crossTest(
    Bump.Vector3.create( 1, 0, 0 ),
    Bump.Vector3.create( 0, 1, 0 ),
    Bump.Vector3.create( 0, 0, 1 )
  );
  crossTest(
    Bump.Vector3.create( 1, 1, 0 ),
    Bump.Vector3.create(-1, 1, 0 ),
    Bump.Vector3.create( 0, 0, 1 )
  );
  crossTest(
    Bump.Vector3.create( 1, 0, 1 ),
    Bump.Vector3.create( 0, 1, 0 ),
    Bump.Vector3.create(-1, 0, 1 )
  );
});

module( 'Vector3.triple' );

test( 'basic', 9, function() {
  testFunc( Bump.Vector3, 'triple', {
    objects: [
      Bump.Vector3.create( 1, 0, 0 ),
      Bump.Vector3.create( 0, 1, 0 )
    ],
    args: [
      [ Bump.Vector3.create( 1, 0, 0 ), Bump.Vector3.create( 0, 1, 0 ) ],
      [ Bump.Vector3.create( 0, 0, 1 ), Bump.Vector3.create( 1, 0, 0 ) ]
    ],
    expected: [ 0, 1 ]
  });
});

module( 'Vector3.minAxis' );

test( 'basic', 15, function() {
  testFunc( Bump.Vector3, 'minAxis', {
    objects: [
      Bump.Vector3.create( 0, 0, 0 ),
      Bump.Vector3.create( 1, 0, 0 ),
      Bump.Vector3.create( 0, 1, 0 ),
      Bump.Vector3.create( 0, 0, 1 ),
      Bump.Vector3.create( 0, 2, 3 ),
      Bump.Vector3.create( 0, 3, -4 ),
      Bump.Vector3.create( -1, -3, -2 )
    ],
    expected: [ 2, 2, 2, 1, 0, 2, 1 ]
  });
});

module( 'Vector3.minProperty' );

test( 'basic', 15, function() {
  testFunc( Bump.Vector3, 'minProperty', {
    objects: [
      Bump.Vector3.create( 0, 0, 0 ),
      Bump.Vector3.create( 1, 0, 0 ),
      Bump.Vector3.create( 0, 1, 0 ),
      Bump.Vector3.create( 0, 0, 1 ),
      Bump.Vector3.create( 0, 2, 3 ),
      Bump.Vector3.create( 0, 3, -4 ),
      Bump.Vector3.create( -1, -3, -2 )
    ],
    expected: [ 'z', 'z', 'z', 'y', 'x', 'z', 'y' ]
  });
});

module( 'Vector3.min' );

test( 'basic', 15, function() {
  testFunc( Bump.Vector3, 'min', {
    objects: [
      Bump.Vector3.create( 0, 0, 0 ),
      Bump.Vector3.create( 1, 0, 0 ),
      Bump.Vector3.create( 0, 1, 0 ),
      Bump.Vector3.create( 0, 0, 1 ),
      Bump.Vector3.create( 0, 2, 3 ),
      Bump.Vector3.create( 0, 3, -4 ),
      Bump.Vector3.create( -1, -3, -2 )
    ],
    expected: [ 0, 0, 0, 0, 0, -4, -3 ]
  });
});

module( 'Vector3.maxAxis' );

test( 'basic', 7, function() {
  equal( Bump.Vector3.create().maxAxis(), 0 );
  equal( Bump.Vector3.create( -1 , 0,  0 ).maxAxis(), 1 );
  equal( Bump.Vector3.create(  0, -1,  0 ).maxAxis(), 0 );
  equal( Bump.Vector3.create(  0,  0, -1 ).maxAxis(), 0 );
  equal( Bump.Vector3.create(  0,  2,  3 ).maxAxis(), 2 );
  equal( Bump.Vector3.create(  0,  3, -4 ).maxAxis(), 1 );
  equal( Bump.Vector3.create( -1, -3, -2 ).maxAxis(), 0 );
});

module( 'Vector3.maxProperty' );

test( 'basic', 7, function() {
  equal( Bump.Vector3.create().maxProperty(), 'x' );
  equal( Bump.Vector3.create( -1,  0,  0 ).maxProperty(), 'y' );
  equal( Bump.Vector3.create(  0, -1,  0 ).maxProperty(), 'x' );
  equal( Bump.Vector3.create(  0,  0, -1 ).maxProperty(), 'x' );
  equal( Bump.Vector3.create(  0,  2,  3 ).maxProperty(), 'z' );
  equal( Bump.Vector3.create(  0,  3, -4 ).maxProperty(), 'y' );
  equal( Bump.Vector3.create( -1, -3, -2 ).maxProperty(), 'x' );
});

module( 'Vector3.max' );

test( 'basic', 7, function() {
  equal( Bump.Vector3.create().max(), 0 );
  equal( Bump.Vector3.create( -1,  0,  0 ).max(),  0 );
  equal( Bump.Vector3.create(  0, -1,  0 ).max(),  0 );
  equal( Bump.Vector3.create(  0,  0, -1 ).max(),  0 );
  equal( Bump.Vector3.create(  0,  2,  3 ).max(),  3 );
  equal( Bump.Vector3.create(  0,  3, -4 ).max(),  3 );
  equal( Bump.Vector3.create( -1, -3, -2 ).max(), -1 );
});

module( 'Vector3.furthestAxis' );

test( 'basic', 7, function() {
  equal( Bump.Vector3.create().furthestAxis(), 2 );
  equal( Bump.Vector3.create(  1,  0,  0 ).furthestAxis(), 2 );
  equal( Bump.Vector3.create(  0,  1,  0 ).furthestAxis(), 2 );
  equal( Bump.Vector3.create(  0,  0,  1 ).furthestAxis(), 1 );
  equal( Bump.Vector3.create(  0,  2,  3 ).furthestAxis(), 0 );
  equal( Bump.Vector3.create(  4,  1, -3 ).furthestAxis(), 1 );
  equal( Bump.Vector3.create( -2, -3, -1 ).furthestAxis(), 2 );
});

module( 'Vector3.furthest' );

test( 'basic', 7, function() {
  equal( Bump.Vector3.create().furthest(), 0 );
  equal( Bump.Vector3.create(  1,  0,  0 ).furthest(), 0 );
  equal( Bump.Vector3.create(  0,  1,  0 ).furthest(), 0 );
  equal( Bump.Vector3.create(  0,  0,  1 ).furthest(), 0 );
  equal( Bump.Vector3.create(  0,  2,  3 ).furthest(), 0 );
  equal( Bump.Vector3.create(  4,  1, -3 ).furthest(), 1 );
  equal( Bump.Vector3.create( -2, -3, -1 ).furthest(), 1 );
});

module( 'Vector3.closestAxis' );

test( 'basic', 7, function() {
  equal( Bump.Vector3.create().closestAxis(), 0 );
  equal( Bump.Vector3.create(  0,  1,  1 ).closestAxis(), 1 );
  equal( Bump.Vector3.create(  1,  0,  1 ).closestAxis(), 0 );
  equal( Bump.Vector3.create(  1,  1,  0 ).closestAxis(), 0 );
  equal( Bump.Vector3.create(  0,  2,  3 ).closestAxis(), 2 );
  equal( Bump.Vector3.create(  4,  1, -3 ).closestAxis(), 0 );
  equal( Bump.Vector3.create( -2, -3, -1 ).closestAxis(), 1 );
});

module( 'Vector3.closest' );

test( 'basic', 13, function() {
  testFunc( Bump.Vector3, 'closest', {
    objects: [
      Bump.Vector3.create(  0,  1,  1 ),
      Bump.Vector3.create(  1,  0,  1 ),
      Bump.Vector3.create(  1,  1,  0 ),
      Bump.Vector3.create(  0,  2,  3 ),
      Bump.Vector3.create(  4,  1, -3 ),
      Bump.Vector3.create( -2, -3, -1 )
    ],
    expected: [ 1, 1, 1, 3, 4, 3 ]
  });
});

module( 'Vector3.setInterpolate3' );

test( 'basic', 10, function() {
  var right = Bump.Vector3.create( 1, 0, 0 ),
      up = Bump.Vector3.create( 0, 1, 0 ),
      forward = Bump.Vector3.create( 0, 0, 1 ),
      lerped = Bump.Vector3.create();

  testFunc( Bump.Vector3, 'setInterpolate3', {
    objects: [ lerped, up ],
    args: [ [ right, up, 0.5 ], [ up, forward, 0.3 ] ],
    expected: [
      Bump.Vector3.create( 0.5, 0.5, 0 ),
      Bump.Vector3.create( 0, 0.699999999999999956, 0.299999999999999989 )
    ],
    modifiesSelf: true
  });
});

module( 'Vector3.lerp' );

test( 'basic', 37, function() {
  var right = Bump.Vector3.create( 1, 0, 0 ),
      up = Bump.Vector3.create( 0, 1, 0 ),
      forward = Bump.Vector3.create( 0, 0, 1 );

  testFunc( Bump.Vector3, 'lerp', {
    objects: [ right, up ],
    args: [ [ up, 0.5 ], [ forward, 0.3 ] ],
    expected: [
      Bump.Vector3.create( 0.5, 0.5, 0 ),
      Bump.Vector3.create( 0, 0.699999999999999956, 0.299999999999999989 )
    ],
    destType: Bump.Vector3
  });
});

module( 'Vector3.equal' );

test( 'basic', 13, function() {
  testFunc( Bump.Vector3, 'equal', {
    objects: [
      Bump.Vector3.create(),
      Bump.Vector3.create( Bump.SIMD_EPSILON, 0, 0 ),
      Bump.Vector3.create( 0, Bump.SIMD_EPSILON, 0 ),
      Bump.Vector3.create( 0, 0, Bump.SIMD_EPSILON )
    ],
    args: [
      [ Bump.Vector3.create() ],
      [ Bump.Vector3.create() ],
      [ Bump.Vector3.create() ],
      [ Bump.Vector3.create() ]
    ],
    expected: [ true, false, false, false ]
  });
});

module( 'Vector3.notEqual' );

test( 'basic', 13, function() {
  testFunc( Bump.Vector3, 'notEqual', {
    objects: [
      Bump.Vector3.create(),
      Bump.Vector3.create( Bump.SIMD_EPSILON, 0, 0 ),
      Bump.Vector3.create( 0, Bump.SIMD_EPSILON, 0 ),
      Bump.Vector3.create( 0, 0, Bump.SIMD_EPSILON )
    ],
    args: [
      [ Bump.Vector3.create() ],
      [ Bump.Vector3.create() ],
      [ Bump.Vector3.create() ],
      [ Bump.Vector3.create() ]
    ],
    expected: [ false, true, true, true ]
  });
});

module( 'Vector3.setMax' );

test( 'basic', 4, function() {
  var v0 = Bump.Vector3.create( 1, 4, 9 );

  testFunc( Bump.Vector3, 'setMax', {
    objects: v0,
    args: [ [ Bump.Vector3.create( 5, 1, 9 ) ] ],
    expected: [ Bump.Vector3.create( 5, 4, 9 ) ],
    modifiesSelf: true
  });
});

module( 'Vector3.setMin' );

test( 'basic', 4, function() {
  var v0 = Bump.Vector3.create( 1, 4, 9 );

  testFunc( Bump.Vector3, 'setMin', {
    objects: v0,
    args: [ [ Bump.Vector3.create( 5, 1, 9 ) ] ],
    expected: [ Bump.Vector3.create( 1, 1, 9 ) ],
    modifiesSelf: true
  });
});

module( 'Vector3.setValue' );

test( 'basic', 6, function() {
  var v = Bump.Vector3.create( 1, 4, 9, 7 );

  testFunc( Bump.Vector3, 'setValue', {
    objects: v,
    args: [ [ 5, 1, 9 ] ],
    expected: [ Bump.Vector3.create( 5, 1, 9 ) ],
    modifiesSelf: true
  });
});

module( 'Vector3.getSkewSymmetricMatrix' );

test( 'basic', 101, function() {
  var objects = [];
  var args = [];
  for ( var i = 0; i < 20; ++i ) {
    var argSet = [];
    var x = Math.random();
    var y = Math.random();
    var z = Math.random();

    objects.push( Bump.Vector3.create( x, y, z ) );
    argSet.push({
      param: Bump.Vector3.create(),
      expected: Bump.Vector3.create( 0, -z, y )
    });
    argSet.push({
      param: Bump.Vector3.create(),
      expected: Bump.Vector3.create( z, 0, -x )
    });
    argSet.push({
      param: Bump.Vector3.create(),
      expected: Bump.Vector3.create( -y, x, 0 )
    });
    args.push( argSet );
  }

  testFunc( Bump.Vector3, 'getSkewSymmetricMatrix', {
    objects: objects,
    args: args
  });
});

module( 'Vector3.setZero' );

test( 'basic', 10, function() {
  for ( var i = 0; i < 5; i++ ) {
    var v = Bump.Vector3.create( Math.random(), Math.random(), Math.random() ),
    ret = v.setZero();
    ok( ret === v, 'return reference is correct' );
    deepEqual( v, Bump.Vector3.create( 0, 0, 0 ), 'correct result' );
  }
});

module( 'Vector3.isZero' );

test( 'basic', 6, function() {
  var v = Bump.Vector3.create();

  ok( v.isZero() );
  ok( !Bump.Vector3.create( Bump.SIMD_EPSILON, 0, 0 ).isZero() );
  ok( !Bump.Vector3.create( 0, Bump.SIMD_EPSILON, 0 ).isZero() );
  ok( !Bump.Vector3.create( 0, 0, Bump.SIMD_EPSILON ).isZero() );

  v = Bump.Vector3.create( Bump.SIMD_EPSILON, Bump.SIMD_EPSILON, Bump.SIMD_EPSILON );
  ok( !v.isZero() );
  v.setZero();
  ok( v.isZero() );
});

module( 'Vector3.fuzzyZero' );

test( 'basic', 7, function() {
  ok( Bump.Vector3.create( 0, 0, 0 ).fuzzyZero() );
  ok( !Bump.Vector3.create( Math.sqrt( Bump.SIMD_EPSILON ), 0, 0 ).fuzzyZero() );
  ok( !Bump.Vector3.create( 0, Math.sqrt( Bump.SIMD_EPSILON ), 0 ).fuzzyZero() );
  ok( !Bump.Vector3.create( 0, 0, Math.sqrt( Bump.SIMD_EPSILON ) ).fuzzyZero() );
  ok( Bump.Vector3.create( Bump.SIMD_EPSILON, 0, 0 ).fuzzyZero() );
  ok( Bump.Vector3.create( 0, Bump.SIMD_EPSILON, 0 ).fuzzyZero() );
  ok( Bump.Vector3.create( 0, 0, Bump.SIMD_EPSILON ).fuzzyZero() );
});

module( 'Vector4' );

test( 'creation', function() {
  var vecs = [
    Bump.Vector4.create(),
    Bump.Vector4.create(),
    Bump.Vector4.create( 4 ),
    Bump.Vector4.create( 3, 4 ),
    Bump.Vector4.create( 2, 3, 4 ),
    Bump.Vector4.create( 1, 2, 3, 4 )
  ];

  equal( vecs[0].x, 0 );
  equal( vecs[0].y, 0 );
  equal( vecs[0].z, 0 );
  equal( vecs[0].w, 0 );

  equal( vecs[1].x, 0 );
  equal( vecs[1].y, 0 );
  equal( vecs[1].z, 0 );
  equal( vecs[1].w, 0 );

  equal( vecs[2].x, 4 );
  equal( vecs[2].y, 0 );
  equal( vecs[2].z, 0 );
  equal( vecs[2].w, 0 );

  equal( vecs[3].x, 3 );
  equal( vecs[3].y, 4 );
  equal( vecs[3].z, 0 );
  equal( vecs[3].w, 0 );

  equal( vecs[4].x, 2 );
  equal( vecs[4].y, 3 );
  equal( vecs[4].z, 4 );
  equal( vecs[4].w, 0 );

  equal( vecs[5].x, 1 );
  equal( vecs[5].y, 2 );
  equal( vecs[5].z, 3 );
  equal( vecs[5].w, 4 );

  for ( var i = 0; i < vecs.length; ++i ) {
    for ( var j = i + 1; j < vecs.length; ++j ) {
      notStrictEqual( vecs[i], vecs[j] );
    }
  }
});

test( 'properties', function() {
  var vec = Bump.Vector4.create( 1, 2, 3, 4 );

  equal( vec[0], 1 );
  equal( vec[1], 2 );
  equal( vec[2], 3 );
  equal( vec[3], 4 );
});

module( 'Vector4.setValue' );

test( 'basic', function() {
  var vec = Bump.Vector4.create();

  testFunc( Bump.Vector4, 'setValue', {
    modifiesSelf: true,
    objects: vec,
    args: [
      [ 1, 2, 3, 4 ]
    ],
    expected: [
      Bump.Vector4.create( 1, 2, 3, 4 )
    ]
  });
});

module( 'Vector4.absolute4' );

test( 'basic', function() {
  var vec = Bump.Vector4.create( 1, -2, 3, -4 );

  testFunc( Bump.Vector4, 'absolute4', {
    destType: Bump.Vector4,
    objects: vec,
    expected: [
      Bump.Vector4.create( 1, 2, 3, 4 )
    ]
  });
});

module( 'Vector4.getW' );

test( 'basic', function() {
  var vec = Bump.Vector4.create( 1, 2, 3, 4 );

  testFunc( Bump.Vector4, 'getW', {
    objects: vec,
    expected: [ 4 ]
  });
});
