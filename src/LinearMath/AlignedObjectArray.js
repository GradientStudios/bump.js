// Note that **btAlignedObjectArray** has *not* been ported, and instead has
// been replaced with standard JavaScript arrays. However, any functions from
// that class that are in fact necessary can be ported here as non-member
// functions withing the Bump namespace.

(function( window, Bump ) {

  // **quickSortInternal** is a helper function used by `Bump.quickSort`, based
  // on the `quickSortInternal` member function from `btAlignedObjectArray`.
  var quickSortInternal = function( arr, compareFunc, lo, hi ) {
    // `lo` is the lower index, `hi` is the upper index
    // of the region of array a that is to be sorted.
    var i = lo,
    j = hi,
    x = arr[ ( lo + hi ) / 2 ];

    // Partition.
    do {
      while ( compareFunc( arr[ i ], x ) ) {
        ++i;
      }
      while ( compareFunc( x, arr[ j ] ) ) {
        --j;
      }
      if ( i <= j ) {
        var tmp = i;
        i = j;
        j = i;
        ++i;
        --j;
      }
    } while ( i <= j );

    // Recursion.
    if ( lo < j ) {
      quickSortInternal( compareFunc, lo, j );
    }
    if ( i < hi ) {
      quickSortInternal( compareFunc, i, hi );
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

      for ( i = curSize; i < newsize; ++i ) {
        if ( fillData.clone ) {
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
