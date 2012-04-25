(function( window, Bump ) {

  Bump.PHY_ScalarType = Bump.Enum([
    'PHY_FLOAT',
    'PHY_DOUBLE',
    'PHY_INTEGER',
    'PHY_SHORT',
    'PHY_FIXEDPOINT88',
    'PHY_UCHAR'
  ]);

  Bump.ConcaveShape = Bump.type({
    parent: Bump.CollisionShape,

    init: function ConcaveShape() {
      this._super();

      // Initializer list
      this.collisionMargin = 0;
      // End initializer list
    },

    members: {
      processAllTriangles: Bump.abstract,

      getMargin: function() {
        return this.collisionMargin;
      },

      setMargin: function( collisionMargin ) {
        this.collisionMargin = collisionMargin;
      }
    }

  });

})( this, this.Bump );
