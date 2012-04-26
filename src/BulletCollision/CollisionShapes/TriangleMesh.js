(function( window, Bump ) {
  var tmpV1 = Bump.Vector3.create();
  var tmpV2 = Bump.Vector3.create();

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
      this._4componentVertices = Bump.Vector3Array.create();
      this._3componentVertices = []; // float
      this._32bitIndices = Bump.UnsignedIntArray.create();
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
      addTriangle: function( vertex0, vertex1, vertex2, removeDuplicateVertices ) {
        ++this.indexedMeshes[0].numTriangles;
        this.addIndex( this.findOrAddVertex( vertex0, removeDuplicateVertices ) );
        this.addIndex( this.findOrAddVertex( vertex1, removeDuplicateVertices ) );
        this.addIndex( this.findOrAddVertex( vertex2, removeDuplicateVertices ) );
      },

      getNumTriangles: function() {
        if ( this.use32bitIndices ) {
          return ~~( this._32bitIndices.length / 3 );
        }
        return ~~( this._16bitIndices.length / 3 );
      },

      preallocateVertices: Bump.noop,
      preallocateIndices: Bump.noop,

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      findOrAddVertex: function( vertex, removeDuplicateVertices ) {
        var m_weldingThreshold = this.weldingThreshold;

        // return index of new/existing vertex
        // @todo: could use acceleration structure for this

        var i, vec;
        if ( this.use4componentVertices ) {
          var m_4componentVertices = this._4componentVertices;

          if ( removeDuplicateVertices ) {
            for ( i = 0; i < m_4componentVertices.length; ++i ) {
              vec = tmpV1.assign( m_4componentVertices.at(i) );
              if ( vec.subtract( vertex, tmpV1 ).length2() <= m_weldingThreshold ) {
                return i;
              }
            }
          }
          ++this.indexedMeshes[0].numVertices;
          m_4componentVertices.push( vertex );
          this.indexedMeshes[0].vertexBase = m_4componentVertices.pointerAt(0);

          return m_4componentVertices.length - 1;
        }

        else {
          var m_3componentVertices = this._3componentVertices;
          if ( removeDuplicateVertices ) {
            for ( i = 0; i < m_3componentVertices.length; i += 3 ) {
              var vtx = tmpV1.setValue(
                m_3componentVertices[ i     ],
                m_3componentVertices[ i + 1 ],
                m_3componentVertices[ i + 2 ]
              );

              if ( vtx.subtract( vertex, tmpV2 ).length2() <= m_weldingThreshold ) {
                return ~~( i / 3 );
              }
            }
          }

          m_3componentVertices.push( vertex.x );
          m_3componentVertices.push( vertex.y );
          m_3componentVertices.push( vertex.z );
          ++this.indexedMeshes[0].numVertices;
          this.indexedMeshes[0].vertexBase = m_3componentVertices;
          return ~~( m_3componentVertices.length / 3 ) - 1;
        }

      },

      addIndex: function( index ) {
        if ( this.use32bitIndices ) {
          this._32bitIndices.push( index );
          this.indexedMeshes[0].triangleIndexBase = this._32bitIndices.pointerAt(0);
        } else {
          this._16bitIndices.push_back(index);
          this.indexedMeshes[0].triangleIndexBase = this._16bitIndices;
        }
      }

    }

  });

})( this, this.Bump );
