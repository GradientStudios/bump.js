(function( window, Bump ) {

  Bump.ConstraintRow = Bump.type({
    init: function ConstraintRow() {
      this.normal = [ 0, 0, 0 ];
      this.rhs = 0;
      this.jacDiagInv = 0;
      this.lowerLimit = 0;
      this.upperLimit = 0;
      this.accumImpulse = 0;
    }
  });

  Bump.ManifoldPoint = Bump.type({
    members: {
      init: function ManifoldPoint() {
        this.localPointA = Bump.Vector3.create();
        this.localPointB = Bump.Vector3.create();
        this.positionWorldOnB = Bump.Vector3.create();
        this.positionWorldOnA = Bump.Vector3.create();
        this.normalWorldOnB = Bump.Vector3.create();

        this.distance1 = 0;
        this.combinedFriction = 0;
        this.combinedRestitution = 0;

        // BP mod, store contact triangles.
        this.partId0 = 0;
        this.partId1 = 0;
        this.index0 = 0;
        this.index1 = 0;

        this.userPersistentData = null;
        this.appliedImpulse = 0;

        this.lateralFrictionInitialized = false;
        this.appliedImpulseLateral1 = 0;
        this.appliedImpulseLateral2 = 0;
        this.contactMotion1 = 0;
        this.contactMotion2 = 0;
        this.contactCFM1 = 0;
        this.contactCFM2 = 0;

        // Lifetime of the contactpoint in frames.
        this.lifeTime = 0;

        this.lateralFrictionDir1 = Bump.Vector3.create();
        this.lateralFrictionDir2 = Bump.Vector3.create();

        this.constraintRow = [
          Bump.ConstraintRow.create(),
          Bump.ConstraintRow.create(),
          Bump.ConstraintRow.create()
        ];
      },

      initWithContactPoint: function ManifoldPoint( pointA, pointB, normal, distance ) {
        this.localPointA = pointA.clone();
        this.localPointB = pointB.clone();
        this.positionWorldOnB = normal.clone();
        this.positionWorldOnA = Bump.Vector3.create();
        this.normalWorldOnB = Bump.Vector3.create();

        this.distance1 = distance;
        this.combinedFriction = 0;
        this.combinedRestitution = 0;

        // BP mod, store contact triangles.
        this.partId0 = 0;
        this.partId1 = 0;
        this.index0 = 0;
        this.index1 = 0;

        this.userPersistentData = null;
        this.appliedImpulse = 0;

        this.lateralFrictionInitialized = false;
        this.appliedImpulseLateral1 = 0;
        this.appliedImpulseLateral2 = 0;
        this.contactMotion1 = 0;
        this.contactMotion2 = 0;
        this.contactCFM1 = 0;
        this.contactCFM2 = 0;

        // Lifetime of the contactpoint in frames.
        this.lifeTime = 0;

        this.lateralFrictionDir1 = Bump.Vector3.create();
        this.lateralFrictionDir2 = Bump.Vector3.create();

        this.constraintRow = [
          Bump.ConstraintRow.create(),
          Bump.ConstraintRow.create(),
          Bump.ConstraintRow.create()
        ];

        this.constraintRow[0].accumImpulse = 0;
        this.constraintRow[1].accumImpulse = 0;
        this.constraintRow[2].accumImpulse = 0;
      },

      getDistance: function() {
        return this.distance1;
      },

      getLifeTime: function() {
        return this.lifeTime;
      },

      // `positionWorldOnA` is redundant in that it is normally calculated as:
      //
      //     positionWorldOnA = positionWorldOnB + normalWorldOnB * distance1;
      getPositionWorldOnA: function() {
        return this.positionWorldOnA;
      },

      getPositionWorldOnB: function() {
        return this.positionWorldOnB;
      },

      setDistance: function( dist ) {
        this.distance1 = dist;
      },

      getAppliedImpulse: function() {
        return this.appliedImpulse;
      }
    },

    typeMembers: {
      create: function( pointA, pointB, normal, distance ) {
        var manifoldPoint = Object.create( Bump.ManifoldPoint.prototype );
        if ( arguments.length ) {
          manifoldPoint.initWithContactPoint( pointA, pointB, normal, distance );
        } else {
          manifoldPoint.init();
        }
        return manifoldPoint;
      }
    }
  });

})( this, this.Bump );
