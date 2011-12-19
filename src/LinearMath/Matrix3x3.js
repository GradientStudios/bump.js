// **Bump.Matrix3x3** is the port of the `btMatrix3x3` class in
// [Bullet](http://bulletphysics.org).

(function( window, Bump ) {
  Bump.Matrix3x3 = Bump.type({
    // Given *exactly* nine arguments in row major order,
    // initializes a 3x3 matrix.
    init: function Matrix3x3( xx, xy, xz, yx, yy, yz, zx, zy, zz ) {
      this.m_el0 = Bump.Vector3.create( xx, xy, xz );
      this.m_el1 = Bump.Vector3.create( yx, yy, yz );
      this.m_el2 = Bump.Vector3.create( zx, zy, zz );

      this.m_el = [
        Bump.Vector3.create( xx, xy, xz ),
        Bump.Vector3.create( yx, yy, yz ),
        Bump.Vector3.create( zx, zy, zz )
      ];

      this.setValue( xx, xy, xz,
                     yx, yy, yz,
                     zx, zy, zz );
    },

    // ## Properties
    properties: {
      // The properties for 0, 1, and 2 are used to emulate `btMatrix3x3`'s
      // `operator[]` overload. This is purely for maintaining the interface, as
      // they are much slower. It is faster to access the properties directly on
      // the object.
      0: {
        get: function() { return this.m_el0; },
        set: function( vec3 ) { this.m_el0.clone( vec3 ); }
      },

      1: {
        get: function() { return this.m_el1; },
        set: function( vec3 ) { this.m_el1.clone( vec3 ); }
      },

      2: {
        get: function() { return this.m_el2; },
        set: function( vec3 ) { this.m_el2.clone( vec3 ); }
      }
    },

    // ## Member functions
    members: {
      // ### Basic utilities

      // Clones the value of the given matrix `other` in to `this` matrix.
      clone: function( other ) {
        this.m_el0.clone( other.m_el0 );
        this.m_el1.clone( other.m_el1 );
        this.m_el2.clone( other.m_el2 );

        this.m_el[0].clone( other.m_el[0] );
        this.m_el[1].clone( other.m_el[1] );
        this.m_el[2].clone( other.m_el[2] );

        this.m[0] = other.m[0]; this.m[1] = other.m[1]; this.m[2] = other.m[2];
        this.m[3] = other.m[3]; this.m[4] = other.m[4]; this.m[5] = other.m[5];
        this.m[6] = other.m[6]; this.m[7] = other.m[7]; this.m[8] = other.m[8];

        this.m11 = other.m11; this.m12 = other.m12; this.m13 = other.m13;
        this.m21 = other.m21; this.m22 = other.m22; this.m23 = other.m23;
        this.m31 = other.m31; this.m32 = other.m32; this.m33 = other.m33;

        return this;
      },

      // Puts the `i`th column into the given [`Bump.Vector3`](vector3.html)
      // `dest`.
      getColumn: function( i, dest ) {
        dest.x = this.m_el[0][i];
        dest.y = this.m_el[1][i];
        dest.z = this.m_el[2][i];
        return dest;
      },

      // Puts the `i`th row into the given [`Bump.Vector3`](vector3.html)
      // `dest`.
      getRow: function( i, dest ) {
        dest.clone( this[ i ] );
        return dest;
      },

      // Given *exactly* nine arguments in row major order, sets the values of
      // `this` matrix.
      setValue: function( xx, xy, xz, yx, yy, yz, zx, zy, zz ) {
        this.m_el0.setValue( xx, xy, xz );
        this.m_el1.setValue( yx, yy, yz );
        this.m_el2.setValue( zx, zy, zz );

        this.m_el[0].setValue( xx, xy, xz );
        this.m_el[1].setValue( yx, yy, yz );
        this.m_el[2].setValue( zx, zy, zz );

        this.m11 = xx; this.m12 = xy; this.m13 = xz;
        this.m21 = yx; this.m22 = yy; this.m23 = yz;
        this.m31 = zx; this.m32 = zy; this.m33 = zz;

        this.m = [ xx, xy, xz, yx, yy, yz, zx, zy, zz ];

        return this;
      },

      // Set `this` matrix to the identity matrix.
      setIdentity: function() {
        return this.setValue( 1, 0, 0,
                              0, 1, 0,
                              0, 0, 1 );
      },


      // ## Non-public, internal methods
      // **Warning:** May cause undesired side-effects when used. Probably don't
      // need to be concerned with these functions.

      // Internal method for alternate initialization using three
      // [`Bump.Vector3`](vector3.html)s
      _initWithVectors: function( vecA, vecB, vecC ) {
        this.m_el0 = Bump.Vector3.clone( vecA );
        this.m_el1 = Bump.Vector3.clone( vecB );
        this.m_el2 = Bump.Vector3.clone( vecC );

        this.m_el = [
          Bump.Vector3.clone( vecA ),
          Bump.Vector3.clone( vecB ),
          Bump.Vector3.clone( vecC )
        ];

        this.setValue( vecA.x, vecA.y, vecA.z,
                       vecB.x, vecB.y, vecB.z,
                       vecC.x, vecC.y, vecC.z );
      }
    },

    // ## Static functions
    typeMembers: {
      // Given *up to* nine arguments in row major order, **creates** a new 3x3
      // matrix.
      create: function( xx, xy, xz, yx, yy, yz, zx, zy, zz ) {
        var mat = Object.create( Bump.Matrix3x3.prototype );
        mat.init( xx || 0, xy || 0, xz || 0,
                  yx || 0, yy || 0, yz || 0,
                  zx || 0, zy || 0, zz || 0 );
        return mat;
      },

      // **Creates** a 3x3 identity matrix. **Note:** this does not return a
      // `const` static reference like in C++.
      getIdentity: function() {
        var mat = Object.create( Bump.Matrix3x3.prototype );
        mat.init( 1, 0, 0,
                  0, 1, 0,
                  0, 0, 1 );
        return mat;
      },

      // **Creates** a new matrix and copies a matrix to it.
      clone: function( mat ) {
        var newMat = Object.create( Bump.Matrix3x3.prototype );
        newMat._initWithVectors( mat.m_el0, mat.m_el1, mat.m_el2 );
        return newMat;
      }
    }
  });
})( this, this.Bump );
