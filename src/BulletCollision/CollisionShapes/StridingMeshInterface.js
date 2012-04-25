(function( window, Bump ) {

  Bump.StridingMeshInterface = Bump.type({
    init: function StridingMeshInterface() {
      this.scaling = Bump.Vector3.create( 1, 1, 1 );
      return this;
    },

    members: {
      destruct: Bump.noop

      // InternalProcessAllTriangles: function( callback, aabbMin, aabbMax ) {
      //   var numtotalphysicsverts = 0;
      //   var part;
      //   var graphicssubparts = this.getNumSubParts();
      //   const unsigned char* vertexbase;
      //   const unsigned char* indexbase;
      //   var indexstride;
      //   PHY_ScalarType type;
      //   PHY_ScalarType gfxindextype;
      //   var stride, numverts, numtriangles;
      //   var gfxindex;
      //   var triangle = [
      //     Bump.Vector3.create(),
      //     Bump.Vector3.create(),
      //     Bump.Vector3.create()
      //   ];
      //
      //   var meshScaling = this.getScaling();
      //
      //   // If the number of parts is big, the performance might drop due to the
      //   // innerloop switch on indextype
      //   for ( part = 0; part < graphicssubparts; ++part ) {
      //     this.getLockedReadOnlyVertexIndexBase( &vertexbase, numverts, type, stride, &indexbase, indexstride, numtriangles, gfxindextype, part );
      //     numtotalphysicsverts += numtriangles * 3; // upper bound
      //
      //     // Unlikely that developers want to pass in double-precision meshes
      //     // in single-precision Bullet build, so disable this feature by
      //     // default. See patch http://code.google.com/p/bullet/issues/detail?id=213
      //
      //     switch ( type ) {
      //     case PHY_FLOAT:
      //       float* graphicsbase;
      //
      //       switch ( gfxindextype ) {
      //       case PHY_INTEGER:
      //         for ( gfxindex = 0; gfxindex < numtriangles; ++gfxindex ) {
      //           unsigned int* tri_indices= (unsigned int*)(indexbase+gfxindex*indexstride);
      //           graphicsbase = (float*)(vertexbase+tri_indices[0]*stride);
      //           triangle[0].setValue(graphicsbase[0]*meshScaling.getX(),graphicsbase[1]*meshScaling.getY(),graphicsbase[2]*meshScaling.getZ());
      //           graphicsbase = (float*)(vertexbase+tri_indices[1]*stride);
      //           triangle[1].setValue(graphicsbase[0]*meshScaling.getX(),graphicsbase[1]*meshScaling.getY(),    graphicsbase[2]*meshScaling.getZ());
      //           graphicsbase = (float*)(vertexbase+tri_indices[2]*stride);
      //           triangle[2].setValue(graphicsbase[0]*meshScaling.getX(),graphicsbase[1]*meshScaling.getY(),    graphicsbase[2]*meshScaling.getZ());
      //           callback->internalProcessTriangleIndex(triangle,part,gfxindex);
      //         }
      //         break;
      //
      //       case PHY_SHORT:
      //         for ( gfxindex = 0; gfxindex < numtriangles; ++gfxindex ) {
      //           unsigned short int* tri_indices= (unsigned short int*)(indexbase+gfxindex*indexstride);
      //           graphicsbase = (float*)(vertexbase+tri_indices[0]*stride);
      //           triangle[0].setValue(graphicsbase[0]*meshScaling.getX(),graphicsbase[1]*meshScaling.getY(),graphicsbase[2]*meshScaling.getZ());
      //           graphicsbase = (float*)(vertexbase+tri_indices[1]*stride);
      //           triangle[1].setValue(graphicsbase[0]*meshScaling.getX(),graphicsbase[1]*meshScaling.getY(),    graphicsbase[2]*meshScaling.getZ());
      //           graphicsbase = (float*)(vertexbase+tri_indices[2]*stride);
      //           triangle[2].setValue(graphicsbase[0]*meshScaling.getX(),graphicsbase[1]*meshScaling.getY(),    graphicsbase[2]*meshScaling.getZ());
      //           callback->internalProcessTriangleIndex(triangle,part,gfxindex);
      //         }
      //         break;
      //
      //       case PHY_UCHAR:
      //         for ( gfxindex = 0; gfxindex < numtriangles; ++gfxindex ) {
      //           unsigned char* tri_indices= (unsigned char*)(indexbase+gfxindex*indexstride);
      //           graphicsbase = (float*)(vertexbase+tri_indices[0]*stride);
      //           triangle[0].setValue(graphicsbase[0]*meshScaling.getX(),graphicsbase[1]*meshScaling.getY(),graphicsbase[2]*meshScaling.getZ());
      //           graphicsbase = (float*)(vertexbase+tri_indices[1]*stride);
      //           triangle[1].setValue(graphicsbase[0]*meshScaling.getX(),graphicsbase[1]*meshScaling.getY(),    graphicsbase[2]*meshScaling.getZ());
      //           graphicsbase = (float*)(vertexbase+tri_indices[2]*stride);
      //           triangle[2].setValue(graphicsbase[0]*meshScaling.getX(),graphicsbase[1]*meshScaling.getY(),    graphicsbase[2]*meshScaling.getZ());
      //           callback->internalProcessTriangleIndex(triangle,part,gfxindex);
      //         }
      //         break;
      //
      //       default:
      //         Bump.Assert( (gfxindextype === PHY_INTEGER) || (gfxindextype === PHY_SHORT) );
      //       }
      //       break;
      //
      //     case PHY_DOUBLE:
      //       double* graphicsbase;
      //
      //       switch ( gfxindextype ) {
      //       case PHY_INTEGER:
      //         for ( gfxindex = 0; gfxindex < numtriangles; ++gfxindex ) {
      //           unsigned int* tri_indices= (unsigned int*)(indexbase+gfxindex*indexstride);
      //           graphicsbase = (double*)(vertexbase+tri_indices[0]*stride);
      //           triangle[0].setValue((btScalar)graphicsbase[0]*meshScaling.getX(),(btScalar)graphicsbase[1]*meshScaling.getY(),(btScalar)graphicsbase[2]*meshScaling.getZ());
      //           graphicsbase = (double*)(vertexbase+tri_indices[1]*stride);
      //           triangle[1].setValue((btScalar)graphicsbase[0]*meshScaling.getX(),(btScalar)graphicsbase[1]*meshScaling.getY(),  (btScalar)graphicsbase[2]*meshScaling.getZ());
      //           graphicsbase = (double*)(vertexbase+tri_indices[2]*stride);
      //           triangle[2].setValue((btScalar)graphicsbase[0]*meshScaling.getX(),(btScalar)graphicsbase[1]*meshScaling.getY(),  (btScalar)graphicsbase[2]*meshScaling.getZ());
      //           callback->internalProcessTriangleIndex(triangle,part,gfxindex);
      //         }
      //         break;
      //
      //       case PHY_SHORT:
      //         for ( gfxindex = 0; gfxindex < numtriangles; ++gfxindex ) {
      //           unsigned short int* tri_indices= (unsigned short int*)(indexbase+gfxindex*indexstride);
      //           graphicsbase = (double*)(vertexbase+tri_indices[0]*stride);
      //           triangle[0].setValue((btScalar)graphicsbase[0]*meshScaling.getX(),(btScalar)graphicsbase[1]*meshScaling.getY(),(btScalar)graphicsbase[2]*meshScaling.getZ());
      //           graphicsbase = (double*)(vertexbase+tri_indices[1]*stride);
      //           triangle[1].setValue((btScalar)graphicsbase[0]*meshScaling.getX(),(btScalar)graphicsbase[1]*meshScaling.getY(),  (btScalar)graphicsbase[2]*meshScaling.getZ());
      //           graphicsbase = (double*)(vertexbase+tri_indices[2]*stride);
      //           triangle[2].setValue((btScalar)graphicsbase[0]*meshScaling.getX(),(btScalar)graphicsbase[1]*meshScaling.getY(),  (btScalar)graphicsbase[2]*meshScaling.getZ());
      //           callback->internalProcessTriangleIndex(triangle,part,gfxindex);
      //         }
      //         break;
      //
      //       case PHY_UCHAR:
      //         for ( gfxindex = 0; gfxindex < numtriangles; ++gfxindex ) {
      //           unsigned char* tri_indices= (unsigned char*)(indexbase+gfxindex*indexstride);
      //           graphicsbase = (double*)(vertexbase+tri_indices[0]*stride);
      //           triangle[0].setValue((btScalar)graphicsbase[0]*meshScaling.getX(),(btScalar)graphicsbase[1]*meshScaling.getY(),(btScalar)graphicsbase[2]*meshScaling.getZ());
      //           graphicsbase = (double*)(vertexbase+tri_indices[1]*stride);
      //           triangle[1].setValue((btScalar)graphicsbase[0]*meshScaling.getX(),(btScalar)graphicsbase[1]*meshScaling.getY(),  (btScalar)graphicsbase[2]*meshScaling.getZ());
      //           graphicsbase = (double*)(vertexbase+tri_indices[2]*stride);
      //           triangle[2].setValue((btScalar)graphicsbase[0]*meshScaling.getX(),(btScalar)graphicsbase[1]*meshScaling.getY(),  (btScalar)graphicsbase[2]*meshScaling.getZ());
      //           callback->internalProcessTriangleIndex(triangle,part,gfxindex);
      //         }
      //         break;
      //
      //       default:
      //         Bump.Assert( (gfxindextype === PHY_INTEGER) || (gfxindextype === PHY_SHORT) );
      //       }
      //       break;
      //
      //     default:
      //       Bump.Assert( (type === PHY_FLOAT) || (type === PHY_DOUBLE) );
      //     }
      //
      //     this.unLockReadOnlyVertexBase( part );
      //   }
      // }

    }
  });

})( this, this.Bump );
