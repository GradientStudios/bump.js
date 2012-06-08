module( 'BroadphaseRayCallback.create' );

test( 'basic', function() {
  ok( Bump.BroadphaseRayCallback, 'BroadphaseRayCallback exists' );
  var brc = Bump.BroadphaseRayCallback.create();

  ok( brc, 'creates an object' );
  ok( brc instanceof Bump.BroadphaseRayCallback.prototype.constructor );
});

test( 'correct types', function() {
  var brc = Bump.BroadphaseRayCallback.create(),
      checks = [
        [ 'rayDirectionInverse', Bump.Vector3 ],
        [ 'signs', 'array' ],
        [ 'lambda_max', 'number' ]
      ];

  checkTypes( brc, checks );
});
