// load: bump.js
// load: LinearMath/Vector3.js
// load: LinearMath/Matrix3x3.js

(function( window, Bump ) {
  var AabbUtil2 = Bump,
      tmpV1 = Bump.Vector3.create(),
      tmpV2 = Bump.Vector3.create(),
      tmpV3 = Bump.Vector3.create(),
      tmpV4 = Bump.Vector3.create(),
      tmpV5 = Bump.Vector3.create(),
      tmpV6 = Bump.Vector3.create(),
      tmpM1 = Bump.Matrix3x3.create();

  AabbUtil2.aabbExpand = function( aabbMin, aabbMax, expansionMin, expansionMax ) {
    aabbMin = aabbMin.add( expansionMin, aabbMin );
    aabbMax = aabbMax.add( expansionMax, aabbMax );
  };

  // Conservative test for a `point` lying in an AABB.
  AabbUtil2.testPointAgainstAabb2 = function( aabbMin1, aabbMax1, point ) {
    var overlap = true;
    overlap = ( aabbMin1.x > point.x || aabbMax1.x < point.x ) ? false : overlap;
    overlap = ( aabbMin1.z > point.z || aabbMax1.z < point.z ) ? false : overlap;
    overlap = ( aabbMin1.y > point.y || aabbMax1.y < point.y ) ? false : overlap;
    return overlap;
  };

  // Conservative test for overlap between two AABBs.
  AabbUtil2.testAabbAgainstAabb2 = function( aabbMin1, aabbMax1, aabbMin2, aabbMax2 ) {
    var overlap = true;
    overlap = ( aabbMin1.x > aabbMax2.x || aabbMax1.x < aabbMin2.x ) ? false : overlap;
    overlap = ( aabbMin1.z > aabbMax2.z || aabbMax1.z < aabbMin2.z ) ? false : overlap;
    overlap = ( aabbMin1.y > aabbMax2.y || aabbMax1.y < aabbMin2.y ) ? false : overlap;
    return overlap;
  };

  // Conservative test for overlap of the AABB of a triangle
  // and two AABBs.
  AabbUtil2.testTriangleAgainstAabb2 = function( vertices, aabbMin, aabbMax ) {
    var p1 = vertices[0],
        p2 = vertices[1],
        p3 = vertices[2];

    if ( Math.min( p1.x, p2.x, p3.x ) > aabbMax.x ) { return false; }
    if ( Math.max( p1.x, p2.x, p3.x ) < aabbMin.x ) { return false; }

    if ( Math.min( p1.z, p2.z, p3.z ) > aabbMax.z ) { return false; }
    if ( Math.max( p1.z, p2.z, p3.z ) < aabbMin.z ) { return false; }

    if ( Math.min( p1.y, p2.y, p3.y ) > aabbMax.y ) { return false; }
    if ( Math.max( p1.y, p2.y, p3.y ) < aabbMin.y ) { return false; }

    return true;
  };

  AabbUtil2.Outcode = function( p, halfExtent ) {
    return ( ( p.x < -halfExtent.x ? 0x01 : 0x0 ) |
             ( p.x >  halfExtent.x ? 0x08 : 0x0 ) |
             ( p.y < -halfExtent.y ? 0x02 : 0x0 ) |
             ( p.y >  halfExtent.y ? 0x10 : 0x0 ) |
             ( p.z < -halfExtent.z ? 0x04 : 0x0 ) |
             ( p.z >  halfExtent.z ? 0x20 : 0x0 ) );
  };

  AabbUtil2.RayAabb2 = function( rayFrom, rayInvDirection, raySign, bounds, tmin, lambda_min, lambda_max ) {
    var tmax, tymin, tymax, tzmin, tzmax;

    tmin.value = ( bounds[ raySign[0] ].x - rayFrom.x ) * rayInvDirection.x;
    tmax = ( bounds[ 1 - raySign[0] ].x - rayFrom.x ) * rayInvDirection.x;
    tymin = ( bounds[ raySign[1] ].y - rayFrom.y ) * rayInvDirection.y;
    tymax = ( bounds[ 1 - raySign[1] ].y - rayFrom.y ) * rayInvDirection.y;

    if ( ( tmin.value > tymax ) || ( tymin > tmax ) ) {
      return false;
    }

    if ( tymin > tmin.value ) {
      tmin.value = tymin;
    }

    if ( tymax < tmax ) {
      tmax = tymax;
    }

    tzmin = ( bounds[ raySign[2] ].z - rayFrom.z ) * rayInvDirection.z;
    tzmax = ( bounds[ 1 - raySign[2] ].z - rayFrom.z ) * rayInvDirection.z;

    if ( ( tmin.value > tzmax ) || ( tzmin > tmax ) ) {
      return false;
    }

    if ( tzmin > tmin.value ) {
      tmin.value = tzmin;
    }

    if ( tzmax < tmax ) {
      tmax = tzmax;
    }

    return ( tmin.value < lambda_max ) && ( tmax > lambda_min );
  };

  AabbUtil2.RayAabb = function( rayFrom, rayTo, aabbMin, aabbMax, param, normal ) {
    var aabbHalfExtent = aabbMax.subtract( aabbMin, tmpV1 ).multiplyScalar( 0.5, tmpV1 ),
        aabbCenter = aabbMax.add( aabbMin, tmpV2 ).multiplyScalar( 0.5, tmpV2 ),
        source = rayFrom.subtract( aabbCenter, tmpV3 ),
        target = rayTo.subtract( aabbCenter, tmpV4 ),
        sourceOutcode = AabbUtil2.Outcode( source, aabbHalfExtent ),
        targetOutcode = AabbUtil2.Outcode( target, aabbHalfExtent );

    if ( ( sourceOutcode & targetOutcode ) === 0x0 ) {
      var lambda,
          lambda_enter = 0,
          lambda_exit  = param.param,
          r = target.subtract( source, tmpV5 ),
          i, j,
          normSign = 1,
          hitNormal = tmpV6.setValue( 0, 0, 0 ),
          bit = 1;

      for ( j = 0; j < 2; ++j ) {
        for ( i = 0; i !== 3; ++i ) {
          if ( sourceOutcode & bit ) {
            lambda = ( -source[i] - aabbHalfExtent[i] * normSign ) / r[i];
            if ( lambda_enter <= lambda ) {
              lambda_enter = lambda;
              hitNormal.setValue( 0, 0, 0 );
              hitNormal[i] = normSign;
            }
          } else if ( targetOutcode & bit ) {
            lambda = ( -source[i] - aabbHalfExtent[i] * normSign ) / r[i];
            // `btSetMin(lambda_exit, lambda);`
            if ( lambda < lambda_exit ) { lambda_exit = lambda; }
          }
          bit <<= 1;
        }
        normSign = -1;
      }

      if ( lambda_enter <= lambda_exit ) {
        param.param = lambda_enter;
        normal = hitNormal.clone( normal );
        return true;
      }
    }
    return false;
  };

  AabbUtil2.TransformAabbWithExtents = function( halfExtents, margin, t, aabbMinOut, aabbMaxOut ) {
    var halfExtentsWithMargin = halfExtents.add( tmpV1.setValue( margin, margin, margin ), tmpV1 ),
        abs_b = t.basis.absolute( tmpM1 ),
        center = t.origin.clone( tmpV2 ),
        extent = tmpV3.setValue( abs_b.el0.dot( halfExtentsWithMargin ),
                                 abs_b.el1.dot( halfExtentsWithMargin ),
                                 abs_b.el2.dot( halfExtentsWithMargin ) );

    aabbMinOut = center.subtract( extent, aabbMinOut );
    aabbMaxOut = center.add( extent, aabbMaxOut );
  };

  AabbUtil2.TransformAabb = function( localAabbMin, localAabbMax, margin, trans, aabbMinOut, aabbMaxOut ) {
    Bump.Assert( localAabbMin.x <= localAabbMax.x );
    Bump.Assert( localAabbMin.y <= localAabbMax.y );
    Bump.Assert( localAabbMin.z <= localAabbMax.z );

    var localHalfExtents = localAabbMax
      .subtract( localAabbMin, tmpV1 )
      .multiplyScalar( 0.5, tmpV1 );
    localHalfExtents.addSelf( tmpV2.setValue( margin, margin, margin ) );

    var localCenter = localAabbMax
      .add( localAabbMin, tmpV2 )
      .multiplyScalar( 0.5, tmpV2 );
    var abs_b = trans.basis.absolute( tmpM1 );
    var center = trans.transform( localCenter, tmpV3 );
    var extent = tmpV4.setValue( abs_b.el0.dot( localHalfExtents ),
                                 abs_b.el1.dot( localHalfExtents ),
                                 abs_b.el2.dot( localHalfExtents ) );
    aabbMinOut = center.subtract( extent, aabbMinOut );
    aabbMaxOut = center.add( extent, aabbMaxOut );
  };

  AabbUtil2.testQuantizedAabbAgainstQuantizedAabb = function( aabbMin1, aabbMax1, aabbMin2, aabbMax2 ) {
    var overlap = true;
    overlap = ( aabbMin1[0] > aabbMax2[0] || aabbMax1[0] < aabbMin2[0] ) ? false : overlap;
    overlap = ( aabbMin1[2] > aabbMax2[2] || aabbMax1[2] < aabbMin2[2] ) ? false : overlap;
    overlap = ( aabbMin1[1] > aabbMax2[1] || aabbMax1[1] < aabbMin2[1] ) ? false : overlap;
    return overlap;
  };

})( this, this.Bump );
