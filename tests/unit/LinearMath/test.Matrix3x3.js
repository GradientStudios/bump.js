module( 'Bump.Matrix3x3' );

test( 'Matrix3x3 exists', function() {
  ok( Bump.Matrix3x3 );
});

module( 'Bump.Matrix3x3 basic' );

test( 'create' , function() {
  ok( Bump.Matrix3x3.create, 'create exists' );
  ok( typeof Bump.Matrix3x3.create() === 'object', 'creates an object' );

  var a = Bump.Matrix3x3.create(),
      b = Bump.Matrix3x3.create();

  ok( a !== b, 'creates different objects' );
  deepEqual( a, b, 'creates similar objects' );

  if ( a.m_el0 ) {
    ok( a.m_el0.x === 0 && a.m_el0.y === 0 && a.m_el0.z === 0 &&
        a.m_el1.x === 0 && a.m_el1.y === 0 && a.m_el1.z === 0 &&
        a.m_el2.x === 0 && a.m_el2.y === 0 && a.m_el2.z === 0 );
  }

  if ( a.m_el ) {
    ok( a.m_el[0].x === 0 && a.m_el[0].y === 0 && a.m_el[0].z === 0 &&
        a.m_el[1].x === 0 && a.m_el[1].y === 0 && a.m_el[1].z === 0 &&
        a.m_el[2].x === 0 && a.m_el[2].y === 0 && a.m_el[2].z === 0 );
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

  if ( c.m_el0 ) {
    ok( c.m_el0.x === 1 && c.m_el0.y === 2 && c.m_el0.z === 3 &&
        c.m_el1.x === 4 && c.m_el1.y === 5 && c.m_el1.z === 6 &&
        c.m_el2.x === 7 && c.m_el2.y === 8 && c.m_el2.z === 0 );
  }

  if ( c.m_el ) {
    ok( c.m_el[0].x === 1 && c.m_el[0].y === 2 && c.m_el[0].z === 3 &&
        c.m_el[1].x === 4 && c.m_el[1].y === 5 && c.m_el[1].z === 6 &&
        c.m_el[2].x === 7 && c.m_el[2].y === 8 && c.m_el[2].z === 0 );
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

test( 'getIdentity', function() {
  ok( Bump.Matrix3x3.getIdentity, 'getIdentity exists' );
  ok( typeof Bump.Matrix3x3.getIdentity() === 'object', 'creates an object' );

  var c = Bump.Matrix3x3.getIdentity(),
      d = Bump.Matrix3x3.getIdentity();

  ok( c !== d, 'creates different objects' );
  deepEqual( c, d, 'creates similar objects' );

  if ( c.m_el0 ) {
    ok( c.m_el0.x === 1 && c.m_el0.y === 0 && c.m_el0.z === 0 &&
        c.m_el1.x === 0 && c.m_el1.y === 1 && c.m_el1.z === 0 &&
        c.m_el2.x === 0 && c.m_el2.y === 0 && c.m_el2.z === 1 );
  }

  if ( c.m_el ) {
    ok( c.m_el[0].x === 1 && c.m_el[0].y === 0 && c.m_el[0].z === 0 &&
        c.m_el[1].x === 0 && c.m_el[1].y === 1 && c.m_el[1].z === 0 &&
        c.m_el[2].x === 0 && c.m_el[2].y === 0 && c.m_el[2].z === 1 );
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

test( 'setEulerZYX', function() {
  ok( Bump.Matrix3x3.prototype.setEulerZYX, 'setEulerZYX exists' );

  var a = Bump.Matrix3x3.create(),
      aRef = a,
      answer = Bump.Matrix3x3.getIdentity(),
      EPSILON = Math.pow( 2, -48 ),
      newARef;

  a.setEulerZYX( 0, 0, 0 );
  deepEqual( a, answer, 'euler angles 0, 0, 0 == identity' );

  answer.setValue(
                      0,  Math.sqrt( 3 ) / 2,              -1 / 2,
                 -1 / 2, -Math.sqrt( 3 ) / 4,              -3 / 4,
    -Math.sqrt( 3 ) / 2,               1 / 4,  Math.sqrt( 3 ) / 4
  );

  newARef = a.setEulerZYX( Math.PI / 6, Math.PI / 3, -Math.PI / 2 );
  ok( Math.abs( answer.m_el0.x - newARef.m_el0.x ) < EPSILON &&
      Math.abs( answer.m_el0.y - newARef.m_el0.y ) < EPSILON &&
      Math.abs( answer.m_el0.z - newARef.m_el0.z ) < EPSILON &&
      Math.abs( answer.m_el1.x - newARef.m_el1.x ) < EPSILON &&
      Math.abs( answer.m_el1.y - newARef.m_el1.y ) < EPSILON &&
      Math.abs( answer.m_el1.z - newARef.m_el1.z ) < EPSILON &&
      Math.abs( answer.m_el2.x - newARef.m_el2.x ) < EPSILON &&
      Math.abs( answer.m_el2.y - newARef.m_el2.y ) < EPSILON &&
      Math.abs( answer.m_el2.z - newARef.m_el2.z ) < EPSILON );

  // Wolfram Alpha output
  answer.setValue(
    1/4*(Math.sqrt(3)-1), 1/8*Math.sqrt(3)*(1+Math.sqrt(3))-1/(2*Math.sqrt(2)), 1/8*(-1-Math.sqrt(3))-Math.sqrt(3/2)/2,
    1/4*(1-Math.sqrt(3)), -1/(2*Math.sqrt(2))-1/8*Math.sqrt(3)*(1+Math.sqrt(3)), 1/8*(1+Math.sqrt(3))-Math.sqrt(3/2)/2,
    -(1+Math.sqrt(3))/(2*Math.sqrt(2)), 1/4*Math.sqrt(3/2)*(Math.sqrt(3)-1), -(Math.sqrt(3)-1)/(4*Math.sqrt(2))
  );

  newARef = a.setEulerZYX( 2 * Math.PI / 3, 5 * Math.PI / 12, -Math.PI / 4 );

  ok( Math.abs( answer.m_el0.x - newARef.m_el0.x ) < EPSILON &&
      Math.abs( answer.m_el0.y - newARef.m_el0.y ) < EPSILON &&
      Math.abs( answer.m_el0.z - newARef.m_el0.z ) < EPSILON &&
      Math.abs( answer.m_el1.x - newARef.m_el1.x ) < EPSILON &&
      Math.abs( answer.m_el1.y - newARef.m_el1.y ) < EPSILON &&
      Math.abs( answer.m_el1.z - newARef.m_el1.z ) < EPSILON &&
      Math.abs( answer.m_el2.x - newARef.m_el2.x ) < EPSILON &&
      Math.abs( answer.m_el2.y - newARef.m_el2.y ) < EPSILON &&
      Math.abs( answer.m_el2.z - newARef.m_el2.z ) < EPSILON );

  strictEqual( newARef, aRef, 'does not allocate new a' );
});

test( 'getEulerZYX', function() {
  ok( Bump.Matrix3x3.prototype.getEulerZYX, 'getEulerZYX exists' );

  var a = Bump.Matrix3x3.create(
        1/4*(Math.sqrt(3)-1), 1/8*Math.sqrt(3)*(1+Math.sqrt(3))-1/(2*Math.sqrt(2)), 1/8*(-1-Math.sqrt(3))-Math.sqrt(3/2)/2,
        1/4*(1-Math.sqrt(3)), -1/(2*Math.sqrt(2))-1/8*Math.sqrt(3)*(1+Math.sqrt(3)), 1/8*(1+Math.sqrt(3))-Math.sqrt(3/2)/2,
        -(1+Math.sqrt(3))/(2*Math.sqrt(2)), 1/4*Math.sqrt(3/2)*(Math.sqrt(3)-1), -(Math.sqrt(3)-1)/(4*Math.sqrt(2))
      ),
      aRef = a,
      aClone = a.clone(),
      answer = {
        yaw: -Math.PI / 4,
        pitch: 5 * Math.PI / 12,
        roll: 2 * Math.PI / 3
      },
      EPSILON = Math.pow( 2, -48 );

  var results = a.getEulerZYX( {} );
  ok( Math.abs( answer.yaw   - results.yaw   ) < EPSILON &&
      Math.abs( answer.pitch - results.pitch ) < EPSILON &&
      Math.abs( answer.roll  - results.roll  ) < EPSILON );

  strictEqual( a, aRef, 'does not allocate new a' );
  deepEqual( a, aClone, 'does not modify a' );
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
  ok( Bump.Matrix3x3.prototype.add, 'add exists' );

  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      aRef = a,
      aClone = Bump.Matrix3x3.clone( a ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      bRef = b,
      bClone = Bump.Matrix3x3.clone( b ),
      answer = Bump.Matrix3x3.create( 26, 34, 8, 11, 21, 17, 8, 17, 20 ),
      Z = Bump.Matrix3x3.create();

  deepEqual( aClone, a.add( Z ), 'zero serves as identity' );
  deepEqual( answer, a.add( b ) );

  deepEqual( b, bClone, 'does not modify b' );

  var newBRef = a.add( b, b );
  strictEqual( bRef, newBRef, 'answer is placed in specified destination' );
  deepEqual( answer, b );

  strictEqual( a, aRef, 'does not allocate new a' );
  strictEqual( b, bRef, 'does not allocate new b' );
  deepEqual( a, aClone, 'does not modify a' );
});

test( 'addSelf', function() {
  ok( Bump.Matrix3x3.prototype.addSelf, 'addSelf exists' );

  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      aRef = a,
      aClone = Bump.Matrix3x3.clone( a ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      bRef = b,
      bClone = Bump.Matrix3x3.clone( b ),
      answer = Bump.Matrix3x3.create( 26, 34, 8, 11, 21, 17, 8, 17, 20 ),
      Z = Bump.Matrix3x3.create();

  deepEqual( aClone, a.addSelf( Z ), 'zero serves as identity' );
  deepEqual( answer, a.addSelf( b ) );

  strictEqual( a, aRef, 'does not allocate new a' );
  strictEqual( b, bRef, 'does not allocate new b' );
  deepEqual( b, bClone, 'does not modify argument matrix' );
});

test( 'subtract', function() {
  ok( Bump.Matrix3x3.prototype.subtract, 'subtract exists' );

  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      aRef = a,
      aClone = Bump.Matrix3x3.clone( a ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      bRef = b,
      bClone = Bump.Matrix3x3.clone( b ),
      answer = Bump.Matrix3x3.create( 2, -16, -2, -7, 1, 13, -8, 7, 14 ),
      Z = Bump.Matrix3x3.create();

  deepEqual( aClone, a.subtract( Z ), 'zero serves as identity' );
  deepEqual( answer, a.subtract( b ) );

  deepEqual( b, bClone, 'does not modify b' );

  var newBRef = a.subtract( b, b );
  strictEqual( bRef, newBRef, 'answer is placed in specified destination' );
  deepEqual( answer, b );

  strictEqual( a, aRef, 'does not allocate new a' );
  strictEqual( b, bRef, 'does not allocate new b' );
  deepEqual( a, aClone, 'does not modify a' );
});

test( 'subtractSelf', function() {
  ok( Bump.Matrix3x3.prototype.subtractSelf, 'subtractSelf exists' );

  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      aRef = a,
      aClone = Bump.Matrix3x3.clone( a ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      bRef = b,
      bClone = Bump.Matrix3x3.clone( b ),
      answer = Bump.Matrix3x3.create( 2, -16, -2, -7, 1, 13, -8, 7, 14 ),
      Z = Bump.Matrix3x3.create();

  deepEqual( aClone, a.subtractSelf( Z ), 'zero serves as identity' );
  deepEqual( answer, a.subtractSelf( b ) );

  strictEqual( a, aRef, 'does not allocate new a' );
  strictEqual( b, bRef, 'does not allocate new b' );
  deepEqual( b, bClone, 'does not modify argument matrix' );
});

test( 'multiplyMatrix', function() {
  ok( Bump.Matrix3x3.prototype.multiplyMatrix, 'multiplyMatrix exists' );

  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      aRef = a,
      aClone = Bump.Matrix3x3.clone( a ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      bRef = b,
      bClone = Bump.Matrix3x3.clone( b ),
      answer = Bump.Matrix3x3.create( 273, 455, 97, 243, 235, 77, 244, 205, 75 ),
      I = Bump.Matrix3x3.getIdentity();

  deepEqual( aClone, a.multiplyMatrix( I ), 'identity serves as identity' );
  deepEqual( answer, a.multiplyMatrix( b ) );

  deepEqual( b, bClone, 'does not modify b' );

  var newBRef = a.multiplyMatrix( b, b );
  strictEqual( bRef, newBRef, 'answer is placed in specified destination' );
  deepEqual( answer, b );

  strictEqual( a, aRef, 'does not allocate new a' );
  strictEqual( b, bRef, 'does not allocate new b' );
  deepEqual( a, aClone, 'does not modify a' );
});

test( 'multiplyMatrixSelf', function() {
  ok( Bump.Matrix3x3.prototype.multiplyMatrixSelf, 'multiplyMatrixSelf exists' );

  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      aRef = a,
      aClone = Bump.Matrix3x3.clone( a ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      bRef = b,
      bClone = Bump.Matrix3x3.clone( b ),
      answer = Bump.Matrix3x3.create( 273, 455, 97, 243, 235, 77, 244, 205, 75 ),
      I = Bump.Matrix3x3.getIdentity();

  deepEqual( aClone, a.multiplyMatrixSelf( I ), 'identity serves as identity' );
  deepEqual( answer, a.multiplyMatrixSelf( b ) );

  strictEqual( a, aRef, 'does not allocate new a' );
  strictEqual( b, bRef, 'does not allocate new b' );
  deepEqual( b, bClone, 'does not modify argument matrix' );
});

test( 'multiplyVector', function() {
  ok( Bump.Matrix3x3.prototype.multiplyVector, 'multiplyVector exists' );

  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      aRef = a,
      aClone = Bump.Matrix3x3.clone( a ),
      b = Bump.Vector3.create( 12, 25, 5 ),
      bRef = b,
      bClone = Bump.Vector3.clone( b ),
      answer = Bump.Vector3.create( 408, 374, 385 ),
      I = Bump.Matrix3x3.getIdentity();

  deepEqual( bClone, I.multiplyVector( b ), 'identity serves as identity' );
  deepEqual( answer, a.multiplyVector( b ) );

  deepEqual( b, bClone, 'does not modify b' );

  var newBRef = a.multiplyVector( b, b );
  strictEqual( bRef, newBRef, 'answer is placed in specified destination' );
  deepEqual( answer, b );

  strictEqual( a, aRef, 'does not allocate new a' );
  strictEqual( b, bRef, 'does not allocate new b' );
  deepEqual( a, aClone, 'does not modify a' );
});

test( 'vectorMultiply', function() {
  ok( Bump.Matrix3x3.prototype.vectorMultiply, 'vectorMultiply exists' );

  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      aRef = a,
      aClone = Bump.Matrix3x3.clone( a ),
      b = Bump.Vector3.create( 12, 25, 5 ),
      bRef = b,
      bClone = Bump.Vector3.clone( b ),
      answer = Bump.Vector3.create( 218, 443, 496 ),
      I = Bump.Matrix3x3.getIdentity();

  deepEqual( bClone, I.vectorMultiply( b ), 'identity serves as identity' );
  deepEqual( answer, a.vectorMultiply( b ) );

  deepEqual( b, bClone, 'does not modify b' );

  var newBRef = a.vectorMultiply( b, b );
  strictEqual( bRef, newBRef, 'answer is placed in specified destination' );
  deepEqual( answer, b );

  strictEqual( a, aRef, 'does not allocate new a' );
  strictEqual( b, bRef, 'does not allocate new b' );
  deepEqual( a, aClone, 'does not modify a' );
});

test( 'multiplyScalar', function() {
  ok( Bump.Matrix3x3.prototype.multiplyScalar, 'multiplyScalar exists' );

  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      aRef = a,
      aClone = Bump.Matrix3x3.clone( a ),
      answer = Bump.Matrix3x3.create( -42, -27, -9, -6, -33, -45, 0, -36, -51 ),
      I = Bump.Matrix3x3.getIdentity();

  deepEqual( aClone, a.multiplyScalar( 1 ), '1 serves as identity' );
  deepEqual( answer, a.multiplyScalar( -3 ) );
  deepEqual( a, aClone, 'does not modify a' );

  var newARef = a.multiplyScalar( -3, a );
  strictEqual( aRef, newARef, 'answer is placed in specified destination' );
  deepEqual( answer, a );

  strictEqual( a, aRef, 'does not allocate new a' );
});

test( 'scaled', function() {
  ok( Bump.Matrix3x3.prototype.scaled, 'scaled exists' );
});

test( 'transposeTimes', function() {
  ok( Bump.Matrix3x3.prototype.transposeTimes, 'transposeTimes exists' );

  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      aRef = a,
      aClone = Bump.Matrix3x3.clone( a ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      bRef = b,
      bClone = Bump.Matrix3x3.clone( b ),
      answer = Bump.Matrix3x3.create( 186, 370, 74, 303, 395, 103, 307, 310, 96 ),
      I = Bump.Matrix3x3.getIdentity();

  deepEqual( aClone, I.transposeTimes( a ) );
  deepEqual( answer, a.transposeTimes( b ) );
  deepEqual( b, bClone, 'does not modify b' );

  var newBRef = a.transposeTimes( b, b );
  strictEqual( bRef, newBRef, 'answer is placed in specified destination' );
  deepEqual( answer, b );

  strictEqual( a, aRef, 'does not allocate new a' );
  strictEqual( b, bRef, 'does not allocate new b' );
  deepEqual( a, aClone, 'does not modify a' );
});

test( 'timesTranspose', function() {
  ok( Bump.Matrix3x3.prototype.timesTranspose, 'timesTranspose exists' );

  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      aRef = a,
      aClone = Bump.Matrix3x3.clone( a ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      bRef = b,
      bClone = Bump.Matrix3x3.clone( b ),
      answer = Bump.Matrix3x3.create( 408, 222, 166, 374, 158, 116, 385, 154, 111 ),
      I = Bump.Matrix3x3.getIdentity();

  deepEqual( aClone, a.timesTranspose( I ) );
  deepEqual( answer, a.timesTranspose( b ) );
  deepEqual( b, bClone, 'does not modify b' );

  var newBRef = a.timesTranspose( b, b );
  strictEqual( bRef, newBRef, 'answer is placed in specified destination' );
  deepEqual( answer, b );

  strictEqual( a, aRef, 'does not allocate new a' );
  strictEqual( b, bRef, 'does not allocate new b' );
  deepEqual( a, aClone, 'does not modify a' );
});

module( 'Bump.Matrix3x3 advanced utilities' );

test( 'determinant', function() {
  ok( Bump.Matrix3x3.prototype.determinant, 'determinant exists' );

  var Z = Bump.Matrix3x3.create(),
      I = Bump.Matrix3x3.getIdentity(),
      a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 );

  equal( Z.determinant(), 0 );
  equal( I.determinant(), 1 );
  equal( a.determinant(), -136 );
  equal( b.determinant(), -210 );
});

test( 'adjoint', function() {
  ok( Bump.Matrix3x3.prototype.adjoint, 'adjoint exists' );

  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      aRef = a,
      aClone = Bump.Matrix3x3.clone( a ),
      aAdj = Bump.Matrix3x3.create( 7, -117, 102, -34, 238, -204, 24, -168, 136 ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      bRef = b,
      bClone = Bump.Matrix3x3.clone( b ),
      bAdj = Bump.Matrix3x3.create( 20, -50, 0, -11, -4, 21, -35, 140, -105 );

  deepEqual( a.adjoint(), aAdj );
  deepEqual( b.adjoint(), bAdj );
  deepEqual( b, bClone, 'does not modify b' );

  var newBRef = b.adjoint( b );
  strictEqual( bRef, newBRef, 'answer is placed in specified destination' );
  deepEqual( b, bAdj );

  strictEqual( a, aRef, 'does not allocate new a' );
  strictEqual( b, bRef, 'does not allocate new b' );
  deepEqual( a, aClone, 'does not modify a' );
});

test( 'absolute', function() {
  ok( Bump.Matrix3x3.prototype.absolute, 'absolute exists' );

  var a = Bump.Matrix3x3.create( -14, 9, -3, 2, -11, 15, -0, 12, -17 ),
      aRef = a,
      aClone = Bump.Matrix3x3.clone( a ),
      aAbs = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      b = Bump.Matrix3x3.create( 12, -25, 5, -9, 10, -2, 8, -5, 3 ),
      bRef = b,
      bClone = Bump.Matrix3x3.clone( b ),
      bAbs = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 );

  deepEqual( a.absolute(), aAbs );
  deepEqual( b.absolute(), bAbs );
  deepEqual( b, bClone, 'does not modify b' );

  var newBRef = b.absolute( b );
  strictEqual( bRef, newBRef, 'answer is placed in specified destination' );
  deepEqual( b, bAbs );

  strictEqual( a, aRef, 'does not allocate new a' );
  strictEqual( b, bRef, 'does not allocate new b' );
  deepEqual( a, aClone, 'does not modify a' );
});

test( 'transpose', function() {
  ok( Bump.Matrix3x3.prototype.transpose, 'transpose exists' );

  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      aRef = a,
      aClone = Bump.Matrix3x3.clone( a ),
      aTrp = Bump.Matrix3x3.create( 14, 2, 0, 9, 11, 12, 3, 15, 17 ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      bRef = b,
      bClone = Bump.Matrix3x3.clone( b ),
      bTrp = Bump.Matrix3x3.create( 12, 9, 8, 25, 10, 5, 5, 2, 3 );

  deepEqual( a.transpose(), aTrp );
  deepEqual( b.transpose(), bTrp );
  deepEqual( b, bClone, 'does not modify b' );

  var newBRef = b.transpose( b );
  strictEqual( bRef, newBRef, 'answer is placed in specified destination' );
  deepEqual( b, bTrp );

  strictEqual( a, aRef, 'does not allocate new a' );
  strictEqual( b, bRef, 'does not allocate new b' );
  deepEqual( a, aClone, 'does not modify a' );
});

test( 'inverse', function() {
  ok( Bump.Matrix3x3.prototype.inverse, 'inverse exists' );

  var a = Bump.Matrix3x3.create( 14, 9, 3, 2, 11, 15, 0, 12, 17 ),
      aRef = a,
      aClone = Bump.Matrix3x3.clone( a ),
      aInv = Bump.Matrix3x3.create( -7 / 136, 117 / 136, -102 / 136, 34 / 136, -238 / 136, 204 / 136, -24 / 136, 168 / 136, -1 ),
      b = Bump.Matrix3x3.create( 12, 25, 5, 9, 10, 2, 8, 5, 3 ),
      bRef = b,
      bClone = Bump.Matrix3x3.clone( b ),
      bInv = Bump.Matrix3x3.create( -20 / 210, 50 / 210, 0, 11 / 210, 4 / 210, -21 / 210, 35 / 210, -140 / 210, 105 / 210 ),
      EPSILON = Math.pow( 2, -48 ),
      result = Bump.Matrix3x3.create();

  a.inverse( result );

  ok( Math.abs( aInv.m_el0.x - result.m_el0.x ) < EPSILON &&
      Math.abs( aInv.m_el0.y - result.m_el0.y ) < EPSILON &&
      Math.abs( aInv.m_el0.z - result.m_el0.z ) < EPSILON &&
      Math.abs( aInv.m_el1.x - result.m_el1.x ) < EPSILON &&
      Math.abs( aInv.m_el1.y - result.m_el1.y ) < EPSILON &&
      Math.abs( aInv.m_el1.z - result.m_el1.z ) < EPSILON &&
      Math.abs( aInv.m_el2.x - result.m_el2.x ) < EPSILON &&
      Math.abs( aInv.m_el2.y - result.m_el2.y ) < EPSILON &&
      Math.abs( aInv.m_el2.z - result.m_el2.z ) < EPSILON );

  b.inverse( result );

  ok( Math.abs( bInv.m_el0.x - result.m_el0.x ) < EPSILON &&
      Math.abs( bInv.m_el0.y - result.m_el0.y ) < EPSILON &&
      Math.abs( bInv.m_el0.z - result.m_el0.z ) < EPSILON &&
      Math.abs( bInv.m_el1.x - result.m_el1.x ) < EPSILON &&
      Math.abs( bInv.m_el1.y - result.m_el1.y ) < EPSILON &&
      Math.abs( bInv.m_el1.z - result.m_el1.z ) < EPSILON &&
      Math.abs( bInv.m_el2.x - result.m_el2.x ) < EPSILON &&
      Math.abs( bInv.m_el2.y - result.m_el2.y ) < EPSILON &&
      Math.abs( bInv.m_el2.z - result.m_el2.z ) < EPSILON );

  deepEqual( b, bClone, 'does not modify b' );

  var newBRef = b.inverse( b );
  strictEqual( bRef, newBRef, 'answer is placed in specified destination' );

  ok( Math.abs( bInv.m_el0.x - b.m_el0.x ) < EPSILON &&
      Math.abs( bInv.m_el0.y - b.m_el0.y ) < EPSILON &&
      Math.abs( bInv.m_el0.z - b.m_el0.z ) < EPSILON &&
      Math.abs( bInv.m_el1.x - b.m_el1.x ) < EPSILON &&
      Math.abs( bInv.m_el1.y - b.m_el1.y ) < EPSILON &&
      Math.abs( bInv.m_el1.z - b.m_el1.z ) < EPSILON &&
      Math.abs( bInv.m_el2.x - b.m_el2.x ) < EPSILON &&
      Math.abs( bInv.m_el2.y - b.m_el2.y ) < EPSILON &&
      Math.abs( bInv.m_el2.z - b.m_el2.z ) < EPSILON );

  strictEqual( a, aRef, 'does not allocate new a' );
  strictEqual( b, bRef, 'does not allocate new b' );
  deepEqual( a, aClone, 'does not modify a' );
});

// test( 'diagonalize', function() {
//   ok( Bump.Matrix3x3.prototype.diagonalize, 'diagonalize exists' );

//   var EPSILON = Math.pow( 2, -48 );

//   deepEqual(
//     Bump.Matrix3x3.getIdentity().diagonalize( undefined, EPSILON, Infinity ),
//     Bump.Matrix3x3.getIdentity(),
//     'identity diagonalizes to identity'
//   );

//   var a = Bump.Matrix3x3.create( 1, 1, 0, 1, 5, 0, 0, 0, 1 ),
//       aRef = a,
//       aClone = a.clone(),
//       aDgn = Bump.Matrix3x3.create( 3 + Math.sqrt( 5 ), 0, 0, 0, 1, 0, 0, 0, 3 - Math.sqrt( 5 ) );

//   a.diagonalize( undefined, EPSILON, Infinity );
//   equal( aDgn.m_el0.x, a.m_el0.x );
//   equal( 1/(2*Math.sqrt(5))-1/2*Math.sqrt(5)*(-2-Math.sqrt(5))+(-2+Math.sqrt(5))*(1/(2*Math.sqrt(5))-(-2-Math.sqrt(5))/(2*Math.sqrt(5))), a.m_el0.x );
//   equal( ((1+Math.sqrt(5))*(5+Math.sqrt(5)))/(2*Math.sqrt(5)), a.m_el0.x );
//   equal( 1/2*(1+Math.sqrt(5)*(2+Math.sqrt(5))), a.m_el0.x );
//   equal( aDgn.m_el0.y, a.m_el0.y );
//   equal( aDgn.m_el0.z, a.m_el0.z );
//   ok( Math.abs( aDgn.m_el0.x - a.m_el0.x ) < EPSILON &&
//       Math.abs( aDgn.m_el0.y - a.m_el0.y ) < EPSILON &&
//       Math.abs( aDgn.m_el0.z - a.m_el0.z ) < EPSILON &&
//       Math.abs( aDgn.m_el1.x - a.m_el1.x ) < EPSILON &&
//       Math.abs( aDgn.m_el1.y - a.m_el1.y ) < EPSILON &&
//       Math.abs( aDgn.m_el1.z - a.m_el1.z ) < EPSILON &&
//       Math.abs( aDgn.m_el2.x - a.m_el2.x ) < EPSILON &&
//       Math.abs( aDgn.m_el2.y - a.m_el2.y ) < EPSILON &&
//       Math.abs( aDgn.m_el2.z - a.m_el2.z ) < EPSILON );
// });

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

module( 'Bump.Matrix3x3 TODO' );

test( 'incomplete', function() {
  if ( ok( Bump.Quaternion, 'Matrix3x3 depends on Quaternion' ) ) {
    ok( Bump.Matrix3x3.prototype.getRotation );
    ok( Bump.Matrix3x3.prototype.setRotation );
  }
});
