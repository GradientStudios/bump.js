(function( window, Bump ) {

  Bump.SimulationIslandManager = Bump.type({
    init: function SimulationIslandManager() {
      this.unionFind = Bump.UnionFind.create();

      this.islandmanifold = [];
      this.islandBodies = [];

      this.splitIslands = true;

      return this;
    },

    members: {
      destruct: Bump.noop,

      initUnionFind: function( n ) {
        this.unionFind.reset( n );
      },

      getUnionFind: function() {
        return this.unionFind;
      },

      updateActivationState: function( colWorld, dispatcher ) {
        // Put the index into `controllers` into `tag`
        var index = 0, i;
        for ( i = 0; i < colWorld.getCollisionObjectArray().length; ++i ) {
          var collisionObject = colWorld.getCollisionObjectArray()[i];
          // Adding filtering here
          if ( !collisionObject.isStaticOrKinematicObject() ) {
            collisionObject.setIslandTag( index++ );
          }

          collisionObject.setCompanionId( -1 );
          collisionObject.setHitFraction( 1 );
        }

        // Do the union find.
        this.initUnionFind( index );

        this.findUnions( dispatcher, colWorld );
      },

      storeIslandActivationState: function( colWorld ) {
        // Put the islandId ('find' value) into `tag`
        var index = 0, i;
        for ( i = 0; i < colWorld.getCollisionObjectArray().length; ++i ) {
          var collisionObject = colWorld.getCollisionObjectArray()[i];
          if ( !collisionObject.isStaticOrKinematicObject() ) {
            collisionObject.setIslandTag( this.unionFind.find( index ) );

            // Set the correct object offset in Collision Object Array
            this.unionFind.getElement( index ).sz = i;
            collisionObject.setCompanionId( -1 );
            ++index;
          } else {
            collisionObject.setIslandTag(-1);
            collisionObject.setCompanionId(-2);
          }
        }
      },

      findUnions: function( dispatcher, colWorld ) {
        var pairCachePtr = colWorld.getPairCache();
        var numOverlappingPairs = pairCachePtr.getNumOverlappingPairs();
        if ( numOverlappingPairs ) {
          var pairPtr = pairCachePtr.getOverlappingPairArrayPtr();

          for ( var i = 0; i < numOverlappingPairs; ++i ) {
            var collisionPair = pairPtr[i];
            var colObj0 = collisionPair.pProxy0.clientObject;
            var colObj1 = collisionPair.pProxy1.clientObject;

            if ( (( colObj0 ) && ( colObj0.mergesSimulationIslands() )) &&
                 (( colObj1 ) && ( colObj1.mergesSimulationIslands() )) )
            {
              this.unionFind.unite( colObj0.getIslandTag(),
                                    colObj1.getIslandTag() );
            }
          }
        }
      },

      buildAndProcessIslands: function( dispatcher, collisionWorld, callback ) {
        var collisionObjects = collisionWorld.getCollisionObjectArray();

        this.buildIslands( dispatcher, collisionWorld );

        var endIslandIndex = 1;
        var startIslandIndex;
        var numElem = this.getUnionFind().getNumElements();

        if ( !this.splitIslands ) {
          var manifold = dispatcher.getInternalManifoldPointer();
          var maxNumManifolds = dispatcher.getNumManifolds();
          callback.ProcessIsland( collisionObjects, collisionObjects.length, manifold, maxNumManifolds, -1 );
        } else {
          // - Sort manifolds, based on islands.
          // - Sort the vector using predicate and std::sort
          //    std::sort( islandmanifold.begin(), islandmanifold.end(), btPersistentManifoldSortPredicate );

          var numManifolds = this.islandmanifold.length;

          // We should do radix sort, it it much faster (`O(n)` instead of `O(n log2(n)`)
          Bump.quickSort( this.islandmanifold, Bump.PersistentManifoldSortPredicate.create() );

          // Now process all active islands (sets of manifolds for now)
          var startManifoldIndex = 0;
          var endManifoldIndex = 1;

          //     console.log( 'Start Islands' );

          // Traverse the simulation islands, and call the solver, unless all
          // objects are sleeping/deactivated.
          for ( startIslandIndex = 0; startIslandIndex < numElem; startIslandIndex = endIslandIndex) {
            var islandId = this.getUnionFind().getElement( startIslandIndex ).id;

            var islandSleeping = true;

            for (
              endIslandIndex = startIslandIndex;
              ( endIslandIndex < numElem ) && ( this.getUnionFind().getElement( endIslandIndex ).id === islandId );
              ++endIslandIndex
            ) {
              var i = this.getUnionFind().getElement( endIslandIndex ).sz;
              var colObj0 = collisionObjects[i];
              this.islandBodies.push( colObj0 );
              if ( colObj0.isActive() ) {
                islandSleeping = false;
              }
            }

            // Find the accompanying contact manifold for this islandId
            var numIslandManifolds = 0;
            var startManifold = null;

            if ( startManifoldIndex < numManifolds ) {
              var curIslandId = this.getIslandId( this.islandmanifold[ startManifoldIndex ] );
              if ( curIslandId === islandId ) {
                startManifold = this.islandmanifold.slice( startManifoldIndex );

                for (
                  endManifoldIndex = startManifoldIndex + 1;
                  ( endManifoldIndex < numManifolds ) && ( islandId === this.getIslandId( this.islandmanifold[ endManifoldIndex ] ) );
                  ++endManifoldIndex
                ) {
                  Bump.noop();
                }
                // Process the actual simulation, only if not sleeping/deactivated
                numIslandManifolds = endManifoldIndex - startManifoldIndex;
              }
            }

            if ( !islandSleeping ) {
              callback.ProcessIsland( this.islandBodies, this.islandBodies.length, startManifold,numIslandManifolds, islandId);
              console.log( 'Island callback of size:' + this.islandBodies.length + 'bodies, ' + numIslandManifolds + ' manifolds' );
            }

            if ( numIslandManifolds ) {
              startManifoldIndex = endManifoldIndex;
            }

            this.islandBodies.length = 0;
          }
        } // else if( !splitIslands )
      },

      buildIslands: function( dispatcher, collisionWorld ) {
        var i, idx, colObj0, colObj1,
            collisionObjects = collisionWorld.getCollisionObjectArray();

        this.islandmanifold.length = 0;

        // We are going to sort the unionfind array, and store the element id in
        // the size. Afterwards, we clean unionfind, to make sure no-one uses it
        // anymore.

        this.getUnionFind().sortIslands();
        var numElem = this.getUnionFind().getNumElements();

        var endIslandIndex=1;
        var startIslandIndex;

        // Update the sleeping state for bodies, if all are sleeping
        for ( startIslandIndex = 0; startIslandIndex < numElem; startIslandIndex = endIslandIndex ) {
          var islandId = this.getUnionFind().getElement( startIslandIndex ).id;
          for (
            endIslandIndex = startIslandIndex + 1;
            ( endIslandIndex < numElem ) && ( this.getUnionFind().getElement( endIslandIndex ).id === islandId );
            ++endIslandIndex
          ) {
            Bump.noop();
          }

          var allSleeping = true;

          for ( idx = startIslandIndex; idx < endIslandIndex; ++idx) {
            i = this.getUnionFind().getElement( idx ).sz;

            colObj0 = collisionObjects[i];
            if ( ( colObj0.getIslandTag() !== islandId ) && ( colObj0.getIslandTag() !== -1 ) ) {
              //     console.log( 'error in island management' );
              Bump.noop();
            }

            Bump.Assert( ( colObj0.getIslandTag() === islandId ) || ( colObj0.getIslandTag() === -1 ) );
            if ( colObj0.getIslandTag() === islandId ) {
              if ( colObj0.getActivationState() === Bump.CollisionObject.ACTIVE_TAG ) {
                allSleeping = false;
              }
              if ( colObj0.getActivationState() === Bump.CollisionObject.DISABLE_DEACTIVATION ) {
                allSleeping = false;
              }
            }
          }

          if ( allSleeping ) {
            for ( idx = startIslandIndex; idx < endIslandIndex; ++idx ) {
              i = this.getUnionFind().getElement( idx ).sz;
              colObj0 = collisionObjects[i];
              if ( ( colObj0.getIslandTag() !== islandId ) && ( colObj0.getIslandTag() !== -1 ) ) {
                //     console.log( 'error in island management' );
                Bump.noop();
              }

              Bump.Assert( ( colObj0.getIslandTag() === islandId ) || ( colObj0.getIslandTag() === -1 ) );

              if ( colObj0.getIslandTag() === islandId ) {
                colObj0.setActivationState( Bump.CollisionObject.ISLAND_SLEEPING );
              }
            }
          } else {
            for ( idx = startIslandIndex; idx < endIslandIndex; ++idx ) {
              i = this.getUnionFind().getElement( idx ).sz;

              colObj0 = collisionObjects[i];
              if ( ( colObj0.getIslandTag() !== islandId ) && ( colObj0.getIslandTag() !== -1 ) ) {
                console.log( 'error in island management' );
              }

              Bump.Assert( ( colObj0.getIslandTag() === islandId ) || ( colObj0.getIslandTag() === -1 ) );

              if ( colObj0.getIslandTag() === islandId ) {
                if ( colObj0.getActivationState() === Bump.CollisionObject.ISLAND_SLEEPING ) {
                  colObj0.setActivationState( Bump.CollisionObject.WANTS_DEACTIVATION );
                  colObj0.setDeactivationTime( 0 );
                }
              }
            }
          }
        }

        var maxNumManifolds = dispatcher.getNumManifolds();

        for ( i = 0; i < maxNumManifolds; ++i ) {
          var manifold = dispatcher.getManifoldByIndexInternal( i );

          colObj0 = manifold.getBody0();
          colObj1 = manifold.getBody1();

          // **TODO:** Check sleeping conditions!
          if (( (colObj0 !== null) && colObj0.getActivationState() !== Bump.CollisionObject.ISLAND_SLEEPING ) ||
              ( (colObj1 !== null) && colObj1.getActivationState() !== Bump.CollisionObject.ISLAND_SLEEPING ))
          {
            // Kinematic objects don't merge islands, but wake up all connected
            // objects.
            if ( colObj0.isKinematicObject() && colObj0.getActivationState() !== Bump.CollisionObject.ISLAND_SLEEPING ) {
              colObj1.activate();
            }
            if ( colObj1.isKinematicObject() && colObj1.getActivationState() !== Bump.CollisionObject.ISLAND_SLEEPING ) {
              colObj0.activate();
            }
            if ( this.splitIslands ) {
              // Filtering for response.
              if ( dispatcher.needsResponse( colObj0, colObj1 ) ) {
                this.islandmanifold.push( manifold );
              }
            }
          }
        }

      },

      getSplitIslands: function() {
        return this.splitIslands;
      },

      setSplitIslands: function( doSplitIslands ) {
        this.splitIslands = doSplitIslands;
      }

    },

    typeMembers: {
      IslandCallback: Bump.type({
        init: function IslandCallback() {},

        members: {
          destruct: Bump.noop,
          ProcessIsland: Bump.abstract
        }
      })
    }
  });

})( this, this.Bump );
