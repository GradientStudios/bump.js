// load: bump.js
// load: BulletCollision/CollisionShapes/TriangleCallback.js

// run: LinearMath/Vector3.js

(function( window, Bump ) {

  Bump.TriangleRaycastCallback = Bump.type({
    parent: Bump.TriangleCallback,

    init: function TriangleRaycastCallback( from, to, flags ) {
      this.from = from.clone(); // Vector3
      this.to = to.clone();     // Vector3
      this.flags = flags || 0;  // unsigned integer
      this.hitFraction = 1;
    },

    members: {
      processTriangle: function(
        triangle, // originally btVector3*, ported as array
        partId,
        triangleIndex
      ) {
        var vert0 = triangle[0];
        var vert1 = triangle[1];
        var vert2 = triangle[2];

        var v10 = vert1.subtract( vert0 );
        var v20 = vert2.subtract( vert0 );

        var triangleNormal = v10.cross( v20 );

        var dist = vert0.dot( triangleNormal );
        var dist_a = triangleNormal.dot( this.from ) ;
        dist_a -= dist;
        var dist_b = triangleNormal.dot( this.to );
        dist_b -= dist;

        if ( dist_a * dist_b >= 0 ) {
          return; // same sign
        }

        //@BP Mod - Backface filtering
        var EFlags = Bump.TriangleRaycastCallback.EFlags;
        if (( ( this.flags & EFlags.kF_FilterBackfaces ) !== 0 ) && ( dist_a > 0 )) {
          // Backface, skip check
          return;
        }

        var proj_length = dist_a - dist_b;
        var distance = dist_a / proj_length;

        // Now we have the intersection point on the plane, we'll see if it's inside the triangle
        // Add an epsilon as a tolerance for the raycast,
        // in case the ray hits exacly on the edge of the triangle.
        // It must be scaled for the triangle size.

        if ( distance < this.hitFraction ) {

          var edge_tolerance = triangleNormal.length2();
          edge_tolerance *= -0.0001;
          var point = Bump.Vector3.create().setInterpolate3( this.from, this.to, distance );

          var v0p = vert0.subtract( point );
          var v1p = vert1.subtract( point );
          var cp0 = v0p.cross( v1p );

          if ( cp0.dot( triangleNormal ) >= edge_tolerance ) {
            var v2p = vert2.subtract( point );
            var cp1 = v1p.cross( v2p );
            if ( cp1.dot( triangleNormal ) >= edge_tolerance ) {
              var cp2 = v2p.cross( v0p );

              if ( cp2.dot( triangleNormal) >= edge_tolerance ) {
                //@BP Mod
                // Triangle normal isn't normalized
                triangleNormal.normalize();

                //@BP Mod - Allow for unflipped normal when raycasting against backfaces
                if ( (( this.flags & EFlags.kF_KeepUnflippedNormal ) !== 0 ) || (dist_a <= 0) ) {
                  this.hitFraction = this.reportHit( triangleNormal.negate(),
                                                     distance, partId, triangleIndex );
                } else {
                  this.hitFraction = this.reportHit( triangleNormal, distance, partId, triangleIndex );
                }
              }
            }
          }
        }
      },

      reportHit: Bump.abstract
    },

    typeMembers: {
      EFlags: Bump.Enum([
        { id: 'kF_None', value: 0 },
        { id: 'kF_FilterBackfaces', value: 1 << 0 },
        { id: 'kF_KeepUnflippedNormal', value: 1 << 1 }, // Prevents returned face normal getting flipped when a ray hits a back-facing triangle
        { id: 'kF_Terminator', value: 0xFFFFFFFF }
      ])
    }

  });

})( this, this.Bump );
