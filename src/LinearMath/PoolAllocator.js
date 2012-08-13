// load: bump.js

// PoolAllocator is a very simple memory pool implementation that roughly
// follows the interface for `btPoolAllocator`. The main differences lie
// in the constructor, where the Bump Type is provided instead of the
// size of the element, and in the allocate function, where the entire
// arguments list is passed on to the constructor.
//
// PoolAllocator requires that the provided Type has allocate implemented,
// which can initialize an existing object as it would be if it had be
// create'd.

(function( window, Bump ) {
  Bump.PoolAllocator = Bump.type({
    init: function PoolAllocator( Type, maxElements ) {
      if ( typeof Type.prototype.allocate !== 'function' ) {
        throw new Error( 'PoolAllocator expects `allocate` function to function properly' );
      }

      // Initializer list
      this.Type = Type;
      this.maxElements = maxElements;
      // End initializer list

      this.pool = [];
      this.freeCount = this.maxElements;
    },

    members: {
      destruct: Bump.noop,

      getFreeCount: function() {
        return this.freeCount;
      },

      getUsedCount: function() {
        return this.maxElements - this.freeCount;
      },

      allocate: function() {
        Bump.Assert( this.freeCount > 0 );
        --this.freeCount;

        var obj = this.pool.pop();
        return obj ?
          this.Type.prototype.allocate.apply( obj, arguments ) :
          this.Type.create.apply( undefined, arguments );
      },

      freeMemory: function( ptr ) {
        ++this.freeCount;
        this.pool.push( ptr );
      },

      // These methods don't mean anything anymore.
      validPtr: Bump.notImplemented,
      getElementSize: Bump.notImplemented,
      getPoolAddress: Bump.notImplemented
    }

  });
}( this, this.Bump ));
