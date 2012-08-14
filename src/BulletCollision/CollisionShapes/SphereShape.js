// load: bump.js
// load: BulletCollision/CollisionShapes/ConvexInternalShape.js

// run: LinearMath/Vector3.js
// run: BulletCollision/BroadphaseCollision/BroadphaseProxy.js

(function( window, Bump ) {

  var tmpV1 = Bump.Vector3.create();

  Bump.SphereShape = Bump.type({
    parent: Bump.ConvexInternalShape,

    init: function SphereShape( radius ) {
      this._super();

      this.shapeType = Bump.BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE;
      this.implicitShapeDimensions.x = radius;
      this.collisionMargin = radius;
      return this;
    },

    members: {
      // !!!: added for fast, easy initialization of recycled SphereShapes
      set: function( other ) {
        // !!!: unroll the calls to super for performance
        // from CollisionShape:
        this.userPointer = other.userPointer;

        // nothing from ConvexShape

        // from ConvexInternalShape:
        this.localScaling.assign( other.localScaling );

        this.shapeType = other.shapeType;
        this.implicitShapeDimensions.x = other.implicitShapeDimensions.x;
        this.collisionMargin = other.collisionMargin;

        return this;
      },

      clone: function( dest ) {
        dest = dest || Bump.SphereShape.create( this.collisionMargin );

        this._super( dest );
        return dest;
      },

      localGetSupportingVertex: function( vec, dest ) {
        dest = dest || Bump.Vector3.create();

        var supVertex = dest;
        supVertex = this.localGetSupportingVertexWithoutMargin( vec, supVertex );

        var vecnorm = vec.clone( tmpV1 );
        if ( vecnorm.length2() < Bump.SIMD_EPSILON * Bump.SIMD_EPSILON ) {
          vecnorm.setValue( -1, -1, -1 );
        }
        vecnorm.normalize();
        supVertex.addSelf( vecnorm.multiplyScalar( this.getMargin(), tmpV1 ) );
        return supVertex;
      },

      localGetSupportingVertexWithoutMargin: function( vec, dest ) {
        if ( dest ) {
          return dest.setValue( 0, 0, 0 );
        }

        return Bump.Vector3.create( 0, 0, 0 );
      },

      batchedUnitVectorGetSupportingVertexWithoutMargin: function( vectors, supportVerticesOut, numVectors ) {
        for ( var i = 0; i < numVectors; ++i ) {
          supportVerticesOut[i].setValue( 0, 0, 0 );
        }
      },

      calculateLocalInertia: function( mass, inertia ) {
        var elem = 0.4 * mass * this.getMargin() * this.getMargin();
        inertia.setValue( elem, elem, elem );
      },

      getAabb: function( t, aabbMin, aabbMax ) {
        var center = t.origin;
        var myMargin = this.getMargin();
        var extent = Bump.Vector3.create( myMargin, myMargin, myMargin );
        aabbMin = center.subtract( extent, aabbMin );
        aabbMax = center.add( extent, aabbMax );
      },

      getRadius: function() {
        return this.implicitShapeDimensions.x * this.localScaling.x;
      },

      setUnscaledRadius: function( radius ) {
        this.implicitShapeDimensions.x = radius;
        Bump.ConvexInternalShape.prototype.setMargin.apply( this, [ radius ] );
      },

      getName: function() { return 'SPHERE'; },

      setMargin: function( margin ) {
        this._super( margin );
      },

      getMargin: function() {
        // To improve GJK behaviour, use radius + margin as the full margin, so
        // never get into the penetration case. This means, non-uniform scaling
        // is not supported anymore.
        return this.getRadius();
      }

    }
  });

})( this, this.Bump );
