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

  equal( typeof a.get, 'function', 'get method' );
  equal( typeof a.set, 'function', 'set method' );
} );

test( 'properties', 2, function() {
  var A = Bump.type( { 
        init: function A( name ) {
          this.name = name || 'a';
        },
        properties: {
          name: {
            get: function() {
              return this._name;
            },
            set: function( value ) {
              this._name = value;
            }
          }
        } 
      } ),
      a = A.create();

  equal( a.name, 'a', 'name == "a"' );
  
  a.name = 'b';
  equal( a.name, 'b', 'name == "b"' );
} );

test( '_super methods', 2, function() {
  var A = Bump.type( { members: {
        get: function() {
          return 1;
        }
      } } ),
      B = Bump.type( {
        parent: A,
        members: {
          get: function() {
            return this._super();
          }
        }
      } ),
      a = A.create();
      b = B.create();

  equal( b.get(), a.get(), 'B instance uses supertype\'s value' );

  raises( function() {
    Bump.type( {
      members: {
        get: function() {
          return this._super();
        }
      }
    } );
  }, function( e ) {
    return e.short == 'no parent function';
  }, 'type raises error if no parent is defined and using this._super' );
} );
