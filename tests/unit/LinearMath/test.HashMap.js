module( 'Bump.HashString' );

test( 'hashing function', function() {
  var strings = [
    'abcdefghijklmnopqrstuvwxyz',
    'zyxwvutsrqponmlkjihgfedcba',
    'Cwm fjordbank glyphs vext quiz.',
    'Squdgy fez, blank jimp crwth vox!',
    'Jink cwm, zag veldt, fob qursh pyx.',
    'Junky qoph-flags vext crwd zimb.',
    'Cwm fjord veg balks nth pyx quiz.',
    'Sphinx of black quartz, judge my vow.',
    'How quickly daft jumping zebras vex.',
    'DJs flock by when MTV ax quiz prog.',
    'Bright vixens jump; dozy fowl quack.',
    'Sex-charged fop blew my junk TV quiz.',
    'Five quacking zephyrs jolt my wax bed.',
    'The five boxing wizards jump quickly.'
  ];

  var expected = [
    2965113986,
    824188276,
    281505862,
    3051725871,
    854792698,
    3828917717,
    1203555276,
    930175153,
    3289291058,
    2338892791,
    1505475534,
    1232863546,
    2616339565,
    2470339533
  ];

  for ( var i = 0; i < strings.length; ++i ) {
    equal( Bump.HashString.create( strings[i] ).getHash(), expected[i], strings[i] );
  }
});

module( 'Bump.HashInt' );

test( 'hashing function', function() {
  var ints = [
    0x0,
    0xf,
    0xfe,
    0xfed,
    0xfedc,
    0xfedcb,
    0xfedcba,
    0xfedcba9,
    0xfedcba98,
    0xfedcba987,
    0xfedcba9876,
    0xfedcba98765,
    0xfedcba987654,
    0xfedcba9876543,
    0x1fffffffffffff
  ];

  var expected = [
    0,
    315526958,
    489020388,
    587358483,
    1317778874,
    1291688096,
    1053658723,
    1280360083,
    1709640138,
    536856818,
    487825878,
    1022830585,
    736994399,
    1845794030,
    594805658
  ];

  for ( var i = 0; i < ints.length; ++i ) {
    equal( Bump.HashInt.create( ints[i] ).getHash(), expected[i], ints[i] + '' );
  }
});

module( 'Bump.HashMap' );

test( 'insertion, removal, and retrieval', function() {
  var hashMap = Bump.HashMap.create(),
      power = 16,
      numItems = 1 << power,
      objects = [],
      i;

  for ( i = 0; i < numItems; ++i ) {
    objects.push( {} );

    hashMap.insert( Bump.HashInt.create( i ), objects[i] );
  }

  equal( hashMap.size(), numItems, 'correct number of items after insertion' );

  var allSame = true;
  for ( i = 0; i < 3 * numItems; i += 3 ) {
    var index = i % numItems,
        retrievedObject = hashMap.get( Bump.HashInt.create( index ) ),
        expectedObject = objects[ index ],
        same = ( retrievedObject === expectedObject );

    if ( !same ) {
      equal( objects.indexOf( retrievedObject ), index, 'Index "' + index + '" fails' );
    }

    allSame = allSame && same;
  }

  strictEqual( allSame, true, 'inserted items are correctly retrieved' );

  for ( i = 0; i < numItems; ++i ) {
    if ( i % 2 ) {
      hashMap.remove( Bump.HashInt.create( i ) );
    }
  }

  equal( hashMap.size(), Math.ceil( numItems / 2 ), 'correct number of items after removal' );

  allSame = true;
  for ( i = 0; i < 3 * numItems; i += 3 ) {
    var index = i % numItems,
        retrievedObject = hashMap.get( Bump.HashInt.create( index ) ),
        expectedObject = objects[ index ],
        same;

    if ( index % 2 ) {
      same = ( retrievedObject === undefined );
      index = -1;
    } else {
      same = ( retrievedObject === expectedObject );
    }

    if ( !same ) {
      equal( objects.indexOf( retrievedObject ), index, 'Index "' + index + '" fails' );
    }

    allSame = allSame && same;
  }

  strictEqual( allSame, true, 'inserted items are correctly retrieved after removal' );

  hashMap.clear();
  equal( hashMap.size(), 0, 'clearing the hash removes all items' );
  deepEqual( hashMap, Bump.HashMap.create(), 'clearing the hash clears everything' );
});

test( 'using HashStrings', function() {
  var hashMap = Bump.HashMap.create(),
      power = 16,
      numItems = 1 << power,
      objects = [],
      i;

  for ( i = 0; i < numItems; ++i ) {
    objects.push( {} );

    hashMap.insert( Bump.HashString.create( i + '' ), objects[i] );
  }

  var allSame = true;
  for ( i = 0; i < 3 * numItems; i += 3 ) {
    var index = i % numItems,
        retrievedObject = hashMap.get( Bump.HashString.create( index + '' ) ),
        expectedObject = objects[ index ],
        same = ( retrievedObject === expectedObject );

    if ( !same ) {
      equal( objects.indexOf( retrievedObject ), index, 'Index "' + index + '" fails' );
    }

    allSame = allSame && same;
  }

  strictEqual( allSame, true, 'inserted items are correctly retrieved' );

});
