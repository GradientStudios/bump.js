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

module( 'PersistentManifold.setBodies' );

test( 'test skipped', function() {});

module( 'PersistentManifold.clearUserCache' );

test( 'test skipped', function() {});

module( 'PersistentManifold.getNumContacts' );

test( 'basic', function() {
  var pm = Bump.PersistentManifold.create();

  strictEqual( typeof pm.getNumContacts(), 'number' );
});

module( 'PersistentManifold.getContactPoint' );

test( 'basic', function() {
  var body0 = Bump.RigidBody.create( 1, null, null ),
      body1 = Bump.RigidBody.create( 1, null, null ),
      pm = Bump.PersistentManifold.create( body0, body1, 0, 0.02, 0.02 ),
      mp = Bump.ManifoldPoint.create();

  pm.addManifoldPoint( mp );
  deepEqual( pm.getContactPoint( 0 ), mp );
  strictEqual( pm.getContactPoint( 0 ), pm.pointCache[0] );
});

module( 'PersistentManifold.getContactBreakingThreshold' );

test( 'basic', function() {
  var body0 = Bump.RigidBody.create( 1, null, null ),
      body1 = Bump.RigidBody.create( 1, null, null ),
      pm = Bump.PersistentManifold.create( body0, body1, 0, 0.01, 0.03 );

  strictEqual( pm.getContactBreakingThreshold(), 0.01 );
});

module( 'PersistentManifold.getContactProcessingThreshold' );

test( 'basic', function() {
  var body0 = Bump.RigidBody.create( 1, null, null ),
      body1 = Bump.RigidBody.create( 1, null, null ),
      pm = Bump.PersistentManifold.create( body0, body1, 0, 0.01, 0.03 );

  strictEqual( pm.getContactProcessingThreshold(), 0.03 );
});

module( 'PersistentManifold.getCacheEntry' );

test( 'test skipped', function() {});

module( 'PersistentManifold.addManifoldPoint' );

test( 'test skipped', function() {});

module( 'PersistentManifold.removeContact' );

test( 'test skipped', function() {});

module( 'PersistentManifold.replaceContactPoint' );

test( 'test skipped', function() {});

module( 'PersistentManifold.validContactDistance' );

test( 'test skipped', function() {});

module( 'PersistentManifold.refreshContactPoints' );

test( 'test skipped', function() {});

module( 'PersistentManifold.clearManifold' );

test( 'test skipped', function() {});

module( 'PersistentManifold.sortCachedPoints' );

test( 'test skipped', function() {});

module( 'PersistentManifold manifold cache manipulation' );

test( 'basic', function() {
  var body0 = Bump.RigidBody.create( 1, null, null ),
      body1 = Bump.RigidBody.create( 1, null, null ),
      pm = Bump.PersistentManifold.create( body0, body1, 0, 0.02, 0.02 ),
      clone = pm.clone();

  var i, length = pm.pointCache.length, refs = [];
  for ( i = 0; i < length; ++i ) {
    refs.push( pm.pointCache[i] );
  }

  pm.addManifoldPoint( Bump.ManifoldPoint.create() );
  strictEqual( pm.getNumContacts(), 1 );
  pm.addManifoldPoint( Bump.ManifoldPoint.create() );
  strictEqual( pm.getNumContacts(), 2 );
  pm.addManifoldPoint( Bump.ManifoldPoint.create() );
  strictEqual( pm.getNumContacts(), 3 );
  pm.addManifoldPoint( Bump.ManifoldPoint.create() );
  strictEqual( pm.getNumContacts(), 4 );
  pm.addManifoldPoint( Bump.ManifoldPoint.create() );
  strictEqual( pm.getNumContacts(), 4 );

  strictEqual( pm.pointCache.length, length, 'point cache remains the same length' );
  for ( i = 0; i < pm.pointCache.length; ++i ) {
    strictEqual( pm.pointCache[i], refs[i], 'reference ' + i + ' stays the same after adding points' );
  }

  pm.removeContactPoint( 2 );
  strictEqual( pm.getNumContacts(), 3 );
  pm.removeContactPoint( 2 );
  strictEqual( pm.getNumContacts(), 2 );
  pm.removeContactPoint( 2 );
  strictEqual( pm.getNumContacts(), 1 );
  pm.clearManifold();
  strictEqual( pm.getNumContacts(), 0 );

  strictEqual( pm.pointCache.length, length, 'point cache remains the same length' );
  for ( i = 0; i < pm.pointCache.length; ++i ) {
    strictEqual( pm.pointCache[i], refs[i], 'reference ' + i + ' stays the same after removing points' );
  }

  deepEqual( pm, clone );
  PersistentManifoldDeepCopyCheck( pm, clone );
});
