(function( window, Bump ) {

  Bump.BoxBoxCollisionAlgorithm = Bump.type({
    parent: Bump.ActivatingCollisionAlgorithm,

    init: function BoxBoxCollisionAlgorithm( ci ) {
      this._super( ci );

      this.ownManifold = false;
      this.manifoldPtr = null;
      return this;
    },

    members: {
      clone: function( dest ) {
        dest = dest || Bump.BoxBoxCollisionAlgorithm.create();

        this._super( dest );

        dest.ownManifold = this.ownManifold;
        dest.manifoldPtr = this.manifoldPtr;

        return dest;
      },

      assign: function( other ) {
        this._super( other );

        this.ownManifold = other.ownManifold;
        this.manifoldPtr = other.manifoldPtr;

        return this;
      },

      processCollision: function( body0, body1, dispatchInfo, resultOut ) {
        if ( this.manifoldPtr === null ) {
          return;
        }

        var col0 = body0,
            col1 = body1,
            box0 = col0.getCollisionShape(),
            box1 = col1.getCollisionShape();

        // Report a contact. Internally this will be kept persistent, and
        // contact reduction is done.
        resultOut.setPersistentManifold( this.manifoldPtr );

        var input = Bump.DiscreteCollisionDetectorInterface.ClosestPointInput.create();
        input.maximumDistanceSquared = Infinity;
        input.transformA.assign( body0.getWorldTransform() );
        input.transformB.assign( body1.getWorldTransform() );

        var detector = Bump.BoxBoxDetector.create( box0, box1 );
        detector.getClosestPoints( input, resultOut, dispatchInfo.debugDraw );

        // `refreshContactPoints` is only necessary when using persistent
        // contact points. Otherwise all points are newly added.
        if ( this.ownManifold ) {
          resultOut.refreshContactPoints();
        }
      }

    }
  });

})( this, this.Bump );
