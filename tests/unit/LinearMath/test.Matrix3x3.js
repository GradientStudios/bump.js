module( 'Bump.Matrix3x3' );

test( 'Matrix3x3 exists', function() {
  ok( Bump.Matrix3x3 );
});

module( 'Matrix3x3.create' );

test( 'basic' , function() {
  ok( Bump.Matrix3x3.create, 'create exists' );
  ok( typeof Bump.Matrix3x3.create() === 'object', 'creates an object' );

  var a = Bump.Matrix3x3.create(),
      b = Bump.Matrix3x3.create();

  ok( a !== b, 'creates different objects' );
  deepEqual( a, b, 'creates similar objects' );

  ok( a.el0.x === 0 && a.el0.y === 0 && a.el0.z === 0 &&
      a.el1.x === 0 && a.el1.y === 0 && a.el1.z === 0 &&
      a.el2.x === 0 && a.el2.y === 0 && a.el2.z === 0 );

  var c = Bump.Matrix3x3.create(
    1, 2, 3,
    4, 5, 6,
    7, 8/*0*/
  );

  ok( c.el0.x === 1 && c.el0.y === 2 && c.el0.z === 3 &&
      c.el1.x === 4 && c.el1.y === 5 && c.el1.z === 6 &&
      c.el2.x === 7 && c.el2.y === 8 && c.el2.z === 0 );

});

module( 'Matrix3x3.assign' );

test( 'basic', function() {
  var m0 = Bump.Matrix3x3.create( 1, 2, 3, 4, 5, 6, 7, 8, 9 ),
      m1 = Bump.Matrix3x3.create();

  notDeepEqual( m0, m1 );
  m1.assign( m0 );
  deepEqual( m0, m1 );

  notStrictEqual( m0.el0, m1.el0 );
  notStrictEqual( m0.el1, m1.el1 );
  notStrictEqual( m0.el2, m1.el2 );

});

module( 'Matrix3x3.getIdentity' );
test( 'basic', function() {
  ok( Bump.Matrix3x3.getIdentity, 'getIdentity exists' );
  ok( typeof Bump.Matrix3x3.getIdentity() === 'object', 'creates an object' );

  var c = Bump.Matrix3x3.getIdentity(),
      d = Bump.Matrix3x3.getIdentity();

  ok( c !== d, 'creates different objects' );
  deepEqual( c, d, 'creates similar objects' );

  ok( c.el0.x === 1 && c.el0.y === 0 && c.el0.z === 0 &&
      c.el1.x === 0 && c.el1.y === 1 && c.el1.z === 0 &&
      c.el2.x === 0 && c.el2.y === 0 && c.el2.z === 1 );

});

module( 'Matrix3x3.setValue' );
test( 'basic', function() {
  ok( Bump.Matrix3x3.prototype.setValue, 'setValue exists' );
  ok( Bump.Matrix3x3.create().setValue, 'setValue exists' );

  var a = Bump.Matrix3x3.getIdentity(),
      b = Bump.Matrix3x3.create();

  b.setValue( 1, 0, 0,
              0, 1, 0,
              0, 0, 1 );
  deepEqual( a, b );
});

module( 'Matrix3x3 operator[] property' );
test( 'basic', function() {
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

module( 'Matrix3x3.clone' );
test( 'static clone', function() {
  ok( Bump.Matrix3x3.clone, 'clone exists' );

  var a = Bump.Matrix3x3.getIdentity(),
      b = Bump.Matrix3x3.clone( a ),
      c = Bump.Matrix3x3.clone( a );

  notStrictEqual( a, b, 'clone creates new object' );
  deepEqual( a, b, 'clone copies object' );
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

module( 'Matrix3x3.getColumn' );
test( 'basic', function() {
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

module( 'Matrix3x3.getRow' );
test( 'basic', function() {
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

module( 'Matrix3x3.setIdentity' );
test( 'basic', function() {
  ok( Bump.Matrix3x3.prototype.setIdentity, 'setIdentity exists' );

  var a = Bump.Matrix3x3.getIdentity(),
      b = Bump.Matrix3x3.create().setIdentity();

  deepEqual( a, b, 'getIdentity and setIdentity produce the same matrix' );
});

module( 'Matrix3x3.setRotation' );
test( 'basic', function() {
  ok( Bump.Matrix3x3.prototype.setRotation, 'setRotation exists' );

  var a = Bump.Matrix3x3.create(),
      expected = Bump.Matrix3x3.getIdentity();

  notDeepEqual( a, expected );
  a.setRotation( Bump.Quaternion.getIdentity() );
  deepEqual( a, expected, 'identity rotation is identity' );
});

module( 'Matrix3x3.setEulerZYX' );
test( 'basic', function() {
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

module( 'Matrix3x3.getRotation' );
test( 'basic', function() {
  var a = Bump.Matrix3x3.getIdentity(),
      answer = Bump.Quaternion.getIdentity();

  testFunc( Bump.Matrix3x3, 'getRotation', {
    objects: a,
    expected: [ answer ],
    destType: Bump.Quaternion
  });
});

module( 'Matrix3x3.getEulerZYX' );
test( 'basic', function() {
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

  testFunc( Bump.Matrix3x3, 'getEulerZYX', {
    objects: a,
    expected: [ answer ],
    epsilon: Math.pow( 2, -48 ),

    // Emulates the functionality of Type that the test uses
    destType: { create: function() { return {}; } }
  });
});

module( 'Matrix3x3.add' );
test( 'basic', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      answer = Bump.Matrix3x3.create( 26, 34, 8, 11, 21, 17, 8, 17, 20 ),
      Z = Bump.Matrix3x3.create();

  testFunc( Bump.Matrix3x3, 'add', {
    objects: a,
    args: [[ Z ], [ b ]],
    expected: [ a.clone(), answer ],
    destType: Bump.Matrix3x3
  });
});

module( 'Matrix3x3.addSelf' );
test( 'basic', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      answer = Bump.Matrix3x3.create( 26, 34, 8, 11, 21, 17, 8, 17, 20 ),
      Z = Bump.Matrix3x3.create();

  testFunc( Bump.Matrix3x3, 'addSelf', {
    objects: a,
    args: [[ Z ], [ b ]],
    expected: [ a.clone(), answer ],
    modifiesSelf: true
  });
});

module( 'Matrix3x3.subtract' );
test( 'basic', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      answer = Bump.Matrix3x3.create( 2, -16, -2, -7, 1, 13, -8, 7, 14 ),
      Z = Bump.Matrix3x3.create();

  testFunc( Bump.Matrix3x3, 'subtract', {
    objects: a,
    args: [[ Z ], [ b ]],
    expected: [ a.clone(), answer ],
    destType: Bump.Matrix3x3
  });
});

module( 'Matrix3x3.subtractSelf' );
test( 'basic', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      answer = Bump.Matrix3x3.create( 2, -16, -2, -7, 1, 13, -8, 7, 14 ),
      Z = Bump.Matrix3x3.create();

  testFunc( Bump.Matrix3x3, 'subtractSelf', {
    objects: a,
    args: [[ Z ], [ b ]],
    expected: [ a.clone(), answer ],
    modifiesSelf: true
  });
});

module( 'Matrix3x3.multiplyMatrix' );
test( 'basic', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      answer = Bump.Matrix3x3.create( 273, 455, 97, 243, 235, 77, 244, 205, 75 ),
      I = Bump.Matrix3x3.getIdentity();

  testFunc( Bump.Matrix3x3, 'multiplyMatrix', {
    objects: a,
    args: [[ I ], [ b ]],
    expected: [ a.clone(), answer ],
    destType: Bump.Matrix3x3
  });
});

module( 'Matrix3x3.multiplyMatrixSelf' );
test( 'basic', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      answer = Bump.Matrix3x3.create( 273, 455, 97, 243, 235, 77, 244, 205, 75 ),
      I = Bump.Matrix3x3.getIdentity();

  testFunc( Bump.Matrix3x3, 'multiplyMatrixSelf', {
    objects: a,
    args: [[ I ], [ b ]],
    expected: [ a.clone(), answer ],
    modifiesSelf: true
  });
});

module( 'Matrix3x3.multiplyVector' );
test( 'basic', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Vector3.create( 12, 25, 5 ),
      answer = Bump.Vector3.create( 408, 374, 385 ),
      I = Bump.Matrix3x3.getIdentity();

  testFunc( Bump.Matrix3x3, 'multiplyVector', {
    objects: [ a, I ],
    args: [[ b ], [ b ]],
    expected: [ answer, b.clone() ],
    destType: Bump.Vector3
  });
});

module( 'Matrix3x3.vectorMultiply' );
test( 'basic', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Vector3.create( 12, 25, 5 ),
      answer = Bump.Vector3.create( 218, 443, 496 ),
      I = Bump.Matrix3x3.getIdentity();

  testFunc( Bump.Matrix3x3, 'vectorMultiply', {
    objects: [ a, I ],
    args: [[ b ], [ b ]],
    expected: [ answer, b.clone() ],
    destType: Bump.Vector3
  });
});

module( 'Matrix3x3.multiplyScalar' );
test( 'basic', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      answer = Bump.Matrix3x3.create( -42, -27, -9, -6, -33, -45, 0, -36, -51 );

  testFunc( Bump.Matrix3x3, 'multiplyScalar', {
    objects: a,
    args: [[ 1 ], [ -3 ]],
    expected: [ a.clone(), answer ],
    destType: Bump.Matrix3x3
  });
});

module( 'Matrix3x3.scaled' );
test( 'basic', function() {
  ok( Bump.Matrix3x3.prototype.scaled, 'scaled exists' );
});

module( 'Matrix3x3.transposeTimes' );
test( 'basic', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      answer = Bump.Matrix3x3.create( 186, 370, 74, 303, 395, 103, 307, 310, 96 ),
      I = Bump.Matrix3x3.getIdentity();

  testFunc( Bump.Matrix3x3, 'transposeTimes', {
    objects: [ a, I, I ],
    args: [[ b ], [ a ], [ b ]],
    expected: [ answer, a.clone(), b.clone() ],
    destType: Bump.Matrix3x3
  });
});

module( 'Matrix3x3.timesTranspose' );
test( 'basic', function() {
  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      answer = Bump.Matrix3x3.create( 408, 222, 166, 374, 158, 116, 385, 154, 111 ),
      I = Bump.Matrix3x3.getIdentity();

  testFunc( Bump.Matrix3x3, 'timesTranspose', {
    objects: a,
    args: [[ b ], [ I ]],
    expected: [ answer, a.clone() ],
    destType: Bump.Matrix3x3
  });
});

module( 'Matrix3x3.determinant' );
test( 'basic', function() {
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

  testFunc( Bump.Matrix3x3, 'determinant', {
    objects: objs,
    expected: expected
  });
});

module( 'Matrix3x3.adjoint' );
test( 'basic', function() {
  var objs = [
        Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
        Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 )
      ],
      expected = [
        Bump.Matrix3x3.create( 7, -117, 102, -34, 238, -204, 24, -168, 136 ),
        Bump.Matrix3x3.create( 20, -50, 0, -11, -4, 21, -35, 140, -105 )
      ];

  testFunc( Bump.Matrix3x3, 'adjoint', {
    objects: objs,
    expected: expected,
    destType: Bump.Matrix3x3
  });
});

module( 'Matrix3x3.absolute' );
test( 'basic', function() {
  var objs = [
        Bump.Matrix3x3.create( -14, 9, -3, 2, -11, 15, -0, 12, -17 ),
        Bump.Matrix3x3.create( 12, -25, 5, -9, 10, -2, 8, -5, 3 )
      ],
      expected = [
        Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
        Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 )
      ];

  testFunc( Bump.Matrix3x3, 'absolute', {
    objects: objs,
    expected: expected,
    destType: Bump.Matrix3x3
  });
});

module( 'Matrix3x3.transpose' );
test( 'basic', function() {
  var objs = [
        Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
        Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 )
      ],
      expected = [
        Bump.Matrix3x3.create( 14, 2, 0, 9, 11, 12, 3, 15, 17 ),
        Bump.Matrix3x3.create( 12, 9, 8, 25, 10, 5, 5, 2, 3 )
      ];

  testFunc( Bump.Matrix3x3, 'transpose', {
    objects: objs,
    expected: expected,
    destType: Bump.Matrix3x3
  });
});

module( 'Matrix3x3.inverse' );
test( 'basic', function() {
  var objs = [
        Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
        Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 )
      ],
      expected = [
        Bump.Matrix3x3.create( -7 / 136, 117 / 136, -102 / 136, 34 / 136, -238 / 136, 204 / 136, -24 / 136, 168 / 136, -1 ),
        Bump.Matrix3x3.create( -20 / 210, 50 / 210, 0, 11 / 210, 4 / 210, -21 / 210, 35 / 210, -140 / 210, 105 / 210 )
      ];

  testFunc( Bump.Matrix3x3, 'inverse', {
    objects: objs,
    expected: expected,
    epsilon: Math.pow( 2, -52 ),
    destType: Bump.Matrix3x3
  });
});

module( 'Matrix3x3.diagonalize' );
test( 'basic', function() {
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

module( 'Matrix3x3.cofac' );
test( 'basic', function() {
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
