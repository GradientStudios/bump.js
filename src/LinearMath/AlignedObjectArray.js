// Note that **btAlignedObjectArray** has *not* been ported, and instead has
// been replaced with standard JavaScript arrays. However, any functions from
// that class that are in fact necessary can be ported here as non-member
// functions withing the Bump namespace.

(function( window, Bump ) {

  Bump.TypedArray = Bump.type({
    init: function TypedArray( type, bytesPerElement ) {
      this.ownsMemory = true;

      this.type = type || Uint8Array;
      this.BYTES_PER_ELEMENT = bytesPerElement || type.BYTES_PER_ELEMENT;

      this.data = null;
      this.view = null;
      this.length = 0;
      this.capacity = 0;
    },

    members: {
      size: function() {
        return this.length;
      },

      allocSize: function( size ) {
        return size ? size * 2 : 1;
      },

      at: function( n ) {
        return this.view[ n ];
      },

      pointerAt: function( n ) {
        return new this.type( this.data, n * this.BYTES_PER_ELEMENT );
      },

      push: function( val ) {
        var size = this.length;
        if ( size === this.capacity ) {
          this.reserve( this.allocSize( size ) );
        }

        this.view[ size ] = val;

        ++this.length;
      },

      reserve: function( count ) {
        if ( this.capacity < count ) {
          var newData = new ArrayBuffer( this.BYTES_PER_ELEMENT * count );
          var newView = new this.type( newData );

          if ( this.view ) {
            newView.set( this.view );
          }

          this.ownsMemory = true;

          this.data = newData;
          this.view = newView;
          this.capacity = count;
        }
      },

      resize: function( newSize, fillData ) {
        var curSize = this.length;

        if ( newSize > curSize ) {
          this.reserve( newSize );
        }

        if ( fillData ) {
          throw new Error( 'Fill data not implemented yet' );
        }

        this.length = newSize;
      }

    }

  });

  Bump.UnsignedIntArray = Bump.type({
    parent: Bump.TypedArray,

    init: function UnsignedIntArray() {
      this._super( Uint32Array );
    }

  });

  // QuantizedBvhNode
  Bump.QuantizedNodeArray = Bump.type({
    parent: Bump.TypedArray,

    init: function QuantizedNodeArray() {
      this._super( Uint8Array, 16 );
    },

    members: {
      at: function( n ) {
        return Bump.QuantizedBvhNode.create( this.data, this.BYTES_PER_ELEMENT * n );
      },

      push: function( node ) {
        var size = this.length;
        if ( size === this.capacity ) {
          this.reserve( this.allocSize( size ) );
        }

        this.view.set( node.__view, size * this.BYTES_PER_ELEMENT );

        ++this.length;
      }

    }
  });

  // Vector3
  Bump.Vector3Array = Bump.type({
    parent: Bump.TypedArray,

    init: function Vector3Array() {
      this._super( Float64Array, Float64Array.BYTES_PER_ELEMENT * 4 );
      this.__retVal = Bump.Vector3.create();
    },

    members: {
      at: function( n ) {
        var view = this.view;
        var retVal = this.__retVal;
        var idx = n * 4;

        retVal.x = view[ idx ];
        retVal.y = view[ idx + 1 ];
        retVal.z = view[ idx + 2 ];
        retVal.w = view[ idx + 3 ];

        return retVal;
      },

      push: function( v ) {
        var size = this.length;
        if ( size === this.capacity ) {
          this.reserve( this.allocSize( size ) );
        }

        var idx = size * 4;
        var view = this.view;
        view[ idx     ] = v.x;
        view[ idx + 1 ] = v.y;
        view[ idx + 2 ] = v.z;
        view[ idx + 3 ] = v.w;

        ++this.length;
      }

    }

  });

  // **quickSortInternal** is a helper function used by `Bump.quickSort`, based
  // on the `quickSortInternal` member function from `btAlignedObjectArray`.
  var quickSortInternal = function( arr, compareFunc, lo, hi ) {
    // `lo` is the lower index, `hi` is the upper index
    // of the region of array a that is to be sorted.
    var i = lo;
    var j = hi;
    var x = arr[ ~~( ( lo + hi ) / 2 ) ];

    // Partition.
    do {
      while ( compareFunc( arr[ i ], x ) ) {
        ++i;
      }
      while ( compareFunc( x, arr[ j ] ) ) {
        --j;
      }
      if ( i <= j ) {
        var tmp = arr[ i ];
        arr[ i ] = arr[ j ];
        arr[ j ] = tmp;
        ++i;
        --j;
      }
    } while ( i <= j );

    // Recursion.
    if ( lo < j ) {
      quickSortInternal( arr, compareFunc, lo, j );
    }

    if ( i < hi ) {
      quickSortInternal( arr, compareFunc, i, hi );
    }
  };

  // **Bump.quickSort** is based on the `quickSort` and member function from
  // `btAlignedObjectArray`. Argument `arr` is an array object to be sorted, and
  // `compareFunc` is a function used for comparing elements.
  Bump.quickSort = function( arr, compareFunc ) {
    // Don't sort 0 or 1 elements.
    if ( arr.length > 1 ) {
      quickSortInternal( arr, compareFunc, 0, arr.length - 1 );
    }
  };

  // **Bump.resize** is the `resize` member function of `btAlignedObjectArray`.
  // Given an Javascript Array `arr`, will change the number of elements in the
  // array. If the new size is larger, the new elements will be constructed
  // using `clone`s of the `fillData`. If the new size is smaller, the
  // destructor will be called.
  Bump.resize = function( arr, newsize, fillData ) {
    var i, curSize = arr.length;

    if ( newsize < curSize ) {
      for ( i = newsize; i < curSize; ++i ) {
        if ( arr[i].destruct ) {
          arr[i].destruct();
        }
      }
      arr.length = newsize;
    } else {
      if ( newsize > arr.length ) {
        arr.length = newsize;
      }

      var data = fillData || {},
          hasClone = data.clone;

      for ( i = curSize; i < newsize; ++i ) {
        if ( hasClone ) {
          arr[ i ] = fillData.clone();
        } else {
          arr[ i ] = fillData;
        }
      }
    }
  };

  // **Bump.remove** removes the first instance of `key` from the array. This
  // does not preserve the ordering, as it avoids a `O(n)` copy by moving the
  // last element, then popping the last element.
  Bump.remove = function( arr, key ) {
    var findIndex = arr.indexOf( key );
    if ( findIndex !== -1 ) {
      arr[ findIndex ] = arr[ arr.length - 1 ];
      arr.pop();
    }
  };

})( this, this.Bump );
