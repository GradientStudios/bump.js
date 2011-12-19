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
