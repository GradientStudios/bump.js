module( 'ActionInterface' );

test( 'abstract methods', function() {
  var ai = Bump.ActionInterface.create();

  ok( ai instanceof Bump.ActionInterface.prototype.constructor, 'correct type' );

  strictEqual( ai.updateAction, Bump.abstract, 'updateAction is abstract' );
  strictEqual( ai.debugDraw, Bump.abstract, 'debugDraw is abstract' );
});
