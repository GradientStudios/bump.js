(function( window, Bump ) {
  // 10 gives the potential for 1024 parts, with at most 2^21 (2097152) (minus
  // one actually) triangles each (since the sign bit is reserved)
  Bump.MAX_NUM_PARTS_IN_BITS = 10;

  Bump.__QuantizedBvh__maxIterations = 0;

  Bump.QuantizedBvhNode = Bump.type({
    init: function QuantizedBvhNode( buffer, byteOffset ) {
      if ( arguments.length < 2 ) {
        byteOffset = 0;
      }

      if ( arguments.length < 1 ) {
        buffer = new ArrayBuffer( 16 );
      }

      this.__view = new Uint8Array( buffer, byteOffset, 16 );
      this.quantizedAabbMin = new Uint16Array( buffer, byteOffset, 3 );
      this.quantizedAabbMax = new Uint16Array( buffer, byteOffset + 6, 3 );
      this.escapeIndexOrTriangleIndex = new Int32Array( buffer, byteOffset + 12, 1 );
    },

    members: {
      assign: function( other ) {
        var view = other.__view;
        var buffer = view.buffer;
        var byteOffset = view.byteOffset;
        this.init( buffer, byteOffset );
      },

      isLeafNode: function() {
        // skipindex is negative (internal node), triangleindex >=0 (leafnode)
        return this.escapeIndexOrTriangleIndex[0] >= 0;
      },

      getEscapeIndex: function() {
        Bump.Assert( !this.isLeafNode() );
        return -this.escapeIndexOrTriangleIndex[0];
      },

      getTriangleIndex: function() {
        Bump.Assert( this.isLeafNode() );
        // Get only the lower bits where the triangle index is stored
        return (this.escapeIndexOrTriangleIndex[0] & ~( (~0) << (31 - Bump.MAX_NUM_PARTS_IN_BITS) ));
      },

      getPartId: function() {
        Bump.Assert( this.isLeafNode() );
        // Get only the highest bits where the part index is stored
        return (this.escapeIndexOrTriangleIndex[0] >> ( 31 - Bump.MAX_NUM_PARTS_IN_BITS ) );
      }
    },

    typeMembers: {
      createRef: function() {
        return Object.create( this.prototype );
      }
    }

  });

  Bump.BvhSubtreeInfo = Bump.type({
    init: function QuantizedBvhNode( buffer, byteOffset ) {
      if ( arguments.length < 2 ) {
        byteOffset = 0;
      }

      if ( arguments.length < 1 ) {
        buffer = new ArrayBuffer( 32 );
      }

      this.__view = new Uint8Array( buffer, byteOffset, 32 );
      this.quantizedAabbMin = new Uint16Array( buffer, byteOffset, 3 );
      this.quantizedAabbMax = new Uint16Array( buffer, byteOffset + 6, 3 );
      this.rootNodeIndex = new Int32Array( buffer, byteOffset + 12, 1 );
      this.subtreeSize = new Int32Array( buffer, byteOffset + 16, 1 );
    },

    members: {
      assign: function( other ) {
        var view = other.__view;
        var buffer = view.buffer;
        var byteOffset = view.byteOffset;
        this.init( buffer, byteOffset );
      },

      setAabbFromQuantizeNode: function( quantizedNode ) {
        this.quantizedAabbMin.set( quantizedNode.quantizedAabbMin );
        this.quantizedAabbMax.set( quantizedNode.quantizedAabbMax );
      }
    },

    typeMembers: {
      createRef: function() {
        return Object.create( this.prototype );
      }
    }
  });

  Bump.NodeOverlapCallback = Bump.type({
    members: {
      processNode: Bump.abstract
    }
  });

  Bump.QuantizedBvh = Bump.type({
    init: function QuantizedBvh() {
      // Initializer list
      this.useQuantization = false;
      this.traversalMode = Bump.QuantizedBvh.TraversalMode.TRAVERSAL_STACKLESS;
      this.subtreeHeaderCount = 0; //PCK: add this line
      // End initializer list

      // Default initializers
      // this.bvhAabbMin = Bump.Vector3.create();
      // this.bvhAabbMax = Bump.Vector3.create();
      this.bvhQuantization = Bump.Vector3.create();

      this.curNodeIndex = 0;
      this.leafNodes = [];
      this.contiguousNodes = [];
      this.quantizedLeafNodes = Bump.QuantizedNodeArray.create();
      this.quantizedContiguousNodes = Bump.QuantizedNodeArray.create();
      this.SubtreeHeaders = Bump.BvhSubtreeInfoArray.create();
      // End default initializers

      this.bvhAabbMin = Bump.Vector3.create( -Infinity, -Infinity, -Infinity );
      this.bvhAabbMax = Bump.Vector3.create(  Infinity,  Infinity,  Infinity );
    },

    members: {
      setInternalNodeAabbMin: Bump.notImplemented,
      setInternalNodeAabbMax: Bump.notImplemented,
      getAabbMin: Bump.notImplemented,
      getAabbMax: Bump.notImplemented,
      setInternalNodeEscapeIndex: Bump.notImplemented,
      mergeInternalNodeAabb: Bump.notImplemented,
      swapLeafNodes: Bump.notImplemented,

      assignInternalNodeFromLeafNode: function( internalNode, leafNodeIndex ) {
        if ( this.useQuantization ) {
          // this.quantizedContiguousNodes[internalNode] = this.quantizedLeafNodes[leafNodeIndex];
          this.quantizedContiguousNodes.viewAt( internalNode )
            .set( this.quantizedLeafNodes.viewAt( leafNodeIndex ) );
        } else {
          this.contiguousNodes[internalNode] = this.leafNodes[leafNodeIndex];
        }
      },

      buildTree: function( startIndex, endIndex ) {
        var splitAxis, splitIndex, i;
        var numIndices = endIndex - startIndex;
        var curIndex = this.curNodeIndex;

        Bump.Assert( numIndices > 0 );

        if ( numIndices === 1 ) {
          this.assignInternalNodeFromLeafNode( this.curNodeIndex, startIndex );

          ++this.curNodeIndex;
          return;
        }

        // calculate Best Splitting Axis and where to split it. Sort the
        // incoming `leafNodes` array within range `startIndex`/`endIndex`.
        splitAxis = this.calcSplittingAxis( startIndex, endIndex );

        splitIndex = this.sortAndCalcSplittingIndex( startIndex, endIndex, splitAxis );

        var internalNodeIndex = this.curNodeIndex;

        // set the min aabb to 'inf' or a max value, and set the max aabb to a
        // -inf/minimum value. The aabb will be expanded during
        // buildTree/mergeInternalNodeAabb with actual node values.
        this.setInternalNodeAabbMin( this.curNodeIndex, this.bvhAabbMax ); // can't use Bump.Vector3.create(  Infinity,  Infinity,  Infinity ) because of quantization
        this.setInternalNodeAabbMax( this.curNodeIndex, this.bvhAabbMin ); // can't use Bump.Vector3.create( -Infinity, -Infinity, -Infinity ) because of quantization

        for ( i = startIndex; i < endIndex; ++i ) {
          this.mergeInternalNodeAabb( this.curNodeIndex, this.getAabbMin(i), this.getAabbMax(i) );
        }

        ++this.curNodeIndex;

        var leftChildNodexIndex = this.curNodeIndex;

        // build left child tree
        this.buildTree( startIndex, splitIndex );

        var rightChildNodexIndex = this.curNodeIndex;
        // build right child tree
        this.buildTree( splitIndex, endIndex );

        var escapeIndex = this.curNodeIndex - curIndex;

        if ( this.useQuantization ) {
          // escapeIndex is the number of nodes of this subtree
          var sizeQuantizedNode = 16;
          var treeSizeInBytes = escapeIndex * sizeQuantizedNode;
          if ( treeSizeInBytes > Bump.MAX_SUBTREE_SIZE_IN_BYTES ) {
            this.updateSubtreeHeaders( leftChildNodexIndex, rightChildNodexIndex );
          }
        }
        // else { }

        this.setInternalNodeEscapeIndex( internalNodeIndex, escapeIndex );
      },

      calcSplittingAxis: Bump.notImplemented,
      sortAndCalcSplittingIndex: Bump.notImplemented,
      walkStacklessTree: Bump.notImplemented,
      walkStacklessQuantizedTreeAgainstRay: Bump.notImplemented,

      walkStacklessQuantizedTree: function( nodeCallback, quantizedQueryAabbMin, quantizedQueryAabbMax, startNodeIndex, endNodeIndex ) {
        Bump.Assert( this.useQuantization );

        var curIndex = startNodeIndex;
        var walkIterations = 0;
        var subTreeSize = endNodeIndex - startNodeIndex;

        var rootNode = Bump.QuantizedBvhNode.createRef();
        this.quantizedContiguousNodes.at( startNodeIndex, rootNode );
        var escapeIndex = 0;

        var isLeafNode = false;
        var aabbOverlap = false;

        while ( curIndex < endNodeIndex ) {
          // catch bugs in tree data
          Bump.Assert( walkIterations < subTreeSize );

          ++walkIterations;
          //PCK: unsigned instead of bool
          aabbOverlap = Bump.testQuantizedAabbAgainstQuantizedAabb( quantizedQueryAabbMin, quantizedQueryAabbMax, rootNode.quantizedAabbMin, rootNode.quantizedAabbMax );
          isLeafNode = rootNode.isLeafNode();

          if ( isLeafNode && aabbOverlap ) {
            nodeCallback.processNode( rootNode.getPartId(), rootNode.getTriangleIndex() );
          }

          if ( aabbOverlap || isLeafNode ) {
            ++rootNode;
            ++curIndex;
          } else {
            escapeIndex = rootNode.getEscapeIndex();
            rootNode += escapeIndex;
            curIndex += escapeIndex;
          }
        }

        if ( Bump.__QuantizedBvh__maxIterations < walkIterations ) {
          Bump.__QuantizedBvh__maxIterations = walkIterations;
        }

      },

      walkStacklessTreeAgainstRay: Bump.notImplemented,
      walkStacklessQuantizedTreeCacheFriendly: Bump.notImplemented,
      walkRecursiveQuantizedTreeAgainstQueryAabb: Bump.notImplemented,
      walkRecursiveQuantizedTreeAgainstQuantizedTree: Bump.notImplemented,
      updateSubtreeHeaders: Bump.notImplemented,

      setQuantizationValues: function( bvhAabbMin, bvhAabbMax, quantizationMargin ) {
        if ( arguments.length < 3 ) {
          quantizationMargin = 1;
        }

        // Enlarge the AABB to avoid division by zero when initializing the
        // quantization values.
        var clampValue = Bump.Vector3.create( quantizationMargin, quantizationMargin, quantizationMargin );
        this.bvhAabbMin = bvhAabbMin.subtract( clampValue, this.bvhAabbMin );
        this.bvhAabbMax = bvhAabbMax.add( clampValue, this.bvhAabbMax );
        var aabbSize = this.bvhAabbMax.subtract( this.bvhAabbMin );
        this.bvhQuantization = Bump.Vector3.create( 65533, 65533, 65533 ).divideVector( aabbSize, this.bvhQuantization );
        this.useQuantization = true;
      },

      buildInternal: Bump.notImplemented,

      reportAabbOverlappingNodex: function( nodeCallback, aabbMin, aabbMax ) {
        // Either choose recursive traversal (walkTree)
        // or stackless (walkStacklessTree).

        if ( this.useQuantization ) {
          // quantize query AABB
          var buffer = new ArrayBuffer( 12 );
          var quantizedQueryAabbMin = new Uint16Array( buffer, 0, 3 );
          var quantizedQueryAabbMax = new Uint16Array( buffer, 6, 3 );
          this.quantizeWithClamp( quantizedQueryAabbMin, aabbMin, false );
          this.quantizeWithClamp( quantizedQueryAabbMax, aabbMax, true  );

          switch ( this.traversalMode ) {
          case Bump.QuantizedBvh.TraversalMode.TRAVERSAL_STACKLESS:
            this.walkStacklessQuantizedTree( nodeCallback, quantizedQueryAabbMin, quantizedQueryAabbMax, 0, this.curNodeIndex );
            break;
          case Bump.QuantizedBvh.TraversalMode.TRAVERSAL_STACKLESS_CACHE_FRIENDLY:
            this.walkStacklessQuantizedTreeCacheFriendly( nodeCallback, quantizedQueryAabbMin, quantizedQueryAabbMax );
            break;
          case Bump.QuantizedBvh.TraversalMode.TRAVERSAL_RECURSIVE:
            var rootNode = this.quantizedContiguousNodes;
            this.walkRecursiveQuantizedTreeAgainstQueryAabb( rootNode, nodeCallback, quantizedQueryAabbMin, quantizedQueryAabbMax );
            break;
          default:
            // unsupported
            Bump.Assert( false );
          }
        } else {
          this.walkStacklessTree( nodeCallback, aabbMin, aabbMax );
        }
      },

      reportRayOverlappingNodex: Bump.notImplemented,
      reportBoxCastOverlappingNodex: Bump.notImplemented,

      quantize: function( out, point, isMax ) {
        var m_bvhAabbMin = this.bvhAabbMin;
        var m_bvhAabbMax = this.bvhAabbMax;

        Bump.Assert( this.useQuantization );

        Bump.Assert( point.x <= m_bvhAabbMax.x );
        Bump.Assert( point.y <= m_bvhAabbMax.y );
        Bump.Assert( point.z <= m_bvhAabbMax.z );

        Bump.Assert( point.x >= m_bvhAabbMin.x );
        Bump.Assert( point.y >= m_bvhAabbMin.y );
        Bump.Assert( point.z >= m_bvhAabbMin.z );

        var v = point.subtract( m_bvhAabbMin ).multiplyVector( this.bvhQuantization );
        // Make sure rounding is done in a way that unQuantize(quantizeWithClamp(...))
        // is conservative. End-points always set the first bit, so that they
        // are sorted properly (so that neighbouring AABBs overlap properly).
        // @todo: double-check this
        if ( isMax ) {
          out[0]  = v.x + 1;
          out[1]  = v.y + 1;
          out[2]  = v.z + 1;
          out[0] |= 1;
          out[1] |= 1;
          out[2] |= 1;
        } else {
          out[0]  = v.x;
          out[1]  = v.y;
          out[2]  = v.z;
          out[0] &= 0xfffe;
          out[1] &= 0xfffe;
          out[2] &= 0xfffe;
        }
      },

      quantizeWithClamp: function( out, point2, isMax ) {
        Bump.Assert( this.useQuantization );

        var clampedPoint = point2.clone();
        clampedPoint.setMax( this.bvhAabbMin );
        clampedPoint.setMin( this.bvhAabbMax );

        this.quantize( out, clampedPoint, isMax );
      },

      unQuantize: Bump.notImplemented,
      setTraversalMode: Bump.notImplemented,
      getQuantizedNodeArray: Bump.notImplemented,
      getSubtreeInfoArray: Bump.notImplemented,
      isQuantized: Bump.notImplemented
    },

    typeMembers: {
      TraversalMode: Bump.Enum([
        { id: 'TRAVERSAL_STACKLESS', value: 0 },
        'TRAVERSAL_STACKLESS_CACHE_FRIENDLY',
        'TRAVERSAL_RECURSIVE'
      ])
    }

  });

})( this, this.Bump );
