// load: bump.js

// run: LinearMath/Vector3.js
// run: LinearMath/Transform.js

(function( window, Bump ) {

  Bump.DiscreteCollisionDetectorInterface = Bump.type({
    init: function DiscreteCollisionDetectorInterface() {},
    typeMembers: {
      Result: Bump.type({
        init: function Result() {},
        members: {
          setShapeIdentifiersA: Bump.abstract,
          setShapeIdentifiersB: Bump.abstract,
          addContactPoint: Bump.abstract
        }
      }),

      ClosestPointInput: Bump.type({
        init: function ClosestPointInput() {
          this.transformA = Bump.Transform.create();
          this.transformB = Bump.Transform.create();
          this.maximumDistanceSquared = Infinity;
          this.stackAlloc = null;
        }
      })
    },

    members: {
      clone: function( dest ) {
        dest = dest || Bump.DiscreteCollisionDetectorInterface.create();
        return dest;
      },

      assign: function( other ) {
        return this;
      },

      destruct: Bump.noop,
      getClosestPoints: Bump.abstract
    }
  });

  Bump.StorageResult = Bump.type({
    parent: Bump.DiscreteCollisionDetectorInterface.Result,
    init: function StorageResult() {
      this._super();

      this.normalOnSurfaceB = Bump.Vector3.create();
      this.closestPointInB = Bump.Vector3.create();
      // Negative values for distance mean penetration.
      this.distance = Infinity;
    },

    members: {
      addContactPoint: function( normalOnBInWorld, pointInWorld, depth ) {
        if ( depth < this.distance ) {
          this.normalOnSurfaceB.assign( normalOnBInWorld );
          this.closestPointInB.assign( pointInWorld );
          this.distance = depth;
        }
      }
    }
  });

})( this, this.Bump );
