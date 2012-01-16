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
