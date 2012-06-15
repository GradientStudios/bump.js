// load: bump.js
// load: LinearMath/Vector3.js
// load: BulletCollision/NarrowPhaseCollision/ManifoldPoint.js
// load: BulletCollision/NarrowPhaseCollision/DiscreteCollisionDetectorInterface.js

// run: LinearMath/Transform.js
// run: BulletCollision/CollisionDispatch/CollisionObject.js

(function( window, Bump ) {
  // Temporary "stack" variables.
  var tmpV1 = Bump.Vector3.create(),
      tmpV2 = Bump.Vector3.create(),
      tmpV3 = Bump.Vector3.create(),
      tmpMP1 = Bump.ManifoldPoint.create();

  var calculateCombinedFriction = function( body0, body1 ) {
    var friction = body0.getFriction() * body1.getFriction();

    var MAX_FRICTION = 10;
    if ( friction < -MAX_FRICTION ) {
      friction = -MAX_FRICTION;
      return friction;
    }

    if ( friction > MAX_FRICTION ) {
      friction = MAX_FRICTION;
      return friction;
    }

    return friction;
  };

  var calculateCombinedRestitution = function( body0, body1 ) {
    return body0.getRestitution() * body1.getRestitution();
  };

  Bump.gContactAddedCallback = null;

  Bump.ManifoldResult = Bump.type({
    parent: Bump.DiscreteCollisionDetectorInterface.Result,

    init: function ManifoldResult( body0, body1 ) {
      this._super();

      this.manifoldPtr = null;

      this.rootTransA = Bump.Transform.create();
      this.rootTransB = Bump.Transform.create();

      this.body0 = null;
      this.body1 = null;

      this.partId0 = 0;
      this.partId1 = 0;
      this.index0 = 0;
      this.index1 = 0;

      return this;
    },

    members: {
      initWithCollisionObjects: function( body0, body1 ) {
        Bump.DiscreteCollisionDetectorInterface.Result.prototype.init.apply( this, [] );

        this.manifoldPtr = null;

        this.rootTransA = Bump.Transform.create();
        this.rootTransB = Bump.Transform.create();

        this.body0 = body0;
        this.body1 = body1;

        this.partId0 = 0;
        this.partId1 = 0;
        this.index0 = 0;
        this.index1 = 0;

        this.rootTransA.assign( this.body0.getWorldTransform() );
        this.rootTransB.assign( this.body1.getWorldTransform() );

        return this;
      },

      clone: function( dest ) {
        dest = dest || Bump.ManifoldResult.create();

        dest.manifoldPtr = this.manifoldPtr;

        dest.rootTransA.assign( this.rootTransA );
        dest.rootTransB.assign( this.rootTransB );

        dest.body0 = this.body0;
        dest.body1 = this.body1;

        dest.partId0 = this.partId0;
        dest.partId1 = this.partId1;
        dest.index0 = this.index0;
        dest.index1 = this.index1;

        return dest;
      },

      assign: function( other ) {
        this.manifoldPtr = other.manifoldPtr;

        this.rootTransA.assign( other.rootTransA );
        this.rootTransB.assign( other.rootTransB );

        this.body0 = other.body0;
        this.body1 = other.body1;

        this.partId0 = other.partId0;
        this.partId1 = other.partId1;
        this.index0 = other.index0;
        this.index1 = other.index1;

        return this;
      },

      setPersistentManifold: function( manifoldPtr ) {
        this.manifoldPtr = manifoldPtr;
      },

      getPersistentManifold: function() {
        return this.manifoldPtr;
      },

      setShapeIdentifiersA: function( partId0, index0 ) {
        this.partId0 = partId0;
        this.index0 = index0;
      },

      setShapeIdentifiersB: function( partId1, index1 ) {
        this.partId1 = partId1;
        this.index1 = index1;
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      // - `tmpV3`
      // - `tmpMP1`
      addContactPoint: function( normalOnBInWorld, pointInWorld, depth ) {
        Bump.Assert( this.manifoldPtr !== null );

        // Order in manifold needs to match.
        if ( depth > this.manifoldPtr.getContactBreakingThreshold() ) {
          return;
        }

        var isSwapped = this.manifoldPtr.getBody0() !== this.body0;

        var pointA = pointInWorld
          .add( normalOnBInWorld.multiplyScalar( depth, tmpV1 ), tmpV1 );

        var localA = tmpV2, localB = tmpV3;

        if ( isSwapped ) {
          localA = this.rootTransB.invXform( pointA, tmpV2 );
          localB = this.rootTransA.invXform( pointInWorld, tmpV3 );
        } else {
          localA = this.rootTransA.invXform( pointA, tmpV2 );
          localB = this.rootTransB.invXform( pointInWorld, tmpV3 );
        }

        var newPt = tmpMP1.initWithContactPointInPlace( localA, localB, normalOnBInWorld, depth );
        newPt.positionWorldOnA.assign( pointA );
        newPt.positionWorldOnB.assign( pointInWorld );

        var insertIndex = this.manifoldPtr.getCacheEntry( newPt );

        newPt.combinedFriction = calculateCombinedFriction( this.body0, this.body1 );
        newPt.combinedRestitution = calculateCombinedRestitution( this.body0, this.body1 );

        // BP mod, store contact triangles.
        if ( isSwapped ) {
          newPt.partId0 = this.partId1;
          newPt.partId1 = this.partId0;
          newPt.index0  = this.index1;
          newPt.index1  = this.index0;
        } else {
          newPt.partId0 = this.partId0;
          newPt.partId1 = this.partId1;
          newPt.index0  = this.index0;
          newPt.index1  = this.index1;
        }

        // **TODO:** Check this for any side effects.
        if ( insertIndex >= 0 ) {
          this.manifoldPtr.replaceContactPoint( newPt, insertIndex );
        } else {
          insertIndex = this.manifoldPtr.addManifoldPoint( newPt );
        }

        if (
          // User can override friction and/or restitution.
          Bump.gContactAddedCallback !== null &&
            // And if either of the two bodies requires custom material
            ( ( this.body0.getCollisionFlags() & Bump.CollisionObject.CollisionFlags.CF_CUSTOM_MATERIAL_CALLBACK ) ||
              ( this.body1.getCollisionFlags() & Bump.CollisionObject.CollisionFlags.CF_CUSTOM_MATERIAL_CALLBACK ) )
        ) {
          // Experimental feature info, for per-triangle material etc.
          var obj0 = isSwapped? this.body1 : this.body0,
              obj1 = isSwapped? this.body0 : this.body1;
          Bump.gContactAddedCallback(
            this.manifoldPtr.getContactPoint( insertIndex ),
            obj0, newPt.partId0, newPt.index0,
            obj1, newPt.partId1, newPt.index1
          );
        }
      },

      refreshContactPoints: function() {
        Bump.Assert( this.manifoldPtr );
        if ( !( this.manifoldPtr.getNumContacts() ) ) {
          return;
        }

        var isSwapped = this.manifoldPtr.getBody0() !== this.body0;

        if ( isSwapped ) {
          this.manifoldPtr.refreshContactPoints( this.rootTransB, this.rootTransA );
        } else {
          this.manifoldPtr.refreshContactPoints( this.rootTransA, this.rootTransB );
        }
      },

      getBody0Internal: function() {
        return this.body0;
      },

      getBody1Internal: function() {
        return this.body1;
      }

    },

    typeMembers: {
      create: function( body0, body1 ) {
        var mr = Object.create( Bump.ManifoldResult.prototype );
        if ( arguments.length ) {
          mr.initWithCollisionObjects( body0, body1 );
        } else {
          mr.init();
        }
        return mr;
      }
    }
  });

})( this, this.Bump );
