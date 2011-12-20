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

test( 'operator* property', function() {
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
