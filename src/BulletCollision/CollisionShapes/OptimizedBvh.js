(function( window, Bump ) {

  var NodeTriangleCallback = Bump.type({
    parent: Bump.InternalTriangleIndexCallback,

    init: function NodeTriangleCallback( triangleNodes ) {
      this.triangleNodes = triangleNodes;
    },

    members: {
      assign: function( other ) {
        this.triangleNodes.copyFromArray( other.triangleNodes );
        return this;
      },

      internalProcessTriangleIndex: function( triangle, partId, triangleIndex ) {
        var node = Bump.OptimizedBvhNode.create();
        var aabbMin = Bump.Vector3.create(  Infinity,  Infinity,  Infinity );
        var aabbMax = Bump.Vector3.create( -Infinity, -Infinity, -Infinity );
        aabbMin.setMin( triangle[0] );
        aabbMax.setMax( triangle[0] );
        aabbMin.setMin( triangle[1] );
        aabbMax.setMax( triangle[1] );
        aabbMin.setMin( triangle[2] );
        aabbMax.setMax( triangle[2] );

        // with quantization?
        node.aabbMinOrg.assign( aabbMin );
        node.aabbMaxOrg.assign( aabbMax );

        node.escapeIndex = -1;

        // for child nodes
        node.subPart = partId;
        node.triangleIndex = triangleIndex;
        this.triangleNodes.push( node );
      }

    }
  });

  var QuantizedNodeTriangleCallback = Bump.type({
    parent: Bump.InternalTriangleIndexCallback,

    init: function QuantizedNodeTriangleCallback( triangleNodes, tree ) {
      this.triangleNodes = triangleNodes;
      this.optimizedTree = tree;
    },

    members: {
      assign: function( other ) {
        this.triangleNodes.copyFromArray( other.triangleNodes );
        this.optimizedTree = other.optimizedTree;
        return this;
      },

      internalProcessTriangleIndex: function( triangle, partId, triangleIndex ) {
        // The partId and triangle index must fit in the same (positive) integer
        var MAX_NUM_PARTS_IN_BITS = Bump.MAX_NUM_PARTS_IN_BITS;
        Bump.Assert( partId < ( 1 << MAX_NUM_PARTS_IN_BITS ) );
        Bump.Assert( triangleIndex < ( 1 << ( 31 - Bump.MAX_NUM_PARTS_IN_BITS ) ) );
        // negative indices are reserved for escapeIndex
        Bump.Assert( triangleIndex >= 0 );

        var node = Bump.QuantizedBvhNode.create();
        var aabbMin = Bump.Vector3.create(  Infinity,  Infinity,  Infinity );
        var aabbMax = Bump.Vector3.create( -Infinity, -Infinity, -Infinity );
        aabbMin.setMin( triangle[0] );
        aabbMax.setMax( triangle[0] );
        aabbMin.setMin( triangle[1] );
        aabbMax.setMax( triangle[1] );
        aabbMin.setMin( triangle[2] );
        aabbMax.setMax( triangle[2] );

        // PCK: add these checks for zero dimensions of aabb
        var MIN_AABB_DIMENSION = 0.002;
        var MIN_AABB_HALF_DIMENSION = 0.001;

        if ( aabbMax.x - aabbMin.x < MIN_AABB_DIMENSION ) {
          aabbMax.x = aabbMax.x + MIN_AABB_HALF_DIMENSION;
          aabbMin.x = aabbMin.x - MIN_AABB_HALF_DIMENSION;
        }

        if ( aabbMax.y - aabbMin.y < MIN_AABB_DIMENSION ) {
          aabbMax.y = aabbMax.y + MIN_AABB_HALF_DIMENSION;
          aabbMin.y = aabbMin.y - MIN_AABB_HALF_DIMENSION;
        }

        if ( aabbMax.z - aabbMin.z < MIN_AABB_DIMENSION ) {
          aabbMax.z = aabbMax.z + MIN_AABB_HALF_DIMENSION;
          aabbMin.z = aabbMin.z - MIN_AABB_HALF_DIMENSION;
        }

        this.optimizedTree.quantize( node.quantizedAabbMin, aabbMin, 0 );
        this.optimizedTree.quantize( node.quantizedAabbMax, aabbMax, 1 );

        node.escapeIndexOrTriangleIndex[0] = ( partId << ( 31 - MAX_NUM_PARTS_IN_BITS ) ) | triangleIndex;

        this.triangleNodes.push( node );
      }

    }
  });

  Bump.OptimizedBvh = Bump.type({
    parent: Bump.QuantizedBvh,

    init: function OptimizedBvh() {
      this._super();
    },

    members: {
      build: function( triangles, useQuantizedAabbCompression, bvhAabbMin, bvhAabbMax ) {
        this.useQuantization = useQuantizedAabbCompression;

        var numLeafNodes = 0;

        var callback;
        if ( this.useQuantization ) {
          // initialize quantization values
          this.setQuantizationValues( bvhAabbMin, bvhAabbMax );

          callback = QuantizedNodeTriangleCallback.create( this.quantizedLeafNodes, this );

          triangles.InternalProcessAllTriangles( callback, this.bvhAabbMin, this.bvhAabbMax );

          // now we have an array of leafnodes in m_leafNodes
          numLeafNodes = this.quantizedLeafNodes.length;

          this.quantizedContiguousNodes.resize( 2 * numLeafNodes );
        } else {
          callback = NodeTriangleCallback.create( this.leafNodes );

          var aabbMin = Bump.Vector3.create( -Infinity, -Infinity, -Infinity );
          var aabbMax = Bump.Vector3.create(  Infinity,  Infinity,  Infinity );

          triangles.InternalProcessAllTriangles( callback, aabbMin, aabbMax );

          // now we have an array of leafnodes in m_leafNodes
          numLeafNodes = this.leafNodes.length;

          this.contiguousNodes.resize( 2 * numLeafNodes );
        }

        this.curNodeIndex = 0;

        this.buildTree( 0, numLeafNodes );

        // If the entire tree is small then subtree size, we need to create a
        // header info for the tree.
        if ( this.useQuantization && !this.SubtreeHeaders.length ) {
          var subtree = this.SubtreeHeaders.expand();
          subtree.setAabbFromQuantizeNode( this.quantizedContiguousNodes.at(0) );
          subtree.rootNodeIndex[0] = 0;
          subtree.subtreeSize[0] = this.quantizedContiguousNodes.at(0).isLeafNode() ? 1 : this.quantizedContiguousNodes.at(0).getEscapeIndex();
        }

        // PCK: update the copy of the size
        this.subtreeHeaderCount = this.SubtreeHeaders.length;

        // PCK: clear m_quantizedLeafNodes and m_leafNodes, they are temporary
        this.quantizedLeafNodes.clear();
        // this.leafNodes.clear();
        this.leafNodes.length = 0;
      }

    }
  });

})( this, this.Bump );
