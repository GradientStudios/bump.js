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
  strictEqual( typeof Bump.DbvtAabbMm.FromMM, 'function', 'FromCR exists' );

  var min = Bump.Vector3.create( -5, -10, -20 ),
      max = Bump.Vector3.create( 5, 10, 20 ),
      box = Bump.DbvtAabbMm.FromMM( min, max );

  ok( box.mi !== min, 'mi copied' );
  deepEqual( box.mi, min, 'mi value correct' );
  ok( box.mx !== max, 'mx copied' );
  deepEqual( box.mx, max, 'mx value correct' );
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

} )();