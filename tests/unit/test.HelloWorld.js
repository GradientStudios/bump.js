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

    epsilon = Math.pow( 2, -52 );
    shapeName = 'CompoundShape';
    switch ( i ) {
    case 102:
      checkOrigin( Bump.Vector3.create( -2.85122222222222232446, -4.87777777777776933021, -0.29755555555555540659 ) );
      checkBasis( Bump.Matrix3x3.create( 1,  0,  0,
                                         0,  1,  0,
                                         0,  0,  1 ) );
      break;

    case 103:
      checkOrigin( Bump.Vector3.create( -2.84833333333333360571, -5.16666666666665808094, -0.30333333333333317716 ) );
      checkBasis( Bump.Matrix3x3.create( 1, 0, 0,
                                         0, 1, 0,
                                         0, 0, 1 ) );
      break;

    case 104:
      checkOrigin( Bump.Vector3.create( -2.84541666666666692720, -5.45833333333332415549, -0.30916666666666653418 ) );
      checkBasis( Bump.Matrix3x3.create( 1, 0, 0,
                                         0, 1, 0,
                                         0, 0, 1 ) );
      break;

    case 105:
      checkOrigin( Bump.Vector3.create( -2.84247222222222228893, -5.75277777777776844204, -0.31505555555555542213 ) );
      checkBasis( Bump.Matrix3x3.create( 1, 0, 0,
                                         0, 1, 0,
                                         0, 0, 1 ) );
      break;

    case 106:
      checkOrigin( Bump.Vector3.create( -2.84246908225881833587, -5.70222216621600708208, -0.31506183548236371683 ) );
      checkBasis( Bump.Matrix3x3.create(  0.99999999994899690936,  0.00000207969179847520,  0.00000988337152927382,
                                         -0.00000207978784761442,  0.99999999995061494840,  0.00000971825611956491,
                                         -0.00000988335131780818, -0.00000971827667438525,  0.99999999990393728666 ) );
      break;

    case 107:
      checkOrigin( Bump.Vector3.create( -2.84243816451763642306, -5.65444433243202304595, -0.31512367096472759798 ) );
      checkBasis( Bump.Matrix3x3.create(  0.99999999979598774846,  0.00000415928754740264,  0.00001976676326807168,
                                         -0.00000415967174395948,  0.99999999980246001563,  0.00001943649168240033,
                                         -0.00001976668242220913, -0.00001943657390168168,  0.99999999961574892460 ) );
      break;

    case 108:
      checkOrigin( Bump.Vector3.create( -2.84237946899867655048, -5.60944427642581722182, -0.31524106200264701005 ) );
      checkBasis( Bump.Matrix3x3.create(  0.99999999954097229526,  0.00000623878724637375,  0.00002965017521445197,
                                         -0.00000623965168862659,  0.99999999955553486863,  0.00002915470668659708,
                                         -0.00002964999331126125, -0.00002915489167998011,  0.99999999913543513586 ) );
      break;

    case 109:
      checkOrigin( Bump.Vector3.create( -2.84229299570193916225, -5.56722199819738872151, -0.31541400859612200858 ) );
      checkBasis( Bump.Matrix3x3.create(  0.99999999918395077181,  0.00000831819089498004,  0.00003953360736647310,
                                         -0.00000831972768120713,  0.99999999920983984047,  0.00003887290113024603,
                                         -0.00003953328398302298, -0.00003887323000737138,  0.99999999846299569839 ) );
      break;

    case 110:
      checkOrigin( Bump.Vector3.create( -2.84217874462742381425, -5.52777749774673843319, -0.31564251074515253803 ) );
      checkBasis( Bump.Matrix3x3.create(  0.99999999872492306707,  0.00001039749849281300,  0.00004941705972219346,
                                         -0.00001039989972129247,  0.99999999876537470911,  0.00004859107501143804,
                                         -0.00004941655443555271, -0.00004859158888194632,  0.99999999759843083424 ) );
      break;

    case 111:
      checkOrigin( Bump.Vector3.create( -2.84203671577513095059, -5.49111077507386546870, -0.31592656844973865393 ) );
      checkBasis( Bump.Matrix3x3.create(  0.99999999816388929208,  0.00001247671003946415,  0.00005930053227967143,
                                         -0.00001248016780847395,  0.99999999822213969658,  0.00005830922832826393,
                                         -0.00005929980466690889, -0.00005830996830179572,  0.99999999654174032138 ) );
      break;

    case 112:
      checkOrigin( Bump.Vector3.create( -2.84186690914506012717, -5.45722183017877071620, -0.31626618170988030077 ) );
      checkBasis( Bump.Matrix3x3.create(  0.99999999750084933581,  0.00001455582553452501,  0.00006918402503696540,
                                         -0.00001456053194234291,  0.99999999758013446982,  0.00006802736107881460,
                                         -0.00006918303467514992, -0.00006802836826501043,  0.99999999529292438183 ) );
      break;

    case 113:
      checkOrigin( Bump.Vector3.create( -2.84166932473721134400, -5.42611066306145328753, -0.31666135052557747853 ) );
      checkBasis( Bump.Matrix3x3.create(  0.99999999673580319826,  0.00001663484497758716,  0.00007906753799213376,
                                         -0.00001664099212249066,  0.99999999683935936190,  0.00007774547326118090,
                                         -0.00007906624445833429, -0.00007774678876968124,  0.99999999385198290458 ) );
      break;

    case 114:
      checkOrigin( Bump.Vector3.create( -2.84144396255158504516, -5.39777727372191407085, -0.31711207489683024274 ) );
      checkBasis( Bump.Matrix3x3.create(  0.99999999586875087942,  0.00001871376836824216,  0.00008895107114323485,
                                         -0.00001872154834850849,  0.99999999599981426179,  0.00008746356487345369,
                                         -0.00008894943401452033, -0.00008746522981389897,  0.99999999221891588963 ) );
      break;

    case 115:
      checkOrigin( Bump.Vector3.create( -2.84119082258818078657, -5.37222166216015217799, -0.31761835482363853789 ) );
      checkBasis( Bump.Matrix3x3.create(  0.99999999489969249034,  0.00002079259570608160,  0.00009883462448832709,
                                         -0.00002080220061998766,  0.99999999506149905848,  0.00009718163591372388,
                                         -0.00009883260334176659, -0.00009718369139575444,  0.99999999039372322596 ) );
      break;

    case 116:
      checkOrigin( Bump.Vector3.create( -2.84090990484699901231, -5.34944382837616849713, -0.31818019030600241948 ) );
      checkBasis( Bump.Matrix3x3.create(  0.99999999382862791997,  0.00002287132699069710,  0.00010871819802546880,
                                         -0.00002288294893651944,  0.99999999402441386298,  0.00010689968638008225,
                                         -0.00010871575243813145, -0.00010690217351333841,  0.99999998837640513560 ) );
      break;

    case 117:
      checkOrigin( Bump.Vector3.create( -2.84060120932803927829, -5.32944377236996214009, -0.31879758134392183200 ) );
      checkBasis( Bump.Matrix3x3.create(  0.99999999265555716832,  0.00002494996222168032,  0.00011860179175271839,
                                         -0.00002496379329769508,  0.99999999288855856427,  0.00011661771627061983,
                                         -0.00011859888130167337, -0.00011662067616474173,  0.99999998616696150755 ) );
      break;

    case 118:
      checkOrigin( Bump.Vector3.create( -2.84026473603130158452, -5.31222149414153399505, -0.31947052793739683096 ) );
      checkBasis( Bump.Matrix3x3.create(  0.99999999138048023539,  0.00002702850139862286,  0.00012848540566813416,
                                         -0.00002704473370310577,  0.99999999165393338441,  0.00012633572558342740,
                                         -0.00012848198993045080, -0.00012633919934805512,  0.99999998376539234179 ) );
      break;

    case 119:
      checkOrigin( Bump.Vector3.create( -2.83990048495678637508, -5.29777699369088317383, -0.32019903008642736086 ) );
      checkBasis( Bump.Matrix3x3.create(  0.99999999000339723221,  0.00002910694452111642,  0.00013836903976977458,
                                         -0.00002912577015234271,  0.99999999032053810133,  0.00013605371431659583,
                                         -0.00013836507832252221, -0.00013605774306136944,  0.99999998117169763834 ) );
      break;

    case 120:
      checkOrigin( Bump.Vector3.create( -2.83950845610449320588, -5.28611027101801056460, -0.32098308779101347721 ) );
      checkBasis( Bump.Matrix3x3.create(  0.99999998852430804774,  0.00003118529158875268,  0.00014825269405569787,
                                         -0.00003120690264499709,  0.99999998888837282607,  0.00014577168246821611,
                                         -0.00014824814647594603, -0.00014577630730277542,  0.99999997838587739718 ) );
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
