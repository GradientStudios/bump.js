(function( window, Bump ) {

  Bump.ConstraintRow = Bump.type({
    init: function ConstraintRow() {
      this.normal = [ 0, 0, 0 ];
      this.rhs = 0;
      this.jacDiagInv = 0;
      this.lowerLimit = 0;
      this.upperLimit = 0;
      this.accumImpulse = 0;
    },

    members: {
      clone: function( dest ) {
        dest = dest || Bump.ConstraintRow.create();

        dest.normal[0] = this.normal[0];
        dest.normal[1] = this.normal[1];
        dest.normal[2] = this.normal[2];

        dest.rhs = this.rhs;
        dest.jacDiagInv = this.jacDiagInv;
        dest.lowerLimit = this.lowerLimit;
        dest.upperLimit = this.upperLimit;
        dest.accumImpulse = this.accumImpulse;

        return dest;
      },

      assign: function( other ) {
        this.normal[0] = other.normal[0];
        this.normal[1] = other.normal[1];
        this.normal[2] = other.normal[2];

        this.rhs = other.rhs;
        this.jacDiagInv = other.jacDiagInv;
        this.lowerLimit = other.lowerLimit;
        this.upperLimit = other.upperLimit;
        this.accumImpulse = other.accumImpulse;

        return this;
      }
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

      clone: function( dest ) {
        dest = dest || Bump.ManifoldPoint.create();

        dest.localPointA.assign( this.localPointA );
        dest.localPointB.assign( this.localPointB );
        dest.positionWorldOnB.assign( this.positionWorldOnB );
        dest.positionWorldOnA.assign( this.positionWorldOnA );
        dest.normalWorldOnB.assign( this.normalWorldOnB );

        dest.distance1 = this.distance1;
        dest.combinedFriction = this.combinedFriction;
        dest.combinedRestitution = this.combinedRestitution;

        dest.partId0 = this.partId0;
        dest.partId1 = this.partId1;
        dest.index0 = this.index0;
        dest.index1 = this.index1;

        dest.userPersistentData = this.userPersistentData;
        dest.appliedImpulse = this.appliedImpulse;

        dest.lateralFrictionInitialized = this.lateralFrictionInitialized;
        dest.appliedImpulseLateral1 = this.appliedImpulseLateral1;
        dest.appliedImpulseLateral2 = this.appliedImpulseLateral2;
        dest.contactMotion1 = this.contactMotion1;
        dest.contactMotion2 = this.contactMotion2;
        dest.contactCFM1 = this.contactCFM1;
        dest.contactCFM2 = this.contactCFM2;

        dest.lifeTime = this.lifeTime;

        dest.lateralFrictionDir1.assign( this.lateralFrictionDir1 );
        dest.lateralFrictionDir2.assign( this.lateralFrictionDir2 );

        return dest;
      },

      assign: function( other ) {
        this.localPointA.assign( other.localPointA );
        this.localPointB.assign( other.localPointB );
        this.positionWorldOnB.assign( other.positionWorldOnB );
        this.positionWorldOnA.assign( other.positionWorldOnA );
        this.normalWorldOnB.assign( other.normalWorldOnB );

        this.distance1 = other.distance1;
        this.combinedFriction = other.combinedFriction;
        this.combinedRestitution = other.combinedRestitution;

        this.partId0 = other.partId0;
        this.partId1 = other.partId1;
        this.index0 = other.index0;
        this.index1 = other.index1;

        this.userPersistentData = other.userPersistentData;
        this.appliedImpulse = other.appliedImpulse;

        this.lateralFrictionInitialized = other.lateralFrictionInitialized;
        this.appliedImpulseLateral1 = other.appliedImpulseLateral1;
        this.appliedImpulseLateral2 = other.appliedImpulseLateral2;
        this.contactMotion1 = other.contactMotion1;
        this.contactMotion2 = other.contactMotion2;
        this.contactCFM1 = other.contactCFM1;
        this.contactCFM2 = other.contactCFM2;

        this.lifeTime = other.lifeTime;

        this.lateralFrictionDir1.assign( other.lateralFrictionDir1 );
        this.lateralFrictionDir2.assign( other.lateralFrictionDir2 );

        return this;
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
