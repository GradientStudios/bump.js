module( 'CollisionObject.create' );

test( 'basic', function() {
  ok( Bump.CollisionObject, 'CollisionObject exists' );

  if ( Bump.CollisionObject ) {
    var co = Bump.CollisionObject.create();
    ok( co, 'creates an object' );
  } else {
    ok( true, 'test skipped' );
  }
});

module( 'CollisionObject enums' );

test( 'enums', function() {
  equal( Bump.CollisionObject.CollisionFlags.CF_STATIC_OBJECT,                    1 << 0, 'CF_STATIC_OBJECT'                    );
  equal( Bump.CollisionObject.CollisionFlags.CF_KINEMATIC_OBJECT,                 1 << 1, 'CF_KINEMATIC_OBJECT'                 );
  equal( Bump.CollisionObject.CollisionFlags.CF_NO_CONTACT_RESPONSE,              1 << 2, 'CF_NO_CONTACT_RESPONSE'              );
  equal( Bump.CollisionObject.CollisionFlags.CF_CUSTOM_MATERIAL_CALLBACK,         1 << 3, 'CF_CUSTOM_MATERIAL_CALLBACK'         );
  equal( Bump.CollisionObject.CollisionFlags.CF_CHARACTER_OBJECT,                 1 << 4, 'CF_CHARACTER_OBJECT'                 );
  equal( Bump.CollisionObject.CollisionFlags.CF_DISABLE_VISUALIZE_OBJECT,         1 << 5, 'CF_DISABLE_VISUALIZE_OBJECT'         );
  equal( Bump.CollisionObject.CollisionFlags.CF_DISABLE_SPU_COLLISION_PROCESSING, 1 << 6, 'CF_DISABLE_SPU_COLLISION_PROCESSING' );

  equal( Bump.CollisionObject.CollisionObjectTypes.CO_COLLISION_OBJECT, 1 << 0, 'CO_COLLISION_OBJECT' );
  equal( Bump.CollisionObject.CollisionObjectTypes.CO_RIGID_BODY,       1 << 1, 'CO_RIGID_BODY'       );
  equal( Bump.CollisionObject.CollisionObjectTypes.CO_GHOST_OBJECT,     1 << 2, 'CO_GHOST_OBJECT'     );
  equal( Bump.CollisionObject.CollisionObjectTypes.CO_SOFT_BODY,        1 << 3, 'CO_SOFT_BODY'        );
  equal( Bump.CollisionObject.CollisionObjectTypes.CO_HF_FLUID,         1 << 4, 'CO_HF_FLUID'         );
  equal( Bump.CollisionObject.CollisionObjectTypes.CO_USER_TYPE,        1 << 5, 'CO_USER_TYPE'        );
});

module( 'CollisionObject.clone' );

var CollisionObjectDeepCopyCheck = function( a, b ) {
  notStrictEqual( a.worldTransform, b.worldTransform );
  notStrictEqual( a.interpolationWorldTransform, b.interpolationWorldTransform );
  notStrictEqual( a.interpolationLinearVelocity, b.interpolationLinearVelocity );
  notStrictEqual( a.interpolationAngularVelocity, b.interpolationAngularVelocity );
  notStrictEqual( a.anisotropicFriction, b.anisotropicFriction );
};

test( 'basic', function() {
  var a = Bump.CollisionObject.create();
  var b = a.clone();

  deepEqual( a, b );
  notStrictEqual( a, b );
  CollisionObjectDeepCopyCheck( a, b );
});
