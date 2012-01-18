var ManifoldResultTypes = [
  [ 'manifoldPtr', null ],

  [ 'rootTransA', Bump.Transform ],
  [ 'rootTransB', Bump.Transform ],

  [ 'body0', null ],
  [ 'body1', null ],

  [ 'partId0', 'number' ],
  [ 'partId1', 'number' ],
  [ 'index0',  'number' ],
  [ 'index1',  'number' ]
];

var ManifoldResultDeepCopyCheck = function( a, b ) {
  strictEqual( a.manifoldPtr, b.manifoldPtr );
  notStrictEqual( a.rootTransA, b.rootTransA );
  notStrictEqual( a.rootTransB, b.rootTransB );
  strictEqual( a.body0, b.body0 );
  strictEqual( a.body1, b.body1 );
};

module( 'ManifoldResult.create' );

test( 'no args', function() {
  var mr = Bump.ManifoldResult.create();

  ok( mr instanceof Bump.ManifoldResult.prototype.constructor, 'correct type' );
  checkTypes( mr, ManifoldResultTypes );
});

test( 'with args', function() {
  var objA = Bump.CollisionObject.create(),
      objB = Bump.CollisionObject.create(),
      mr = Bump.ManifoldResult.create( objA, objB );

  ok( mr instanceof Bump.ManifoldResult.prototype.constructor, 'correct type' );
  checkTypes( mr, ManifoldResultTypes );

  strictEqual( mr.body0, objA );
  strictEqual( mr.body1, objB );
});

module( 'ManifoldResult.clone' );

test( 'basic', function() {
  var objA = Bump.CollisionObject.create(),
      objB = Bump.CollisionObject.create(),
      mr = Bump.ManifoldResult.create( objA, objB ),
      clone = mr.clone();

  notStrictEqual( mr, clone );
  deepEqual( mr, clone );

  ManifoldResultDeepCopyCheck( mr, clone );
});

module( 'ManifoldResult.assign' );

test( 'basic', function() {
  var objA = Bump.CollisionObject.create(),
      objB = Bump.CollisionObject.create(),
      mr = Bump.ManifoldResult.create( objA, objB ),
      other = Bump.ManifoldResult.create();

  notDeepEqual( mr, other );
  other.assign( mr );
  notStrictEqual( mr, other );
  deepEqual( mr, other );

  ManifoldResultDeepCopyCheck( mr, other );
});
