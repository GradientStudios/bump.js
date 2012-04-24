module( 'HelloWorld' );

test( 'basic', function() {
  var collisionConfiguration = Bump.DefaultCollisionConfiguration.create();
  ok( collisionConfiguration instanceof Bump.DefaultCollisionConfiguration.prototype.constructor );

  var dispatcher = Bump.CollisionDispatcher.create( collisionConfiguration );
  ok( dispatcher instanceof Bump.CollisionDispatcher.prototype.constructor );

  var overlappingPairCache = Bump.DbvtBroadphase.create();
  ok( overlappingPairCache instanceof Bump.DbvtBroadphase.prototype.constructor );

  var solver = Bump.SequentialImpulseConstraintSolver.create();
  ok( solver instanceof Bump.SequentialImpulseConstraintSolver.prototype.constructor );

  var dynamicsWorld = Bump.DiscreteDynamicsWorld.create( dispatcher, overlappingPairCache, solver, collisionConfiguration );
  ok( dynamicsWorld instanceof Bump.DiscreteDynamicsWorld.prototype.constructor );

  dynamicsWorld.setGravity( Bump.Vector3.create( 0.1, -10, -0.2 ) );

  var groundShape = Bump.BoxShape.create( Bump.Vector3.create( 50, 50, 50 ) );
  ok( groundShape instanceof Bump.BoxShape.prototype.constructor );

  var collisionShapes = [ groundShape ];

  var groundTransform = Bump.Transform.create();
  ok( groundTransform instanceof Bump.Transform.prototype.constructor );
  groundTransform.setIdentity();
  groundTransform.setOrigin( Bump.Vector3.create( 0, -56, 0 ) );

  var mass = 0;
  var isDynamic = ( mass !== 0 );
  var localInertia = Bump.Vector3.create();

  if ( isDynamic ) {
    groundShape.calculateLocalInertia( mass, localInertia );
  }

  var myMotionState = Bump.DefaultMotionState.create( groundTransform );
  ok( myMotionState instanceof Bump.DefaultMotionState.prototype.constructor );

  var rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create( mass, myMotionState, groundShape, localInertia );
  ok( rbInfo instanceof Bump.RigidBody.RigidBodyConstructionInfo.prototype.constructor );

  var body = Bump.RigidBody.create( rbInfo );
  ok( body instanceof Bump.RigidBody.prototype.constructor );

  dynamicsWorld.addRigidBody( body );

  // create a dynamic rigidbody
  (function() {
    var colShape = Bump.BoxShape.create( Bump.Vector3.create( 1, 1, 1 ) );
    ok( colShape instanceof Bump.BoxShape.prototype.constructor );
    // var colShape = Bump.SphereShape.create( 1 );
    // ok( colShape instanceof Bump.SphereShape.prototype.constructor );

    collisionShapes.push( colShape );

    var startTransform = Bump.Transform.create();
    startTransform.setIdentity();

    mass = 1;
    isDynamic = ( mass !== 0 );
    localInertia = Bump.Vector3.create();

    if ( isDynamic ) {
      colShape.calculateLocalInertia( mass, localInertia );
    }

    startTransform.setOrigin( Bump.Vector3.create( 2, 10, 0 ) );

    // using motionstate is recommended, it provides interpolation capabilities, and only synchronizes 'active' objects
    myMotionState = Bump.DefaultMotionState.create( startTransform );
    rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create( mass, myMotionState, colShape, localInertia );
    body = Bump.RigidBody.create( rbInfo );

    dynamicsWorld.addRigidBody(body);
  })();

  // create a dynamic rigidbody
  (function() {
    var colShape = Bump.CompoundShape.create();
    ok( colShape instanceof Bump.CompoundShape.prototype.constructor );

    collisionShapes.push( colShape );

    var aShape = Bump.BoxShape.create( Bump.Vector3.create( 0.5, 0.5, 0.5 ) );
    var bShape = Bump.BoxShape.create( Bump.Vector3.create( 0.5, 0.5, 0.5 ) );
    collisionShapes.push( aShape );
    collisionShapes.push( bShape );

    var a = Bump.Transform.getIdentity();
    var b = Bump.Transform.getIdentity();
    a.setOrigin( Bump.Vector3.create( 0, 0, 0 ) );
    b.setOrigin( Bump.Vector3.create( 0.75, 0.25, -0.5 ) );
    colShape.addChildShape( a, aShape );
    colShape.addChildShape( b, bShape );

    var startTransform = Bump.Transform.create();
    startTransform.setIdentity();

    mass = 1;
    isDynamic = ( mass !== 0 );
    localInertia = Bump.Vector3.create();

    if ( isDynamic ) {
      colShape.calculateLocalInertia( mass, localInertia );
    }

    startTransform.setOrigin( Bump.Vector3.create( -3, 10, 0 ) );

    // using motionstate is recommended, it provides interpolation capabilities, and only synchronizes 'active' objects
    myMotionState = Bump.DefaultMotionState.create( startTransform );
    rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create( mass, myMotionState, colShape, localInertia );
    body = Bump.RigidBody.create( rbInfo );

    dynamicsWorld.addRigidBody(body);
  })();

  /// Do some simulation
  var trans = Bump.Transform.create();

  var checkOrigin = function( expected ) {
    return epsilonNumberCheck( trans.origin, expected, epsilon, shapeName + ': Frame ' + i );
  };

  var checkBasis = function( expected ) {
    return epsilonNumberCheck( trans.basis, expected, epsilon, shapeName + ': Frame ' + i );
  };

  for( var i = 0; i < 1000; i++ ) {
    // Step simulation
    dynamicsWorld.stepSimulation( 1 / 60, 10 );

    // Get BoxShape transform
    dynamicsWorld.getCollisionObjectArray()[ 1 ].getMotionState().getWorldTransform( trans );

    var epsilon = Math.pow( 2, -52 );
    var shapeName = 'BoxShape';

    switch( i ) {
    case 102:
      checkOrigin( Bump.Vector3.create(  2.14877777777777767554, -4.87777777777776933021, -0.29755555555555540659 ) );
      checkBasis( Bump.Matrix3x3.create( 1, 0, 0,
                                         0, 1, 0,
                                         0, 0, 1 ) );
      break;

    case 103:
      checkOrigin( Bump.Vector3.create(  2.15166666666666639429, -5.16666666666665808094, -0.30333333333333317716 ) );
      checkBasis( Bump.Matrix3x3.create( 1, 0, 0,
                                         0, 1, 0,
                                         0, 0, 1 ) );
      break;

    case 104:
      checkOrigin( Bump.Vector3.create(  2.15168070891395624145, -5.13333995838584389304, -0.30336141782791259391 ) );
      checkBasis( Bump.Matrix3x3.create(  0.99999999981852394360,  0.00000740611370468836,  0.00001755282526864832,
                                         -0.00000740681894881986,  0.99999999916540727174,  0.00004017865828643663,
                                         -0.00001755252768628709, -0.00004017878828974397,  0.99999999903878689089 ) );
      break;

    case 105:
      checkOrigin( Bump.Vector3.create(  2.15172252893902360427, -5.10279102788280702896, -0.30344505787804759711 ) );
      checkBasis( Bump.Matrix3x3.create(  0.99999999927409566336,  0.00001481152215060126,  0.00003510594808495101,
                                         -0.00001481434312712587,  0.99999999666162886491,  0.00008035718649012144,
                                         -0.00003510475775550667, -0.00008035770650335054,  0.99999999615514745255 ) );
      break;

    case 106:
      checkOrigin( Bump.Vector3.create(  2.15179212674186892684, -5.07501987515754837688, -0.30358425348373813124 ) );
      checkBasis( Bump.Matrix3x3.create(  0.99999999836671515929,  0.00002221622532309608,  0.00005265936841420056,
                                         -0.00002222257252027123,  0.99999999248866500157,  0.00012053558453161003,
                                         -0.00005265669017295299, -0.00012053675456137454,  0.99999999134908190701 ) );
      break;

    case 107:
      checkOrigin(  2.15188950232249176509, -5.05002650021006704861, -0.30377900464498425182 );
      checkBasis( Bump.Matrix3x3.create(  0.99999999709638243139,  0.00002962022320753167,  0.00007021308622168891,
                                         -0.00002963150711360781,  0.99999998664651568170,  0.00016071385233145847,
                                         -0.00007020832490392096, -0.00016071593238437077,  0.99999998462059003224 ) );
      break;

    case 108:
      checkOrigin(  2.15201465568089256308, -5.02781090304036393235, -0.30402931136178590332 );
      checkBasis( Bump.Matrix3x3.create(  0.99999999546309759069,  0.00003702351578926822,  0.00008776710147270745,
                                         -0.00003704114689248605,  0.99999997913518068327,  0.00020089198981022296,
                                         -0.00008775966191370605, -0.00020089523989289356,  0.99999997596967182822 ) );
      break;

    case 109:
      checkOrigin(  2.15216758681707132084, -5.00837308364843813990, -0.30433517363414314127 );
      checkBasis( Bump.Matrix3x3.create(  0.99999999346686052615,  0.00004442610305366733,  0.00010532141413254688,
                                         -0.00004445149184225499,  0.99999996995466033933,  0.00024106999688845994,
                                         -0.00010531070116760429, -0.00024107467700749716,  0.99999996539632751702 ) );
      break;

    case 110:
      checkOrigin(  2.15234829573102759426, -4.99171304203429055946, -0.30469659146205591016 );
      checkBasis( Bump.Matrix3x3.create(  0.99999999110767123778,  0.00005182798498609200,  0.00012287602416649740,
                                         -0.00005186254194826229,  0.99999995910495431684,  0.00028124787348672624,
                                         -0.00012286144263091235, -0.00028125424364873545,  0.99999995290055709862 ) );
      break;

    case 111:
      checkOrigin(  2.15255678242276182743, -4.97783077819792030283, -0.30511356484552426549 );
      checkBasis( Bump.Matrix3x3.create(  0.99999998838552983660,  0.00005922916157190665,  0.00014043093153984866,
                                         -0.00005927429719585425,  0.99999994658606294884,  0.00032142561952557892,
                                         -0.00014041188626892750, -0.00032143393973716220,  0.99999993848236035099 ) );
      break;

    case 112:
      checkOrigin(  2.15279304689227357628, -4.96672629213932825820, -0.30558609378454815175 );
      checkBasis( Bump.Matrix3x3.create(  0.99999998530043632261,  0.00006662963279647700,  0.00015798613621788952,
                                         -0.00006668675757037566,  0.99999993239798612432,  0.00036160323492557492,
                                         -0.00015796203204694747, -0.00036161376519333057,  0.99999992214173760718 ) );
      break;

    case 113:
      checkOrigin(  2.15305708913956328487, -4.95839958385851353739, -0.30611417827912756895 );
      checkBasis( Bump.Matrix3x3.create(  0.99999998185239058479,  0.00007402939864517028,  0.00017554163816590852,
                                         -0.00007409992305717007,  0.99999991654072384328,  0.00040178071960727223,
                                         -0.00017551187993027070, -0.00040179371993779407,  0.99999990387868864516 ) );
      break;

    case 114:
      checkOrigin(  2.15334890916463095323, -4.95285065335547702858, -0.30669781832926257259 );
      checkBasis( Bump.Matrix3x3.create(  0.99999997804139262314,  0.00008142845910335510,  0.00019309743734919344,
                                         -0.00008151379364157954,  0.99999989901427621675,  0.00044195807349122829,
                                         -0.00019306142988419632, -0.00044197380389110529,  0.99999988369321368697 ) );
      break;

    case 115:
      checkOrigin(  2.15366850696747613725, -4.95007950063021784359, -0.30733701393495310716 );
      checkBasis( Bump.Matrix3x3.create(  0.99999997386744254868,  0.00008882681415640140,  0.00021065353373303161,
                                         -0.00008892836930894482,  0.99999987981864324471,  0.00048213529649800157,
                                         -0.00021061068187402384, -0.00048215401697381725,  0.99999986158531273261 ) );
      break;

    case 116:
      checkOrigin(  2.15401588254809928102, -4.95008612568273687060, -0.30803176509619922818 );
      checkBasis( Bump.Matrix3x3.create(  0.99999996933054036141,  0.00009622446378968052,  0.00022820992728270938,
                                         -0.00009634365004460507,  0.99999985895382503820,  0.00052231238854814985,
                                         -0.00022815963586505329, -0.00052233435910648191,  0.99999983755498578208 ) );
      break;

    case 117:
      checkOrigin(  2.15439103590649994047, -4.95287052851303410961, -0.30878207181300088013 );
      checkBasis( Bump.Matrix3x3.create(  0.99999996443068606133,  0.00010362140798856522,  0.00024576661796351312,
                                         -0.00010375963583389826,  0.99999983641982137517,  0.00056248934956223203,
                                         -0.00024570829182258565, -0.00056251483020965175,  0.99999981160223283538 ) );
      break;

    case 118:
      checkOrigin(  2.15479396704267855966, -4.95843270912110867243, -0.30958793408535811853 );
      checkBasis( Bump.Matrix3x3.create(  0.99999995916787953742,  0.00011101764673842968,  0.00026332360574072812,
                                         -0.00011117632666216090,  0.99999981221663258868,  0.00060266617946080686,
                                         -0.00026325664971192214, -0.00060269543020387848,  0.99999978372705400353 ) );
      break;

    case 119:
      checkOrigin(  2.15522467595663513862, -4.96677266750696144726, -0.31044935191327088786 );
      checkBasis( Bump.Matrix3x3.create(  0.99999995354212101173,  0.00011841318002464942,  0.00028088089057963945,
                                         -0.00011859372251472807,  0.99999978634425867874,  0.00064284287816443323,
                                         -0.00028080470949836490, -0.00064287615900971362,  0.99999975392944939756 ) );
      break;

    case 120:
      checkOrigin(  2.15568316264836923324, -4.97789040367059154590, -0.31136632529673924363 );
      checkBasis( Bump.Matrix3x3.create(  0.99999994755341026220,  0.00012580800783260139,  0.00029843847244553104,
                                         -0.00012601182337693348,  0.99999975880269953432,  0.00068301944559367056,
                                         -0.00029835247114721612, -0.00068305701654770856,  0.99999972220941901746 ) );
      break;
    }

    // Get CompoundShape transform
    dynamicsWorld.getCollisionObjectArray()[ 2 ].getMotionState().getWorldTransform( trans );

    epsilon = Math.pow( 2, -16 );
    shapeName = 'CompoundShape';
    switch ( i ) {
    case 102:
      checkOrigin( Bump.Vector3.create( -2.8512222222, -4.8777777778, -0.2975555556 ) );
      checkBasis( Bump.Matrix3x3.create( 1,  0,  0,
                                         0,  1,  0,
                                         0,  0,  1 ) );
      break;

    case 103:
      checkOrigin( Bump.Vector3.create( -2.8483333333, -5.1666666667, -0.3033333333 ) );
      checkBasis( Bump.Matrix3x3.create( 1, 0, 0,
                                         0, 1, 0,
                                         0, 0, 1 ) );
      break;

    case 104:
      checkOrigin( Bump.Vector3.create( -2.8454166667, -5.4583333333, -0.3091666667 ) );
      checkBasis( Bump.Matrix3x3.create( 1, 0, 0,
                                         0, 1, 0,
                                         0, 0, 1 ) );
      break;

    case 105:
      checkOrigin( Bump.Vector3.create( -2.8424722222, -5.7527777778, -0.3150555556 ) );
      checkBasis( Bump.Matrix3x3.create( 1, 0, 0,
                                         0, 1, 0,
                                         0, 0, 1 ) );
      break;

    case 106:
      checkOrigin( Bump.Vector3.create( -2.8424690823, -5.7022221662, -0.3150618355 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999999,  0.0000020797,  0.0000098834,
                                         -0.0000020798,  1.0000000000,  0.0000097183,
                                         -0.0000098834, -0.0000097183,  0.9999999999 ) );
      break;

    case 107:
      checkOrigin( Bump.Vector3.create( -2.8424381645, -5.6544443324, -0.3151236710 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999998,  0.0000041593,  0.0000197668,
                                         -0.0000041597,  0.9999999998,  0.0000194365,
                                         -0.0000197667, -0.0000194366,  0.9999999996 ) );
      break;

    case 108:
      checkOrigin( Bump.Vector3.create( -2.8423794690, -5.6094442764, -0.3152410620 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999995,  0.0000062388,  0.0000296502,
                                         -0.0000062397,  0.9999999996,  0.0000291547,
                                         -0.0000296500, -0.0000291549,  0.9999999991 ) );
      break;

    case 109:
      checkOrigin( Bump.Vector3.create( -2.8422929957, -5.5672219982, -0.3154140086 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999992,  0.0000083182,  0.0000395336,
                                         -0.0000083197,  0.9999999992,  0.0000388729,
                                         -0.0000395333, -0.0000388732,  0.9999999985 ) );
      break;

    case 110:
      checkOrigin( Bump.Vector3.create( -2.8421787446, -5.5277774977, -0.3156425107 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999987,  0.0000103975,  0.0000494171,
                                         -0.0000103999,  0.9999999988,  0.0000485911,
                                         -0.0000494166, -0.0000485916,  0.9999999976 ) );
      break;

    case 111:
      checkOrigin( Bump.Vector3.create( -2.8420367158, -5.4911107751, -0.3159265684 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999982,  0.0000124767,  0.0000593005,
                                         -0.0000124802,  0.9999999982,  0.0000583092,
                                         -0.0000592998, -0.0000583100,  0.9999999965 ) );
      break;

    case 112:
      checkOrigin( Bump.Vector3.create( -2.8418669091, -5.4572218302, -0.3162661817 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999975,  0.0000145558,  0.0000691840,
                                         -0.0000145605,  0.9999999976,  0.0000680274,
                                         -0.0000691830, -0.0000680284,  0.9999999953 ) );
      break;

    case 113:
      checkOrigin( Bump.Vector3.create( -2.8416693247, -5.4261106631, -0.3166613505 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999967,  0.0000166348,  0.0000790675,
                                         -0.0000166410,  0.9999999968,  0.0000777455,
                                         -0.0000790662, -0.0000777468,  0.9999999939 ) );
      break;

    case 114:
      checkOrigin( Bump.Vector3.create( -2.8414439626, -5.3977772737, -0.3171120749 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999959,  0.0000187138,  0.0000889511,
                                         -0.0000187215,  0.9999999960,  0.0000874636,
                                         -0.0000889494, -0.0000874652,  0.9999999922 ) );
      break;

    case 115:
      checkOrigin( Bump.Vector3.create( -2.8411908226, -5.3722216622, -0.3176183548 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999949,  0.0000207926,  0.0000988346,
                                         -0.0000208022,  0.9999999951,  0.0000971816,
                                         -0.0000988326, -0.0000971837,  0.9999999904 ) );
      break;

    case 116:
      checkOrigin( Bump.Vector3.create( -2.8409099048, -5.3494438284, -0.3181801903 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999938,  0.0000228713,  0.0001087182,
                                         -0.0000228829,  0.9999999940,  0.0001068997,
                                         -0.0001087158, -0.0001069022,  0.9999999884 ) );
      break;

    case 117:
      checkOrigin( Bump.Vector3.create( -2.8406012093, -5.3294437724, -0.3187975813 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999927,  0.0000249500,  0.0001186018,
                                         -0.0000249638,  0.9999999929,  0.0001166177,
                                         -0.0001185989, -0.0001166207,  0.9999999862 ) );
      break;

    case 118:
      checkOrigin( Bump.Vector3.create( -2.8402647360, -5.3122214941, -0.3194705279 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999914,  0.0000270285,  0.0001284854,
                                         -0.0000270447,  0.9999999917,  0.0001263357,
                                         -0.0001284820, -0.0001263392,  0.9999999838 ) );
      break;

    case 119:
      checkOrigin( Bump.Vector3.create( -2.8399004850, -5.2977769937, -0.3201990301 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999900,  0.0000291069,  0.0001383690,
                                         -0.0000291258,  0.9999999903,  0.0001360537,
                                         -0.0001383651, -0.0001360577,  0.9999999812 ) );
      break;

    case 120:
      checkOrigin( Bump.Vector3.create( -2.8395084561, -5.2861102710, -0.3209830878 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999885,  0.0000311853,  0.0001482527,
                                         -0.0000312069,  0.9999999889,  0.0001457717,
                                         -0.0001482481, -0.0001457763,  0.9999999784 ) );
      break;
    }

    // // Print positions of all objects
    // for( var j = dynamicsWorld.getNumCollisionObjects() - 1; j >= 0; j-- ) {
    //   var obj = dynamicsWorld.getCollisionObjectArray()[ j ];
    //   body = Bump.RigidBody.upcast( obj );
    //   if( body && body.getMotionState() ) {
    //     body.getMotionState().getWorldTransform( trans );

    //     var precision = 20;
    //     console.log( 'world pos = ' + trans.getOrigin().x.toFixed( precision ) + ' ' +
    //                  trans.getOrigin().y.toFixed( precision ) + ' ' +
    //                  trans.getOrigin().z.toFixed( precision ) );
    //   }
    // }

  }

  strictEqual( dynamicsWorld.getNumCollisionObjects(), 3 );
  dynamicsWorld.getCollisionObjectArray()[0].getMotionState().getWorldTransform( trans );
  deepEqual( trans.origin, Bump.Vector3.create( 0, -56, 0 ) );

  dynamicsWorld.getCollisionObjectArray()[1].getMotionState().getWorldTransform( trans );
  // result after removing unnecessary type-casting from bullet's HelloWorld:
  epsilonNumberCheck(
    trans.origin,
    Bump.Vector3.create(
       2.15648442570698284371,
      -5.00000057541053610777,
      -0.31261228615625574756
    ),
    Math.pow( 2, -12 )
  );

  ok( true, 'finish' );

});
