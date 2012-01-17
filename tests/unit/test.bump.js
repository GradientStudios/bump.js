module( 'Bump' );

test( 'Bump exists', 1, function() {
  ok( Bump, 'Bump exists' );
});

test( 'functions exists', 2, function() {
  ok( Bump.noop, 'noop exists' );
  ok( Bump.type, 'type exists' );
});

module( 'Bump.type' );

test( 'instantiate test 1', 3, function() {
  var ObjectA = Bump.type(),
      a = ObjectA.create();

  ok( ObjectA, 'type created' );
  ok( a, 'instance created' );
  equal( Object.getPrototypeOf(a), ObjectA.prototype );
});

test( 'inheritance supports instanceof', 3, function() {
  var A = Bump.type(),
      B = Bump.type( { parent: A } ),
      C = Bump.type( { parent: B } ),
      a = A.create(),
      b = B.create(),
      c = C.create();

  ok( a instanceof A.prototype.constructor, 'direct instance passes instanceof' );
  ok( b instanceof A.prototype.constructor, 'instance of subtype passes instanceof' );
  ok( c instanceof A.prototype.constructor, 'instance of subtype of subtype passes instanceof' );
});

test( 'inheritance with init method supports instanceof', 3, function() {
  var A = Bump.type( { init: function A() {} } ),
      B = Bump.type( { init: function B() {}, parent: A } ),
      C = Bump.type( { init: function C() {}, parent: B } ),
      a = A.create(),
      b = B.create(),
      c = C.create();

  ok( a instanceof A.prototype.constructor, 'direct instance passes instanceof' );
  ok( b instanceof A.prototype.constructor, 'instance of subtype passes instanceof' );
  ok( c instanceof A.prototype.constructor, 'instance of subtype of subtype passes instanceof' );
});

test( 'inheritance with missing init method supports instanceof', 3, function() {
  var A = Bump.type( { init: function A() {} } ),
      B = Bump.type( { parent: A } ),
      C = Bump.type( { init: function C() {}, parent: B } ),
      a = A.create(),
      b = B.create(),
      c = C.create();

  ok( a instanceof A.prototype.constructor, 'direct instance passes instanceof' );
  ok( b instanceof A.prototype.constructor, 'instance of subtype passes instanceof' );
  ok( c instanceof A.prototype.constructor, 'instance of subtype of subtype passes instanceof' );
});

test( 'init method/constructor', 2, function() {
  var A = Bump.type({
        init: function A() {}
      }),
      a = A.create();

  // This test is safe against minification
  notEqual( A.constructor.name, null, 'type name' );

  // This test is not save against minification
  // equal( A.constructor.name, 'Type', 'type name' );

  equal( a.constructor.name, 'A', 'instance name' );
});

test( 'init once', 1, function() {
  var A = Bump.type({
        init: function A() {
          ok( true, 'initialized' );
        }
      }),
      a = A.create();
});

test( 'methods', 2, function() {
  var A = Bump.type({
        members: {
          get: function() { return this.value; },
          set: function( value ) { this.value = value; }
        }
      }),
      a = A.create();

  equal( typeof a.get, 'function', 'get method' );
  equal( typeof a.set, 'function', 'set method' );
});

test( 'properties', 2, function() {
  var A = Bump.type({
        init: function A( name ) {
          this.name = name || 'a';
        },
        properties: {
          name: {
            get: function() { return this._name; },
            set: function( value ) { this._name = value; }
          }
        }
      }),
      a = A.create();

  equal( a.name, 'a', 'name == "a"' );

  a.name = 'b';
  equal( a.name, 'b', 'name == "b"' );
});

test( 'typeProperties', 2, function() {
  var A = Bump.type({
        typeProperties: {
          me: { value: 1 }
        }
      }),
      a = A.create();

  equal( A.me, 1, 'typeProperty works' );
  notEqual( a.me, 1, 'typeProperty does not appear on instance' );
});

test( '_super init', 4, function() {
  var A = Bump.type({
        init: function() {
          this.a = 1;
        }
      }),
      B = Bump.type({
        parent: A,
        init: function() {
          this._super();

          this.b = 2;
        }
      }),
      a = A.create(),
      b = B.create();

  equal( b.a, a.a, 'B instance initialized with A values' );
  equal( b.b, 2, 'B instance initialized with B values' );

  raises(function() {
    Bump.type({
      init: function() {
        this._super();
      }
    });
  }, function( e ) {
    return e.short == 'no parent function';
  }, 'type raises error if no parent is defined and using this._super' );

  ok( (function() {
    Bump.type({
      parent: Bump.type(),
      init: function() {
        this._super();
      }
    });
    return true;
  })(), 'type does not raise error for _super as parent always has init' );
});

test( '_super methods', 3, function() {
  var A = Bump.type({
        members: {
          get: function() { return 1; }
        }
      }),
      B = Bump.type({
        parent: A,
        members: {
          get: function() {
            return this._super();
          }
        }
      }),
      a = A.create(),
      b = B.create();

  equal( b.get(), a.get(), 'B instance uses supertype\'s value' );

  raises(function() {
    Bump.type({
      members: {
        get: function() { return this._super(); }
      }
    });
  }, function( e ) {
    return e.short == 'no parent function';
  }, 'type raises error if no parent is defined and using this._super' );

  raises(function() {
    Bump.type({
      parent: A,
      members: {
        set: function( value ) { this._super( value ); }
      }
    });
  }, function( e ) {
    return e.short == 'no parent function';
  }, 'type raises error if parent does not contain method for _super' );
});

test( 'nested _super', function() {
  var A = Bump.type({
        members: { foo: function() { this.a = true; } }
      });
      B = Bump.type({
        parent: A,
        members: { foo: function() { this._super(); this.b = true; } }
      });
      C = Bump.type({
        parent: B,
        members: { foo: function() { this._super(); this.c = true; } }
      });

  c = C.create();
  c.foo();
  strictEqual( c.a, true, 'A.foo called' );
  strictEqual( c.b, true, 'B.foo called' );
  strictEqual( c.c, true, 'C.foo called' );

  strictEqual( c._super, undefined, '_super is cleaned up afterwards' );
});

test( '_super properties', 3, function() {
  var A = Bump.type({
        init: function( name ) {
          this._name = name;
        },
        properties: {
          name: {
            get: function() { return this._name; }
          }
        }
      }),
      B = Bump.type({
        parent: A,
        properties: {
          name: {
            get: function() { return this._super(); }
          }
        }
      }),
      a = B.create( 'a' );

  equal( a.name, 'a', 'property returns private by convention variable' );

  raises(function() {
    Bump.type({
      properties: {
        name: {
          get: function() { return this._super(); }
        }
      }
    });
  }, function( e ) {
    return e.short == 'no parent function';
  }, 'type raises error if no parent is defined and using this._super' );

  raises(function() {
    Bump.type({
      parent: Bump.type(),
      properties: {
        name: {
          get: function() {
            return this._super();
          }
        }
      }
    });
  }, function( e ) {
    return e.short == 'no parent function';
  }, 'type raises error if parent does not contain property for _super' );
});

test( 'typeMembers', 1, function() {
  var A = Bump.type({
        typeMembers: {
          didYouGetThatThing: function() {
            return 'i sent you?';
          }
        }
      });

  equal( A.didYouGetThatThing(), 'i sent you?', 'Type has type members!' );
});

module( 'Bump.Enum' );

test( 'basic', function() {
  var a = Bump.Enum([
        'ZERO',
        'ONE',
        'TWO',
        'THREE'
      ]),
      b = Bump.Enum([
        { id: 'NEGATIVE_ONE', value: -1 },
        'ZERO',
        'ONE',
        'TWO',
        'THREE'
      ]),
      c = Bump.Enum([
        { id: 'NEGATIVE_ONE', value: -1 },
        { id: 'ANOTHER_NEGATIVE_ONE', value: -1 },
        'ZERO',
        { id: 'FIVE', value: 5 },
        'SIX',
        'SEVEN'
      ]);

  strictEqual( a.ZERO, 0 );
  strictEqual( a.ONE, 1 );
  strictEqual( a.TWO, 2 );
  strictEqual( a.THREE, 3 );

  strictEqual( b.NEGATIVE_ONE, -1 );
  strictEqual( b.ZERO, 0 );
  strictEqual( b.ONE, 1 );
  strictEqual( b.TWO, 2 );
  strictEqual( b.THREE, 3 );

  strictEqual( c.NEGATIVE_ONE, -1 );
  strictEqual( c.ANOTHER_NEGATIVE_ONE, -1 );
  strictEqual( c.ZERO, 0 );
  strictEqual( c.FIVE, 5 );
  strictEqual( c.SIX, 6 );
  strictEqual( c.SEVEN, 7 );
});
