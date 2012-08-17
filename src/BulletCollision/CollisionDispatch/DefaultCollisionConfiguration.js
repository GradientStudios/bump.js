// load: bump.js
// load: BulletCollision/CollisionDispatch/CollisionConfiguration.js

// run: BulletCollision/NarrowPhaseCollision/PersistentManifold.js
// run: BulletCollision/NarrowPhaseCollision/VoronoiSimplexSolver.js
// run: BulletCollision/NarrowPhaseCollision/GjkEpaPenetrationDepthSolver.js
// run: BulletCollision/CollisionDispatch/ConvexConvexAlgorithm.js
// run: BulletCollision/CollisionDispatch/ConvexConcaveCollisionAlgorithm.js
// run: BulletCollision/CollisionDispatch/CompoundCollisionAlgorithm.js
// run: BulletCollision/CollisionDispatch/BoxBoxCollisionAlgorithm.js
// run: BulletCollision/BroadphaseCollision/BroadphaseProxy.js

(function( window, Bump ) {
  Bump.DefaultCollisionConstructionInfo = Bump.type({
    init: function DefaultCollisionConstructionInfo() {
      this.stackAlloc = null;
      this.persistentManifoldPool = null;
      this.collisionAlgorithmPool = null;
      this.defaultMaxPersistentManifoldPoolSize = 4096;
      this.defaultMaxCollisionAlgorithmPoolSize = 4096;
      this.customCollisionAlgorithmMaxElementSize = 0;
      this.defaultStackAllocatorSize = 0;
      this.useEpaPenetrationAlgorithm = true;
      return this;
    },

    members: {
      clone: function( dest ) {
        dest = dest || Bump.DefaultCollisionConstructionInfo.create();

        dest.stackAlloc = this.stackAlloc;
        dest.persistentManifoldPool = this.persistentManifoldPool;
        dest.collisionAlgorithmPool = this.collisionAlgorithmPool;
        dest.defaultMaxPersistentManifoldPoolSize = this.defaultMaxPersistentManifoldPoolSize;
        dest.defaultMaxCollisionAlgorithmPoolSize = this.defaultMaxCollisionAlgorithmPoolSize;
        dest.customCollisionAlgorithmMaxElementSize = this.customCollisionAlgorithmMaxElementSize;
        dest.defaultStackAllocatorSize = this.defaultStackAllocatorSize;
        dest.useEpaPenetrationAlgorithm = this.useEpaPenetrationAlgorithm;

        return dest;
      },

      assign: function( other ) {
        this.stackAlloc = other.stackAlloc;
        this.persistentManifoldPool = other.persistentManifoldPool;
        this.collisionAlgorithmPool = other.collisionAlgorithmPool;
        this.defaultMaxPersistentManifoldPoolSize = other.defaultMaxPersistentManifoldPoolSize;
        this.defaultMaxCollisionAlgorithmPoolSize = other.defaultMaxCollisionAlgorithmPoolSize;
        this.customCollisionAlgorithmMaxElementSize = other.customCollisionAlgorithmMaxElementSize;
        this.defaultStackAllocatorSize = other.defaultStackAllocatorSize;
        this.useEpaPenetrationAlgorithm = other.useEpaPenetrationAlgorithm;

        return this;
      }
    }
  });

  Bump.DefaultCollisionConfiguration = Bump.type({
    parent: Bump.CollisionConfiguration,

    init: function DefaultCollisionConfiguration( constructionInfo ) {
      this._super();

      constructionInfo = ( constructionInfo === undefined ) ?
        Bump.DefaultCollisionConstructionInfo.create() :
        constructionInfo;

      // #### Default construction of member variables.
      this.persistentManifoldPoolSize = 0;

      this.stackAlloc = null;
      this.ownsStackAllocator = false;

      this.persistentManifoldPool = null;
      this.ownsPersistentManifoldPool = false;

      this.collisionAlgorithmPool = null;
      this.ownsCollisionAlgorithmPool = false;

      // Default simplex/penetration depth solvers.
      this.simplexSolver = null;
      this.pdSolver = null;

      // Default CreationFunctions, filling the `this.doubleDispatch` table.
      this.convexConvexCreateFunc = null;
      this.convexConcaveCreateFunc = null;
      this.swappedConvexConcaveCreateFunc = null;
      this.compoundCreateFunc = null;
      this.swappedCompoundCreateFunc = null;
      this.emptyCreateFunc = null;
      this.sphereSphereCF = null;
      this.sphereBoxCF = null;
      this.boxSphereCF = null;

      this.boxBoxCF = null;
      this.sphereTriangleCF = null;
      this.triangleSphereCF = null;
      this.planeConvexCF = null;
      this.convexPlaneCF = null;

      // #### Constructor body.
      this.simplexSolver = Bump.VoronoiSimplexSolver.create();

      if ( constructionInfo.useEpaPenetrationAlgorithm ) {
        this.pdSolver = Bump.GjkEpaPenetrationDepthSolver.create();
      } else {
        if ( Bump.MinkowskiPenetrationDepthSolver || !Bump.INCOMPLETE_IMPLEMENTATION ) {
          this.pdSolver = Bump.MinkowskiPenetrationDepthSolver.create();
        }
      }

      // Default CreationFunctions, filling the `this.doubleDispatch` table.
      this.convexConvexCreateFunc = Bump.ConvexConvexAlgorithm.CreateFunc.create( this.simplexSolver, this.pdSolver );

      this.convexConcaveCreateFunc = Bump.ConvexConcaveCollisionAlgorithm.CreateFunc.create();
      this.swappedConvexConcaveCreateFunc = Bump.ConvexConcaveCollisionAlgorithm.SwappedCreateFunc.create();

      this.compoundCreateFunc = Bump.CompoundCollisionAlgorithm.CreateFunc.create();
      this.swappedCompoundCreateFunc = Bump.CompoundCollisionAlgorithm.SwappedCreateFunc.create();

      if ( Bump.EmptyAlgorithm || !Bump.INCOMPLETE_IMPLEMENTATION ) {
        this.emptyCreateFunc = Bump.EmptyAlgorithm.CreateFunc.create();
      }

      if ( Bump.SphereSphereCollisionAlgorithm || !Bump.INCOMPLETE_IMPLEMENTATION ) {
        this.sphereSphereCF = Bump.SphereSphereCollisionAlgorithm.CreateFunc.create();
      }

      if ( Bump.SphereBoxCollisionAlgorithm || !Bump.INCOMPLETE_IMPLEMENTATION ) {
        this.sphereBoxCF = Bump.SphereBoxCollisionAlgorithm.CreateFunc.create();
        this.sphereBoxCF.swapped = false;
        this.boxSphereCF = Bump.SphereBoxCollisionAlgorithm.CreateFunc.create();
        this.boxSphereCF.swapped = true;
      }

      if ( Bump.SphereTriangleCollisionAlgorithm || !Bump.INCOMPLETE_IMPLEMENTATION ) {
        this.sphereTriangleCF = Bump.SphereTriangleCollisionAlgorithm.CreateFunc.create();
        this.triangleSphereCF = Bump.SphereTriangleCollisionAlgorithm.CreateFunc.create();
        this.triangleSphereCF.swapped = true;
      }

      this.boxBoxCF = Bump.BoxBoxCollisionAlgorithm.CreateFunc.create();

      // Convex versus plane.
      if ( Bump.ConvexPlaneCollisionAlgorithm || !Bump.INCOMPLETE_IMPLEMENTATION ) {
        this.convexPlaneCF = Bump.ConvexPlaneCollisionAlgorithm.CreateFunc.create();
        this.planeConvexCF = Bump.ConvexPlaneCollisionAlgorithm.CreateFunc();
        this.planeConvexCF.swapped = true;
      }

      // Calculate maximum element size, big enough to fit any collision
      // algorithm in the memory pool.

      // var maxSize  = sizeof( Bump.ConvexConvexAlgorithm );
      // var maxSize2 = sizeof( Bump.ConvexConcaveCollisionAlgorithm );
      // var maxSize3 = sizeof( Bump.CompoundCollisionAlgorithm );
      // var sl       = sizeof( Bump.ConvexSeparatingDistanceUtil );
      // sl = sizeof( Bump.GjkPairDetector );
      // var collisionAlgorithmMaxElementSize = Math.max(
      //   maxSize,
      //   maxSize2,
      //   maxSize3,
      //   constructionInfo.customCollisionAlgorithmMaxElementSize
      // );

      // if ( constructionInfo.stackAlloc !== null ) {
      //   this.ownsStackAllocator = false;
      //   this.stackAlloc = constructionInfo.stackAlloc;
      // } else {
      //   this.ownsStackAllocator = true;
      //   this.stackAlloc = Bump.StackAlloc( constructionInfo.defaultStackAllocatorSize );
      // }

      if ( constructionInfo.persistentManifoldPool !== null ) {
        this.ownsPersistentManifoldPool = false;
        this.persistentManifoldPool = constructionInfo.persistentManifoldPool;
      } else {
        this.ownsPersistentManifoldPool = true;
        this.persistentManifoldPool = Bump.PoolAllocator.create( Bump.PersistentManifold, constructionInfo.defaultMaxPersistentManifoldPoolSize );
      }

      // if ( constructionInfo.collisionAlgorithmPool !== null ) {
      //   this.ownsCollisionAlgorithmPool = false;
      //   this.collisionAlgorithmPool = constructionInfo.collisionAlgorithmPool;
      // } else {
      //   this.ownsCollisionAlgorithmPool = true;
      //   this.collisionAlgorithmPool = Bump.PoolAllocator( collisionAlgorithmMaxElementSize, constructionInfo.defaultMaxCollisionAlgorithmPoolSize );
      // }

      return this;
    },

    members: {
      destruct: function() {
        if ( this.ownsStackAllocator ) {
          this.stackAlloc.destroy();
          this.stackAlloc.destruct();
        }

        if ( this.ownsCollisionAlgorithmPool ) {
          this.collisionAlgorithmPool.destruct();
        }

        if ( this.ownsPersistentManifoldPool ) {
          this.persistentManifoldPool.destruct();
        }

        this.convexConvexCreateFunc.destruct();

        this.convexConcaveCreateFunc.destruct();
        this.swappedConvexConcaveCreateFunc.destruct();

        this.compoundCreateFunc.destruct();
        this.swappedCompoundCreateFunc.destruct();
        this.emptyCreateFunc.destruct();
        this.sphereSphereCF.destruct();

        this.sphereTriangleCF.destruct();
        this.triangleSphereCF.destruct();
        this.boxBoxCF.destruct();

        this.convexPlaneCF.destruct();
        this.planeConvexCF.destruct();

        this.simplexSolver.destruct();
        this.pdSolver.destruct();
      },

      getPersistentManifoldPool: function() {
        return this.persistentManifoldPool;
      },

      getCollisionAlgorithmPool: function() {
        return this.collisionAlgorithmPool;
      },

      getStackAllocator: function() {
        return this.stackAlloc;
      },

      getSimplexSolver: function() {
        return this.simplexSolver;
      },

      getCollisionAlgorithmCreateFunc: function( proxyType0, proxyType1 ) {
        if ( ( proxyType0 === Bump.BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE ) && ( proxyType1 === Bump.BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE ) ) {
          return this.sphereSphereCF;
        }

        if ( ( proxyType0 === Bump.BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE ) && ( proxyType1 === Bump.BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE ) ) {
          return this.sphereBoxCF;
        }

        if ( ( proxyType0 === Bump.BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE ) && ( proxyType1 === Bump.BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE ) ) {
          return this.boxSphereCF;
        }

        if ( ( proxyType0 === Bump.BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE ) && ( proxyType1 === Bump.BroadphaseNativeTypes.TRIANGLE_SHAPE_PROXYTYPE ) ) {
          return  this.sphereTriangleCF;
        }

        if ( ( proxyType0 === Bump.BroadphaseNativeTypes.TRIANGLE_SHAPE_PROXYTYPE  ) && ( proxyType1 === Bump.BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE ) ) {
          return  this.triangleSphereCF;
        }

        if ( ( proxyType0 === Bump.BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE) && ( proxyType1 === Bump.BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE ) ) {
          return this.boxBoxCF;
        }

        if ( Bump.BroadphaseProxy.isConvex( proxyType0 ) && ( proxyType1 === Bump.BroadphaseNativeTypes.STATIC_PLANE_PROXYTYPE ) ) {
          return this.convexPlaneCF;
        }

        if ( Bump.BroadphaseProxy.isConvex( proxyType1 ) && ( proxyType0 === Bump.BroadphaseNativeTypes.STATIC_PLANE_PROXYTYPE ) ) {
          return this.planeConvexCF;
        }

        if ( Bump.BroadphaseProxy.isConvex( proxyType0 ) && Bump.BroadphaseProxy.isConvex( proxyType1 ) ) {
          return this.convexConvexCreateFunc;
        }

        if ( Bump.BroadphaseProxy.isConvex( proxyType0 ) && Bump.BroadphaseProxy.isConcave( proxyType1 ) ) {
          return this.convexConcaveCreateFunc;
        }

        if ( Bump.BroadphaseProxy.isConvex( proxyType1 ) && Bump.BroadphaseProxy.isConcave( proxyType0 ) ) {
          return this.swappedConvexConcaveCreateFunc;
        }

        if ( Bump.BroadphaseProxy.isCompound( proxyType0 ) ) {
          return this.compoundCreateFunc;
        } else {
          if ( Bump.BroadphaseProxy.isCompound( proxyType1 ) ) {
            return this.swappedCompoundCreateFunc;
          }
        }

        // Failed to find an algorithm.
        return this.emptyCreateFunc;
      },

      setConvexConvexMultipointIterations: function( numPerturbationIterations, minimumPointsPerturbationThreshold ) {
        var convexConvex = this.convexConvexCreateFunc;
        convexConvex.numPerturbationIterations = numPerturbationIterations;
        convexConvex.minimumPointsPerturbationThreshold = minimumPointsPerturbationThreshold;
      },

      setPlaneConvexMultipointIterations: function( numPerturbationIterations, minimumPointsPerturbationThreshold ) {
        var cpCF = this.convexPlaneCF;
        cpCF.numPerturbationIterations = numPerturbationIterations;
        cpCF.minimumPointsPerturbationThreshold = minimumPointsPerturbationThreshold;

        var pcCF = this.planeConvexCF;
        pcCF.numPerturbationIterations = numPerturbationIterations;
        pcCF.minimumPointsPerturbationThreshold = minimumPointsPerturbationThreshold;
      }

    }
  });

})( this, this.Bump );
