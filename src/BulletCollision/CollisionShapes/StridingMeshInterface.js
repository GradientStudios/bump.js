(function( window, Bump ) {

  Bump.StridingMeshInterface = Bump.type({
    init: function StridingMeshInterface() {
      this.scaling = Bump.Vector3.create( 1, 1, 1 );
      return this;
    },

    members: {
      destruct: Bump.noop,

      InternalProcessAllTriangles: function( callback, aabbMin, aabbMax ) {
        var numtotalphysicsverts = 0;
        var part;
        var graphicssubparts = this.getNumSubParts();
        var gfxindex;
        var triangle = [
          Bump.Vector3.create(),
          Bump.Vector3.create(),
          Bump.Vector3.create()
        ];

        var data = {
          vertexbase: null,     // vertexbase
          numVerts: 0,          // numverts
          type: 0,              // type
          vertexStride: 0,      // stride
          indexbase: null,      // indexbase
          indexStride: 0,       // indexstride
          numFaces: 0,          // numtriangles
          indicesType: 0        // gfxindextype
        };

        var meshScaling = this.getScaling();

        // If the number of parts is big, the performance might drop due to the
        // innerloop switch on indextype
        for ( part = 0; part < graphicssubparts; ++part ) {
          this.getLockedReadOnlyVertexIndexBase( data, part );
          numtotalphysicsverts += data.numFaces * 3; // upper bound

          // Unlikely that developers want to pass in double-precision meshes
          // in single-precision Bullet build, so disable this feature by
          // default. See patch http://code.google.com/p/bullet/issues/detail?id=213

          var graphicsbase = null;
          var tri_indices = null;
          switch ( data.type ) {
          case Bump.PHY_ScalarType.PHY_FLOAT:
            switch ( data.indicesType ) {
            case Bump.PHY_ScalarType.PHY_INTEGER:
              for ( gfxindex = 0; gfxindex < data.numFaces; ++gfxindex ) {
                throw new Error( 'INTEGER' );
                // unsigned int* tri_indices= (unsigned int*)(indexbase+gfxindex*indexstride);
                // graphicsbase = (float*)(vertexbase+tri_indices[0]*stride);
                // triangle[0].setValue(graphicsbase[0]*meshScaling.getX(),graphicsbase[1]*meshScaling.getY(),graphicsbase[2]*meshScaling.getZ());
                // graphicsbase = (float*)(vertexbase+tri_indices[1]*stride);
                // triangle[1].setValue(graphicsbase[0]*meshScaling.getX(),graphicsbase[1]*meshScaling.getY(),    graphicsbase[2]*meshScaling.getZ());
                // graphicsbase = (float*)(vertexbase+tri_indices[2]*stride);
                // triangle[2].setValue(graphicsbase[0]*meshScaling.getX(),graphicsbase[1]*meshScaling.getY(),    graphicsbase[2]*meshScaling.getZ());
                // callback->internalProcessTriangleIndex(triangle,part,gfxindex);
              }
              break;

            case Bump.PHY_ScalarType.PHY_SHORT:
              for ( gfxindex = 0; gfxindex < data.numFaces; ++gfxindex ) {
                throw new Error( 'SHORT' );
                // unsigned short int* tri_indices= (unsigned short int*)(indexbase+gfxindex*indexstride);
                // graphicsbase = (float*)(vertexbase+tri_indices[0]*stride);
                // triangle[0].setValue(graphicsbase[0]*meshScaling.getX(),graphicsbase[1]*meshScaling.getY(),graphicsbase[2]*meshScaling.getZ());
                // graphicsbase = (float*)(vertexbase+tri_indices[1]*stride);
                // triangle[1].setValue(graphicsbase[0]*meshScaling.getX(),graphicsbase[1]*meshScaling.getY(),    graphicsbase[2]*meshScaling.getZ());
                // graphicsbase = (float*)(vertexbase+tri_indices[2]*stride);
                // triangle[2].setValue(graphicsbase[0]*meshScaling.getX(),graphicsbase[1]*meshScaling.getY(),    graphicsbase[2]*meshScaling.getZ());
                // callback->internalProcessTriangleIndex(triangle,part,gfxindex);
              }
              break;

            case Bump.PHY_ScalarType.PHY_UCHAR:
              for ( gfxindex = 0; gfxindex < data.numFaces; ++gfxindex ) {
                throw new Error( 'UCHAR' );
                // unsigned char* tri_indices= (unsigned char*)(indexbase+gfxindex*indexstride);
                // graphicsbase = (float*)(vertexbase+tri_indices[0]*stride);
                // triangle[0].setValue(graphicsbase[0]*meshScaling.getX(),graphicsbase[1]*meshScaling.getY(),graphicsbase[2]*meshScaling.getZ());
                // graphicsbase = (float*)(vertexbase+tri_indices[1]*stride);
                // triangle[1].setValue(graphicsbase[0]*meshScaling.getX(),graphicsbase[1]*meshScaling.getY(),    graphicsbase[2]*meshScaling.getZ());
                // graphicsbase = (float*)(vertexbase+tri_indices[2]*stride);
                // triangle[2].setValue(graphicsbase[0]*meshScaling.getX(),graphicsbase[1]*meshScaling.getY(),    graphicsbase[2]*meshScaling.getZ());
                // callback->internalProcessTriangleIndex(triangle,part,gfxindex);
              }
              break;

            default:
              Bump.Assert( (data.indicesType === PHY_INTEGER) || (data.indicesType === PHY_SHORT) );
            }
            break;

          case Bump.PHY_ScalarType.PHY_DOUBLE:
            switch ( data.indicesType ) {
            case Bump.PHY_ScalarType.PHY_INTEGER:
              for ( gfxindex = 0; gfxindex < data.numFaces; ++gfxindex ) {
                tri_indices = new Uint32Array( data.indexbase.buffer, gfxindex * data.indexStride );
                graphicsbase = new Float64Array( data.vertexbase.buffer, tri_indices[0] * data.vertexStride );
                triangle[0].setValue( graphicsbase[0] * meshScaling.x, graphicsbase[1] * meshScaling.y, graphicsbase[2] * meshScaling.z );
                graphicsbase = new Float64Array( data.vertexbase.buffer, tri_indices[1] * data.vertexStride );
                triangle[1].setValue( graphicsbase[0] * meshScaling.x, graphicsbase[1] * meshScaling.y, graphicsbase[2] * meshScaling.z );
                graphicsbase = new Float64Array( data.vertexbase.buffer, tri_indices[2] * data.vertexStride );
                triangle[2].setValue( graphicsbase[0] * meshScaling.x, graphicsbase[1] * meshScaling.y, graphicsbase[2] * meshScaling.z );
                callback.internalProcessTriangleIndex( triangle, part, gfxindex );
              }
              break;

            case Bump.PHY_ScalarType.PHY_SHORT:
              for ( gfxindex = 0; gfxindex < data.numFaces; ++gfxindex ) {
                throw new Error( 'SHORT' );
                // unsigned short int* tri_indices= (unsigned short int*)(indexbase+gfxindex*indexstride);
                // graphicsbase = (double*)(vertexbase+tri_indices[0]*stride);
                // triangle[0].setValue((btScalar)graphicsbase[0]*meshScaling.getX(),(btScalar)graphicsbase[1]*meshScaling.getY(),(btScalar)graphicsbase[2]*meshScaling.getZ());
                // graphicsbase = (double*)(vertexbase+tri_indices[1]*stride);
                // triangle[1].setValue((btScalar)graphicsbase[0]*meshScaling.getX(),(btScalar)graphicsbase[1]*meshScaling.getY(),  (btScalar)graphicsbase[2]*meshScaling.getZ());
                // graphicsbase = (double*)(vertexbase+tri_indices[2]*stride);
                // triangle[2].setValue((btScalar)graphicsbase[0]*meshScaling.getX(),(btScalar)graphicsbase[1]*meshScaling.getY(),  (btScalar)graphicsbase[2]*meshScaling.getZ());
                // callback->internalProcessTriangleIndex(triangle,part,gfxindex);
              }
              break;

            case Bump.PHY_ScalarType.PHY_UCHAR:
              for ( gfxindex = 0; gfxindex < data.numFaces; ++gfxindex ) {
                throw new Error( 'UCHAR' );
                // unsigned char* tri_indices= (unsigned char*)(indexbase+gfxindex*indexstride);
                // graphicsbase = (double*)(vertexbase+tri_indices[0]*stride);
                // triangle[0].setValue((btScalar)graphicsbase[0]*meshScaling.getX(),(btScalar)graphicsbase[1]*meshScaling.getY(),(btScalar)graphicsbase[2]*meshScaling.getZ());
                // graphicsbase = (double*)(vertexbase+tri_indices[1]*stride);
                // triangle[1].setValue((btScalar)graphicsbase[0]*meshScaling.getX(),(btScalar)graphicsbase[1]*meshScaling.getY(),  (btScalar)graphicsbase[2]*meshScaling.getZ());
                // graphicsbase = (double*)(vertexbase+tri_indices[2]*stride);
                // triangle[2].setValue((btScalar)graphicsbase[0]*meshScaling.getX(),(btScalar)graphicsbase[1]*meshScaling.getY(),  (btScalar)graphicsbase[2]*meshScaling.getZ());
                // callback->internalProcessTriangleIndex(triangle,part,gfxindex);
              }
              break;

            default:
              Bump.Assert( (data.indicesType === Bump.PHY_ScalarType.PHY_INTEGER) || (data.indicesType === Bump.PHY_ScalarType.PHY_SHORT) );
            }
            break;

          default:
            Bump.Assert( (type === Bump.PHY_ScalarType.PHY_FLOAT) || (type === Bump.PHY_ScalarType.PHY_DOUBLE) );
          }

          this.unLockReadOnlyVertexBase( part );
        }
      },

      // `unLockVertexBase` finishes the access to a subpart of the triangle
      // mesh. Make a call to `unLockVertexBase` when the read and write access
      // (using `getLockedVertexIndexBase`) is finished.
      unLockVertexBase: Bump.abstract,
      unLockReadOnlyVertexBase: Bump.abstract,

      // `getNumSubParts` returns the number of seperate subparts. Each subpart
      // has a continuous array of vertices and indices.
      getNumSubParts: Bump.abstract,
      preallocateVertices: Bump.abstract,
      preallocateIndices: Bump.abstract,

      hasPremadeAabb: function() {
        return false;
      },

      setPremadeAabb: Bump.noop,
      getPremadeAabb: Bump.noop,

      getScaling: function() {
        return this.scaling;
      },

      setScaling: function( scaling ) {
        this.scaling.assign( scaling );
      }

    }
  });

})( this, this.Bump );
