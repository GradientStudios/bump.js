// load: bump.js
// load: LinearMath/Vector3.js
// load: LinearMath/Matrix3x3.js
// load: LinearMath/Quaternion.js

// run: LinearMath/Transform.js

(function( window, Bump ) {
  Bump.aabbSupport = function( halfExtents, supportDir ) {
    return Bump.Vector3.create(
      supportDir.x < 0 ? -halfExtents.x : halfExtents.x,
      supportDir.y < 0 ? -halfExtents.y : halfExtents.y,
      supportDir.z < 0 ? -halfExtents.z : halfExtents.z
    );
  };

  Bump.TransformUtil = {};
  var ANGULAR_MOTION_THRESHOLD = 0.5 * Math.PI / 2,
      EPSILON = Math.pow( 2, -52 ),
      TransformUtil = Bump.TransformUtil,
      tmpV1 = Bump.Vector3.create(),
      tmpV2 = Bump.Vector3.create(),
      tmpV3 = Bump.Vector3.create(),
      tmpV4 = Bump.Vector3.create(),
      tmpV5 = Bump.Vector3.create(),
      tmpV6 = Bump.Vector3.create(),
      tmpV7 = Bump.Vector3.create(),
      tmpV8 = Bump.Vector3.create(),
      tmpV9 = Bump.Vector3.create(),
      tmpM1 = Bump.Matrix3x3.create(),
      tmpQ1 = Bump.Quaternion.create(),
      tmpQ2 = Bump.Quaternion.create(),
      tmpQ3 = Bump.Quaternion.create(),
      tmpQ4 = Bump.Quaternion.create();

  // Uses the following temporary variables:
  //
  // - `tmpV1`
  // - `tmpV2`
  // - `tmpQ1`
  // - `tmpQ2`
  TransformUtil.integrateTransform = function( curTrans, linvel, angvel, timeStep, predictedTransform ) {
    predictedTransform.setOrigin(
      curTrans.origin.add( linvel.multiplyScalar( timeStep, tmpV1 ), tmpV1 )
    );

    // Exponential map.
    // Google for "Practical Parameterization of Rotations Using the Exponential Map", F. Sebastian Grassia
    var axis,
        fAngle = angvel.length();

    // limit the angular motion
    if ( fAngle * timeStep > ANGULAR_MOTION_THRESHOLD ) {
      fAngle = ANGULAR_MOTION_THRESHOLD / timeStep;
    }

    if ( fAngle < 0.001 ) {
      // use Taylor's expansions of sync function
      axis = angvel.multiplyScalar( 0.5 * timeStep - ( timeStep * timeStep * timeStep ) * 0.020833333333 * fAngle * fAngle, tmpV2 );
    } else {
      axis = angvel.multiplyScalar( Math.sin( 0.5 * fAngle * timeStep ) / fAngle, tmpV2 );
    }

    var dorn = tmpQ1.setValue( axis.x, axis.y, axis.z, Math.cos( fAngle * timeStep * 0.5 ) ),
        orn0 = curTrans.getRotation( tmpQ2 ),
        predictedOrn = dorn.multiplyQuaternion( orn0, tmpQ2 );

    predictedOrn.normalize();
    predictedTransform.setRotation( predictedOrn );
  };

  // Uses the following temporary variables:
  //
  // - `tmpV1`
  // - `tmpV2`
  // - `tmpQ1` ← `calculateDiffAxisAngleQuaternion`
  // - `tmpQ2` ← `calculateDiffAxisAngleQuaternion`
  TransformUtil.calculateVelocityQuaternion = function( pos0, pos1, orn0, orn1, timeStep, linVel, angVel ) {
    linVel = pos1
      .subtract( pos0, tmpV1 )
      .divideScalar( timeStep, tmpV1 )
      .clone( linVel );

    var axis = tmpV1, angle = { angle: 0 };

    if ( orn0.notEqual( orn1 ) ) {
      Bump.TransformUtil.calculateDiffAxisAngleQuaternion( orn0, orn1, axis, angle );
      angVel = axis
        .multiplyScalar( angle.angle, tmpV2 )
        .divideScalar( timeStep, tmpV2 )
        .clone( angVel );
    } else {
      angVel.setValue( 0, 0, 0 );
    }
  };

  // Uses the following temporary variables:
  //
  // - `tmpQ1`
  // - `tmpQ2`
  TransformUtil.calculateDiffAxisAngleQuaternion = function( orn0, orn1a, axis, angle ) {
    var orn1 = orn0.nearest( orn1a, tmpQ1 ),
        dorn = orn1.multiplyQuaternion( orn0.inverse( tmpQ2 ), tmpQ2 ),
        len;

    angle.angle = dorn.getAngle();
    axis.setValue( dorn.x, dorn.y, dorn.z );
    axis.w = 0;

    // check for axis length
    len = axis.length2();
    if ( len < EPSILON * EPSILON ) {
      axis.setValue( 1, 0, 0 );
    } else {
      axis.divideScalarSelf( Math.sqrt( len ) );
    }
  };

  // Uses the following temporary variables:
  //
  // - `tmpV1`
  // - `tmpM1` ← `calculateDiffAxisAngle`
  // - `tmpQ1` ← `calculateDiffAxisAngle`
  TransformUtil.calculateVelocity = function( transform0, transform1, timeStep, linVel, angVel ) {
    linVel = transform1.origin.subtract( transform0.origin, tmpV1 ).divideScalar( timeStep, tmpV1 ).clone( linVel );

    var axis = tmpV1, angle = { angle: 0 };

    Bump.TransformUtil.calculateDiffAxisAngle( transform0, transform1, axis, angle );
    angVel = axis.multiplyScalar( angle.angle, tmpV1 ).divideScalar( timeStep, tmpV1 ).clone( angVel );
  };

  // Uses the following temporary variables:
  //
  // - `tmpM1`
  // - `tmpQ1`
  TransformUtil.calculateDiffAxisAngle = function( transform0, transform1, axis, angle ) {
    var dmat = transform1.basis.multiplyMatrix( transform0.basis.inverse( tmpM1 ), tmpM1 ),
        dorn = tmpQ1,
        len;

    dmat.getRotation( dorn );

    // floating point inaccuracy can lead to *w* component > 1..., which breaks
    dorn.normalize();

    angle.angle = dorn.getAngle();
    axis.setValue( dorn.x, dorn.y, dorn.z );
    axis.w = 0;

    // check for axis length
    len = axis.length2();
    if ( len < EPSILON * EPSILON ) {
      axis.setValue( 1, 0, 0 );
    } else {
      axis.divideScalarSelf( Math.sqrt( len ) );
    }
  };

  Bump.ConvexSeparatingDistanceUtil = Bump.type({
    init: function ConvexSeparatingDistanceUtil( boundingRadiusA, boundingRadiusB ) {
      this.ornA = Bump.Quaternion.create();
      this.ornB = Bump.Quaternion.create();
      this.posA = Bump.Vector3.create();
      this.posB = Bump.Vector3.create();

      this.separatingNormal = Bump.Vector3.create();

      this.boundingRadiusA = boundingRadiusA;
      this.boundingRadiusB = boundingRadiusB;
      this.separatingDistance = 0;
    },

    members: {
      getConservativeSeparatingDistance: function() {
        return this.separatingDistance;
      },

      // Uses the following temporary variables:
      //
      // - `tmpV3`
      // - `tmpV4`
      // - `tmpV5`
      // - `tmpV6`
      // - `tmpV7`
      // - `tmpV8`
      // - `tmpV9`
      // - `tmpQ3`
      // - `tmpQ4`
      // - `tmpV1` ← `calculateVelocityQuaternion`
      // - `tmpV2` ← `calculateVelocityQuaternion`
      // - `tmpQ1` ← `calculateVelocityQuaternion`
      // - `tmpQ2` ← `calculateVelocityQuaternion`
      updateSeparatingDistance: function( transA, transB ) {
        var toPosA = transA.origin.clone( tmpV3 ),
            toPosB = transB.origin.clone( tmpV4 ),
            toOrnA = transA.getRotation( tmpQ3 ),
            toOrnB = transB.getRotation( tmpQ4 );

        if ( this.separatingDistance > 0 ) {
          var linVelA = tmpV5,
              angVelA = tmpV6,
              linVelB = tmpV7,
              angVelB = tmpV8;

          Bump.TransformUtil.calculateVelocityQuaternion( this.posA, toPosA, this.ornA, toOrnA, 1, linVelA, angVelA );
          Bump.TransformUtil.calculateVelocityQuaternion( this.posB, toPosB, this.ornB, toOrnB, 1, linVelB, angVelB );

          var maxAngularProjectedVelocity = angVelA.length() * this.boundingRadiusA + angVelB.length() * this.boundingRadiusB,
              relLinVel = linVelB.subtract( linVelA, tmpV9 ),
              relLinVelocLength = relLinVel.dot( this.separatingNormal );
          if ( relLinVelocLength < 0 ) {
            relLinVelocLength = 0;
          }

          var projectedMotion = maxAngularProjectedVelocity + relLinVelocLength;
          this.separatingDistance -= projectedMotion;
        }

        this.posA = toPosA.clone( this.posA );
        this.posB = toPosB.clone( this.posB );
        this.ornA = toOrnA.clone( this.ornA );
        this.ornB = toOrnB.clone( this.ornB );
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      // - `tmpQ1`
      // - `tmpQ2`
      initSeparatingDistance: function( separatingVector, separatingDistance, transA, transB ) {
        this.separatingDistance = separatingDistance;

        if ( this.separatingDistance > 0 ) {
          this.separatingNormal = separatingVector;

          var toPosA = transA.origin.clone( tmpV1 ),
              toPosB = transB.origin.clone( tmpV2 ),
              toOrnA = transA.getRotation( tmpQ1 ),
              toOrnB = transB.getRotation( tmpQ2 );
          this.posA = toPosA.clone( this.posA );
          this.posB = toPosB.clone( this.posB );
          this.ornA = toOrnA.clone( this.ornA );
          this.ornB = toOrnB.clone( this.ornB );
        }
      }
    }
  });
})( this, this.Bump );
