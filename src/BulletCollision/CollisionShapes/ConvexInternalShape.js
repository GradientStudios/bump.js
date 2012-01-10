(function( window, Bump ) {
  Bump.CONVEX_DISTANCE_MARGIN = 0.04;

  var EPSILON = Math.pow( 2, -52 ),
      tmpV1 = Bump.Vector3.create(),
      tmpV2 = Bump.Vector3.create(),
      tmpV3 = Bump.Vector3.create(),
      tmpV4 = Bump.Vector3.create(),
      tmpV5 = Bump.Vector3.create(),
      tmpV6 = Bump.Vector3.create();

  Bump.ConvexInternalShape = Bump.type({
    parent: Bump.ConvexShape,

    init: function ConvexInternalShape() {
      this._super();

      this.localScaling = Bump.Vector3.create( 1, 1, 1 );
      this.implicitShapeDimensions = Bump.Vector3.create();
      this.collisionMargin = Bump.CONVEX_DISTANCE_MARGIN;
    },

    members: {
      clone: function( dest ) {
        dest = dest || Bump.ConvexInternalShape.create();
        dest = this._super( dest );

        this.localScaling.clone( dest.localScaling );
        this.implicitShapeDimensions.clone( dest.implicitShapeDimensions );
        dest.collisionMargin = this.collisionMargin;

        return dest;
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      // - `tmpV3`
      localGetSupportingVertex: function( vec, dest ) {
        dest = dest || Bump.Vector3.create();
        var supVertex = this.localGetSupportingVertexWithoutMargin( vec, tmpV1 );

        if ( this.getMargin() !== 0 ) {
          var vecnorm = vec.clone( tmpV2 );
          if ( vecnorm.length2() < EPSILON * EPSILON ) {
            vecnorm.setValue( -1, -1, -1 );
          }
          vecnorm.normalize();
          supVertex.addSelf( vecnorm.multiply( this.getMargin(), tmpV3 ) );
        }
        return supVertex.clone( dest );
      },

      getImplicitShapeDimensions: function() {
        return this.implicitShapeDimensions;
      },

      // **Warning:** Use `setImplicitShapeDimensions` with care.
      //
      // Changing a collision shape while the body is in the world is not
      // recommended, it is best to remove the body from the world, then make
      // the change, and re-add it. Alternatively flush the contact points, see
      // documentation for `cleanProxyFromPairs`
      setImplicitShapeDimensions: function( dimensions ) {
        this.implicitShapeDimensions = dimensions.clone( this.implicitShapeDimensions );
        return this;
      },

      setSafeMargin: function( minDimension, defaultMarginMultiplier ) {
        defaultMarginMultiplier =
          defaultMarginMultiplier === undefined ? 0.1 : defaultMarginMultiplier;

        var safeMargin = defaultMarginMultiplier * minDimension;
        if ( safeMargin < this.getMargin() ) {
          this.setMargin( safeMargin );
        }

        return this;
      },

      // See [this bug](http://code.google.com/p/bullet/issues/detail?id=349).
      // This margin check could could be added to other collision shapes too,
      // or add some assert/warning somewhere.
      setSafeMarginWithExtent: function( halfExtents, defaultMarginMultiplier ) {
        defaultMarginMultiplier =
          defaultMarginMultiplier === undefined ? 0.1 : defaultMarginMultiplier;

        var minDimension = halfExtents[ halfExtents.minAxis() ];
        return this.setSafeMargin( minDimension, defaultMarginMultiplier );
      },

      // `getAabb`'s default implementation is brute force. It is expected of
      // derived classes to implement a fast dedicated version.
      //
      // Uses the following temporary variables:
      //
      // - `tmpV1` ← `getAabbSlow`
      // - `tmpV2` ← `getAabbSlow`
      // - `tmpV3` ← `getAabbSlow`
      // - `tmpV4` ← `getAabbSlow`
      // - `tmpV5` ← `getAabbSlow`
      // - `tmpV6` ← `getAabbSlow`
      getAabb: function( t, aabbMin, aabbMax ) {
        return this.getAabbSlow( t, aabbMin, aabbMax );
      },

      // Uses the following temporary variables:
      //
      // - `tmpV4`
      // - `tmpV5`
      // - `tmpV6`
      // - `tmpV1` ← `localGetSupportingVertex`
      // - `tmpV2` ← `localGetSupportingVertex`
      // - `tmpV3` ← `localGetSupportingVertex`
      getAabbSlow: function( trans, minAabb, maxAabb ) {
        var margin = this.getMargin();
        for ( var i = 0; i < 3; ++i ) {
          var vec = tmpV4.setValue( 0, 0, 0 );
          vec[i] = 1;

          // `vec * trans.basis`
          var sv = this.localGetSupportingVertex(
            trans.basis.vectorMultiply( vec, tmpV5 ),
            tmpV5
          );

          var tmp = trans.transform( sv, tmpV6 );
          maxAabb[i] = tmp[i] + margin;
          vec[i] = -1;
          tmp = trans.transform(
            this.localGetSupportingVertex( trans.basis.vectorMultiply( vec ) ),
            tmpV6
          );
          minAabb[i] = tmp[i] - margin;
        }

        return this;
      },

      setLocalScaling: function( scaling ) {
        this.localScaling = scaling.absolute( this.scaling );
        return this;
      },

      getLocalScaling: function() {
        return this.localScaling;
      },

      getLocalScalingNV: function() {
        return this.localScaling;
      },

      setMargin: function( margin ) {
        this.collisionMargin = margin;
        return this;
      },

      getMargin: function() {
        return this.collisionMargin;
      },

      getMarginNV: function() {
        return this.collisionMargin;
      },

      getNumPreferredPenetrationDirections: function() {
        return 0;
      },

      getPreferredPenetrationDirection: function( index, penetrationVector ) {
        // `btAssert( 0 );`
        return this;
      }

    }
  });
})( this, this.Bump );
