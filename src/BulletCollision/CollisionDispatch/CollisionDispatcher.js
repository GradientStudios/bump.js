(function( window, Bump ) {

  Bump.CollisionDispatcher = Bump.type({
    parent: Bump.Dispatcher,

    members: {
      init: function CollisionDispatcher() {
        this._super();

        var i, j, MAX_BROADPHASE_COLLISION_TYPES = Bump.BroadphaseNativeTypes.MAX_BROADPHASE_COLLISION_TYPES;

        this.dispatcherFlags = 0;
        this.manifoldsPtr = [];
        this.defaultManifoldResult = Bump.ManifoldResult.create();
        this.nearCallback = null;
        this.collisionAlgorithmPoolAllocator = null;
        this.persistentManifoldPoolAllocator = null;

        this.doubleDispatch = new Array( MAX_BROADPHASE_COLLISION_TYPES );
        for ( i = 0; i < MAX_BROADPHASE_COLLISION_TYPES; ++i ) {
          this.doubleDispatch[i] = new Array( MAX_BROADPHASE_COLLISION_TYPES );
          for ( j = 0; j < MAX_BROADPHASE_COLLISION_TYPES; ++j ) {
            this.doubleDispatch[i][j] = null;
          }
        }

        this.collisionConfiguration = null;

        return this;
      },

      initWithConfig: function CollisionDispatcher( collisionConfiguration ) {
        Bump.Dispatcher.prototype.init.apply( this, [] );

        var i, j, MAX_BROADPHASE_COLLISION_TYPES = Bump.BroadphaseNativeTypes.MAX_BROADPHASE_COLLISION_TYPES;

        this.dispatcherFlags = Bump.CollisionDispatcher.DispatcherFlags.CD_USE_RELATIVE_CONTACT_BREAKING_THRESHOLD;
        this.manifoldsPtr = [];
        this.defaultManifoldResult = Bump.ManifoldResult.create();
        this.nearCallback = null;
        this.collisionAlgorithmPoolAllocator = null;
        this.persistentManifoldPoolAllocator = null;

        this.doubleDispatch = new Array( MAX_BROADPHASE_COLLISION_TYPES );
        for ( i = 0; i < MAX_BROADPHASE_COLLISION_TYPES; ++i ) {
          this.doubleDispatch[i] = new Array( MAX_BROADPHASE_COLLISION_TYPES );
          for ( j = 0; j < MAX_BROADPHASE_COLLISION_TYPES; ++j ) {
            this.doubleDispatch[i][j] = null;
          }
        }

        this.collisionConfiguration = collisionConfiguration;

        this.setNearCallback( this.defaultNearCallback );
        this.collisionAlgorithmPoolAllocator = collisionConfiguration.getCollisionAlgorithmPool();
        this.persistentManifoldPoolAllocator = collisionConfiguration.getPersistentManifoldPool();

        for ( i = 0; i < MAX_BROADPHASE_COLLISION_TYPES; ++i ) {
          for ( j = 0; j < MAX_BROADPHASE_COLLISION_TYPES; ++j ) {
            this.doubleDispatch[i][j] = this.collisionConfiguration.getCollisionAlgorithmCreateFunc( i, j );
            Bump.Assert( this.doubleDispatch[i][j] !== null );
          }
        }

        return this;
      },

      clone: function( dest ) {
        dest = dest || Bump.CollisionDispatcher.create();

        var i, j, MAX_BROADPHASE_COLLISION_TYPES = Bump.BroadphaseNativeTypes.MAX_BROADPHASE_COLLISION_TYPES;

        dest.dispatcherFlags = this.dispatcherFlags;

        dest.manifoldsPtr.length = 0;
        dest.manifoldsPtr.length = this.manifoldsPtr.length;
        for ( i = 0; i < this.manifoldsPtr.length; ++i ) {
          dest.manifoldsPtr[i] = this.manifoldsPtr[i];
        }

        dest.defaultManifoldResult.assign( this.defaultManifoldResult );
        dest.nearCallback = this.nearCallback;
        dest.collisionAlgorithmPoolAllocator = this.collisionAlgorithmPoolAllocator;
        dest.persistentManifoldPoolAllocator = this.persistentManifoldPoolAllocator;

        for ( i = 0; i < MAX_BROADPHASE_COLLISION_TYPES; ++i ) {
          for ( j = 0; j < MAX_BROADPHASE_COLLISION_TYPES; ++j ) {
            dest.doubleDispatch[i][j] = this.doubleDispatch[i][j];
          }
        }

        dest.collisionConfiguration = this.collisionConfiguration;

        return dest;
      },

      assign: function( other ) {
        var i, j, MAX_BROADPHASE_COLLISION_TYPES = Bump.BroadphaseNativeTypes.MAX_BROADPHASE_COLLISION_TYPES;

        this.dispatcherFlags = other.dispatcherFlags;

        this.manifoldsPtr.length = 0;
        this.manifoldsPtr.length = other.manifoldsPtr.length;
        for ( i = 0; i < other.manifoldsPtr.length; ++i ) {
          this.manifoldsPtr[i] = other.manifoldsPtr[i];
        }

        this.defaultManifoldResult.assign( other.defaultManifoldResult );
        this.nearCallback = other.nearCallback;
        this.collisionAlgorithmPoolAllocator = other.collisionAlgorithmPoolAllocator;
        this.persistentManifoldPoolAllocator = other.persistentManifoldPoolAllocator;

        for ( i = 0; i < MAX_BROADPHASE_COLLISION_TYPES; ++i ) {
          for ( j = 0; j < MAX_BROADPHASE_COLLISION_TYPES; ++j ) {
            this.doubleDispatch[i][j] = other.doubleDispatch[i][j];
          }
        }

        this.collisionConfiguration = other.collisionConfiguration;

        return this;
      }

    },

    typeMembers: {
      create: function( collisionConfiguration ) {
        var cd = Object.create( Bump.CollisionDispatcher.prototype );
        if ( arguments.length ) {
          return cd.initWithConfig( collisionConfiguration );
        }

        return cd.init();
      }
    }
  });

})( this, this.Bump );
