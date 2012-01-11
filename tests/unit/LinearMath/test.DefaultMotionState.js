module( 'DefaultMotionState' );

test( 'creation', function() {
  var transA = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle(
          Bump.Vector3.create( 1, 1, 1 ), Math.PI / 4
        ),
        Bump.Vector3.create( 3, 2, 1 )
      ),
      transB = Bump.Transform.create(
        Bump.Quaternion.createWithAxisAngle(
          Bump.Vector3.create( 3, 2, 1 ), -Math.PI / 3
        ),
        Bump.Vector3.create( -1, -1, -1 )
      ),

      ms = [
        Bump.DefaultMotionState.create(),
        Bump.DefaultMotionState.create( transA ),
        Bump.DefaultMotionState.create( transB, transA )
      ];

  deepEqual( ms[0].graphicsWorldTrans, Bump.Transform.getIdentity() );
  deepEqual( ms[0].centerOfMassOffset, Bump.Transform.getIdentity() );
  deepEqual( ms[0].startWorldTrans, Bump.Transform.getIdentity() );
  deepEqual( ms[0].userPointer, null );

  deepEqual( ms[1].graphicsWorldTrans, transA );
  deepEqual( ms[1].centerOfMassOffset, Bump.Transform.getIdentity() );
  deepEqual( ms[1].startWorldTrans, transA );
  deepEqual( ms[1].userPointer, null );

  deepEqual( ms[2].graphicsWorldTrans, transB );
  deepEqual( ms[2].centerOfMassOffset, transA );
  deepEqual( ms[2].startWorldTrans, transB );
  deepEqual( ms[2].userPointer, null );
});

test( 'clone', function() {
  var ms = Bump.DefaultMotionState.create();
  var clone = ms.clone();

  deepEqual( ms, clone, 'clones objects' );
  notStrictEqual( ms.graphicsWorldTrans, clone.graphicsWorldTrans, 'deep copies graphics world transform' );
  notStrictEqual( ms.centerOfMassOffset, clone.centerOfMassOffset, 'deep copies center of mass transform' );
  notStrictEqual( ms.startWorldTrans, clone.startWorldTrans, 'deep copies start world transform' );
  strictEqual( ms.userPointer, clone.userPointer, 'copies user data pointer' );
  notStrictEqual( ms, clone, 'not same object' );
});

module( 'DefaultMotionState.getWorldTransform' );

test( 'basic', function() {
  var ms = Bump.DefaultMotionState.create();

  testFunc( Bump.DefaultMotionState, 'getWorldTransform', {
    objects: ms,
    args: [
      [ { param: Bump.Transform.getIdentity(), expected: Bump.Transform.getIdentity() } ]
    ],
    expected: [ ms.clone() ]
  });
});

module( 'DefaultMotionState.setWorldPosition' );

test( 'basic', function() {
  var ms = Bump.DefaultMotionState.create();

  testFunc( Bump.DefaultMotionState, 'setWorldPosition', {
    objects: ms,
    args: [
      [ Bump.Transform.getIdentity() ]
    ],
    expected: [ ms.clone() ]
  });
});
