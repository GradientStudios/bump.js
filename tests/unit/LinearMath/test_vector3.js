module( 'Bump.Vector3' );

test( 'Bump.Vector3 exists', 1, function() {
  ok( Bump.Vector3, 'Bump.Vector3 exists' );
} );

test( 'type members exist', 2, function() {
  ok( Bump.Vector3.create, 'create exists' );
  ok( Bump.Vector3.clone, 'clone exists' );
} );

test( 'create', 2, function() {

  var v0 = Bump.Vector3.create(),
  v1 = Bump.Vector3.create( 1, 2, 3 );

  ok( v0, 'object created' );
  ok( v1, 'object created' );
} );

test( 'member functions exist', 45, function() {
  var v0 = Bump.Vector3.create();

  ok( v0.clone, 'clone exists' );
  ok( v0.add, 'add exists' );
  ok( v0.add, 'addSelf exists' );
  ok( v0.subtract, 'subtract exists' );
  ok( v0.subtract, 'subtractSelf exists' );
  ok( v0.multiply, 'multiply exists' );
  ok( v0.multiply, 'multiplySelf exists' );
  ok( v0.scale, 'scale exists' );
  ok( v0.scale, 'scaleSelf exists' );
  ok( v0.divide, 'divide exists' );
  ok( v0.divide, 'divideSelf exists' );
  ok( v0.inverseScale, 'inverseScale exists' );
  ok( v0.inverseScale, 'inverseScaleSelf exists' );
  ok( v0.dot, 'dot exists' );
  ok( v0.length2, 'length2 exists' );
  ok( v0.length, 'length exists' );
  ok( v0.distance2, 'distance2 exists' );
  ok( v0.distance, 'distance exists' );
  ok( v0.safeNormalize, 'safeNormalize exists' );
  ok( v0.normalize, 'normalize exists' );
  ok( v0.normalized, 'normalized exists' );
  ok( v0.rotate, 'rotate exists' );
  ok( v0.angle, 'angle exists' );
  ok( v0.absolute, 'absolute exists' );
  ok( v0.cross, 'cross exists' );
  ok( v0.triple, 'triple exists' );
  ok( v0.minAxis, 'minAxis exists' );
  ok( v0.min, 'min exists' );
  ok( v0.maxAxis, 'maxAxis exists' );
  ok( v0.max, 'max exists' );
  ok( v0.furthestAxis, 'furthestAxis exists' );
  ok( v0.furthest, 'furthest exists' );
  ok( v0.closestAxis, 'closestAxis exists' );
  ok( v0.closest, 'closest exists' );
  ok( v0.setInterpolate3, 'setInterpolate3 exists' );
  ok( v0.lerp, 'lerp exists' );
  ok( v0.equal, 'equal exists' );
  ok( v0.notEqual, 'notEqual exists' );
  ok( v0.setMax, 'setMax exists' );
  ok( v0.setMin, 'setMin exists' );
  ok( v0.setValue, 'setValue exists' );
  ok( v0.getSkewSymmetricMatrix, 'getSkewSymmetricMatrix exists' );
  ok( v0.setZero, 'setZero exists' );
  ok( v0.isZero, 'isZero exists' );
  ok( v0.fuzzyZero, 'fuzzyZero exists' );
} );

test( 'properties', 16, function() {
  var v0 = Bump.Vector3.create(),
  v1 = Bump.Vector3.create( 1, 2, 3 );

  equal( v0.x, 0, 'initialization : x == 0' );
  equal( v0.y, 0, 'initialization : y == 0' );
  equal( v0.z, 0, 'initialization : z == 0' );
  equal( v0.w, 0, 'initialization : w == 0' );

  equal( v1.x, 1, 'initialization : x == 1' );
  equal( v1.y, 2, 'initialization : y == 2' );
  equal( v1.z, 3, 'initialization : z == 3' );
  equal( v1.w, 0, 'initialization : w == 0' );

  equal( v1[0], 1, 'initialization : property [0] getter works' );
  equal( v1[1], 2, 'initialization : property [1] getter works' );
  equal( v1[2], 3, 'initialization : property [2] getter works' );
  equal( v1[3], 0, 'initialization : property [3] getter works' );

  v1[0] = 10;
  v1[1] = 9;
  v1[2] = 8;
  v1[3] = 7;

  equal( v1.x, 10, 'setter for property [0] changes x' );
  equal( v1.y, 9, 'setter for property [1] changes y' );
  equal( v1.z, 8, 'setter for property [2] changes z' );
  equal( v1.w, 7, 'setter for property [3] changes w' );

} );

module( 'Bump.Vector3 math functions' );

test( 'add', 4, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 ),
  v1 = Bump.Vector3.create( 1, -2, 0 ),
  v2 = Bump.Vector3.create(),
  ret;

  ret = v2.add( v0, v1 );
  ok( ret === v2, 'return value references correct vector' );
  deepEqual( v0, Bump.Vector3.create( 1, 2, 3), 'input vector unchanged' );
  deepEqual( v1, Bump.Vector3.create( 1, -2, 0), 'input vector unchanged' );
  deepEqual( v2, Bump.Vector3.create( 2, 0, 3 ), 'correct result' );
} );

test( 'addSelf', 3, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 ),
  v1 = Bump.Vector3.create( 1, -2, 0 ),
  ret;

  ret = v0.addSelf( v1 );
  ok( ret === v0, 'return value references correct vector' );
  deepEqual( v1, Bump.Vector3.create( 1, -2, 0), 'input vector unchanged' );
  deepEqual( v0, Bump.Vector3.create( 2, 0, 3), 'correctResult' );
} );

test( 'subtract', 4, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 ),
  v1 = Bump.Vector3.create( 1, -2, 0 ),
  v2 = Bump.Vector3.create(),
  ret;

  ret = v2.subtract( v0, v1 );
  ok( ret === v2, 'return value references correct vector' );
  deepEqual( v0, Bump.Vector3.create( 1, 2, 3), 'input vector unchanged' );
  deepEqual( v1, Bump.Vector3.create( 1, -2, 0), 'input vector unchanged' );
  deepEqual( v2, Bump.Vector3.create( 0, 4, 3 ), 'correct result' );
} );

test( 'subtractSelf', 3, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 ),
  v1 = Bump.Vector3.create( 1, -2, 0 ),
  ret;

  ret = v0.subtractSelf( v1 );
  ok( ret === v0, 'return value references correct vector' );
  deepEqual( v1, Bump.Vector3.create( 1, -2, 0), 'input vector unchanged' );
  deepEqual( v0, Bump.Vector3.create( 0, 4, 3), 'correctResult' );
} );

test( 'multiply', 3, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 ),
  v1 = Bump.Vector3.create(),
  ret;

  ret = v1.multiply( v0, 2 );
  ok( ret === v1, 'return value references correct vector' );
  deepEqual( v0, Bump.Vector3.create( 1, 2, 3), 'input vector unchanged' );
  deepEqual( v1, Bump.Vector3.create( 2, 4, 6 ), 'correct result' );
} );

test( 'multiplySelf', 2, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 ),
  ret;

  ret = v0.multiplySelf( 2 );
  ok( ret === v0, 'return value references correct vector' );
  deepEqual( v0, Bump.Vector3.create( 2, 4, 6 ), 'correctResult' );
} );

test( 'scale', 4, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 ),
  v1 = Bump.Vector3.create( 2, -1, 0 ),
  v2 = Bump.Vector3.create(),
  ret;

  ret = v2.scale( v0, v1 );
  ok( ret === v2, 'return value references correct vector' );
  deepEqual( v0, Bump.Vector3.create( 1, 2, 3 ), 'input vector unchanged' );
  deepEqual( v1, Bump.Vector3.create( 2, -1, 0 ), 'input vector unchanged' );
  deepEqual( v2, Bump.Vector3.create( 2, -2, 0 ), 'correct result' );
} );

test( 'scaleSelf', 3, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 ),
  v1 = Bump.Vector3.create( 2, -1, 0 ),
  ret;

  ret = v0.scaleSelf( v1 );
  ok( ret === v0, 'return value references correct vector' );
  deepEqual( v1, Bump.Vector3.create( 2, -1, 0 ), 'input vector unchanged' );
  deepEqual( v0, Bump.Vector3.create( 2, -2, 0 ), 'correctResult' );
} );

test( 'divide', 3, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 ),
  v1 = Bump.Vector3.create(),
  ret;

  ret = v1.divide( v0, 2 );
  ok( ret === v1, 'return value references correct vector' );
  deepEqual( v0, Bump.Vector3.create( 1, 2, 3 ), 'input vector unchanged' );
  deepEqual( v1, Bump.Vector3.create( 0.5, 1, 1.5 ), 'correct result' );
} );

test( 'divideSelf', 2, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 ),
  ret;

  ret = v0.divideSelf( 2 );
  ok( ret === v0, 'return value references correct vector' );
  deepEqual( v0, Bump.Vector3.create( 0.5, 1, 1.5 ), 'correctResult' );
} );

test( 'inverseScale', 4, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 ),
  v1 = Bump.Vector3.create( 2, 1, -3 ),
  v2 = Bump.Vector3.create(),
  ret;

  ret = v2.inverseScale( v0, v1 );
  ok( ret === v2, 'return value references correct vector' );
  deepEqual( v0, Bump.Vector3.create( 1, 2, 3 ), 'input vector unchanged' );
  deepEqual( v1, Bump.Vector3.create( 2, 1, -3 ), 'input vector unchanged' );
  deepEqual( v2, Bump.Vector3.create( 0.5, 2, -1 ), 'correct result' );
} );

test( 'inverseScaleSelf', 3, function() {
  var v0 = Bump.Vector3.create( 1, 2, 3 ),
  v1 = Bump.Vector3.create( 2, 1, -3 ),
  ret;

  ret = v0.inverseScaleSelf( v1 );
  ok( ret === v0, 'return value references correct vector' );
  deepEqual( v1, Bump.Vector3.create( 2, 1, -3 ), 'input vector unchanged' );
  deepEqual( v0, Bump.Vector3.create( 0.5, 2, -1 ), 'correctResult' );
} );

test( 'dot function', 1, function() {
  var v1 = Bump.Vector3.create( 1, 1, 1 ),
  v2 = Bump.Vector3.create( 2, 2, 2 );

  equal( v1.dot( v2 ), 6, 'correct result' );
} );

test( 'length2 function', 1, function() {
  var v1 = Bump.Vector3.create( 1, 2, 3 );
  equal( v1.length2(), 14, 'correct result' );
} );

test( 'length function', 1, function() {
  var v1 = Bump.Vector3.create( 1, 2, 3 );
  equal( v1.length(), Math.sqrt( 14 ), 'correct result' );
} );

test( 'distance2 function', 1, function() {
  var v1 = Bump.Vector3.create( 2, 2, 2 ),
  v2 = Bump.Vector3.create( -1, -1, -1 );
  equal( v1.distance2( v2 ), 27, 'correct result' );
} );

test( 'distance function', 1, function() {
  var v1 = Bump.Vector3.create( 2, 2, 2 ),
  v2 = Bump.Vector3.create( -1, -1, -1 );
  equal( v1.distance( v2 ), Math.sqrt( 27 ), 'correct result' );
} );

test( 'safeNormalize', 3, function() {
  var v1 = Bump.Vector3.create( 2, 0, 0 ).safeNormalize(),
  v2 = Bump.Vector3.create( 0, 1, -1 );
  v3 = Bump.Vector3.create().safeNormalize();

  v2.safeNormalize();

  deepEqual( v1, Bump.Vector3.create( 1, 0, 0 ) );
  deepEqual( v2, Bump.Vector3.create( 0, 1/Math.sqrt( 2 ), -1/Math.sqrt( 2 ) ) );
  deepEqual( v3, Bump.Vector3.create( 1, 0, 0 ) );
} );

test( 'normalize', 4, function() {
  var v1 = Bump.Vector3.create( 2, 0, 0 ),
  v2 = Bump.Vector3.create( 0, 1, -1 ),
  ret;

  ret = v1.normalize();

  ok( ret === v1, 'return value references correct vector' );
  deepEqual( v1, Bump.Vector3.create( 1, 0, 0 ), 'correct result' );

  ret = v2.normalize();

  ok( ret === v2, 'return value references correct vector' );
  deepEqual( v2, Bump.Vector3.create( 0, 1/Math.sqrt( 2 ), -1/Math.sqrt( 2 ) ), 'correct result' );
} );

test( 'normalized', 6, function() {
  var v1 = Bump.Vector3.create( 2, 0, 0 ),
  v2 = Bump.Vector3.create( 0, 1, -1 ),
  v3 = Bump.Vector3.create(),
  ret;

  ret = v3.normalized( v1 );

  ok( ret === v3, 'return value references correct vector' );
  deepEqual( v1, Bump.Vector3.create( 2, 0, 0 ), 'original unchanged' );
  deepEqual( v3, Bump.Vector3.create( 1, 0, 0 ), 'correct result' );

  ret = v3.normalized( v2 );

  ok( ret === v3, 'return value references correct vector' );
  deepEqual( v2, Bump.Vector3.create( 0, 1, -1 ), 'original unchanged' );
  deepEqual( v3, Bump.Vector3.create( 0, 1/Math.sqrt( 2 ), -1/Math.sqrt( 2 ) ),
             'correct result' );
} );

// definitely should add more tests for this one
test( 'rotate', 5, function() {
  var v1 = Bump.Vector3.create( 1, 0, 0 ),
  zAxis = Bump.Vector3.create( 0, 0, 1 ),
  vRot = Bump.Vector3.create(),
  ret;

  ret = vRot.rotate( v1, zAxis, Math.PI/2 );

  ok( ret === vRot, 'return value references correct vector' );
  deepEqual( v1, Bump.Vector3.create( 1, 0, 0 ), 'input unchanged' );
  ok( Math.abs( vRot[0] ) < Bump.SIMD_EPSILON, 'correct result : x is close to 0' );
  ok( Math.abs( vRot[1] - 1 ) < Bump.SIMD_EPSILON, 'correct result : y is close to 1' );
  ok( Math.abs( vRot[0] ) < Bump.SIMD_EPSILON, 'correct result: z is close to 0' );
} );

test( 'angle', 12, function() {
  var right = Bump.Vector3.create( 1, 0, 0 ),
  up = Bump.Vector3.create( 0, 1, 0 ),
  left = Bump.Vector3.create( -1, 0, 0 ),
  forward = Bump.Vector3.create( 0, 0, 1 ),
  upRight = Bump.Vector3.create( 1, 1, 0 );

  ok( Math.abs( right.angle( up ) - Math.PI / 2 ) < Bump.SIMD_EPSILON,
    'angle( right, up ) is close to pi/2' );
  ok( Math.abs( right.angle( forward ) - Math.PI / 2 ) < Bump.SIMD_EPSILON,
    'angle( right, forward ) is close to pi/2' );
  ok( Math.abs( right.angle( left ) - Math.PI ) < Bump.SIMD_EPSILON,
    'angle( right, left ) is close to pi' );
  ok( Math.abs( right.angle( upRight ) - Math.PI / 4 ) < Bump.SIMD_EPSILON,
    'angle( right, up + right ) is close to pi/4' );
  ok( Math.abs( left.angle( upRight ) - 3 * Math.PI / 4 ) < Bump.SIMD_EPSILON,
    'angle( left, up + right ) is close to 3*pi/4' );
  ok( Math.abs( up.angle( upRight ) - Math.PI / 4 ) < Bump.SIMD_EPSILON,
    'angle( up, up + right ) is close to pi/4' );
  ok( Math.abs( forward.angle( upRight ) - Math.PI / 2 ) < Bump.SIMD_EPSILON,
    'angle( forward, up + right ) is close to pi/2' );

  deepEqual( right, Bump.Vector3.create( 1, 0, 0 ), 'right unchanged' );
  deepEqual( up, Bump.Vector3.create( 0, 1, 0 ), 'up unchanged' );
  deepEqual( left, Bump.Vector3.create( -1, 0, 0 ), 'left unchanged' );
  deepEqual( forward, Bump.Vector3.create( 0, 0, 1 ), 'forward unchanged' );
  deepEqual( upRight, Bump.Vector3.create( 1, 1, 0 ), 'up + right unchanged' );
} );

test( 'absolute', 5, function() {
  var v1 = Bump.Vector3.create( -1, -2, 3 ),
  v2 = Bump.Vector3.create(),
  ret;

  ret = v2.absolute( v1 );

  ok( ret === v2, 'return value references correct vector' );
  deepEqual( v1, Bump.Vector3.create( -1, -2, 3 ), 'input unchanged' );
  deepEqual( v2, Bump.Vector3.create( 1, 2, 3 ), 'correct result' );

  ret = v1.absolute( v1 );

  ok( ret === v1, 'in place: return value references correct vector' );
  deepEqual( v1, Bump.Vector3.create( 1, 2, 3 ), 'correct result' );

} );

test( 'cross', 15, function() {

  // given params for a "right", "up" and "forward" perpendicular vectors,
  // checks cross products between them (5 tests total)
  var crossTest = function( right, up, forward ) {
    var rightCrossUp = Bump.Vector3.create(),
    upCrossForward = Bump.Vector3.create(),
    diff = Bump.Vector3.create(),
    ret;

    right.safeNormalize();
    up.safeNormalize();
    forward.safeNormalize();

    //ok( Math.abs( Bump.Vector3.length( right ) - 1) < Bump.SIMD_EPSILON );
    //ok( Math.abs( Bump.Vector3.length( up ) - 1 ) < Bump.SIMD_EPSILON );
    //ok( Math.abs( Bump.Vector3.length( forward ) - 1 ) < Bump.SIMD_EPSILON );

    ret = rightCrossUp.cross( right, up );
    //console.log( "( " + right + " ), ( " + up + " ), ( " + rightCrossUp + " ) " );
    diff.subtract( rightCrossUp, forward );
    //console.log( "( " + diff + " ) " );
    ok( ret === rightCrossUp, "return value references correct vector" );
    ok( diff.fuzzyZero(), "right cross up : correct result" );

    ret = upCrossForward.cross( up, forward );
    diff.subtract( upCrossForward, right );
    ok( diff.fuzzyZero(), "up cross forward : correct result" );

    // do the third one in place, just to make sure that works
    ret = forward.cross( forward, right );
    diff.subtract( forward, up );
    ok( ret === forward, "in place: return value references correct vector" );
    ok( diff.fuzzyZero(), "forward cross right : correct result" );

  }

  // TODO : add more ground truths
  crossTest( Bump.Vector3.create(1, 0, 0 ),
             Bump.Vector3.create(0, 1, 0 ),
             Bump.Vector3.create(0, 0, 1 )
           );
  crossTest( Bump.Vector3.create(1, 1, 0 ),
             Bump.Vector3.create(-1, 1, 0 ),
             Bump.Vector3.create(0, 0, 1 )
           );
  crossTest( Bump.Vector3.create(1, 0, 1 ),
             Bump.Vector3.create(0, 1, 0 ),
             Bump.Vector3.create(-1, 0, 1 )
           );
} );

test( 'triple', 2, function() {
  equal( Bump.Vector3.create( 1, 0, 0 ).triple( Bump.Vector3.create( 1, 0, 0 ),
                                                Bump.Vector3.create( 0, 1, 0 ) ),
         0);
  equal( Bump.Vector3.create( 0, 1, 0 ).triple( Bump.Vector3.create( 0, 0, 1 ),
                                                Bump.Vector3.create( 1, 0, 0 ) ),
         1 );
} );

test( 'minAxis', 7, function() {
  equal( Bump.Vector3.create().minAxis(),  2 );
  equal( Bump.Vector3.create( 1, 0, 0 ).minAxis(), 2 );
  equal( Bump.Vector3.create( 0, 1, 0 ).minAxis(), 2 );
  equal( Bump.Vector3.create( 0, 0, 1 ).minAxis(), 1 );
  equal( Bump.Vector3.create( 0, 2, 3 ).minAxis(), 0 );
  equal( Bump.Vector3.create( 0, 3, -4 ).minAxis(), 2 );
  equal( Bump.Vector3.create( -1, -3, -2 ).minAxis(), 1 );
} );

test( 'min', 7, function() {
  equal( Bump.Vector3.create().min(),  0 );
  equal( Bump.Vector3.create( 1, 0, 0 ).min(), 0 );
  equal( Bump.Vector3.create( 0, 1, 0 ).min(), 0 );
  equal( Bump.Vector3.create( 0, 0, 1 ).min(), 0 );
  equal( Bump.Vector3.create( 0, 2, 3 ).min(), 0 );
  equal( Bump.Vector3.create( 0, 3, -4 ).min(), -4 );
  equal( Bump.Vector3.create( -1, -3, -2 ).min(), -3 );
} );

test( 'maxAxis', 7, function() {
  equal( Bump.Vector3.create().maxAxis(), 2 );
  equal( Bump.Vector3.create( -1, 0, 0 ).maxAxis(), 2 );
  equal( Bump.Vector3.create( 0, -1, 0 ).maxAxis(), 2 );
  equal( Bump.Vector3.create( 0, 0, -1 ).maxAxis(), 1 );
  equal( Bump.Vector3.create( 0, 2, 3 ).maxAxis(), 2 );
  equal( Bump.Vector3.create( 0, 3, -4 ).maxAxis(), 1 );
  equal( Bump.Vector3.create( -1, -3, -2 ).maxAxis(), 0 );
} );

test( 'max', 7, function() {
  equal( Bump.Vector3.create().max(), 0 );
  equal( Bump.Vector3.create( -1, 0, 0 ).max(), 0 );
  equal( Bump.Vector3.create( 0, -1, 0 ).max(), 0 );
  equal( Bump.Vector3.create( 0, 0, -1 ).max(), 0 );
  equal( Bump.Vector3.create( 0, 2, 3 ).max(), 3 );
  equal( Bump.Vector3.create( 0, 3, -4 ).max(), 3 );
  equal( Bump.Vector3.create( -1, -3, -2 ).max(), -1 );
} );


test( 'furthestAxis', 7, function() {
  equal( Bump.Vector3.create().furthestAxis(), 2 );
  equal( Bump.Vector3.create( 1, 0, 0 ).furthestAxis(), 2 );
  equal( Bump.Vector3.create( 0, 1, 0 ).furthestAxis(), 2 );
  equal( Bump.Vector3.create( 0, 0, 1 ).furthestAxis(), 1 );
  equal( Bump.Vector3.create( 0, 2, 3 ).furthestAxis(), 0 );
  equal( Bump.Vector3.create( 4, 1, -3 ).furthestAxis(), 1 );
  equal( Bump.Vector3.create( -2, -3, -1 ).furthestAxis(), 2 );
} );

test( 'furthest', 7, function() {
  equal( Bump.Vector3.create().furthest(), 0 );
  equal( Bump.Vector3.create( 1, 0, 0 ).furthest(), 0 );
  equal( Bump.Vector3.create( 0, 1, 0 ).furthest(), 0 );
  equal( Bump.Vector3.create( 0, 0, 1 ).furthest(), 0 );
  equal( Bump.Vector3.create( 0, 2, 3 ).furthest(), 0 );
  equal( Bump.Vector3.create( 4, 1, -3 ).furthest(), 1 );
  equal( Bump.Vector3.create( -2, -3, -1 ).furthest(), 1 );
} );

test( 'closestAxis', 7, function() {
  equal( Bump.Vector3.create().closestAxis(), 2 );
  equal( Bump.Vector3.create( 0, 1, 1 ).closestAxis(), 2 );
  equal( Bump.Vector3.create( 1, 0, 1 ).closestAxis(), 2 );
  equal( Bump.Vector3.create( 1, 1, 0 ).closestAxis(), 1 );
  equal( Bump.Vector3.create( 0, 2, 3 ).closestAxis(), 2 );
  equal( Bump.Vector3.create( 4, 1, -3 ).closestAxis(), 0 );
  equal( Bump.Vector3.create( -2, -3, -1 ).closestAxis(), 1 );
} );

test( 'closest', 7, function() {
  equal( Bump.Vector3.create().closest(), 0 );
  equal( Bump.Vector3.create( 0, 1, 1 ).closest(), 1 );
  equal( Bump.Vector3.create( 1, 0, 1 ).closest(), 1 );
  equal( Bump.Vector3.create( 1, 1, 0 ).closest(), 1 );
  equal( Bump.Vector3.create( 0, 2, 3 ).closest(), 3 );
  equal( Bump.Vector3.create( 4, 1, -3 ).closest(), 4 );
  equal( Bump.Vector3.create( -2, -3, -1 ).closest(), 3 );
} );

test( 'setInterpolate3', 5, function() {
  var right = Bump.Vector3.create( 1, 0, 0 ),
  up = Bump.Vector3.create( 0, 1, 0 ),
  forward = Bump.Vector3.create( 0, 0, 1 ),
  lerped = Bump.Vector3.create(),
  ret;

  ret = lerped.setInterpolate3( right, up, 0.5 );
  ok( ret === lerped, "return value references correct vector" );
  deepEqual( right, Bump.Vector3.create( 1, 0, 0 ), "original unchanged" );
  ok( lerped.subtractSelf( Bump.Vector3.create( 0.5, 0.5, 0 ) ).fuzzyZero(),
      "correct result" );

  ret = up.setInterpolate3( up, forward, 0.3 );
  ok( ret === up, "return value references correct vector" );
  ok( up.subtractSelf( Bump.Vector3.create( 0, 0.7, 0.3 ) ).fuzzyZero(),
      "in place: correct result" );
} );

test( 'lerp', 5, function() {
  var right = Bump.Vector3.create( 1, 0, 0 ),
  up = Bump.Vector3.create( 0, 1, 0 ),
  forward = Bump.Vector3.create( 0, 0, 1 ),
  lerped = Bump.Vector3.create(),
  ret;

  ret = lerped.lerp( right, up, 0.5 );
  ok( ret === lerped, "return value references correct vector" );
  deepEqual( right, Bump.Vector3.create( 1, 0, 0 ), "original unchanged" );
  ok( lerped.subtractSelf( Bump.Vector3.create( 0.5, 0.5, 0 ) ).fuzzyZero(),
      "correct result" );

  ret = up.lerp( up, forward, 0.3 );
  ok( ret === up, "return value references correct vector" );
  ok( up.subtractSelf( Bump.Vector3.create( 0, 0.7, 0.3 ) ).fuzzyZero(),
      "in place: correct result" );
} );

test( 'equal', 4, function() {
  ok( Bump.Vector3.create().equal( Bump.Vector3.create() ) );
  ok( !Bump.Vector3.create( Bump.SIMD_EPSILON, 0, 0 ).equal( Bump.Vector3.create() ) );
  ok( !Bump.Vector3.create( 0, Bump.SIMD_EPSILON, 0 ).equal( Bump.Vector3.create() ) );
  ok( !Bump.Vector3.create( 0, 0, Bump.SIMD_EPSILON ).equal( Bump.Vector3.create() ) );
} );

test( 'notEqual', 4, function() {
  ok( !Bump.Vector3.create().notEqual( Bump.Vector3.create() ) );
  ok( Bump.Vector3.create( Bump.SIMD_EPSILON, 0, 0 ).notEqual( Bump.Vector3.create() ) );
  ok( Bump.Vector3.create( 0, Bump.SIMD_EPSILON, 0 ).notEqual( Bump.Vector3.create() ) );
  ok( Bump.Vector3.create( 0, 0, Bump.SIMD_EPSILON ).notEqual( Bump.Vector3.create() ) );
} );

test( 'setMax', 2, function() {
  var v = Bump.Vector3.create( 1, 4, 9 ),
  ret;

  ret = v.setMax( Bump.Vector3.create( 5, 1, 9 ) );
  ok( ret === v, "return value has correct reference" );
  deepEqual( v, Bump.Vector3.create( 5, 4, 9 ), "correct result" );
} );

test( 'setMin', 2, function() {
  var v = Bump.Vector3.create( 1, 4, 9 ),
  ret;

  ret = v.setMin( Bump.Vector3.create( 5, 1, 9 ) );
  ok( ret === v, "return value has correct reference" );
  deepEqual( v, Bump.Vector3.create( 1, 1, 9 ), "correct result" );
} );

test( 'setValue', 2, function() {
  var v = Bump.Vector3.create( 1, 4, 9 ),
  ret;

  v.w = 7; // w value should get set to 0 by setValue() method

  ret = v.setValue( 5, 1, 9 );
  ok( ret === v, "return value has correct reference" );
  deepEqual( v, Bump.Vector3.create( 5, 1, 9 ), "correct result" );
} );