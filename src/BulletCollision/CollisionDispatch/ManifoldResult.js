(function( window, Bump ) {

  Bump.ManifoldResult = Bump.type({
    parent: Bump.DiscreteCollisionDetectorInterface.Result,

    members: {
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

      initWithCollisionObjects: function ManifoldResult( body0, body1 ) {
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
