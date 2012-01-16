(function( window, Bump ) {
  var MANIFOLD_CACHE_SIZE = 4;

  Bump.gContactBreakingThreshold = 0.02;
  Bump.gContactDestroyedCallback = function() {};
  Bump.gContactProcessedCallback = function() {};

  Bump.ContactManifoldTypes = Bump.Enum([
    { id: 'MIN_CONTACT_MANIFOLD_TYPE', value: 1024 },
    'BT_PERSISTENT_MANIFOLD_TYPE'
  ]);

  Bump.PersistentManifold = Bump.type({
    parent: Bump.TypedObject,

    members: {
      init: function ManifestPoint() {
        this._super( Bump.ContactManifoldTypes.BT_PERSISTENT_MANIFOLD_TYPE );

        this.pointCache = [];
        for ( var i = 0; i < MANIFOLD_CACHE_SIZE; ++i ) {
          this.pointCache.push( Bump.ManifoldPoint.create() );
        }

        // These two body pointers can point to the physics rigidbody class.
        this.body0 = null;
        this.body1 = null;

        this.cachedPoints = 0;

        this.contactBreakingThreshold = 0;
        this.contactProcessingThreshold = 0;
        this.companionIdA = 0;
        this.companionIdB = 0;
        this.index1a = 0;
      },

      initWithContactPoint: function ManifestPoint( body0, body1, throwaway, contactBreakingThreshold, contactProcessingThreshold ) {
        Bump.TypedObject.prototype.init
          .apply( this, [ Bump.ContactManifoldTypes.BT_PERSISTENT_MANIFOLD_TYPE ] );

        this.pointCache = [];
        for ( var i = 0; i < MANIFOLD_CACHE_SIZE; ++i ) {
          this.pointCache.push( Bump.ManifoldPoint.create() );
        }

        // These two body pointers can point to the physics rigidbody class.
        this.body0 = body0;
        this.body1 = body1;

        this.cachedPoints = 0;

        this.contactBreakingThreshold = contactBreakingThreshold;
        this.contactProcessingThreshold = contactProcessingThreshold;
        this.companionIdA = 0;
        this.companionIdB = 0;
        this.index1a = 0;
      }

    },

    typeMembers: {
      create: function( body0, body1, throwaway, contactBreakingThreshold, contactProcessingThreshold ) {
        var persistentManifold = Object.create( Bump.PersistentManifold.prototype );
        if ( arguments.length ) {
          persistentManifold.initWithContactPoint( body0, body1, throwaway, contactBreakingThreshold, contactProcessingThreshold );
        } else {
          persistentManifold.init();
        }
        return persistentManifold;
      }
    }
  });

})( this, this.Bump );
