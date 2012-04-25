(function( window, Bump ) {

  Bump.IndexedMesh = Bump.type({
    init: function IndexedMesh() {
      // Initializer list
      this.indexType = Bump.PHY_ScalarType.PHY_INTEGER;
      this.vertexType = Bump.PHY_ScalarType.PHY_DOUBLE;
      // End initializer list

      // Default initializers
      this.numTriangles = 0;
      this.triangleIndexBase = null;
      this.triangleIndexStride = 0;
      this.numVertices = 0;
      this.vertexBase = null;
      this.vertexStride = 0;
      // End default initializers
    }
  });

  Bump.TriangleIndexVertexArray = Bump.type({
    parent: Bump.StridingMeshInterface,

    init: function TriangleIndexVertexArray() {
      this._super();

      // Initializer list
      this.hasAabb = false;
      // End initializer list

      // Default initializers
      this.indexedMeshes = [];
      this.aabbMin = Bump.Vector3.create();
      this.aabbMax = Bump.Vector3.create();
      // End default initializers
    },

    members: {

    }

  });

})( this, this.Bump );
