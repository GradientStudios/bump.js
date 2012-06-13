// load: bump.js

(function( window, Bump ) {

  Bump.TriangleCallback = Bump.type({
    init: function TriangleCallback() {},
    members: {
      destruct: Bump.noop,
      processTriangle: Bump.abstract
    }
  });

  Bump.InternalTriangleIndexCallback = Bump.type({
    init: function InternalTriangleIndexCallback() {},
    members: {
      destruct: Bump.noop,
      internalProcessTriangleIndex: Bump.abstract
    }
  });

})( this, this.Bump );
