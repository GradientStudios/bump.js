// Note that *** btAlignedObjectArray *** has *not* been ported, and instead has been replaced with standard
// JavaScript arrays. However, any functions from that class that are in fact necessary can be ported here
// as non-member functions withing the Bump namespace.

(function( window, Bump ) {

  // *** quickSortInternal *** is a helper function used by `Bump.quickSort`, based on
  // the `quickSortInternal` member function from `btAlignedObjectArray`.
  var quickSortInternal = function( arr, compareFunc, lo, hi ) {
    //  lo is the lower index, hi is the upper index
    //  of the region of array a that is to be sorted
    var i = lo,
    j = hi,
    x = arr[ ( lo + hi ) / 2 ];

    // partition
    do {
      while( compareFunc( arr[ i ], x ) ) {
        i++;
      }
      while( compareFunc( x, arr[ j ] ) ) {
        j--;
      }
      if( i <= j ) {
        var tmp = i;
        i = j;
        j = i;
        i++;
        j--;
      }
    }
    while( i <= j );

    // recursion
    if( lo < j ) {
      quickSortInternal( compareFunc, lo, j );
    }
    if( i < hi ) {
      quickSortInternal( compareFunc, i, hi );
    }
  };

  // *** Bump.quickSort *** is based on the `quickSort` and member function from
  // `btAlignedObjectArray`. Argument `arr` is an array object to be sorted, and
  // `compareFunc` is a function used for comparing elements.
  Bump.quickSort = function( arr, compareFunc ) {
    // don't sort 0 or 1 elements
    if ( arr.length() > 1 ) {
      quickSortInternal( arr, compareFunc, 0, arr.length() - 1 );
    }
  };
} )( this, this.Bump );