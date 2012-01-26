(function( window, Bump ) {

  Bump.CollisionAlgorithmConstructionInfo = Bump.type({
    members: {
      init: function CollisionAlgorithmConstructionInfo() {
        this.dispatcher1 = null;
        this.manifold = null;
      },

      initWithDispatcher: function CollisionAlgorithmConstructionInfo( dispatcher ) {
        this.dispatcher1 = dispatcher;
        this.manifold = null;
      },

      clone: function( dest ) {
        dest = dest || Bump.CollisionAlgorithmConstructionInfo.create();

        dest.dispatcher1 = this.dispatcher1;
        dest.manifold = this.manifold;
        return dest;
      },

      assign: function( other ) {
        this.dispatcher1 = other.dispatcher1;
        this.manifold = other.manifold;
        return this;
      }
    },

    typeMembers: {
      create: function( dispatcher ) {
        var ci = Object.create( Bump.CollisionAlgorithmConstructionInfo.prototype );
        if ( arguments.length ) {
          ci.initWithDispatcher( dispatcher );
        } else {
          ci.init();
        }
        return ci;
      }
    }
  });

  Bump.CollisionAlgorithm = Bump.type({
    members: {
      init: function CollisionAlgorithm() {
        this.dispatcher = null;
        return this;
      },

      initWithInfo: function CollisionAlgorithm( ci ) {
        this.dispatcher = ci.dispatcher1;
        return this;
      },

      clone: function( dest ) {
        dest = dest || Bump.CollisionAlgorithm.create();
        dest.dispatcher = this.dispatcher;
        return dest;
      },

      assign: function( other ) {
        this.dispatcher = other.dispatcher;
        return this;
      },

      destruct: Bump.noop,
      processCollision: Bump.abstract,
      calculateTimeOfImpact: Bump.abstract,
      getAllContactManifolds: Bump.abstract
    },

    typeMembers: {
      create: function( info ) {
        var ca = Object.create( Bump.CollisionAlgorithm.prototype );
        if ( arguments.length ) {
          return ca.initWithInfo( info );
        }

        return ca.init();
      }
    }
  });

})( this, this.Bump );
