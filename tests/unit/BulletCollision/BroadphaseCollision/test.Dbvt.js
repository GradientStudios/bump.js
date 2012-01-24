module( 'Bump.DbvtAabbMm' );

test( 'DbvtAabbMm exists', function() {
  var dbvtaabbmm = Bump.DbvtAabbMm || {};
  strictEqual( typeof dbvtaabbmm.create, 'function', 'Bump.DbvtAabbMm exists' );
});

test( 'DbvtAabbMm creation', function() {
  var t = Bump.DbvtAabbMm.create() || {};
  ok( t instanceof Bump.DbvtAabbMm.prototype.init, 'creation without `new` operator' );
});

module( 'Bump.DbvtAabbMm constructors' );

test( 'empty', function() {
  var box = Bump.DbvtAabbMm.create();
  deepEqual( box.mi, Bump.Vector3.create(), 'mi zeroed out' );
  deepEqual( box.mx, Bump.Vector3.create(), 'mx zeroed out' );
});

test( 'FromCE', function() {
  strictEqual( typeof Bump.DbvtAabbMm.FromCE, 'function', 'FromCE exists' );

  var box = Bump.DbvtAabbMm.FromCE(
    Bump.Vector3.create( ),
    Bump.Vector3.create( 5, 10, 20 )
  );

  deepEqual( box.mi, Bump.Vector3.create( -5, -10, -20 ), 'mi initialized correctly' );
  deepEqual( box.mx, Bump.Vector3.create( 5, 10, 20 ), 'mx initialized correctly' );
});

test( 'FromCR', function() {
  strictEqual( typeof Bump.DbvtAabbMm.FromCR, 'function', 'FromCR exists' );

  var box = Bump.DbvtAabbMm.FromCR(
    Bump.Vector3.create( ),
    10
  );

  deepEqual( box.mi, Bump.Vector3.create( -10, -10, -10 ), 'mi initialized correctly' );
  deepEqual( box.mx, Bump.Vector3.create( 10, 10, 10 ), 'mx initialized correctly' );
});

test( 'FromMM', function() {
  strictEqual( typeof Bump.DbvtAabbMm.FromMM, 'function', 'FromMM exists' );

  var min = Bump.Vector3.create( -5, -10, -20 ),
      max = Bump.Vector3.create( 5, 10, 20 ),
      box = Bump.DbvtAabbMm.FromMM( min, max );

  ok( box.mi !== min, 'mi copied' );
  deepEqual( box.mi, min, 'mi value correct' );
  ok( box.mx !== max, 'mx copied' );
  deepEqual( box.mx, max, 'mx value correct' );
});

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
});

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
      destType: Bump.Vector3
    });
  });

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
      destType: Bump.Vector3
    });
  });

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
      destType: Bump.Vector3
    });
  });

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
  });

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

  });

  test( 'Expand', function() {
    var box = make( -1, -2, -3, 3, 2, 1 ),
        e = Bump.Vector3.create( 2, 2, 2 ),
        mi = box.mi,
        mx = box.mx,
        expected = make( -3, -4, -5, 5, 4, 3 );

    testBinaryOp( Bump.DbvtAabbMm, 'Expand', box, e, expected, {
      modifiesSelf: true
    });
    ok( mi === box.mi, 'mi modified in place' );
    ok( mx === box.mx, 'mx modified in place' );
  });

  test( 'SignedExpand', function() {
    var box = make( -1, -2, -3, 3, 2, 1 ),
        e = Bump.Vector3.create( -2, 2, 0 ),
        mi = box.mi,
        mx = box.mx,
        expected = make( -3, -2, -3, 3, 4, 1 );

    testBinaryOp( Bump.DbvtAabbMm, 'SignedExpand', box, e, expected, {
      modifiesSelf: true
    });
    ok( mi === box.mi, 'mi modified in place' );
    ok( mx === box.mx, 'mx modified in place' );
  });

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
  });

  test( 'Classify (TODO)', function() {
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
  });

  test( 'ProjectMinimum (TODO)', function() {
    ok( true, 'TODO' );
  });

  test( 'AddSpan (TODO)', function() {
    ok( true, 'TODO' );
  });

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


  });

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
        vec7 = Bump.Vector3.create( 2, 2, 2 ),
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

  });

  test( 'Bump.Proximity.DbvtAabbMm2', function() {
    strictEqual( typeof Bump.Proximity, 'object', 'Bump.Proximity exists' );
    strictEqual( typeof Bump.Proximity.DbvtAabbMm2, 'function', 'Bump.Proximity.DbvtAabbMm2 exists' );

    var box1 = make( -3, -3, -3, -1, -1, -1 ),
        box2 = make( 4, 4, 4, 12, 12, 12 );

    var func = Bump.Proximity.DbvtAabbMm2;
    equal( func( box1, box2 ), 60, 'correct result' );

  });

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

  });

  test( 'Bump.Merge.DbvtAabbMm3', function() {
    strictEqual( typeof Bump.Merge, 'object', 'Bump.Merge exists' );
    strictEqual( typeof Bump.Merge.DbvtAabbMm3, 'function', 'Bump.Merge.DbvtAabbMm3 exists' );

    var box1 = make( 0, -5, -2, 1, 10, 25 ),
        box2 = make( -1, -3, -3, 12, 12, 12 ),
        res = Bump.DbvtAabbMm.create(),
        expected = make( -1, -5, -3, 12, 12, 25 );

    Bump.Merge.DbvtAabbMm3( box1, box2, res );
    deepEqual( res, expected, 'correct result' );

  });

  test( 'Bump.NotEqual.DbvtAabbMm2', function() {
    strictEqual( typeof Bump.NotEqual, 'object', 'Bump.NotEqual exists' );
    strictEqual( typeof Bump.NotEqual.DbvtAabbMm2, 'function', 'Bump.NotEqual.DbvtAabbMm2 exists' );

    var box1 = make( 0, -5, -2, 1, 10, 25 ),
        box2 = make( -1, -3, -3, 12, 12, 12 ),
        box3 = make( 0, -5, -2, 1, 10, 25 );

    var func = Bump.NotEqual.DbvtAabbMm2;
    ok( func( box1, box2 ), 'correct result' );
    ok( !func( box1, box3 ), 'correct result' );

  });

})();

module( 'Bump.DbvtVolume' );

test( 'DbvtVolume "typecast" from DbvtAabbMm', function() {
  strictEqual( typeof Bump.DbvtVolume.create, 'function', 'Bump.DbvtVolume exists' );
  strictEqual( Bump.DbvtVolume, Bump.DbvtAabbMm, 'DbvtVolume and DbvtAabbMm refer to same object' );
});

test( 'DbvtVolume shares same associated functions', function() {
  strictEqual( Bump.Intersect.DbvtVolume2, Bump.Intersect.DbvtAabbMm2, 'Intersect' );
  strictEqual( Bump.Intersect.DbvtVolume.Vector3, Bump.Intersect.DbvtAabbMm.Vector3, 'Intersect' )
  strictEqual( Bump.Proximity.DbvtVolume2, Bump.Proximity.DbvtAabbMm2, 'Proximity' );
  strictEqual( Bump.Select.DbvtVolume3, Bump.Select.DbvtAabbMm3, 'Select' );
  strictEqual( Bump.Merge.DbvtVolume3, Bump.Merge.DbvtAabbMm3, 'Merge' );
  strictEqual( Bump.NotEqual.DbvtVolume2, Bump.NotEqual.DbvtAabbMm2, 'NotEqual' );
});

module( 'Bump.DbvtNode' );

test( 'Bump.DbvtNode exists', function() {
  var dbvtnode = Bump.DbvtNode || {};
  strictEqual( typeof dbvtnode.create, 'function', 'Bump.DbvtNode exists' );
});

test( 'Bump.DbvtNode creation', function() {
  var t = Bump.DbvtNode.create() || {};
  ok( t instanceof Bump.DbvtNode.prototype.init, 'creation without `new` operator' );
  deepEqual( t.volume, Bump.DbvtVolume.create(), 'volume initialized correctly' );
  strictEqual( t.parent, 0, 'parent initialized correctly' );
  deepEqual( t._unionValue, [ 0, 0 ], 'internal _unionValue initialized correctly' );
});

module( 'Bump.DbvtNode properties' );

test( 'union properties', function() {
  var node = Bump.DbvtNode.create(),
      child1 = Bump.DbvtNode.create(),
      child2 = Bump.DbvtNode.create(),
      child3 = Bump.DbvtNode.create();

  strictEqual( typeof node.childs, 'object', 'childs exists' );
  strictEqual( typeof node.data, 'number', 'data exists' );
  strictEqual( typeof node.dataAsInt, 'number', 'dataAsInt exists' );

  deepEqual( node.childs, [ 0, 0 ], 'node.childs initialized correctly' );
  equal( node.data, 0, 'node.data initialized correctly' );
  equal( node.dataAsInt, 0, 'node.dataAsInt initialized correctly' );

  // assign to childs
  node.childs = [ child2, 0 ];
  deepEqual( node.childs, [ child2, 0 ], 'array assignment to node.childs works correctly' );
  deepEqual( node._unionValue, node.childs, 'node.childs matches internal union value' );
  deepEqual( node._unionValue[ 0 ], node.data, 'node.data matches internal union value [0]' );
  deepEqual( node._unionValue[ 0 ], node.dataAsInt, 'node.dataAsInt matches internal union value [0]' );
  node.childs[ 0 ] = child1;
  node.childs[ 1 ] = child2;
  deepEqual( node.childs, [ child1, child2 ], 'index assignment works correctly' );
  deepEqual( node._unionValue, node.childs, 'node.childs matches internal union value' );
  deepEqual( node._unionValue[ 0 ], node.data, 'node.data matches internal union value [0]' );
  deepEqual( node._unionValue[ 0 ], node.dataAsInt, 'node.dataAsInt matches internal union value [0]' );

  // assign to data
  node.data = child3;
  deepEqual( node.data, child3, 'assignment to data works correctly' );
  deepEqual( node._unionValue, [child3, child2], 'union value set correctly' );
  deepEqual( node._unionValue, node.childs, 'node.childs matches internal union value' );
  deepEqual( node._unionValue[ 0 ], node.dataAsInt, 'node.dataAsInt matches internal union value [0]' );

  // assign to dataAsInt
  node.dataAsInt = 42;
  deepEqual( node.dataAsInt, 42, 'assignment to data works correctly' );
  deepEqual( node._unionValue, [ 42, child2 ], 'union value set correctly' );
  deepEqual( node._unionValue, node.childs, 'node.childs matches internal union value' );
  deepEqual( node._unionValue[ 0 ], node.data, 'node.data matches internal union value [0]' );
});

module( 'Bump.DbvtNode member functions' );

test( 'isleaf', function() {
  var leaf1 = Bump.DbvtNode.create(),
      leaf2 = Bump.DbvtNode.create(),
      parent = Bump.DbvtNode.create();

  parent.childs = [ leaf1, leaf2 ];

  strictEqual( typeof leaf1.isleaf, 'function', 'isleaf exists' );
  ok( leaf1.isleaf(), 'leaf node returns true' );
  ok( leaf2.isleaf(), 'leaf node returns true' );
  ok( !parent.isleaf(), 'internal node returns false' );

});


test( 'isinternal', function() {
  var leaf1 = Bump.DbvtNode.create(),
      leaf2 = Bump.DbvtNode.create(),
      parent = Bump.DbvtNode.create();

  parent.childs = [ leaf1, leaf2 ];

  strictEqual( typeof leaf1.isinternal, 'function', 'isinternal exists' );
  ok( !leaf1.isinternal(), 'leaf node returns false' );
  ok( !leaf2.isinternal(), 'leaf node returns false' );
  ok( parent.isinternal(), 'internal node returns true' );

});

module( 'Bump.Dbvt' );

test( 'Bump.Dbvt exists', function() {
  var dbvt = Bump.Dbvt || {};
  strictEqual( typeof dbvt.create, 'function', 'Bump.Dbvt exists' );
});

test( 'Bump.Dbvt creation', function() {
  var t = Bump.Dbvt.create() || {};
  ok( t instanceof Bump.Dbvt.prototype.init, 'creation without `new` operator' );
  equal( t.m_root, 0, 'm_root initialized correctly' );
  equal( t.m_free, 0, 'm_free initialized correctly' );
  equal( t.m_lkhd, -1, 'm_lkhd initialized correctly' );
  equal( t.m_leaves, 0, 'm_leaves initialized correctly' );
  equal( t.m_opath, 0, 'm_opath initialized correctly' );
  deepEqual( t.m_stkStack, [], 'm_opath initialized correctly' );
});

module( 'Bump.Dbvt.sStkNN' );

test( 'Bump.Dbvt.sStkNN exists', function() {
  var s = Bump.Dbvt.sStkNN || {};
  strictEqual( typeof s.create, 'function', 'Bump.Dbvt.sStkNN exists' );
});

test( 'Bump.Dbvt.sStkNN creation', function() {
  var t = Bump.Dbvt.sStkNN.create() || {},
      na = Bump.DbvtNode.create(),
      nb = Bump.DbvtNode.create(),
      t2 = Bump.Dbvt.sStkNN.create( na, nb );
  ok( t instanceof Bump.Dbvt.sStkNN.prototype.init, 'creation without `new` operator' );
  ok( t2 instanceof Bump.Dbvt.sStkNN.prototype.init, 'creation without `new` operator' );
  equal( t.a, 0, 'a initialized correctly to default' );
  equal( t.b, 0, 'b initialized correctly to default' );
  strictEqual( t2.a, na, 'a initialized correctly' );
  strictEqual( t2.b, nb, 'b initialized correctly' );
});

module( 'Bump.Dbvt.sStkNP' );

test( 'Bump.Dbvt.sStkNP exists', function() {
  var s = Bump.Dbvt.sStkNP || {};
  strictEqual( typeof s.create, 'function', 'Bump.Dbvt.sStkNP exists' );
});

test( 'Bump.Dbvt.sStkNP creation', function() {
  var t = Bump.Dbvt.sStkNP.create() || {},
      n = Bump.DbvtNode.create(),
      t2 = Bump.Dbvt.sStkNP.create( n, 4 );
  ok( t instanceof Bump.Dbvt.sStkNP.prototype.init, 'creation without `new` operator' );
  ok( t2 instanceof Bump.Dbvt.sStkNP.prototype.init, 'creation without `new` operator' );
  equal( t.node, 0, 'node initialized correctly to default' );
  equal( t.mask, 0, 'mask initialized correctly to default' );
  strictEqual( t2.node, n, 'node initialized correctly' );
  equal( t2.mask, 4, 'mask initialized correctly' );
});

module( 'Bump.Dbvt.sStkNPS' );

test( 'Bump.Dbvt.sStkNPS exists', function() {
  var s = Bump.Dbvt.sStkNPS || {};
  strictEqual( typeof s.create, 'function', 'Bump.Dbvt.sStkNPS exists' );
});

test( 'Bump.Dbvt.sStkNPS creation', function() {
  var t = Bump.Dbvt.sStkNPS.create() || {},
      n = Bump.DbvtNode.create(),
      t2 = Bump.Dbvt.sStkNPS.create( n, 4, 1337 );
  ok( t instanceof Bump.Dbvt.sStkNPS.prototype.init, 'creation without `new` operator' );
  ok( t2 instanceof Bump.Dbvt.sStkNPS.prototype.init, 'creation without `new` operator' );
  equal( t.node, 0, 'node initialized correctly to default' );
  equal( t.mask, 0, 'mask initialized correctly to default' );
  equal( t.value, 0, 'value initialized correctly to default' );
  strictEqual( t2.node, n, 'node initialized correctly' );
  equal( t2.mask, 4, 'mask initialized correctly' );
  equal( t2.value, 1337, 'value initialized correctly' );
});

module( 'Bump.Dbvt.sStkCLN' );

test( 'Bump.Dbvt.sStkCLN exists', function() {
  var s = Bump.Dbvt.sStkCLN || {};
  strictEqual( typeof s.create, 'function', 'Bump.Dbvt.sStkCLN exists' );
});

test( 'Bump.Dbvt.sStkCLN creation', function() {
  var t = Bump.Dbvt.sStkCLN.create() || {},
      n = Bump.DbvtNode.create(),
      p = Bump.DbvtNode.create(),
      t2 = Bump.Dbvt.sStkCLN.create( n, p );
  ok( t instanceof Bump.Dbvt.sStkCLN.prototype.init, 'creation without `new` operator' );
  ok( t2 instanceof Bump.Dbvt.sStkCLN.prototype.init, 'creation without `new` operator' );
  equal( t.node, 0, 'node initialized correctly to default' );
  equal( t.parent, 0, 'parent initialized correctly to default' );
  strictEqual( t2.node, n, 'node initialized correctly' );
  equal( t2.parent, p, 'parent initialized correctly' );
});

module( 'Bump.Dbvt.ICollide' );

test( 'Bump.Dbvt.ICollide exists', function() {
  var s = Bump.Dbvt.ICollide || {};
  strictEqual( typeof s.create, 'function', 'Bump.Dbvt.ICollide exists' );
});

test( 'Bump.Dbvt.ICollide creation', function() {
  var t = Bump.Dbvt.ICollide.create();
  ok( t instanceof Bump.Dbvt.ICollide.prototype.init, 'creation without `new` operator' );
  strictEqual( typeof t.ProcessNode2, 'function', 'ProcessNode exists' );
  strictEqual( typeof t.ProcessNode, 'function', 'ProcessNode exists' );
  strictEqual( typeof t.ProcessNodeScalar, 'function', 'ProcessNode exists' );
  strictEqual( typeof t.Descent, 'function', 'ProcessNode exists' );
  strictEqual( typeof t.AllLeaves, 'function', 'ProcessNode exists' );
});

module( 'Bump.Dbvt.IClone' );

test( 'Bump.Dbvt.IClone exists', function() {
  var s = Bump.Dbvt.IClone || {};
  strictEqual( typeof s.create, 'function', 'Bump.Dbvt.IClone exists' );
});

test( 'Bump.Dbvt.IClone creation', function() {
  var t = Bump.Dbvt.IClone.create();
  ok( t instanceof Bump.Dbvt.IClone.prototype.init, 'creation without `new` operator' );
  strictEqual( typeof t.CloneLeaf, 'function', 'CloneLeaf exists' );
});

module( 'Bump.DbvtNodeEnumerator' );

test( 'Bump.DbvtNodeEnumerator exists', function() {
  var s = Bump.DbvtNodeEnumerator || {};
  strictEqual( typeof s.create, 'function', 'Bump.DbvtNodeEnumerator exists' );
});

test( 'Bump.DbvtNodeEnumerator creation', function() {
  var t = Bump.DbvtNodeEnumerator.create();
  ok( t instanceof Bump.DbvtNodeEnumerator.prototype.init, 'creation without `new` operator' );

  deepEqual( t.nodes, [], 'nodes initialized correctly' );
  strictEqual( typeof t.ProcessNode2, 'function', 'ProcessNode exists' );
  strictEqual( typeof t.ProcessNode, 'function', 'ProcessNode exists' );
  strictEqual( typeof t.ProcessNodeScalar, 'function', 'ProcessNode exists' );
  strictEqual( typeof t.Descent, 'function', 'ProcessNode exists' );
  strictEqual( typeof t.AllLeaves, 'function', 'ProcessNode exists' );
});

test( 'Bump.DbvtNodeEnumerator ProcessNode member function', function() {
  var t = Bump.DbvtNodeEnumerator.create(),
  n0 = Bump.DbvtNode.create(),
  n1 = Bump.DbvtNode.create(),
  n2 = Bump.DbvtNode.create();

  n0.childs = [ n1, n2 ];
  n1.parent = n0;
  n2.parent = n0;

  t.ProcessNode( n0 );
  t.ProcessNode( n1 );
  t.ProcessNode( n2 );

  deepEqual( t.nodes, [ n0, n1, n2 ], 'Process function correctly adds to nodes' );

});

(function() {

  module( 'Bump.Dbvt.IWriter' );

  test( 'Bump.Dbvt.IWriter exists', function() {
    var s = Bump.Dbvt.IWriter || {};
    strictEqual( typeof s.create, 'function', 'Bump.Dbvt.IWriter exists' );
  });

  test( 'Bump.Dbvt.IWriter creation', function() {
    var t = Bump.Dbvt.IWriter.create();
    ok( t instanceof Bump.Dbvt.IWriter.prototype.init, 'creation without `new` operator' );
    strictEqual( typeof t.Prepare, 'function', 'Prepare exists' );
    strictEqual( typeof t.WriteNode, 'function', 'WriteNode exists' );
    strictEqual( typeof t.WriteLeaf, 'function', 'WriteLeaf exists' );
  });

  // create an IWriter subclass for testing
  var TestWriter = Bump.type({
    parent: Bump.Dbvt.IWriter,

    init: function() {
      this.s = '';
    },

    members: {
      Prepare: function( root, numnodes ) {
        this.s = '';
      },
      WriteNode: function( node, index, parent, child0, child1 ) {
        this.s += ' { internal : ' + index + ' : children ' + child0 + ' ' + child1 + ' }';
      },
      WriteLeaf: function( node, index, parent ) {
        this.s += ' { leaf : ' + index + ' : ' + node.dataAsInt + ' }';
      }
    }
  });

  var makeTestTree = function() {
    var dbvt0 = Bump.Dbvt.create();

    // manually set up small tree to test writing and enumeration
    var root = Bump.DbvtNode.create(),
    left = Bump.DbvtNode.create(),
    right = Bump.DbvtNode.create(),
    leftleft = Bump.DbvtNode.create(),
    leftright = Bump.DbvtNode.create(),
    rightleft = Bump.DbvtNode.create(),
    rightright = Bump.DbvtNode.create();

    root.childs = [ left, right ];
    left.parent = root;
    right.parent = root;

    left.childs = [ leftleft, leftright ];
    leftleft.parent = left;
    leftright.parent = left;

    right.childs = [ rightleft, rightright ];
    rightleft.parent = right;
    rightright.parent = right;

    leftleft.dataAsInt = 10;
    leftright.dataAsInt = 20;
    rightleft.dataAsInt = 30;
    rightright.dataAsInt = 40;

    dbvt0.m_root = root;

    return dbvt0;
  }

  // make an n^3 grid of 0.5 x 0.5 x 0.5 bounding boxes, centered on the origin
  var makeVolumeGrid = function( n ) {
    var vols = [],
        extents = Bump.Vector3.create( 0.25, 0.25, 0.25 );
    n = (n-1) / 2;
    for ( var vi = -n; vi <= n; vi++ ) {
      for ( var vj = -n; vj <= n; vj++ ) {
        for ( var vk = -n; vk <= n; vk++ ) {
          vols.push( Bump.DbvtVolume.FromCE( Bump.Vector3.create( vi, vj, vk ), extents ) );
        }
      }
    }
    return vols;
  }

  // insert all volumes into dbvt
  var insertAll = function( dbvt, vols ) {
    for ( var i = 0; i < vols.length; i++ ) {
      dbvt.insert( vols[ i ], i );
    }
  }

  module( 'Dbvt typemembers' );

  test('enumNodes', function() {
    strictEqual( typeof Bump.Dbvt.enumNodes, 'function', 'exists' );

    var enumerator = Bump.DbvtNodeEnumerator.create(),
    dbvt = makeTestTree(),
    expected = [ dbvt.m_root,
                 dbvt.m_root.childs[ 0 ],
                 dbvt.m_root.childs[ 0 ].childs[ 0 ],
                 dbvt.m_root.childs[ 0 ].childs[ 1 ],
                 dbvt.m_root.childs[ 1 ],
                 dbvt.m_root.childs[ 1 ].childs[ 0 ],
                 dbvt.m_root.childs[ 1 ].childs[ 1 ]
               ];

    Bump.Dbvt.enumNodes( dbvt.m_root, enumerator );

    //epsilonNumberCheck( enumerator.nodes, expected, Bump.SIMD_EPSILON );
    deepEqual( enumerator.nodes, expected, 'correctly populates enumerator' );
  });

  test('enumLeaves', function() {
    strictEqual( typeof Bump.Dbvt.enumLeaves, 'function', 'exists' );

    var enumerator = Bump.DbvtNodeEnumerator.create(),
    dbvt = makeTestTree(),
    expected = [ dbvt.m_root.childs[ 0 ].childs[ 0 ],
                 dbvt.m_root.childs[ 0 ].childs[ 1 ],
                 dbvt.m_root.childs[ 1 ].childs[ 0 ],
                 dbvt.m_root.childs[ 1 ].childs[ 1 ]
               ];

    Bump.Dbvt.enumLeaves( dbvt.m_root, enumerator );

    //epsilonNumberCheck( enumerator.nodes, expected, Bump.SIMD_EPSILON );
    deepEqual( enumerator.nodes, expected, 'correctly populates enumerator' );
  });

  test('countLeaves', function() {
    strictEqual( typeof Bump.Dbvt.countLeaves, 'function', 'exists' );

    var dbvt = makeTestTree(),
        expected = 4,
        result = Bump.Dbvt.countLeaves( dbvt.m_root );

    equal( result, expected, 'correctly counts leaves' );
  });

  test('maxdepth', function() {
    strictEqual( typeof Bump.Dbvt.maxdepth, 'function', 'exists' );

    var dbvt = makeTestTree();
    equal( Bump.Dbvt.maxdepth( dbvt.m_root ), 3, 'correctly computes max depth' );

    dbvt = Bump.Dbvt.create();
    equal( Bump.Dbvt.maxdepth( dbvt.m_root ), 0, 'correctly computes max depth for empty tree' );

  });

  test('extractLeaves', function() {
    strictEqual( typeof Bump.Dbvt.extractLeaves, 'function', 'exists' );

    var dbvt = makeTestTree(),
    expected = [ dbvt.m_root.childs[ 0 ].childs[ 0 ],
                 dbvt.m_root.childs[ 0 ].childs[ 1 ],
                 dbvt.m_root.childs[ 1 ].childs[ 0 ],
                 dbvt.m_root.childs[ 1 ].childs[ 1 ]
               ],
    leaves = [];

    Bump.Dbvt.extractLeaves( dbvt.m_root, leaves );

    //epsilonNumberCheck( extracterator.nodes, expected, Bump.SIMD_EPSILON );
    deepEqual( leaves, expected, 'correctly extracts leaves' );
  });

  module( 'Dbvt members' );

  test('clone', function() {
    var dbvt = Bump.Dbvt.create(),
        dest = Bump.Dbvt.create(),
        //vols = makeVolumeGrid( 3 ),
        writer = TestWriter.create(),
        TestIClone = Bump.type({
          parent: Bump.Dbvt.IClone,
          init: function TestIClone() {
            this.sum = 0;
          },
          members: {
            CloneLeaf: function( node ) {
              this.sum += node.dataAsInt;
            }
          }
        }),
        iclone = TestIClone.create();

    strictEqual( typeof dbvt.clone, 'function', 'exists' );
    dbvt.clone( dest, iclone );

    strictEqual( dest.m_root, 0, 'cloning empty tree creates empty tree' );
    equal( iclone.sum, 0, 'no leaves visited' );

    //insertAll( dbvt, vols );
    dbvt = makeTestTree();
    dbvt.clone( dest, iclone );

    notStrictEqual( dbvt, dest, 'clone creates new copy deep copy' );
    //deepEqual( dbvt, dest, 'cloned copy is identical' );
    epsilonNumberCheck( dbvt, dest, Bump.SIMD_EPSILON );
    equal( iclone.sum, 100, 'all leaves visited correctly' );
  });

  test('write', function() {
    var writer = TestWriter.create(),
    dbvt = makeTestTree(),
    expected = ' { internal : 0 : children 1 4 }' +
      ' { internal : 1 : children 2 3 }' +
      ' { leaf : 2 : 10 }' +
      ' { leaf : 3 : 20 }' +
      ' { internal : 4 : children 5 6 }' +
      ' { leaf : 5 : 30 }' +
      ' { leaf : 6 : 40 }';

    strictEqual( typeof dbvt.write, 'function', 'write exists' );
    dbvt.write( writer );
    equal( writer.s, expected, 'correct result' );
  });


  test('insert', function() {
    // generate a tree from a 3 x 3 x 3 "grid" of volumes

    var vols = makeVolumeGrid( 3 ),
        dbvt = Bump.Dbvt.create();
    strictEqual( typeof dbvt.insert, 'function', 'insert exists' );

    var expected = [
      ' { leaf : 0 : 0 }',
      ' { internal : 0 : children 1 2 } { leaf : 1 : 0 } { leaf : 2 : 1 }',
      ' { internal : 0 : children 1 2 } { leaf : 1 : 0 } { internal : 2 : children 3 4 } { leaf : 3 : 1 } { leaf : 4 : 2 }',
      ' { internal : 0 : children 1 4 } { internal : 1 : children 2 3 } { leaf : 2 : 0 } { leaf : 3 : 3 } { internal : 4 : children 5 6 } { leaf : 5 : 1 } { leaf : 6 : 2 }',
      ' { internal : 0 : children 1 4 } { internal : 1 : children 2 3 } { leaf : 2 : 0 } { leaf : 3 : 3 } { internal : 4 : children 5 8 } { internal : 5 : children 6 7 } { leaf : 6 : 1 } { leaf : 7 : 4 } { leaf : 8 : 2 }',
      ' { internal : 0 : children 1 4 } { internal : 1 : children 2 3 } { leaf : 2 : 0 } { leaf : 3 : 3 } { internal : 4 : children 5 8 } { internal : 5 : children 6 7 } { leaf : 6 : 1 } { leaf : 7 : 4 } { internal : 8 : children 9 10 } { leaf : 9 : 2 } { leaf : 10 : 5 }',
      ' { internal : 0 : children 1 6 } { internal : 1 : children 2 3 } { leaf : 2 : 0 } { internal : 3 : children 4 5 } { leaf : 4 : 3 } { leaf : 5 : 6 } { internal : 6 : children 7 10 } { internal : 7 : children 8 9 } { leaf : 8 : 1 } { leaf : 9 : 4 } { internal : 10 : children 11 12 } { leaf : 11 : 2 } { leaf : 12 : 5 }',
      ' { internal : 0 : children 1 6 } { internal : 1 : children 2 3 } { leaf : 2 : 0 } { internal : 3 : children 4 5 } { leaf : 4 : 3 } { leaf : 5 : 6 } { internal : 6 : children 7 12 } { internal : 7 : children 8 9 } { leaf : 8 : 1 } { internal : 9 : children 10 11 } { leaf : 10 : 4 } { leaf : 11 : 7 } { internal : 12 : children 13 14 } { leaf : 13 : 2 } { leaf : 14 : 5 }',
      ' { internal : 0 : children 1 6 } { internal : 1 : children 2 3 } { leaf : 2 : 0 } { internal : 3 : children 4 5 } { leaf : 4 : 3 } { leaf : 5 : 6 } { internal : 6 : children 7 12 } { internal : 7 : children 8 9 } { leaf : 8 : 1 } { internal : 9 : children 10 11 } { leaf : 10 : 4 } { leaf : 11 : 7 } { internal : 12 : children 13 14 } { leaf : 13 : 2 } { internal : 14 : children 15 16 } { leaf : 15 : 5 } { leaf : 16 : 8 }',
      ' { internal : 0 : children 1 8 } { internal : 1 : children 2 5 } { internal : 2 : children 3 4 } { leaf : 3 : 0 } { leaf : 4 : 9 } { internal : 5 : children 6 7 } { leaf : 6 : 3 } { leaf : 7 : 6 } { internal : 8 : children 9 14 } { internal : 9 : children 10 11 } { leaf : 10 : 1 } { internal : 11 : children 12 13 } { leaf : 12 : 4 } { leaf : 13 : 7 } { internal : 14 : children 15 16 } { leaf : 15 : 2 } { internal : 16 : children 17 18 } { leaf : 17 : 5 } { leaf : 18 : 8 }',
      ' { internal : 0 : children 1 8 } { internal : 1 : children 2 5 } { internal : 2 : children 3 4 } { leaf : 3 : 0 } { leaf : 4 : 9 } { internal : 5 : children 6 7 } { leaf : 6 : 3 } { leaf : 7 : 6 } { internal : 8 : children 9 16 } { internal : 9 : children 10 13 } { internal : 10 : children 11 12 } { leaf : 11 : 1 } { leaf : 12 : 10 } { internal : 13 : children 14 15 } { leaf : 14 : 4 } { leaf : 15 : 7 } { internal : 16 : children 17 18 } { leaf : 17 : 2 } { internal : 18 : children 19 20 } { leaf : 19 : 5 } { leaf : 20 : 8 }',
      ' { internal : 0 : children 1 8 } { internal : 1 : children 2 5 } { internal : 2 : children 3 4 } { leaf : 3 : 0 } { leaf : 4 : 9 } { internal : 5 : children 6 7 } { leaf : 6 : 3 } { leaf : 7 : 6 } { internal : 8 : children 9 16 } { internal : 9 : children 10 13 } { internal : 10 : children 11 12 } { leaf : 11 : 1 } { leaf : 12 : 10 } { internal : 13 : children 14 15 } { leaf : 14 : 4 } { leaf : 15 : 7 } { internal : 16 : children 17 20 } { internal : 17 : children 18 19 } { leaf : 18 : 2 } { leaf : 19 : 11 } { internal : 20 : children 21 22 } { leaf : 21 : 5 } { leaf : 22 : 8 }',
      ' { internal : 0 : children 1 10 } { internal : 1 : children 2 5 } { internal : 2 : children 3 4 } { leaf : 3 : 0 } { leaf : 4 : 9 } { internal : 5 : children 6 9 } { internal : 6 : children 7 8 } { leaf : 7 : 3 } { leaf : 8 : 12 } { leaf : 9 : 6 } { internal : 10 : children 11 18 } { internal : 11 : children 12 15 } { internal : 12 : children 13 14 } { leaf : 13 : 1 } { leaf : 14 : 10 } { internal : 15 : children 16 17 } { leaf : 16 : 4 } { leaf : 17 : 7 } { internal : 18 : children 19 22 } { internal : 19 : children 20 21 } { leaf : 20 : 2 } { leaf : 21 : 11 } { internal : 22 : children 23 24 } { leaf : 23 : 5 } { leaf : 24 : 8 }',
      ' { internal : 0 : children 1 10 } { internal : 1 : children 2 5 } { internal : 2 : children 3 4 } { leaf : 3 : 0 } { leaf : 4 : 9 } { internal : 5 : children 6 9 } { internal : 6 : children 7 8 } { leaf : 7 : 3 } { leaf : 8 : 12 } { leaf : 9 : 6 } { internal : 10 : children 11 20 } { internal : 11 : children 12 15 } { internal : 12 : children 13 14 } { leaf : 13 : 1 } { leaf : 14 : 10 } { internal : 15 : children 16 19 } { internal : 16 : children 17 18 } { leaf : 17 : 4 } { leaf : 18 : 13 } { leaf : 19 : 7 } { internal : 20 : children 21 24 } { internal : 21 : children 22 23 } { leaf : 22 : 2 } { leaf : 23 : 11 } { internal : 24 : children 25 26 } { leaf : 25 : 5 } { leaf : 26 : 8 }',
      ' { internal : 0 : children 1 10 } { internal : 1 : children 2 5 } { internal : 2 : children 3 4 } { leaf : 3 : 0 } { leaf : 4 : 9 } { internal : 5 : children 6 9 } { internal : 6 : children 7 8 } { leaf : 7 : 3 } { leaf : 8 : 12 } { leaf : 9 : 6 } { internal : 10 : children 11 20 } { internal : 11 : children 12 15 } { internal : 12 : children 13 14 } { leaf : 13 : 1 } { leaf : 14 : 10 } { internal : 15 : children 16 19 } { internal : 16 : children 17 18 } { leaf : 17 : 4 } { leaf : 18 : 13 } { leaf : 19 : 7 } { internal : 20 : children 21 24 } { internal : 21 : children 22 23 } { leaf : 22 : 2 } { leaf : 23 : 11 } { internal : 24 : children 25 28 } { internal : 25 : children 26 27 } { leaf : 26 : 5 } { leaf : 27 : 14 } { leaf : 28 : 8 }',
      ' { internal : 0 : children 1 12 } { internal : 1 : children 2 5 } { internal : 2 : children 3 4 } { leaf : 3 : 0 } { leaf : 4 : 9 } { internal : 5 : children 6 9 } { internal : 6 : children 7 8 } { leaf : 7 : 3 } { leaf : 8 : 12 } { internal : 9 : children 10 11 } { leaf : 10 : 6 } { leaf : 11 : 15 } { internal : 12 : children 13 22 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 1 } { leaf : 16 : 10 } { internal : 17 : children 18 21 } { internal : 18 : children 19 20 } { leaf : 19 : 4 } { leaf : 20 : 13 } { leaf : 21 : 7 } { internal : 22 : children 23 26 } { internal : 23 : children 24 25 } { leaf : 24 : 2 } { leaf : 25 : 11 } { internal : 26 : children 27 30 } { internal : 27 : children 28 29 } { leaf : 28 : 5 } { leaf : 29 : 14 } { leaf : 30 : 8 }',
      ' { internal : 0 : children 1 12 } { internal : 1 : children 2 5 } { internal : 2 : children 3 4 } { leaf : 3 : 0 } { leaf : 4 : 9 } { internal : 5 : children 6 9 } { internal : 6 : children 7 8 } { leaf : 7 : 3 } { leaf : 8 : 12 } { internal : 9 : children 10 11 } { leaf : 10 : 6 } { leaf : 11 : 15 } { internal : 12 : children 13 24 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 1 } { leaf : 16 : 10 } { internal : 17 : children 18 21 } { internal : 18 : children 19 20 } { leaf : 19 : 4 } { leaf : 20 : 13 } { internal : 21 : children 22 23 } { leaf : 22 : 7 } { leaf : 23 : 16 } { internal : 24 : children 25 28 } { internal : 25 : children 26 27 } { leaf : 26 : 2 } { leaf : 27 : 11 } { internal : 28 : children 29 32 } { internal : 29 : children 30 31 } { leaf : 30 : 5 } { leaf : 31 : 14 } { leaf : 32 : 8 }',
      ' { internal : 0 : children 1 12 } { internal : 1 : children 2 5 } { internal : 2 : children 3 4 } { leaf : 3 : 0 } { leaf : 4 : 9 } { internal : 5 : children 6 9 } { internal : 6 : children 7 8 } { leaf : 7 : 3 } { leaf : 8 : 12 } { internal : 9 : children 10 11 } { leaf : 10 : 6 } { leaf : 11 : 15 } { internal : 12 : children 13 24 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 1 } { leaf : 16 : 10 } { internal : 17 : children 18 21 } { internal : 18 : children 19 20 } { leaf : 19 : 4 } { leaf : 20 : 13 } { internal : 21 : children 22 23 } { leaf : 22 : 7 } { leaf : 23 : 16 } { internal : 24 : children 25 28 } { internal : 25 : children 26 27 } { leaf : 26 : 2 } { leaf : 27 : 11 } { internal : 28 : children 29 32 } { internal : 29 : children 30 31 } { leaf : 30 : 5 } { leaf : 31 : 14 } { internal : 32 : children 33 34 } { leaf : 33 : 8 } { leaf : 34 : 17 }',
      ' { internal : 0 : children 1 14 } { internal : 1 : children 2 7 } { internal : 2 : children 3 4 } { leaf : 3 : 0 } { internal : 4 : children 5 6 } { leaf : 5 : 9 } { leaf : 6 : 18 } { internal : 7 : children 8 11 } { internal : 8 : children 9 10 } { leaf : 9 : 3 } { leaf : 10 : 12 } { internal : 11 : children 12 13 } { leaf : 12 : 6 } { leaf : 13 : 15 } { internal : 14 : children 15 26 } { internal : 15 : children 16 19 } { internal : 16 : children 17 18 } { leaf : 17 : 1 } { leaf : 18 : 10 } { internal : 19 : children 20 23 } { internal : 20 : children 21 22 } { leaf : 21 : 4 } { leaf : 22 : 13 } { internal : 23 : children 24 25 } { leaf : 24 : 7 } { leaf : 25 : 16 } { internal : 26 : children 27 30 } { internal : 27 : children 28 29 } { leaf : 28 : 2 } { leaf : 29 : 11 } { internal : 30 : children 31 34 } { internal : 31 : children 32 33 } { leaf : 32 : 5 } { leaf : 33 : 14 } { internal : 34 : children 35 36 } { leaf : 35 : 8 } { leaf : 36 : 17 }',
      ' { internal : 0 : children 1 14 } { internal : 1 : children 2 7 } { internal : 2 : children 3 4 } { leaf : 3 : 0 } { internal : 4 : children 5 6 } { leaf : 5 : 9 } { leaf : 6 : 18 } { internal : 7 : children 8 11 } { internal : 8 : children 9 10 } { leaf : 9 : 3 } { leaf : 10 : 12 } { internal : 11 : children 12 13 } { leaf : 12 : 6 } { leaf : 13 : 15 } { internal : 14 : children 15 28 } { internal : 15 : children 16 21 } { internal : 16 : children 17 18 } { leaf : 17 : 1 } { internal : 18 : children 19 20 } { leaf : 19 : 10 } { leaf : 20 : 19 } { internal : 21 : children 22 25 } { internal : 22 : children 23 24 } { leaf : 23 : 4 } { leaf : 24 : 13 } { internal : 25 : children 26 27 } { leaf : 26 : 7 } { leaf : 27 : 16 } { internal : 28 : children 29 32 } { internal : 29 : children 30 31 } { leaf : 30 : 2 } { leaf : 31 : 11 } { internal : 32 : children 33 36 } { internal : 33 : children 34 35 } { leaf : 34 : 5 } { leaf : 35 : 14 } { internal : 36 : children 37 38 } { leaf : 37 : 8 } { leaf : 38 : 17 }',
      ' { internal : 0 : children 1 14 } { internal : 1 : children 2 7 } { internal : 2 : children 3 4 } { leaf : 3 : 0 } { internal : 4 : children 5 6 } { leaf : 5 : 9 } { leaf : 6 : 18 } { internal : 7 : children 8 11 } { internal : 8 : children 9 10 } { leaf : 9 : 3 } { leaf : 10 : 12 } { internal : 11 : children 12 13 } { leaf : 12 : 6 } { leaf : 13 : 15 } { internal : 14 : children 15 28 } { internal : 15 : children 16 21 } { internal : 16 : children 17 18 } { leaf : 17 : 1 } { internal : 18 : children 19 20 } { leaf : 19 : 10 } { leaf : 20 : 19 } { internal : 21 : children 22 25 } { internal : 22 : children 23 24 } { leaf : 23 : 4 } { leaf : 24 : 13 } { internal : 25 : children 26 27 } { leaf : 26 : 7 } { leaf : 27 : 16 } { internal : 28 : children 29 34 } { internal : 29 : children 30 31 } { leaf : 30 : 2 } { internal : 31 : children 32 33 } { leaf : 32 : 11 } { leaf : 33 : 20 } { internal : 34 : children 35 38 } { internal : 35 : children 36 37 } { leaf : 36 : 5 } { leaf : 37 : 14 } { internal : 38 : children 39 40 } { leaf : 39 : 8 } { leaf : 40 : 17 }',
      ' { internal : 0 : children 1 16 } { internal : 1 : children 2 7 } { internal : 2 : children 3 4 } { leaf : 3 : 0 } { internal : 4 : children 5 6 } { leaf : 5 : 9 } { leaf : 6 : 18 } { internal : 7 : children 8 13 } { internal : 8 : children 9 10 } { leaf : 9 : 3 } { internal : 10 : children 11 12 } { leaf : 11 : 12 } { leaf : 12 : 21 } { internal : 13 : children 14 15 } { leaf : 14 : 6 } { leaf : 15 : 15 } { internal : 16 : children 17 30 } { internal : 17 : children 18 23 } { internal : 18 : children 19 20 } { leaf : 19 : 1 } { internal : 20 : children 21 22 } { leaf : 21 : 10 } { leaf : 22 : 19 } { internal : 23 : children 24 27 } { internal : 24 : children 25 26 } { leaf : 25 : 4 } { leaf : 26 : 13 } { internal : 27 : children 28 29 } { leaf : 28 : 7 } { leaf : 29 : 16 } { internal : 30 : children 31 36 } { internal : 31 : children 32 33 } { leaf : 32 : 2 } { internal : 33 : children 34 35 } { leaf : 34 : 11 } { leaf : 35 : 20 } { internal : 36 : children 37 40 } { internal : 37 : children 38 39 } { leaf : 38 : 5 } { leaf : 39 : 14 } { internal : 40 : children 41 42 } { leaf : 41 : 8 } { leaf : 42 : 17 }',
      ' { internal : 0 : children 1 16 } { internal : 1 : children 2 7 } { internal : 2 : children 3 4 } { leaf : 3 : 0 } { internal : 4 : children 5 6 } { leaf : 5 : 9 } { leaf : 6 : 18 } { internal : 7 : children 8 13 } { internal : 8 : children 9 10 } { leaf : 9 : 3 } { internal : 10 : children 11 12 } { leaf : 11 : 12 } { leaf : 12 : 21 } { internal : 13 : children 14 15 } { leaf : 14 : 6 } { leaf : 15 : 15 } { internal : 16 : children 17 32 } { internal : 17 : children 18 23 } { internal : 18 : children 19 20 } { leaf : 19 : 1 } { internal : 20 : children 21 22 } { leaf : 21 : 10 } { leaf : 22 : 19 } { internal : 23 : children 24 29 } { internal : 24 : children 25 26 } { leaf : 25 : 4 } { internal : 26 : children 27 28 } { leaf : 27 : 13 } { leaf : 28 : 22 } { internal : 29 : children 30 31 } { leaf : 30 : 7 } { leaf : 31 : 16 } { internal : 32 : children 33 38 } { internal : 33 : children 34 35 } { leaf : 34 : 2 } { internal : 35 : children 36 37 } { leaf : 36 : 11 } { leaf : 37 : 20 } { internal : 38 : children 39 42 } { internal : 39 : children 40 41 } { leaf : 40 : 5 } { leaf : 41 : 14 } { internal : 42 : children 43 44 } { leaf : 43 : 8 } { leaf : 44 : 17 }',
      ' { internal : 0 : children 1 16 } { internal : 1 : children 2 7 } { internal : 2 : children 3 4 } { leaf : 3 : 0 } { internal : 4 : children 5 6 } { leaf : 5 : 9 } { leaf : 6 : 18 } { internal : 7 : children 8 13 } { internal : 8 : children 9 10 } { leaf : 9 : 3 } { internal : 10 : children 11 12 } { leaf : 11 : 12 } { leaf : 12 : 21 } { internal : 13 : children 14 15 } { leaf : 14 : 6 } { leaf : 15 : 15 } { internal : 16 : children 17 32 } { internal : 17 : children 18 23 } { internal : 18 : children 19 20 } { leaf : 19 : 1 } { internal : 20 : children 21 22 } { leaf : 21 : 10 } { leaf : 22 : 19 } { internal : 23 : children 24 29 } { internal : 24 : children 25 26 } { leaf : 25 : 4 } { internal : 26 : children 27 28 } { leaf : 27 : 13 } { leaf : 28 : 22 } { internal : 29 : children 30 31 } { leaf : 30 : 7 } { leaf : 31 : 16 } { internal : 32 : children 33 38 } { internal : 33 : children 34 35 } { leaf : 34 : 2 } { internal : 35 : children 36 37 } { leaf : 36 : 11 } { leaf : 37 : 20 } { internal : 38 : children 39 44 } { internal : 39 : children 40 41 } { leaf : 40 : 5 } { internal : 41 : children 42 43 } { leaf : 42 : 14 } { leaf : 43 : 23 } { internal : 44 : children 45 46 } { leaf : 45 : 8 } { leaf : 46 : 17 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 4 } { leaf : 3 : 0 } { internal : 4 : children 5 6 } { leaf : 5 : 9 } { leaf : 6 : 18 } { internal : 7 : children 8 13 } { internal : 8 : children 9 10 } { leaf : 9 : 3 } { internal : 10 : children 11 12 } { leaf : 11 : 12 } { leaf : 12 : 21 } { internal : 13 : children 14 15 } { leaf : 14 : 6 } { internal : 15 : children 16 17 } { leaf : 16 : 15 } { leaf : 17 : 24 } { internal : 18 : children 19 34 } { internal : 19 : children 20 25 } { internal : 20 : children 21 22 } { leaf : 21 : 1 } { internal : 22 : children 23 24 } { leaf : 23 : 10 } { leaf : 24 : 19 } { internal : 25 : children 26 31 } { internal : 26 : children 27 28 } { leaf : 27 : 4 } { internal : 28 : children 29 30 } { leaf : 29 : 13 } { leaf : 30 : 22 } { internal : 31 : children 32 33 } { leaf : 32 : 7 } { leaf : 33 : 16 } { internal : 34 : children 35 40 } { internal : 35 : children 36 37 } { leaf : 36 : 2 } { internal : 37 : children 38 39 } { leaf : 38 : 11 } { leaf : 39 : 20 } { internal : 40 : children 41 46 } { internal : 41 : children 42 43 } { leaf : 42 : 5 } { internal : 43 : children 44 45 } { leaf : 44 : 14 } { leaf : 45 : 23 } { internal : 46 : children 47 48 } { leaf : 47 : 8 } { leaf : 48 : 17 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 4 } { leaf : 3 : 0 } { internal : 4 : children 5 6 } { leaf : 5 : 9 } { leaf : 6 : 18 } { internal : 7 : children 8 13 } { internal : 8 : children 9 10 } { leaf : 9 : 3 } { internal : 10 : children 11 12 } { leaf : 11 : 12 } { leaf : 12 : 21 } { internal : 13 : children 14 15 } { leaf : 14 : 6 } { internal : 15 : children 16 17 } { leaf : 16 : 15 } { leaf : 17 : 24 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 22 } { leaf : 21 : 1 } { internal : 22 : children 23 24 } { leaf : 23 : 10 } { leaf : 24 : 19 } { internal : 25 : children 26 31 } { internal : 26 : children 27 28 } { leaf : 27 : 4 } { internal : 28 : children 29 30 } { leaf : 29 : 13 } { leaf : 30 : 22 } { internal : 31 : children 32 33 } { leaf : 32 : 7 } { internal : 33 : children 34 35 } { leaf : 34 : 16 } { leaf : 35 : 25 } { internal : 36 : children 37 42 } { internal : 37 : children 38 39 } { leaf : 38 : 2 } { internal : 39 : children 40 41 } { leaf : 40 : 11 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { leaf : 50 : 17 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 4 } { leaf : 3 : 0 } { internal : 4 : children 5 6 } { leaf : 5 : 9 } { leaf : 6 : 18 } { internal : 7 : children 8 13 } { internal : 8 : children 9 10 } { leaf : 9 : 3 } { internal : 10 : children 11 12 } { leaf : 11 : 12 } { leaf : 12 : 21 } { internal : 13 : children 14 15 } { leaf : 14 : 6 } { internal : 15 : children 16 17 } { leaf : 16 : 15 } { leaf : 17 : 24 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 22 } { leaf : 21 : 1 } { internal : 22 : children 23 24 } { leaf : 23 : 10 } { leaf : 24 : 19 } { internal : 25 : children 26 31 } { internal : 26 : children 27 28 } { leaf : 27 : 4 } { internal : 28 : children 29 30 } { leaf : 29 : 13 } { leaf : 30 : 22 } { internal : 31 : children 32 33 } { leaf : 32 : 7 } { internal : 33 : children 34 35 } { leaf : 34 : 16 } { leaf : 35 : 25 } { internal : 36 : children 37 42 } { internal : 37 : children 38 39 } { leaf : 38 : 2 } { internal : 39 : children 40 41 } { leaf : 40 : 11 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }'
    ],
    writer = TestWriter.create();

    for ( var id = 0; id < vols.length; id++ ) {
      dbvt.insert( vols[ id ], id );
      dbvt.write( writer );
      equal( writer.s, expected[ id ], 'ok after insert ' + id );
    }

  });

  test('clear', function() {
    var dbvt = makeTestTree();
    strictEqual( typeof dbvt.clear, 'function', 'clear exists' );

    dbvt.clear();
    equal( dbvt.m_root, 0, 'm_root cleared' );
    equal( dbvt.m_free, 0, 'm_free cleared' );
    equal( dbvt.m_lkhd, -1, 'm_lkhd cleared' );
    equal( dbvt.m_leaves, 0, 'm_leaves cleared' );
    deepEqual( dbvt.m_stkStack, [], 'm_stkStack cleared' );
    equal( dbvt.m_opath, 0, 'm_opath cleared' );
  });

  test('empty', function() {
    var dbvt = Bump.Dbvt.create();
    strictEqual( typeof dbvt.empty, 'function', 'empty exists' );
    ok( dbvt.empty(), 'default dbvt is empty' );

    dbvt = makeTestTree();
    ok( !dbvt.empty(), 'test dbvt not empty' );

    dbvt.clear();
    ok( dbvt.empty(), 'cleared dbvt is empty' );
  });

  test('optimizeBottomUp', function() {
    var vols = makeVolumeGrid( 3 ),
        dbvt = Bump.Dbvt.create(),
        writer = TestWriter.create(),
        expected = ' { internal : 0 : children 1 30 } { internal : 1 : children 2 17 } { internal : 2 : children 3 14 } { internal : 3 : children 4 11 } { internal : 4 : children 5 8 } { internal : 5 : children 6 7 } { leaf : 6 : 0 } { leaf : 7 : 9 } { internal : 8 : children 9 10 } { leaf : 9 : 3 } { leaf : 10 : 12 } { internal : 11 : children 12 13 } { leaf : 12 : 18 } { leaf : 13 : 21 } { internal : 14 : children 15 16 } { leaf : 15 : 6 } { leaf : 16 : 15 } { internal : 17 : children 18 23 } { internal : 18 : children 19 22 } { internal : 19 : children 20 21 } { leaf : 20 : 26 } { leaf : 21 : 25 } { leaf : 22 : 24 } { internal : 23 : children 24 27 } { internal : 24 : children 25 26 } { leaf : 25 : 23 } { leaf : 26 : 22 } { internal : 27 : children 28 29 } { leaf : 28 : 20 } { leaf : 29 : 19 } { internal : 30 : children 31 38 } { internal : 31 : children 32 35 } { internal : 32 : children 33 34 } { leaf : 33 : 2 } { leaf : 34 : 11 } { internal : 35 : children 36 37 } { leaf : 36 : 1 } { leaf : 37 : 10 } { internal : 38 : children 39 50 } { internal : 39 : children 40 45 } { internal : 40 : children 41 42 } { leaf : 41 : 5 } { internal : 42 : children 43 44 } { leaf : 43 : 8 } { leaf : 44 : 7 } { internal : 45 : children 46 49 } { internal : 46 : children 47 48 } { leaf : 47 : 4 } { leaf : 48 : 13 } { leaf : 49 : 16 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 14 }';

    strictEqual( typeof dbvt.optimizeBottomUp, 'function', 'optimizeBottomUp exists' );

    insertAll( dbvt, vols );
    dbvt.optimizeBottomUp();
    dbvt.write( writer );
    equal( writer.s, expected, 'result matches btDbvt.optimizeBottomUp' );
  });

  test('optimizeTopDown', function() {
    var vols = makeVolumeGrid( 3 ),
        dbvt = Bump.Dbvt.create(),
        writer = TestWriter.create(),
        expected = ' { internal : 0 : children 1 30 } { internal : 1 : children 2 17 } { internal : 2 : children 3 14 } { internal : 3 : children 4 11 } { internal : 4 : children 5 8 } { internal : 5 : children 6 7 } { leaf : 6 : 0 } { leaf : 7 : 9 } { internal : 8 : children 9 10 } { leaf : 9 : 3 } { leaf : 10 : 12 } { internal : 11 : children 12 13 } { leaf : 12 : 18 } { leaf : 13 : 21 } { internal : 14 : children 15 16 } { leaf : 15 : 6 } { leaf : 16 : 15 } { internal : 17 : children 18 23 } { internal : 18 : children 19 22 } { internal : 19 : children 20 21 } { leaf : 20 : 26 } { leaf : 21 : 25 } { leaf : 22 : 24 } { internal : 23 : children 24 27 } { internal : 24 : children 25 26 } { leaf : 25 : 23 } { leaf : 26 : 22 } { internal : 27 : children 28 29 } { leaf : 28 : 20 } { leaf : 29 : 19 } { internal : 30 : children 31 38 } { internal : 31 : children 32 35 } { internal : 32 : children 33 34 } { leaf : 33 : 2 } { leaf : 34 : 11 } { internal : 35 : children 36 37 } { leaf : 36 : 1 } { leaf : 37 : 10 } { internal : 38 : children 39 50 } { internal : 39 : children 40 45 } { internal : 40 : children 41 42 } { leaf : 41 : 5 } { internal : 42 : children 43 44 } { leaf : 43 : 8 } { leaf : 44 : 7 } { internal : 45 : children 46 49 } { internal : 46 : children 47 48 } { leaf : 47 : 4 } { leaf : 48 : 13 } { leaf : 49 : 16 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 14 }';

    strictEqual( typeof dbvt.optimizeTopDown, 'function', 'optimizeTopDown exists' );

    insertAll( dbvt, vols );
    dbvt.optimizeTopDown();
    dbvt.write( writer );
    equal( writer.s, expected, 'result matches btDbvt.optimizeTopDown' );
  });

  test('optimizeIncremental', function() {
    var vols = makeVolumeGrid( 3 ),
        dbvt = Bump.Dbvt.create(),
        writer = TestWriter.create(),
        expected = ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 3 } { leaf : 12 : 21 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 6 } { leaf : 17 : 24 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 24 } { internal : 21 : children 22 23 } { leaf : 22 : 10 } { leaf : 23 : 19 } { leaf : 24 : 1 } { internal : 25 : children 26 31 } { internal : 26 : children 27 30 } { internal : 27 : children 28 29 } { leaf : 28 : 13 } { leaf : 29 : 4 } { leaf : 30 : 22 } { internal : 31 : children 32 33 } { leaf : 32 : 7 } { internal : 33 : children 34 35 } { leaf : 34 : 16 } { leaf : 35 : 25 } { internal : 36 : children 37 42 } { internal : 37 : children 38 41 } { internal : 38 : children 39 40 } { leaf : 39 : 11 } { leaf : 40 : 2 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 47 } { internal : 44 : children 45 46 } { leaf : 45 : 14 } { leaf : 46 : 5 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }';

    strictEqual( typeof dbvt.optimizeIncremental, 'function', 'optimizeIncremental exists' );

    insertAll( dbvt, vols );
    dbvt.optimizeIncremental( 10 );
    dbvt.write( writer );
    equal( writer.s, expected, 'result matches btDbvt.optimizeIncremental' );
  });

  test('updateLeafLookahead', function() {
    var expected = [
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 0 } { leaf : 6 : 18 } { internal : 7 : children 8 13 } { internal : 8 : children 9 10 } { leaf : 9 : 3 } { internal : 10 : children 11 12 } { leaf : 11 : 12 } { leaf : 12 : 21 } { internal : 13 : children 14 15 } { leaf : 14 : 6 } { internal : 15 : children 16 17 } { leaf : 16 : 15 } { leaf : 17 : 24 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 22 } { leaf : 21 : 1 } { internal : 22 : children 23 24 } { leaf : 23 : 10 } { leaf : 24 : 19 } { internal : 25 : children 26 31 } { internal : 26 : children 27 28 } { leaf : 27 : 4 } { internal : 28 : children 29 30 } { leaf : 29 : 13 } { leaf : 30 : 22 } { internal : 31 : children 32 33 } { leaf : 32 : 7 } { internal : 33 : children 34 35 } { leaf : 34 : 16 } { leaf : 35 : 25 } { internal : 36 : children 37 42 } { internal : 37 : children 38 39 } { leaf : 38 : 2 } { internal : 39 : children 40 41 } { leaf : 40 : 11 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 0 } { leaf : 6 : 18 } { internal : 7 : children 8 13 } { internal : 8 : children 9 10 } { leaf : 9 : 3 } { internal : 10 : children 11 12 } { leaf : 11 : 12 } { leaf : 12 : 21 } { internal : 13 : children 14 15 } { leaf : 14 : 6 } { internal : 15 : children 16 17 } { leaf : 16 : 15 } { leaf : 17 : 24 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 22 } { leaf : 21 : 1 } { internal : 22 : children 23 24 } { leaf : 23 : 10 } { leaf : 24 : 19 } { internal : 25 : children 26 31 } { internal : 26 : children 27 28 } { leaf : 27 : 4 } { internal : 28 : children 29 30 } { leaf : 29 : 13 } { leaf : 30 : 22 } { internal : 31 : children 32 33 } { leaf : 32 : 7 } { internal : 33 : children 34 35 } { leaf : 34 : 16 } { leaf : 35 : 25 } { internal : 36 : children 37 42 } { internal : 37 : children 38 39 } { leaf : 38 : 2 } { internal : 39 : children 40 41 } { leaf : 40 : 11 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 10 } { leaf : 9 : 3 } { internal : 10 : children 11 12 } { leaf : 11 : 12 } { leaf : 12 : 21 } { internal : 13 : children 14 15 } { leaf : 14 : 6 } { internal : 15 : children 16 17 } { leaf : 16 : 15 } { leaf : 17 : 24 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 22 } { leaf : 21 : 1 } { internal : 22 : children 23 24 } { leaf : 23 : 10 } { leaf : 24 : 19 } { internal : 25 : children 26 31 } { internal : 26 : children 27 28 } { leaf : 27 : 4 } { internal : 28 : children 29 30 } { leaf : 29 : 13 } { leaf : 30 : 22 } { internal : 31 : children 32 33 } { leaf : 32 : 7 } { internal : 33 : children 34 35 } { leaf : 34 : 16 } { leaf : 35 : 25 } { internal : 36 : children 37 42 } { internal : 37 : children 38 39 } { leaf : 38 : 2 } { internal : 39 : children 40 41 } { leaf : 40 : 11 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 3 } { leaf : 12 : 21 } { internal : 13 : children 14 15 } { leaf : 14 : 6 } { internal : 15 : children 16 17 } { leaf : 16 : 15 } { leaf : 17 : 24 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 22 } { leaf : 21 : 1 } { internal : 22 : children 23 24 } { leaf : 23 : 10 } { leaf : 24 : 19 } { internal : 25 : children 26 31 } { internal : 26 : children 27 28 } { leaf : 27 : 4 } { internal : 28 : children 29 30 } { leaf : 29 : 13 } { leaf : 30 : 22 } { internal : 31 : children 32 33 } { leaf : 32 : 7 } { internal : 33 : children 34 35 } { leaf : 34 : 16 } { leaf : 35 : 25 } { internal : 36 : children 37 42 } { internal : 37 : children 38 39 } { leaf : 38 : 2 } { internal : 39 : children 40 41 } { leaf : 40 : 11 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 3 } { leaf : 12 : 21 } { internal : 13 : children 14 15 } { leaf : 14 : 6 } { internal : 15 : children 16 17 } { leaf : 16 : 15 } { leaf : 17 : 24 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 22 } { leaf : 21 : 1 } { internal : 22 : children 23 24 } { leaf : 23 : 10 } { leaf : 24 : 19 } { internal : 25 : children 26 31 } { internal : 26 : children 27 28 } { leaf : 27 : 4 } { internal : 28 : children 29 30 } { leaf : 29 : 13 } { leaf : 30 : 22 } { internal : 31 : children 32 33 } { leaf : 32 : 7 } { internal : 33 : children 34 35 } { leaf : 34 : 16 } { leaf : 35 : 25 } { internal : 36 : children 37 42 } { internal : 37 : children 38 39 } { leaf : 38 : 2 } { internal : 39 : children 40 41 } { leaf : 40 : 11 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 15 } { leaf : 14 : 6 } { internal : 15 : children 16 17 } { leaf : 16 : 15 } { leaf : 17 : 24 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 22 } { leaf : 21 : 1 } { internal : 22 : children 23 24 } { leaf : 23 : 10 } { leaf : 24 : 19 } { internal : 25 : children 26 31 } { internal : 26 : children 27 28 } { leaf : 27 : 4 } { internal : 28 : children 29 30 } { leaf : 29 : 13 } { leaf : 30 : 22 } { internal : 31 : children 32 33 } { leaf : 32 : 7 } { internal : 33 : children 34 35 } { leaf : 34 : 16 } { leaf : 35 : 25 } { internal : 36 : children 37 42 } { internal : 37 : children 38 39 } { leaf : 38 : 2 } { internal : 39 : children 40 41 } { leaf : 40 : 11 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 6 } { leaf : 17 : 24 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 22 } { leaf : 21 : 1 } { internal : 22 : children 23 24 } { leaf : 23 : 10 } { leaf : 24 : 19 } { internal : 25 : children 26 31 } { internal : 26 : children 27 28 } { leaf : 27 : 4 } { internal : 28 : children 29 30 } { leaf : 29 : 13 } { leaf : 30 : 22 } { internal : 31 : children 32 33 } { leaf : 32 : 7 } { internal : 33 : children 34 35 } { leaf : 34 : 16 } { leaf : 35 : 25 } { internal : 36 : children 37 42 } { internal : 37 : children 38 39 } { leaf : 38 : 2 } { internal : 39 : children 40 41 } { leaf : 40 : 11 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 6 } { leaf : 17 : 24 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 22 } { leaf : 21 : 1 } { internal : 22 : children 23 24 } { leaf : 23 : 10 } { leaf : 24 : 19 } { internal : 25 : children 26 31 } { internal : 26 : children 27 28 } { leaf : 27 : 4 } { internal : 28 : children 29 30 } { leaf : 29 : 13 } { leaf : 30 : 22 } { internal : 31 : children 32 33 } { leaf : 32 : 7 } { internal : 33 : children 34 35 } { leaf : 34 : 16 } { leaf : 35 : 25 } { internal : 36 : children 37 42 } { internal : 37 : children 38 39 } { leaf : 38 : 2 } { internal : 39 : children 40 41 } { leaf : 40 : 11 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 24 } { leaf : 17 : 6 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 22 } { leaf : 21 : 1 } { internal : 22 : children 23 24 } { leaf : 23 : 10 } { leaf : 24 : 19 } { internal : 25 : children 26 31 } { internal : 26 : children 27 28 } { leaf : 27 : 4 } { internal : 28 : children 29 30 } { leaf : 29 : 13 } { leaf : 30 : 22 } { internal : 31 : children 32 33 } { leaf : 32 : 7 } { internal : 33 : children 34 35 } { leaf : 34 : 16 } { leaf : 35 : 25 } { internal : 36 : children 37 42 } { internal : 37 : children 38 39 } { leaf : 38 : 2 } { internal : 39 : children 40 41 } { leaf : 40 : 11 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 24 } { leaf : 17 : 6 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 24 } { internal : 21 : children 22 23 } { leaf : 22 : 10 } { leaf : 23 : 1 } { leaf : 24 : 19 } { internal : 25 : children 26 31 } { internal : 26 : children 27 28 } { leaf : 27 : 4 } { internal : 28 : children 29 30 } { leaf : 29 : 13 } { leaf : 30 : 22 } { internal : 31 : children 32 33 } { leaf : 32 : 7 } { internal : 33 : children 34 35 } { leaf : 34 : 16 } { leaf : 35 : 25 } { internal : 36 : children 37 42 } { internal : 37 : children 38 39 } { leaf : 38 : 2 } { internal : 39 : children 40 41 } { leaf : 40 : 11 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 24 } { leaf : 17 : 6 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 24 } { internal : 21 : children 22 23 } { leaf : 22 : 10 } { leaf : 23 : 1 } { leaf : 24 : 19 } { internal : 25 : children 26 31 } { internal : 26 : children 27 28 } { leaf : 27 : 4 } { internal : 28 : children 29 30 } { leaf : 29 : 13 } { leaf : 30 : 22 } { internal : 31 : children 32 33 } { leaf : 32 : 7 } { internal : 33 : children 34 35 } { leaf : 34 : 16 } { leaf : 35 : 25 } { internal : 36 : children 37 42 } { internal : 37 : children 38 39 } { leaf : 38 : 2 } { internal : 39 : children 40 41 } { leaf : 40 : 11 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 24 } { leaf : 17 : 6 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 24 } { internal : 21 : children 22 23 } { leaf : 22 : 10 } { leaf : 23 : 19 } { leaf : 24 : 1 } { internal : 25 : children 26 31 } { internal : 26 : children 27 28 } { leaf : 27 : 4 } { internal : 28 : children 29 30 } { leaf : 29 : 13 } { leaf : 30 : 22 } { internal : 31 : children 32 33 } { leaf : 32 : 7 } { internal : 33 : children 34 35 } { leaf : 34 : 16 } { leaf : 35 : 25 } { internal : 36 : children 37 42 } { internal : 37 : children 38 39 } { leaf : 38 : 2 } { internal : 39 : children 40 41 } { leaf : 40 : 11 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 24 } { leaf : 17 : 6 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 24 } { internal : 21 : children 22 23 } { leaf : 22 : 10 } { leaf : 23 : 19 } { leaf : 24 : 1 } { internal : 25 : children 26 31 } { internal : 26 : children 27 30 } { internal : 27 : children 28 29 } { leaf : 28 : 13 } { leaf : 29 : 4 } { leaf : 30 : 22 } { internal : 31 : children 32 33 } { leaf : 32 : 7 } { internal : 33 : children 34 35 } { leaf : 34 : 16 } { leaf : 35 : 25 } { internal : 36 : children 37 42 } { internal : 37 : children 38 39 } { leaf : 38 : 2 } { internal : 39 : children 40 41 } { leaf : 40 : 11 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 24 } { leaf : 17 : 6 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 24 } { internal : 21 : children 22 23 } { leaf : 22 : 10 } { leaf : 23 : 19 } { leaf : 24 : 1 } { internal : 25 : children 26 31 } { internal : 26 : children 27 30 } { internal : 27 : children 28 29 } { leaf : 28 : 13 } { leaf : 29 : 4 } { leaf : 30 : 22 } { internal : 31 : children 32 33 } { leaf : 32 : 7 } { internal : 33 : children 34 35 } { leaf : 34 : 16 } { leaf : 35 : 25 } { internal : 36 : children 37 42 } { internal : 37 : children 38 39 } { leaf : 38 : 2 } { internal : 39 : children 40 41 } { leaf : 40 : 11 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 24 } { leaf : 17 : 6 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 24 } { internal : 21 : children 22 23 } { leaf : 22 : 10 } { leaf : 23 : 19 } { leaf : 24 : 1 } { internal : 25 : children 26 31 } { internal : 26 : children 27 30 } { internal : 27 : children 28 29 } { leaf : 28 : 13 } { leaf : 29 : 22 } { leaf : 30 : 4 } { internal : 31 : children 32 33 } { leaf : 32 : 7 } { internal : 33 : children 34 35 } { leaf : 34 : 16 } { leaf : 35 : 25 } { internal : 36 : children 37 42 } { internal : 37 : children 38 39 } { leaf : 38 : 2 } { internal : 39 : children 40 41 } { leaf : 40 : 11 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 24 } { leaf : 17 : 6 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 24 } { internal : 21 : children 22 23 } { leaf : 22 : 10 } { leaf : 23 : 19 } { leaf : 24 : 1 } { internal : 25 : children 26 31 } { internal : 26 : children 27 30 } { internal : 27 : children 28 29 } { leaf : 28 : 13 } { leaf : 29 : 22 } { leaf : 30 : 4 } { internal : 31 : children 32 35 } { internal : 32 : children 33 34 } { leaf : 33 : 16 } { leaf : 34 : 7 } { leaf : 35 : 25 } { internal : 36 : children 37 42 } { internal : 37 : children 38 39 } { leaf : 38 : 2 } { internal : 39 : children 40 41 } { leaf : 40 : 11 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 24 } { leaf : 17 : 6 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 24 } { internal : 21 : children 22 23 } { leaf : 22 : 10 } { leaf : 23 : 19 } { leaf : 24 : 1 } { internal : 25 : children 26 31 } { internal : 26 : children 27 30 } { internal : 27 : children 28 29 } { leaf : 28 : 13 } { leaf : 29 : 22 } { leaf : 30 : 4 } { internal : 31 : children 32 35 } { internal : 32 : children 33 34 } { leaf : 33 : 16 } { leaf : 34 : 7 } { leaf : 35 : 25 } { internal : 36 : children 37 42 } { internal : 37 : children 38 39 } { leaf : 38 : 2 } { internal : 39 : children 40 41 } { leaf : 40 : 11 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 24 } { leaf : 17 : 6 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 24 } { internal : 21 : children 22 23 } { leaf : 22 : 10 } { leaf : 23 : 19 } { leaf : 24 : 1 } { internal : 25 : children 26 31 } { internal : 26 : children 27 30 } { internal : 27 : children 28 29 } { leaf : 28 : 13 } { leaf : 29 : 22 } { leaf : 30 : 4 } { internal : 31 : children 32 35 } { internal : 32 : children 33 34 } { leaf : 33 : 16 } { leaf : 34 : 25 } { leaf : 35 : 7 } { internal : 36 : children 37 42 } { internal : 37 : children 38 39 } { leaf : 38 : 2 } { internal : 39 : children 40 41 } { leaf : 40 : 11 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 24 } { leaf : 17 : 6 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 24 } { internal : 21 : children 22 23 } { leaf : 22 : 10 } { leaf : 23 : 19 } { leaf : 24 : 1 } { internal : 25 : children 26 31 } { internal : 26 : children 27 30 } { internal : 27 : children 28 29 } { leaf : 28 : 13 } { leaf : 29 : 22 } { leaf : 30 : 4 } { internal : 31 : children 32 35 } { internal : 32 : children 33 34 } { leaf : 33 : 16 } { leaf : 34 : 25 } { leaf : 35 : 7 } { internal : 36 : children 37 42 } { internal : 37 : children 38 41 } { internal : 38 : children 39 40 } { leaf : 39 : 11 } { leaf : 40 : 2 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 24 } { leaf : 17 : 6 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 24 } { internal : 21 : children 22 23 } { leaf : 22 : 10 } { leaf : 23 : 19 } { leaf : 24 : 1 } { internal : 25 : children 26 31 } { internal : 26 : children 27 30 } { internal : 27 : children 28 29 } { leaf : 28 : 13 } { leaf : 29 : 22 } { leaf : 30 : 4 } { internal : 31 : children 32 35 } { internal : 32 : children 33 34 } { leaf : 33 : 16 } { leaf : 34 : 25 } { leaf : 35 : 7 } { internal : 36 : children 37 42 } { internal : 37 : children 38 41 } { internal : 38 : children 39 40 } { leaf : 39 : 11 } { leaf : 40 : 2 } { leaf : 41 : 20 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 24 } { leaf : 17 : 6 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 24 } { internal : 21 : children 22 23 } { leaf : 22 : 10 } { leaf : 23 : 19 } { leaf : 24 : 1 } { internal : 25 : children 26 31 } { internal : 26 : children 27 30 } { internal : 27 : children 28 29 } { leaf : 28 : 13 } { leaf : 29 : 22 } { leaf : 30 : 4 } { internal : 31 : children 32 35 } { internal : 32 : children 33 34 } { leaf : 33 : 16 } { leaf : 34 : 25 } { leaf : 35 : 7 } { internal : 36 : children 37 42 } { internal : 37 : children 38 41 } { internal : 38 : children 39 40 } { leaf : 39 : 11 } { leaf : 40 : 20 } { leaf : 41 : 2 } { internal : 42 : children 43 48 } { internal : 43 : children 44 45 } { leaf : 44 : 5 } { internal : 45 : children 46 47 } { leaf : 46 : 14 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 24 } { leaf : 17 : 6 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 24 } { internal : 21 : children 22 23 } { leaf : 22 : 10 } { leaf : 23 : 19 } { leaf : 24 : 1 } { internal : 25 : children 26 31 } { internal : 26 : children 27 30 } { internal : 27 : children 28 29 } { leaf : 28 : 13 } { leaf : 29 : 22 } { leaf : 30 : 4 } { internal : 31 : children 32 35 } { internal : 32 : children 33 34 } { leaf : 33 : 16 } { leaf : 34 : 25 } { leaf : 35 : 7 } { internal : 36 : children 37 42 } { internal : 37 : children 38 41 } { internal : 38 : children 39 40 } { leaf : 39 : 11 } { leaf : 40 : 20 } { leaf : 41 : 2 } { internal : 42 : children 43 48 } { internal : 43 : children 44 47 } { internal : 44 : children 45 46 } { leaf : 45 : 14 } { leaf : 46 : 5 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 24 } { leaf : 17 : 6 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 24 } { internal : 21 : children 22 23 } { leaf : 22 : 10 } { leaf : 23 : 19 } { leaf : 24 : 1 } { internal : 25 : children 26 31 } { internal : 26 : children 27 30 } { internal : 27 : children 28 29 } { leaf : 28 : 13 } { leaf : 29 : 22 } { leaf : 30 : 4 } { internal : 31 : children 32 35 } { internal : 32 : children 33 34 } { leaf : 33 : 16 } { leaf : 34 : 25 } { leaf : 35 : 7 } { internal : 36 : children 37 42 } { internal : 37 : children 38 41 } { internal : 38 : children 39 40 } { leaf : 39 : 11 } { leaf : 40 : 20 } { leaf : 41 : 2 } { internal : 42 : children 43 48 } { internal : 43 : children 44 47 } { internal : 44 : children 45 46 } { leaf : 45 : 14 } { leaf : 46 : 5 } { leaf : 47 : 23 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 24 } { leaf : 17 : 6 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 24 } { internal : 21 : children 22 23 } { leaf : 22 : 10 } { leaf : 23 : 19 } { leaf : 24 : 1 } { internal : 25 : children 26 31 } { internal : 26 : children 27 30 } { internal : 27 : children 28 29 } { leaf : 28 : 13 } { leaf : 29 : 22 } { leaf : 30 : 4 } { internal : 31 : children 32 35 } { internal : 32 : children 33 34 } { leaf : 33 : 16 } { leaf : 34 : 25 } { leaf : 35 : 7 } { internal : 36 : children 37 42 } { internal : 37 : children 38 41 } { internal : 38 : children 39 40 } { leaf : 39 : 11 } { leaf : 40 : 20 } { leaf : 41 : 2 } { internal : 42 : children 43 48 } { internal : 43 : children 44 47 } { internal : 44 : children 45 46 } { leaf : 45 : 14 } { leaf : 46 : 23 } { leaf : 47 : 5 } { internal : 48 : children 49 50 } { leaf : 49 : 8 } { internal : 50 : children 51 52 } { leaf : 51 : 17 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 24 } { leaf : 17 : 6 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 24 } { internal : 21 : children 22 23 } { leaf : 22 : 10 } { leaf : 23 : 19 } { leaf : 24 : 1 } { internal : 25 : children 26 31 } { internal : 26 : children 27 30 } { internal : 27 : children 28 29 } { leaf : 28 : 13 } { leaf : 29 : 22 } { leaf : 30 : 4 } { internal : 31 : children 32 35 } { internal : 32 : children 33 34 } { leaf : 33 : 16 } { leaf : 34 : 25 } { leaf : 35 : 7 } { internal : 36 : children 37 42 } { internal : 37 : children 38 41 } { internal : 38 : children 39 40 } { leaf : 39 : 11 } { leaf : 40 : 20 } { leaf : 41 : 2 } { internal : 42 : children 43 48 } { internal : 43 : children 44 47 } { internal : 44 : children 45 46 } { leaf : 45 : 14 } { leaf : 46 : 23 } { leaf : 47 : 5 } { internal : 48 : children 49 52 } { internal : 49 : children 50 51 } { leaf : 50 : 17 } { leaf : 51 : 8 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 24 } { leaf : 17 : 6 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 24 } { internal : 21 : children 22 23 } { leaf : 22 : 10 } { leaf : 23 : 19 } { leaf : 24 : 1 } { internal : 25 : children 26 31 } { internal : 26 : children 27 30 } { internal : 27 : children 28 29 } { leaf : 28 : 13 } { leaf : 29 : 22 } { leaf : 30 : 4 } { internal : 31 : children 32 35 } { internal : 32 : children 33 34 } { leaf : 33 : 16 } { leaf : 34 : 25 } { leaf : 35 : 7 } { internal : 36 : children 37 42 } { internal : 37 : children 38 41 } { internal : 38 : children 39 40 } { leaf : 39 : 11 } { leaf : 40 : 20 } { leaf : 41 : 2 } { internal : 42 : children 43 48 } { internal : 43 : children 44 47 } { internal : 44 : children 45 46 } { leaf : 45 : 14 } { leaf : 46 : 23 } { leaf : 47 : 5 } { internal : 48 : children 49 52 } { internal : 49 : children 50 51 } { leaf : 50 : 17 } { leaf : 51 : 8 } { leaf : 52 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 6 } { internal : 3 : children 4 5 } { leaf : 4 : 9 } { leaf : 5 : 18 } { leaf : 6 : 0 } { internal : 7 : children 8 13 } { internal : 8 : children 9 12 } { internal : 9 : children 10 11 } { leaf : 10 : 12 } { leaf : 11 : 21 } { leaf : 12 : 3 } { internal : 13 : children 14 17 } { internal : 14 : children 15 16 } { leaf : 15 : 15 } { leaf : 16 : 24 } { leaf : 17 : 6 } { internal : 18 : children 19 36 } { internal : 19 : children 20 25 } { internal : 20 : children 21 24 } { internal : 21 : children 22 23 } { leaf : 22 : 10 } { leaf : 23 : 19 } { leaf : 24 : 1 } { internal : 25 : children 26 31 } { internal : 26 : children 27 30 } { internal : 27 : children 28 29 } { leaf : 28 : 13 } { leaf : 29 : 22 } { leaf : 30 : 4 } { internal : 31 : children 32 35 } { internal : 32 : children 33 34 } { leaf : 33 : 16 } { leaf : 34 : 25 } { leaf : 35 : 7 } { internal : 36 : children 37 42 } { internal : 37 : children 38 41 } { internal : 38 : children 39 40 } { leaf : 39 : 11 } { leaf : 40 : 20 } { leaf : 41 : 2 } { internal : 42 : children 43 48 } { internal : 43 : children 44 47 } { internal : 44 : children 45 46 } { leaf : 45 : 14 } { leaf : 46 : 23 } { leaf : 47 : 5 } { internal : 48 : children 49 52 } { internal : 49 : children 50 51 } { leaf : 50 : 17 } { leaf : 51 : 26 } { leaf : 52 : 8 }'
    ],
    dbvt = Bump.Dbvt.create(),
    vols = makeVolumeGrid( 3 ),
    writer = TestWriter.create();

    strictEqual( typeof dbvt.updateLeafLookahead, 'function', 'updateLeafLookahead exists' );

    insertAll( dbvt, vols );
    for ( var i = 0; i < 27; i++ ) {
      var leaves = [],
      lh = (i % 4) - 1;
      Bump.Dbvt.extractLeaves( dbvt.m_root, leaves );
      dbvt.updateLeafLookahead( leaves[ i ], lh );
      dbvt.write( writer );

      equal( writer.s, expected[ i ], 'correct result after update ' + i + '( with lookahead = ' + lh + ')' );
    }

  });

  test('remove', function() {

    var expected = [
      ' { internal : 0 : children 1 16 } { internal : 1 : children 2 5 } { internal : 2 : children 3 4 } { leaf : 3 : 9 } { leaf : 4 : 18 } { internal : 5 : children 6 11 } { internal : 6 : children 7 8 } { leaf : 7 : 3 } { internal : 8 : children 9 10 } { leaf : 9 : 12 } { leaf : 10 : 21 } { internal : 11 : children 12 13 } { leaf : 12 : 6 } { internal : 13 : children 14 15 } { leaf : 14 : 15 } { leaf : 15 : 24 } { internal : 16 : children 17 34 } { internal : 17 : children 18 23 } { internal : 18 : children 19 20 } { leaf : 19 : 1 } { internal : 20 : children 21 22 } { leaf : 21 : 10 } { leaf : 22 : 19 } { internal : 23 : children 24 29 } { internal : 24 : children 25 26 } { leaf : 25 : 4 } { internal : 26 : children 27 28 } { leaf : 27 : 13 } { leaf : 28 : 22 } { internal : 29 : children 30 31 } { leaf : 30 : 7 } { internal : 31 : children 32 33 } { leaf : 32 : 16 } { leaf : 33 : 25 } { internal : 34 : children 35 40 } { internal : 35 : children 36 37 } { leaf : 36 : 2 } { internal : 37 : children 38 39 } { leaf : 38 : 11 } { leaf : 39 : 20 } { internal : 40 : children 41 46 } { internal : 41 : children 42 43 } { leaf : 42 : 5 } { internal : 43 : children 44 45 } { leaf : 44 : 14 } { leaf : 45 : 23 } { internal : 46 : children 47 48 } { leaf : 47 : 8 } { internal : 48 : children 49 50 } { leaf : 49 : 17 } { leaf : 50 : 26 }',
      ' { internal : 0 : children 1 14 } { internal : 1 : children 2 3 } { leaf : 2 : 18 } { internal : 3 : children 4 9 } { internal : 4 : children 5 6 } { leaf : 5 : 3 } { internal : 6 : children 7 8 } { leaf : 7 : 12 } { leaf : 8 : 21 } { internal : 9 : children 10 11 } { leaf : 10 : 6 } { internal : 11 : children 12 13 } { leaf : 12 : 15 } { leaf : 13 : 24 } { internal : 14 : children 15 32 } { internal : 15 : children 16 21 } { internal : 16 : children 17 18 } { leaf : 17 : 1 } { internal : 18 : children 19 20 } { leaf : 19 : 10 } { leaf : 20 : 19 } { internal : 21 : children 22 27 } { internal : 22 : children 23 24 } { leaf : 23 : 4 } { internal : 24 : children 25 26 } { leaf : 25 : 13 } { leaf : 26 : 22 } { internal : 27 : children 28 29 } { leaf : 28 : 7 } { internal : 29 : children 30 31 } { leaf : 30 : 16 } { leaf : 31 : 25 } { internal : 32 : children 33 38 } { internal : 33 : children 34 35 } { leaf : 34 : 2 } { internal : 35 : children 36 37 } { leaf : 36 : 11 } { leaf : 37 : 20 } { internal : 38 : children 39 44 } { internal : 39 : children 40 41 } { leaf : 40 : 5 } { internal : 41 : children 42 43 } { leaf : 42 : 14 } { leaf : 43 : 23 } { internal : 44 : children 45 46 } { leaf : 45 : 8 } { internal : 46 : children 47 48 } { leaf : 47 : 17 } { leaf : 48 : 26 }',
      ' { internal : 0 : children 1 12 } { internal : 1 : children 2 7 } { internal : 2 : children 3 4 } { leaf : 3 : 3 } { internal : 4 : children 5 6 } { leaf : 5 : 12 } { leaf : 6 : 21 } { internal : 7 : children 8 9 } { leaf : 8 : 6 } { internal : 9 : children 10 11 } { leaf : 10 : 15 } { leaf : 11 : 24 } { internal : 12 : children 13 30 } { internal : 13 : children 14 19 } { internal : 14 : children 15 16 } { leaf : 15 : 1 } { internal : 16 : children 17 18 } { leaf : 17 : 10 } { leaf : 18 : 19 } { internal : 19 : children 20 25 } { internal : 20 : children 21 22 } { leaf : 21 : 4 } { internal : 22 : children 23 24 } { leaf : 23 : 13 } { leaf : 24 : 22 } { internal : 25 : children 26 27 } { leaf : 26 : 7 } { internal : 27 : children 28 29 } { leaf : 28 : 16 } { leaf : 29 : 25 } { internal : 30 : children 31 36 } { internal : 31 : children 32 33 } { leaf : 32 : 2 } { internal : 33 : children 34 35 } { leaf : 34 : 11 } { leaf : 35 : 20 } { internal : 36 : children 37 42 } { internal : 37 : children 38 39 } { leaf : 38 : 5 } { internal : 39 : children 40 41 } { leaf : 40 : 14 } { leaf : 41 : 23 } { internal : 42 : children 43 44 } { leaf : 43 : 8 } { internal : 44 : children 45 46 } { leaf : 45 : 17 } { leaf : 46 : 26 }',
      ' { internal : 0 : children 1 10 } { internal : 1 : children 2 5 } { internal : 2 : children 3 4 } { leaf : 3 : 12 } { leaf : 4 : 21 } { internal : 5 : children 6 7 } { leaf : 6 : 6 } { internal : 7 : children 8 9 } { leaf : 8 : 15 } { leaf : 9 : 24 } { internal : 10 : children 11 28 } { internal : 11 : children 12 17 } { internal : 12 : children 13 14 } { leaf : 13 : 1 } { internal : 14 : children 15 16 } { leaf : 15 : 10 } { leaf : 16 : 19 } { internal : 17 : children 18 23 } { internal : 18 : children 19 20 } { leaf : 19 : 4 } { internal : 20 : children 21 22 } { leaf : 21 : 13 } { leaf : 22 : 22 } { internal : 23 : children 24 25 } { leaf : 24 : 7 } { internal : 25 : children 26 27 } { leaf : 26 : 16 } { leaf : 27 : 25 } { internal : 28 : children 29 34 } { internal : 29 : children 30 31 } { leaf : 30 : 2 } { internal : 31 : children 32 33 } { leaf : 32 : 11 } { leaf : 33 : 20 } { internal : 34 : children 35 40 } { internal : 35 : children 36 37 } { leaf : 36 : 5 } { internal : 37 : children 38 39 } { leaf : 38 : 14 } { leaf : 39 : 23 } { internal : 40 : children 41 42 } { leaf : 41 : 8 } { internal : 42 : children 43 44 } { leaf : 43 : 17 } { leaf : 44 : 26 }',
      ' { internal : 0 : children 1 8 } { internal : 1 : children 2 3 } { leaf : 2 : 21 } { internal : 3 : children 4 5 } { leaf : 4 : 6 } { internal : 5 : children 6 7 } { leaf : 6 : 15 } { leaf : 7 : 24 } { internal : 8 : children 9 26 } { internal : 9 : children 10 15 } { internal : 10 : children 11 12 } { leaf : 11 : 1 } { internal : 12 : children 13 14 } { leaf : 13 : 10 } { leaf : 14 : 19 } { internal : 15 : children 16 21 } { internal : 16 : children 17 18 } { leaf : 17 : 4 } { internal : 18 : children 19 20 } { leaf : 19 : 13 } { leaf : 20 : 22 } { internal : 21 : children 22 23 } { leaf : 22 : 7 } { internal : 23 : children 24 25 } { leaf : 24 : 16 } { leaf : 25 : 25 } { internal : 26 : children 27 32 } { internal : 27 : children 28 29 } { leaf : 28 : 2 } { internal : 29 : children 30 31 } { leaf : 30 : 11 } { leaf : 31 : 20 } { internal : 32 : children 33 38 } { internal : 33 : children 34 35 } { leaf : 34 : 5 } { internal : 35 : children 36 37 } { leaf : 36 : 14 } { leaf : 37 : 23 } { internal : 38 : children 39 40 } { leaf : 39 : 8 } { internal : 40 : children 41 42 } { leaf : 41 : 17 } { leaf : 42 : 26 }',
      ' { internal : 0 : children 1 6 } { internal : 1 : children 2 3 } { leaf : 2 : 6 } { internal : 3 : children 4 5 } { leaf : 4 : 15 } { leaf : 5 : 24 } { internal : 6 : children 7 24 } { internal : 7 : children 8 13 } { internal : 8 : children 9 10 } { leaf : 9 : 1 } { internal : 10 : children 11 12 } { leaf : 11 : 10 } { leaf : 12 : 19 } { internal : 13 : children 14 19 } { internal : 14 : children 15 16 } { leaf : 15 : 4 } { internal : 16 : children 17 18 } { leaf : 17 : 13 } { leaf : 18 : 22 } { internal : 19 : children 20 21 } { leaf : 20 : 7 } { internal : 21 : children 22 23 } { leaf : 22 : 16 } { leaf : 23 : 25 } { internal : 24 : children 25 30 } { internal : 25 : children 26 27 } { leaf : 26 : 2 } { internal : 27 : children 28 29 } { leaf : 28 : 11 } { leaf : 29 : 20 } { internal : 30 : children 31 36 } { internal : 31 : children 32 33 } { leaf : 32 : 5 } { internal : 33 : children 34 35 } { leaf : 34 : 14 } { leaf : 35 : 23 } { internal : 36 : children 37 38 } { leaf : 37 : 8 } { internal : 38 : children 39 40 } { leaf : 39 : 17 } { leaf : 40 : 26 }',
      ' { internal : 0 : children 1 4 } { internal : 1 : children 2 3 } { leaf : 2 : 15 } { leaf : 3 : 24 } { internal : 4 : children 5 22 } { internal : 5 : children 6 11 } { internal : 6 : children 7 8 } { leaf : 7 : 1 } { internal : 8 : children 9 10 } { leaf : 9 : 10 } { leaf : 10 : 19 } { internal : 11 : children 12 17 } { internal : 12 : children 13 14 } { leaf : 13 : 4 } { internal : 14 : children 15 16 } { leaf : 15 : 13 } { leaf : 16 : 22 } { internal : 17 : children 18 19 } { leaf : 18 : 7 } { internal : 19 : children 20 21 } { leaf : 20 : 16 } { leaf : 21 : 25 } { internal : 22 : children 23 28 } { internal : 23 : children 24 25 } { leaf : 24 : 2 } { internal : 25 : children 26 27 } { leaf : 26 : 11 } { leaf : 27 : 20 } { internal : 28 : children 29 34 } { internal : 29 : children 30 31 } { leaf : 30 : 5 } { internal : 31 : children 32 33 } { leaf : 32 : 14 } { leaf : 33 : 23 } { internal : 34 : children 35 36 } { leaf : 35 : 8 } { internal : 36 : children 37 38 } { leaf : 37 : 17 } { leaf : 38 : 26 }',
      ' { internal : 0 : children 1 2 } { leaf : 1 : 24 } { internal : 2 : children 3 20 } { internal : 3 : children 4 9 } { internal : 4 : children 5 6 } { leaf : 5 : 1 } { internal : 6 : children 7 8 } { leaf : 7 : 10 } { leaf : 8 : 19 } { internal : 9 : children 10 15 } { internal : 10 : children 11 12 } { leaf : 11 : 4 } { internal : 12 : children 13 14 } { leaf : 13 : 13 } { leaf : 14 : 22 } { internal : 15 : children 16 17 } { leaf : 16 : 7 } { internal : 17 : children 18 19 } { leaf : 18 : 16 } { leaf : 19 : 25 } { internal : 20 : children 21 26 } { internal : 21 : children 22 23 } { leaf : 22 : 2 } { internal : 23 : children 24 25 } { leaf : 24 : 11 } { leaf : 25 : 20 } { internal : 26 : children 27 32 } { internal : 27 : children 28 29 } { leaf : 28 : 5 } { internal : 29 : children 30 31 } { leaf : 30 : 14 } { leaf : 31 : 23 } { internal : 32 : children 33 34 } { leaf : 33 : 8 } { internal : 34 : children 35 36 } { leaf : 35 : 17 } { leaf : 36 : 26 }',
      ' { internal : 0 : children 1 18 } { internal : 1 : children 2 7 } { internal : 2 : children 3 4 } { leaf : 3 : 1 } { internal : 4 : children 5 6 } { leaf : 5 : 10 } { leaf : 6 : 19 } { internal : 7 : children 8 13 } { internal : 8 : children 9 10 } { leaf : 9 : 4 } { internal : 10 : children 11 12 } { leaf : 11 : 13 } { leaf : 12 : 22 } { internal : 13 : children 14 15 } { leaf : 14 : 7 } { internal : 15 : children 16 17 } { leaf : 16 : 16 } { leaf : 17 : 25 } { internal : 18 : children 19 24 } { internal : 19 : children 20 21 } { leaf : 20 : 2 } { internal : 21 : children 22 23 } { leaf : 22 : 11 } { leaf : 23 : 20 } { internal : 24 : children 25 30 } { internal : 25 : children 26 27 } { leaf : 26 : 5 } { internal : 27 : children 28 29 } { leaf : 28 : 14 } { leaf : 29 : 23 } { internal : 30 : children 31 32 } { leaf : 31 : 8 } { internal : 32 : children 33 34 } { leaf : 33 : 17 } { leaf : 34 : 26 }',
      ' { internal : 0 : children 1 16 } { internal : 1 : children 2 5 } { internal : 2 : children 3 4 } { leaf : 3 : 10 } { leaf : 4 : 19 } { internal : 5 : children 6 11 } { internal : 6 : children 7 8 } { leaf : 7 : 4 } { internal : 8 : children 9 10 } { leaf : 9 : 13 } { leaf : 10 : 22 } { internal : 11 : children 12 13 } { leaf : 12 : 7 } { internal : 13 : children 14 15 } { leaf : 14 : 16 } { leaf : 15 : 25 } { internal : 16 : children 17 22 } { internal : 17 : children 18 19 } { leaf : 18 : 2 } { internal : 19 : children 20 21 } { leaf : 20 : 11 } { leaf : 21 : 20 } { internal : 22 : children 23 28 } { internal : 23 : children 24 25 } { leaf : 24 : 5 } { internal : 25 : children 26 27 } { leaf : 26 : 14 } { leaf : 27 : 23 } { internal : 28 : children 29 30 } { leaf : 29 : 8 } { internal : 30 : children 31 32 } { leaf : 31 : 17 } { leaf : 32 : 26 }',
      ' { internal : 0 : children 1 14 } { internal : 1 : children 2 3 } { leaf : 2 : 19 } { internal : 3 : children 4 9 } { internal : 4 : children 5 6 } { leaf : 5 : 4 } { internal : 6 : children 7 8 } { leaf : 7 : 13 } { leaf : 8 : 22 } { internal : 9 : children 10 11 } { leaf : 10 : 7 } { internal : 11 : children 12 13 } { leaf : 12 : 16 } { leaf : 13 : 25 } { internal : 14 : children 15 20 } { internal : 15 : children 16 17 } { leaf : 16 : 2 } { internal : 17 : children 18 19 } { leaf : 18 : 11 } { leaf : 19 : 20 } { internal : 20 : children 21 26 } { internal : 21 : children 22 23 } { leaf : 22 : 5 } { internal : 23 : children 24 25 } { leaf : 24 : 14 } { leaf : 25 : 23 } { internal : 26 : children 27 28 } { leaf : 27 : 8 } { internal : 28 : children 29 30 } { leaf : 29 : 17 } { leaf : 30 : 26 }',
      ' { internal : 0 : children 1 12 } { internal : 1 : children 2 7 } { internal : 2 : children 3 4 } { leaf : 3 : 4 } { internal : 4 : children 5 6 } { leaf : 5 : 13 } { leaf : 6 : 22 } { internal : 7 : children 8 9 } { leaf : 8 : 7 } { internal : 9 : children 10 11 } { leaf : 10 : 16 } { leaf : 11 : 25 } { internal : 12 : children 13 18 } { internal : 13 : children 14 15 } { leaf : 14 : 2 } { internal : 15 : children 16 17 } { leaf : 16 : 11 } { leaf : 17 : 20 } { internal : 18 : children 19 24 } { internal : 19 : children 20 21 } { leaf : 20 : 5 } { internal : 21 : children 22 23 } { leaf : 22 : 14 } { leaf : 23 : 23 } { internal : 24 : children 25 26 } { leaf : 25 : 8 } { internal : 26 : children 27 28 } { leaf : 27 : 17 } { leaf : 28 : 26 }',
      ' { internal : 0 : children 1 10 } { internal : 1 : children 2 5 } { internal : 2 : children 3 4 } { leaf : 3 : 13 } { leaf : 4 : 22 } { internal : 5 : children 6 7 } { leaf : 6 : 7 } { internal : 7 : children 8 9 } { leaf : 8 : 16 } { leaf : 9 : 25 } { internal : 10 : children 11 16 } { internal : 11 : children 12 13 } { leaf : 12 : 2 } { internal : 13 : children 14 15 } { leaf : 14 : 11 } { leaf : 15 : 20 } { internal : 16 : children 17 22 } { internal : 17 : children 18 19 } { leaf : 18 : 5 } { internal : 19 : children 20 21 } { leaf : 20 : 14 } { leaf : 21 : 23 } { internal : 22 : children 23 24 } { leaf : 23 : 8 } { internal : 24 : children 25 26 } { leaf : 25 : 17 } { leaf : 26 : 26 }',
      ' { internal : 0 : children 1 8 } { internal : 1 : children 2 3 } { leaf : 2 : 22 } { internal : 3 : children 4 5 } { leaf : 4 : 7 } { internal : 5 : children 6 7 } { leaf : 6 : 16 } { leaf : 7 : 25 } { internal : 8 : children 9 14 } { internal : 9 : children 10 11 } { leaf : 10 : 2 } { internal : 11 : children 12 13 } { leaf : 12 : 11 } { leaf : 13 : 20 } { internal : 14 : children 15 20 } { internal : 15 : children 16 17 } { leaf : 16 : 5 } { internal : 17 : children 18 19 } { leaf : 18 : 14 } { leaf : 19 : 23 } { internal : 20 : children 21 22 } { leaf : 21 : 8 } { internal : 22 : children 23 24 } { leaf : 23 : 17 } { leaf : 24 : 26 }',
      ' { internal : 0 : children 1 6 } { internal : 1 : children 2 3 } { leaf : 2 : 7 } { internal : 3 : children 4 5 } { leaf : 4 : 16 } { leaf : 5 : 25 } { internal : 6 : children 7 12 } { internal : 7 : children 8 9 } { leaf : 8 : 2 } { internal : 9 : children 10 11 } { leaf : 10 : 11 } { leaf : 11 : 20 } { internal : 12 : children 13 18 } { internal : 13 : children 14 15 } { leaf : 14 : 5 } { internal : 15 : children 16 17 } { leaf : 16 : 14 } { leaf : 17 : 23 } { internal : 18 : children 19 20 } { leaf : 19 : 8 } { internal : 20 : children 21 22 } { leaf : 21 : 17 } { leaf : 22 : 26 }',
      ' { internal : 0 : children 1 4 } { internal : 1 : children 2 3 } { leaf : 2 : 16 } { leaf : 3 : 25 } { internal : 4 : children 5 10 } { internal : 5 : children 6 7 } { leaf : 6 : 2 } { internal : 7 : children 8 9 } { leaf : 8 : 11 } { leaf : 9 : 20 } { internal : 10 : children 11 16 } { internal : 11 : children 12 13 } { leaf : 12 : 5 } { internal : 13 : children 14 15 } { leaf : 14 : 14 } { leaf : 15 : 23 } { internal : 16 : children 17 18 } { leaf : 17 : 8 } { internal : 18 : children 19 20 } { leaf : 19 : 17 } { leaf : 20 : 26 }',
      ' { internal : 0 : children 1 2 } { leaf : 1 : 25 } { internal : 2 : children 3 8 } { internal : 3 : children 4 5 } { leaf : 4 : 2 } { internal : 5 : children 6 7 } { leaf : 6 : 11 } { leaf : 7 : 20 } { internal : 8 : children 9 14 } { internal : 9 : children 10 11 } { leaf : 10 : 5 } { internal : 11 : children 12 13 } { leaf : 12 : 14 } { leaf : 13 : 23 } { internal : 14 : children 15 16 } { leaf : 15 : 8 } { internal : 16 : children 17 18 } { leaf : 17 : 17 } { leaf : 18 : 26 }',
      ' { internal : 0 : children 1 6 } { internal : 1 : children 2 3 } { leaf : 2 : 2 } { internal : 3 : children 4 5 } { leaf : 4 : 11 } { leaf : 5 : 20 } { internal : 6 : children 7 12 } { internal : 7 : children 8 9 } { leaf : 8 : 5 } { internal : 9 : children 10 11 } { leaf : 10 : 14 } { leaf : 11 : 23 } { internal : 12 : children 13 14 } { leaf : 13 : 8 } { internal : 14 : children 15 16 } { leaf : 15 : 17 } { leaf : 16 : 26 }',
      ' { internal : 0 : children 1 4 } { internal : 1 : children 2 3 } { leaf : 2 : 11 } { leaf : 3 : 20 } { internal : 4 : children 5 10 } { internal : 5 : children 6 7 } { leaf : 6 : 5 } { internal : 7 : children 8 9 } { leaf : 8 : 14 } { leaf : 9 : 23 } { internal : 10 : children 11 12 } { leaf : 11 : 8 } { internal : 12 : children 13 14 } { leaf : 13 : 17 } { leaf : 14 : 26 }',
      ' { internal : 0 : children 1 2 } { leaf : 1 : 20 } { internal : 2 : children 3 8 } { internal : 3 : children 4 5 } { leaf : 4 : 5 } { internal : 5 : children 6 7 } { leaf : 6 : 14 } { leaf : 7 : 23 } { internal : 8 : children 9 10 } { leaf : 9 : 8 } { internal : 10 : children 11 12 } { leaf : 11 : 17 } { leaf : 12 : 26 }',
      ' { internal : 0 : children 1 6 } { internal : 1 : children 2 3 } { leaf : 2 : 5 } { internal : 3 : children 4 5 } { leaf : 4 : 14 } { leaf : 5 : 23 } { internal : 6 : children 7 8 } { leaf : 7 : 8 } { internal : 8 : children 9 10 } { leaf : 9 : 17 } { leaf : 10 : 26 }',
      ' { internal : 0 : children 1 4 } { internal : 1 : children 2 3 } { leaf : 2 : 14 } { leaf : 3 : 23 } { internal : 4 : children 5 6 } { leaf : 5 : 8 } { internal : 6 : children 7 8 } { leaf : 7 : 17 } { leaf : 8 : 26 }',
      ' { internal : 0 : children 1 2 } { leaf : 1 : 23 } { internal : 2 : children 3 4 } { leaf : 3 : 8 } { internal : 4 : children 5 6 } { leaf : 5 : 17 } { leaf : 6 : 26 }',
      ' { internal : 0 : children 1 2 } { leaf : 1 : 8 } { internal : 2 : children 3 4 } { leaf : 3 : 17 } { leaf : 4 : 26 }',
      ' { internal : 0 : children 1 2 } { leaf : 1 : 17 } { leaf : 2 : 26 }',
      ' { leaf : 0 : 26 }',
    ],
    dbvt = Bump.Dbvt.create(),
    vols = makeVolumeGrid( 3 ),
    writer = TestWriter.create();

    strictEqual( typeof dbvt.remove, 'function', 'remove exists' );

    insertAll( dbvt, vols );
    for ( var i = 0; i < 26; i++ ) {
      var leaves = [];

      Bump.Dbvt.extractLeaves( dbvt.m_root, leaves );
      dbvt.remove( leaves[ 0 ] );
      dbvt.write( writer );

      equal( writer.s, expected[ i ], 'correct result after remove ' + i );
    }
    dbvt.remove( dbvt.m_root );
    ok( dbvt.m_root === 0, 'final tree is empty' );

  });

  module( 'Dbvt.updateLeafVolume' );
  test('test skipped', function() {});

  module( 'Dbvt.updateLeafVolumeVelocityMargin' );
  test('test skipped', function() {});

  module( 'Dbvt.updateLeafVolumeVelocity' );
  test('test skipped', function() {});

  module( 'Dbvt.updateLeafVolumeMargin' );
  test('test skipped', function() {});

  module( 'Dbvt.collideTT' );
  test('test skipped', function() {});

  module( 'Dbvt.collideTTpersistenStack' );
  test('test skipped', function() {});

  module( 'Dbvt.collideTV' );
  test('test skipped', function() {});

  module( 'Dbvt.rayTestInternal' );
  test('test skipped', function() {});

  module( 'Dbvt.benchmark' );
  test('test skipped', function() {});

  module( 'Dbvt.rayTest' );
  test('test skipped', function() {});

  module( 'Dbvt.collideKDOP' );
  test('test skipped', function() {});

  module( 'Dbvt.collideOCL' );
  test('test skipped', function() {});

  module( 'Dbvt.collideTU' );
  test('test skipped', function() {});

  module( 'Dbvt.allocate' );
  test('test skipped', function() {});
})();
