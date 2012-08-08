module( 'PoolAllocator' );

test( 'basic', function() {
  strictEqual( Bump.isType( Bump.PoolAllocator ), true, 'PoolAllocator exists' );
});

module( 'PoolAllocator.create' );

test( 'basic', function() {
  var T = Bump.type({
    members: { allocate: function() { return this; } }
  });
  var o = Bump.PoolAllocator.create( T, 1 );

  strictEqual( o instanceof Bump.PoolAllocator.prototype.constructor, true, 'creates proper object' );
});

test( 'proper Type', function() {
  raises(function() {
    var o = Bump.PoolAllocator.create( Bump.Vector3, 1 );
  }, function( e ) {
    return e instanceof Error && /\ballocate\b/.test( e.message );
  }, 'throws if Type has no allocate function' );
});

module( 'PoolAllocator.allocate' );

test( 'basic', function() {
  var T = Bump.type({
    init: function() { this.args = [].slice.call( arguments, 0 ); },
    members: { allocate: function() { this.args = [].slice.call( arguments, 0 ); return this; } }
  });
  var pool = Bump.PoolAllocator.create( T, 2 );

  var o0, o1;

  o0 = pool.allocate();
  var arr = o0.args;
  deepEqual( o0.args, [], 'first instantiation with empty args' );
  pool.freeMemory( o0 );

  o0 = pool.allocate();
  notStrictEqual( o0.args, arr, 'reinitialization created new member' );
  deepEqual( o0.args, [], 'reinitialization with empty args' );

  var args = [ 'here', /r/, Math.sin, Math.random() ];
  o1 = pool.allocate.apply( pool, args );
  arr = o1.args;
  deepEqual( o1.args, args, 'first instantiation with args' );
  pool.freeMemory( o1 );

  o1 = pool.allocate.apply( pool, args );
  notStrictEqual( o1.args, arr, 'reinitialization created new member' );
  deepEqual( o1.args, args, 'reinitialization with args' );

  raises(function() {
    pool.allocate();
  }, function( e ) {
    return e instanceof Error;
  }, 'can not allocate beyond max capacity' );
});

module( 'PoolAllocator.getFreeCount' );

test( 'basic', function() {
  var T = Bump.type({
    members: { allocate: function() { return this; } }
  });
  var pool = Bump.PoolAllocator.create( T, 10 );

  strictEqual( pool.getFreeCount(), 10 );
  var o = pool.allocate();
  strictEqual( pool.getFreeCount(), 9 );
  pool.freeMemory( o );
  strictEqual( pool.getFreeCount(), 10 );
});

module( 'PoolAllocator.getUsedCount' );

test( 'basic', function() {
  var T = Bump.type({
    members: { allocate: function() { return this; } }
  });
  var pool = Bump.PoolAllocator.create( T, 10 );

  strictEqual( pool.getUsedCount(), 0 );
  var o = pool.allocate();
  strictEqual( pool.getUsedCount(), 1 );
  pool.freeMemory( o );
  strictEqual( pool.getUsedCount(), 0 );
});
