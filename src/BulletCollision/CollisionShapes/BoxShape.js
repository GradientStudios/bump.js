// The `BoxShape` is a box primitive around the origin, its sides axis aligned
// with length specified by half extents, in local shape coordinates. When used
// as part of a `CollisionObject` or `btRigidBody` it will be an oriented box in
// world space.
(function( window, Bump ) {
  var EPSILON = Math.pow( 2, -52 ),
      tmpV1 = Bump.Vector3.create(),
      tmpV2 = Bump.Vector3.create(),
      tmpV3 = Bump.Vector3.create(),
      tmpV4 = Bump.Vector3.create(),
      tmpVec4 = Bump.Vector4.create();

  Bump.BoxShape = Bump.type({
    parent: Bump.PolyhedralConvexShape,

    // Initializes the following:
    //
    // - `shapeType`
    // - `userPointer`
    // - `localScaling`
    // - `implicitShapeDimensions`
    // - `collisionMargin`
    // - `polyhedron`
    init: function BoxShape( boxHalfExtents ) {
      this._super();

      this.shapeType = Bump.BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE;
      this.setSafeMargin( boxHalfExtents );

      var myMargin = this.getMargin(),
          margin = tmpV1.setValue( myMargin, myMargin, myMargin );
      this.implicitShapeDimensions = boxHalfExtents
        .multiplyVector( this.localScaling, this.implicitShapeDimensions )
        .subtract( margin, this.implicitShapeDimensions );
    },

    members: {
      clone: function( dest ) {
        dest = dest || Bump.BoxShape.create( tmpV1.setValue( 0, 0, 0 ) );
        return this._super( dest );
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      getHalfExtentsWithMargin: function( dest ) {
        dest = dest || Bump.Vector3.create();
        var halfExtents = this.implicitShapeDimensions.clone( dest ),
            myMargin = this.getMargin(),
            margin = tmpV1.setValue( myMargin, myMargin, myMargin );
        halfExtents.addSelf( margin );
        return halfExtents;
      },

      getHalfExtentsWithoutMargin: function() {
        return this.implicitShapeDimensions;
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      localGetSupportingVertex: function( vec, dest ) {
        dest = dest || Bump.Vector3.create();
        var halfExtents = this.implicitShapeDimensions.clone( tmpV1 ),
            myMargin = this.getMargin(),
            margin = tmpV2.setValue( myMargin, myMargin, myMargin );
        halfExtents.addSelf( margin );

        return dest.setValue( Bump.Fsels( vec.x, halfExtents.x, -halfExtents.x ),
                              Bump.Fsels( vec.y, halfExtents.y, -halfExtents.y ),
                              Bump.Fsels( vec.z, halfExtents.z, -halfExtents.z ) );
      },

      localGetSupportingVertexWithoutMargin: function( vec, dest ) {
        dest = dest || Bump.Vector3.create();
        var halfExtents = this.implicitShapeDimensions;

        return dest.setValue( Bump.Fsels( vec.x, halfExtents.x, -halfExtents.x ),
                              Bump.Fsels( vec.y, halfExtents.y, -halfExtents.y ),
                              Bump.Fsels( vec.z, halfExtents.z, -halfExtents.z ) );
      },

      batchedUnitVectorGetSupportingVertexWithoutMargin: function( vectors, supportVerticesOut, numVectors ) {
        var halfExtents = this.implicitShapeDimensions;

        for ( var i = 0; i < numVectors; ++i ) {
          var vec = vectors[i];
          supportVerticesOut[i].setValue( Bump.Fsels( vec.x, halfExtents.x, -halfExtents.x ),
                                          Bump.Fsels( vec.y, halfExtents.y, -halfExtents.y ),
                                          Bump.Fsels( vec.z, halfExtents.z, -halfExtents.z ) );
        }
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      // - `tmpV3`
      setMargin: function( collisionMargin ) {
        // Correct the `implicitShapeDimensions` for the margin
        var myMargin = this.getMargin(),
            oldMargin = tmpV1.setValue( myMargin, myMargin, myMargin ),
            implicitShapeDimensionsWithMargin = this.implicitShapeDimensions.add( oldMargin, tmpV2 );

        this._super( collisionMargin );
        var newMargin = tmpV3.setValue( myMargin, myMargin, myMargin );
        this.implicitShapeDimensions = implicitShapeDimensionsWithMargin
          .subtract( newMargin, this.implicitShapeDimensions );

        return this;
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      // - `tmpV3`
      setLocalScaling: function( scaling ) {
        var myMargin = this.getMargin(),
            oldMargin = tmpV1.setValue( myMargin, myMargin, myMargin ),
            implicitShapeDimensionsWithMargin = this.implicitShapeDimensions.add( oldMargin, tmpV2 ),
            unScaledImplicitShapeDimensionsWithMargin = implicitShapeDimensionsWithMargin.divideVector( this.localScaling, tmpV3 );

        this._super( scaling );

        this.implicitShapeDimensions = unScaledImplicitShapeDimensionsWithMargin
          .multiplyVector( this.localScaling, this.implicitShapeDimensions )
          .subtract( oldMargin, this.implicitShapeDimensions );

        return this;
      },

      getAabb: function( t, aabbMin, aabbMax ) {
        Bump.TransformAabbWithExtents(
          this.implicitShapeDimensions,
          this.getMargin(), t, aabbMin, aabbMax
        );
        //     return this;
        //     return { aabbMin: aabbMin, aabbMax: aabbMax };
      },

      // Uses the following temporary variables:
      //
      // - `tmpV2`
      // - `tmpV1` ← `getHalfExtentsWithMargin`
      calculateLocalInertia: function( mass, inertia ) {
        var halfExtents = this.getHalfExtentsWithMargin( tmpV2 );

        var lx = 2 * halfExtents.x,
            ly = 2 * halfExtents.y,
            lz = 2 * halfExtents.z;

        inertia.setValue( mass / 12 * ( ly * ly + lz * lz ),
                          mass / 12 * ( lx * lx + lz * lz ),
                          mass / 12 * ( lx * lx + ly * ly ) );

        return this;
      },

      // Uses the following temporary variables:
      //
      // - `tmpV3`
      // - `tmpVec4`
      // - `tmpV1` ← `localGetSupportingVertex`
      // - `tmpV2` ← `localGetSupportingVertex`
      getPlane: function( planeNormal, planeSupport, i ) {
        // This plane might not be aligned…
        var plane = tmpVec4.setValue( 0, 0, 0, 0 );
        this.getPlaneEquation( plane, i );
        planeNormal = planeNormal.setValue( plane.x, plane.y, plane.z );
        planeSupport = this.localGetSupportingVertex( planeNormal.negate( tmpV3 ), planeSupport );

        return this;
      },

      getNumPlanes: function() {
        return 6;
      },

      getNumVertices: function() {
        return 8;
      },

      getNumEdges: function() {
        return 12;
      },

      // Uses the following temporary variables:
      //
      // - `tmpV2`
      // - `tmpV1` ← `getHalfExtentsWithMargin`
      getVertex: function( i, vtx ) {
        var halfExtents = this.getHalfExtentsWithMargin( tmpV2 );

        vtx.setValue(
          halfExtents.x * (1 -   (i & 1)       ) - halfExtents.x *   (i & 1),
          halfExtents.y * (1 - ( (i & 2) >> 1 )) - halfExtents.y * ( (i & 2) >> 1 ),
          halfExtents.z * (1 - ( (i & 4) >> 2 )) - halfExtents.z * ( (i & 4) >> 2 )
        );

        return this;
      },

      getPlaneEquation: function( plane, i ) {
        var halfExtents = this.implicitShapeDimensions;

        switch ( i ) {
        case 0:
          plane.setValue( 1, 0, 0, -halfExtents.x );
          break;
        case 1:
          plane.setValue( -1, 0, 0, -halfExtents.x );
          break;
        case 2:
          plane.setValue( 0, 1, 0, -halfExtents.y );
          break;
        case 3:
          plane.setValue( 0, -1, 0, -halfExtents.y );
          break;
        case 4:
          plane.setValue( 0, 0, 1, -halfExtents.z );
          break;
        case 5:
          plane.setValue( 0, 0, -1, -halfExtents.z );
          break;
        default:
          Bump.Assert( false );
        }

        return this;
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1` ← `getVertex`
      // - `tmpV2` ← `getVertex`
      getEdge: function( i, pa, pb ) {
        var edgeVert0 = 0,
            edgeVert1 = 0;

        switch ( i ) {
        case 0:
          edgeVert0 = 0;
          edgeVert1 = 1;
          break;
        case 1:
          edgeVert0 = 0;
          edgeVert1 = 2;
          break;
        case 2:
          edgeVert0 = 1;
          edgeVert1 = 3;

          break;
        case 3:
          edgeVert0 = 2;
          edgeVert1 = 3;
          break;
        case 4:
          edgeVert0 = 0;
          edgeVert1 = 4;
          break;
        case 5:
          edgeVert0 = 1;
          edgeVert1 = 5;

          break;
        case 6:
          edgeVert0 = 2;
          edgeVert1 = 6;
          break;
        case 7:
          edgeVert0 = 3;
          edgeVert1 = 7;
          break;
        case 8:
          edgeVert0 = 4;
          edgeVert1 = 5;
          break;
        case 9:
          edgeVert0 = 4;
          edgeVert1 = 6;
          break;
        case 10:
          edgeVert0 = 5;
          edgeVert1 = 7;
          break;
        case 11:
          edgeVert0 = 6;
          edgeVert1 = 7;
          break;
        default:
          Bump.Assert( false );
        }

        this.getVertex( edgeVert0, pa );
        this.getVertex( edgeVert1, pb );
      },

      isInside: function( pt, tolerance ) {
        var halfExtents = this.implicitShapeDimensions;

        var result =
          ( pt.x <= (  halfExtents.x + tolerance ) ) &&
          ( pt.x >= ( -halfExtents.x - tolerance ) ) &&
          ( pt.y <= (  halfExtents.y + tolerance ) ) &&
          ( pt.y >= ( -halfExtents.y - tolerance ) ) &&
          ( pt.z <= (  halfExtents.z + tolerance ) ) &&
          ( pt.z >= ( -halfExtents.z - tolerance ) );

        return result;
      },

      getName: function() {
        return 'Box';
      },

      getNumPreferredPenetrationDirections: function() {
        return 6;
      },

      getPreferredPenetrationDirection: function( index, penetrationVector ) {
        switch ( index ) {
        case 0:
          penetrationVector.setValue( 1, 0, 0 );
          break;
        case 1:
          penetrationVector.setValue( -1, 0, 0 );
          break;
        case 2:
          penetrationVector.setValue( 0, 1, 0 );
          break;
        case 3:
          penetrationVector.setValue( 0, -1, 0 );
          break;
        case 4:
          penetrationVector.setValue( 0, 0, 1 );
          break;
        case 5:
          penetrationVector.setValue( 0, 0, -1 );
          break;
        default:
          Bump.Assert( false );
        }
      }
    }
  });
})( this, this.Bump );
