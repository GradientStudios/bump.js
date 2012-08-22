// load: bump.js
// load: BulletCollision/CollisionDispatch/ActivatingCollisionAlgorithm.js
// load: BulletCollision/CollisionDispatch/CollisionAlgorithmCreateFunc.js
// load: BulletCollision/CollisionDispatch/BoxBoxDetector.js
// load: BulletCollision/NarrowPhaseCollision/DiscreteCollisionDetectorInterface.js

(function( window, Bump ) {

  var createGetter = function( Type, pool ) {
    return function() {
      return pool.pop() || Type.create();
    };
  };

  var createDeller = function( pool ) {
    return function() {
      for ( var i = 0; i < arguments.length; ++i ) {
        pool.push( arguments[i] );
      }
    };
  };

  var vecPool = [];

  var getVector3 = createGetter( Bump.Vector3, vecPool );
  var delVector3 = createDeller( vecPool );

  Bump.SphereSphereCollisionAlgorithm = Bump.type({
    parent: Bump.ActivatingCollisionAlgorithm,

    init: function SphereSphereCollisionAlgorithm( ci ) {
      this._super( ci );

      this.ownManifold = false;
      this.manifoldPtr = null;
      return this;
    },

    members: {
      initWithManifold: function( mf, ci, obj0, obj1 ) {
        Bump.ActivatingCollisionAlgorithm.prototype.init.apply( this, [ ci, obj0, obj1 ] );
        this.ownManifold = false;
        this.manifoldPtr = mf;

        if ( this.manifoldPtr === null && this.dispatcher.needsCollision( obj0, obj1 ) ) {
          this.manifoldPtr = this.dispatcher.getNewManifold( obj0, obj1 );
          this.ownManifold = true;
        }
        return this;
      },

      clone: function( dest ) {
        dest = dest || Bump.SphereSphereCollisionAlgorithm.create();

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

      processCollision: function( col0Wrap, col1Wrap, dispatchInfo, resultOut ) {
        if ( this.manifoldPtr === null ) {
          return;
        }

        resultOut.setPersistentManifold( this.manifoldPtr );

        var sphere0 = col0Wrap.getCollisionShape();
        var sphere1 = col1Wrap.getCollisionShape();

        var diff =
          col0Wrap.getWorldTransform().getOrigin().subtract(
            col1Wrap.getWorldTransform().getOrigin(), getVector3() );
        var len = diff.length();
        var radius0 = sphere0.getRadius();
        var radius1 = sphere1.getRadius();

        // #ifdef CLEAR_MANIFOLD
        // this.manifoldPtr.clearManifold(); //don't do this, it disables warmstarting
        // #endif

        ///iff distance positive, don't generate a new contact
        if ( len > ( radius0 + radius1 ) ) {
          delVector3( diff );

          // #ifndef CLEAR_MANIFOLD
          resultOut.refreshContactPoints();
          // #endif //CLEAR_MANIFOLD
          return;
        }
        ///distance (negative means penetration)
        var dist = len - ( radius0 + radius1 );

        var normalOnSurfaceB = getVector3().setValue( 1, 0, 0 );
        if ( len > Bump.SIMD_EPSILON ) {
          normalOnSurfaceB = diff.divideScalar( len, normalOnSurfaceB );
        }

        ///point on A (worldspace)
        ///btVector3 pos0 = col0->getWorldTransform().getOrigin() - radius0 * normalOnSurfaceB;
        ///point on B (worldspace)
        var pos1 = normalOnSurfaceB.multiplyScalar( radius1, getVector3() );
        pos1.addSelf(
          col1Wrap.getWorldTransform().getOrigin() );

        /// report a contact. internally this will be kept persistent, and contact reduction is done

        resultOut.addContactPoint( normalOnSurfaceB, pos1, dist );

        // #ifndef CLEAR_MANIFOLD
        resultOut.refreshContactPoints();
        // #endif //CLEAR_MANIFOLD

        delVector3( normalOnSurfaceB, pos1, diff );
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
        var ca = Object.create( Bump.SphereSphereCollisionAlgorithm.prototype );
        if ( b === undefined ) {
          return ca.init( a );
        }

        return ca.initWithManifold( a, b, c, d );
      },

      CreateFunc: Bump.type({
        parent: Bump.CollisionAlgorithmCreateFunc,

        init: function CreateFunc() {
          this._super();
        },

        members: {
          CreateCollisionAlgorithm: function( ci, body0, body1 ) {
            var ca = Bump.SphereSphereCollisionAlgorithm.create( null, ci, body0, body1 );
            ca.swapped = this.swapped;
            return ca;
          }
        }
      })
    }
  });

})( this, this.Bump );
