var manifoldPointTypes = [
  [ 'localPointA',      Bump.Vector3 ],
  [ 'localPointB',      Bump.Vector3 ],
  [ 'positionWorldOnB', Bump.Vector3 ],
  [ 'positionWorldOnA', Bump.Vector3 ],
  [ 'normalWorldOnB',   Bump.Vector3 ],

  [ 'lateralFrictionDir1', Bump.Vector3 ],
  [ 'lateralFrictionDir2', Bump.Vector3 ],

  [ 'distance1',                  'number'  ],
  [ 'combinedFriction',           'number'  ],
  [ 'combinedRestitution',        'number'  ],
  [ 'partId0',                    'number'  ],
  [ 'partId1',                    'number'  ],
  [ 'index0',                     'number'  ],
  [ 'index1',                     'number'  ],
  [ 'userPersistentData',         null      ],
  [ 'appliedImpulse',             'number'  ],
  [ 'lateralFrictionInitialized', 'boolean' ],
  [ 'appliedImpulseLateral1',     'number'  ],
  [ 'appliedImpulseLateral2',     'number'  ],
  [ 'contactMotion1',             'number'  ],
  [ 'contactMotion2',             'number'  ],
  [ 'contactCFM1',                'number'  ],
  [ 'contactCFM2',                'number'  ],
  [ 'lifeTime',                   'number'  ],
  [ 'constraintRow',              'array'   ]
];

var ManifoldPointDeepCopyCheck = function( a, b ) {
  notStrictEqual( a.localPointA, b.localPointA );
  notStrictEqual( a.localPointB, b.localPointB );
  notStrictEqual( a.positionWorldOnB, b.positionWorldOnB );
  notStrictEqual( a.positionWorldOnA, b.positionWorldOnA );
  notStrictEqual( a.normalWorldOnB, b.normalWorldOnB );

  strictEqual( a.userPersistentData, b.userPersistentData );
  notStrictEqual( a.constraintRow[0], b.constraintRow[0] );
  notStrictEqual( a.constraintRow[1], b.constraintRow[1] );
  notStrictEqual( a.constraintRow[2], b.constraintRow[2] );
};

module( 'ManifoldPoint.create' );

test( 'no args', function() {
  var mp = Bump.ManifoldPoint.create();

  ok( mp instanceof Bump.ManifoldPoint.prototype.constructor, 'correct type' );
  checkTypes( mp, manifoldPointTypes );
});

test( 'with args', function() {
  var mp = Bump.ManifoldPoint.create(
    Bump.Vector3.create(),
    Bump.Vector3.create(),
    Bump.Vector3.create(),
    42
  );

  ok( mp instanceof Bump.ManifoldPoint.prototype.constructor, 'correct type' );
  checkTypes( mp, manifoldPointTypes );

  equal( mp.getDistance(), 42 );
});

module( 'ManifoldPoint.clone' );

test( 'basic', function() {
  var mp = Bump.ManifoldPoint.create(
        Bump.Vector3.create( 1, 2, 3 ),
        Bump.Vector3.create( 3, 2, 1 ),
        Bump.Vector3.create( 4, 4, 4 ),
        42
      ),
      clone = mp.clone();

  deepEqual( mp, clone, 'clone works' );
  ManifoldPointDeepCopyCheck( mp, clone );
});

module( 'ManifoldPoint.assign' );

test( 'basic', function() {
  var mp = Bump.ManifoldPoint.create(
        Bump.Vector3.create( 1, 2, 3 ),
        Bump.Vector3.create( 3, 2, 1 ),
        Bump.Vector3.create( 4, 4, 4 ),
        42
      ),
      other = Bump.ManifoldPoint.create();

  notDeepEqual( mp, other );

  other.assign( mp );
  deepEqual( mp, other );

  ManifoldPointDeepCopyCheck( mp, other );
});
