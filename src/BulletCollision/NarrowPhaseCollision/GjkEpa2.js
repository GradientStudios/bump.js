(function( window, Bump ) {

  Bump.GjkEpaSolver2 = {

    sResults: Bump.type({
      init: function GjkEpaSolver2sResults() {
        // Default initializers
        this.witnesses = [
          Bump.Vector3.create(),
          Bump.Vector3.create()
        ];
        this.normal = Bump.Vector3.create();
        this.distance = 0;
        // End default initializers
      },

      members: {
        clone: function( dest ) {
          dest = dest || Bump.GjkEpaSolver2.sResults.create();

          dest.witnesses[0].assign( this.witnesses[0] );
          dest.witnesses[1].assign( this.witnesses[1] );
          dest.normal.assign( this.normal );
          dest.distance = this.distance;

          return dest;
        },

        assign: function( other ) {
          this.witnesses[0].assign( other.witnesses[0] );
          this.witnesses[1].assign( other.witnesses[1] );
          this.normal.assign( other.normal );
          this.distance = other.distance;

          return this;
        }
      },

      typeMembers: {
        eStatus: Bump.Enum([
          'Separated',     // Shapes doesnt penetrate
          'Penetrating',   // Shapes are penetrating
          'GJK_Failed',    // GJK phase fail, no big issue, shapes are probably
                           // just 'touching'.
          'EPA_Failed'     // EPA phase fail, bigger problem, need to save
                           // parameters, and debug
        ])

      }
    }),

    StackSizeRequirement: function() {
      /* return sizeof( GJK ) + sizeof( EPA ); */
      return 0;
    },

    Distance: Bump.notImplemented,
    Penetration : Bump.notImplemented,
    SignedDistance: Bump.notImplemented

  };

})( this, this.Bump );
