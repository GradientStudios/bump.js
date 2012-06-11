module( 'UnionFind.create' );

test( 'basic', function() {
  var uf = Bump.UnionFind.create();

  ok( uf instanceof Bump.UnionFind.prototype.constructor, 'correct type' );
});

module( 'UnionFind.clone' );

test( 'basic', function() {
  var i, uf = Bump.UnionFind.create();
  uf.allocate( 4 );
  for ( i = 0; i < 4; ++i ) {
    uf.getElement( i ).id = i;
  }

  var clone = uf.clone();

  deepEqual( uf, clone );
  for ( i = 0; i < 4; ++i ) {
    strictEqual( clone.getElement( i ).id, i );
    notStrictEqual( uf.getElement( i ), clone.getElement( i ) );
  }
});

module( 'UnionFind.assign' );

test( 'test skipped', function() {
  expect( 0 );
});

module( 'UnionFind.sortIslands' );

test( 'test skipped', function() {
  expect( 0 );
});

module( 'UnionFind.reset' );

test( 'test skipped', function() {
  expect( 0 );
});

module( 'UnionFind.getNumElements' );

test( 'basic', function() {
  var uf = Bump.UnionFind.create();
  uf.allocate( 4 );

  testFunc( Bump.UnionFind, 'getNumElements', {
    objects: uf,
    expected: [ 4 ]
  });
});

module( 'UnionFind.isRoot' );

test( 'basic', function() {
  var uf = Bump.UnionFind.create();
  uf.allocate( 5 );
  for ( var i = 0; i < 5; ++i ) {
    uf.getElement( i ).id = 4 - i;
  }

  testFunc( Bump.UnionFind, 'isRoot', {
    objects: uf,
    args: [ [ 0 ], [ 1 ], [ 2 ], [ 3 ], [ 4 ] ],
    expected: [ false, false, true, false, false ]
  });
});

module( 'UnionFind.getElement' );

test( 'basic', function() {
  var uf = Bump.UnionFind.create();
  uf.allocate( 5 );

  testFunc( Bump.UnionFind, 'getElement', {
    objects: uf,
    args: [ [ 0 ], [ 1 ], [ 2 ], [ 3 ], [ 4 ] ],
    expected: [
      uf.elements[0],
      uf.elements[1],
      uf.elements[2],
      uf.elements[3],
      uf.elements[4]
    ]
  });
});

module( 'UnionFind.allocate' );

test( 'basic', function() {
  var i, count, uf = Bump.UnionFind.create();
  strictEqual( uf.getNumElements(), 0, 'starts with zero elements' );

  uf.allocate( 4 );
  strictEqual( uf.getNumElements(), 4, 'allocates 4 elements' );

  var refs = [];
  count = 0;
  for ( i = 0; i < 4; ++i ) {
    refs.push( uf.getElement( i ) );
    if ( uf.getElement( i ) instanceof Bump.Element.prototype.constructor ) {
      ++count;
    }
  }
  strictEqual( count, 4, 'initializes elements' );

  uf.allocate( 8 );
  for ( i = 0; i < refs.length; ++i ) {
    strictEqual( uf.getElement( i ), refs[ i ], 'keeps references' );
  }

  count = 0;
  for ( i = refs.length; i < uf.getNumElements(); ++i ) {
    if ( uf.getElement( i ) instanceof Bump.Element.prototype.constructor ) {
      ++count;
    }
  }
  strictEqual( count, 4, 'initializes new elements at end' );

  uf.allocate( 4 );
  strictEqual( uf.getNumElements(), 4, 'back down to 4 elements' );

  for ( i = 0; i < refs.length; ++i ) {
    strictEqual( uf.getElement( i ), refs[ i ], 'keeps references' );
  }
});

module( 'UnionFind.Free' );

test( 'test skipped', function() {
  expect( 0 );
});

module( 'UnionFind.find' );

test( 'one arg - test skipped', function() {
  expect( 0 );
});

test( 'two args - test skipped', function() {
  expect( 0 );
});

module( 'UnionFind.unite' );

test( 'test skipped', function() {
  expect( 0 );
});
