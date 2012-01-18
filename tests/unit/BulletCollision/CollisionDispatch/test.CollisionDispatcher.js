var CollisionDispatcherTypes = [
  [ 'dispatcherFlags', 'number' ],
  [ 'manifoldsPtr', 'array' ],
  [ 'defaultManifoldResult', Bump.ManifoldResult ],
  [ 'nearCallback', null ],
  [ 'collisionAlgorithmPoolAllocator', null ],
  [ 'persistentManifoldPoolAllocator', null ],
  [ 'doubleDispatch', 'array' ],
  [ 'collisionConfiguration', null ]
];

var CollisionDispatcherDeepCopyCheck = function( a, b ) {
  var i, j;

  for ( i = 0; i < a.manifoldsPtr.length; ++i ) {
    strictEqual( a.manifoldsPtr[i], b.manifoldsPtr[i] );
  }
  notStrictEqual( a.defaultManifoldResult, b.defaultManifoldResult );
  strictEqual( a.collisionAlgorithmPoolAllocator, b.collisionAlgorithmPoolAllocator );
  strictEqual( a.persistentManifoldPoolAllocator, b.persistentManifoldPoolAllocator );

  var doubleDispatchCheck = true;
  for ( i = 0; i < a.doubleDispatch.length; ++i ) {
    for ( j = 0; j < a.doubleDispatch[i].length; ++j ) {
      var thisDispatchCorrect = a.doubleDispatch[i][j] === b.doubleDispatch[i][j];
      doubleDispatchCheck = doubleDispatchCheck && thisDispatchCorrect;

      if ( !thisDispatchCorrect ) {
        strictEqual( a.doubleDispatch[i][j], b.doubleDispatch[i][j], 'doubleDispatch[' + i + '][' + j + '] correct type' );
      }
    }
  }
  strictEqual( doubleDispatchCheck, true );

  strictEqual( a.collisionConfiguration, b.collisionConfiguration );
};

module( 'CollisionDispatcher.create' );

test( 'no args', function() {
  var cd = Bump.CollisionDispatcher.create();

  ok( cd instanceof Bump.CollisionDispatcher.prototype.constructor, 'correct type' );
  checkTypes( cd, CollisionDispatcherTypes );

  var i, j;
  for ( i = 0; i < cd.manifoldsPtr.length; ++i ) {
    ok( cd.manifoldsPtr[i] instanceof Bump.ManifoldResult.prototype.constructor, 'manifoldsPtr[' + i + ']' );
  }

  var doubleDispatchCheck = true;
  for ( i = 0; i < cd.doubleDispatch.length; ++i ) {
    for ( j = 0; j < cd.doubleDispatch[i].length; ++j ) {
      var thisDispatchCorrect = typeof cd.doubleDispatch[i][j] === 'object';
      doubleDispatchCheck = doubleDispatchCheck && thisDispatchCorrect;

      if ( !thisDispatchCorrect ) {
        strictEqual( typeof cd.doubleDispatch[i][j], 'object', 'doubleDispatch[' + i + '][' + j + '] correct type' );
      }
    }
  }

  strictEqual( doubleDispatchCheck, true, 'doubleDispatch correct type' );
});

test( 'with config - test skipped', function() {});

module( 'CollisionDispatcher.clone' );

test( 'basic', function() {
  var cd = Bump.CollisionDispatcher.create();
  var clone = cd.clone();

  deepEqual( cd, clone );
  CollisionDispatcherDeepCopyCheck( cd, clone );
});

module( 'CollisionDispatcher.assign' );

test( 'test skipped', function() {});
