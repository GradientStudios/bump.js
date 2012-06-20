// load: bump.js
// load: LinearMath/Vector3.js
// load: LinearMath/Transform.js
// load: BulletCollision/BroadphaseCollision/Dbvt.js
// load: BulletCollision/CollisionDispatch/ActivatingCollisionAlgorithm.js
// load: BulletCollision/CollisionDispatch/CollisionAlgorithmCreateFunc.js

// run: LinearMath/AabbUtil2.js
// run: LinearMath/AlignedObjectArray.js

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

  var vecPool   = [];
  var transPool = [];
  var volPool   = [];

  var getDbvtVolume = createGetter( Bump.DbvtVolume, volPool   );
  var getVector3    = createGetter( Bump.Vector3,    vecPool   );
  var getTransform  = createGetter( Bump.Transform,  transPool );

  var delDbvtVolume = createDeller( volPool );
  var delVector3    = createDeller( vecPool );
  var delTransform  = createDeller( transPool );

  var CompoundLeafCallback = Bump.type({
    parent: Bump.Dbvt.ICollide,

    init: function CompoundLeafCallback( compoundObj, otherObj, dispatcher, dispatchInfo, resultOut, childCollisionAlgorithms, sharedManifold ) {
      this._super();

      // Initializer list
      this.compoundColObj = compoundObj;
      this.otherObj = otherObj;
      this.dispatcher = dispatcher;
      this.dispatchInfo = dispatchInfo;
      this.resultOut = resultOut;
      this.childCollisionAlgorithms = childCollisionAlgorithms;
      this.sharedManifold = sharedManifold;
      // End initializer list
    },

    members: {
      ProcessChildShape: function( childShape, index ) {
        var tmpPCSVec1 = getVector3();
        var tmpPCSVec2 = getVector3();
        var tmpPCSVec3 = getVector3();
        var tmpPCSVec4 = getVector3();
        var tmpPCST1   = getTransform();
        var tmpPCST2   = getTransform();
        var tmpPCST3   = getTransform();

        var m_compoundColObj = this.compoundColObj;
        var m_otherObj = this.otherObj;
        var m_childCollisionAlgorithms = this.childCollisionAlgorithms;
        var m_resultOut = this.resultOut;

        Bump.Assert( index >= 0 );
        var compoundShape = m_compoundColObj.getCollisionShape();
        Bump.Assert( index < compoundShape.getNumChildShapes() );

        // backup
        var orgTrans = tmpPCST1.assign( m_compoundColObj.getWorldTransform() );
        var orgInterpolationTrans = tmpPCST2.assign( m_compoundColObj.getInterpolationWorldTransform() );
        var childTrans = compoundShape.getChildTransform( index );
        var newChildWorldTrans = orgTrans.multiplyTransform( childTrans, tmpPCST3 );

        // perform an AABB check first
        var aabbMin0 = tmpPCSVec1;
        var aabbMax0 = tmpPCSVec2;
        var aabbMin1 = tmpPCSVec3;
        var aabbMax1 = tmpPCSVec4;
        childShape.getAabb( newChildWorldTrans, aabbMin0, aabbMax0 );
        m_otherObj.getCollisionShape().getAabb( m_otherObj.getWorldTransform(), aabbMin1, aabbMax1 );

        if ( Bump.testAabbAgainstAabb2( aabbMin0, aabbMax0, aabbMin1, aabbMax1 ) ) {
          m_compoundColObj.setWorldTransform( newChildWorldTrans );
          m_compoundColObj.setInterpolationWorldTransform( newChildWorldTrans );

          // the contactpoint is still projected back using the original inverted worldtrans
          var tmpShape = m_compoundColObj.getCollisionShape();
          m_compoundColObj.internalSetTemporaryCollisionShape( childShape );

          if ( !m_childCollisionAlgorithms[ index ] ) {
            m_childCollisionAlgorithms[ index ] = this.dispatcher.findAlgorithm( m_compoundColObj, m_otherObj, this.sharedManifold );
          }

          // detect swapping case
          if ( m_resultOut.getBody0Internal() === m_compoundColObj ) {
            m_resultOut.setShapeIdentifiersA( -1, index );
          } else {
            m_resultOut.setShapeIdentifiersB( -1, index );
          }

          m_childCollisionAlgorithms[index].processCollision( m_compoundColObj, m_otherObj, this.dispatchInfo, m_resultOut );
          // if ( this.dispatchInfo.debugDraw && ( this.dispatchInfo.debugDraw.getDebugMode() & Bump.IDebugDraw.DBG_DrawAabb ) ) {
          //   var worldAabbMin = Bump.Vector3.create();
          //   var worldAabbMax = Bump.Vector3.create();
          //   this.dispatchInfo.debugDraw.drawAabb( aabbMin0, aabbMax0, Bump.Vector3.create(1, 1, 1) );
          //   this.dispatchInfo.debugDraw.drawAabb( aabbMin1, aabbMax1, Bump.Vector3.create(1, 1, 1) );
          // }

          // revert back transform
          m_compoundColObj.internalSetTemporaryCollisionShape( tmpShape );
          m_compoundColObj.setWorldTransform( orgTrans );
          m_compoundColObj.setInterpolationWorldTransform( orgInterpolationTrans );
        }

        delVector3( tmpPCSVec1, tmpPCSVec2, tmpPCSVec3, tmpPCSVec4 );
        delTransform( tmpPCST1, tmpPCST2, tmpPCST3 );
      },

      ProcessNode: function( leaf ) {
        var index = leaf.dataAsInt;

        var compoundShape = this.compoundColObj.getCollisionShape();
        var childShape = compoundShape.getChildShape( index );
        // if ( this.dispatchInfo.debugDraw && ( this.dispatchInfo.debugDraw.getDebugMode() & Bump.IDebugDraw.DBG_DrawAabb ) ) {
        //   var worldAabbMin = Bump.Vector3.create();
        //   var worldAabbMax = Bump.Vector3.create();
        //   var orgTrans = m_compoundColObj.getWorldTransform();
        //   Bump.TransformAabb( leaf.volume.Mins(), leaf.volume.Maxs(), 0, orgTrans, worldAabbMin, worldAabbMax );
        //   this.dispatchInfo.debugDraw.drawAabb( worldAabbMin, worldAabbMax, Bump.Vector3.create(1, 0, 0) );
        // }

        this.ProcessChildShape( childShape, index );
      }

    }
  });

  Bump.CompoundCollisionAlgorithm = Bump.type({
    parent: Bump.ActivatingCollisionAlgorithm,

    members: {
      init: function CompoundCollisionAlgorithm( ci, body0, body1, isSwapped ) {
        // Initializer list
        this._super( ci, body0, body1 );
        this.isSwapped = isSwapped;
        this.sharedManifold = ci.manifold;
        // End initializer list

        // Default initializers
        this.childCollisionAlgorithms = [];
        this.ownsManifold = false;
        this.compoundShapeRevision = 0;
        // End default initializers

        this.ownsManifold = false;
        var colObj = this.isSwapped ? body1 : body0;
        Bump.Assert( colObj.getCollisionShape().isCompound() );

        var compoundShape = colObj.getCollisionShape();
        this.compoundShapeRevision = compoundShape.getUpdateRevision();

        this.preallocateChildAlgorithms( body0, body1 );
      },

      destruct: function() {
        this.removeChildAlgorithms();
      },

      removeChildAlgorithms: function() {
        var m_childCollisionAlgorithms = this.childCollisionAlgorithms;

        var numChildren = m_childCollisionAlgorithms.length;
        var i;
        for ( i = 0; i < numChildren; ++i ) {
          if ( m_childCollisionAlgorithms[i] ) {
            m_childCollisionAlgorithms[i].destruct();
            this.dispatcher.freeCollisionAlgorithm( m_childCollisionAlgorithms[i] );
          }
        }

      },

      preallocateChildAlgorithms: function( body0, body1 ) {
        var m_childCollisionAlgorithms = this.childCollisionAlgorithms;

        var colObj = this.isSwapped ? body1 : body0;
        var otherObj = this.isSwapped ? body0 : body1;
        Bump.Assert( colObj.getCollisionShape().isCompound() );

        var compoundShape = colObj.getCollisionShape();

        var numChildren = compoundShape.getNumChildShapes();
        var i;

        Bump.resize( m_childCollisionAlgorithms, numChildren, null );
        for ( i = 0; i < numChildren; ++i ) {
          if ( compoundShape.getDynamicAabbTree() ) {
            m_childCollisionAlgorithms[i] = null;
          } else {
            var tmpShape = colObj.getCollisionShape();
            var childShape = compoundShape.getChildShape( i );
            colObj.internalSetTemporaryCollisionShape( childShape );
            m_childCollisionAlgorithms[i] = this.dispatcher.findAlgorithm( colObj, otherObj, this.sharedManifold );
            colObj.internalSetTemporaryCollisionShape( tmpShape );
          }
        }
      },

      processCollision: function( body0, body1, dispatchInfo, resultOut ) {
        var m_childCollisionAlgorithms = this.childCollisionAlgorithms;

        var colObj = this.isSwapped ? body1 : body0;
        var otherObj = this.isSwapped ? body0 : body1;

        Bump.Assert( colObj.getCollisionShape().isCompound() );
        var compoundShape = colObj.getCollisionShape();

        // btCompoundShape might have changed: Make sure the internal child
        // collision algorithm caches are still valid.
        if ( compoundShape.getUpdateRevision() !== this.compoundShapeRevision ) {
          // Clear and update all
          this.removeChildAlgorithms();

          this.preallocateChildAlgorithms( body0, body1 );
        }

        var tree = compoundShape.getDynamicAabbTree();
        // use a dynamic aabb tree to cull potential child-overlaps
        var callback = CompoundLeafCallback.create( colObj, otherObj, this.dispatcher, dispatchInfo, resultOut, m_childCollisionAlgorithms, this.sharedManifold );

        // We need to refresh all contact manifolds.
        // Note that we should actually recursively traverse all children,
        // btCompoundShape can nested more then 1 level deep. So we should add
        // a `refreshManifolds` in the btCollisionAlgorithm
        var i;
        var manifoldArray = [];
        for ( i = 0; i < m_childCollisionAlgorithms.length; ++i ) {
          if ( m_childCollisionAlgorithms[i] ) {
            m_childCollisionAlgorithms[i].getAllContactManifolds( manifoldArray );
            for ( var m = 0; m < manifoldArray.length; ++m ) {
              if ( manifoldArray[m].getNumContacts() ) {
                resultOut.setPersistentManifold( manifoldArray[m] );
                resultOut.refreshContactPoints();
                resultOut.setPersistentManifold( null ); // ??necessary?
              }
            }
            Bump.resize( manifoldArray, 0 );
          }
        }

        var numChildren;
        if ( tree ) {
          var localAabbMin = tmpPCVec1;
          var localAabbMax = tmpPCVec2;
          var otherInCompoundSpace = colObj.getWorldTransform()
            .inverse( tmpPCT1 )
            .multiplyTransform( otherObj.getWorldTransform(), tmpPCT1 );

          otherObj.getCollisionShape().getAabb( otherInCompoundSpace, localAabbMin, localAabbMax );

          var bounds = tmpPCVol1.setFromMM( localAabbMin, localAabbMax );
          // process all children, that overlap with  the given AABB bounds
          tree.collideTV( tree.root, bounds, callback );
        }

        else {
          // Iterate over all children, perform an AABB check inside
          // ProcessChildShape.
          numChildren = m_childCollisionAlgorithms.length;
          for ( i = 0; i < numChildren; ++i ) {
            callback.ProcessChildShape( compoundShape.getChildShape( i ), i );
          }
        }

        // iterate over all children, perform an AABB check inside
        // ProcessChildShape.
        numChildren = m_childCollisionAlgorithms.length;
        manifoldArray.length = 0;
        var childShape = null;

        var orgTrans              = tmpPCT1;
        // var orgInterpolationTrans = tmpPCT2;
        var newChildWorldTrans    = tmpPCT3;

        var aabbMin0 = tmpPCVec1;
        var aabbMax0 = tmpPCVec2;
        var aabbMin1 = tmpPCVec3;
        var aabbMax1 = tmpPCVec4;

        for ( i = 0; i < numChildren; ++i ) {
          if ( m_childCollisionAlgorithms[i] ) {
            childShape = compoundShape.getChildShape( i );
            // if not longer overlapping, remove the algorithm
            orgTrans.assign( colObj.getWorldTransform() );
            // orgInterpolationTrans.assign( colObj.getInterpolationWorldTransform() );
            var childTrans = compoundShape.getChildTransform( i );
            newChildWorldTrans = orgTrans.multiplyTransform( childTrans, newChildWorldTrans );

            // (function() {
            //   var str = '';
            //   for ( var i = 0; i < 3; ++i ) {
            //     for ( var j = 0; j < 3; ++j ) {
            //       if ( i !== 0 || j !== 0 ) {
            //         str += ', ';
            //       } else {
            //         str += '      ';
            //       }
            //       str += newChildWorldTrans.basis[i][j].toExponential( 6 );
            //     }
            //   }
            //   console.log( str );
            // })();

            // perform an AABB check first
            childShape.getAabb( newChildWorldTrans, aabbMin0, aabbMax0 );
            otherObj.getCollisionShape().getAabb( otherObj.getWorldTransform(), aabbMin1, aabbMax1 );

            if ( !Bump.testAabbAgainstAabb2( aabbMin0, aabbMax0, aabbMin1, aabbMax1 ) ) {
              m_childCollisionAlgorithms[i].destruct();
              this.dispatcher.freeCollisionAlgorithm( m_childCollisionAlgorithms[i] );
              m_childCollisionAlgorithms[i] = null;
            }
          }
        }
      },

      calculateTimeOfImpact: function( body0, body1, dispatchInfo, resultOut ) {
        var m_childCollisionAlgorithms = this.childCollisionAlgorithms;

        var colObj = this.isSwapped ? body1 : body0;
        var otherObj = this.isSwapped ? body0 : body1;

        Bump.Assert( colObj.getCollisionShape().isCompound() );

        var compoundShape = colObj.getCollisionShape();

        // We will use the OptimizedBVH, AABB tree to cull potential
        // child-overlaps. If both proxies are Compound, we will deal with that
        // directly, by performing sequential/parallel tree traversals given
        // Proxy0 and Proxy1, if both have a tree, Tree0 and Tree1, this means:
        // determine overlapping nodes of Proxy1 using Proxy0 AABB against Tree1
        // then use each overlapping node AABB against Tree0
        // and vise versa.

        var hitFraction = 1;

        var numChildren = m_childCollisionAlgorithms.length;
        var i;
        var orgTrans = Bump.Transform.create();
        var frac = 0;
        for ( i = 0; i < numChildren; ++i ) {
          // Temporarily exchange parent btCollisionShape with childShape,
          // and recurse.
          var childShape = compoundShape.getChildShape(i);

          // backup
          orgTrans.assign( colObj.getWorldTransform() );

          var childTrans = compoundShape.getChildTransform( i );
          colObj.setWorldTransform( orgTrans.multiplyTransform( childTrans ) );

          var tmpShape = colObj.getCollisionShape();
          colObj.internalSetTemporaryCollisionShape( childShape );
          frac = m_childCollisionAlgorithms[i].calculateTimeOfImpact( colObj, otherObj, dispatchInfo, resultOut );
          if ( frac < hitFraction ) {
            hitFraction = frac;
          }
          // revert back
          colObj.internalSetTemporaryCollisionShape( tmpShape );
          colObj.setWorldTransform( orgTrans );
        }
        return hitFraction;
      },

      getAllContactManifolds: function( manifoldArray ) {
        var m_childCollisionAlgorithms = this.childCollisionAlgorithms;

        var i;
        for ( i = 0; i < m_childCollisionAlgorithms.length; ++i ) {
          if ( m_childCollisionAlgorithms[i] ) {
            m_childCollisionAlgorithms[i].getAllContactManifolds( manifoldArray );
          }
        }
      }

    },

    typeMembers: {
      CreateFunc: Bump.type({
        parent: Bump.CollisionAlgorithmCreateFunc,
        members: {
          CreateCollisionAlgorithm: function( ci, body0, body1 ) {
            return Bump.CompoundCollisionAlgorithm.create( ci, body0, body1, false );
          }
        }
      }),

      SwappedCreateFunc: Bump.type({
        parent: Bump.CollisionAlgorithmCreateFunc,
        members: {
          CreateCollisionAlgorithm: function( ci, body0, body1 ) {
            return Bump.CompoundCollisionAlgorithm.create( ci, body0, body1, true );
          }
        }
      })

    }
  });

})( this, this.Bump );
