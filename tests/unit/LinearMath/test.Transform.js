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

test( 'basic', function() {
  var a = Bump.Transform.create( Bump.Quaternion.getIdentity(), Bump.Vector3.create() );
  var b = Bump.Transform.clone( a );
  deepEqual( a, b, 'clone is equivalent' );
  notStrictEqual( a, b, 'clones object' );
  ok( a.basis !== b.basis && a.origin !== b.basis, 'deep clones properties' )
});
