(function( window, Bump ) {
  var EPSILON = Math.pow( 2, -52 ),
      tmpV1 = Bump.Vector3.create(),
      tmpV2 = Bump.Vector3.create(),
      tmpV3 = Bump.Vector3.create();

  Bump.ConvexShape = Bump.type({
    parent: Bump.CollisionShape,

    init: function ConvexShape() {
      this._super();
    },

    members: {
      clone: function( dest ) {
        dest = dest || Bump.ConvexShape.create();
        return this._super( dest );
      },

      localGetSupportVertexWithoutMarginNonVirtual: function( localDir, dest ) {
        dest = dest || Bump.Vector3.create();

        var halfExtents, halfHeight, radius, points, numPoints;

        switch ( this.shapeType ) {
        case Bump.BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE:
            return dest.setValue( 0, 0, 0 );

        case Bump.BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE:
          var convexShape = this;
          halfExtents = convexShape.getImplicitShapeDimensions();

          return dest.setValue(
            Bump.Fsels( localDir.x, halfExtents.x, -halfExtents.x ),
            Bump.Fsels( localDir.y, halfExtents.y, -halfExtents.y ),
            Bump.Fsels( localDir.z, halfExtents.z, -halfExtents.z )
          );

        case Bump.BroadphaseNativeTypes.TRIANGLE_SHAPE_PROXYTYPE:
          var triangleShape = this;
          var dir = localDir.clone();
          var dots = Bump.Vector3.create(
            dir.dot( triangleShape.vertices10 ),
            dir.dot( triangleShape.vertices11 ),
            dir.dot( triangleShape.vertices12 )
          );
          return dest.assign( triangleShape[ 'vertices1' + dots.maxAxis() ] );

    //     case Bump.BroadphaseNativeTypes.CYLINDER_SHAPE_PROXYTYPE:
    //       var cylShape = this;
    //       // mapping of halfextents/dimension onto radius/height depends on how
    //       // cylinder local orientation is (upAxis)

    //       halfExtents = cylShape.getImplicitShapeDimensions();
    //       var v = localDir.clone();
    //       var cylinderUpAxis = cylShape.getUpAxis();
    //       var XX = 1, YY = 0, ZZ = 2;

    //       switch ( cylinderUpAxis ) {
    //       case 0:
    //         XX = 1;
    //         YY = 0;
    //         ZZ = 2;
    //         break;

    //       case 1:
    //         XX = 0;
    //         YY = 1;
    //         ZZ = 2;
    //         break;

    //       case 2:
    //         XX = 0;
    //         YY = 2;
    //         ZZ = 1;
    //         break;
    //       }

    //       // default:
    //       //   // `btAssert( 0 );`
    //       //   break;
    //       // }

    //       radius = halfExtents[XX];
    //       halfHeight = halfExtents[ cylinderUpAxis ];

    //       var tmp = Bump.Vector3.create();
    //       var d;

    //       var s = Math.sqrt( v[XX] * v[XX] + v[ZZ] * v[ZZ] );
    //       if ( s !== 0 ) {
    //         d = radius / s;
    //         tmp[XX] = v[XX] * d;
    //         tmp[YY] = v[YY] < 0.0 ? -halfHeight : halfHeight;
    //         tmp[ZZ] = v[ZZ] * d;
    //         return tmp.clone();
    //       }

    //       tmp[XX] = radius;
    //       tmp[YY] = v[YY] < 0.0 ? -halfHeight : halfHeight;
    //       tmp[ZZ] = 0;
    //       return tmp.clone();

    //     case Bump.BroadphaseNativeTypes.CAPSULE_SHAPE_PROXYTYPE:
    //       var vec0 = localDir.clone();

    //       var capsuleShape = this;
    //       halfHeight = capsuleShape.getHalfHeight();
    //       var capsuleUpAxis = capsuleShape.getUpAxis();

    //       radius = capsuleShape.getRadius();
    //       var supVec = Bump.Vector3.create( 0, 0, 0 );

    //       var maxDot = -Infinity;

    //       var vec = vec0.clone();
    //       var lenSqr = vec.length2();
    //       if ( lenSqr < 0.0001 ) {
    //         vec.setValue( 1, 0, 0 );
    //       } else {
    //         var rlen = 1 / Math.sqrt( lenSqr );
    //         vec.multiplyScalarSelf( rlen );
    //       }

    //       var vtx = Bump.Vector3.create();
    //       var newDot = 0;
    //       var pos = Bump.Vector3.create( 0, 0, 0 );
    //       pos[capsuleUpAxis] = halfHeight;

    //       // vtx = pos + vec * (radius);
    //       vtx = pos
    //         .add( vec.multiplyScalar( capsuleShape.getLocalScalingNV() * radius ) )
    //         .subtract( vec.multiplyScalar( capsuleShape.getMarginNV() ) );
    //       newDot = vec.dot( vtx );

    //       if ( newDot > maxDot ) {
    //         maxDot = newDot;
    //         supVec = vtx;
    //       }

    //       pos = Bump.Vector3.create( 0, 0, 0 );
    //       pos[capsuleUpAxis] = -halfHeight;

    //       // vtx = pos +vec*(radius);
    //       vtx = pos
    //         .add( vec.multiplyScalar( capsuleShape.getLocalScalingNV() * radius ) )
    //         .subtract( vec.multiplyScalar( capsuleShape.getMarginNV() ) );
    //       newDot = vec.dot( vtx );
    //       if ( newDot > maxDot ) {
    //         maxDot = newDot;
    //         supVec = vtx;
    //       }
    //       return supVec.clone();

    //     case Bump.BroadphaseNativeTypes.CONVEX_POINT_CLOUD_SHAPE_PROXYTYPE:
    //       var convexPointCloudShape = this;
    //       points = convexPointCloudShape.getUnscaledPoints();
    //       numPoints = convexPointCloudShape.getNumPoints();
    //       return Bump.convexHullSupport( localDir, points, numPoints, convexPointCloudShape.getLocalScalingNV() );

    //     case Bump.BroadphaseNativeTypes.CONVEX_HULL_SHAPE_PROXYTYPE:
    //       var convexHullShape = this;
    //       points = convexHullShape.getUnscaledPoints();
    //       numPoints = convexHullShape.getNumPoints();
    //       return Bump.convexHullSupport( localDir, points, numPoints, convexHullShape.getLocalScalingNV() );

        default:
          return this.localGetSupportingVertexWithoutMargin( localDir, dest );
        }

        // Should never reach here.
        // `btAssert( 0 );`
        return dest.setValue( 0, 0, 0 );
      },

      localGetSupportVertexNonVirtual: function( localDir, dest ) {
        dest = dest || Bump.Vector3.create();

        var localDirNorm = localDir.clone( tmpV1 );
        if ( localDirNorm.length2() < EPSILON * EPSILON ) {
          localDirNorm.setValue( -1, -1, -1 );
        }
        localDirNorm.normalize();

        return this.localGetSupportVertexWithoutMarginNonVirtual( localDirNorm, dest )
          .add( localDirNorm.multiplyScalar( this.getMarginNonVirtual(), tmpV2 ), dest );
      },

      getMarginNonVirtual: function() {
        switch ( this.shapeType ) {
        case Bump.BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE:
          var sphereShape = this;
          return sphereShape.getRadius();

        case Bump.BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE:
          var convexShape = this;
          return convexShape.getMarginNV();

        case Bump.BroadphaseNativeTypes.TRIANGLE_SHAPE_PROXYTYPE:
          var triangleShape = this;
          return triangleShape.getMarginNV();

        case Bump.BroadphaseNativeTypes.CYLINDER_SHAPE_PROXYTYPE:
          var cylShape = this;
          return cylShape.getMarginNV();

        case Bump.BroadphaseNativeTypes.CAPSULE_SHAPE_PROXYTYPE:
          var capsuleShape = this;
          return capsuleShape.getMarginNV();

        case Bump.BroadphaseNativeTypes.CONVEX_POINT_CLOUD_SHAPE_PROXYTYPE:
        case Bump.BroadphaseNativeTypes.CONVEX_HULL_SHAPE_PROXYTYPE:
          var convexHullShape = this;
          return convexHullShape.getMarginNV();

        default:
          return this.getMargin ();
        }

        // Should never reach here.
        // `btAssert( 0 );`
        return 0;
      },

      getAabbNonVirtual: function( t, aabbMin, aabbMax ) {
        var margin, center, extent;

        switch ( this.shapeType ) {
        case Bump.BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE:
          var sphereShape = this;
          var radius = sphereShape.getImplicitShapeDimensions( tmpV1 ).x;
          margin = radius + sphereShape.getMarginNonVirtual();
          center = t.origin;
          extent = tmpV1.setValue( margin, margin, margin );
          aabbMin = center.subtract( extent, aabbMin );
          aabbMax = center.add( extent, aabbMax );
          break;

        case Bump.BroadphaseNativeTypes.CYLINDER_SHAPE_PROXYTYPE:
        case Bump.BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE:
          var convexShape = this;
          margin = convexShape.getMarginNonVirtual();
          var halfExtents = convexShape.getImplicitShapeDimensions( tmpV1 );
          halfExtents.addSelf( tmpV2.setValue( margin, margin, margin ) );
          var abs_b = t.basis.absolute( tmpV2 );
          center = t.origin;
          extent = tmpV3.setValue(
            abs_b.el0.dot( halfExtents ),
            abs_b.el1.dot( halfExtents ),
            abs_b.el2.dot( halfExtents )
          );

          aabbMin = center.subtract( extent, aabbMin );
          aabbMax = center.add( extent, aabbMax );
          break;

    //     case Bump.BroadphaseNativeTypes.TRIANGLE_SHAPE_PROXYTYPE:
    //       var triangleShape = this;
    //       btScalar margin = triangleShape.getMarginNonVirtual();
    //       for (var i = 0; i < 3; ++i ) {
    //         btVector3 vec(btScalar(0.),btScalar(0.),btScalar(0.));
    //         vec[i] = btScalar(1.);

    //         btVector3 sv = localGetSupportVertexWithoutMarginNonVirtual(vec*t.getBasis());

    //         btVector3 tmp = t(sv);
    //         aabbMax[i] = tmp[i]+margin;
    //         vec[i] = -1;
    //         tmp = t(localGetSupportVertexWithoutMarginNonVirtual(vec*t.getBasis()));
    //         aabbMin[i] = tmp[i]-margin;
    //       }
    //       break;

    //     case Bump.BroadphaseNativeTypes.CAPSULE_SHAPE_PROXYTYPE:
    //       btCapsuleShape* capsuleShape = (btCapsuleShape*)this;
    //       btVector3 halfExtents(capsuleShape->getRadius(),capsuleShape->getRadius(),capsuleShape->getRadius());
    //       int upAxis = capsuleShape->getUpAxis();
    //       halfExtents[upAxis] = capsuleShape->getRadius() + capsuleShape->getHalfHeight();
    //       halfExtents += btVector3(capsuleShape->getMarginNonVirtual(),capsuleShape->getMarginNonVirtual(),capsuleShape->getMarginNonVirtual());
    //       btMatrix3x3 abs_b = t.getBasis().absolute();
    //       btVector3 center = t.getOrigin();
    //       btVector3 extent = btVector3(abs_b[0].dot(halfExtents),abs_b[1].dot(halfExtents),abs_b[2].dot(halfExtents));
    //       aabbMin = center - extent;
    //       aabbMax = center + extent;
    //       break;

    //     case Bump.BroadphaseNativeTypes.CONVEX_POINT_CLOUD_SHAPE_PROXYTYPE:
    //     case Bump.BroadphaseNativeTypes.CONVEX_HULL_SHAPE_PROXYTYPE:
    //       btPolyhedralConvexAabbCachingShape* convexHullShape = (btPolyhedralConvexAabbCachingShape*)this;
    //       btScalar margin = convexHullShape->getMarginNonVirtual();
    //       convexHullShape->getNonvirtualAabb (t, aabbMin, aabbMax, margin);
    //       break;

        default:
          this.getAabb( t, aabbMin, aabbMax );
          break;
        }
      },

      project: function( trans, dir, minMax ) {
        // `dir * trans.getBasis();`
        var localAxis = trans.basis.vectorMultiply( dir, tmpV1 );
        var vtx1 = trans.transform( this.localGetSupportingVertex( localAxis ) );
        var vtx2 = trans.transform( this.localGetSupportingVertex( -localAxis ) );

        minMax.min = vtx1.dot( dir );
        minMax.max = vtx2.dot( dir );

        if ( minMax.min > minMax.max ) {
          var tmp = minMax.min;
          minMax.min = minMax.max;
          minMax.max = tmp;
        }
      }

    }
  });
})( this, this.Bump );
