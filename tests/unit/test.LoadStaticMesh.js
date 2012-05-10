module( 'LoadStaticMesh' );

test( 'basic load OBJ', function() {
  var collisionConfiguration = Bump.DefaultCollisionConfiguration.create();
  var dispatcher = Bump.CollisionDispatcher.create( collisionConfiguration );
  var overlappingPairCache = Bump.DbvtBroadphase.create();
  var solver = Bump.SequentialImpulseConstraintSolver.create();
  var dynamicsWorld = Bump.DiscreteDynamicsWorld.create( dispatcher, overlappingPairCache, solver, collisionConfiguration );
  dynamicsWorld.setGravity( Bump.Vector3.create( 0, -9.8, 0 ) );

  var mesh = Bump.TriangleMesh.create();
  ok( mesh instanceof Bump.TriangleMesh.prototype.constructor );

  mesh.addTriangle( Bump.Vector3.create( 0, 0, 0 ), Bump.Vector3.create(  5, 0.5,  0 ), Bump.Vector3.create(  0, 0.5,  5 ), true );
  mesh.addTriangle( Bump.Vector3.create( 0, 0, 0 ), Bump.Vector3.create(  0, 0.5,  5 ), Bump.Vector3.create( -5, 0.5,  0 ), true );
  mesh.addTriangle( Bump.Vector3.create( 0, 0, 0 ), Bump.Vector3.create( -5, 0.5,  0 ), Bump.Vector3.create(  0, 0.5, -5 ), true );
  mesh.addTriangle( Bump.Vector3.create( 0, 0, 0 ), Bump.Vector3.create(  0, 0.5, -5 ), Bump.Vector3.create(  5, 0.5,  0 ), true );

  var shape = Bump.BvhTriangleMeshShape.create( mesh, true );
  ok( shape instanceof Bump.BvhTriangleMeshShape.prototype.constructor );

  var terrain = Bump.ScaledBvhTriangleMeshShape.create(
    shape,
    Bump.Vector3.create( 1, 1, 1 )
  );
  ok( terrain instanceof Bump.ScaledBvhTriangleMeshShape.prototype.constructor );

  var collisionShapes = [ terrain, shape ];

  (function() {
    var intertia = Bump.Vector3.create( 0, 0, 0 );
    var startTransform = Bump.Transform.getIdentity();
    var myMotionState = Bump.DefaultMotionState.create( startTransform );
    var rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create( 0, myMotionState, shape, intertia );
    var body = Bump.RigidBody.create( rbInfo );
    dynamicsWorld.addRigidBody( body );
  })();

  // Create a dynamic rigidbody
  (function() {
    var colShape = Bump.BoxShape.create( Bump.Vector3.create( 1, 1, 1 ) );
    collisionShapes.push( colShape );

    var startTransform = Bump.Transform.create();
    startTransform.setIdentity();

    var mass = 1;
    var isDynamic = ( mass !== 0 );
    var localInertia = Bump.Vector3.create();

    if ( isDynamic ) {
      colShape.calculateLocalInertia( mass, localInertia );
    }

    startTransform.setOrigin( Bump.Vector3.create( 2, 10, 0.5 ) );
    var myMotionState = Bump.DefaultMotionState.create( startTransform );
    var rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create( mass, myMotionState, colShape, localInertia );
    var body = Bump.RigidBody.create( rbInfo );
    dynamicsWorld.addRigidBody(body);
  })();

  // Do simulation and test
  var trans = Bump.Transform.create();

  var checkOrigin = function( expected ) {
    deepEqual( trans.origin, expected, shapeName + '.origin: Frame ' + i );
  };

  var checkBasis = function( expected ) {
    deepEqual( trans.basis, expected, shapeName + '.basis: Frame ' + i );
  };

  for ( var i = 0; i < 255; ++i ) {
    dynamicsWorld.stepSimulation( 1 / 60, 10 );

    // Get box's transform
    dynamicsWorld.getCollisionObjectArray()[ 1 ].getMotionState().getWorldTransform( trans );

    var shapeName = 'BoxShape';
    switch ( i ) {
    case 78:
      checkOrigin( Bump.Vector3.create( 2, 1.39777777777777911794, 0.5 ) );
      checkBasis( Bump.Matrix3x3.create( 1, 0, 0,
                                         0, 1, 0,
                                         0, 0, 1 ) );
      break;

    case 79:
      checkOrigin( Bump.Vector3.create(  1.97683427608767847694,  1.26074566873481797025,  0.47683198377980373639 ) );
      checkBasis( Bump.Matrix3x3.create(  0.99665220940949295070, -0.08168929705934127594, -0.00335145119714758436,
                                          0.08168953588992630688,  0.99330292384163432207,  0.08170753462042992799,
                                         -0.00334562479435546916, -0.08170777339770685099,  0.99665071442362618281 ) );
      break;

    case 80:
      checkOrigin( Bump.Vector3.create(  1.94361147132572020801,  1.16371808332045834078,  0.44891943421646024470 ) );
      checkBasis( Bump.Matrix3x3.create(  0.97657647259963542563, -0.21510745011373272328,  0.00521325909786174262,
                                          0.21352696947549387740,  0.97182109531582838713,  0.09984984729960845462,
                                         -0.02654480121351356081, -0.09639784024920690364,  0.99498885919583213155 ) );
      break;

    case 81:
      checkOrigin( Bump.Vector3.create(  1.92275334841200939984,  1.20871191552894630128,  0.43357821897324400062 ) );
      checkBasis( Bump.Matrix3x3.create(  0.97615500123786103082, -0.21608654430374585331,  0.02068861834866965455,
                                          0.21335730769545990793,  0.97263350367224121751,  0.09199308010500126254,
                                         -0.04000091013035178555, -0.08538543731296110995,  0.99554470230302460898 ) );
      break;

    case 82:
      checkOrigin( Bump.Vector3.create(  1.90189522549829859166,  1.25098352551521219134,  0.41823700373002775654 ) );
      checkBasis( Bump.Matrix3x3.create(  0.97552487994681169603, -0.21689438200454863592,  0.03616677563211290886,
                                          0.21329399689595479606,  0.97335935895626601866,  0.08412626950242865775,
                                         -0.05344978477886589557, -0.07435311282731726923,  0.99579854143294521673 ) );
      break;

    case 83:
      checkOrigin( Bump.Vector3.create(  1.88103710258458778348,  1.29053291327925578891,  0.40289578848681151246 ) );
      checkBasis( Bump.Matrix3x3.create(  0.97468629955539287657, -0.21753071856675956774,  0.05164304346999942091,
                                          0.21333705625031987307,  0.97399844134646340610,  0.07625179791393649209,
                                         -0.06688735223839303856, -0.06330420787348339795,  0.99575029971175399446 ) );
      break;

    case 84:
      checkOrigin( Bump.Vector3.create(  1.86017897967087697531,  1.32736007882107709399,  0.38755457324359526838 ) );
      checkBasis( Bump.Matrix3x3.create(  0.97363951402324744322, -0.21799536127921131934,  0.06711273495634573205,
                                          0.21348647271825699212,  0.97455055730010642367,  0.06837205008165962716,
                                         -0.08030954301259279893, -0.05224206855397470206,  0.99539999174920146263 ) );
      break;

    case 85:
      checkOrigin( Bump.Vector3.create(  1.83932085675716616713,  1.36146502214067632863,  0.37221335800037902430 ) );
      checkBasis( Bump.Matrix3x3.create(  0.97238484036384564835, -0.21828816942731232853,  0.08257116517678173007,
                                          0.21374220104977803558,  0.97501553961179421304,  0.06048941234561566738,
                                         -0.09371229226187274830, -0.04117004497926421425,  0.99474772363420405075 ) );
      break;

    case 86:
      checkOrigin( Bump.Vector3.create(  1.81846273384345535895,  1.39284774323805327079,  0.35687214275716278022 ) );
      checkBasis( Bump.Matrix3x3.create(  0.97092265854847925599, -0.21840905433566126792,  0.09801365262735213524,
                                          0.21410416379890828686,  0.97539324746408950784,  0.05260627192101419852,
                                         -0.10709154103440356176, -0.03009149025321942311,  0.99379369290271557524 ) );
      break;

    case 87:
      checkOrigin( Bump.Vector3.create(  1.79760461092974455077,  1.42150824211320792045,  0.34153092751394653614 ) );
      checkBasis( Bump.Matrix3x3.create(  0.96925341139118925682, -0.21835797939490203534,  0.11343552063228543036,
                                          0.21457225134714075221,  0.97568356647016374339,  0.04472501617530139084,
                                         -0.12044323749535121304, -0.01900975945763247466,  0.99253818847790509228 ) );
      break;

    case 88:
      checkOrigin( Bump.Vector3.create(  1.77674648801603374260,  1.44744651876614049968,  0.32618971227073029207 ) );
      checkBasis( Bump.Matrix3x3.create(  0.96737760441466158490, -0.21813496007281063527,  0.12883209876030021768,
                                          0.21514632193663330018,  0.97588640870843923469,  0.03684803190515836824,
                                         -0.13376333815395374804, -0.00792820863615143964,  0.99098159058265689048 ) );
      break;

    case 89:
      checkOrigin( Bump.Vector3.create(  1.75588836510232293442,  1.47066257319685078642,  0.31084849702751404799 ) );
      checkBasis( Bump.Matrix3x3.create(  0.96529580569713313576, -0.21774006390961098134,  0.14419872423902083125,
                                          0.21582620171313970925,  0.97600171274921532216,  0.02897770461367246697,
                                         -0.14704780908807099649,  0.00314980622207982307,  0.98912437062442337687 ) );
      break;

    case 90:
      checkOrigin( Bump.Vector3.create(  1.73503024218861212624,  1.49115640540533878067,  0.29550728178429780391 ) );
      checkBasis( Bump.Matrix3x3.create(  0.96300864570035105139, -0.21717341049752075799,  0.15953074336707323555,
                                          0.21661168477866021842,  0.97602944367327215680,  0.02111641778790017757,
                                         -0.16029262716583686510,  0.01422093019876525567,  0.98696709105246049898 ) );
      break;

    case 91:
      checkOrigin( Bump.Vector3.create(  1.71417211927490131806,  1.50892801539160448243,  0.28016606654108155983 ) );
      checkBasis( Bump.Matrix3x3.create(  0.96051681707864200455, -0.21643517144453316980,  0.17482351292343401017,
                                          0.21750253325379653724,  0.97596959308244590758,  0.01326655217704068510,
                                         -0.17349378126404324529,  0.02528181046247588923,  0.98451040518749410868 ) );
      break;

    case 92:
      checkOrigin( Bump.Vector3.create(  1.69331399636119050989,  1.52397740315564811375,  0.26482485129786531575 ) );
      checkBasis( Bump.Matrix3x3.create(  0.95782107446914444004, -0.21552557032244676338,  0.19007240157360516530,
                                          0.21849847734979269132,  0.97582217910217172729,  0.00543048507143856045,
                                         -0.18664727348288778774,  0.03632909728403713179,  0.98175505702386434148 ) );
      break;

    case 93:
      checkOrigin( Bump.Vector3.create(  1.67245587344747970171,  1.53630456869746945259,  0.24948363605464907167 ) );
      checkBasis( Bump.Matrix3x3.create(  0.95492223426327116353, -0.21444488259915767125,  0.20527279127218930888,
                                          0.21959921545023874945,  0.97558724637599536500, -0.00238941041736608073,
                                         -0.19974912035671635313,  0.04735944505097654245,  0.97870188100421140476 ) );
      break;

    case 94:
      checkOrigin( Bump.Vector3.create(  1.65159775053376889353,  1.54590951201706849893,  0.23414242081143282759 ) );
      checkBasis( Bump.Matrix3x3.create(  0.95182117435946955730, -0.21319343555523573297,  0.22042007866144061601,
                                          0.22080441420241408990,  0.97526486605205198188, -0.01019076607532186374,
                                         -0.21279535406039504219,  0.05836951328072494116,  0.97535180176676883335 ) );
      break;

    case 95:
      checkOrigin( Bump.Vector3.create(  1.63073962762005808536,  1.55279223311444547484,  0.21880120556821658351 ) );
      checkBasis( Bump.Matrix3x3.create(  0.94851883389735480723, -0.21177160818480914029,  0.23550967646536705158,
                                          0.22211370861824134004,  0.97485513576152027504, -0.01797121930306725540,
                                         -0.22578202361094465433,  0.06935596763226381523,  0.97170583386534181702 ) );
      break;

    case 96:
      checkOrigin( Bump.Vector3.create(  1.60988150470634727718,  1.55695273198960015826,  0.20345999032500033943 ) );
      checkBasis( Bump.Matrix3x3.create(  0.94501621297329574389, -0.21017983108078847065,  0.25053701487896312683,
                                          0.22352670218482129094,  0.97435817958905479585, -0.02572841383143134597,
                                         -0.23870519606407558655,  0.08031548091591314553,  0.96776508146205442173 ) );
      break;

    case 97:
      checkOrigin( Bump.Vector3.create(  1.58902338179263646900,  1.55839100864253254919,  0.18811877508178409535 ) );
      checkBasis( Bump.Matrix3x3.create(  0.94131437233754167160, -0.20841858630446313816,  0.26549754295215038935,
                                          0.22504296698451420333,  0.97377414803520812026, -0.03346000043501749788,
                                         -0.25156095770525827016,  0.09124473410095279569,  0.96353073799296085067 ) );
      break;

    case 98:
      checkOrigin( Bump.Vector3.create(  1.56816525887892566082,  1.55710706307324286968,  0.17277755983856785127 ) );
      checkBasis( Bump.Matrix3x3.create(  0.93741443307297955823, -0.20648840723951258913,  0.28038672996800978465,
                                          0.22666204382453322697,  0.97310321797085197471, -0.04116363764365385536,
                                         -0.26434541523497206983,  0.10214041732077391855,  0.95900408580661866687 ) );
      break;

    case 99:
      checkOrigin( Bump.Vector3.create(  1.54730713596521485265,  1.55310089528173089768,  0.15743634459535160719 ) );
      checkBasis( Bump.Matrix3x3.create(  0.93331757625561961866, -0.20438987843047315418,  0.29520006681488408784,
                                          0.22838344237600763376,  0.97234559258361297207, -0.04883699245149522583,
                                         -0.27705469694776951872,  0.11299923087525418075,  0.95418649577573699805 ) );
      break;

    case 100:
      checkOrigin( Bump.Vector3.create(  1.52644901305150404447,  1.54637250526799663319,  0.14209512935213536311 ) );
      checkBasis( Bump.Matrix3x3.create(  0.92902504259691343069, -0.20212363540571218201,  0.30993306735193948409,
                                          0.23020664132247695144,  0.97150150131633861150, -0.05647774102356156040,
                                         -0.28968495390480253349,  0.12381788623005474115,  0.94907942688201485382 ) );
      break;

    case 251:
      checkOrigin( Bump.Vector3.create(  0.80550644305481255980,  1.22079588250213544320, -0.32878854194289486301 ) );
      checkBasis( Bump.Matrix3x3.create(  0.74913454341505003597, -0.10262473936961517829,  0.65442004762357575132,
                                          0.09429334415441482931,  0.99438676638129552821,  0.04799712589236938831,
                                         -0.65567232754669579897,  0.02575114978150354339,  0.75460630607915613055 ) );
      break;

    case 252:
      checkOrigin( Bump.Vector3.create(  0.80550657891682464484,  1.22079587133274203303, -0.32878458102590574219 ) );
      checkBasis( Bump.Matrix3x3.create(  0.74913689271517691637, -0.10262482678782237910,  0.65441734458968847665,
                                          0.09429336866198308187,  0.99438676577440499038,  0.04799709031903844070,
                                         -0.65566963983352544165,  0.02575082483121735044,  0.75460865249550845846 ) );
      break;

    case 253:
      checkOrigin( Bump.Vector3.create(  0.80550671479173752143,  1.22079586016126917514, -0.32878061988998391607 ) );
      checkBasis( Bump.Matrix3x3.create(  0.74913924214747740216, -0.10262491420930483499,  0.65441464138437177578,
                                          0.09429339317130266962,  0.99438676516753798929,  0.04799705474174165848,
                                         -0.65566695194965041171,  0.02575049986257427898,  0.75461099904380024572 ) );
      break;

    case 254:
      checkOrigin( Bump.Vector3.create(  0.80550671479173752143,  1.22079586016126917514, -0.32878061988998391607 ) );
      checkBasis( Bump.Matrix3x3.create(  0.74913924214747740216, -0.10262491420930483499,  0.65441464138437177578,
                                          0.09429339317130266962,  0.99438676516753798929,  0.04799705474174165848,
                                         -0.65566695194965041171,  0.02575049986257427898,  0.75461099904380024572 ) );
      break;
    }
  }

});
