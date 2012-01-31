module( 'Bump.Matrix3x3' );

test( 'Matrix3x3 exists', function() {
  ok( Bump.Matrix3x3 );
});

module( 'Bump.Matrix3x3.create' );

test( 'basic' , function() {
  ok( Bump.Matrix3x3.create, 'create exists' );
  ok( typeof Bump.Matrix3x3.create() === 'object', 'creates an object' );

  var a = Bump.Matrix3x3.create(),
      b = Bump.Matrix3x3.create();

  ok( a !== b, 'creates different objects' );
  deepEqual( a, b, 'creates similar objects' );

  if ( a.el0 ) {
    ok( a.el0.x === 0 && a.el0.y === 0 && a.el0.z === 0 &&
        a.el1.x === 0 && a.el1.y === 0 && a.el1.z === 0 &&
        a.el2.x === 0 && a.el2.y === 0 && a.el2.z === 0 );
  }

  if ( a.el ) {
    ok( a.el[0].x === 0 && a.el[0].y === 0 && a.el[0].z === 0 &&
        a.el[1].x === 0 && a.el[1].y === 0 && a.el[1].z === 0 &&
        a.el[2].x === 0 && a.el[2].y === 0 && a.el[2].z === 0 );
  }

  if ( a.m ) {
    deepEqual( a.m, [ 0, 0, 0,
                      0, 0, 0,
                      0, 0, 0 ] );
  }

  if ( a.m11 ) {
    ok( a.m11 === 0 && a.m12 === 0 && a.m13 === 0 &&
        a.m21 === 0 && a.m22 === 0 && a.m23 === 0 &&
        a.m31 === 0 && a.m32 === 0 && a.m33 === 0 );
  }

  var c = Bump.Matrix3x3.create(
    1, 2, 3,
    4, 5, 6,
    7, 8/*0*/
  );

  if ( c.el0 ) {
    ok( c.el0.x === 1 && c.el0.y === 2 && c.el0.z === 3 &&
        c.el1.x === 4 && c.el1.y === 5 && c.el1.z === 6 &&
        c.el2.x === 7 && c.el2.y === 8 && c.el2.z === 0 );
  }

  if ( c.el ) {
    ok( c.el[0].x === 1 && c.el[0].y === 2 && c.el[0].z === 3 &&
        c.el[1].x === 4 && c.el[1].y === 5 && c.el[1].z === 6 &&
        c.el[2].x === 7 && c.el[2].y === 8 && c.el[2].z === 0 );
  }

  if ( c.m ) {
    deepEqual( c.m, [ 1, 2, 3,
                      4, 5, 6,
                      7, 8, 0 ] );
  }

  if ( c.m11 ) {
    ok( c.m11 === 1 && c.m12 === 2 && c.m13 === 3 &&
        c.m21 === 4 && c.m22 === 5 && c.m23 === 6 &&
        c.m31 === 7 && c.m32 === 8 && c.m33 === 0 );
  }
});

module( 'Matrix3x3.assign' );

test( 'basic', function() {
  var m0 = Bump.Matrix3x3.create( 1, 2, 3, 4, 5, 6, 7, 8, 9 ),
      m1 = Bump.Matrix3x3.create();

  notDeepEqual( m0, m1 );
  m1.assign( m0 );
  deepEqual( m0, m1 );

  if ( m0.el0 ) {
    notStrictEqual( m0.el0, m1.el0 );
    notStrictEqual( m0.el1, m1.el1 );
    notStrictEqual( m0.el2, m1.el2 );
  }

  if ( m0.el ) {
    notStrictEqual( m0.el, m1.el );
    notStrictEqual( m0.el[0], m1.el[0] );
    notStrictEqual( m0.el[1], m1.el[1] );
    notStrictEqual( m0.el[2], m1.el[2] );
  }

  if ( m0.m ) {
    notStrictEqual( m0.m, m1.m );
  }
});

module( 'Matrix3x3 basic' );

test( 'getIdentity', function() {
  ok( Bump.Matrix3x3.getIdentity, 'getIdentity exists' );
  ok( typeof Bump.Matrix3x3.getIdentity() === 'object', 'creates an object' );

  var c = Bump.Matrix3x3.getIdentity(),
      d = Bump.Matrix3x3.getIdentity();

  ok( c !== d, 'creates different objects' );
  deepEqual( c, d, 'creates similar objects' );

  if ( c.el0 ) {
    ok( c.el0.x === 1 && c.el0.y === 0 && c.el0.z === 0 &&
        c.el1.x === 0 && c.el1.y === 1 && c.el1.z === 0 &&
        c.el2.x === 0 && c.el2.y === 0 && c.el2.z === 1 );
  }

  if ( c.el ) {
    ok( c.el[0].x === 1 && c.el[0].y === 0 && c.el[0].z === 0 &&
        c.el[1].x === 0 && c.el[1].y === 1 && c.el[1].z === 0 &&
        c.el[2].x === 0 && c.el[2].y === 0 && c.el[2].z === 1 );
  }

  if ( c.m ) {
    deepEqual( c.m, [ 1, 0, 0,
                      0, 1, 0,
                      0, 0, 1 ] );
  }

  if ( c.m11 ) {
    ok( c.m11 === 1 && c.m12 === 0 && c.m13 === 0 &&
        c.m21 === 0 && c.m22 === 1 && c.m23 === 0 &&
        c.m31 === 0 && c.m32 === 0 && c.m33 === 1 );
  }
});

test( 'setValue', function() {
  ok( Bump.Matrix3x3.prototype.setValue, 'setValue exists' );
  ok( Bump.Matrix3x3.create().setValue, 'setValue exists' );

  var a = Bump.Matrix3x3.getIdentity(),
      b = Bump.Matrix3x3.create();

  b.setValue( 1, 0, 0,
              0, 1, 0,
              0, 0, 1 );
  deepEqual( a, b );
});

test( 'operator[] property', function() {
  ok( '0' in Bump.Matrix3x3.prototype, '0 property exists' );
  ok( '1' in Bump.Matrix3x3.prototype, '1 property exists' );
  ok( '2' in Bump.Matrix3x3.prototype, '2 property exists' );

  var a = Bump.Matrix3x3.create( 1, 2, 3, 4, 5, 6, 7, 8, 9 );

  deepEqual( a[0], Bump.Vector3.create( 1, 2, 3 ) );
  deepEqual( a[1], Bump.Vector3.create( 4, 5, 6 ) );
  deepEqual( a[2], Bump.Vector3.create( 7, 8, 9 ) );

  var a0 = a[0],
      a1 = a[1],
      a2 = a[2];

  a[0] = Bump.Vector3.create( 10, 11, 12 );
  a[1] = Bump.Vector3.create( 13, 14, 15 );
  a[2] = Bump.Vector3.create( 16, 17, 18 );

  strictEqual( a0, a[0], 'assignment does not change underlying object' );
  strictEqual( a1, a[1], 'assignment does not change underlying object' );
  strictEqual( a2, a[2], 'assignment does not change underlying object' );

  deepEqual( a[0], Bump.Vector3.create( 10, 11, 12 ) );
  deepEqual( a[1], Bump.Vector3.create( 13, 14, 15 ) );
  deepEqual( a[2], Bump.Vector3.create( 16, 17, 18 ) );
});

test( 'clone', function() {
  ok( Bump.Matrix3x3.clone, 'clone exists' );

  var a = Bump.Matrix3x3.getIdentity(),
      b = Bump.Matrix3x3.clone( a ),
      c = Bump.Matrix3x3.clone( a );

  notStrictEqual( a, b, 'clone creates new object' );
  deepEqual( a, b, 'clone copies object' );
});

test( 'getColumn', function() {
  ok( Bump.Matrix3x3.prototype.getColumn, 'getColumn exists' );

  var a = Bump.Matrix3x3.getIdentity(),
      tmp = Bump.Vector3.create();

  ok( tmp === a.getColumn( 0, tmp ), 'getColumn returns reference to passed in Vector3' );
  deepEqual( tmp, Bump.Vector3.create( 1, 0, 0 ) );

  ok( tmp === a.getColumn( 1, tmp ), 'getColumn returns reference to passed in Vector3' );
  deepEqual( tmp, Bump.Vector3.create( 0, 1, 0 ) );

  ok( tmp === a.getColumn( 2, tmp ), 'getColumn returns reference to passed in Vector3' );
  deepEqual( tmp, Bump.Vector3.create( 0, 0, 1 ) );
});

test( 'getRow', function() {
  ok( Bump.Matrix3x3.prototype.getRow, 'getRow exists' );

  var a = Bump.Matrix3x3.getIdentity(),
      tmp = Bump.Vector3.create();

  ok( tmp === a.getRow( 0, tmp ), 'getRow returns reference to passed in Vector3' );
  deepEqual( tmp, Bump.Vector3.create( 1, 0, 0 ) );

  ok( tmp === a.getRow( 1, tmp ), 'getRow returns reference to passed in Vector3' );
  deepEqual( tmp, Bump.Vector3.create( 0, 1, 0 ) );

  ok( tmp === a.getRow( 2, tmp ), 'getRow returns reference to passed in Vector3' );
  deepEqual( tmp, Bump.Vector3.create( 0, 0, 1 ) );
});

test( 'setIdentity', function() {
  ok( Bump.Matrix3x3.prototype.setIdentity, 'setIdentity exists' );

  var a = Bump.Matrix3x3.getIdentity(),
      b = Bump.Matrix3x3.create().setIdentity();

  deepEqual( a, b, 'getIdentity and setIdentity produce the same matrix' );
});

test( 'setRotation', function() {
  ok( Bump.Matrix3x3.prototype.setRotation, 'setRotation exists' );

  var a = Bump.Matrix3x3.create(),
      expected = Bump.Matrix3x3.getIdentity();

  notDeepEqual( a, expected );
  a.setRotation( Bump.Quaternion.getIdentity() );
  deepEqual( a, expected, 'identity rotation is identity' );
});

test( 'setEulerZYX', function() {
  ok( Bump.Matrix3x3.prototype.setEulerZYX, 'setEulerZYX exists' );

  var a = Bump.Matrix3x3.create(),
      aRef = a,
      answer = Bump.Matrix3x3.getIdentity(),
      newARef;

  a.setEulerZYX( 0, 0, 0 );
  deepEqual( a, answer, 'euler angles 0, 0, 0 == identity' );

  answer.setValue(
                      0,  Math.sqrt( 3 ) / 2,              -1 / 2,
                 -1 / 2, -Math.sqrt( 3 ) / 4,              -3 / 4,
    -Math.sqrt( 3 ) / 2,               1 / 4,  Math.sqrt( 3 ) / 4
  );

  newARef = a.setEulerZYX( Math.PI / 6, Math.PI / 3, -Math.PI / 2 );
  epsilonNumberCheck( newARef, answer, Math.pow( 2, -52 ), 'simple rotation' );

  // Wolfram Alpha output
  answer.setValue(
    1/4*(Math.sqrt(3)-1), 1/8*Math.sqrt(3)*(1+Math.sqrt(3))-1/(2*Math.sqrt(2)), 1/8*(-1-Math.sqrt(3))-Math.sqrt(3/2)/2,
    1/4*(1-Math.sqrt(3)), -1/(2*Math.sqrt(2))-1/8*Math.sqrt(3)*(1+Math.sqrt(3)), 1/8*(1+Math.sqrt(3))-Math.sqrt(3/2)/2,
    -(1+Math.sqrt(3))/(2*Math.sqrt(2)), 1/4*Math.sqrt(3/2)*(Math.sqrt(3)-1), -(Math.sqrt(3)-1)/(4*Math.sqrt(2))
  );

  newARef = a.setEulerZYX( 2 * Math.PI / 3, 5 * Math.PI / 12, -Math.PI / 4 );
  epsilonNumberCheck( newARef, answer, Math.pow( 2, -48 ), 'complex rotation' );

  strictEqual( newARef, aRef, 'does not allocate new a' );
});

test( 'getRotation', function() {
  var a = Bump.Matrix3x3.getIdentity(),
      answer = Bump.Quaternion.getIdentity();

  testUnaryOp( Bump.Matrix3x3, 'getRotation', a, answer, {
    destType: Bump.Quaternion
  });
});

test( 'getEulerZYX', function() {
  var a = Bump.Matrix3x3.create(
        1/4*(Math.sqrt(3)-1), 1/8*Math.sqrt(3)*(1+Math.sqrt(3))-1/(2*Math.sqrt(2)), 1/8*(-1-Math.sqrt(3))-Math.sqrt(3/2)/2,
        1/4*(1-Math.sqrt(3)), -1/(2*Math.sqrt(2))-1/8*Math.sqrt(3)*(1+Math.sqrt(3)), 1/8*(1+Math.sqrt(3))-Math.sqrt(3/2)/2,
        -(1+Math.sqrt(3))/(2*Math.sqrt(2)), 1/4*Math.sqrt(3/2)*(Math.sqrt(3)-1), -(Math.sqrt(3)-1)/(4*Math.sqrt(2))
      ),
      answer = {
        yaw: -Math.PI / 4,
        pitch: 5 * Math.PI / 12,
        roll: 2 * Math.PI / 3
      };

  testUnaryOp( Bump.Matrix3x3, 'getEulerZYX', a, answer, {
    epsilon: Math.pow( 2, -48 ),

    // Emulates the functionality of Type that the test uses
    destType: { create: function() { return {}; } }
  });
});

test( 'member clone', function() {
  ok( Bump.Matrix3x3.prototype.clone, 'clone exists' );

  var c = Bump.Matrix3x3.create( 1, 2, 3, 4, 5, 6, 7, 8, 9 ),
      d = Bump.Matrix3x3.clone( c ),
      dRef = d,
      e = d.clone(),
      eRef = e;

  ok( c !== d, 'Bump.Matrix3x3.clone creates new object' );
  ok( e === eRef, 'this.clone does not create new object' );
  ok( d === dRef, 'this.clone does not change cloned object' );

  deepEqual( c, d, 'all copies are similar' );
  deepEqual( c, e, 'all copies are similar' );
});

module( 'Bump.Matrix3x3 math' );

test( 'add', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      answer = Bump.Matrix3x3.create( 26, 34, 8, 11, 21, 17, 8, 17, 20 ),
      Z = Bump.Matrix3x3.create();

  testBinaryOp( Bump.Matrix3x3, 'add', a, [ Z, b ], [ a.clone(), answer ], {
    destType: Bump.Matrix3x3
  });
});

test( 'addSelf', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      answer = Bump.Matrix3x3.create( 26, 34, 8, 11, 21, 17, 8, 17, 20 ),
      Z = Bump.Matrix3x3.create();

  testBinaryOp( Bump.Matrix3x3, 'addSelf', a, [ Z, b ], [ a.clone(), answer ], {
    modifiesSelf: true
  });
});

test( 'subtract', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      answer = Bump.Matrix3x3.create( 2, -16, -2, -7, 1, 13, -8, 7, 14 ),
      Z = Bump.Matrix3x3.create();

  testBinaryOp( Bump.Matrix3x3, 'subtract', a, [ Z, b ], [ a.clone(), answer ], {
    destType: Bump.Matrix3x3
  });
});

test( 'subtractSelf', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      answer = Bump.Matrix3x3.create( 2, -16, -2, -7, 1, 13, -8, 7, 14 ),
      Z = Bump.Matrix3x3.create();

  testBinaryOp( Bump.Matrix3x3, 'subtractSelf', a, [ Z, b ], [ a.clone(), answer ], {
    modifiesSelf: true
  });
});

test( 'multiplyMatrix', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      answer = Bump.Matrix3x3.create( 273, 455, 97, 243, 235, 77, 244, 205, 75 ),
      I = Bump.Matrix3x3.getIdentity();

  testBinaryOp( Bump.Matrix3x3, 'multiplyMatrix', a, [ I, b ], [ a.clone(), answer ], {
    destType: Bump.Matrix3x3
  });
});

test( 'multiplyMatrixSelf', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      answer = Bump.Matrix3x3.create( 273, 455, 97, 243, 235, 77, 244, 205, 75 ),
      I = Bump.Matrix3x3.getIdentity();

  testBinaryOp( Bump.Matrix3x3, 'multiplyMatrixSelf', a, [ I, b ], [ a.clone(), answer ], {
    modifiesSelf: true
  });
});

test( 'multiplyVector', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Vector3.create( 12, 25, 5 ),
      answer = Bump.Vector3.create( 408, 374, 385 ),
      I = Bump.Matrix3x3.getIdentity();

  testBinaryOp( Bump.Matrix3x3, 'multiplyVector', a, b, answer, {
    destType: Bump.Vector3
  });

  testBinaryOp( Bump.Matrix3x3, 'multiplyVector', I, b, b.clone(), {
    destType: Bump.Vector3
  });
});

test( 'vectorMultiply', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Vector3.create( 12, 25, 5 ),
      answer = Bump.Vector3.create( 218, 443, 496 ),
      I = Bump.Matrix3x3.getIdentity();

  testBinaryOp( Bump.Matrix3x3, 'vectorMultiply', a, b, answer, {
    destType: Bump.Vector3
  });

  testBinaryOp( Bump.Matrix3x3, 'vectorMultiply', I, b, b.clone(), {
    destType: Bump.Vector3
  });
});

test( 'multiplyScalar', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      answer = Bump.Matrix3x3.create( -42, -27, -9, -6, -33, -45, 0, -36, -51 );

  testBinaryOp( Bump.Matrix3x3, 'multiplyScalar', a, [ 1, -3 ], [ a.clone(), answer ], {
    destType: Bump.Matrix3x3
  });
});

test( 'scaled', function() {
  ok( Bump.Matrix3x3.prototype.scaled, 'scaled exists' );
});

test( 'transposeTimes', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      answer = Bump.Matrix3x3.create( 186, 370, 74, 303, 395, 103, 307, 310, 96 ),
      I = Bump.Matrix3x3.getIdentity();

  testBinaryOp( Bump.Matrix3x3, 'transposeTimes', a, b, answer, {
    destType: Bump.Matrix3x3
  });

  testBinaryOp(
    Bump.Matrix3x3, 'transposeTimes', I,
    [ a, b ],
    [ a.clone(), b.clone() ], {
      destType: Bump.Matrix3x3
    }
  );
});

test( 'timesTranspose', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      answer = Bump.Matrix3x3.create( 408, 222, 166, 374, 158, 116, 385, 154, 111 ),
      I = Bump.Matrix3x3.getIdentity();

  testBinaryOp( Bump.Matrix3x3, 'timesTranspose', a, [ b, I ], [ answer, a.clone() ], {
    destType: Bump.Matrix3x3
  });
});

module( 'Bump.Matrix3x3 advanced utilities' );

test( 'determinant', function() {
  var objs = [
        Bump.Matrix3x3.create(),
        Bump.Matrix3x3.getIdentity(),
        Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
        Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 )
      ],
      expected = [
        0,
        1,
        -136,
        -210
      ];

  testUnaryOp( Bump.Matrix3x3, 'determinant', objs, expected );
});

test( 'adjoint', function() {
  var objs = [
        Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
        Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 )
      ],
      expected = [
        Bump.Matrix3x3.create( 7, -117, 102, -34, 238, -204, 24, -168, 136 ),
        Bump.Matrix3x3.create( 20, -50, 0, -11, -4, 21, -35, 140, -105 )
      ];

  testUnaryOp( Bump.Matrix3x3, 'adjoint', objs, expected, {
    destType: Bump.Matrix3x3
  });
});

test( 'absolute', function() {
  var objs = [
        Bump.Matrix3x3.create( -14, 9, -3, 2, -11, 15, -0, 12, -17 ),
        Bump.Matrix3x3.create( 12, -25, 5, -9, 10, -2, 8, -5, 3 )
      ],
      expected = [
        Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
        Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 )
      ];

  testUnaryOp( Bump.Matrix3x3, 'absolute', objs, expected, {
    destType: Bump.Matrix3x3
  });
});

test( 'transpose', function() {
  var objs = [
        Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
        Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 )
      ],
      expected = [
        Bump.Matrix3x3.create( 14, 2, 0, 9, 11, 12, 3, 15, 17 ),
        Bump.Matrix3x3.create( 12, 9, 8, 25, 10, 5, 5, 2, 3 )
      ];

  testUnaryOp( Bump.Matrix3x3, 'transpose', objs, expected, {
    destType: Bump.Matrix3x3
  });
});

test( 'inverse', function() {
  var objs = [
        Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
        Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 )
      ],
      expected = [
        Bump.Matrix3x3.create( -7 / 136, 117 / 136, -102 / 136, 34 / 136, -238 / 136, 204 / 136, -24 / 136, 168 / 136, -1 ),
        Bump.Matrix3x3.create( -20 / 210, 50 / 210, 0, 11 / 210, 4 / 210, -21 / 210, 35 / 210, -140 / 210, 105 / 210 )
      ];

  testUnaryOp( Bump.Matrix3x3, 'inverse', objs, expected, {
    epsilon: Math.pow( 2, -52 ),
    destType: Bump.Matrix3x3
  });
});

test( 'diagonalize', function() {
  ok( Bump.Matrix3x3.prototype.diagonalize, 'diagonalize exists' );

  var EPSILON = Math.pow( 2, -16 );

  deepEqual(
    Bump.Matrix3x3.getIdentity().diagonalize( undefined, EPSILON, Infinity ),
    Bump.Matrix3x3.getIdentity(),
    'identity diagonalizes to identity'
  );

  var a = Bump.Matrix3x3.create( 1, 1, 0, 1, 5, 0, 0, 0, 1 ),
      aRef = a,
      aClone = a.clone(),
      // C++ version output
      aDgn = Bump.Matrix3x3.create( 0.7639320225002103, 0, 0, 0, 5.23606797749979, 0, 0, 0, 1 );

  a.diagonalize( undefined, EPSILON, Infinity );
  equal( a.el0.x, aDgn.el0.x );
  equal( a.el0.y, aDgn.el0.y );
  equal( a.el0.z, aDgn.el0.z );
  equal( a.el1.x, aDgn.el1.x );
  equal( a.el1.y, aDgn.el1.y );
  equal( a.el1.z, aDgn.el1.z );
  equal( a.el2.x, aDgn.el2.x );
  equal( a.el2.y, aDgn.el2.y );
  equal( a.el2.z, aDgn.el2.z );
});

test( 'cofac', function() {
  ok( Bump.Matrix3x3.prototype.cofac, 'cofac exists' );

  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 );

  equal( a.cofac( 1, 1, 2, 2 ), 7 );
  equal( a.cofac( 1, 2, 2, 0 ), -34 );
  equal( a.cofac( 1, 0, 2, 1 ), 24 );

  equal( a.cofac( 2, 1, 0, 2 ), -117 );
  equal( a.cofac( 2, 2, 0, 0 ), 238 );
  equal( a.cofac( 2, 0, 0, 1 ), -168 );

  equal( a.cofac( 0, 1, 1, 2 ), 102 );
  equal( a.cofac( 0, 2, 1, 0 ), -204 );
  equal( a.cofac( 0, 0, 1, 1 ), 136 );
});
