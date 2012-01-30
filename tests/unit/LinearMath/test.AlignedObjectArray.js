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
