// load: bump.js
// load: BulletCollision/NarrowPhaseCollision/DiscreteCollisionDetectorInterface.js

// run: LinearMath/Vector3.js

(function( window, Bump ) {

  // Used in getClosestPoints.
  var tmpGCPVec1 = Bump.Vector3.create();
  var tmpGCPVec2 = Bump.Vector3.create();
  var tmpGCPVec3 = Bump.Vector3.create();

  var dDOTAV = function( a, aOff, b       ) { return a[ aOff ] * b.x       + a[ aOff + 1 ] * b.y           + a[ aOff + 2 ] * b.z;           },
      dDOTVA = function( a      , b, bOff ) { return a.x       * b[ bOff ] + a.y           * b[ bOff + 1 ] + a.z           * b[ bOff + 2 ]; },
      dDOT44 = function( a, aOff, b, bOff ) { return a[ aOff ] * b[ bOff ] + a[ aOff + 4 ] * b[ bOff + 4 ] + a[ aOff + 8 ] * b[ bOff + 8 ]; },
      dDOT41 = function( a, aOff, b       ) { return a[ aOff ] * b.x       + a[ aOff + 4 ] * b.y           + a[ aOff + 8 ] * b.z;           },
      dDOT14 = function( a      , b, bOff ) { return a.x       * b[ bOff ] + a.y           * b[ bOff + 4 ] + a.z           * b[ bOff + 8 ]; };

  var dMULTIPLY1_331 = function( A, B, C ) {
    A.x = dDOT41( B, 0, C );
    A.y = dDOT41( B, 1, C );
    A.z = dDOT41( B, 2, C );
  };

  var dMULTIPLY0_331 = function( A, B, C ) {
    A.x = dDOTAV( B, 0, C );
    A.y = dDOTAV( B, 4, C );
    A.z = dDOTAV( B, 8, C );
  };

  var dMatrix3 = Bump.type({
    typeMembers: {
      create: function() {
        return [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
      }
    }
  });

  var tmpLCAVec1 = Bump.Vector3.create();
  var dLineClosestApproach = function( pa, ua, pb, ub, alpha, beta ) {
    var p    = pb.subtract( pa, tmpLCAVec1 ),
        uaub =  dDOTVA( ua, ub, 0 ),
        q1   =  dDOTVA( ua,  p, 0 ),
        q2   = -dDOTVA( ub,  p, 0 ),
        d    = 1 - uaub * uaub;

    if ( d <= 0.0001 ) {
      alpha.value = 0;
      beta.value  = 0;
      return;
    }

    d = 1 / d;
    alpha.value = ( q1 + uaub * q2 ) * d;
    beta.value  = ( uaub * q1 + q2 ) * d;
  };

  // Find all the intersection points between the 2D rectangle with vertices
  // at `(+/-h[0],+/-h[1])` and the 2D quadrilateral with vertices `(p[0],p[1])`,
  // `(p[2],p[3])`, `(p[4],p[5])`, `(p[6],p[7])`.
  //
  // The intersection points are returned as `x,y` pairs in the `ret` array.
  // The number of intersection points is returned by the function (this will
  // be in the range 0 to 8).
  var intersectRectQuad2 = function( h, p, ret ) {
    // `qIdx` (and `rIdx`) contain `nq` (and `nr`) coordinate points for the
    // current (and chopped) polygons.
    var nq = 4, nr = 0,
        buffer = new Array( 16 ),
        // `qIdx` indexes inside `p`.
        q = p,
        qIdx = 0,
        // `rIdx` indexes inside `r`.
        r = ret,
        rIdx = 0,
        z;

    for ( var dir = 0; dir <= 1; ++dir ) {
      // Direction notation: `xy[0]` = x axis, `xy[1]` = y axis.
      for ( var sign = -1; sign <= 1; sign += 2 ) {
        // Chop `q` along the line `xy[dir] = sign * h[dir]`.

        // `pqIdx` indexes inside `p`.
        var pqIdx = qIdx,
            // `prIdx` indexes inside `r`.
            prIdx = rIdx;
        nr = 0;
        for ( var i = nq; i > 0; --i ) {
          // Go through all points in `q` and all lines between adjacent points.
          if ( sign * q[ pqIdx + dir ] < h[ dir ] ) {
            // This point is inside the chopping line.
            r[ prIdx ] = q[ pqIdx ];
            r[ prIdx + 1 ] = q[ pqIdx + 1 ];
            prIdx += 2;
            ++nr;
            if ( nr & 8 ) {
              q = r;
              qIdx = rIdx;
              // goto done;
              if ( q !== ret || qIdx !== 0 ) {
                for ( z = 0; z < nr * 2; ++z ) {
                  ret[ z ] = q[ qIdx + z ];
                }
              }
              return nr;
            }
          }

          var nextq, nextqIdx;
          if ( i > 1 ) {
            nextq = q;
            nextqIdx = pqIdx + 2;
          } else {
            nextq = q;
            nextqIdx = qIdx;
          }
          if ( ( sign * q[ pqIdx + dir ] < h[ dir ]) ^ ( sign * nextq[ nextqIdx + dir ] < h[ dir ] ) ) {
            // This line crosses the chopping line.
            r[ prIdx + 1 - dir ] = q[ pqIdx + 1 - dir ] + ( nextq[ nextqIdx + 1 - dir ] - q[ pqIdx + 1 - dir ] ) /
              ( nextq[ nextqIdx + dir ] - q[ pqIdx + dir ] ) * ( sign * h[ dir ] - q[ pqIdx + dir ] );
            r[ prIdx + dir ] = sign * h[ dir ];
            prIdx += 2;
            ++nr;
            if ( nr & 8 ) {
              q = r;
              qIdx = rIdx;
              // goto done;
              if ( q !== ret || qIdx !== 0 ) {
                for ( z = 0; z < nr * 2; ++z ) {
                  ret[ z ] = q[ qIdx + z ];
                }
              }
              return nr;
            }
          }
          pqIdx += 2;
        }
        q = r;
        qIdx = rIdx;
        if ( q === ret && qIdx === 0 ) {
          r = buffer;
          rIdx = 0;
        } else {
          r = ret;
          rIdx = 0;
        }
        nq = nr;
      }
    }
    // done:
    if ( q !== ret || qIdx !== 0 ) {
      for ( z = 0; z < nr * 2; ++z ) {
        ret[ z ] = q[ qIdx + z ];
      }
    }
    return nr;
  };

  var cullPoints2 = function( n, p, m, i0, iret ) {
    var iretIdx = 0;
    // Compute the centroid of the polygon in `cx,cy`.
    var i, j;
    var a, cx, cy, q;
    if ( n === 1 ) {
      cx = p[0];
      cy = p[1];
    } else if ( n === 2 ) {
      cx = 0.5 * ( p[0] + p[2] );
      cy = 0.5 * ( p[1] + p[3] );
    } else {
      a = 0;
      cx = 0;
      cy = 0;
      for ( i = 0; i < n - 1; ++i ) {
        q = p[ i * 2 ] * p[ i * 2 + 3 ] - p[ i * 2 + 2 ] * p[ i * 2 + 1 ];
        a += q;
        cx += q * ( p[ i * 2     ] + p[ i * 2 + 2 ] );
        cy += q * ( p[ i * 2 + 1 ] + p[ i * 2 + 3 ] );
      }
      q = p[ n * 2 - 2 ] * p[1] - p[0] * p[ n * 2 - 1 ];
      if ( Math.abs( a + q ) > Bump.SIMD_EPSILON ) {
        a = 1 / ( 3 * ( a + q ) );
      } else {
        a = Infinity;
      }
      cx = a * ( cx + q * ( p[ n * 2 - 2 ] + p[0] ) );
      cy = a * ( cy + q * ( p[ n * 2 - 1 ] + p[1] ) );
    }

    // Compute the angle of each point w.r.t. the centroid.
    //     new Array( 8 );
    var A = [ 0, 0, 0, 0, 0, 0, 0, 0 ];
    for ( i = 0; i < n; ++i ) {
      A[i] = Math.atan2( p[ i * 2 + 1 ] - cy, p[ i * 2 ] - cx );
    }

    // Search for points that have angles closest to `A[i0] + i*(2*pi/m)`.
    var avail = new Array( 8 );
    for ( i = 0; i < n; ++i ) {
      avail[i] = 1;
    }
    avail[ i0 ] = 0;
    iret[ iretIdx ] = i0;
    ++iretIdx;
    for ( j = 1; j < m; ++j ) {
      a = j * ( 2 * Math.PI / m ) + A[ i0 ];
      if ( a > Math.PI ) { a -= 2 * Math.PI; }
      var maxdiff = 1e9, diff;

      // `iret` is not allowed to keep this value, but it sometimes does, when
      // `diff` = `#QNAN0`.
      iret[ iretIdx ] = i0;

      for ( i = 0; i < n; ++i ) {
        if ( avail[i] ) {
          diff = Math.abs ( A[i] - a );
          if ( diff > Math.PI ) { diff = 2 * Math.PI - diff; }
          if ( diff < maxdiff ) {
            maxdiff = diff;
            iret[ iretIdx ] = i;
          }
        }
      }
      avail[ iret[ iretIdx ] ] = 0;
      ++iretIdx;
    }
  };

  var tmpBBp = Bump.Vector3.create();
  var tmpBBpp = Bump.Vector3.create();
  var tmpBBnormalC = Bump.Vector3.create();
  var tmpBBpa = Bump.Vector3.create();
  var tmpBBpb = Bump.Vector3.create();
  var tmpBBua = Bump.Vector3.create();
  var tmpBBub = Bump.Vector3.create();
  var tmpBBnormal2  = Bump.Vector3.create();
  var tmpBBnr = Bump.Vector3.create();
  var tmpBBanr = Bump.Vector3.create();
  var tmpBBcenter = Bump.Vector3.create();
  var tmpBBpointInWorld = Bump.Vector3.create();
  var tmpBBposInWorld = Bump.Vector3.create();

  var tmpBBVec1 = Bump.Vector3.create();
  var tmpBBVec2 = Bump.Vector3.create();

  var dBoxBox2 = function(
    p1, R1, side1,
    p2, R2, side2,
    normal, depth, return_code,
    maxc, contact, skip, output
  ) {
    var fudge_factor = 1.05,
        p = tmpBBp,
        pp = tmpBBpp.setValue( 0, 0, 0 ),
        normalC = tmpBBnormalC.setValue( 0, 0, 0 ),
        normalR = { matrix: null, index: 0 },
        A = [ 0, 0, 0 ],
        B = [ 0, 0, 0 ],
        R11 = 0, R12 = 0, R13 = 0, R21 = 0, R22 = 0, R23 = 0, R31 = 0, R32 = 0, R33 = 0,
        Q11 = 0, Q12 = 0, Q13 = 0, Q21 = 0, Q22 = 0, Q23 = 0, Q31 = 0, Q32 = 0, Q33 = 0,
        s = 0, s2 = 0, l = 0,
        i = 0, j = 0, invert_normal = false, code = 0,
        pa, pb, tmp;

    // Get vector from centers of box 1 to box 2, relative to box 1.
    p = p2.subtract( p1, p );
    dMULTIPLY1_331( pp, R1, p );             // get pp = p relative to body 1

    // get side lengths / 2
    A[0] = side1[0] * 0.5;
    A[1] = side1[1] * 0.5;
    A[2] = side1[2] * 0.5;
    B[0] = side2[0] * 0.5;
    B[1] = side2[1] * 0.5;
    B[2] = side2[2] * 0.5;

    // Rij is R1'*R2, i.e. the relative rotation between R1 and R2
    R11 = dDOT44( R1, 0, R2, 0 ); R12 = dDOT44( R1, 0, R2, 1 ); R13 = dDOT44( R1, 0, R2, 2 );
    R21 = dDOT44( R1, 1, R2, 0 ); R22 = dDOT44( R1, 1, R2, 1 ); R23 = dDOT44( R1, 1, R2, 2 );
    R31 = dDOT44( R1, 2, R2, 0 ); R32 = dDOT44( R1, 2, R2, 1 ); R33 = dDOT44( R1, 2, R2, 2 );

    Q11 = Math.abs( R11 ); Q12 = Math.abs( R12 ); Q13 = Math.abs( R13 );
    Q21 = Math.abs( R21 ); Q22 = Math.abs( R22 ); Q23 = Math.abs( R23 );
    Q31 = Math.abs( R31 ); Q32 = Math.abs( R32 ); Q33 = Math.abs( R33 );

    // console.log( 'p1 = (' + p1.x + ', ' + p1.y + ', ' + p1.z + ')' );
    // console.log( 'R1 = [' + [ R1[0], R1[1], R1[2], R1[3], R1[4], R1[5], R1[6], R1[7], R1[8], R1[9], R1[10], R1[11] ] + ']' );
    // console.log( 'side1 = (' + side1.x + ', ' + side1.y + ', ' + side1.z + ')' );
    // console.log( 'p2 = (' + p2.x + ', ' + p2.y + ', ' + p2.z + ')' );
    // console.log( 'R2 = [' + [ R2[0], R2[1], R2[2], R2[3], R2[4], R2[5], R2[6], R2[7], R2[8], R2[9], R2[10], R2[11] ] + ']' );
    // console.log( 'pp = (' + pp.x + ', ' + pp.y + ', ' + pp.z + ')' );
    // console.log( 'Q = [' + [ Q11, Q12, Q13, Q21, Q22, Q23, Q31, Q32, Q33 ] + ']' );

    // For all 15 possible separating axes:
    //
    // - see if the axis separates the boxes. if so, return 0.
    // - find the depth of the penetration along the separating axis (s2)
    // - if this is the largest depth so far, record it.
    //
    // The normal vector will be set to the separating axis with the smallest
    // depth. Note: `normalR` is set to point to a column of `R1` or `R2` if
    // that is the smallest depth normal so far. Otherwise `normalR.matrix` is
    // `null` and `normalC` is set to a vector relative to body 1.
    // `invert_normal` is `true` if the sign of the normal should be flipped.

    var TST = function( expr1, expr2, normMatrix, normIndex, cc ) {
      s2 = Math.abs( expr1 ) - expr2;
      if ( s2 > 0 ) { return 0; }
      if ( s2 > s ) {
        s = s2;
        normalR.matrix = normMatrix;
        normalR.index = normIndex;
        invert_normal = expr1 < 0;
        code = cc;
      }
    };

    s = -Infinity;
    invert_normal = false;
    code = 0;

    var tstRet;

    // separating axis = u1, u2, u3
    tstRet = TST( pp[0], ( A[0] + B[0] * Q11 + B[1] * Q12 + B[2] * Q13 ), R1, 0, 1 );
    if ( tstRet !== undefined ) { return tstRet; }
    tstRet = TST( pp[1], ( A[1] + B[0] * Q21 + B[1] * Q22 + B[2] * Q23 ), R1, 1, 2 );
    if ( tstRet !== undefined ) { return tstRet; }
    tstRet = TST( pp[2], ( A[2] + B[0] * Q31 + B[1] * Q32 + B[2] * Q33 ), R1, 2, 3 );
    if ( tstRet !== undefined ) { return tstRet; }

    // separating axis = v1, v2, v3
    tstRet = TST( dDOT41( R2, 0, p ), A[0] * Q11 + A[1] * Q21 + A[2] * Q31 + B[0], R2, 0, 4 );
    if ( tstRet !== undefined ) { return tstRet; }
    tstRet = TST( dDOT41( R2, 1, p ), A[0] * Q12 + A[1] * Q22 + A[2] * Q32 + B[1], R2, 1, 5 );
    if ( tstRet !== undefined ) { return tstRet; }
    tstRet = TST( dDOT41( R2, 2, p ), A[0] * Q13 + A[1] * Q23 + A[2] * Q33 + B[2], R2, 2, 6 );
    if ( tstRet !== undefined ) { return tstRet; }

    // Note: cross product axes need to be scaled when s is computed.
    // normal (n1, n2, n3) is relative to box 1.
    TST = function( expr1, expr2, n1, n2, n3, cc ) {
      s2 = Math.abs( expr1 ) - expr2;
      if ( s2 > Bump.SIMD_EPSILON ) { return 0; }
      l = Math.sqrt( n1 * n1 + n2 * n2 + n3 * n3 );
      if ( l > Bump.SIMD_EPSILON ) {
        s2 /= l;
        if ( s2 * fudge_factor > s ) {
          s = s2;
          normalR.matrix = null;
          normalC.x = n1 / l;
          normalC.y = n2 / l;
          normalC.z = n3 / l;
          invert_normal = expr1 < 0;
          code = cc;
        }
      }
    };

    var fudge2 = 1.0e-5;

    Q11 += fudge2;
    Q12 += fudge2;
    Q13 += fudge2;

    Q21 += fudge2;
    Q22 += fudge2;
    Q23 += fudge2;

    Q31 += fudge2;
    Q32 += fudge2;
    Q33 += fudge2;

    // separating axis = u1 x (v1, v2, v3)
    tstRet = TST( pp[2] * R21 - pp[1] * R31, A[1] * Q31 + A[2] * Q21 + B[1] * Q13 + B[2] * Q12, 0, -R31, R21, 7 );
    if ( tstRet !== undefined ) { return tstRet; }
    tstRet = TST( pp[2] * R22 - pp[1] * R32, A[1] * Q32 + A[2] * Q22 + B[0] * Q13 + B[2] * Q11, 0, -R32, R22, 8 );
    if ( tstRet !== undefined ) { return tstRet; }
    tstRet = TST( pp[2] * R23 - pp[1] * R33, A[1] * Q33 + A[2] * Q23 + B[0] * Q12 + B[1] * Q11, 0, -R33, R23, 9 );
    if ( tstRet !== undefined ) { return tstRet; }

    // separating axis = u2 x (v1, v2, v3)
    tstRet = TST( pp[0] * R31 - pp[2] * R11, A[0] * Q31 + A[2] * Q11 + B[1] * Q23 + B[2] * Q22, R31, 0, -R11, 10 );
    if ( tstRet !== undefined ) { return tstRet; }
    tstRet = TST( pp[0] * R32 - pp[2] * R12, A[0] * Q32 + A[2] * Q12 + B[0] * Q23 + B[2] * Q21, R32, 0, -R12, 11 );
    if ( tstRet !== undefined ) { return tstRet; }
    tstRet = TST( pp[0] * R33 - pp[2] * R13, A[0] * Q33 + A[2] * Q13 + B[0] * Q22 + B[1] * Q21, R33, 0, -R13, 12 );
    if ( tstRet !== undefined ) { return tstRet; }

    // separating axis = u3 x (v1, v2, v3)
    tstRet = TST( pp[1] * R11 - pp[0] * R21, A[0] * Q21 + A[1] * Q11 + B[1] * Q33 + B[2] * Q32, -R21, R11, 0, 13 );
    if ( tstRet !== undefined ) { return tstRet; }
    tstRet = TST( pp[1] * R12 - pp[0] * R22, A[0] * Q22 + A[1] * Q12 + B[0] * Q33 + B[2] * Q31, -R22, R12, 0, 14 );
    if ( tstRet !== undefined ) { return tstRet; }
    tstRet = TST( pp[1] * R13 - pp[0] * R23, A[0] * Q23 + A[1] * Q13 + B[0] * Q32 + B[1] * Q31, -R23, R13, 0, 15 );
    if ( tstRet !== undefined ) { return tstRet; }

    if ( code === 0 ) { return 0; }

    // if we get to this point, the boxes interpenetrate. compute the normal
    // in global coordinates.
    if ( normalR.matrix !== null ) {
      var normR = normalR.matrix,
          normRIdx = normalR.index;
      normal.x = normR[ normRIdx     ];
      normal.y = normR[ normRIdx + 4 ];
      normal.z = normR[ normRIdx + 8 ];
    } else {
      dMULTIPLY0_331( normal, R1, normalC );
    }

    if ( invert_normal ) {
      normal.x = -normal.x;
      normal.y = -normal.y;
      normal.z = -normal.z;
    }
    depth.value = -s;

    // Compute contact point(s)
    if ( code > 6 ) {
      // An edge from box 1 touches an edge from box 2.
      // Find a point `pa` on the intersecting edge of box 1.
      pa = tmpBBpa.setValue( 0, 0, 0 );
      var sign;
      pa.x = p1.x; pa.y = p1.y; pa.z = p1.z;
      for ( j = 0; j < 3; ++j ) {
        sign = ( dDOT14( normal, j, 0 ) > 0 ) ? 1 : -1;

        pa.x += sign * A[j] * R1[     j ];
        pa.y += sign * A[j] * R1[ 4 + j ];
        pa.z += sign * A[j] * R1[ 8 + j ];
      }

      // Find a point `pb` on the intersecting edge of box 2.
      pb = tmpBBpb.setValue( 0, 0, 0 );
      pb.x = p2.x; pb.y = p2.y; pb.z = p2.z;
      for ( j = 0; j < 3; ++j ) {
        sign = ( dDOT14( normal, j, 0 ) > 0 ) ? -1 : 1;

        pb.x += sign * B[j] * R1[     j ];
        pb.y += sign * B[j] * R1[ 4 + j ];
        pb.z += sign * B[j] * R1[ 8 + j ];
      }

      var alpha = { value: 0 }, beta = { value: 0 },
          ua = tmpBBua.setValue( 0, 0, 0 ),
          ub = tmpBBub.setValue( 0, 0, 0 );

      tmp = ~~(( code - 7 ) / 3);
      ua.x = R1[ tmp     ];
      ua.y = R1[ tmp + 4 ];
      ua.z = R1[ tmp + 8 ];

      tmp = ( code - 7 ) % 3;
      ub.x = R2[ tmp     ];
      ub.y = R2[ tmp + 4 ];
      ub.z = R2[ tmp + 8 ];

      dLineClosestApproach( pa, ua, pb, ub, alpha, beta );

      tmp = alpha.value;
      pa.x += ua.x * tmp;
      pa.y += ua.y * tmp;
      pa.z += ua.z * tmp;

      tmp = beta.value;
      pb.x += ub.x * tmp;
      pb.y += ub.y * tmp;
      pb.z += ub.z * tmp;

      output.addContactPoint( normal.negate( tmpBBVec1 ), pb, -depth.value );

      return_code.value = code;

      return 1;
    }

    // Okay, we have a face-something intersection (because the separating
    // axis is perpendicular to a face). Define face 'a' to be the reference
    // face (i.e. the normal vector is perpendicular to this) and face 'b' to be
    // the incident face (the closest face of the other box).

    var Ra, Rb, Sa, Sb;
    if ( code <= 3 ) {
      Ra = R1;
      Rb = R2;
      pa = p1;
      pb = p2;
      Sa = A;
      Sb = B;
    } else {
      Ra = R2;
      Rb = R1;
      pa = p2;
      pb = p1;
      Sa = B;
      Sb = A;
    }

    // `nr` = normal vector of reference face dotted with axes of incident box.
    // `anr` = absolute values of nr.
    var normal2 = tmpBBnormal2.setValue( 0, 0, 0 ),
        nr = tmpBBnr.setValue( 0, 0, 0 ),
        anr = tmpBBanr.setValue( 0, 0, 0 );
    if ( code <= 3 ) {
      normal2.x = normal.x;
      normal2.y = normal.y;
      normal2.z = normal.z;
    } else {
      normal2.x = -normal.x;
      normal2.y = -normal.y;
      normal2.z = -normal.z;
    }
    dMULTIPLY1_331( nr, Rb, normal2 );
    anr.x = Math.abs( nr.x );
    anr.y = Math.abs( nr.y );
    anr.z = Math.abs( nr.z );

    // Find the largest compontent of `anr`: this corresponds to the normal
    // for the indident face. The other axis numbers of the indicent face
    // are stored in `a1`, `a2`.
    var lanr = 0, a1 = 0, a2 = 0;
    if ( anr.y > anr.x ) {
      if ( anr.y > anr.z ) {
        a1 = 0;
        lanr = 1;
        a2 = 2;
      } else {
        a1 = 0;
        a2 = 1;
        lanr = 2;
      }
    } else {
      if ( anr.x > anr.z ) {
        lanr = 0;
        a1 = 1;
        a2 = 2;
      } else {
        a1 = 0;
        a2 = 1;
        lanr = 2;
      }
    }

    // Compute center point of incident face, in reference-face coordinates.
    var center = tmpBBcenter.setValue( 0, 0, 0 );
    if ( nr[ lanr ] < 0 ) {
      center.x = pb.x - pa.x + Sb[ lanr ] * Rb[     lanr ];
      center.y = pb.y - pa.y + Sb[ lanr ] * Rb[ 4 + lanr ];
      center.z = pb.z - pa.z + Sb[ lanr ] * Rb[ 8 + lanr ];
    } else {
      center.x = pb.x - pa.x - Sb[ lanr ] * Rb[     lanr ];
      center.y = pb.y - pa.y - Sb[ lanr ] * Rb[ 4 + lanr ];
      center.z = pb.z - pa.z - Sb[ lanr ] * Rb[ 8 + lanr ];
    }

    // Find the normal and non-normal axis numbers of the reference box.
    var codeN = 0, code1 = 0, code2 = 0;
    if ( code <= 3 ) { codeN = code - 1; } else { codeN = code - 4; }
    if ( codeN === 0 ) {
      code1 = 1;
      code2 = 2;
    } else if ( codeN === 1 ) {
      code1 = 0;
      code2 = 2;
    } else {
      code1 = 0;
      code2 = 1;
    }

    // Find the four corners of the incident face, in reference-face coordinates.

    // `quad` is the 2D coordinate of incident face (x,y pairs).
    var quad = new Array( 8 ),
        c1, c2, m11, m12, m21, m22;
    c1 = dDOT14( center, Ra, code1 );
    c2 = dDOT14( center, Ra, code2 );
    // optimize this? - we have already computed this data above, but it is not
    // stored in an easy-to-index format. for now it's quicker just to recompute
    // the four dot products.
    m11 = dDOT44( Ra, code1, Rb, a1 );
    m12 = dDOT44( Ra, code1, Rb, a2 );
    m21 = dDOT44( Ra, code2, Rb, a1 );
    m22 = dDOT44( Ra, code2, Rb, a2 );

    var k1 = m11 * Sb[ a1 ],
        k2 = m21 * Sb[ a1 ],
        k3 = m12 * Sb[ a2 ],
        k4 = m22 * Sb[ a2 ];
    quad[0] = c1 - k1 - k3;
    quad[1] = c2 - k2 - k4;
    quad[2] = c1 - k1 + k3;
    quad[3] = c2 - k2 + k4;
    quad[4] = c1 + k1 + k3;
    quad[5] = c2 + k2 + k4;
    quad[6] = c1 + k1 - k3;
    quad[7] = c2 + k2 - k4;

    // find the size of the reference face
    var rect = [ 0, 0 ];
    rect[0] = Sa[ code1 ];
    rect[1] = Sa[ code2 ];

    // intersect the incident and reference faces
    var ret = new Array( 16 ),
        n = intersectRectQuad2( rect, quad, ret );

    if ( n < 1 ) {
      // This should never happen.
      // console.log( 'This should never happen.' );
      return 0;
    }

    // Convert the intersection points into reference-face coordinates,
    // and compute the contact position and depth for each point. Only keep
    // those points that have a positive (penetrating) depth. Delete points in
    // the `ret` array as necessary so that `point` and `ret` correspond.

    // Penetrating contact points.
    var point = new Array( 3 * 8 );
    // Depths for those points.
    var dep = new Array( 8 ),
        det1 = 1 / ( m11 * m22 - m12 * m21 );
    m11 *= det1;
    m12 *= det1;
    m21 *= det1;
    m22 *= det1;

    // Number of penetrating contact points found.
    var cnum = 0;
    for ( j = 0; j < n; ++j ) {
      tmp = j * 2;
      k1 =  m22 * ( ret[ tmp ] - c1 ) - m12 * ( ret[ tmp + 1 ] - c2 );
      k2 = -m21 * ( ret[ tmp ] - c1 ) + m11 * ( ret[ tmp + 1 ] - c2 );

      tmp = cnum * 3;
      point[ tmp     ] = center.x + k1 * Rb[     a1 ] + k2 * Rb[     a2 ];
      point[ tmp + 1 ] = center.y + k1 * Rb[ 4 + a1 ] + k2 * Rb[ 4 + a2 ];
      point[ tmp + 2 ] = center.z + k1 * Rb[ 8 + a1 ] + k2 * Rb[ 8 + a2 ];

      dep[ cnum ] = Sa[ codeN ] - dDOTVA( normal2, point, tmp );
      if ( dep[ cnum ] >= 0 ) {
        ret[ cnum * 2    ] = ret[ j * 2     ];
        ret[ cnum * 2 + 1] = ret[ j * 2 + 1 ];
        ++cnum;
      }
    }

    if ( cnum < 1 ) {
      // This should never happen.
      // console.log( 'This should never happen.' );
      return 0;
    }

    // We can't generate more contacts than we actually have.
    if ( maxc > cnum ) { maxc = cnum; }
    if ( maxc < 1 ) { maxc = 1; }

    if ( cnum <= maxc ) {
      var pointInWorld = tmpBBpointInWorld.setValue( 0, 0, 0 );
      if ( code < 4 ) {
        // We have less contacts than we need, so we use them all.
        for ( j = 0; j < cnum; ++j ) {
          tmp = j * 3;
          pointInWorld.x = point[ tmp     ] + pa.x;
          pointInWorld.y = point[ tmp + 1 ] + pa.y;
          pointInWorld.z = point[ tmp + 2 ] + pa.z;

          output.addContactPoint( normal.negate( tmpBBVec1 ), pointInWorld, -dep[j] );
        }
      } else {
        // We have less contacts than we need, so we use them all.
        for ( j = 0; j < cnum; ++j ) {
          tmp = j * 3;
          pointInWorld.x = point[ tmp     ] + pa.x - normal.x * dep[j];
          pointInWorld.y = point[ tmp + 1 ] + pa.y - normal.y * dep[j];
          pointInWorld.z = point[ tmp + 2 ] + pa.z - normal.z * dep[j];
          output.addContactPoint( normal.negate( tmpBBVec1 ), pointInWorld , -dep[j] );
        }
      }
    } else {
      // We have more contacts than are wanted, some of them must be culled.
      // Find the deepest point, it is always the first contact.
      var i1 = 0,
          maxdepth = dep[0];
      for ( i = 1; i < cnum; ++i ) {
        if ( dep[i] > maxdepth ) {
          maxdepth = dep[i];
          i1 = i;
        }
      }

      var iret = new Array( 8 );
      cullPoints2( cnum, ret, maxc, i1, iret );

      for ( j = 0; j < maxc; ++j ) {
        var posInWorld = tmpBBposInWorld;

        tmp = iret[j] * 3;
        posInWorld.x = point[ tmp     ] + pa.x;
        posInWorld.y = point[ tmp + 1 ] + pa.y;
        posInWorld.z = point[ tmp + 2 ] + pa.z;

        tmp = dep[ iret[j] ];
        if ( code < 4 ) {
          output.addContactPoint( normal.negate( tmpBBVec1 ), posInWorld, -tmp );
        } else {
          output.addContactPoint( normal.negate( tmpBBVec1 ), posInWorld.subtract( normal.multiplyScalar( tmp, tmpBBVec2 ), tmpBBVec2 ), -tmp );
        }
      }
      cnum = maxc;
    }

    return_code.value = code;
    return cnum;
  };

  Bump.BoxBoxDetector = Bump.type({
    parent: Bump.DiscreteCollisionDetectorInterface,

    init: function BoxBoxDetector( box1, box2 ) {
      this._super();

      this.box1 = box1;
      this.box2 = box2;
      return this;
    },

    members: {
      clone: function( dest ) {
        dest = dest || Bump.BoxBoxDetector.create();

        dest.box1 = this.box1;
        dest.box2 = this.box2;
        return dest;
      },

      assign: function( other ) {
        this.box1 = other.box1;
        this.box2 = other.box2;
        return this;
      },

      destruct: function() {
        this._super();
      },

      getClosestPoints: function( input, output, debugDraw, swapResults ) {
        var transformA = input.transformA,
            transformB = input.transformB;

        var skip = 0,
            contact = null;

        var R1 = dMatrix3.create(),
            R2 = dMatrix3.create();

        for ( var j = 0; j < 3; ++j ) {
          R1[ 0 + 4 * j ] = transformA.basis[j].x;
          R2[ 0 + 4 * j ] = transformB.basis[j].x;

          R1[ 1 + 4 * j ] = transformA.basis[j].y;
          R2[ 1 + 4 * j ] = transformB.basis[j].y;

          R1[ 2 + 4 * j ] = transformA.basis[j].z;
          R2[ 2 + 4 * j ] = transformB.basis[j].z;
        }

        var normal      = tmpGCPVec1.setValue( 0, 0, 0 ),
            depth       = { value: 0 },
            return_code = { value: 0 },
            maxc        = 4;

        var num = dBoxBox2(
          transformA.origin,
          R1,
          this.box1.getHalfExtentsWithMargin( tmpGCPVec2 ).multiplyScalar( 2, tmpGCPVec2 ),
          transformB.origin,
          R2,
          this.box2.getHalfExtentsWithMargin( tmpGCPVec3 ).multiplyScalar( 2, tmpGCPVec3 ),
          normal, depth, return_code,
          maxc, contact, skip,
          output
        );
        // console.log( num );
      }

    }
  });

})( this, this.Bump );
