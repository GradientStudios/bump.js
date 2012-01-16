
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

} );

test( 'correct types', function() {
  var dp = Bump.DbvtProxy.create(
    Bump.Vector3.create(),
    Bump.Vector3.create(),
    { name: 'collison object' },
    0,
    0
  );

  var checks = [
    [ 'm_clientObject', 'object' ],
    [ 'm_collisionFilterGroup', 'number' ],
    [ 'm_collisionFilterMask', 'number' ],
    [ 'm_multiSapParentProxy', null ],
    [ 'm_uniqueId', 'number' ],
    [ 'm_aabbMin', Bump.Vector3 ],
    [ 'm_aabbMax', Bump.Vector3 ],

    [ 'leaf', null ],
    [ 'links', 'array' ],
    [ 'stage', 'number' ]
  ];

  checkTypes( dp, checks );
});


module( 'DbvtBroadphase' );

test( 'skipped', function() {

});