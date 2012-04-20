(function( window, Bump ) {

  Bump.CompoundShapeChild = Bump.type({
    members: {
      init: function CompoundShapeChild() {
        this.transform = Bump.Transform.create();
        this.childShape = null;
        this.childShapeType = 0;
        this.childMargin = 0;
        this.node = null;
      },

      assign: function( other ) {
        this.transform.assign( other.transform );
        this.childShape     = other.childShape;
        this.childShapeType = other.childShapeType;
        this.childMargin    = other.childMargin;
        this.node           = other.node;
        return this;
      },

      clone: function( dest ) {
        if ( !dest ) { dest = Bump.CompoundShapeChild.create(); }
        dest.transform.assign( this.transform );
        dest.childShape     = this.childShape;
        dest.childShapeType = this.childShapeType;
        dest.childMargin    = this.childMargin;
        dest.node           = this.node;
        return dest;
      },

      equal: function( c2 ) {
        return ( this.transform.equal( c2.transform ) &&
                 this.childShape     === c2.childShape &&
                 this.childShapeType === c2.childShapeType &&
                 this.childMargin    === c2.childMargin );
      }
    }
  });

  Bump.CompoundShape = Bump.type({
    parent: Bump.CollisionShape,

    init: function CompoundShape( enableDynamicAabbTree ) {
      this._super();

      // Initializer list
      this.localAabbMin = Bump.Vector3.create(  Infinity,  Infinity,  Infinity );
      this.localAabbMax = Bump.Vector3.create( -Infinity, -Infinity, -Infinity );
      this.dynamicAabbTree = null;
      this.updateRevision = 1;
      this.collisionMargin = 0;
      this.localScaling = Bump.Vector3.create( 1, 1, 1 );
      // End initializer list

      // Default initializers
      this.children = [];     // Bump.CompoundShapeChild
      // End default initializers

      this.shapeType = Bump.BroadphaseNativeTypes.COMPOUND_SHAPE_PROXYTYPE;

      if ( enableDynamicAabbTree ) {
        this.dynamicAabbTree = Bump.Dbvt.create();
      }
    },

    members: {
      destruct: function() {
        if ( this.dynamicAabbTree ) {
          this.dynamicAabbTree.destruct();
        }
      }
    }
  });

})( this, this.Bump );
