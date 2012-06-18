module( 'Bump.Quaternion' );

test( 'Quaternion exists', function() {
  ok( Bump.Quaternion );
});

function exist( method ) {
  return ok( method in Bump.Quaternion.prototype, method + ' exists' );
}

module( 'Quaternion.create (btQuadWord)' );
test( 'basic', function() {
  ok( Bump.Quaternion.create, 'create exists' );

  var a = Bump.Quaternion.create(),
      b = Bump.Quaternion.create(),
      c = Bump.Quaternion.create( 4, 3, 2, 1 );

  if ( a.x ) {
    equal( a.x, 0 );
    equal( a.y, 0 );
    equal( a.z, 0 );
    equal( a.w, 0 );

    equal( c.x, 4 );
    equal( c.y, 3 );
    equal( c.z, 2 );
    equal( c.w, 1 );
  }

  if ( a.floats ) {
    equal( a.floats[0], 0 );
    equal( a.floats[1], 0 );
    equal( a.floats[2], 0 );
    equal( a.floats[3], 0 );

    equal( c.floats[0], 4 );
    equal( c.floats[1], 3 );
    equal( c.floats[2], 2 );
    equal( c.floats[3], 1 );
  }

  var arr = [ a, b, c ];
  for ( var i = 0; i < arr.length - 1; ++i ) {
    for ( var j = i + 1; j < arr.length; ++j ) {
      notStrictEqual( arr[i], arr[j], 'creates unique objects' );
    }
  }
});

module( 'Quaternion.clone (btQuadWord)' );
test( 'static clone', function() {
  ok( Bump.Quaternion.clone, 'clone exists' );

  var a = Bump.Quaternion.create( 1, 2, 3, 4 ),
      aRef = a,
      b = Bump.Quaternion.clone( a );

  deepEqual( a, b );
  strictEqual( a, aRef, 'does not allocate new a' );
  notStrictEqual( a, b, 'clone creates new object' );
});

test( 'static clone: rand() test', function() {
  function rand() {
    return Math.random() * 2 - 1;
  }

  for ( var i = 0; i < 5; ++i ) {
    var a = Bump.Quaternion.create( rand(), rand(), rand(), rand() ),
        aRef = a,
        b = Bump.Quaternion.clone( a );

    deepEqual( a, b, 'clone is similar' );
    strictEqual( a, aRef, 'does not allocate new a' );
    notStrictEqual( a, b, 'clone creates new object' );
  }
});

test( 'member clone', function() {
  exist( 'clone' );

  var a = Bump.Quaternion.create( 1, 2, 3, 4 ),
      aRef = a,
      b = a.clone(),
      c = a.clone( Bump.Quaternion.create() );

  deepEqual( a, b );
  deepEqual( b, c );

  notStrictEqual( a, b, 'clone creates new object' );
  notStrictEqual( a, c, 'clone creates new object' );
  notStrictEqual( b, c, 'clone creates new object' );

  strictEqual( a, aRef, 'does not allocate new a' );
});

test( 'member clone: rand() test', function() {
  function rand() {
    return Math.random() * 2 - 1;
  }

  for ( var i = 0; i < 5; ++i ) {
    var a = Bump.Quaternion.create( rand(), rand(), rand(), rand() ),
        aRef = a,
        b = a.clone();

    deepEqual( a, b, 'clone is similar' );
    strictEqual( a, aRef, 'does not allocate new a' );
    notStrictEqual( a, b, 'clone creates new object' );
  }
});

module( 'Quaternion getters and setters (btQuadWord)' );
test( '[sg]et[XYZW]', function() {
  var components = [ 'X', 'Y', 'Z', 'W' ];
  for ( var i = 0; i < components.length; ++i ) {
    exist( 'get' + components[i] );
    exist( 'set' + components[i] );
  }

  var a = Bump.Quaternion.create( 9, 8, 7, 6 ),
      aRef = a;

  equal( a.getX(), 9 );
  equal( a.getY(), 8 );
  equal( a.getZ(), 7 );
  equal( a.getW(), 6 );

  a.setX( 42 );
  a.setY( Math.PI );
  a.setZ( Math.E );
  a.setW( Math.SQRT2 );

  if ( a.x ) {
    equal( a.x, 42 );
    equal( a.y, Math.PI );
    equal( a.z, Math.E );
    equal( a.w, Math.SQRT2 );
  }

  if ( a.floats ) {
    equal( a.floats[0], 42 );
    equal( a.floats[1], Math.PI );
    equal( a.floats[2], Math.E );
    equal( a.floats[3], Math.SQRT2 );
  }

  strictEqual( a, aRef, 'does not allocate new a' );
});

module( 'Quaternion unary operator* property (btQuadWord)' );
test( 'unary operator* property', function() {
  for ( var i = 0; i < 4; ++i ) {
    exist( i );
  }

  var a = Bump.Quaternion.create( 7, 6, 5, 4 ),
      aRef = a;

  equal( a[0], 7 );
  equal( a[1], 6 );
  equal( a[2], 5 );
  equal( a[3], 4 );

  a[0] = 42;
  a[1] = Math.PI;
  a[2] = Math.E;
  a[3] = Math.SQRT2;

  if ( a.x ) {
    equal( a.x, 42 );
    equal( a.y, Math.PI );
    equal( a.z, Math.E );
    equal( a.w, Math.SQRT2 );
  }

  if ( a.floats ) {
    equal( a.floats[0], 42 );
    equal( a.floats[1], Math.PI );
    equal( a.floats[2], Math.E );
    equal( a.floats[3], Math.SQRT2 );
  }

  strictEqual( a, aRef, 'does not allocate new a' );
});

module( 'Quaternion equal and notEqual (btQuadWord)' );
test( 'basic', function() {
  exist( 'equal' );
  exist( 'notEqual' );

  var EPSILON = Math.pow( 2, -52 ),
      a = Bump.Quaternion.create( 1, 2, 3, 4 ),
      aRef = a,
      b = a.clone(),
      c = Bump.Quaternion.create( 1 + EPSILON, 2, 3, 4 );

  equal( a.equal( b ), true );
  equal( a.equal( c ), false );
  strictEqual( a, aRef, 'does not allocate new a' );
});

module( 'Quaternion.setValue (btQuadWord)' );
test( 'basic', function() {
  exist( 'setValue' );

  var a = Bump.Quaternion.create(),
      aRef = a;

  a.setValue( 42, Math.PI, Math.E, Math.SQRT2 );

  if ( a.x ) {
    equal( a.x, 42 );
    equal( a.y, Math.PI );
    equal( a.z, Math.E );
    equal( a.w, Math.SQRT2 );
  }

  if ( a.floats ) {
    equal( a.floats[0], 42 );
    equal( a.floats[1], Math.PI );
    equal( a.floats[2], Math.E );
    equal( a.floats[3], Math.SQRT2 );
  }

  strictEqual( a, aRef, 'does not allocate new a' );
});

module( 'Quaternion.setMin (btQuadWord)' );
test( 'setMin', function() {
  exist( 'setMin' );

  var a = Bump.Quaternion.create( 1, 3, 5, 7 ),
      aRef = a,
      b = Bump.Quaternion.create( 8, 6, 4, 2 ),
      bRef = b,
      bClone = b.clone();

  a.setMin( b );

  if ( a.x ) {
    equal( a.x, 1 );
    equal( a.y, 3 );
    equal( a.z, 4 );
    equal( a.w, 2 );
  }

  if ( a.floats ) {
    equal( a.floats[0], 1 );
    equal( a.floats[1], 3 );
    equal( a.floats[2], 4 );
    equal( a.floats[3], 2 );
  }

  strictEqual( a, aRef, 'does not allocate new a' );
  strictEqual( b, bRef, 'does not allocate new b' );
  deepEqual( b, bClone, 'does not change b' );
});

module( 'Quaternion.setMax (btQuadWord)' );
test( 'setMax', function() {
  exist( 'setMax' );

  var a = Bump.Quaternion.create( 1, 3, 5, 7 ),
      aRef = a,
      b = Bump.Quaternion.create( 8, 6, 4, 2 ),
      bRef = b,
      bClone = b.clone();

  a.setMax( b );

  if ( a.x ) {
    equal( a.x, 8 );
    equal( a.y, 6 );
    equal( a.z, 5 );
    equal( a.w, 7 );
  }

  if ( a.floats ) {
    equal( a.floats[0], 8 );
    equal( a.floats[1], 6 );
    equal( a.floats[2], 5 );
    equal( a.floats[3], 7 );
  }

  strictEqual( a, aRef, 'does not allocate new a' );
  strictEqual( b, bRef, 'does not allocate new b' );
  deepEqual( b, bClone, 'does not change b' );
});

module( 'Quaternion.createWithEuler' );
test( 'basic', function() {
  var a = Bump.Quaternion.createWithEuler( 0, 0, 0 );

  ok( a instanceof Bump.Quaternion.prototype.constructor );
});

module( 'Quaternion.setRotation' );
test( 'basic', function() {
  exist( 'setRotation' );

  var a = Bump.Quaternion.create(),
      aRef = a,
      aExpected = Bump.Quaternion.create( 0.5, 0.5, 0.5, 0.5 ),
      EPSILON = Math.pow( 2, -48 );

  a.setRotation( Bump.Vector3.create( 1, 1, 1 ), 2 * Math.PI / 3 );

  if ( a.x ) {
    ok( Math.abs( a.x - aExpected.x ) < EPSILON &&
        Math.abs( a.y - aExpected.y ) < EPSILON &&
        Math.abs( a.z - aExpected.z ) < EPSILON &&
        Math.abs( a.w - aExpected.w ) < EPSILON );
  }

  if ( a.floats ) {
    ok( Math.abs( a.floats[0] - aExpected.floats[0] ) < EPSILON &&
        Math.abs( a.floats[1] - aExpected.floats[1] ) < EPSILON &&
        Math.abs( a.floats[2] - aExpected.floats[2] ) < EPSILON &&
        Math.abs( a.floats[3] - aExpected.floats[3] ) < EPSILON );
  }

  strictEqual( a, aRef, 'does not allocate new a' );
});

module( 'Quaternion.setEuler' );
test( 'basic', function() {
  exist( 'setEuler' );

  var a = Bump.Quaternion.create(),
      aRef = a,
      aExpected = Bump.Quaternion.create( 0.5, 0.5, 0.5, 0.5 ),
      EPSILON = Math.pow( 2, -48 );

  a.setEuler( Math.PI / 2, 0, Math.PI / 2 );

  if ( a.x ) {
    ok( Math.abs( a.x - aExpected.x ) < EPSILON &&
        Math.abs( a.y - aExpected.y ) < EPSILON &&
        Math.abs( a.z - aExpected.z ) < EPSILON &&
        Math.abs( a.w - aExpected.w ) < EPSILON );
  }

  if ( a.floats ) {
    ok( Math.abs( a.floats[0] - aExpected.floats[0] ) < EPSILON &&
        Math.abs( a.floats[1] - aExpected.floats[1] ) < EPSILON &&
        Math.abs( a.floats[2] - aExpected.floats[2] ) < EPSILON &&
        Math.abs( a.floats[3] - aExpected.floats[3] ) < EPSILON );
  }

  strictEqual( a, aRef, 'does not allocate new a' );
});

module( 'Quaternion.setEulerZYX' );
test( 'basic', function() {
  exist( 'setEulerZYX' );

  var a = Bump.Quaternion.create(),
      aRef = a,
      aExpected = Bump.Quaternion.create( 0.5, 0.5, 0.5, 0.5 ),
      EPSILON = Math.pow( 2, -48 );

  a.setEulerZYX( Math.PI / 2, 0, Math.PI / 2 );

  if ( a.x ) {
    ok( Math.abs( a.x - aExpected.x ) < EPSILON &&
        Math.abs( a.y - aExpected.y ) < EPSILON &&
        Math.abs( a.z - aExpected.z ) < EPSILON &&
        Math.abs( a.w - aExpected.w ) < EPSILON );
  }

  if ( a.floats ) {
    ok( Math.abs( a.floats[0] - aExpected.floats[0] ) < EPSILON &&
        Math.abs( a.floats[1] - aExpected.floats[1] ) < EPSILON &&
        Math.abs( a.floats[2] - aExpected.floats[2] ) < EPSILON &&
        Math.abs( a.floats[3] - aExpected.floats[3] ) < EPSILON );
  }

  strictEqual( a, aRef, 'does not allocate new a' );
});

module( 'Quaternion.negate' );
test( 'basic', function() {
  var objs = [
        Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
        Bump.Quaternion.create( -1, -2, -3, -4 )
      ],
      expected = [
        Bump.Quaternion.create( -0.5, 0, 0.5, 1 ),
        Bump.Quaternion.create( 1, 2, 3, 4 )
      ];

  testFunc( Bump.Quaternion, 'negate', {
    objects: objs,
    expected: expected
  });
});

module( 'Quaternion.add' );
test( 'basic', function() {
  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Quaternion.create( 1, 2, 3, 4 ),
      expected = Bump.Quaternion.create( 1.5, 2, 2.5, 3 );

  testFunc( Bump.Quaternion, 'add', {
    objects: a,
    args: [[ b ]],
    expected: [ expected ],
    destType: Bump.Quaternion
  });
});

module( 'Quaternion.addSelf' );
test( 'basic', function() {
  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Quaternion.create( 1, 2, 3, 4 ),
      expected = Bump.Quaternion.create( 1.5, 2, 2.5, 3 );

  testFunc( Bump.Quaternion, 'addSelf', {
    objects: a,
    args: [[ b ]],
    expected: [ expected ],
    modifiesSelf: true
  });
});

module( 'Quaternion.subtract' );
test( 'basic', function() {
  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Quaternion.create( -1, -2, -3, -4 ),
      expected = Bump.Quaternion.create( 1.5, 2, 2.5, 3 );

  testFunc( Bump.Quaternion, 'subtract', {
    objects: a,
    args: [[ b ]],
    expected: [ expected ],
    destType: Bump.Quaternion
  });
});

module( 'Quaternion.subtractSelf' );
test( 'basic', function() {
  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Quaternion.create( -1, -2, -3, -4 ),
      expected = Bump.Quaternion.create( 1.5, 2, 2.5, 3 );

  testFunc( Bump.Quaternion, 'subtractSelf', {
    objects: a,
    args: [[ b ]],
    expected: [ expected ],
    modifiesSelf: true
  });
});

module( 'Quaternion.multiplyQuaternion' );
test( 'basic', function() {
  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Quaternion.create( -1, -2, -3, -4 ),
      expected = Bump.Quaternion.create( -2, 4, 4, 3 );

  testFunc( Bump.Quaternion, 'multiplyQuaternion', {
    objects: a,
    args: [[ b ]],
    expected: [ expected ],
    destType: Bump.Quaternion
  });
});

module( 'Quaternion.multiplyQuaternionSelf' );
test( 'basic', function() {
  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Quaternion.create( -1, -2, -3, -4 ),
      expected = Bump.Quaternion.create( -2, 4, 4, 3 );

  testFunc( Bump.Quaternion, 'multiplyQuaternionSelf', {
    objects: a,
    args: [[ b ]],
    expected: [ expected ],
    modifiesSelf: true
  });
});

module( 'Quaternion.multiplyVector' );
test( 'basic', function() {
  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Vector3.create( 1, -2, 3 ),
      expected = Bump.Quaternion.create( -2, 0, -4, 1 );

  testFunc( Bump.Quaternion, 'multiplyVector', {
    objects: a,
    args: [[ b ]],
    expected: [ expected ],
    destType: Bump.Quaternion
  });
});

module( 'Quaternion.vectorMultiply' );
test( 'basic', function() {
  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Vector3.create( 1, -2, 3 ),
      expected = Bump.Quaternion.create( 0, 4, -2, 1 );

  testFunc( Bump.Quaternion, 'vectorMultiply', {
    objects: a,
    args: [[ b ]],
    expected: [ expected ],
    destType: Bump.Quaternion
  });
});

module( 'Quaternion.multiplyScalar' );
test( 'basic', function() {
  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = [ 1, -2 ],
      expected = [
        Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
        Bump.Quaternion.create( -1, 0, 1, 2 )
      ];

  testFunc( Bump.Quaternion, 'multiplyScalar', {
    objects: a,
    args: b.map(function( e ) { return [ e ]; }),
    expected: expected,
    destType: Bump.Quaternion
  });
});

module( 'Quaternion.multiplyScalarSelf' );
test( 'basic', function() {
  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = [ 1, -2 ],
      expected = [
        Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
        Bump.Quaternion.create( -1, 0, 1, 2 )
      ];

  testFunc( Bump.Quaternion, 'multiplyScalarSelf', {
    objects: a,
    args: b.map(function( e ) { return [ e ]; }),
    expected: expected,
    modifiesSelf: true
  });
});

module( 'Quaternion.divideScalar' );
test( 'basic', function() {
  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = [ 1, -2 ],
      expected = [
        Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
        Bump.Quaternion.create( -0.25, 0, 0.25, 0.5 )
      ];

  testFunc( Bump.Quaternion, 'divideScalar', {
    objects: a,
    args: b.map(function( e ) { return [ e ]; }),
    expected: expected,
    destType: Bump.Quaternion
  });
});

module( 'Quaternion.divideScalarSelf' );
test( 'basic', function() {
  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = [ 1, -2 ],
      expected = [
        Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
        Bump.Quaternion.create( -0.25, 0, 0.25, 0.5 )
      ];

  testFunc( Bump.Quaternion, 'divideScalarSelf', {
    objects: a,
    args: b.map(function( e ) { return [ e ]; }),
    expected: expected,
    modifiesSelf: true
  });
});

module( 'Quaternion.dot' );
test( 'basic', function() {
  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Quaternion.create( -1, -2, -3, -4 ),
      expected = 5;

  testFunc( Bump.Quaternion, 'dot', {
    objects: a,
    args: [[ b ]],
    expected: [ expected ]
  });
});

module( 'Quaternion.length' );
test( 'basic', function() {
  var objs = [
        Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
        Bump.Quaternion.create( -1, -2, -3, -4 )
      ],
      expected = [ Math.sqrt( 1.5 ), Math.sqrt( 30 ) ],
      expected2 = [ 1.5, 30 ];

  testFunc( Bump.Quaternion, 'length', {
    objects: objs,
    expected: expected
  });

  testFunc( Bump.Quaternion, 'length2', {
    objects: objs,
    expected: expected2
  });
});

module( 'Quaternion.normalized' );
test( 'normalized', function() {
  var objs = [
        Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
        Bump.Quaternion.create( -1, -2, -3, -4 )
      ],
      expected = [
        Bump.Quaternion.create( 0.4082482904638631, 0, -0.4082482904638631, -0.8164965809277261 ),
        Bump.Quaternion.create( -0.18257418583505536, -0.3651483716701107, -0.5477225575051661, -0.7302967433402214 )
      ];

  testFunc( Bump.Quaternion, 'normalized', {
    objects: objs,
    expected: expected,
    destType: Bump.Quaternion
  });
});

module( 'Quaternion.normalize' );
test( 'basic', function() {
  var objs = [
        Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
        Bump.Quaternion.create( -1, -2, -3, -4 )
      ],
      expected = [
        Bump.Quaternion.create( 0.4082482904638631, 0, -0.4082482904638631, -0.8164965809277261 ),
        Bump.Quaternion.create( -0.18257418583505536, -0.3651483716701107, -0.5477225575051661, -0.7302967433402214 )
      ];

  testFunc( Bump.Quaternion, 'normalize', {
    objects: objs,
    expected: expected,
    modifiesSelf: true
  });
});

module( 'Quaternion.angle' );
test( 'basic', function() {
  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Quaternion.create( -1, -2, -3, -4 ),
      expected = 0.7297276562269663;

  testFunc( Bump.Quaternion, 'angle', {
    objects: a,
    args: [[ b ]],
    expected: [ expected ]
  });
});

module( 'Quaternion.getAngle' );
test( 'getAngle', function() {
  var objs = [
        Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
        Bump.Quaternion.create( -1, -2, -3, -4 )
      ],
      expected = [ 6.283185307179586, 6.283185307179586 ];

  testFunc( Bump.Quaternion, 'getAngle', {
    objects: objs,
    expected: expected
  });
});

module( 'Quaternion.getAxis' );
test( 'basic', function() {
  var objs = [
        Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
        Bump.Quaternion.create( -1, -2, -3, -4 )
      ],
      expected = [
        Bump.Vector3.create( 1, 0, 0 ),
        Bump.Vector3.create( 1, 0, 0 )
      ];

  testFunc( Bump.Quaternion, 'getAxis', {
    objects: objs,
    expected: expected,
    destType: Bump.Vector3
  });
});

module( 'Quaternion.farthest' );
test( 'basic', function() {
  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Quaternion.create( -1, -2, -3, -4 ),
      expected = Bump.Quaternion.create( 1, 2, 3, 4 );

  testFunc( Bump.Quaternion, 'farthest', {
    objects: a,
    args: [[ b ]],
    expected: [ expected ],
    destType: Bump.Quaternion
  });
});

module( 'Quaternion.nearest' );
test( 'basic', function() {
  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Quaternion.create( -1, -2, -3, -4 ),
      expected = Bump.Quaternion.create( -1, -2, -3, -4 );

  testFunc( Bump.Quaternion, 'nearest', {
    objects: a,
    args: [[ b ]],
    expected: [ expected ],
    destType: Bump.Quaternion
  });
});
