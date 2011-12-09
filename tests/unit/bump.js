module( 'Bump' );

test( 'Bump exists', 1, function() {
  ok( Bump, 'Bump exists' );
} );

test( 'functions exists', 2, function() {
  ok( Bump.noop, 'noop exists' );
  ok( Bump.type, 'type exists' );
} );

module( 'Bump.type' );

test( 'instantiate test 1', 3, function() {
  var ObjectA = Bump.type(),
      a = ObjectA.create();

  ok( ObjectA, 'type created' );
  ok( a, 'instance created' );
  equal( Object.getPrototypeOf(a), ObjectA.prototype );
} );

test( 'inheritance supports instanceof', 2, function() {
  var A = Bump.type(),
      B = Bump.type( { parent: A } ),
      a = A.create(),
      b = B.create();

  ok( a instanceof A.constructor, 'direct instance passes instanceof' );
  ok( b instanceof A.constructor, 'instance of subtype passes instanceof' );
} );

test( 'init method/constructor', 1, function() {
  var A = Bump.type( {
        init: function A() {}
      }),
      a = A.create();

  equal( A.prototype.constructor.name, 'A', 'name' );
} );

test( 'methods', 2, function() {
  var A = Bump.type( { members: {
        get: function() {
          return this.value;
        },
        set: function( value ) {
          this.value = value;
        }
      } } ),
      a = A.create();

  ok( a.get, 'get method' );
  ok( a.set, 'set method' );
} );
