(function( window, Bump ) {

  Bump.TriangleMesh = Bump.type({
    parent: Bump.TriangleIndexVertexArray,

    init: function TriangleMesh( use32bitIndices, use4componentVertices ) {
      if ( arguments.length < 2 ) {
        use4componentVertices = true;
      }

      if ( arguments.length < 1 ) {
        use32bitIndices = true;
      }

      this._super();

      // Initializer list
      this.use32bitIndices = use32bitIndices;
      this.use4componentVertices = use4componentVertices;
      this.weldingThreshold = 0;
      // End initializer list

      // Default initializers
      this._4componentVertices = []; // btVector3
      this._3componentVertices = []; // float
      this._32bitIndices = [];       // unsigned int
      this._16bitIndices = [];       // unsigned short
      // End default initializers

      var m_indexedMeshes = this.indexedMeshes;

      var meshIndex = Bump.IndexedMesh.create();
      meshIndex.numTriangles = 0;
      meshIndex.numVertices = 0;
      meshIndex.indexType = Bump.PHY_ScalarType.PHY_INTEGER;
      meshIndex.triangleIndexBase = null;
      // meshIndex.triangleIndexStride = 3 * sizeof( int );
      meshIndex.triangleIndexStride = 3;
      meshIndex.vertexBase = 0;
      // meshIndex.vertexStride = sizeof( btVector3 );
      meshIndex.vertexStride = 4;
      m_indexedMeshes.push( meshIndex );

      var m_indexedMeshes0 = m_indexedMeshes[0];
      if ( this.use32bitIndices ) {
        m_indexedMeshes0.numTriangles = ~~( this._32bitIndices.length / 3 );
        m_indexedMeshes0.triangleIndexBase = null;
        m_indexedMeshes0.indexType = Bump.PHY_ScalarType.PHY_INTEGER;
        // m_indexedMeshes0.triangleIndexStride = 3 * sizeof( int );
        m_indexedMeshes0.triangleIndexStride = 3;
      } else {
        m_indexedMeshes0.numTriangles = ~~( this._16bitIndices.length / 3 );
        m_indexedMeshes0.triangleIndexBase = null;
        m_indexedMeshes0.indexType = Bump.PHY_ScalarType.PHY_SHORT;
        // m_indexedMeshes0.triangleIndexStride = 3 * sizeof( short int );
        m_indexedMeshes0.triangleIndexStride = 3;
      }

      if ( this.use4componentVertices ) {
        m_indexedMeshes0.numVertices = this._4componentVertices.length;
        m_indexedMeshes0.vertexBase = 0;
        // m_indexedMeshes0.vertexStride = sizeof( btVector3 );
        m_indexedMeshes0.vertexStride = 4;
      } else {
        m_indexedMeshes0.numVertices = ~~( this._3componentVertices.length / 3 );
        m_indexedMeshes0.vertexBase = 0;
        // m_indexedMeshes0.vertexStride = 3*sizeof( btScalar );
        m_indexedMeshes0.vertexStride = 3;
      }

    },

    members: {
    }

  });

})( this, this.Bump );
