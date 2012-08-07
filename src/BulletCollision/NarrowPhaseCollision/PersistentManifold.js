// load: bump.js
// load: LinearMath/Math.js
// load: LinearMath/Vector3.js

// run: BulletCollision/NarrowPhaseCollision/ManifoldPoint.js

(function( window, Bump ) {
  var MANIFOLD_CACHE_SIZE = 4,
      tmpV1 = Bump.Vector3.create(),
      tmpV2 = Bump.Vector3.create(),
      tmpV3 = Bump.Vector3.create(),
      tmpV4 = Bump.Vector3.create(),
      tmpVec41 = Bump.Vector4.create();

  Bump.gContactBreakingThreshold = 0.02;
  Bump.gContactDestroyedCallback = null;
  Bump.gContactProcessedCallback = null;

  // `gContactCalcArea3Points` will approximate the convex hull area using 3
  // points. When setting it to false, it will use 4 points to compute the area:
  // it is more accurate but slower.
  Bump.gContactCalcArea3Points = true;

  Bump.ContactManifoldTypes = Bump.Enum([
    { id: 'MIN_CONTACT_MANIFOLD_TYPE', value: 1024 },
    'BT_PERSISTENT_MANIFOLD_TYPE'
  ]);

  var calcArea4Points = Bump.calcArea4Points = (function() {
    var a = [
      Bump.Vector3.create(),
      Bump.Vector3.create(),
      Bump.Vector3.create()
    ];
    var b = [
      Bump.Vector3.create(),
      Bump.Vector3.create(),
      Bump.Vector3.create()
    ];
    var tmp0 = Bump.Vector3.create();
    var tmp1 = Bump.Vector3.create();
    var tmp2 = Bump.Vector3.create();

    return function( p0, p1, p2, p3 ) {
      // It calculates possible 3 area constructed from random 4 points and returns the biggest one.
      a[0] = p0.subtract( p1, a[0] );
      a[1] = p0.subtract( p2, a[1] );
      a[2] = p0.subtract( p3, a[2] );
      b[0] = p2.subtract( p3, b[0] );
      b[1] = p1.subtract( p3, b[1] );
      b[2] = p1.subtract( p2, b[2] );

      // TODO: Following 3 cross production can be easily optimized by SIMD.
      tmp0 = a[0].cross( b[0], tmp0 );
      tmp1 = a[1].cross( b[1], tmp1 );
      tmp2 = a[2].cross( b[2], tmp2 );

      return Math.max( tmp0.length2(), tmp1.length2(), tmp2.length2() );
    };
  })();

  Bump.PersistentManifold = Bump.type({
    parent: Bump.TypedObject,

    init: function PersistentManifold() {
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

    members: {
      initWithContactPoint: function( body0, body1, throwaway, contactBreakingThreshold, contactProcessingThreshold ) {
        Bump.TypedObject.prototype.init
          .call( this, Bump.ContactManifoldTypes.BT_PERSISTENT_MANIFOLD_TYPE );

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
      },

      clone: function( dest ) {
        dest = dest || Bump.PersistentManifold.create();

        this._super( dest );

        for ( var i = 0; i < MANIFOLD_CACHE_SIZE; ++i ) {
          dest.pointCache[i].assign( this.pointCache[i] );
        }

        dest.body0 = this.body0;
        dest.body1 = this.body1;

        dest.cachedPoints = this.cachedPoints;

        dest.contactBreakingThreshold = this.contactBreakingThreshold;
        dest.contactProcessingThreshold = this.contactProcessingThreshold;
        dest.companionIdA = this.companionIdA;
        dest.companionIdB = this.companionIdB;
        dest.index1a = this.index1a;

        return dest;
      },

      assign: function( other ) {
        this._super( other );

        for ( var i = 0; i < MANIFOLD_CACHE_SIZE; ++i ) {
          this.pointCache[i].assign( other.pointCache[i] );
        }

        this.body0 = other.body0;
        this.body1 = other.body1;

        this.cachedPoints = other.cachedPoints;

        this.contactBreakingThreshold = other.contactBreakingThreshold;
        this.contactProcessingThreshold = other.contactProcessingThreshold;
        this.companionIdA = other.companionIdA;
        this.companionIdB = other.companionIdB;
        this.index1a = other.index1a;

        return this;
      },

      getBody0: function() {
        return this.body0;
      },

      getBody1: function() {
        return this.body1;
      },

      setBodies: function( body0, body1 ) {
        this.body0 = body0;
        this.body1 = body1;
      },

      clearUserCache: function( pt ) {
        var oldPtr = pt.userPersistentData;
        if ( oldPtr != null ) {
          if ( pt.userPersistentData && Bump.gContactDestroyedCallback != null ) {
            Bump.gContactDestroyedCallback( pt.userPersistentData );
            pt.userPersistentData = null;
          }
        }
      },

      getNumContacts: function() {
        return this.cachedPoints;
      },

      getContactPoint: function( index ) {
        Bump.Assert( index < this.cachedPoints );
        return this.pointCache[index];
      },

      getContactBreakingThreshold: function() {
        return this.contactBreakingThreshold;
      },

      getContactProcessingThreshold: function() {
        return this.contactProcessingThreshold;
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      getCacheEntry: function( newPoint ) {
        var shortestDist =  this.getContactBreakingThreshold() * this.getContactBreakingThreshold(),
            size = this.getNumContacts(),
            nearestPoint = -1;

        for ( var i = 0; i < size; ++i ) {
          var mp = this.pointCache[i];

          var diffA = mp.localPointA.subtract( newPoint.localPointA, tmpV1 ),
              distToManiPoint = diffA.dot( diffA );
          if ( distToManiPoint < shortestDist ) {
            shortestDist = distToManiPoint;
            nearestPoint = i;
          }
        }
        return nearestPoint;
      },

      addManifoldPoint: function( newPoint ) {
        Bump.Assert( this.validContactDistance( newPoint ) );

        var insertIndex = this.getNumContacts();
        if ( insertIndex === MANIFOLD_CACHE_SIZE ) {
          if ( MANIFOLD_CACHE_SIZE >= 4 ) {
            // Sort cache so best points come first, based on area.
            insertIndex = this.sortCachedPoints( newPoint );
          } else {
            insertIndex = 0;
          }
          this.clearUserCache( this.pointCache[ insertIndex ] );
        } else {
          ++this.cachedPoints;
        }

        if ( insertIndex < 0 ) {
          insertIndex = 0;
        }

        Bump.Assert( this.pointCache[ insertIndex ].userPersistentData === null );
        this.pointCache[ insertIndex ].assign( newPoint );
        return insertIndex;
      },

      removeContactPoint: function( index ) {
        this.clearUserCache( this.pointCache[ index ] );

        var lastUsedIndex = this.getNumContacts() - 1;
        if ( index !== lastUsedIndex ) {
          this.pointCache[index].assign( this.pointCache[ lastUsedIndex ] );
          // Get rid of duplicated `userPersistentData` pointer.
          this.pointCache[ lastUsedIndex ].userPersistentData = null;
          this.pointCache[ lastUsedIndex ].constraintRow[0].accumImpulse = 0;
          this.pointCache[ lastUsedIndex ].constraintRow[1].accumImpulse = 0;
          this.pointCache[ lastUsedIndex ].constraintRow[2].accumImpulse = 0;

          this.pointCache[ lastUsedIndex ].appliedImpulse = 0;
          this.pointCache[ lastUsedIndex ].lateralFrictionInitialized = false;
          this.pointCache[ lastUsedIndex ].appliedImpulseLateral1 = 0;
          this.pointCache[ lastUsedIndex ].appliedImpulseLateral2 = 0;
          this.pointCache[ lastUsedIndex ].lifeTime = 0;
        }

        Bump.Assert( this.pointCache[ lastUsedIndex ].userPersistentData === null );
        --this.cachedPoints;
      },

      replaceContactPoint: function( newPoint, insertIndex ) {
        Bump.Assert( this.validContactDistance( newPoint ) );

        var lifeTime = this.pointCache[ insertIndex ].getLifeTime(),
            appliedImpulse         = this.pointCache[ insertIndex ].constraintRow[0].accumImpulse,
            appliedLateralImpulse1 = this.pointCache[ insertIndex ].constraintRow[1].accumImpulse,
            appliedLateralImpulse2 = this.pointCache[ insertIndex ].constraintRow[2].accumImpulse;

        Bump.Assert( lifeTime >= 0 );
        var cache = this.pointCache[ insertIndex ].userPersistentData;

        this.pointCache[ insertIndex ].assign( newPoint );

        this.pointCache[ insertIndex ].userPersistentData = cache;
        this.pointCache[ insertIndex ].appliedImpulse = appliedImpulse;
        this.pointCache[ insertIndex ].appliedImpulseLateral1 = appliedLateralImpulse1;
        this.pointCache[ insertIndex ].appliedImpulseLateral2 = appliedLateralImpulse2;

        this.pointCache[ insertIndex ].constraintRow[0].accumImpulse = appliedImpulse;
        this.pointCache[ insertIndex ].constraintRow[1].accumImpulse = appliedLateralImpulse1;
        this.pointCache[ insertIndex ].constraintRow[2].accumImpulse = appliedLateralImpulse2;

        this.pointCache[ insertIndex ].lifeTime = lifeTime;
      },

      validContactDistance: function( pt ) {
        return pt.distance1 <= this.getContactBreakingThreshold();
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      // - `tmpV3`
      refreshContactPoints: function( trA, trB ) {
        var i, manifoldPoint;

        // First refresh worldspace positions and distance…
        for ( i = this.getNumContacts() - 1; i >= 0; --i ) {
          manifoldPoint = this.pointCache[i];
          manifoldPoint.positionWorldOnA = trA.transform( manifoldPoint.localPointA, manifoldPoint.positionWorldOnA );
          manifoldPoint.positionWorldOnB = trB.transform( manifoldPoint.localPointB, manifoldPoint.positionWorldOnB );
          manifoldPoint.distance1 = manifoldPoint.positionWorldOnA
            .subtract( manifoldPoint.positionWorldOnB, tmpV1 )
            .dot( manifoldPoint.normalWorldOnB );
          ++manifoldPoint.lifeTime;
        }

        // Then…
        var distance2d = 0;
        var projectedDifference = tmpV1, projectedPoint = tmpV2;
        for ( i = this.getNumContacts() - 1; i >= 0; --i ) {
          manifoldPoint = this.pointCache[i];
          // Contact becomes invalid when signed distance exceeds margin
          // (projected on contactnormal direction).
          if ( !this.validContactDistance( manifoldPoint ) ) {
            this.removeContactPoint( i );
          }

          // Contact also becomes invalid when relative movement orthogonal to
          // normal exceeds margin.
          else {
            projectedPoint.assign(
              manifoldPoint.positionWorldOnA
                .subtract(
                  manifoldPoint.normalWorldOnB
                    .multiplyScalar( manifoldPoint.distance1, tmpV3 ), tmpV3 )
            );
            projectedDifference.assign(
              manifoldPoint.positionWorldOnB.subtract( projectedPoint, tmpV3 )
            );
            distance2d = projectedDifference.dot( projectedDifference );
            if ( distance2d  > this.getContactBreakingThreshold() * this.getContactBreakingThreshold() ) {
              this.removeContactPoint( i );
            }

            // Contact point processed callback.
            else {
              if ( Bump.gContactProcessedCallback != null ) {
                Bump.gContactProcessedCallback( manifoldPoint, this.body0, this.body1 );
              }
            }
          }
        }
      },

      clearManifold: function() {
        var i;
        for ( i = 0; i < this.cachedPoints; ++i ) {
          this.clearUserCache( this.pointCache[i] );
        }
        this.cachedPoints = 0;
      },

      // Calculate 4 possible cases areas, and take biggest area. Also need to
      // keep "deepest."
      //
      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      // - `tmpV3`
      // - `tmpV4`
      // - `tmpVec41`
      sortCachedPoints: function( pt ) {
        var m_pointCache = this.pointCache;

        var maxPenetrationIndex = -1;

        var maxPenetration = pt.getDistance();
        for ( var i = 0; i < 4; ++i ) {
          if ( m_pointCache[i].getDistance() < maxPenetration ) {
            maxPenetrationIndex = i;
            maxPenetration = m_pointCache[i].getDistance();
          }
        }

        var res0 = 0, res1 = 0, res2 = 0, res3 = 0, cross;

        if ( Bump.gContactCalcArea3Points ) {
          if ( maxPenetrationIndex !== 0 ) {
            var a0 = pt.localPointA.subtract( m_pointCache[1].localPointA, tmpV1 ),
                b0 = m_pointCache[3].localPointA.subtract( m_pointCache[2].localPointA, tmpV2 );

            cross = a0.cross( b0, tmpV3 );
            res0 = cross.length2();
          }

          if ( maxPenetrationIndex !== 1 ) {
            var a1 = pt.localPointA.subtract( m_pointCache[0].localPointA, tmpV1 ),
                b1 = m_pointCache[3].localPointA.subtract( m_pointCache[2].localPointA, tmpV2 );

            cross = a1.cross( b1, tmpV3 );
            res1 = cross.length2();
          }

          if ( maxPenetrationIndex !== 2 ) {
            var a2 = pt.localPointA.subtract( m_pointCache[0].localPointA, tmpV1 ),
                b2 = m_pointCache[3].localPointA.subtract( m_pointCache[1].localPointA, tmpV2 );

            cross = a2.cross( b2, tmpV3 );
            res2 = cross.length2();
          }

          if ( maxPenetrationIndex !== 3 ) {
            var a3 = pt.localPointA.subtract( m_pointCache[0].localPointA, tmpV1 ),
                b3 = m_pointCache[2].localPointA.subtract( m_pointCache[1].localPointA, tmpV2 );

            cross = a3.cross( b3, tmpV3 );
            res3 = cross.length2();
          }
        }

        else {
          if ( maxPenetrationIndex !== 0 ) {
            res0 = calcArea4Points( pt.localPointA, m_pointCache[1].localPointA, m_pointCache[2].localPointA, m_pointCache[3].localPointA );
          }

          if ( maxPenetrationIndex !== 1 ) {
            res1 = calcArea4Points( pt.localPointA, m_pointCache[0].localPointA, m_pointCache[2].localPointA, m_pointCache[3].localPointA );
          }

          if ( maxPenetrationIndex !== 2 ) {
            res2 = calcArea4Points( pt.localPointA, m_pointCache[0].localPointA, m_pointCache[1].localPointA, m_pointCache[3].localPointA );
          }

          if ( maxPenetrationIndex !== 3 ) {
            res3 = calcArea4Points( pt.localPointA, m_pointCache[0].localPointA, m_pointCache[1].localPointA, m_pointCache[2].localPointA );
          }
        }

        var maxvec = tmpVec41.setValue( res0, res1, res2, res3 );
        var biggestarea = maxvec.closestAxis4();
        return biggestarea;
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
