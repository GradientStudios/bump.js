// load: bump.js
// load: LinearMath/Vector3.js
// load: LinearMath/Transform.js

// run: BulletCollision/BroadphaseCollision/BroadphaseProxy.js

(function( window, Bump ) {
  var tmpV1, tmpV2, tmpV3, tmpV4, tmpT1;
  var radius = { value: 0 };

  Bump.CollisionShapeData = Bump.type({
    init: function CollisionShapeData() {
      this.name = '';
      this.shapeType = 0;
    }
  });

  Bump.CollisionShape = Bump.type({
    init: function CollisionShape() {
      this.shapeType = Bump.BroadphaseNativeTypes.INVALID_SHAPE_PROXYTYPE;
      this.userPointer = null;
    },

    members: {
      clone: function( dest ) {
        dest = dest || Bump.CollisionShape.create();

        dest.shapeType = this.shapeType;
        dest.userPointer = this.userPointer;

        return dest;
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      // - `tmpV3`
      // - `tmpT1`
      getBoundingSphere: function( center, radius ) {
        var tr = tmpT1;
        tr.setIdentity();
        var aabbMin = tmpV1, aabbMax = tmpV2;

        this.getAabb( tr, aabbMin, aabbMax );

        radius.value = aabbMax.subtract( aabbMin, tmpV3 ).length() * 0.5;
        center = aabbMin.add( aabbMax, tmpV3 ).multiplyScalar( 0.5, center );

        return this;
      },

      // Returns the maximum radius needed for Conservative Advancement to
      // handle time-of-impact with rotations.
      //
      // Uses the following temporary variables:
      //
      // - `tmpV1` ← `getBoundingSphere`
      // - `tmpV2` ← `getBoundingSphere`
      // - `tmpV3` ← `getBoundingSphere`
      // - `tmpV4`
      // - `tmpT1` ← `getBoundingSphere`
      //
      // `TODO`: cache this value, to improve performance
      getAngularMotionDisc: function() {
        var center = tmpV4;
        radius.value = 0;

        this.getBoundingSphere( center, radius );
        radius.value += center.length();
        return radius.value;
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1` ← `getAngularMotionDisc`
      // - `tmpV2` ← `getAngularMotionDisc`
      // - `tmpV3` ← `getAngularMotionDisc`
      // - `tmpV4` ← `getAngularMotionDisc`
      // - `tmpT1` ← `getAngularMotionDisc`
      getContactBreakingThreshold: function( defaultContactThreshold ) {
        return this.getAngularMotionDisc() * defaultContactThreshold;
      },

      // Calculates the enclosing aabb for the moving object over interval
      // `[0..timeStep)`. Result is conservative.
      //
      // Uses the following temporary variables:
      //
      // - `tmpV1` ← `getAngularMotionDisc`
      // - `tmpV2` ← `getAngularMotionDisc`
      // - `tmpV3` ← `getAngularMotionDisc`
      // - `tmpV4` ← `getAngularMotionDisc`
      // - `tmpT1` ← `getAngularMotionDisc`
      calculateTemporalAabb: function( curTrans, linvel, angvel, timeStep, temporalAabbMin, temporalAabbMax ) {
        // Start with static aabb.
        this.getAabb(curTrans, temporalAabbMin, temporalAabbMax );

        var temporalAabbMaxx = temporalAabbMax.x,
            temporalAabbMaxy = temporalAabbMax.y,
            temporalAabbMaxz = temporalAabbMax.z,
            temporalAabbMinx = temporalAabbMin.x,
            temporalAabbMiny = temporalAabbMin.y,
            temporalAabbMinz = temporalAabbMin.z;

        // Add linear motion.
        var linMotion = linvel.multiplyScalar( timeStep, tmpV1 );

        if ( linMotion.x > 0 ) {
          temporalAabbMaxx += linMotion.x;
        } else {
          temporalAabbMinx += linMotion.x;
        }

        if ( linMotion.y > 0 ) {
          temporalAabbMaxy += linMotion.y;
        } else {
          temporalAabbMiny += linMotion.y;
        }

        if ( linMotion.z > 0 ) {
          temporalAabbMaxz += linMotion.z;
        } else {
          temporalAabbMinz += linMotion.z;
        }

        // Add conservative angular motion.
        var angularMotion = angvel.length() * this.getAngularMotionDisc() * timeStep,
            angularMotion3d = tmpV1.setValue( angularMotion, angularMotion, angularMotion );

        temporalAabbMin.setValue( temporalAabbMinx, temporalAabbMiny, temporalAabbMinz );
        temporalAabbMax.setValue( temporalAabbMaxx, temporalAabbMaxy, temporalAabbMaxz );

        temporalAabbMin.subtractSelf( angularMotion3d );
        temporalAabbMax.addSelf( angularMotion3d );

        return this;
      },

      isPolyhedral: function() {
        return Bump.BroadphaseProxy.isPolyhedral( this.shapeType );
      },

      isConvex2d: function() {
        return Bump.BroadphaseProxy.isConvex2d( this.shapeType );
      },

      isConvex: function() {
        return Bump.BroadphaseProxy.isConvex( this.shapeType );
      },

      isNonMoving: function() {
        return Bump.BroadphaseProxy.isNonMoving( this.shapeType );
      },

      isConcave: function() {
        return Bump.BroadphaseProxy.isConcave( this.shapeType );
      },

      isCompound: function() {
        return Bump.BroadphaseProxy.isCompound( this.shapeType );
      },

      isSoftBody: function() {
        return Bump.BroadphaseProxy.isSoftBody( this.shapeType );
      },

      // `isInfinite` is used to catch simulation error (aabb check)
      isInfinite: function() {
        return Bump.BroadphaseProxy.isInfinite( this.shapeType );
      },

      getShapeType: function() {
        return this.shapeType;
      },

      // Optional user data pointer
      setUserPointer: function( userPtr ) {
        this.userPointer = userPtr;
      },

      getUserPointer: function() {
        return this.userPointer;
      },

      calculateSerializeBufferSize: function() {
        // `return sizeof( Bump.CollisionShapeData );`
      },

      serialize: function( dataBuffer, serializer ) {
        var shapeData = dataBuffer;
        var name = serializer.findNameForPointer( this );
        shapeData.name = serializer.getUniquePointer( name );
        if ( shapeData.name ) {
          serializer.serializeName( name );
        }
        shapeData.shapeType = this.shapeType;
        return "btCollisionShapeData";
      },

      serializeSingleShape: function( serializer ) {
        var len = this.calculateSerializeBufferSize();
        var chunk = serializer.allocate( len, 1 );
        var structType = this.serialize( chunk.oldPtr, serializer );
        serializer.finalizeChunk( chunk, structType, Bump.BT_SHAPE_CODE, this );
      }

    }
  });

  // Internally used temporary variables, to avoid memory allocations
  tmpV1 = Bump.Vector3.create();
  tmpV2 = Bump.Vector3.create();
  tmpV3 = Bump.Vector3.create();
  tmpV4 = Bump.Vector3.create();
  tmpT1 = Bump.Transform.create();
})( this, this.Bump );
