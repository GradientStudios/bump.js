/*
  Bullet Continuous Collision Detection and Physics Library
  Copyright (c) 2003-2006 Erwin Coumans  http://continuousphysics.com/Bullet/

  This software is provided 'as-is', without any express or implied warranty.
  In no event will the authors be held liable for any damages arising from the use of this software.
  Permission is granted to anyone to use this software for any purpose,
  including commercial applications, and to alter it and redistribute it freely,
  subject to the following restrictions:

  1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
  2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
  3. This notice may not be removed or altered from any source distribution.
*/

//notes:
// Another memory optimization would be to store m_minvJt1 in the remaining 3 w components
// which makes the btJacobianEntry memory layout 16 bytes
// if you only are interested in angular part, just feed massInvA and massInvB zero

/// Jacobian entry is an abstraction that allows to describe constraints
/// it can be used in combination with a constraint solver
/// Can be used to relate the effect of an impulse to the constraint error

(function( window, Bump ) {

  var tmpVec1 = Bump.Vector3.create();

  Bump.JacobianEntry = Bump.type({

    init: function( linearJointAxis, aJ, bJ, minvJt0, minvJt1, Adiag ) {
      this.linearJointAxis = linearJointAxis || Bump.Vector3.create();
      this.aJ = aJ || Bump.Vector3.create();
      this.bJ = bJ || Bump.Vector3.create();
      this.minvJt0 = minvJt0 || Bump.Vector3.create();
      this.minvJt1 = minvJt1 || Bump.Vector3.create();
      //Optimization: can be stored in the w/last component of one of the vectors
      this.Adiag = Adiag || 0;
    },

    members: {
      getDiagonal: function() {
        return this.Adiag;
      },

      // for two constraints on the same rigidbody (for example vehicle friction)
      _getNonDiagonalSingleRigidBody: function(
        jacB, // const btJacobianEntry&
        massInvA // const btScalar
      ) {
        var jacA = this;
        var lin = massInvA * jacA.linearJointAxis.dot( jacB.linearJointAxis );
        var ang = jacA.minvJt0.dot( jacB.aJ );
        return lin + ang;
      },

      // for two constraints on sharing two same rigidbodies (for example two contact points between two rigidbodies)
      _getNonDiagonalTwoRigidBodies: function(
        jacB, // const btJacobianEntry&
        massInvA, // const btScalar
        massInvB // const btScalar
      ) {
        var jacA = this;
        var lin = jacA.m_linearJointAxis * jacB.m_linearJointAxis; /* btVector3 */
        var ang0 = jacA.m_minvJt0.multiplyVector( jacB.aJ );
        var ang1 = jacA.m_minvJt1.multiplyVector( jacB.bJ );
        var lin0 = lin.multiplyScalar( massInvA );
        var lin1 = lin.multiplyScalar( massInvB );
        var sum = ang0 + ang1 + lin0 + lin1;
        return sum[ 0 ] + sum[ 1 ] + sum[ 2 ];
      },

      getNonDiagonal: function(
        jacB,
        massInvA,
        _massInvB // optional
      ) {
        if( _massInvB === undefined ) {
          return this._getNonDiagonalSingleRigidBody.call( jacB, massInvA );
        }
        return this._getNonDiagonalTwoRigidBodies.call( jacB, massInvA, _massInvB );
      },

      getRelativeVelocity: function(
        linvelA, // const btVector3&
        angvelA, // const btVector3&
        linvelB, // const btVector3&
        angvelB // const btVector3&
      ) {
        var linrel = linvelA.subtract( linvelB );
        var angvela = angvelA.subtract( this.aJ );
        var angvelb = angvelB.subtract( this.bJ );
        linrel.multiplyVectorSelf( this.linearJointAxis );
        angvela.addSelf( angvelb );
        angvela.addSelf( linrel );
        var rel_vel2 = angvela[ 0 ] + angvela[ 1 ] + angvela[ 2 ];
        return rel_vel2 + Bump.SIMD_EPSILON;
      }
    },

    typeMembers: {
      create: function() {
        // call correct `create` based on number of arguments
        var context = Bump.JacobianEntry;
        if( arguments.length === 0 ) {
          return context._create0.apply( context, arguments );
        }
        if( arguments.length === 4 ) {
          return context._create4.apply( context, arguments );
        }
        if( arguments.length === 5 ) {
          return context._create5.apply( context, arguments );
        }
        if( arguments.length === 6 ) {
          return context._create6.apply( context, arguments );
        }
        if( arguments.length === 9 ) {
          return context._create9.apply( context, arguments );
        }

        console.error( 'JacobianEntry created with invalid number of arguments.' );
        Bump.Assert( false );
      },

      _create0: function() {
        var je = Object.create( Bump.JacobianEntry.prototype );
        return je.init();
      },

      //constraint between two different rigidbodies
      _create9: function(
        world2A, /* const btMatrix3x3& */
        world2B, /* const btMatrix3x3& */
        rel_pos1, /* const btVector3& */
        rel_pos2, /* const btVector3& */
        jointAxis, /* const btVector3& */
        inertiaInvA, /* const btVector3& */
        massInvA, /* const btScalar */
        inertiaInvB, /* const btVector3& */
        massInvB /* const btScalar */
      ) {
        var je = Object.create( Bump.JacobianEntry.prototype );

        var linearJointAxis = jointAxis.clone();
        var aJ = world2A.multiplyVector( rel_pos1.cross( linearJointAxis, tmpVec1 ));
        var bJ = world2B.multiplyVector( rel_pos2.cross( linearJointAxis.multiplyScalar( -1, tmpVec1 )));
        var minvJt0 = inertiaInvA.multiplyVector( aJ );
        var minvJt1 = inertiaInvB.multiplyVector( bJ );
        var Adiag = massInvA + minvJt0.dot( aJ ) + massInvB + minvJt1.dot( bJ );

        je.init( linearJointAxis, aJ, bJ, minvJt0, minvJt1, Adiag );

        Bump.Assert( Adiag > 0.0 );
      },

      //angular constraint between two different rigidbodies
      _create5: function(
        jointAxis, // const btVector3&
        world2A, // const btMatrix3x3&
        world2B, // const btMatrix3x3&
        inertiaInvA, // const btVector3&
        inertiaInvB // const btVector3&
      ) {
        var je = Object.create( Bump.JacobianEntry.prototype );

        var linearJointAxis = Bump.Vector3.create( 0.0, 0.0, 0.0);
        var aJ = world2A.multiplyVector( jointAxis );
        var bJ = world2B.multiplyVector( jointAxis.multiplyScalar( -1 ));
        var minvJt0 = inertiaInvA.multipleVector( aJ );
        var minvJt1 = inertiaInvB.multiplyVector( bJ );
        var Adiag = minvJt0.dot( aJ ) + minvJt1.dot( bJ );

        je.init( linearJointAxis, aJ, bJ, minvJt0, minvJt1, Adiag );

        Bump.Assert( Adiag > 0.0 );
      },

      //angular constraint between two different rigidbodies
      _create4: function(
        axisInA, // const btVector3&
        axisInB, // const btVector3&
        inertiaInvA, // const btVector3&
        inertiaInvB // const btVector3&
      ) {
        var je = Object.create( Bump.JacobianEntry.prototype );

        var linearJointAxis = Bump.Vector3.create( 0.0, 0.0, 0.0 );
        var aJ = axisInA.clone();
        var bJ = -axisInB.clone();
        var minvJt0 = inertiaInvA.multiplyVector( aJ );
        var minvJt1 = inertiaInvB.multiplyVector( bJ );
        var Adiag = minvJt0.dot( aJ ) + minvJt1.dot( bJ );

        je.init( linearJointAxis, aJ, bJ, minvJt0, minvJt1, Adiag );

        Bump.Assert( Adiag > 0.0);
      },

      //constraint on one rigidbody
      _create6: function(
        world2A, // const btMatrix3x3&
        rel_pos1, // const btVector3&
        rel_pos2, // const btVector3&
        jointAxis, // const btVector3&
        inertiaInvA, // const btVector3&
        massInvA //const btScalar
      ) {
        var je = Object.create( Bump.JacobianEntry.prototype );

        var linearJointAxis = jointAxis.clone();
        var aJ = world2A.multiplyVector( rel_pos1.cross( jointAxis, tmpVec1 ));
        var bJ = world2A.multipleVector( rel_pos2.cross(
          jointAxis.multiplyScalar( -1, tmpVec1)), tmpVec1 );
        var minvJt0 = inertiaInvA.multiplyVector( aJ );
        var minvJt1 = Bump.Vector3.create( 0.0, 0.0, 0.0 );
        var Adiag = massInvA + minvJt0.dot( aJ );

        je.init( linearJointAxis, aJ, bJ, minvJt0, minvJt1, Adiag );

        Bump.Assert( Adiag > 0.0 );
      }
    }
  });

})( this, this.Bump );