module( 'Bump.Quaternion' );

test( 'Quaternion exists', function() {
  ok( Bump.Quaternion );
});

function exist( method ) {
  return ok( method in Bump.Quaternion.prototype, method + ' exists' );
}

module( 'Bump.Quaternion btQuadWord members' );

test( 'create', function() {
  ok( Bump.Quaternion.create, 'create exists' );

  var a = Bump.Quaternion.create(),
      f = Bump.Quaternion.create(),
      b = Bump.Quaternion.create( 1 ),
      c = Bump.Quaternion.create( 2, 1 ),
      d = Bump.Quaternion.create( 3, 2, 1 ),
      e = Bump.Quaternion.create( 4, 3, 2, 1 );

  if ( a.x ) {
    equal( a.x, 0 );
    equal( a.y, 0 );
    equal( a.z, 0 );
    equal( a.w, 0 );

    equal( b.x, 1 );
    equal( b.y, 0 );
    equal( b.z, 0 );
    equal( b.w, 0 );

    equal( c.x, 2 );
    equal( c.y, 1 );
    equal( c.z, 0 );
    equal( c.w, 0 );

    equal( d.x, 3 );
    equal( d.y, 2 );
    equal( d.z, 1 );
    equal( d.w, 0 );

    equal( e.x, 4 );
    equal( e.y, 3 );
    equal( e.z, 2 );
    equal( e.w, 1 );
  }

  if ( a.m_floats ) {
    equal( a.m_floats[0], 0 );
    equal( a.m_floats[1], 0 );
    equal( a.m_floats[2], 0 );
    equal( a.m_floats[3], 0 );

    equal( b.m_floats[0], 1 );
    equal( b.m_floats[1], 0 );
    equal( b.m_floats[2], 0 );
    equal( b.m_floats[3], 0 );

    equal( c.m_floats[0], 2 );
    equal( c.m_floats[1], 1 );
    equal( c.m_floats[2], 0 );
    equal( c.m_floats[3], 0 );

    equal( d.m_floats[0], 3 );
    equal( d.m_floats[1], 2 );
    equal( d.m_floats[2], 1 );
    equal( d.m_floats[3], 0 );

    equal( e.m_floats[0], 4 );
    equal( e.m_floats[1], 3 );
    equal( e.m_floats[2], 2 );
    equal( e.m_floats[3], 1 );
  }

  var arr = [ a, b, c, d, e, f ];
  for ( var i = 0; i < arr.length - 1; ++i ) {
    for ( var j = i + 1; j < arr.length; ++j ) {
      notStrictEqual( arr[i], arr[j], 'creates unique objects' );
    }
  }
});

test( 'clone', function() {
  ok( Bump.Quaternion.clone, 'clone exists' );

  var a = Bump.Quaternion.create( 1, 2, 3, 4 ),
      aRef = a,
      b = Bump.Quaternion.clone( a );

  deepEqual( a, b );
  strictEqual( a, aRef, 'does not allocate new a' );
  notStrictEqual( a, b, 'clone creates new object' );
});

test( 'clone: random test', function() {
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

test( 'member clone: random test', function() {
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

  if ( a.m_floats ) {
    equal( a.m_floats[0], 42 );
    equal( a.m_floats[1], Math.PI );
    equal( a.m_floats[2], Math.E );
    equal( a.m_floats[3], Math.SQRT2 );
  }

  strictEqual( a, aRef, 'does not allocate new a' );
});

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

  if ( a.m_floats ) {
    equal( a.m_floats[0], 42 );
    equal( a.m_floats[1], Math.PI );
    equal( a.m_floats[2], Math.E );
    equal( a.m_floats[3], Math.SQRT2 );
  }

  strictEqual( a, aRef, 'does not allocate new a' );
});

test( 'equal and notEqual', function() {
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

test( 'setValue', function() {
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

  if ( a.m_floats ) {
    equal( a.m_floats[0], 42 );
    equal( a.m_floats[1], Math.PI );
    equal( a.m_floats[2], Math.E );
    equal( a.m_floats[3], Math.SQRT2 );
  }

  strictEqual( a, aRef, 'does not allocate new a' );
});

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

  if ( a.m_floats ) {
    equal( a.m_floats[0], 1 );
    equal( a.m_floats[1], 3 );
    equal( a.m_floats[2], 4 );
    equal( a.m_floats[3], 2 );
  }

  strictEqual( a, aRef, 'does not allocate new a' );
  strictEqual( b, bRef, 'does not allocate new b' );
  deepEqual( b, bClone, 'does not change b' );
});

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

  if ( a.m_floats ) {
    equal( a.m_floats[0], 8 );
    equal( a.m_floats[1], 6 );
    equal( a.m_floats[2], 5 );
    equal( a.m_floats[3], 7 );
  }

  strictEqual( a, aRef, 'does not allocate new a' );
  strictEqual( b, bRef, 'does not allocate new b' );
  deepEqual( b, bClone, 'does not change b' );
});

module( 'Bump.Quaternion btQuaternion members' );

test( 'setRotation', function() {
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

  if ( a.m_floats ) {
    ok( Math.abs( a.m_floats[0] - aExpected.m_floats[0] ) < EPSILON &&
        Math.abs( a.m_floats[1] - aExpected.m_floats[1] ) < EPSILON &&
        Math.abs( a.m_floats[2] - aExpected.m_floats[2] ) < EPSILON &&
        Math.abs( a.m_floats[3] - aExpected.m_floats[3] ) < EPSILON );
  }

  strictEqual( a, aRef, 'does not allocate new a' );
});

test( 'setEuler', function() {
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

  if ( a.m_floats ) {
    ok( Math.abs( a.m_floats[0] - aExpected.m_floats[0] ) < EPSILON &&
        Math.abs( a.m_floats[1] - aExpected.m_floats[1] ) < EPSILON &&
        Math.abs( a.m_floats[2] - aExpected.m_floats[2] ) < EPSILON &&
        Math.abs( a.m_floats[3] - aExpected.m_floats[3] ) < EPSILON );
  }

  strictEqual( a, aRef, 'does not allocate new a' );
});

test( 'setEulerZYX', function() {
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

  if ( a.m_floats ) {
    ok( Math.abs( a.m_floats[0] - aExpected.m_floats[0] ) < EPSILON &&
        Math.abs( a.m_floats[1] - aExpected.m_floats[1] ) < EPSILON &&
        Math.abs( a.m_floats[2] - aExpected.m_floats[2] ) < EPSILON &&
        Math.abs( a.m_floats[3] - aExpected.m_floats[3] ) < EPSILON );
  }

  strictEqual( a, aRef, 'does not allocate new a' );
});

test( 'negate', function() {
  var objs = [
        Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
        Bump.Quaternion.create( -1, -2, -3, -4 )
      ],
      expected = [
        Bump.Quaternion.create( -0.5, 0, 0.5, 1 ),
        Bump.Quaternion.create( 1, 2, 3, 4 )
      ];

  testUnaryOp( Bump.Quaternion, 'negate', objs, expected );
});

test( 'add', function() {
  exist( 'add' );

  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Quaternion.create( 1, 2, 3, 4 ),
      expected = Bump.Quaternion.create( 1.5, 2, 2.5, 3 );

  testBinaryOp( Bump.Quaternion.prototype.add, a, b, expected, {
    selfDestination: true,
    destType: Bump.Quaternion
  });
});

test( 'addSelf', function() {
  exist( 'addSelf' );

  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Quaternion.create( 1, 2, 3, 4 ),
      expected = Bump.Quaternion.create( 1.5, 2, 2.5, 3 );

  testBinaryOp( Bump.Quaternion.prototype.addSelf, a, b, expected, {
    modifiesSelf: true
  });
});

test( 'subtract', function() {
  exist( 'subtract' );

  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Quaternion.create( -1, -2, -3, -4 ),
      expected = Bump.Quaternion.create( 1.5, 2, 2.5, 3 );

  testBinaryOp( Bump.Quaternion.prototype.subtract, a, b, expected, {
    selfDestination: true,
    destType: Bump.Quaternion
  });
});

test( 'subtractSelf', function() {
  exist( 'subtractSelf' );

  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Quaternion.create( -1, -2, -3, -4 ),
      expected = Bump.Quaternion.create( 1.5, 2, 2.5, 3 );

  testBinaryOp( Bump.Quaternion.prototype.subtractSelf, a, b, expected, {
    modifiesSelf: true
  });
});

test( 'multiplyQuaternion', function() {
  exist( 'multiplyQuaternion' );

  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Quaternion.create( -1, -2, -3, -4 ),
      expected = Bump.Quaternion.create( -2, 4, 4, 3 );

  testBinaryOp( Bump.Quaternion.prototype.multiplyQuaternion, a, b, expected, {
    selfDestination: true,
    destType: Bump.Quaternion
  });
});

test( 'multiplyQuaternionSelf', function() {
  exist( 'multiplyQuaternionSelf' );

  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Quaternion.create( -1, -2, -3, -4 ),
      expected = Bump.Quaternion.create( -2, 4, 4, 3 );

  testBinaryOp( Bump.Quaternion.prototype.multiplyQuaternionSelf, a, b, expected, {
    modifiesSelf: true
  });
});

test( 'multiplyVector', function() {
  exist( 'multiplyVector' );

  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Vector3.create( 1, -2, 3 ),
      expected = Bump.Quaternion.create( -2, 0, -4, 1 );

  testBinaryOp( Bump.Quaternion.prototype.multiplyVector, a, b, expected, {
    selfDestination: true,
    destType: Bump.Quaternion
  });
});

test( 'vectorMultiply', function() {
  exist( 'vectorMultiply' );

  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Vector3.create( 1, -2, 3 ),
      expected = Bump.Quaternion.create( 0, 4, -2, 1 );

  testBinaryOp( Bump.Quaternion.prototype.vectorMultiply, a, b, expected, {
    selfDestination: true,
    destType: Bump.Quaternion
  });
});

test( 'multiplyScalar', function() {
  exist( 'multiplyScalar' );

  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = [ 1, -2 ],
      expected = [
        Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
        Bump.Quaternion.create( -1, 0, 1, 2 )
      ];

  testBinaryOp( Bump.Quaternion.prototype.multiplyScalar, a, b, expected, {
    selfDestination: true,
    destType: Bump.Quaternion
  });
});

test( 'multiplyScalarSelf', function() {
  exist( 'multiplyScalarSelf' );

  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = [ 1, -2 ],
      expected = [
        Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
        Bump.Quaternion.create( -1, 0, 1, 2 )
      ];

  testBinaryOp( Bump.Quaternion.prototype.multiplyScalarSelf, a, b, expected, {
    modifiesSelf: true
  });
});

test( 'divideScalar', function() {
  exist( 'divideScalar' );

  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = [ 1, -2 ],
      expected = [
        Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
        Bump.Quaternion.create( -0.25, 0, 0.25, 0.5 )
      ];

  testBinaryOp( Bump.Quaternion.prototype.divideScalar, a, b, expected, {
    selfDestination: true,
    destType: Bump.Quaternion
  });
});

test( 'divideScalarSelf', function() {
  exist( 'divideScalarSelf' );

  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = [ 1, -2 ],
      expected = [
        Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
        Bump.Quaternion.create( -0.25, 0, 0.25, 0.5 )
      ];

  testBinaryOp( Bump.Quaternion.prototype.divideScalarSelf, a, b, expected, {
    modifiesSelf: true
  });
});

test( 'dot', function() {
  exist( 'dot' );

  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Quaternion.create( -1, -2, -3, -4 ),
      expected = 5;

  testBinaryOp( Bump.Quaternion.prototype.dot, a, b, expected );
});

test( 'length', function() {
  var objs = [
        Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
        Bump.Quaternion.create( -1, -2, -3, -4 )
      ],
      expected = [ Math.sqrt( 1.5 ), Math.sqrt( 30 ) ],
      expected2 = [ 1.5, 30 ];

  testUnaryOp( Bump.Quaternion, 'length', objs, expected );
  testUnaryOp( Bump.Quaternion, 'length2', objs, expected2 );
});

test( 'normalized', function() {
  var objs = [
        Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
        Bump.Quaternion.create( -1, -2, -3, -4 )
      ],
      expected = [
        Bump.Quaternion.create( 0.4082482904638631, 0, -0.4082482904638631, -0.8164965809277261 ),
        Bump.Quaternion.create( -0.18257418583505536, -0.3651483716701107, -0.5477225575051661, -0.7302967433402214 )
      ];

  testUnaryOp( Bump.Quaternion, 'normalized', objs, expected, {
    destType: Bump.Quaternion
  });
});

test( 'normalize', function() {
  var objs = [
        Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
        Bump.Quaternion.create( -1, -2, -3, -4 )
      ],
      expected = [
        Bump.Quaternion.create( 0.4082482904638631, 0, -0.4082482904638631, -0.8164965809277261 ),
        Bump.Quaternion.create( -0.18257418583505536, -0.3651483716701107, -0.5477225575051661, -0.7302967433402214 )
      ];

  testUnaryOp( Bump.Quaternion, 'normalize', objs, expected, {
    modifiesSelf: true
  });
});

test( 'angle', function() {
  exist( 'angle' );

  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Quaternion.create( -1, -2, -3, -4 ),
      expected = 0.7297276562269663;

  testBinaryOp( Bump.Quaternion.prototype.angle, a, b, expected );
});

test( 'getAngle', function() {
  var objs = [
        Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
        Bump.Quaternion.create( -1, -2, -3, -4 )
      ],
      expected = [ 6.283185307179586, 6.283185307179586 ];

  testUnaryOp( Bump.Quaternion, 'getAngle', objs, expected );
});

test( 'getAxis', function() {
  var objs = [
        Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
        Bump.Quaternion.create( -1, -2, -3, -4 )
      ],
      expected = [
        Bump.Vector3.create( 1, 0, 0 ),
        Bump.Vector3.create( 1, 0, 0 )
      ];

  testUnaryOp( Bump.Quaternion, 'getAxis', objs, expected, {
    destType: Bump.Vector3
  });
});

test( 'farthest', function() {
  exist( 'farthest' );

  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Quaternion.create( -1, -2, -3, -4 ),
      expected = Bump.Quaternion.create( 1, 2, 3, 4 );

  testBinaryOp( Bump.Quaternion.prototype.farthest, a, b, expected, {
    selfDestination: true,
    destType: Bump.Quaternion
  });
});

test( 'nearest', function() {
  exist( 'nearest' );

  var a = Bump.Quaternion.create( 0.5, 0, -0.5, -1 ),
      b = Bump.Quaternion.create( -1, -2, -3, -4 ),
      expected = Bump.Quaternion.create( -1, -2, -3, -4 );

  testBinaryOp( Bump.Quaternion.prototype.nearest, a, b, expected, {
    selfDestination: true,
    destType: Bump.Quaternion
  });
});
