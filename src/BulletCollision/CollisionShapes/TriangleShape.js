(function( window, Bump ) {

  Bump.TriangleShape = Bump.type({
    parent: Bump.PolyhedralConvexShape,

    init: function TriangleShape() {
      this._super();

      // Default initializers
      this.vertices10 = Bump.Vector3.create();
      this.vertices11 = Bump.Vector3.create();
      this.vertices12 = Bump.Vector3.create();
      // End default initializers

      this.shapeType = Bump.BroadphaseNativeTypes.TRIANGLE_SHAPE_PROXYTYPE;
    },

    members: {
      initWithVertices: function( p0, p1, p2 ) {
        Bump.PolyhedralConvexShape.init.call( this );

        this.shapeType = Bump.BroadphaseNativeTypes.TRIANGLE_SHAPE_PROXYTYPE;
        this.vertices10 = p0.clone();
        this.vertices11 = p1.clone();
        this.vertices12 = p2.clone();
      },

      getNumVertices: function() {
        return 3;
      },

      getVertexPtr: Bump.notImplemented,

      getVertex: function( index, vert ) {
        vert.assign( this[ 'vertices1' + index ] );
      },

      getNumEdges: function() {
        return 3;
      },

      getEdge: function( i, pa, pb ) {
        this.getVertex( i, pa );
        this.getVertex( ( i + 1 ) % 3, pb );
      },

      getAabb: function( t, aabbMin, aabbMax ) {
        this.getAabbSlow( t, aabbMin, aabbMax );
      },

      localGetSupportingVertexWithoutMargin: function( dir ) {
        var dots = Bump.Vector3.create(
          dir.dot( this.vertices10 ),
          dir.dot( this.vertices11 ),
          dir.dot( this.vertices12 )
        );
        return this[ 'vertices1' + dots.maxAxis() ];
      },

      batchedUnitVectorGetSupportingVertexWithoutMargin: function( vectors, supportVerticesOut, numVectors ) {
        for ( var i = 0; i < numVectors; ++i ) {
          var dir = vectors[i];
          var dots = Bump.Vector3.create(
            dir.dot( this.vertices10 ),
            dir.dot( this.vertices11 ),
            dir.dot( this.vertices12 )
          );
          supportVerticesOut[i].assign( this[ 'vertices1' + dots.maxAxis() ] );
        }
      },

      getPlane: function( planeNormal, planeSupport, i ) {
        this.getPlaneEquation( i, planeNormal, planeSupport );
      },

      getNumPlanes: function() {
        return 1;
      },

      calcNormal: function( normal ) {
        normal.assign(
          this.vertices11.subtract( this.vertices10 )
            .cross( this.vertices12.subtract( this.vertices10 ) )
        );
        normal.normalize();
      },

      getPlaneEquation: function( i, planeNormal, planeSupport ) {
        this.calcNormal( planeNormal );
        planeSupport.assign( this.vertices10 );
      },

      calculateLocalInertia: function( mass, inertia ) {
        Bump.Assert( false );
        inertia.setValue( 0, 0, 0 );
      },

      isInside: Bump.notImplemented,

      getName: function() {
        return 'Triangle';
      },

      getNumPreferredPenetrationDirections: function() {
        return 2;
      },

      getPreferredPenetrationDirection: function( index, penetrationVector ) {
        this.calcNormal( penetrationVector );
        if ( index ) {
          penetrationVector.multiplyScalarSelf( -1 );
        }
      }

    }
  });

})( this, this.Bump );
