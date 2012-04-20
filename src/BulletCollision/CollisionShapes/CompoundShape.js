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
      },

      addChildShape: function( localTransform, shape ) {
        var m_localAabbMin = this.localAabbMin;
        var m_localAabbMax = this.localAabbMax;

        ++this.updateRevision;

        var child = Bump.CompoundShapeChild.create();
        child.node = null;
        child.transform.assign( localTransform );
        child.childShape = shape;
        child.childShapeType = shape.getShapeType();
        child.childMargin = shape.getMargin();

        // extend the local aabbMin/aabbMax
        var localAabbMin = Bump.Vector3.create();
        var localAabbMax = Bump.Vector3.create();
        shape.getAabb( localTransform, localAabbMin, localAabbMax );
        for ( var i = 0; i < 3; ++i ) {
          if ( m_localAabbMin[i] > localAabbMin[i] ) {
            m_localAabbMin[i] = localAabbMin[i];
          }
          if ( m_localAabbMax[i] < localAabbMax[i] ) {
            m_localAabbMax[i] = localAabbMax[i];
          }

        }

        if ( this.dynamicAabbTree ) {
          var bounds = Bump.DbvtVolume.FromMM( localAabbMin, localAabbMax );
          var index = this.children.length;
          child.node = this.dynamicAabbTree.insert( bounds, index );
        }

        this.children.push( child );
      },

      removeChildShape: function( shape ) {
        var m_children = this.children;

        ++this.updateRevision;

        // Find the children containing the shape specified, and remove those
        // children.
        // Note: There might be multiple children using the same shape!
        for ( var i = m_children.length - 1; i >= 0 ; --i ) {
          if ( m_children[i].childShape === shape ) {
            this.removeChildShapeByIndex( i );
          }
        }

        this.recalculateLocalAabb();
      },

      removeChildShapeByIndex: function( childShapeIndex ) {
        var m_children = this.children;

        ++this.updateRevision;
        Bump.Assert( childShapeIndex >=0 && childShapeIndex < m_children.length );

        if ( this.dynamicAabbTree ) {
          this.dynamicAabbTree.remove( m_children[ childShapeIndex ].node );
        }

        // swap
        var lastIndex = m_children.length - 1;
        var tmp = m_children[ lastIndex ];
        m_children[ lastIndex ] = m_children[ childShapeIndex ];
        m_children[ childShapeIndex ] = tmp;

        if ( this.dynamicAabbTree ) {
          m_children[ childShapeIndex ].node.dataAsInt = childShapeIndex;
        }

        m_children.pop();
      },

      getNumChildShapes: function() {
        return this.children.length;
      },

      getChildShape: function( index ) {
        return this.children[ index ].childShape;
      },

      getChildTransform: function( index ) {
        return this.children[ index ].transform;
      },

      updateChildTransform: function( childIndex, newChildTransform, shouldRecalculateLocalAabb ) {
        var m_children = this.children;

        m_children[ childIndex ].transform.assign( newChildTransform );

        if ( this.dynamicAabbTree ) {
          // Update the dynamic aabb tree
          var localAabbMin = Bump.Vector3.create();
          var localAabbMax = Bump.Vector3.create();
          m_children[ childIndex ].childShape.getAabb( newChildTransform, localAabbMin, localAabbMax );
          var bounds = Bump.DbvtVolume.FromMM( localAabbMin, localAabbMax );
          this.dynamicAabbTree.update( m_children[ childIndex ].node, bounds );
        }

        if ( shouldRecalculateLocalAabb ) {
          this.recalculateLocalAabb();
        }
      },

      getChildList: function() {
        return this.children;
      },

      // `getAabb`'s default implementation is brute force, expected derived
      // classes to implement a fast dedicated version.
      getAabb: function( trans, aabbMin, aabbMax ) {
        var localHalfExtents = this.localAabbMax.subtract( this.localAabbMin ).multiplyScalar( 0.5 );
        var localCenter = this.localAabbMax.add( this.localAabbMin ).multiplyScalar( 0.5 );

        // avoid an illegal AABB when there are no children
        if ( !this.children.length ) {
          localHalfExtents.setValue( 0, 0, 0 );
          localCenter.setValue( 0, 0, 0 );
        }

        var margin = this.getMargin();
        localHalfExtents.addSelf( Bump.Vector3.create( margin, margin, margin ) );

        var abs_b = trans.basis.absolute();

        var center = trans.transform( localCenter );

        var extent = Bump.Vector3.create(
          abs_b.el0.dot( localHalfExtents ),
          abs_b.el1.dot( localHalfExtents ),
          abs_b.el2.dot( localHalfExtents )
        );

        aabbMin = center.subtract( extent, aabbMin );
        aabbMax = center.add( extent, aabbMax );
      },

      recalculateLocalAabb: function() {
        var m_children     = this.children;
        var m_localAabbMin = this.localAabbMin;
        var m_localAabbMax = this.localAabbMax;

        // Recalculate the local aabb
        // Brute force, it iterates over all the shapes left.

        m_localAabbMin.setValue(  Infinity,  Infinity,  Infinity );
        m_localAabbMax.setValue( -Infinity, -Infinity, -Infinity );

        // extend the local aabbMin/aabbMax
        for ( var j = 0; j < m_children.length; ++j ) {
          var localAabbMin = Bump.Vector3.create();
          var localAabbMax = Bump.Vector3.create();
          m_children[j].childShape.getAabb( m_children[j].transform, localAabbMin, localAabbMax );
          for ( var i = 0; i < 3; ++i ) {
            if ( m_localAabbMin[i] > localAabbMin[i] ) {
              m_localAabbMin[i] = localAabbMin[i];
            }

            if ( m_localAabbMax[i] < localAabbMax[i] ) {
              m_localAabbMax[i] = localAabbMax[i];
            }
          }
        }

      },

      setLocalScaling: function( scaling ) {
        var m_children = this.children;

        for ( var i = 0; i < m_children.length; ++i ) {
          var childTrans = this.getChildTransform( i );
          var childScale = m_children[i].childShape.getLocalScaling();

          childScale.assign(
            childScale.multiplyVector( scaling ).divideVector( this.localScaling )
          );
          m_children[i].childShape.setLocalScaling( childScale );
          childTrans.setOrigin( childTrans.origin.multiplyVector( scaling ) );
          this.updateChildTransform( i, childTrans, false );
        }

        this.localScaling.assign( scaling );
        this.recalculateLocalAabb();
      },

      getLocalScaling: function() {
        return this.localScaling;
      },

      calculateLocalInertia: function( mass, inertia ) {
        // approximation: take the inertia from the aabb for now
        var ident = Bump.Transform.create();
        ident.setIdentity();
        var aabbMin = Bump.Vector3.create();
        var aabbMax = Bump.Vector3.create();
        this.getAabb( ident, aabbMin, aabbMax );

        var halfExtents = aabbMax.subtract( aabbMin ).multiplyScalar( 0.5 );

        var lx = 2 * halfExtents.x;
        var ly = 2 * halfExtents.y;
        var lz = 2 * halfExtents.z;

        inertia.x = mass / 12.0 * ( ly * ly + lz * lz );
        inertia.y = mass / 12.0 * ( lx * lx + lz * lz );
        inertia.z = mass / 12.0 * ( lx * lx + ly * ly );
      },

      setMargin: function( margin ) {
        this.collisionMargin = margin;
      },

      getMargin: function() {
        return this.collisionMargin;
      },

      getName: function() {
        return 'Compound';
      },

      getDynamicAabbTree: function() {
        return this.dynamicAabbTree;
      },

      createAabbTreeFromChildren: function() {
        if ( !this.dynamicAabbTree ) {
          var m_children = this.children;
          var m_dynamicAabbTree = this.dynamicAabbTree = Bump.Dbvt.create();

          for ( var index = 0; index < m_children.length; ++index ) {
            var child = m_children[ index ];

            // extend the local aabbMin/aabbMax
            var localAabbMin = Bump.Vector3.create();
            var localAabbMax = Bump.Vector3.create();
            child.childShape.getAabb( child.transform, localAabbMin, localAabbMax );

            var bounds = Bump.DbvtVolume.FromMM( localAabbMin, localAabbMax );
            child.node = m_dynamicAabbTree.insert( bounds, index );
          }
        }
      },

      // Computes the exact moment of inertia and the transform from the
      // coordinate system defined by the principal axes of the moment of
      // inertia and the center of mass to the current coordinate system.
      // `masses` points to an array of masses of the children. The resulting
      // transform `principal` has to be applied inversely to all children
      // transforms in order for the local coordinate system of the compound
      // shape to be centered at the center of mass and to coincide with the
      // principal axes. This also necessitates a correction of the world
      // transform of the collision object by the principal transform.
      calculatePrincipalAxisTransform: function( masses, principal, inertia ) {
        var m_children = this.children;

        var n = m_children.length;

        var totalMass = 0;
        var center = Bump.Vector3.create( 0, 0, 0 );

        var k;
        for ( k = 0; k < n; ++k ) {
          Bump.Assert( masses[k] > 0 );
          center.addSelf( m_children[k].transform.origin.multiplyScalar( masses[k] ) );
          totalMass += masses[k];
        }

        Bump.Assert( totalMass > 0 );

        center.divideScalarSelf( totalMass );
        principal.setOrigin( center );

        var tensor = Bump.Matrix3x3.create( 0, 0, 0, 0, 0, 0, 0, 0, 0 );
        var tmpVec3 = Bump.Vector3.create();
        for ( k = 0; k < n; ++k ) {
          var i = tmpVec3;
          m_children[k].childShape.calculateLocalInertia( masses[k], i );

          var t = m_children[k].transform;
          var o = t.origin.subtract( center );

          // compute inertia tensor in coordinate system of compound shape
          var j = t.basis.transpose();
          j.el0.multiplyScalarSelf( i.x );
          j.el1.multiplyScalarSelf( i.y );
          j.el2.multiplyScalarSelf( i.z );
          j = t.basis.multiplyMatrix( j, j );

          // add inertia tensor
          tensor.el0.addSelf( j.el0 );
          tensor.el1.addSelf( j.el1 );
          tensor.el2.addSelf( j.el2 );

          // compute inertia tensor of pointmass at o
          var o2 = o.length2();
          j.el0.setValue( o2, 0, 0 );
          j.el1.setValue( 0, o2, 0 );
          j.el2.setValue( 0, 0, o2 );
          j.el0.addSelf( o.multiplyScalar( -o.x ) );
          j.el1.addSelf( o.multiplyScalar( -o.y ) );
          j.el2.addSelf( o.multiplyScalar( -o.z ) );

          // add inertia tensor of pointmass
          tensor.el0.addSelf( j.el0.multiplyScalar( masses[k] ) );
          tensor.el1.addSelf( j.el1.multiplyScalar( masses[k] ) );
          tensor.el2.addSelf( j.el2.multiplyScalar( masses[k] ) );
        }

        tensor.diagonalize( principal.basis, 0.00001, 20 );
        inertia.setValue( tensor.el0.x, tensor.el1.y, tensor.el2.z );
      },

      getUpdateRevision: function() {
        return this.updateRevision;
      }

    }
  });

})( this, this.Bump );
