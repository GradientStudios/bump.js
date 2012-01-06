module( 'Bump.DbvtAabbMm' );

test( 'DbvtAabbMm exists', function() {
  var dbvtaabbmm = Bump.DbvtAabbMm || {};
  strictEqual( typeof dbvtaabbmm.create, 'function', 'Bump.DbvtAabbMm exists' );
} );

test( 'DbvtAabbMm creation', function() {
  var t = Bump.DbvtAabbMm.create() || {};
  ok( t instanceof Bump.DbvtAabbMm.prototype.init, 'creation without `new` operator' );
});

module( 'Bump.DbvtAabbMm constructor' );

test( 'empty', function() {
  var box = Bump.DbvtAabbMm.create();
  deepEqual( box.mi, Bump.Vector3.create(), 'mi zeroed out' );
  deepEqual( box.mx, Bump.Vector3.create(), 'mx zeroed out' );
} );

test( 'FromCE', function() {
  strictEqual( typeof Bump.DbvtAabbMm.FromCE, 'function', 'FromCE exists' );

  var box = Bump.DbvtAabbMm.FromCE(
    Bump.Vector3.create( ),
    Bump.Vector3.create( 5, 10, 20 )
  );

  deepEqual( box.mi, Bump.Vector3.create( -5, -10, -20 ), 'mi initialized correctly' );
  deepEqual( box.mx, Bump.Vector3.create( 5, 10, 20 ), 'mx initialized correctly' );
} );

test( 'FromCR', function() {
  strictEqual( typeof Bump.DbvtAabbMm.FromCR, 'function', 'FromCR exists' );

  var box = Bump.DbvtAabbMm.FromCR(
    Bump.Vector3.create( ),
    10
  );

  deepEqual( box.mi, Bump.Vector3.create( -10, -10, -10 ), 'mi initialized correctly' );
  deepEqual( box.mx, Bump.Vector3.create( 10, 10, 10 ), 'mx initialized correctly' );
} );

test( 'FromMM', function() {
  strictEqual( typeof Bump.DbvtAabbMm.FromMM, 'function', 'FromMM exists' );

  var min = Bump.Vector3.create( -5, -10, -20 ),
      max = Bump.Vector3.create( 5, 10, 20 ),
      box = Bump.DbvtAabbMm.FromMM( min, max );

  ok( box.mi !== min, 'mi copied' );
  deepEqual( box.mi, min, 'mi value correct' );
  ok( box.mx !== max, 'mx copied' );
  deepEqual( box.mx, max, 'mx value correct' );
} );

test( 'FromPoints', function() {
  strictEqual( typeof Bump.DbvtAabbMm.FromPoints, 'function', 'FromPoints exists' );

  var pts = [
        Bump.Vector3.create( -5, -2, 0 ),
        Bump.Vector3.create(),
        Bump.Vector3.create( -12, -2, 0 ),
        Bump.Vector3.create( 8, 10, 0 ),
        Bump.Vector3.create( 4, 12, -10 ),
      ],
      box = Bump.DbvtAabbMm.FromPoints( pts );

  deepEqual( box.mi, Bump.Vector3.create( -12, -2, -10 ), 'mi value correct' );
  deepEqual( box.mx, Bump.Vector3.create( 8, 12, 0 ), 'mx value correct' );
} );

module( 'Bump.DbvtAabbMm member functions' );

(function() {

  // shortcut for making a DbvtAabbMm
  var make = function( mix, miy, miz, mxx, mxy, mxz ) {
    var box = Bump.DbvtAabbMm.create();
    box.mi.setValue( mix, miy, miz );
    box.mx.setValue( mxx, mxy, mxz );
    return box;
  };

  test( 'Center', function() {
    var objs = [
          make( -10, -10, -10, 10, 10, 10 ),
          make( 2, 0, -4, 4, 6, 12 ),
        ],
        expected = [
          Bump.Vector3.create(),
          Bump.Vector3.create( 3, 3, 4 ),
        ];
    testUnaryOp( Bump.DbvtAabbMm, 'Center', objs, expected, {
      destType: Bump.Vector3 } );

  } );

  test( 'Lengths', function() {
    var objs = [
          make( -10, -10, -10, 10, 10, 10 ),
          make( 2, 0, -4, 4, 6, 12 ),
        ],
        expected = [
          Bump.Vector3.create( 20, 20, 20 ),
          Bump.Vector3.create( 2, 6, 16 ),
        ];
    testUnaryOp( Bump.DbvtAabbMm, 'Lengths', objs, expected, {
      destType: Bump.Vector3 } );

  } );

  test( 'Extents', function() {
    var objs = [
          make( -10, -10, -10, 10, 10, 10 ),
          make( 2, 0, -4, 4, 6, 12 ),
        ],
        expected = [
          Bump.Vector3.create( 10, 10, 10 ),
          Bump.Vector3.create( 1, 3, 8 ),
        ];
    testUnaryOp( Bump.DbvtAabbMm, 'Extents', objs, expected, {
      destType: Bump.Vector3 } );

  } );

  test( 'Mins', function() {
    var objs = [
          make( -10, -10, -10, 10, 10, 10 ),
          make( 2, 0, -4, 4, 6, 12 ),
        ],
        expected = [
          Bump.Vector3.create( -10, -10, -10 ),
          Bump.Vector3.create( 2, 0, -4 ),
        ];
    testUnaryOp( Bump.DbvtAabbMm, 'Mins', objs, expected );

  } );

  test( 'Maxs', function() {
    var objs = [
          make( -10, -10, -10, 10, 10, 10 ),
          make( 2, 0, -4, 4, 6, 12 ),
        ],
        expected = [
          Bump.Vector3.create( 10, 10, 10 ),
          Bump.Vector3.create( 4, 6, 12 ),
        ];
    testUnaryOp( Bump.DbvtAabbMm, 'Maxs', objs, expected );

  } );

  test( 'Expand', function() {
    var box = make( -1, -2, -3, 3, 2, 1 ),
        e = Bump.Vector3.create( 2, 2, 2 ),
        mi = box.mi,
        mx = box.mx,
        expected = make( -3, -4, -5, 5, 4, 3 );

    testBinaryOp( Bump.DbvtAabbMm, 'Expand', box, e, expected, {
      modifiesSelf: true
    } );
    ok( mi === box.mi, 'mi modified in place' );
    ok( mx === box.mx, 'mx modified in place' );
  } );

  test( 'SignedExpand', function() {
    var box = make( -1, -2, -3, 3, 2, 1 ),
        e = Bump.Vector3.create( -2, 2, 0 ),
        mi = box.mi,
        mx = box.mx,
        expected = make( -3, -2, -3, 3, 4, 1 );

    testBinaryOp( Bump.DbvtAabbMm, 'SignedExpand', box, e, expected, {
      modifiesSelf: true
    } );
    ok( mi === box.mi, 'mi modified in place' );
    ok( mx === box.mx, 'mx modified in place' );
  } );

  test( 'Contain', function() {
    var boxA = make( -1, -2, -3, 3, 2, 1 ),
        boxBs = [
          make( -1, -1, -1, 1, 1, 1 ),
          make( -1, -2, -3, 3, 2, 1 ),
          make( 0, -2, -3, 4, 2, 1 ),
          make( -2, -2, -3, 2, 2, 1 ),
          make( -1, -1, -3, 3, 3, 1 ),
          make( -1, -3, -3, 3, 1, 1 ),
          make( -1, -2, -2, 3, 2, 2 ),
          make( -1, -2, -4, 3, 2, 0 ),
          make( -3, -3, -3, 3, 3, 3 ),
        ],
        expected = [
          true,
          true,
          false,
          false,
          false,
          false,
          false,
          false,
          false
        ];

    testBinaryOp( Bump.DbvtAabbMm, 'Contain', boxA, boxBs, expected );
  } );

  test( 'Classify', function() {
    ok( Bump.DbvtAabbMm.prototype.Classify, 'Classify exists' );

    var sqrt3 = Math.sqrt( 3 ),
        box = make( 2/sqrt3, 2/sqrt3, 2/sqrt3, 3/sqrt3, 3/sqrt3, 3/sqrt3 ),
        box2 = make( -1/sqrt3, -1/sqrt3, -1/sqrt3, 1/sqrt3, 1/sqrt3, 1/sqrt3 );
    equal( box.Classify( Bump.Vector3.create( 1, 1, 1 ).normalize(),
                         0, 7 ), 1, 'returns 1' );
    equal( box.Classify( Bump.Vector3.create( 1, 1, 1 ).normalize(),
                         2, 7 ), 1, 'returns 1' );
    ok( true, 'TODO : Decide what to do about bug and then finish tests.' );
    /*
    equal( box2.Classify( Bump.Vector3.create( 1, 1, 1 ).normalize(),
                          0, 7 ), 0, 'returns 0' );
    equal( box.Classify( Bump.Vector3.create( 1, 1, 1 ).normalize(),
                         2.5, 7 ), 0, 'returns 0' );
    equal( box.Classify( Bump.Vector3.create( 1, 1, 1 ).normalize(),
                         3, 7 ), 0, 'returns 0' );
    equal( box.Classify( Bump.Vector3.create( 1, 1, 1 ).normalize(),
                         4, 7 ), 0, 'returns -1' );
    */
  } );

  test( 'ProjectMinimum', function() {
    ok( true, 'TODO' );
  } );

  test( 'AddSpan', function() {
    ok( true, 'TODO' );
  } );

  module( 'Bump.DbvtAabbMm associated global functions' );

  test( 'Bump.Intersect.DbvtAabbMm2', function() {
    strictEqual( typeof Bump.Intersect, 'object', 'Bump.Intersect exists' );
    strictEqual( typeof Bump.Intersect.DbvtAabbMm2, 'function', 'Bump.Intersect.DbvtAabbMm2 exists' );

    var box1 = make( -1, -1, -1, 1, 1, 1 ),
        box2 = make( -2, -3, -3, 0, -2, -2 ),
        box3 = make( -3, -2, -3, -2, 0, -2 ),
        box4 = make( -3, -3, -2, -2, -2, 0 ),
        box5 = make( 0, -3, -3, 2, -2, -2 ),
        box6 = make( -3, 0, -3, -2, 2, -2 ),
        box7 = make( -3, -3, 0, -2, -2, 2 ),
        box8 = make( -3, -3, -3, -2, -2, -2 ),
        box9 = make( -2, -2, -2, 2, 2, 2 ),
        box10 = make( 0, 0, 0, 2, 2, 2 ),
        box11 = make( -2, -2, -2, 0, 0, 0 );

    var func = Bump.Intersect.DbvtAabbMm2;
    ok( !func( box1, box2 ), 'no overlap on x axis' );
    ok( !func( box1, box3 ), 'no overlap on y axis' );
    ok( !func( box1, box4 ), 'no overlap on z axis' );
    ok( !func( box1, box5 ), 'no overlap on x axis' );
    ok( !func( box1, box6 ), 'no overlap on y axis' );
    ok( !func( box1, box7 ), 'no overlap on z axis' );
    ok( !func( box1, box8 ), 'no overlap on any axis' );
    ok( func( box1, box9 ), 'overlap on all axes' );
    ok( func( box1, box10 ), 'overlap on all axes' );
    ok( func( box1, box11 ), 'overlap on all axes' );


  } );

  test( 'Bump.Intersect.DbvtAabbMm.Vector3', function() {
    strictEqual( typeof Bump.Intersect, 'object', 'Bump.Intersect exists' );
    strictEqual( typeof Bump.Intersect.DbvtAabbMm, 'object', 'Bump.Intersect.DbvtAabbMm exists' );
    strictEqual( typeof Bump.Intersect.DbvtAabbMm.Vector3, 'function',
                 'Bump.Intersect.DbvtAabbMm exists' );

    var box = make( -1, -1, -1, 1, 1, 1 ),
        vec1 = Bump.Vector3.create(),
        vec2 = Bump.Vector3.create( 1, 1, 1 ),
        vec3 = Bump.Vector3.create( -1, -1, -1 ),
        vec4 = Bump.Vector3.create( 2, 1, 1 ),
        vec5 = Bump.Vector3.create( 1, 2, 1 ),
        vec6 = Bump.Vector3.create( 1, 1, 2 ),
        vec7 = Bump.Vector3.create( 2, 2, 2 );
        vec8 = Bump.Vector3.create( -2, -1, -1 ),
        vec9 = Bump.Vector3.create( -1, -2, -1 ),
        vec10 = Bump.Vector3.create( -1, -1, -2 ),
        vec11 = Bump.Vector3.create( -2, -2, -2 );

    var func = Bump.Intersect.DbvtAabbMm.Vector3;
    ok( func( box, vec1 ), 'origin' );
    ok( func( box, vec2 ), '+X, +Y, +Z corner' );
    ok( func( box, vec3 ), '-X, -Y, -Z corner' );
    ok( !func( box, vec4 ), 'no overlap on x axis' );
    ok( !func( box, vec5 ), 'no overlap on y axis' );
    ok( !func( box, vec6 ), 'no overlap on z axis' );
    ok( !func( box, vec7 ), 'no overlap on any axis' );
    ok( !func( box, vec8 ), 'no overlap on x axis' );
    ok( !func( box, vec9 ), 'no overlap on y axis' );
    ok( !func( box, vec10 ), 'no overlap on z axis' );
    ok( !func( box, vec11 ), 'no overlap on any axis' );

  } );

  test( 'Bump.Proximity.DbvtAabbMm2', function() {
    strictEqual( typeof Bump.Proximity, 'object', 'Bump.Proximity exists' );
    strictEqual( typeof Bump.Proximity.DbvtAabbMm2, 'function', 'Bump.Proximity.DbvtAabbMm2 exists' );

    var box1 = make( -3, -3, -3, -1, -1, -1 ),
        box2 = make( 4, 4, 4, 12, 12, 12 );

    var func = Bump.Proximity.DbvtAabbMm2;
    equal( func( box1, box2 ), 60, 'correct result' );

  } );

  test( 'Bump.Select.DbvtAabbMm3', function() {
    strictEqual( typeof Bump.Select, 'object', 'Bump.Select exists' );
    strictEqual( typeof Bump.Select.DbvtAabbMm3, 'function', 'Bump.Select.DbvtAabbMm3 exists' );

    var box1 = make( -3, -3, -3, -1, -1, -1 ),
        box2 = make( 4, 4, 4, 12, 12, 12 ),
        box3 = make( 1, 1, 1, 5, 5, 5 );

    var func = Bump.Select.DbvtAabbMm3;
    ok( func( box1, box2, box3 ) === 1, 'correct result' );
    ok( func( box1, box3, box2 ) === 0, 'correct result' );
    ok( func( box3, box1, box2 ) === 1, 'correct result' );
    ok( func( box3, box2, box1 ) === 1, 'correct result' );

  } );

  test( 'Bump.Merge.DbvtAabbMm3', function() {
    strictEqual( typeof Bump.Merge, 'object', 'Bump.Merge exists' );
    strictEqual( typeof Bump.Merge.DbvtAabbMm3, 'function', 'Bump.Merge.DbvtAabbMm3 exists' );

    var box1 = make( 0, -5, -2, 1, 10, 25 ),
        box2 = make( -1, -3, -3, 12, 12, 12 ),
        res = Bump.DbvtAabbMm.create(),
        expected = make( -1, -5, -3, 12, 12, 25 );

    Bump.Merge.DbvtAabbMm3( box1, box2, res );
    deepEqual( res, expected, 'correct result' );

  } );

  test( 'Bump.NotEqual.DbvtAabbMm2', function() {
    strictEqual( typeof Bump.NotEqual, 'object', 'Bump.NotEqual exists' );
    strictEqual( typeof Bump.NotEqual.DbvtAabbMm2, 'function', 'Bump.NotEqual.DbvtAabbMm2 exists' );

    var box1 = make( 0, -5, -2, 1, 10, 25 ),
        box2 = make( -1, -3, -3, 12, 12, 12 ),
        box3 = make( 0, -5, -2, 1, 10, 25 );

    var func = Bump.NotEqual.DbvtAabbMm2;
    ok( func( box1, box2 ), 'correct result' );
    ok( !func( box1, box3 ), 'correct result' );

  } );

} )();

module( 'Bump.DbvtVolume' );

test( 'DbvtVolume "typecast" from DbvtAabbMm', function() {
  strictEqual( typeof Bump.DbvtVolume.create, 'function', 'Bump.DbvtVolume exists' );
  strictEqual( Bump.DbvtVolume, Bump.DbvtAabbMm, 'DbvtVolume and DbvtAabbMm refer to same object' );
} );

test( 'DbvtVolume shares same associated functions', function() {
  strictEqual( Bump.Intersect.DbvtVolume2, Bump.Intersect.DbvtAabbMm2, 'Intersect' );
  strictEqual( Bump.Intersect.DbvtVolume.Vector3, Bump.Intersect.DbvtAabbMm.Vector3, 'Intersect' )
  strictEqual( Bump.Proximity.DbvtVolume2, Bump.Proximity.DbvtAabbMm2, 'Proximity' );
  strictEqual( Bump.Select.DbvtVolume3, Bump.Select.DbvtAabbMm3, 'Select' );
  strictEqual( Bump.Merge.DbvtVolume3, Bump.Merge.DbvtAabbMm3, 'Merge' );
  strictEqual( Bump.NotEqual.DbvtVolume2, Bump.NotEqual.DbvtAabbMm2, 'NotEqual' );
} );