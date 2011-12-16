module( 'Bump.Matrix3x3' );

test( 'Matrix3x3 exists', function() {
  ok( Bump.Matrix3x3 );
});

module( 'Bump.Matrix3x3 basic' );

test( 'instantiation', function() {
  // create
  ok( Bump.Matrix3x3.create, 'create exists' );

  var a = Bump.Matrix3x3.create(),
      b = Bump.Matrix3x3.create();
  ok( typeof a === 'object', 'creates an object' );
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

  // getIdentity
  ok( Bump.Matrix3x3.getIdentity, 'getIdentity exists' );
  var c = Bump.Matrix3x3.getIdentity(),
      d = Bump.Matrix3x3.getIdentity();

  ok( typeof c === 'object', 'creates an object' );
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

  // clone
  ok( Bump.Matrix3x3.clone, 'clone exists' );
  var e = Bump.Matrix3x3.clone( c );

  ok( e !== c, 'clone creates new object' );
  deepEqual( e, c, 'clone copies object' );
});

test( 'accessors', function() {
  var a = Bump.Matrix3x3.getIdentity(),
      tmp = Bump.Vector3.create();

  ok( tmp === a.getColumn( 0, tmp ), 'getColumn returns reference to passed in Vector3' );
  deepEqual( tmp, Bump.Vector3.create( 1, 0, 0 ) );

  ok( tmp === a.getColumn( 1, tmp ), 'getColumn returns reference to passed in Vector3' );
  deepEqual( tmp, Bump.Vector3.create( 0, 1, 0 ) );

  ok( tmp === a.getColumn( 2, tmp ), 'getColumn returns reference to passed in Vector3' );
  deepEqual( tmp, Bump.Vector3.create( 0, 0, 1 ) );

  ok( tmp === a.getRow( 0, tmp ), 'getRow returns reference to passed in Vector3' );
  deepEqual( tmp, Bump.Vector3.create( 1, 0, 0 ) );

  ok( tmp === a.getRow( 1, tmp ), 'getRow returns reference to passed in Vector3' );
  deepEqual( tmp, Bump.Vector3.create( 0, 1, 0 ) );

  ok( tmp === a.getRow( 2, tmp ), 'getRow returns reference to passed in Vector3' );
  deepEqual( tmp, Bump.Vector3.create( 0, 0, 1 ) );
});

test( 'setters', function() {
  var a = Bump.Matrix3x3.getIdentity(),
      b = Bump.Matrix3x3.create().setIdentity();

  deepEqual( a, b, 'getIdentity and setIdentity produce the same matrix' );

  var c = Bump.Matrix3x3.create( 1, 2, 3, 4, 5, 6, 7, 8, 9 ),
      d = Bump.Matrix3x3.clone( c ),
      dRef = d,
      e = Bump.Matrix3x3.create(),
      eRef = e;

  e.clone( d );

  ok( c !== d, 'Bump.Matrix3x3.clone creates new object' );
  ok( e === eRef, 'this.clone does not create new object' );
  ok( d === dRef, 'this.clone does not change cloned object' );

  deepEqual( c, d, 'all copies are similar' );
  deepEqual( c, e, 'all copies are similar' );
});
