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

      // Clones `this` matrix in to `dest`.
      clone: function( dest ) {
        dest = dest || Bump.Matrix3x3.create();
        dest.setValue(
          this.m_el0.x, this.m_el0.y, this.m_el0.z,
          this.m_el1.x, this.m_el1.y, this.m_el1.z,
          this.m_el2.x, this.m_el2.y, this.m_el2.z
        );
        return this;
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

      // ### Math functions

      // Multiplies the given matrices and stores it in `this` matrix.
      multiplyMatrix: function( m, dest ) {
        dest = dest || Bump.Matrix3x3.create();
        dest.setValue(
          m.tdotx( this.m_el0 ), m.tdoty( this.m_el0 ), m.tdotz( this.m_el0 ),
          m.tdotx( this.m_el1 ), m.tdoty( this.m_el1 ), m.tdotz( this.m_el1 ),
          m.tdotx( this.m_el2 ), m.tdoty( this.m_el2 ), m.tdotz( this.m_el2 )
        );
        return dest;
      },

      // Multiplies `this` matrix and the given matrix and stores it in
      // `this` matrix.
      multiplyMatrixSelf: function( m ) {
        this.setValue(
          m.tdotx( this.m_el0 ), m.tdoty( this.m_el0 ), m.tdotz( this.m_el0 ),
          m.tdotx( this.m_el1 ), m.tdoty( this.m_el1 ), m.tdotz( this.m_el1 ),
          m.tdotx( this.m_el2 ), m.tdoty( this.m_el2 ), m.tdotz( this.m_el2 )
        );
        return this;
      },

      // Multiplies `this` matrix with vector `v` and stores it in `dest`.
      //
      //     ┌             ┐   ┌    ┐
      //     │ t11 t12 t13 │ * │ v1 │
      //     │ t21 t22 t23 │   │ v2 │
      //     │ t31 t32 t33 │   │ v3 │
      //     └             ┘   └    ┘
      //
      multiplyVector: function( v, dest ) {
        dest = dest || Bump.Vector3.create();
        dest.setValue(
          this.m_el0.dot( v ),
          this.m_el1.dot( v ),
          this.m_el2.dot( v )
        );
        return dest;
      },

      // Transposes `v` and multiplies it with `this` matrix and stores it in
      // `dest`.
      //
      //     ┌          ┐   ┌             ┐
      //     │ v1 v2 v3 │ * │ t11 t12 t13 │
      //     └          ┘   │ t21 t22 t23 │
      //                    │ t31 t32 t33 │
      //                    └             ┘
      //
      vectorMultiply: function( v, dest ) {
        dest = dest || Bump.Vector3.create();
        dest.setValue( this.tdotx( v ), this.tdoty( v ), this.tdotz( v ) );
        return dest;
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
        dest.setValue(
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
        return dest;
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
        dest.setValue(
          this.m_el0.dot( m.m_el0 ), this.m_el0.dot( m.m_el1 ), this.m_el0.dot( m.m_el2 ),
          this.m_el1.dot( m.m_el0 ), this.m_el1.dot( m.m_el1 ), this.m_el1.dot( m.m_el2 ),
          this.m_el2.dot( m.m_el0 ), this.m_el2.dot( m.m_el1 ), this.m_el2.dot( m.m_el2 )
        );
        return dest;
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
