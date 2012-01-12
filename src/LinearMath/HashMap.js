// HashMap.js contains classes for the use with hashmaps. It includes some
// wrappers around primitive types.

(function( window, Bump ) {
  var BT_HASH_NULL = 0xffffffff,
      CAPACITY     = 0x80000000;

  Bump.HashString = Bump.type({
    init: function HashString( name ) {
      this.string = name;

      // magic numbers from [here](http://www.isthe.com/chongo/tech/comp/fnv/)
      var InitialFNV = 2166136261,
          FNVMultiple = 16777619,
          FNVMultipleHi = 16700000,
          FNVMultipleLo = 77619;

      // Fowler / Noll / Vo (FNV) Hash
      var hash = InitialFNV;
      for ( var i = 0; i < this.string.length; ++i ) {
        // xor the low 8 bits
        hash = hash ^ ( this.string.charCodeAt( i ) );
        hash = hash >>> 0;
        // Multiply by the magic number.
        //     hash = hash * FNVMultiple;
        //
        // **Warning:** This be very dragonous. This is because Javascript
        // doesn't have enough precision to do multiplication outright.
        hash = ( (( hash * FNVMultipleHi ) >>> 0) + (( hash * FNVMultipleLo ) >>> 0) ) >>> 0;
      }
      this.hash = hash;
    },

    members: {
      getHash: function() {
        return this.hash;
      },

      portableStringCompare: function( src, dst ) {
        var ret = 0 ,
            srcIndex = 0,
            dstIndex = 0;

        while(
          ! ( ret = ( src.charCodeAt( srcIndex ) - dst.charCodeAt( dstIndex ) ) ) &&
            dstIndex < dst.length
        ) {
          ++srcIndex;
          ++dstIndex;
        }

        if ( ret < 0 ) {
          ret = -1;
        } else if ( ret > 0 ) {
          ret = 1;
        }

        return ret;
      },

      equals: function( other ) {
        return ( this.string == other.string ) ||
          ( 0 === this.portableStringCompare( this.string, other.string ) );
      }
    }
  });

  // ## Bump.HashInt
  // A wrapper around an integer that provides it with a hashing function.
  Bump.HashInt = Bump.type({
    init: function HashInt( uid ) {
      this.uid = uid;
    },

    members: {
      getUid1: function() {
        return this.uid;
      },

      setUid1: function( uid ) {
        this.uid = uid;
        return this;
      },

      equals: function( other ) {
        return this.uid === other.uid;
      },

      getHash: function() {
        var key = this.uid;
        key += ~(key << 15);
        key ^=  (key >> 10);
        key +=  (key << 3);
        key ^=  (key >> 6);
        key += ~(key << 11);
        key ^=  (key >> 16);
        return key;
      }
    }
  });

  // `Bump.HashMap` is a direct port of the `btHashMap` class. It may be worth
  // exploring a more native solution.
  Bump.HashMap = Bump.type({
    init: function HashMap() {
      this.hashTable = [];
      this.next = [];

      this.valueArray = [];
      this.keyArray = [];
    },

    members: {
      insert: function( key, value ) {
        var hash = key.getHash() & ( CAPACITY - 1 );

        // Replace value if the key is already there.
        var index = this.findIndex( key );
        if ( index !== BT_HASH_NULL ) {
          this.valueArray[index] = value;
          return;
        }

        var count = this.valueArray.length;
        this.valueArray.push( value );
        this.keyArray.push( key );

        this.next[count] = this.hashTable[hash];
        this.hashTable[hash] = count;
      },

      // Remove the key-value pair associated with `key`.
      remove: function( key ) {
        var hash = key.getHash() & ( CAPACITY - 1 );

        var pairIndex = this.findIndex( key );

        if ( pairIndex === BT_HASH_NULL ) {
          return;
        }

        // Remove the pair from the hash table.
        var index = this.hashTable[hash];
        Bump.Assert( index !== BT_HASH_NULL );

        var previous = BT_HASH_NULL;
        while ( index !== pairIndex ) {
          previous = index;
          index = this.next[index];
        }

        if ( previous !== BT_HASH_NULL ) {
          Bump.Assert( this.next[previous] === pairIndex );
          this.next[previous] = this.next[pairIndex];
        } else {
          this.hashTable[hash] = this.next[pairIndex];
        }

        // We now move the last pair into spot of the
        // pair being removed. We need to fix the hash
        // table indices to support the move.

        var lastPairIndex = this.valueArray.length - 1;

        // If the removed pair is the last pair, we are done.
        if ( lastPairIndex === pairIndex ) {
          this.valueArray.pop();
          this.keyArray.pop();
          return;
        }

        // Remove the last pair from the hash table.
        var lastHash = this.keyArray[lastPairIndex].getHash() & ( CAPACITY - 1 );

        index = this.hashTable[lastHash];
        Bump.Assert( index !== BT_HASH_NULL );

        previous = BT_HASH_NULL;
        while ( index !== lastPairIndex ) {
          previous = index;
          index = this.next[index];
        }

        if ( previous !== BT_HASH_NULL ) {
          Bump.Assert( this.next[previous] === lastPairIndex );
          this.next[previous] = this.next[lastPairIndex];
        } else {
          this.hashTable[lastHash] = this.next[lastPairIndex];
        }

        // Copy the last pair into the remove pair's spot.
        this.valueArray[pairIndex] = this.valueArray[lastPairIndex];
        this.keyArray[pairIndex] = this.keyArray[lastPairIndex];

        // Insert the last pair into the hash table
        this.next[pairIndex] = this.hashTable[lastHash];
        this.hashTable[lastHash] = pairIndex;

        this.valueArray.pop();
        this.keyArray.pop();
      },

      size: function() {
        return this.valueArray.length;
      },

      getAtIndex: function( index ) {
        Bump.Assert( index < this.valueArray.length );
        return this.valueArray( index );
      },

      get: function( key ) {
        return this.find( key );
      },

      find: function( key ) {
        var index = this.findIndex( key );
        if ( index === BT_HASH_NULL ) {
          return undefined;
        }
        return this.valueArray[index];
      },

      findIndex: function( key ) {
        var hash = key.getHash() & ( CAPACITY - 1 );

        if ( hash >= this.hashTable.length ) {
          return BT_HASH_NULL;
        }

        // Because we don't need to constantly grow the hash table, we also
        // don't get a chance to initialize all the values to be `BT_HASH_NULL`.
        // Therefore, we check for `undefined`s and replace them with
        // `BT_HASH_NULL`s.
        var index = this.hashTable[hash];
        index = index === undefined ? BT_HASH_NULL : index;
        while (
          ( index !== BT_HASH_NULL ) &&
            key.equals( this.keyArray[index] ) === false
        ) {
          index = this.next[index];
          index = index === undefined ? BT_HASH_NULL : index;
        }
        return index;
      },

      clear: function() {
        this.hashTable = [];
        this.next = [];
        this.valueArray = [];
        this.keyArray = [];
        return this;
      }

    }
  });
})( this, this.Bump );
