(function( window, Bump ) {
  var EPSILON = Math.pow( 2, -52 ),
      tmpV1 = Bump.Vector3.create(),
      tmpV2 = Bump.Vector3.create(),
      tmpV3 = Bump.Vector3.create(),
      tmpV4 = Bump.Vector3.create(),
      tmpT1 = Bump.Transform.create();

  Bump.PolyhedralConvexShape = Bump.type({
    parent: Bump.ConvexInternalShape,

    init: function PolyhedralConvexShape() {
      this._super();

      this.polyhedron = null;
    },

    members: {
      clone: function( dest ) {
        dest = dest || Bump.PolyhedralConvexShape.create();
        dest = this._super( dest );

        dest.polyhedron = this.polyhedron;
        return dest;
      },

      initializePolyhedralFeatures: function() {
        Bump.Assert( 'Not implemented' && false );
      },

      getConvexPolyhedron: function() {
        return this.polyhedron;
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      // - `tmpV3`
      localGetSupportingVertexWithoutMargin: function( vec0, dest ) {
        dest = dest || Bump.Vector3.create();

        var i, supVec = tmpV1.setValue( 0, 0, 0 ),
            maxDot = -Infinity;

        var vec = vec0.clone( tmpV2 ),
            lenSqr = vec.length2();
        if ( lenSqr < 0.0001 ) {
          vec.setValue( 1, 0, 0 );
        } else {
          var rlen = 1 / Math.sqrt( lenSqr );
          vec.multiplyScalarSelf( rlen );
        }

        var vtx = tmpV3,
            newDot;

        for ( i = 0; i < this.getNumVertices(); ++i ) {
          this.getVertex( i, vtx );
          newDot = vec.dot( vtx );
          if ( newDot > maxDot ) {
            maxDot = newDot;
            supVec = vtx.clone( supVec );
          }
        }

        return supVec.clone( dest );
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      batchedUnitVectorGetSupportingVertexWithoutMargin: function( vectors, supportVerticesOut, numVectors ) {
        var i,
            vtx = tmpV1,
            newDot;

        for ( i = 0; i < numVectors; ++i ) {
          supportVerticesOut[i].w = -Infinity;
        }

        for ( var j = 0; j < numVectors; ++j ) {
          var vec = vectors[j];

          for ( i = 0; i < this.getNumVertices(); ++i ) {
            this.getVertex( i, vtx );
            newDot = vec.dot( vtx );
            if ( newDot > supportVerticesOut[j].w ) {
              // **Warning:** Don't swap next lines, the `w` component would get
              // overwritten!
              supportVerticesOut[j] = vtx.clone( supportVerticesOut[j] );
              supportVerticesOut[j].w = newDot;
            }
          }
        }
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      // - `tmpV3`
      // - `tmpV4`
      calculateLocalInertia: function( mass, inertia ) {
        var margin = this.getMargin();

        var ident = tmpT1;
        ident.setIdentity();
        var aabbMin = tmpV1, aabbMax = tmpV2;
        this.getAabb( ident, aabbMin, aabbMax );
        var halfExtents = aabbMax
          .subtract( aabbMin, tmpV3 )
          .multiplyScalar( 0.5, tmpV3 );

        var lx = 2 * ( halfExtents.x + margin ),
            ly = 2 * ( halfExtents.y + margin ),
            lz = 2 * ( halfExtents.z + margin ),
            x2 = lx * lx,
            y2 = ly * ly,
            z2 = lz * lz,
            scaledmass = mass * 0.08333333;

        // inertia = scaledmass * ( btVector3( y2 + z2, x2 + z2, x2 + y2 ) );
        inertia = tmpV4
          .setValue( y2 + z2, x2 + z2, x2 + y2 )
          .multiplyScalarSelf( scaledmass )
          .clone( inertia );
      }
    }
  });
})( this, this.Bump );
