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
