(function( window, Bump ) {

  Bump.BoxBoxCollisionAlgorithm = Bump.type({
    parent: Bump.ActivatingCollisionAlgorithm,

    members: {
      init: function BoxBoxCollisionAlgorithm( ci ) {
        this._super( ci );

        this.ownManifold = false;
        this.manifoldPtr = null;
        return this;
      },

      initWithManifold: function BoxBoxCollisionAlgorithm( mf, ci, obj0, obj1 ) {
        this._super( ci, obj0, obj1 );
        this.ownManifold = false;
        this.manifoldPtr = mf;

        if ( this.manifoldPtr === null && this.dispatcher.needsCollision( obj0, obj1 ) ) {
          this.manifoldPtr = this.dispatcher.getNewManifold( obj0, obj1 );
          this.ownManifold = true;
        }
        return this;
      },

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

      destruct: function() {
        if ( this.ownManifold ) {
          if ( this.manifoldPtr !== null ) {
            this.dispatcher.releaseManifold( this.manifoldPtr );
          }
        }

        this._super();
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
      },

      calculateTimeOfImpact: function() {
        // Not yet.
        return 1;
      },

      getAllContactManifolds: function( manifoldArray ) {
        if ( this.manifoldPtr && this.ownManifold ) {
          manifoldArray.push( this.manifoldPtr );
        }
      }

    },

    typeMembers: {
      create: function( a, b, c, d ) {
        var ca = Object.create( Bump.BoxBoxCollisionAlgorithm.prototype );
        if ( b === undefined ) {
          return ca.init( a );
        }

        return ca.initWithManifold( a, b, c, d );
      },

      CreateFunc: Bump.type({
        parent: Bump.CollisionAlgorithmCreateFunc,
        members: {
          CreateCollisionAlgorithm: function( ci, body0, body1 ) {
            return Bump.BoxBoxCollisionAlgorithm.create( null, ci, body0, body1 );
          }
        }
      })
    }
  });

})( this, this.Bump );
