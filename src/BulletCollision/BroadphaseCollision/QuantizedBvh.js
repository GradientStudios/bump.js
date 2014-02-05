// load: bump.js
// load: LinearMath/Vector3.js

// run: LinearMath/AlignedObjectArray.js
// run: LinearMath/AabbUtil2.js

(function( window, Bump ) {
  var tmpV1 = Bump.Vector3.create();
  var tmpV2 = Bump.Vector3.create();
  var tmpV3 = Bump.Vector3.create();

  // Used in reportAabbOverlappingNodex.
  var rAONBuffer = new ArrayBuffer( 12 );
  var rAONAabbMin = new Uint16Array( rAONBuffer, 0, 3 );
  var rAONAabbMax = new Uint16Array( rAONBuffer, 6, 3 );

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
        buffer.__cache = {};
      }

      if ( !buffer.__cache[ byteOffset ] ) {
        buffer.__cache[ byteOffset ] = {
          a: new Uint8Array( buffer, byteOffset, 16 ),
          b: new Uint16Array( buffer, byteOffset, 3 ),
          c: new Uint16Array( buffer, byteOffset + 6, 3 ),
          d: new Int32Array( buffer, byteOffset + 12, 1 )
        };
      }

      var cache = buffer.__cache[ byteOffset ];
      this.__view = cache.a;
      this.quantizedAabbMin = cache.b;
      this.quantizedAabbMax = cache.c;
      this.escapeIndexOrTriangleIndex = cache.d;
    },

    members: {
      assign: function( other ) {
        this.__view.set( other.__view );
        return this;
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
        this.__view.set( other.__view );
        return this;
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
      this.subtreeHeaderCount = 0; // PCK: add this line
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

      this.__cacheRootNode = Bump.QuantizedBvhNode.createRef();
    },

    members: {
      // Uses the following temporary variables:
      //
      // - `tmpV1` ← `quantize`
      setInternalNodeAabbMin: function( nodeIndex, aabbMin ) {
        if ( this.useQuantization ) {
          this.quantize( this.quantizedContiguousNodes.at( nodeIndex ).quantizedAabbMin, aabbMin, false );
        } else {
          this.contiguousNodes[nodeIndex].aabbMinOrg.assign( aabbMin );
        }
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1` ← `quantize`
      setInternalNodeAabbMax: function( nodeIndex, aabbMax ) {
        if ( this.useQuantization ) {
          this.quantize( this.quantizedContiguousNodes.at( nodeIndex ).quantizedAabbMax, aabbMax, true );
        } else {
          this.contiguousNodes[nodeIndex].aabbMaxOrg.assign( aabbMax );
        }
      },

      getAabbMin: function( nodeIndex ) {
        if ( this.useQuantization ) {
          return this.unQuantize( this.quantizedLeafNodes.at( nodeIndex ).quantizedAabbMin );
        }
        // non-quantized
        return this.leafNodes[nodeIndex].aabbMinOrg;
      },

      getAabbMax: function( nodeIndex ) {
        if ( this.useQuantization ) {
          return this.unQuantize( this.quantizedLeafNodes.at( nodeIndex ).quantizedAabbMax );
        }
        // non-quantized
        return this.leafNodes[nodeIndex].aabbMaxOrg;
      },

      setInternalNodeEscapeIndex: function( nodeIndex, escapeIndex ) {
        if ( this.useQuantization ) {
          this.quantizedContiguousNodes.at( nodeIndex ).escapeIndexOrTriangleIndex[0] = -escapeIndex;
        } else {
          this.contiguousNodes[nodeIndex].escapeIndex = escapeIndex;
        }
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1` ← `quantize`
      mergeInternalNodeAabb: function( nodeIndex, newAabbMin, newAabbMax ) {
        if ( this.useQuantization ) {
          var m_quantizedContiguousNodes = this.quantizedContiguousNodes;
          var buffer = new ArrayBuffer( 12 );

          var quantizedAabbMin = new Uint16Array( buffer, 0, 3 );
          var quantizedAabbMax = new Uint16Array( buffer, 6, 3 );
          this.quantize( quantizedAabbMin, newAabbMin, false );
          this.quantize( quantizedAabbMax, newAabbMax, true  );

          var node = m_quantizedContiguousNodes.at( nodeIndex );
          for ( var i = 0; i < 3; ++i ) {
            if ( node.quantizedAabbMin[i] > quantizedAabbMin[i] ) {
              node.quantizedAabbMin[i] = quantizedAabbMin[i];
            }

            if ( node.quantizedAabbMax[i] < quantizedAabbMax[i] ) {
              node.quantizedAabbMax[i] = quantizedAabbMax[i];
            }
          }
        } else {
          // non-quantized
          this.contiguousNodes[nodeIndex].aabbMinOrg.setMin( newAabbMin );
          this.contiguousNodes[nodeIndex].aabbMaxOrg.setMax( newAabbMax );
        }
      },

      swapLeafNodes: function( i, splitIndex ) {
        // Is this safe to do? I think so, but not sure.
        if ( i === splitIndex ) { return; }

        var tmp;
        if ( this.useQuantization ) {
          var m_quantizedLeafNodes = this.quantizedLeafNodes;
          tmp = Bump.QuantizedBvhNode.create();

          tmp.assign( m_quantizedLeafNodes.at( i ) );
          m_quantizedLeafNodes.at( i, Bump.QuantizedBvhNode.createRef() ).assign( m_quantizedLeafNodes.at( splitIndex ) );
          m_quantizedLeafNodes.at( splitIndex ).assign( tmp );
        } else {
          var m_leafNodes = this.leafNodes;

          tmp = m_leafNodes[i];
          m_leafNodes[i] = m_leafNodes[splitIndex];
          m_leafNodes[splitIndex] = tmp;
        }
      },

      assignInternalNodeFromLeafNode: function( internalNode, leafNodeIndex ) {
        if ( this.useQuantization ) {
          // this.quantizedContiguousNodes[internalNode] = this.quantizedLeafNodes[leafNodeIndex];
          this.quantizedContiguousNodes.viewAt( internalNode )
            .set( this.quantizedLeafNodes.viewAt( leafNodeIndex ) );
        } else {
          this.contiguousNodes[internalNode] = this.leafNodes[leafNodeIndex];
        }
      },

      // Uses the following temporary variables:
      //
      // - `tmpV1` ← `calcSplittingAxis`
      // - `tmpV2` ← `calcSplittingAxis`
      // - `tmpV3` ← `calcSplittingAxis`
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

      // Uses the following temporary variables:
      //
      // - `tmpV1`
      // - `tmpV2`
      // - `tmpV3`
      calcSplittingAxis: function( startIndex, endIndex ) {
        var i;

        var means = tmpV1.setValue( 0, 0, 0 );
        var variance = tmpV2.setValue( 0, 0, 0 );
        var numIndices = endIndex - startIndex;

        var center;
        for ( i = startIndex; i < endIndex; ++i ) {
          center = this.getAabbMax( i ).add( this.getAabbMin( i ), tmpV3 ).multiplyScalar( 0.5, tmpV3 );
          means.addSelf( center );
        }
        means.multiplyScalarSelf( 1 / numIndices );

        for ( i = startIndex; i < endIndex; ++i ) {
          center = this.getAabbMax( i ).add( this.getAabbMin( i ), tmpV3 ).multiplyScalar( 0.5, tmpV3 );
          var diff2 = center.subtract( means, tmpV3 );
          diff2 = diff2.multiplyVector( diff2, tmpV3 );
          variance.addSelf( diff2 );
        }
        variance.multiplyScalarSelf( 1 / (numIndices - 1) );

        return variance.maxProperty();
      },

      sortAndCalcSplittingIndex: function( startIndex, endIndex, splitAxis ) {
        var i;
        var splitIndex = startIndex;
        var numIndices = endIndex - startIndex;
        var splitValue = 0;

        var center, tmpVec = Bump.Vector3.create();
        var means = Bump.Vector3.create( 0, 0, 0 );
        for ( i = startIndex; i < endIndex; ++i ) {
          center = this.getAabbMax( i ).add( this.getAabbMin( i ), tmpVec ).multiplyScalar( 0.5, tmpVec );
          means.addSelf( center );
        }
        means.multiplyScalarSelf( 1 / numIndices );

        splitValue = means[splitAxis];

        // sort leafNodes so all values larger then splitValue comes first, and
        // smaller values start from `splitIndex`.
        for ( i = startIndex; i < endIndex; ++i ) {
          center = this.getAabbMax( i ).add( this.getAabbMin( i ), tmpVec ).multiplyScalar( 0.5, tmpVec );
          if ( center[splitAxis] > splitValue ) {
            // swap
            this.swapLeafNodes( i, splitIndex );
            ++splitIndex;
          }
        }

        // If the splitIndex causes unbalanced trees, fix this by using the
        // center in between `startIndex` and `endIndex`. Otherwise the
        // tree-building might fail due to stack-overflows in certain cases.
        // `unbalanced1` is unsafe: it can cause stack overflows
        // bool unbalanced1 = ((splitIndex==startIndex) || (splitIndex == (endIndex-1)));

        // unbalanced2 should work too: always use center (perfect balanced trees)
        // bool unbalanced2 = true;

        // this should be safe too:
        var rangeBalancedIndices = ~~( numIndices / 3 );
        var unbalanced = ( (splitIndex <= ( startIndex +   rangeBalancedIndices )) ||
                           (splitIndex >= ( endIndex - 1 - rangeBalancedIndices )) );

        if ( unbalanced ) {
          splitIndex = startIndex + ( numIndices >> 1 );
        }

        var unbal = ( splitIndex === startIndex ) || ( splitIndex === endIndex );
        Bump.Assert( !unbal );

        return splitIndex;
      },

      walkStacklessTree: Bump.notImplemented,
      walkStacklessQuantizedTreeAgainstRay: Bump.notImplemented,

      walkStacklessQuantizedTree: function( nodeCallback, quantizedQueryAabbMin, quantizedQueryAabbMax, startNodeIndex, endNodeIndex ) {
        var m_quantizedContiguousNodes = this.quantizedContiguousNodes;

        Bump.Assert( this.useQuantization );

        var curIndex = startNodeIndex;
        var walkIterations = 0;
        var subTreeSize = endNodeIndex - startNodeIndex;

        var rootNode = this.__cacheRootNode;
        var rootNodeIndex = startNodeIndex;
        m_quantizedContiguousNodes.at( startNodeIndex, rootNode );
        var escapeIndex = 0;

        var isLeafNode = false;
        var aabbOverlap = false;

        while ( curIndex < endNodeIndex ) {
          // catch bugs in tree data
          Bump.Assert( walkIterations < subTreeSize );

          ++walkIterations;
          // PCK: unsigned instead of bool
          aabbOverlap = Bump.testQuantizedAabbAgainstQuantizedAabb( quantizedQueryAabbMin, quantizedQueryAabbMax, rootNode.quantizedAabbMin, rootNode.quantizedAabbMax );
          isLeafNode = rootNode.isLeafNode();

          if ( isLeafNode && aabbOverlap ) {
            nodeCallback.processNode( rootNode.getPartId(), rootNode.getTriangleIndex() );
          }

          if ( aabbOverlap || isLeafNode ) {
            ++rootNodeIndex; m_quantizedContiguousNodes.at( rootNodeIndex, rootNode );
            ++curIndex;
          } else {
            escapeIndex = rootNode.getEscapeIndex();
            rootNodeIndex += escapeIndex; m_quantizedContiguousNodes.at( rootNodeIndex, rootNode );
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

      // Uses the following temporary variables:
      //
      // - `tmpV1` ← `quantizeWithClamp`
      // - `tmpV2` ← `quantizeWithClamp`
      reportAabbOverlappingNodex: function( nodeCallback, aabbMin, aabbMax ) {
        // Either choose recursive traversal (walkTree)
        // or stackless (walkStacklessTree).

        if ( this.useQuantization ) {
          // quantize query AABB
          // !!!: `quantizeWithClamp` will initialize the typed arrays.
          var quantizedQueryAabbMin = rAONAabbMin;
          var quantizedQueryAabbMax = rAONAabbMax;
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

      // Uses the following temporary variables:
      //
      // - `tmpV1`
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

        var v = point.subtract( m_bvhAabbMin, tmpV1 ).multiplyVector( this.bvhQuantization, tmpV1 );
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

      // Uses the following temporary variables:
      //
      // - `tmpV1` ← `quantize`
      // - `tmpV2`
      quantizeWithClamp: function( out, point2, isMax ) {
        Bump.Assert( this.useQuantization );

        var clampedPoint = tmpV2.assign( point2 );
        clampedPoint.setMax( this.bvhAabbMin );
        clampedPoint.setMin( this.bvhAabbMax );

        this.quantize( out, clampedPoint, isMax );
      },

      unQuantize: function( vecIn ) {
        Bump.Assert( vecIn instanceof Uint16Array );

        var vecOut = Bump.Vector3.create();
        vecOut.setValue(
          vecIn[0] / this.bvhQuantization.x,
          vecIn[1] / this.bvhQuantization.y,
          vecIn[2] / this.bvhQuantization.z
        );
        vecOut.addSelf( this.bvhAabbMin );
        return vecOut;
      },

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
