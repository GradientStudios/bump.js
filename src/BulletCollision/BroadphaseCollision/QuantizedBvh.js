(function( window, Bump ) {
  // 10 gives the potential for 1024 parts, with at most 2^21 (2097152) (minus
  // one actually) triangles each (since the sign bit is reserved)
  Bump.MAX_NUM_PARTS_IN_BITS = 10;

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
    }
  });

  Bump.QuantizedBvh = Bump.type({
    init: function QuantizedBvh() {
      // Initializer list
      this.useQuantization = false;
      this.traversalMode = Bump.QuantizedBvh.TRAVERSAL_STACKLESS;
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
      // End default initializers

      this.bvhAabbMin = Bump.Vector3.create( -Infinity, -Infinity, -Infinity );
      this.bvhAabbMax = Bump.Vector3.create(  Infinity,  Infinity,  Infinity );
    },

    members: {
      setQuantizationValues: function( bvhAabbMin, bvhAabbMax, quantizationMargin ) {
        // Enlarge the AABB to avoid division by zero when initializing the
        // quantization values.
        var clampValue = Bump.Vector3.create( quantizationMargin, quantizationMargin, quantizationMargin );
        this.bvhAabbMin = bvhAabbMin.subtract( clampValue, this.bvhAabbMin );
        this.bvhAabbMax = bvhAabbMax.add( clampValue, this.bvhAabbMax );
        var aabbSize = this.bvhAabbMax.subtract( this.bvhAabbMin );
        this.bvhQuantization = Bump.Vector3.create( 65533, 65533, 65533 ).divideVector( aabbSize, this.bvhQuantization );
        this.useQuantization = true;
      },

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

        var v = point.subtract( m_bvhAabbMin ).multiplyScalar( this.bvhQuantization );
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
      }


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
