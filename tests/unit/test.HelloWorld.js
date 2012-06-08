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
    deepEqual( trans.origin, expected, shapeName + '.origin: Frame ' + i );
  };

  var checkBasis = function( expected ) {
    deepEqual( trans.basis, expected, shapeName + '.basis: Frame ' + i );
  };

  for( var i = 0; i < 250; i++ ) {
    // Step simulation
    dynamicsWorld.stepSimulation( 1 / 60, 10 );

    // Get BoxShape transform
    dynamicsWorld.getCollisionObjectArray()[ 1 ].getMotionState().getWorldTransform( trans );

    var shapeName = 'BoxShape';
    switch( i ) {
    case 100:
      checkOrigin( Bump.Vector3.create(  2.143083333333333229120, -4.308333333333325576575, -0.286166666666666513752 ) );
      checkBasis( Bump.Matrix3x3.create( 1,  0,  0,
                                         0,  1,  0,
                                         0,  0,  1 ) );
      break;

    case 101:
      checkOrigin( Bump.Vector3.create(  2.145916666666666472452, -4.591666666666658791485, -0.291833333333333166948 ) );
      checkBasis( Bump.Matrix3x3.create( 1,  0,  0,
                                         0,  1,  0,
                                         0,  0,  1 ) );
      break;

    case 102:
      checkOrigin( Bump.Vector3.create(  2.148777777777777675539, -4.877777777777769330214, -0.297555555555555406588 ) );
      checkBasis( Bump.Matrix3x3.create( 1,  0,  0,
                                         0,  1,  0,
                                         0,  0,  1 ) );
      break;

    case 103:
      checkOrigin( Bump.Vector3.create(  2.151666666666666394292, -5.166666666666658080942, -0.303333333333333177162 ) );
      checkBasis( Bump.Matrix3x3.create( 1,  0,  0,
                                         0,  1,  0,
                                         0,  0,  1 ) );
      break;

    case 104:
      checkOrigin( Bump.Vector3.create(  2.151680708913956241446, -5.133339958385843893041, -0.303361417827912593914 ) );
      checkBasis( Bump.Matrix3x3.create(  0.999999999818523943595,  0.000007406113704688362,  0.000017552825268648321,
                                         -0.000007406818948819865,  0.999999999165407271740,  0.000040178658286436633,
                                         -0.000017552527686287089, -0.000040178788289743974,  0.999999999038786890893 ) );
      break;

    case 105:
      checkOrigin( Bump.Vector3.create(  2.151722528939023604266, -5.102791027882807028959, -0.303445057878047597111 ) );
      checkBasis( Bump.Matrix3x3.create(  0.999999999274095663360,  0.000014811522150601258,  0.000035105948084951011,
                                         -0.000014814343127125872,  0.999999996661628864913,  0.000080357186490121444,
                                         -0.000035104757755506665, -0.000080357706503350536,  0.999999996155147452548 ) );
      break;

    case 106:
      checkOrigin( Bump.Vector3.create(  2.151792126741868926842, -5.075019875157548376876, -0.303584253483738131241 ) );
      checkBasis( Bump.Matrix3x3.create(  0.999999998366715159293,  0.000022216225323096080,  0.000052659368414200560,
                                         -0.000022222572520271231,  0.999999992488665001567,  0.000120535584531610029,
                                         -0.000052656690172952994, -0.000120536754561374537,  0.999999991349081907011 ) );
      break;

    case 107:
      checkOrigin( Bump.Vector3.create(  2.151889502322491765085, -5.050026500210067048613, -0.303779004644984251815 ) );
      checkBasis( Bump.Matrix3x3.create(  0.999999997096382431394,  0.000029620223207531669,  0.000070213086221688914,
                                         -0.000029631507113607811,  0.999999986646515681699,  0.000160713852331458468,
                                         -0.000070208324903920963, -0.000160715932384370770,  0.999999984620590032236 ) );
      break;

    case 108:
      checkOrigin( Bump.Vector3.create(  2.152014655680892563083, -5.027810903040363932348, -0.304029311361785903323 ) );
      checkBasis( Bump.Matrix3x3.create(  0.999999995463097590687,  0.000037023515789268217,  0.000087767101472707449,
                                         -0.000037041146892486049,  0.999999979135180683265,  0.000200891989810222959,
                                         -0.000087759661913706054, -0.000200895239892893561,  0.999999975969671828224 ) );
      break;

    case 109:
      checkOrigin( Bump.Vector3.create(  2.152167586817071320837, -5.008373083648438139903, -0.304335173634143141275 ) );
      checkBasis( Bump.Matrix3x3.create(  0.999999993466860526148,  0.000044426103053667330,  0.000105321414132546876,
                                         -0.000044451491842254985,  0.999999969954660339333,  0.000241069996888459943,
                                         -0.000105310701167604290, -0.000241074677007497158,  0.999999965396327517020 ) );
      break;

    case 110:
      checkOrigin( Bump.Vector3.create(  2.152348295731027594258, -4.991713042034290559457, -0.304696591462055910160 ) );
      checkBasis( Bump.Matrix3x3.create(  0.999999991107671237778,  0.000051827984986092002,  0.000122876024166497397,
                                         -0.000051862541948262294,  0.999999959104954316835,  0.000281247873486726240,
                                         -0.000122861442630912352, -0.000281254243648735452,  0.999999952900557098623 ) );
      break;

    case 111:
      checkOrigin( Bump.Vector3.create(  2.152556782422761827434, -4.977830778197920302830, -0.305113564845524265490 ) );
      checkBasis( Bump.Matrix3x3.create(  0.999999988385529836599,  0.000059229161571906650,  0.000140430931539848659,
                                         -0.000059274297195854246,  0.999999946586062948839,  0.000321425619525578916,
                                         -0.000140411886268927504, -0.000321433939737162202,  0.999999938482360350989 ) );
      break;

    case 112:
      checkOrigin( Bump.Vector3.create(  2.152793046892273576276, -4.966726292139328258202, -0.305586093784548151753 ) );
      checkBasis( Bump.Matrix3x3.create(  0.999999985300436322611,  0.000066629632796477004,  0.000157986136217889522,
                                         -0.000066686757570375658,  0.999999932397986124322,  0.000361603234925574925,
                                         -0.000157962032046947469, -0.000361613765193330569,  0.999999922141737607184 ) );
      break;

    case 113:
      checkOrigin( Bump.Vector3.create(  2.153057089139563284874, -4.958399583858513537393, -0.306114178279127568949 ) );
      checkBasis( Bump.Matrix3x3.create(  0.999999981852390584791,  0.000074029398645170279,  0.000175541638165908524,
                                         -0.000074099923057170070,  0.999999916540723843283,  0.000401780719607272227,
                                         -0.000175511879930270704, -0.000401793719937794066,  0.999999903878688645165 ) );
      break;

    case 114:
      checkOrigin( Bump.Vector3.create(  2.153348909164630953228, -4.952850653355477028583, -0.306697818329262572590 ) );
      checkBasis( Bump.Matrix3x3.create(  0.999999978041392623140,  0.000081428459103355098,  0.000193097437349193439,
                                         -0.000081513793641579542,  0.999999899014276216747,  0.000441958073491228293,
                                         -0.000193061429884196315, -0.000441973803891105286,  0.999999883693213686975 ) );
      break;

    case 115:
      checkOrigin( Bump.Vector3.create(  2.153668506967476137248, -4.950079500630217843593, -0.307337013934953107164 ) );
      checkBasis( Bump.Matrix3x3.create(  0.999999973867442548681,  0.000088826814156401401,  0.000210653533733031612,
                                         -0.000088928369308944821,  0.999999879818643244711,  0.000482135296498001570,
                                         -0.000210610681874023843, -0.000482154016973817255,  0.999999861585312732615 ) );
      break;

    case 116:
      checkOrigin( Bump.Vector3.create(  2.154015882548099281024, -4.950086125682736870601, -0.308031765096199228182 ) );
      checkBasis( Bump.Matrix3x3.create(  0.999999969330540361412,  0.000096224463789680521,  0.000228209927282709381,
                                         -0.000096343650044605067,  0.999999858953825038199,  0.000522312388548149854,
                                         -0.000228159635865053288, -0.000522334359106481913,  0.999999837554985782084 ) );
      break;

    case 117:
      checkOrigin( Bump.Vector3.create(  2.154391035906499940467, -4.952870528513034109608, -0.308782071813000880134 ) );
      checkBasis( Bump.Matrix3x3.create(  0.999999964430686061334,  0.000103621407988565217,  0.000245766617963513116,
                                         -0.000103759635833898262,  0.999999836419821375166,  0.000562489349562232026,
                                         -0.000245708291822585654, -0.000562514830209651746,  0.999999811602232835384 ) );
      break;

    case 118:
      checkOrigin( Bump.Vector3.create(  2.154793967042678559665, -4.958432709121108672434, -0.309587934085358118530 ) );
      checkBasis( Bump.Matrix3x3.create(  0.999999959167879537425,  0.000111017646738429681,  0.000263323605740728125,
                                         -0.000111176326662160897,  0.999999812216632588679,  0.000602666179460806858,
                                         -0.000263256649711922136, -0.000602695430203878477,  0.999999783727054003535 ) );
      break;

    case 119:
      checkOrigin( Bump.Vector3.create(  2.155224675956635138618, -4.966772667506961447259, -0.310449351913270887859 ) );
      checkBasis( Bump.Matrix3x3.create(  0.999999953542121011729,  0.000118413180024649423,  0.000280880890579639447,
                                         -0.000118593722514728067,  0.999999786344258678739,  0.000642842878164433230,
                                         -0.000280804709498364902, -0.000642876159009713615,  0.999999753929449397560 ) );
      break;

    case 120:
      checkOrigin( Bump.Vector3.create(  2.155683162648369233239, -4.977890403670591545904, -0.311366325296739243633 ) );
      checkBasis( Bump.Matrix3x3.create(  0.999999947553410262202,  0.000125808007832601388,  0.000298438472445531038,
                                         -0.000126011823376933485,  0.999999758802699534321,  0.000683019445593670564,
                                         -0.000298352471147216123, -0.000683057016547708559,  0.999999722209419017460 ) );
      break;
    }

    // Get CompoundShape transform
    dynamicsWorld.getCollisionObjectArray()[ 2 ].getMotionState().getWorldTransform( trans );

    epsilon = 0;
    shapeName = 'CompoundShape';
    switch ( i ) {
    case 100:
      checkOrigin( Bump.Vector3.create( -2.8569166666666667708796, -4.3083333333333255765751, -0.2861666666666665137519 ) );
      checkBasis( Bump.Matrix3x3.create( 1,  0,  0,
                                         0,  1,  0,
                                         0,  0,  1 ) );
      break;

    case 101:
      checkOrigin( Bump.Vector3.create( -2.8540833333333335275483, -4.5916666666666587914847, -0.2918333333333331669479 ) );
      checkBasis( Bump.Matrix3x3.create( 1,  0,  0,
                                         0,  1,  0,
                                         0,  0,  1 ) );
      break;

    case 102:
      checkOrigin( Bump.Vector3.create( -2.8512222222222223244614, -4.8777777777777693302141, -0.2975555555555554065883 ) );
      checkBasis( Bump.Matrix3x3.create( 1,  0,  0,
                                         0,  1,  0,
                                         0,  0,  1 ) );
      break;

    case 103:
      checkOrigin( Bump.Vector3.create( -2.8483333333333336057080, -5.1666666666666580809419, -0.3033333333333331771620 ) );
      checkBasis( Bump.Matrix3x3.create( 1,  0,  0,
                                         0,  1,  0,
                                         0,  0,  1 ) );
      break;

    case 104:
      checkOrigin( Bump.Vector3.create( -2.8454166666666669271990, -5.4583333333333241554897, -0.3091666666666665341801 ) );
      checkBasis( Bump.Matrix3x3.create( 1,  0,  0,
                                         0,  1,  0,
                                         0,  0,  1 ) );
      break;

    case 105:
      checkOrigin( Bump.Vector3.create( -2.8424722222222222889343, -5.7527777777777684420357, -0.3150555555555554221314 ) );
      checkBasis( Bump.Matrix3x3.create( 1,  0,  0,
                                         0,  1,  0,
                                         0,  0,  1 ) );
      break;

    case 106:
      checkOrigin( Bump.Vector3.create( -2.8424690822588183358732, -5.7022221662160070820846, -0.3150618354823637168316 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999999489969093602,  0.0000020796917984752048,  0.0000098833715292738174,
                                         -0.0000020797878476144212,  0.9999999999506149483963,  0.0000097182561195649120,
                                         -0.0000098833513178081783, -0.0000097182766743852497,  0.9999999999039372866605 ) );
      break;

    case 107:
      checkOrigin( Bump.Vector3.create( -2.8424381645176364230565, -5.6544443324320230459534, -0.3151236709647275979762 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999997959877484632,  0.0000041592875474026362,  0.0000197667632680716780,
                                         -0.0000041596717439594832,  0.9999999998024600156299,  0.0000194364916824003284,
                                         -0.0000197666824222091282, -0.0000194365739016816790,  0.9999999996157489245974 ) );
      break;

    case 108:
      checkOrigin( Bump.Vector3.create( -2.8423794689986765504841, -5.6094442764258172218206, -0.3152410620026470100541 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999995409722952644,  0.0000062387872463737541,  0.0000296501752144519721,
                                         -0.0000062396516886265882,  0.9999999995555348686338,  0.0000291547066865970842,
                                         -0.0000296499933112612536, -0.0000291548916799801096,  0.9999999991354351358552 ) );
      break;

    case 109:
      checkOrigin( Bump.Vector3.create( -2.8422929957019391622453, -5.5672219981973887215077, -0.3154140085961220085764 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999991839507718083,  0.0000083181908949800438,  0.0000395336073664730969,
                                         -0.0000083197276812071267,  0.9999999992098398404750,  0.0000388729011302460349,
                                         -0.0000395332839830229789, -0.0000388732300073713833,  0.9999999984629956983895 ) );
      break;

    case 110:
      checkOrigin( Bump.Vector3.create( -2.8421787446274238142507, -5.5277774977467384331931, -0.3156425107451525380320 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999987249230670727,  0.0000103974984928130009,  0.0000494170597221934633,
                                         -0.0000103998997212924655,  0.9999999987653747091088,  0.0000485910750114380361,
                                         -0.0000494165544355527149, -0.0000485915888819463151,  0.9999999975984308342447 ) );
      break;

    case 111:
      checkOrigin( Bump.Vector3.create( -2.8420367157751309505898, -5.4911107750738654686984, -0.3159265684497386539320 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999981638892920799,  0.0000124767100394641453,  0.0000593005322796714277,
                                         -0.0000124801678084739502,  0.9999999982221396965798,  0.0000583092283282639297,
                                         -0.0000592998046669088925, -0.0000583099683017957197,  0.9999999965417403213763 ) );
      break;

    case 112:
      checkOrigin( Bump.Vector3.create( -2.8418669091450601271731, -5.4572218301787707162021, -0.3162661817098803007653 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999975008493358075,  0.0000145558255345250106,  0.0000691840250369654008,
                                         -0.0000145605319423429109,  0.9999999975801344698212,  0.0000680273610788145982,
                                         -0.0000691830346751499226, -0.0000680283682650104256,  0.9999999952929243818289 ) );
      break;

    case 113:
      checkOrigin( Bump.Vector3.create( -2.8416693247372113440008, -5.4261106630614532875256, -0.3166613505255774785319 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999967358031982556,  0.0000166348449775871577,  0.0000790675379921337596,
                                         -0.0000166409921224906578,  0.9999999968393593618998,  0.0000777454732611809041,
                                         -0.0000790662444583342905, -0.0000777467887696812408,  0.9999999938519829045802 ) );
      break;

    case 114:
      checkOrigin( Bump.Vector3.create( -2.8414439625515850451620, -5.3977772737219140708476, -0.3171120748968302427429 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999958687508794242,  0.0000187137683682421556,  0.0000889510711432348538,
                                         -0.0000187215483485084856,  0.9999999959998142617934,  0.0000874635648734536892,
                                         -0.0000889494340145203323, -0.0000874652298138989666,  0.9999999922189158896302 ) );
      break;

    case 115:
      checkOrigin( Bump.Vector3.create( -2.8411908225881807865676, -5.3722216621601521779894, -0.3176183548236385378871 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999948996924903355,  0.0000207925957060815973,  0.0000988346244883270942,
                                         -0.0000208022006199876585,  0.9999999950614990584796,  0.0000971816359137238768,
                                         -0.0000988326033417665943, -0.0000971836913957544449,  0.9999999903937232259565 ) );
      break;

    case 116:
      checkOrigin( Bump.Vector3.create( -2.8409099048469990123067, -5.3494438283761684971296, -0.3181801903060024194758 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999938286279199673,  0.0000228713269906971045,  0.0001087181980254687966,
                                         -0.0000228829489365194391,  0.9999999940244138629808,  0.0001068996863800822546,
                                         -0.0001087157524381314466, -0.0001069021735133384094,  0.9999999883764051356039 ) );
      break;

    case 117:
      checkOrigin( Bump.Vector3.create( -2.8406012093280392782901, -5.3294437723699621400897, -0.3187975813439218319978 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999926555571683195,  0.0000249499622216803157,  0.0001186017917527183854,
                                         -0.0000249637932976950798,  0.9999999928885585642746,  0.0001166177162706198272,
                                         -0.0001185988813016733678, -0.0001166206761647417290,  0.9999999861669615075499 ) );
      break;

    case 118:
      checkOrigin( Bump.Vector3.create( -2.8402647360313015845179, -5.3122214941415339950481, -0.3194705279373968309642 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999913804802353923,  0.0000270285013986228562,  0.0001284854056681341628,
                                         -0.0000270447337031057652,  0.9999999916539333844057,  0.0001263357255834273959,
                                         -0.0001284819899304507956, -0.0001263391993480551237,  0.9999999837653923417946 ) );
      break;

    case 119:
      checkOrigin( Bump.Vector3.create( -2.8399004849567863750792, -5.2977769936908831738265, -0.3201990300864273608639 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999900033972322078,  0.0000291069445211164187,  0.0001383690397697745803,
                                         -0.0000291257701523427138,  0.9999999903205381013294,  0.0001360537143165958297,
                                         -0.0001383650783225222087, -0.0001360577430613694354,  0.9999999811716976383380 ) );
      break;

    case 120:
      checkOrigin( Bump.Vector3.create( -2.8395084561044932058849, -5.2861102710180105646032, -0.3209830877910134772080 ) );
      checkBasis( Bump.Matrix3x3.create(  0.9999999885243080477437,  0.0000311852915887526758,  0.0001482526940556978725,
                                         -0.0000312069026449970899,  0.9999999888883728260680,  0.0001457716824682161062,
                                         -0.0001482481464759460312, -0.0001457763073027754249,  0.9999999783858773971801 ) );
      break;
    }
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
    Math.pow( 2, -52 )
  );

  ok( true, 'finish' );

});
