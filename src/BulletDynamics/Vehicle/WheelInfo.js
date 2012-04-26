(function( window, Bump ) {

  Bump.WheelInfoConstructionInfo = Bump.type({
    init: function() {
      this.chassisConnectionCS = Bump.Vector3.create();
      this.wheelDirectionCS = Bump.Vector3.create();
      this.wheelAxleCS = Bump.Vector3.create();
      this.suspensionRestLength = 0;
      this.maxSuspensionTravelCm = 0;
      this.wheelRadius = 0;

      this.suspensionStiffness = 0;
      this.wheelsDampingCompression = 0;
      this.wheelsDampingRelaxation = 0;
      this.frictionSlip = 0;
      this.maxSuspensionForce = 0;
      this.bIsFrontWheel = false;
    }
  });

  Bump.WheelInfo = Bump.type({
    init: function WheelInfo( ci /* WheelInfoConstructionInfo */) {
      this.suspensionRestLength1 = ci.suspensionRestLength;
      this.maxSuspensionTravelCm = ci.maxSuspensionTravelCm;

      this.wheelsRadius = ci.wheelRadius;
      this.suspensionStiffness = ci.suspensionStiffness;
      this.wheelsDampingCompression = ci.wheelsDampingCompression;
      this.wheelsDampingRelaxation = ci.wheelsDampingRelaxation;
      this.chassisConnectionPointCS = ci.chassisConnectionCS;
      this.wheelDirectionCS = ci.wheelDirectionCS;
      this.wheelAxleCS = ci.wheelAxleCS;
      this.frictionSlip = ci.frictionSlip;
      this.steering = 0;
      this.engineForce = 0;
      this.rotation = 0;
      this.deltaRotation = 0;
      this.brake = 0;
      this.rollInfluence = 0.1;
      this.bIsFrontWheel = ci.bIsFrontWheel;
      this.maxSuspensionForce = ci.maxSuspensionForce;

      this.raycastInfo = Bump.WheelInfo.RaycastInfo.create();
      this.worldTransform = Bump.Transform.getIdentity();
      this.clientInfo = null;

      this.clippedInvContactDotSuspension = 0;
      this.suspensionRelativeVelocity = 0;
      //calculated by suspension
      this.wheelsSuspensionForce = 0;
      this.skidInfo = 0;
    },

    members: {
      getSuspensionLength: function() {
        return this.suspensionRestLength1;
      },

      updateWheel: function(
        chassis, /* const btRigidBody& */
        raycastInfo /* RaycastInfo& */
      ) {

        if( this.raycastInfo.isInContact ) {
          var project = this.raycastInfo.contactNormalWS.dot( this.raycastInfo.wheelDirectionWS );
          var chassis_velocity_at_contactPoint = Bump.Vector3.create();
          var relpos = this.raycastInfo.contactPointWS.subtract( chassis.getCenterOfMassPosition() );
          chassis_velocity_at_contactPoint = chassis.getVelocityInLocalPoint( relpos );
          var projVel = this.raycastInfo.contactNormalWS.dot( chassis_velocity_at_contactPoint );
          if ( project >= -0.1) {
            this.suspensionRelativeVelocity = 0.0;
            this.clippedInvContactDotSuspension = 1.0 / 0.1;
          }
          else {
            var inv = -1 / project;
            this.suspensionRelativeVelocity = projVel * inv;
            this.clippedInvContactDotSuspension = inv;
          }
        }
        else {    // Not in contact : position wheel in a nice (rest length) position
          this.raycastInfo.suspensionLength = this.getSuspensionRestLength();
          this.suspensionRelativeVelocity = 0.0;
          this.raycastInfo.contactNormalWS.assign( this.raycastInfo.wheelDirectionWS );
          this.raycastInfo.multiplyScalarSelf( -1 );
          this.clippedInvContactDotSuspension = 1.0;
        }
      }
    }
  });

  Bump.WheelInfo.RaycastInfo = Bump.type({
    init: function() {
      this.contactNormalWS = Bump.Vector3.create(); // contactnormal
      this.contactPointWS = Bump.Vector3.create(); // raycast hitpoint
      this.suspensionLength = 0;
      this.hardPointWS = Bump.Vector3.create(); // raycast starting point
      this.wheelDirectionWS = Bump.Vector3.create(); // direction in worldspace
      this.wheelAxleWS = Bump.Vector3.create(); // axle in worldspace
      this.isInContact = false;
      this.groundObject = null; // could be general void* ptr
    }
  });

})( this, this.Bump );