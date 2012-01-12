(function( window, Bump ) {
  var ACTIVE_TAG = 1,
      ISLAND_SLEEPING = 2,
      WANTS_DEACTIVATION = 3,
      DISABLE_DEACTIVATION = 4,
      DISABLE_SIMULATION = 5;

  var declareEnum = function( values ) {
    var myEnum = {}, currentValue = 0;

    for ( var i = 0; i < values.length; ++i ) {
      if ( typeof values[i] === 'object' ) {
        var id = values[i].id || values[i].name || values[i].string;
        currentValue = Math.round( values[i].value ) || currentValue;
        myEnum[id] = currentValue;
      } else {
        myEnum[ values[i] ] = currentValue;
      }

      ++currentValue;
    }

    return myEnum;
  };

  Bump.CollisionObject = Bump.type({
    init: function CollisionObject() {
      this.worldTransform = Bump.Transform.create();
      this.interpolationWorldTransform = Bump.Transform.create();
      this.interpolationLinearVelocity = Bump.Vector3.create();
      this.interpolationAngularVelocity = Bump.Vector3.create();
      this.anisotropicFriction = Bump.Vector3.create( 1, 1, 1 );
      this.hasAnisotropicFriction = false;
      this.contactProcessingThreshold = Infinity;
      this.broadphaseHandle = null;
      this.collisionShape = null;
      this.extensionPointer = null;
      this.rootCollisionShape = null;
      this.collisionFlags = Bump.CollisionObject.CollisionFlags.CF_STATIC_OBJECT;
      this.islandTag1 = -1;
      this.companionId = -1;
      this.activationState1 = 1;
      this.deactivationTime = 0;
      this.friction = 0.5;
      this.restitution = 0;
      this.internalType = Bump.CollisionObject.CollisionObjectTypes.CO_COLLISION_OBJECT;
      this.userObjectPointer = null;
      this.hitFraction = 1;
      this.ccdSweptSphereRadius = 0;
      this.ccdMotionThreshold = 0;
      this.checkCollideWith = false;

      this.worldTransform.setIdentity();
    },

    members: {
      clone: function( dest ) {
        dest = dest || Bump.CollisionObject.create();

        dest.worldTransform = this.worldTransform.clone();
        dest.interpolationWorldTransform = this.interpolationWorldTransform.clone();
        dest.interpolationLinearVelocity = this.interpolationLinearVelocity.clone();
        dest.interpolationAngularVelocity = this.interpolationAngularVelocity.clone();
        dest.anisotropicFriction = this.anisotropicFriction.clone();
        dest.hasAnisotropicFriction = this.hasAnisotropicFriction;
        dest.contactProcessingThreshold = this.contactProcessingThreshold;
        dest.broadphaseHandle = this.broadphaseHandle;
        dest.collisionShape = this.collisionShape;
        dest.extensionPointer = this.extensionPointer;
        dest.rootCollisionShape = this.rootCollisionShape;
        dest.collisionFlags = this.collisionFlags;
        dest.islandTag1 = this.islandTag1;
        dest.companionId = this.companionId;
        dest.activationState1 = this.activationState1;
        dest.deactivationTime = this.deactivationTime;
        dest.friction = this.friction;
        dest.restitution = this.restitution;
        dest.internalType = this.internalType;
        dest.userObjectPointer = this.userObjectPointer;
        dest.hitFraction = this.hitFraction;
        dest.ccdSweptSphereRadius = this.ccdSweptSphereRadius;
        dest.ccdMotionThreshold = this.ccdMotionThreshold;
        dest.checkCollideWith = this.checkCollideWith;

        return dest;
      },

      assign: function( other ) {
        this.worldTransform.assign( other.worldTransform );
        this.interpolationWorldTransform.assign( other.interpolationWorldTransform );
        this.interpolationLinearVelocity.assign( other.interpolationLinearVelocity );
        this.interpolationAngularVelocity.assign( other.interpolationAngularVelocity );
        this.anisotropicFriction.assign( other.anisotropicFriction );
        this.hasAnisotropicFriction = other.hasAnisotropicFriction;
        this.contactProcessingThreshold = other.contactProcessingThreshold;
        this.broadphaseHandle = other.broadphaseHandle;
        this.collisionShape = other.collisionShape;
        this.extensionPointer = other.extensionPointer;
        this.rootCollisionShape = other.rootCollisionShape;
        this.collisionFlags = other.collisionFlags;
        this.islandTag1 = other.islandTag1;
        this.companionId = other.companionId;
        this.activationState1 = other.activationState1;
        this.deactivationTime = other.deactivationTime;
        this.friction = other.friction;
        this.restitution = other.restitution;
        this.internalType = other.internalType;
        this.userObjectPointer = other.userObjectPointer;
        this.hitFraction = other.hitFraction;
        this.ccdSweptSphereRadius = other.ccdSweptSphereRadius;
        this.ccdMotionThreshold = other.ccdMotionThreshold;
        this.checkCollideWith = other.checkCollideWith;

        return this;
      },

      checkCollideWithOverride: function() {
        return true;
      },

      // Static objects, kinematic and object without contact response don't
      // merge islands.
      mergesSimulationIslands: function() {
        return (
          ( this.collisionFlags &
            ( Bump.CollisionObject.CollisionFlags.CF_STATIC_OBJECT |
              Bump.CollisionObject.CollisionFlags.CF_KINEMATIC_OBJECT |
              Bump.CollisionObject.CollisionFlags.CF_NO_CONTACT_RESPONSE )
          ) === 0
        );
      },

      getAnisotropicFriction: function() {
        return this.anisotropicFriction;
      },

      setAnisotropicFriction: function( anisotropicFriction ) {
        this.anisotropicFriction.assign( anisotropicFriction );
        this.hasAnisotropicFriction =
          ( anisotropicFriction.x !== 1 ) ||
          ( anisotropicFriction.y !== 1 ) ||
          ( anisotropicFriction.z !== 1 );
      },

      hasAnisotropicFriction: function() {
        return this.hasAnisotropicFriction;
      },

      // The constraint solver can discard solving contacts, if the distance is
      // above this threshold. 0 by default. Note that using contacts with
      // positive distance can improve stability. It increases, however, the
      // chance of colliding with degerate contacts, such as 'interior' triangle
      // edges.
      setContactProcessingThreshold: function( contactProcessingThreshold ) {
        this.contactProcessingThreshold = contactProcessingThreshold;
      },

      getContactProcessingThreshold: function() {
        return this.contactProcessingThreshold;
      },

      isStaticObject: function() {
        return (
          this.collisionFlags & Bump.CollisionObject.CollisionFlags.CF_STATIC_OBJECT
        ) !== 0;
      },

      isKinematicObject: function() {
        return (
          this.collisionFlags & Bump.CollisionObject.CollisionFlags.CF_KINEMATIC_OBJECT
        ) !== 0;
      },

      isStaticOrKinematicObject: function() {
        return (
          this.collisionFlags &
            ( Bump.CollisionObject.CollisionFlags.CF_KINEMATIC_OBJECT |
              Bump.CollisionObject.CollisionFlags.CF_STATIC_OBJECT )
        ) !== 0;
      },

      hasContactResponse: function() {
        return (
          this.collisionFlags & Bump.CollisionObject.CollisionFlags.CF_NO_CONTACT_RESPONSE
        ) === 0;
      },

      setCollisionShape: function( collisionShape ) {
        this.collisionShape = collisionShape;
        this.rootCollisionShape = collisionShape;
      },

      getCollisionShape: function() {
        return this.collisionShape;
      },

      getRootCollisionShape: function() {
        return this.rootCollisionShape;
      },

      // **Warning:** Avoid using this internal API call.
      // `internalSetTemporaryCollisionShape` is used to temporary replace the
      // actual collision shape by a child collision shape.
      internalSetTemporaryCollisionShape: function( collisionShape ) {
        this.collisionShape = collisionShape;
      },

      // **Warning:** Avoid using this internal API call, the extension pointer
      // is used by some Bullet extensions. If you need to store your own user
      // pointer, use `setUserPointer`/`getUserPointer` instead.
      internalGetExtensionPointer: function() {
        return this.extensionPointer;
      },

      getActivationState: function() {
        return this.activationState1;
      },

      setActivationState: function( newState ) {
        var deactivationDisabled = this.activationState1 === DISABLE_DEACTIVATION,
            simulationDisabled = this.activationState1 === DISABLE_SIMULATION;

        if ( !deactivationDisabled && !simulationDisabled ) {
          this.activationState1 = newState;
        }
      },

      setDeactivationTime: function( time ) {
        this.deactivationTime = time;
      },

      getDeactivationTime: function() {
        return this.deactivationTime;
      },

      forceActivationState: function( newState ) {
        this.activationState1 = newState;
      },

      activate: function( forceActivation ) {
        forceActivation = forceActivation || false;
        if (
          forceActivation ||
            !( this.collisionFlags &
               ( Bump.CollisionObject.CollisionFlags.CF_STATIC_OBJECT |
                 Bump.CollisionObject.CollisionFlags.CF_KINEMATIC_OBJECT ) )
        ) {
          this.setActivationState( ACTIVE_TAG );
          this.deactivationTime = 0;
        }
      },

      isActive: function() {
        return ( ( this.activationState1 !== ISLAND_SLEEPING ) &&
                 ( this.activationState1 !== DISABLE_SIMULATION ) );
      },

      setRestitution: function( rest ) {
        this.restitution = rest;
        return this;
      },

      getRestitution: function() {
        return this.restitution;
      },

      setFriction: function( frict ) {
        this.friction = frict;
      },

      getFriction: function() {
        return this.friction;
      },

      // **Warning:** Reserved for Bullet internal usage.
      getInternalType: function() {
        return this.internalType;
      },

      getWorldTransform: function() {
        return this.worldTransform;
      },

      setWorldTransform: function( worldTrans ) {
        this.worldTransform.assign( worldTrans );
      },

      getBroadphaseHandle: function() {
        return this.broadphaseHandle;
      },

      setBroadphaseHandle: function( handle ) {
        this.broadphaseHandle = handle;
      },

      getInterpolationWorldTransform: function() {
        return this.interpolationWorldTransform;
      },

      setInterpolationWorldTransform: function( trans ) {
        this.interpolationWorldTransform.assign( trans );
      },

      setInterpolationLinearVelocity: function( linvel ) {
        this.interpolationLinearVelocity.assign( linvel );
      },

      setInterpolationAngularVelocity: function( angvel ) {
        this.interpolationAngularVelocity.assign( angvel );
      },

      getInterpolationLinearVelocity: function() {
        return this.interpolationLinearVelocity;
      },

      getInterpolationAngularVelocity: function() {
        return this.interpolationAngularVelocity;
      },

      getIslandTag: function() {
        return this.islandTag1;
      },

      setIslandTag: function( tag ) {
        this.islandTag1 = tag;
      },

      getCompanionId: function() {
        return this.companionId;
      },

      setCompanionId: function( id ) {
        this.companionId = id;
      },

      getHitFraction: function() {
        return this.hitFraction;
      },

      setHitFraction: function( hitFraction ) {
        this.hitFraction = hitFraction;
      },

      getCollisionFlags: function() {
        return this.collisionFlags;
      },

      setCollisionFlags: function( flags ) {
        this.collisionFlags = flags;
      },

      // Swept sphere radius (0.0 by default), see `ConvexConvexAlgorithm`.
      getCcdSweptSphereRadius: function() {
        return this.ccdSweptSphereRadius;
      },

      setCcdSweptSphereRadius: function( radius ) {
        this.ccdSweptSphereRadius = radius;
      },

      getCcdMotionThreshold: function() {
        return this.ccdMotionThreshold;
      },

      getCcdSquareMotionThreshold: function() {
        return this.ccdMotionThreshold * this.ccdMotionThreshold;
      },

      // Don't do continuous collision detection if the motion (in one step) is
      // less then `ccdMotionThreshold`.
      setCcdMotionThreshold: function( ccdMotionThreshold ) {
        this.ccdMotionThreshold = ccdMotionThreshold;
      },

      // Users can point to their objects, `userPointer` is not used by Bullet.
      getUserPointer: function() {
        return this.userObjectPointer;
      },

      setUserPointer: function( userPointer ) {
        this.userObjectPointer = userPointer;
      },

      checkCollideWith: function( co ) {
        if ( this.checkCollideWith ) {
          return this.checkCollideWithOverride( co );
        }

        return true;
      }

    }
  });

  Bump.CollisionObject.CollisionFlags = declareEnum([
    { id: 'CF_STATIC_OBJECT',                    value:  1 },
    { id: 'CF_KINEMATIC_OBJECT',                 value:  2 },
    { id: 'CF_NO_CONTACT_RESPONSE',              value:  4 },
    { id: 'CF_CUSTOM_MATERIAL_CALLBACK',         value:  8 }, // This allows per-triangle material (friction/restitution).
    { id: 'CF_CHARACTER_OBJECT',                 value: 16 },
    { id: 'CF_DISABLE_VISUALIZE_OBJECT',         value: 32 }, // Disable debug drawing
    { id: 'CF_DISABLE_SPU_COLLISION_PROCESSING', value: 64 }  // Disable parallel/SPU processing
  ]);

  Bump.CollisionObject.CollisionObjectTypes = declareEnum([
    { id: 'CO_COLLISION_OBJECT', value:  1 },
    { id: 'CO_RIGID_BODY',       value:  2 },
    // `CO_GHOST_OBJECT` keeps track of all objects overlapping its AABB and
    // that pass its collision filter. It is useful for collision sensors,
    // explosion objects, character controller, etc.
    { id: 'CO_GHOST_OBJECT',     value:  4 },
    { id: 'CO_SOFT_BODY',        value:  8 },
    { id: 'CO_HF_FLUID',         value: 16 },
    { id: 'CO_USER_TYPE',        value: 32 }
  ]);

})( this, this.Bump );
