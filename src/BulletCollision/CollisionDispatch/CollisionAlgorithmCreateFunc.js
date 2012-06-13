// load: bump.js

(function( window, Bump ) {

  Bump.CollisionAlgorithmCreateFunc = Bump.type({
    init: function CollisionAlgorithmCreateFunc() {
      this.swapped = false;
    },

    members: {
      clone: function( dest ) {
        dest = dest || Bump.CollisionAlgorithmCreateFunc.create();
        dest.swapped = this.swapped;
        return dest;
      },

      assign: function( other ) {
        this.swapped = other.swapped;
        return this;
      },

      destruct: Bump.noop,

      CreateCollisionAlgorithm: function() {
        return null;
      }
    }
  });

})( this, this.Bump );
