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