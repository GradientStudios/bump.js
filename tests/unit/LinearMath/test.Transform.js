// Assuming that clone works, tests `op` on `a` with a list of arguments `b` and
// expected values `expected`.
//
// Options include:
//
// - a test for setting a destination, `create`d from given `destType`
// - a test for setting `a` as the destination
var testBinaryOp = function( op, a, b, expected, options ) {
  options = options || {};
  options.selfDestination = options.selfDestination === undefined ? false : options.selfDestination;
  options.modifiesSelf = options.modifiesSelf === undefined ? false : options.modifiesSelf;

  b = Array.isArray( b ) ? b : [ b ];
  expected = Array.isArray( expected ) ? expected : [ expected ];

  var aRef = a,
      aClone = a.clone();

  for ( var i = 0; i < b.length; ++i ) {
    var bRef = b[i],
        bClone = b[i].clone(),
        c;

    deepEqual( op.apply( a, [ b[i] ] ), expected[i] );
    if ( options.modifiesSelf ) {
      deepEqual( a, expected[i] );
      aClone.clone( a );
    } else {
      deepEqual( a, aClone, 'does not modify a' );
    }

    if ( options.destType ) {
      var d = options.destType.create(),
          dRef = d;

      c = op.apply( a, [ b[i], d ] );
      strictEqual( c, dRef, 'answer is placed in specified destination' );
      deepEqual( d, expected[i], 'setting destination works correctly' );

      if ( !options.modifiesSelf ) {
        deepEqual( a, aClone, 'does not modify a' );
      }
    }

    // self destination test modifies a
    if ( options.selfDestination ) {
      c = op.apply( a, [ b[i], a ] );
      strictEqual( c, aRef, 'answer is placed in specified destination' );
      deepEqual( a, expected[i], 'setting yourself as destination works correctly' );

      // reset a after done
      aClone.clone( a );
    }

    strictEqual( a, aRef, 'does not allocate new a' );
    strictEqual( b[i], bRef, 'does not allocate new b' );
    deepEqual( b[i], bClone, 'does not modify b' );

    aClone.clone( a );
  }
};

module( 'Bump.Transform' );

test( 'Transform exists', function() {
  var transform = Bump.Transform || {};
  strictEqual( typeof transform.create, 'function', 'Bump.Transform exists' );
});

test( 'Transform creation', function() {
  var t = Bump.Transform.create() || {};
  ok( t instanceof Bump.Transform.prototype.init, 'creation without `new` operator' );
});

module( 'Bump.Transform constructor' );

test( 'empty', function() {
  var transform = Bump.Transform.create();
  deepEqual( transform.basis, Bump.Matrix3x3.create(), 'basis zeroed out' );
  deepEqual( transform.origin, Bump.Vector3.create(), 'origin zeroed out' );
});

test( 'arguments (Quaternion)', function() {
  var quaternion = Bump.Quaternion.getIdentity(),
      transform = Bump.Transform.create( quaternion );

  deepEqual( transform.basis, Bump.Matrix3x3.getIdentity(), 'basis is identity matrix' );
  deepEqual( transform.origin, Bump.Vector3.create(), 'origin zeroed out' );
});

test( 'arguments (Quaternion, Vector3)', function() {
  var quaternion = Bump.Quaternion.getIdentity(),
      origin = Bump.Vector3.create( 42, Math.PI, Math.E ),
      transform = Bump.Transform.create( quaternion, origin );

  deepEqual( transform.basis, Bump.Matrix3x3.getIdentity(), 'basis is identity matrix' );
  deepEqual( transform.origin, origin, 'origin is set' );
  notStrictEqual( transform.origin, origin, 'transform origin is new copy' );
});

module( 'Bump.Transform.clone' );

test( 'static', function() {
  var a = Bump.Transform.create( Bump.Quaternion.getIdentity(), Bump.Vector3.create() ),
      aRef = a,
      b = Bump.Transform.clone( a );

  deepEqual( a, b, 'clone is equivalent' );
  notStrictEqual( a, b, 'clones object' );
  ok( a.basis !== b.basis && a.origin !== b.basis, 'deep clones properties' )
  strictEqual( a, aRef, 'a is not reallocated' );
});

test( 'member clone without destination', function() {
  var a = Bump.Transform.create( Bump.Quaternion.getIdentity(), Bump.Vector3.create() ),
      aRef = a,
      b = a.clone();

  deepEqual( a, b, 'clone is equivalent' );
  notStrictEqual( a, b, 'clones object' );
  ok( a.basis !== b.basis && a.origin !== b.origin, 'deep clones properties' );
  strictEqual( a, aRef, 'a is not reallocated' );
});

test( 'member clone to destination', function() {
  var a = Bump.Transform.create( Bump.Quaternion.getIdentity(), Bump.Vector3.create() ),
      aRef = a,
      b = Bump.Transform.create(),
      bRef = b;

  a.clone( b );
  deepEqual( a, b, 'clone is equivalent' );
  notStrictEqual( a, b, 'clones object' );
  ok( a.basis !== b.basis && a.origin !== b.origin, 'deep clones properties' );
  strictEqual( a, aRef, 'a is not reallocated' );
  strictEqual( b, bRef, 'b is not reallocated' );
});

module( 'Bump.Transform.setOrigin' );
test( 'basic', function() {
  var a = Bump.Transform.create(),
      aRef = a,
      aOriginRef = a.origin,
      o = Bump.Vector3.create( 1, 1, 1 ),
      oRef = o,
      oClone = o.clone(),
      n = a.setOrigin( o );

  strictEqual( n, aRef, 'returns original transform' );
  deepEqual( a.origin, o, 'sets origin' );
  strictEqual( a, aRef, 'a is not reallocated' );
  strictEqual( a.origin, aOriginRef, 'a.origin is not reallocated' );
  deepEqual( o, oClone, 'o is not modified' );
  strictEqual( o, oRef, 'o is not reallocated' );
});

module( 'Bump.Transform.setBasis' );
test( 'basic', function() {
  var a = Bump.Transform.create(),
      aRef = a,
      aBasisRef = a.basis,
      b = Bump.Matrix3x3.create( 1, 2, 3, 4, 5, 6, 7, 8, 9 ),
      bRef = b,
      bClone = b.clone(),
      n = a.setBasis( b );

  strictEqual( n, aRef, 'returns original transform' );
  deepEqual( a.basis, b, 'sets basis' );
  strictEqual( a, aRef, 'a is not reallocated' );
  strictEqual( a.basis, aBasisRef, 'a.basis is not reallocated' );
  deepEqual( b, bClone, 'b is not modified' );
  strictEqual( b, bRef, 'b is not reallocated' );
});

module( 'Bump.Transform.setRotation' );
test( 'basic', function() {
  var a = Bump.Transform.create(),
      aRef = a,
      aBasisRef = a.basis,
      q = Bump.Quaternion.getIdentity(),
      qRef = q,
      qClone = q.clone(),
      n = a.setRotation( q );

  strictEqual( n, aRef, 'returns original transform' );
  deepEqual( a.basis, Bump.Matrix3x3.getIdentity(), 'sets basis to identity rotation' );
  strictEqual( a, aRef, 'a is not reallocated' );
  strictEqual( a.basis, aBasisRef, 'a.basis is not reallocated' );
  deepEqual( q, qClone, 'q is not modified' );
  strictEqual( q, qRef, 'q is not reallocated' );
});

module( 'Bump.Transform.setIdentity' );
test( 'basic', function() {
  var a = Bump.Transform.create( Bump.Quaternion.create(), Bump.Vector3.create( 1, 1, 1 ) ),
      aRef = a,
      aBasisRef = a.basis,
      aOriginRef = a.origin,
      n = a.setIdentity();

  strictEqual( n, aRef, 'returns original transform' );
  deepEqual( a.basis, Bump.Matrix3x3.getIdentity(), 'sets basis to identity rotation' );
  deepEqual( a.origin, Bump.Vector3.create( 0, 0, 0 ), 'zeroes out origin' );
  strictEqual( a, aRef, 'a is not reallocated' );
  strictEqual( a.basis, aBasisRef, 'a.basis is not reallocated' );
  strictEqual( a.origin, aOriginRef, 'a.origin is not reallocated' );
});

module( 'Bump.Transform.multiplyTransform' );
test( 'basic', function() {
  var a = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, -1, 1 ), Math.PI / 3 ),
        Bump.Vector3.create( -1, -1, -1 )
      ),
      b = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, 1, 1 ), Math.PI ),
        Bump.Vector3.create( 1, 1, 1 )
      ),
      expected = Bump.Transform.create(
        Bump.Matrix3x3.create(
          -0.8888888888888891, 0.4444444444444444, 0.1111111111111114,
          -0.11111111111111094, -0.44444444444444464, 0.8888888888888891,
          0.4444444444444445, 0.7777777777777779, 0.4444444444444444
        ),
        Bump.Vector3.create( -1.3333333333333333, -0.6666666666666666, 0.6666666666666667 )
      );

  testBinaryOp( Bump.Transform.prototype.multiplyTransform, a, b, expected, {
    selfDestination: true,
    destType: Bump.Transform
  });
});

module( 'Bump.Transform.multiplyTransform' );
test( 'basic', function() {
  var a = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, -1, 1 ), Math.PI / 3 ),
        Bump.Vector3.create( -1, -1, -1 )
      ),
      b = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, 1, 1 ), Math.PI ),
        Bump.Vector3.create( 1, 1, 1 )
      ),
      expected = Bump.Transform.create(
        Bump.Matrix3x3.create(
          -0.8888888888888891, 0.4444444444444444, 0.1111111111111114,
          -0.11111111111111094, -0.44444444444444464, 0.8888888888888891,
          0.4444444444444445, 0.7777777777777779, 0.4444444444444444
        ),
        Bump.Vector3.create( -1.3333333333333333, -0.6666666666666666, 0.6666666666666667 )
      );

  testBinaryOp( Bump.Transform.prototype.multiplyTransform, a, b, expected, {
    selfDestination: true,
    destType: Bump.Transform
  });
});

module( 'Bump.Transform.multiplyTransformSelf' );
test( 'basic', function() {
  var a = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, -1, 1 ), Math.PI / 3 ),
        Bump.Vector3.create( -1, -1, -1 )
      ),
      b = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, 1, 1 ), Math.PI ),
        Bump.Vector3.create( 1, 1, 1 )
      ),
      expected = Bump.Transform.create(
        Bump.Matrix3x3.create(
          -0.8888888888888891, 0.4444444444444444, 0.1111111111111114,
          -0.11111111111111094, -0.44444444444444464, 0.8888888888888891,
          0.4444444444444445, 0.7777777777777779, 0.4444444444444444
        ),
        Bump.Vector3.create( -1.3333333333333333, -0.6666666666666666, 0.6666666666666667 )
      );

  testBinaryOp( Bump.Transform.prototype.multiplyTransformSelf, a, b, expected, {
    selfDestination: false,
    modifiesSelf: true
  });
});

module( 'Bump.Transform.multiplyQuaternion' );
test( 'basic', function() {
  var a = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, -1, 1 ), Math.PI / 3 ),
        Bump.Vector3.create( -1, -1, -1 )
      ),
      b = Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, 1, 1 ), Math.PI ),
      expected = Bump.Quaternion.create( 0.16666666666666655, 0.5, 0.8333333333333335, -0.16666666666666666 );

  testBinaryOp( Bump.Transform.prototype.multiplyQuaternion, a, b, expected, {
    destType: Bump.Quaternion
  });
});

module( 'Bump.Transform.multiplyVector' );
test( 'basic', function() {
  var a = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle( Bump.Vector3.create( 1, -1, 1 ), Math.PI / 3 ),
        Bump.Vector3.create( -1, -1, -1 )
      ),
      b = Bump.Vector3.create( 1, 1, 1 ),
      expected = Bump.Vector3.create( -1.3333333333333333, -0.6666666666666666, 0.6666666666666667 );

  testBinaryOp( Bump.Transform.prototype.multiplyVector, a, b, expected, {
    destType: Bump.Vector3
  });
});
