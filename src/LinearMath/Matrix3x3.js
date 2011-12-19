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
        set: function( v ) { this.m_el0.clone( v ); }
      },

      1: {
        get: function() { return this.m_el1; },
        set: function( v ) { this.m_el1.clone( v ); }
      },

      2: {
        get: function() { return this.m_el2; },
        set: function( v ) { this.m_el2.clone( v ); }
      }
    },

    // ## Member functions
    members: {
      // ### Basic utilities

      // Clones `this` matrix into `dest`.
      clone: function( dest ) {
        dest = dest || Bump.Matrix3x3.create();
        return dest.setValue(
          this.m_el0.x, this.m_el0.y, this.m_el0.z,
          this.m_el1.x, this.m_el1.y, this.m_el1.z,
          this.m_el2.x, this.m_el2.y, this.m_el2.z
        );
      },

      // Puts the `i`th column into the given [`Bump.Vector3`](vector3.html)
      // `dest`.
      getColumn: function( i, dest ) {
        dest = dest || Bump.Vector3.create();
        dest.x = this.m_el0[i];
        dest.y = this.m_el1[i];
        dest.z = this.m_el2[i];
        return dest;
      },

      // Puts the `i`th row into the given [`Bump.Vector3`](vector3.html)
      // `dest`.
      getRow: function( i, dest ) {
        dest = dest || Bump.Vector3.create();
        return dest.clone( this[ i ] );
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

      // ### Math functions

      // Add matrices into `dest`.
      add: function( m, dest ) {
        dest = dest || Bump.Matrix3x3.create();
        return dest.setValue(
          this.m_el0.x + m.m_el0.x, this.m_el0.y + m.m_el0.y, this.m_el0.z + m.m_el0.z,
          this.m_el1.x + m.m_el1.x, this.m_el1.y + m.m_el1.y, this.m_el1.z + m.m_el1.z,
          this.m_el2.x + m.m_el2.x, this.m_el2.y + m.m_el2.y, this.m_el2.z + m.m_el2.z
        );
      },

      // Add matrix `m` to `this`.
      addSelf: function( m ) {
        return this.setValue(
          this.m_el0.x + m.m_el0.x, this.m_el0.y + m.m_el0.y, this.m_el0.z + m.m_el0.z,
          this.m_el1.x + m.m_el1.x, this.m_el1.y + m.m_el1.y, this.m_el1.z + m.m_el1.z,
          this.m_el2.x + m.m_el2.x, this.m_el2.y + m.m_el2.y, this.m_el2.z + m.m_el2.z
        );
      },

      // Subtract matrices into `dest`.
      subtract: function( m, dest ) {
        dest = dest || Bump.Matrix3x3.create();
        return dest.setValue(
          this.m_el0.x - m.m_el0.x, this.m_el0.y - m.m_el0.y, this.m_el0.z - m.m_el0.z,
          this.m_el1.x - m.m_el1.x, this.m_el1.y - m.m_el1.y, this.m_el1.z - m.m_el1.z,
          this.m_el2.x - m.m_el2.x, this.m_el2.y - m.m_el2.y, this.m_el2.z - m.m_el2.z
        );
      },

      // Subtract matrix from `this`.
      subtractSelf: function( m ) {
        return this.setValue(
          this.m_el0.x - m.m_el0.x, this.m_el0.y - m.m_el0.y, this.m_el0.z - m.m_el0.z,
          this.m_el1.x - m.m_el1.x, this.m_el1.y - m.m_el1.y, this.m_el1.z - m.m_el1.z,
          this.m_el2.x - m.m_el2.x, this.m_el2.y - m.m_el2.y, this.m_el2.z - m.m_el2.z
        );
      },

      // Multiplies the given matrices and stores it in `dest` matrix.
      multiplyMatrix: function( m, dest ) {
        dest = dest || Bump.Matrix3x3.create();
        return dest.setValue(
          m.tdotx( this.m_el0 ), m.tdoty( this.m_el0 ), m.tdotz( this.m_el0 ),
          m.tdotx( this.m_el1 ), m.tdoty( this.m_el1 ), m.tdotz( this.m_el1 ),
          m.tdotx( this.m_el2 ), m.tdoty( this.m_el2 ), m.tdotz( this.m_el2 )
        );
      },

      // Multiplies `this` matrix and the given matrix and stores it in
      // `dest` matrix.
      multiplyMatrixSelf: function( m ) {
        return this.setValue(
          m.tdotx( this.m_el0 ), m.tdoty( this.m_el0 ), m.tdotz( this.m_el0 ),
          m.tdotx( this.m_el1 ), m.tdoty( this.m_el1 ), m.tdotz( this.m_el1 ),
          m.tdotx( this.m_el2 ), m.tdoty( this.m_el2 ), m.tdotz( this.m_el2 )
        );
      },

      // Multiplies `this` matrix with vector `v` and stores it in `dest`.
      //
      //     ┌             ┐   ┌    ┐
      //     │ t11 t12 t13 │ * │ vx │
      //     │ t21 t22 t23 │   │ vy │
      //     │ t31 t32 t33 │   │ vz │
      //     └             ┘   └    ┘
      //
      multiplyVector: function( v, dest ) {
        dest = dest || Bump.Vector3.create();
        return dest.setValue(
          this.m_el0.dot( v ),
          this.m_el1.dot( v ),
          this.m_el2.dot( v )
        );
      },

      // Get a scaled version of `this` matrix. The components of `s` are
      // multiplied through the respective columns.
      scaled: function( s, dest ) {
        dest = dest || Bump.Matrix3x3.create();
        return dest.setValue(
          this.m_el0.x * s.x, this.m_el0.y * s.y, this.m_el0.z * s.z,
          this.m_el1.x * s.x, this.m_el1.y * s.y, this.m_el1.z * s.z,
          this.m_el2.x * s.x, this.m_el2.y * s.y, this.m_el2.z * s.z
        );
      },

      // Transposes `v` and multiplies it with `this` matrix and stores it in
      // `dest`.
      //
      //     ┌          ┐   ┌             ┐
      //     │ vx vy vz │ * │ t11 t12 t13 │
      //     └          ┘   │ t21 t22 t23 │
      //                    │ t31 t32 t33 │
      //                    └             ┘
      //
      vectorMultiply: function( v, dest ) {
        dest = dest || Bump.Vector3.create();
        return dest.setValue(
          this.tdotx( v ), this.tdoty( v ), this.tdotz( v )
        );
      },

      // Multiplies the transpose of `this` matrix with `m` and stores it in
      // `dest`.
      //
      //     ┌             ┐   ┌             ┐
      //     │ t11 t21 t31 │ * │ m11 m12 m13 │
      //     │ t12 t22 t32 │   │ m21 m22 m23 │
      //     │ t13 t23 t33 │   │ m31 m32 m33 │
      //     └             ┘   └             ┘
      //
      transposeTimes: function( m, dest ) {
        dest = dest || Bump.Matrix3x3.create();
        return dest.setValue(
          this.m_el0.x * m.m_el0.x + this.m_el1.x * m.m_el1.x + this.m_el2.x * m.m_el2.x,
          this.m_el0.x * m.m_el0.y + this.m_el1.x * m.m_el1.y + this.m_el2.x * m.m_el2.y,
          this.m_el0.x * m.m_el0.z + this.m_el1.x * m.m_el1.z + this.m_el2.x * m.m_el2.z,
          this.m_el0.y * m.m_el0.x + this.m_el1.y * m.m_el1.x + this.m_el2.y * m.m_el2.x,
          this.m_el0.y * m.m_el0.y + this.m_el1.y * m.m_el1.y + this.m_el2.y * m.m_el2.y,
          this.m_el0.y * m.m_el0.z + this.m_el1.y * m.m_el1.z + this.m_el2.y * m.m_el2.z,
          this.m_el0.z * m.m_el0.x + this.m_el1.z * m.m_el1.x + this.m_el2.z * m.m_el2.x,
          this.m_el0.z * m.m_el0.y + this.m_el1.z * m.m_el1.y + this.m_el2.z * m.m_el2.y,
          this.m_el0.z * m.m_el0.z + this.m_el1.z * m.m_el1.z + this.m_el2.z * m.m_el2.z
        );
      },

      // Multiplies `this` matrix with the transpose of `m` and stores it in
      // `dest`.
      //
      //     ┌             ┐   ┌             ┐
      //     │ t11 t12 t13 │ * │ m11 m21 m31 │
      //     │ t21 t22 t23 │   │ m12 m22 m32 │
      //     │ t31 t32 t33 │   │ m13 m23 m33 │
      //     └             ┘   └             ┘
      //
      timesTranspose: function( m, dest ) {
        dest = dest || Bump.Matrix3x3.create();
        return dest.setValue(
          this.m_el0.dot( m.m_el0 ), this.m_el0.dot( m.m_el1 ), this.m_el0.dot( m.m_el2 ),
          this.m_el1.dot( m.m_el0 ), this.m_el1.dot( m.m_el1 ), this.m_el1.dot( m.m_el2 ),
          this.m_el2.dot( m.m_el0 ), this.m_el2.dot( m.m_el1 ), this.m_el2.dot( m.m_el2 )
        );
      },

      // ## Advanced utilities and transformations

      // Get the [determinant](http://en.wikipedia.org/wiki/Determinant) of
      // `this` matrix.
      determinant: function() {
        return this.m_el0.triple( this.m_el1, this.m_el2 );
      },

      // Computes the [adjugate matrix](http://en.wikipedia.org/wiki/Adjugate_matrix)
      // of `this` matrix.
      adjoint: function( dest ) {
        dest = dest || Bump.Matrix3x3.create();
        return dest.setValue(
          this.cofac( 1, 1, 2, 2 ), this.cofac( 0, 2, 2, 1 ), this.cofac( 0, 1, 1, 2 ),
          this.cofac( 1, 2, 2, 0 ), this.cofac( 0, 0, 2, 2 ), this.cofac( 0, 2, 1, 0 ),
          this.cofac( 1, 0, 2, 1 ), this.cofac( 0, 1, 2, 0) , this.cofac( 0, 0, 1, 1 )
        );
      },

      // Computes a matrix composed of the absolute value of the elements of
      // `this` matrix.
      absolute: function( dest ) {
        dest = dest || Bump.Matrix3x3.create();
        return dest.setValue(
          Math.abs( this.m_el0.x ), Math.abs( this.m_el0.y ), Math.abs( this.m_el0.z ),
          Math.abs( this.m_el1.x ), Math.abs( this.m_el1.y ), Math.abs( this.m_el1.z ),
          Math.abs( this.m_el2.x ), Math.abs( this.m_el2.y ), Math.abs( this.m_el2.z )
        );
      },

      // Computes the [transpose](http://en.wikipedia.org/wiki/Transpose) of
      // `this` matrix.
      transpose: function( dest ) {
        dest = dest || Bump.Matrix3x3.create();
        return dest.setValue(
          this.m_el0.x, this.m_el1.x, this.m_el2.x,
          this.m_el0.y, this.m_el1.y, this.m_el2.y,
          this.m_el0.z, this.m_el1.z, this.m_el2.z
        );
      },

      // Returns the dot product of the first column and the given vector.
      tdotx: function( v ) {
        return this.m_el0.x * v.x + this.m_el1.x * v.y + this.m_el2.x * v.z;
      },

      // Returns the dot product of the first column and the given vector.
      tdoty: function( v ) {
        return this.m_el0.y * v.x + this.m_el1.y * v.y + this.m_el2.y * v.z;
      },

      // Returns the dot product of the first column and the given vector.
      tdotz: function( v ) {
        return this.m_el0.z * v.x + this.m_el1.z * v.y + this.m_el2.z * v.z;
      },

      // Compute the matrix cofactor
      cofac: function( r1, c1, r2, c2 ) {
        return this[r1][c1] * this[r2][c2] - this[r1][c2] * this[r2][c1];
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
