module( 'DbvtProxy.create' );

test( 'basic', function() {
  ok( Bump.DbvtProxy, 'DbvtProxy exists' );

  var dp = Bump.DbvtProxy.create(
    Bump.Vector3.create(),
    Bump.Vector3.create(),
    { name: 'collison object' },
    0,
    0
  );

  ok( dp, 'creates an object' );
  ok( dp instanceof Bump.DbvtProxy.prototype.constructor );

});

test( 'correct types', function() {
  var dp = Bump.DbvtProxy.create(
    Bump.Vector3.create(),
    Bump.Vector3.create(),
    { name: 'collison object' },
    0,
    0
  );

  var checks = [
    [ 'clientObject', 'object' ],
    [ 'collisionFilterGroup', 'number' ],
    [ 'collisionFilterMask', 'number' ],
    [ 'multiSapParentProxy', null ],
    [ 'uniqueId', 'number' ],
    [ 'aabbMin', Bump.Vector3 ],
    [ 'aabbMax', Bump.Vector3 ],

    [ 'leaf', null ],
    [ 'links', 'array' ],
    [ 'stage', 'number' ]
  ];

  checkTypes( dp, checks );
});

module( 'DbvtBroadphase' );

test( 'skipped', function() {});
