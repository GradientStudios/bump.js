module( 'AlignedObjectArray.resize' );

test( 'non-Types', function() {
  var arr = [];

  Bump.resize( arr, 5, 0 );

  for ( var i = 0; i < 5; ++i ) {
    strictEqual( arr[i], 0 );
  }
  strictEqual( arr.length, 5 );
});

test( 'nulls', function() {
  var arr = [];

  Bump.resize( arr, 5, null );

  for ( var i = 0; i < 5; ++i ) {
    strictEqual( arr[i], null );
  }
  strictEqual( arr.length, 5 );
});

module( 'Vector3Array.create' );

test( 'basic', function() {
  var arr = Bump.Vector3Array.create();

  ok( arr instanceof Bump.Vector3Array.prototype.constructor, 'correct type' );
});

module( 'Vector3Array.push' );

test( 'basic', function() {
  var arr = Bump.Vector3Array.create();
  var targetLength = 300;
  var i, e = 0;
  for ( i = 0; i < targetLength; ++i ) {
    arr.push( Bump.Vector3.create( e++, e++, e++ ) );
  }

  equal( arr.size(), targetLength, 'correct length' );

  var pass = true;
  for ( i = 0; i < targetLength; ++i ) {
    pass = pass && arr.view[ i * 4     ] === i * 3;
    pass = pass && arr.view[ i * 4 + 1 ] === i * 3 + 1;
    pass = pass && arr.view[ i * 4 + 2 ] === i * 3 + 2;
    pass = pass && arr.view[ i * 4 + 3 ] === 0;
  }

  ok( pass, 'all pushed values are correct' );

  equal( arr.capacity, 512, 'correct power of 2 capacity' );
});

module( 'Vector3Array.at' );

test( 'basic', function() {
  var arr = Bump.Vector3Array.create();
  var targetLength = 300;
  var i, e = 0;
  for ( i = 0; i < targetLength; ++i ) {
    arr.push( Bump.Vector3.create( e++, e++, e++ ) );
  }

  var result = Bump.Vector3.create();
  result.assign( arr.at( 50 ) );

  deepEqual( result, Bump.Vector3.create( 150, 151, 152 ) );
});

module( 'Vector3Array.pointerAt' );

test( 'basic', function() {
  var arr = Bump.Vector3Array.create();
  var targetLength = 300;
  var i, e = 0;
  for ( i = 0; i < targetLength; ++i ) {
    arr.push( Bump.Vector3.create( e++, e++, e++ ) );
  }

  var ptr = arr.pointerAt( 50 );
  ok( ptr instanceof Float64Array, 'correct typed array: Float64Array' );
  equal( ptr.length, 2048 - 200, 'correct view length' );
  equal( ptr[0], 150, 'Float64Array starts at the correct place' );
});

module( 'UnsignedIntArray.create' );

test( 'basic', function() {
  var arr = Bump.UnsignedIntArray.create();

  ok( arr instanceof Bump.UnsignedIntArray.prototype.constructor, 'correct type' );
});

module( 'UnsignedIntArray.push' );

test( 'basic', function() {
  var arr = Bump.UnsignedIntArray.create();
  var targetLength = 300;
  var i, e = 0;
  for ( i = 0; i < targetLength; ++i ) {
    arr.push( ++e );
  }

  equal( arr.size(), targetLength, 'correct length' );

  var pass = true;
  for ( i = 0; i < targetLength; ++i ) {
    pass = pass && arr.view[ i ] === i + 1;
  }

  ok( pass, 'all pushed values are correct' );

  equal( arr.capacity, 512, 'correct power of 2 capacity' );
});

module( 'UnsignedIntArray.at' );

test( 'basic', function() {
  var arr = Bump.UnsignedIntArray.create();
  var targetLength = 300;
  var i, e = 0;
  for ( i = 0; i < targetLength; ++i ) {
    arr.push( ++e );
  }

  deepEqual( arr.at( 50 ), 51 );
});

module( 'UnsignedIntArray.pointerAt' );

test( 'basic', function() {
  var arr = Bump.UnsignedIntArray.create();
  var targetLength = 300;
  var i, e = 0;
  for ( i = 0; i < targetLength; ++i ) {
    arr.push( ++e );
  }

  var ptr = arr.pointerAt( 50 );
  ok( ptr instanceof Uint32Array, 'correct typed array: Uint32Array' );
  equal( ptr.length, 512 - 50, 'correct view length' );
  equal( ptr[0], 51, 'Uint32Array starts at the correct place' );
});
