module( 'Bump' );

test( 'Bump exists', 1 function() {
  ok( Bump, 'Bump exists' );
} );

test( 'functions exists', 2, function() {
  ok( Bump.noop, 'noop exists' );
  ok( Bump.type, 'type exists' );
} );
