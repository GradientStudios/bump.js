var persistentManifoldTypes = [
  [ 'objectType',   'number' ],
  [ 'pointCache',   'array'  ],
  [ 'body0',        null     ],
  [ 'body1',        null     ],
  [ 'cachedPoints', 'number' ],

  [ 'contactBreakingThreshold',   'number' ],
  [ 'contactProcessingThreshold', 'number' ],

  [ 'companionIdA', 'number' ],
  [ 'companionIdB', 'number' ],
  [ 'index1a',      'number' ]
];

var PersistentManifoldDeepCopyCheck = function( a, b ) {
  strictEqual( a.body0, b.body0 );
  strictEqual( a.body1, b.body1 );
};

module( 'PersistentManifold.create' );

test( 'no args', function() {
  var pm = Bump.PersistentManifold.create();

  ok( pm instanceof Bump.PersistentManifold.prototype.constructor, 'correct type' );
  checkTypes( pm, persistentManifoldTypes );
});

test( 'with args', function() {
  var body0 = Bump.RigidBody.create( 1, null, null ),
      body1 = Bump.RigidBody.create( 1, null, null ),
      pm = Bump.PersistentManifold.create( body0, body1, 0, 0.02, 0.02 );

  ok( pm instanceof Bump.PersistentManifold.prototype.constructor, 'correct types' );
  checkTypes( pm, persistentManifoldTypes );

  strictEqual( pm.body0, body0 );
  strictEqual( pm.body1, body1 );
});

module( 'PersistentManifold.clone' );

test( 'basic', function() {
  var body0 = Bump.RigidBody.create( 1, null, null ),
      body1 = Bump.RigidBody.create( 1, null, null ),
      pm = Bump.PersistentManifold.create( body0, body1, 0, 0.02, 0.02 ),
      clone = pm.clone();

  deepEqual( pm, clone );
  PersistentManifoldDeepCopyCheck( pm, clone );
});

module( 'PersistentManifold.assign' );

test( 'basic', function() {
  var body0 = Bump.RigidBody.create( 1, null, null ),
      body1 = Bump.RigidBody.create( 1, null, null ),
      pm = Bump.PersistentManifold.create( body0, body1, 0, 0.02, 0.02 ),
      other = Bump.PersistentManifold.create();

  notDeepEqual( pm, other );
  other.assign( pm );
  deepEqual( pm, other );
  PersistentManifoldDeepCopyCheck( pm, other );
});

module( 'PersistentManifold.getBody0' );

test( 'basic', function() {
  var body0 = Bump.RigidBody.create( 1, null, null ),
      body1 = Bump.RigidBody.create( 1, null, null ),
      pm = Bump.PersistentManifold.create( body0, body1, 0, 0.02, 0.02 );

  testFunc( Bump.PersistentManifold, 'getBody0', {
    objects: pm,
    expected: [ body0 ]
  });
});

module( 'PersistentManifold.getBody1' );

test( 'basic', function() {
  var body0 = Bump.RigidBody.create( 1, null, null ),
      body1 = Bump.RigidBody.create( 1, null, null ),
      pm = Bump.PersistentManifold.create( body0, body1, 0, 0.02, 0.02 );

  testFunc( Bump.PersistentManifold, 'getBody1', {
    objects: pm,
    expected: [ body1 ]
  });
});

module( 'PersistentManifold.sortCachedPoints' );

test( 'test skipped', function() {});
