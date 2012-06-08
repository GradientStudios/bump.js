module( 'CrabCar' );

test( 'basic', function() {
  var collisionConfiguration = Bump.DefaultCollisionConfiguration.create();
  var dispatcher = Bump.CollisionDispatcher.create( collisionConfiguration );
  var overlappingPairCache = Bump.DbvtBroadphase.create();
  var solver = Bump.SequentialImpulseConstraintSolver.create();
  var dynamicsWorld = Bump.DiscreteDynamicsWorld.create( dispatcher, overlappingPairCache, solver, collisionConfiguration );
  dynamicsWorld.setGravity( Bump.Vector3.create( 0, -10, 0 ) );

  var groundShape = Bump.BoxShape.create( Bump.Vector3.create( 500, 500, 500 ) );
  ok( groundShape instanceof Bump.BoxShape.prototype.constructor );

  var collisionShapes = [ groundShape ];

  var groundTransform = Bump.Transform.create();
  ok( groundTransform instanceof Bump.Transform.prototype.constructor );
  groundTransform.setIdentity();
  groundTransform.setOrigin( Bump.Vector3.create( 0, -510, 0 ) );

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
    // block positions based on crab.json (exluding wheels)
    var blockPositions = [
      [ 3, 3, 5 ],
      [ 1, 3, 1 ],
      [ 1, 3, 2 ],
      [ 1, 3, 5 ],
      [ 1, 3, 6 ],
      [ 2, 3, 1 ],
      [ 2, 3, 2 ],
      [ 2, 3, 3 ],
      [ 2, 3, 4 ],
      [ 2, 3, 5 ],
      [ 2, 3, 6 ],
      [ 3, 3, 3 ],
      [ 3, 3, 4 ],
      [ 4, 3, 1 ],
      [ 4, 3, 2 ],
      [ 4, 3, 3 ],
      [ 4, 3, 4 ],
      [ 4, 3, 5 ],
      [ 4, 3, 6 ],
      [ 5, 3, 1 ],
      [ 5, 3, 2 ],
      [ 5, 3, 5 ],
      [ 5, 3, 6 ]
    ];
    var offset = Bump.Vector3.create( 3, 2, 3.5555555555555554 );

    var colShape = Bump.CompoundShape.create();
    ok( colShape instanceof Bump.CompoundShape.prototype.constructor );

    collisionShapes.push( colShape );

    var localOffset, localTrans, subShape;
    blockPositions.forEach( function( coords ) {
      localOffset = Bump.Vector3.create();
      localOffset.setValue.apply( localOffset, coords ).subtractSelf( offset );
      localTrans = Bump.Transform.getIdentity().setOrigin( localOffset );
      subShape = Bump.BoxShape.create( Bump.Vector3.create( 0.5, 0.5, 0.5 ) );
      collisionShapes.push( subShape );
      colShape.addChildShape( localTrans, subShape );
    });

    // var aShape = Bump.BoxShape.create( Bump.Vector3.create( 0.5, 0.5, 0.5 ) );
    // var bShape = Bump.BoxShape.create( Bump.Vector3.create( 0.5, 0.5, 0.5 ) );
    // collisionShapes.push( aShape );
    // collisionShapes.push( bShape );

    // var a = Bump.Transform.getIdentity();
    // var b = Bump.Transform.getIdentity();
    // a.setOrigin( Bump.Vector3.create( 0, 0, 0 ) );
    // b.setOrigin( Bump.Vector3.create( 0.75, 0.25, -0.5 ) );
    // colShape.addChildShape( a, aShape );
    // colShape.addChildShape( b, bShape );

    var startTransform = Bump.Transform.create();
    startTransform.setIdentity();

    mass = 80; //1;
    isDynamic = ( mass !== 0 );
    localInertia = Bump.Vector3.create();

    if ( isDynamic ) {
      colShape.calculateLocalInertia( mass, localInertia );
    }

    //startTransform.setOrigin( Bump.Vector3.create( -3, 10, 0 ) );

    // using motionstate is recommended, it provides interpolation capabilities, and only synchronizes 'active' objects
    myMotionState = Bump.DefaultMotionState.create( startTransform );
    rbInfo = Bump.RigidBody.RigidBodyConstructionInfo.create( mass, myMotionState, colShape, localInertia );
    body = Bump.RigidBody.create( rbInfo );

    body.setContactProcessingThreshold( Infinity );
    body.setActivationState( Bump.CollisionObject.DISABLE_DEACTIVATION );

    dynamicsWorld.addRigidBody(body);
  })();

  /// Do some simulation
  var trans = Bump.Transform.create();
  var shapeName = '';
  var checkOrigin = function( expected ) {
    deepEqual( trans.origin, expected, shapeName + '.origin: Frame ' + i );
  };

  var checkBasis = function( expected ) {
    deepEqual( trans.basis, expected, shapeName + '.basis: Frame ' + i );
  };

  for( var i = 0; i < 501; i++ ) {
    dynamicsWorld.stepSimulation( 0.05, 0 );

    trans = dynamicsWorld.getCollisionObjectArray()[ 1 ].getCenterOfMassTransform();
    shapeName = 'CompoundShape';
    switch ( i ) {
    case 28:
      checkOrigin( Bump.Vector3.create( 0, -1.08750000000000018e+01, 0 ) );
      checkBasis( Bump.Matrix3x3.create( 1, 0, 0,
                                         0, 1, 0,
                                         0, 0, 1 ) );
      break;

    case 29:
      checkOrigin( Bump.Vector3.create( 2.45838582416696516e-09, -1.07999999938294771e+01, 0.00000000000000000e+00 ) );
      checkBasis( Bump.Matrix3x3.create( 9.99999999999999889e-01, -1.16408890917303917e-08, -1.10031013820813871e-09,
                                         1.16408890937980852e-08, 9.99999999999999889e-01, 1.87919057415318727e-09,
                                         1.10031011633268939e-09, -1.87919058696177548e-09, 1.00000000000000000e+00 ) );
      break;

    case 30:
      checkOrigin( Bump.Vector3.create( 1.36877731625330564e-09, -1.07399999950635774e+01, -1.79115863295679220e-10 ) );
      checkBasis( Bump.Matrix3x3.create( 1.00000000000000000e+00, -9.29653912646484708e-09, -1.09652645108686057e-09,
                                         9.29653912811187617e-09, 1.00000000000000000e+00, 1.50204078202421216e-09,
                                         1.09652643712307948e-09, -1.50204079221811306e-09, 1.00000000000000000e+00 ) );
      break;

    case 31:
      checkOrigin( Bump.Vector3.create( 4.77862524319794721e-10, -1.06919999959536316e+01, -3.58231726591358439e-10 ) );
      checkBasis( Bump.Matrix3x3.create( 1.00000000000000000e+00, -7.62066457051578549e-09, -1.11386453405929604e-09,
                                         7.62066457188722447e-09, 1.00000000000000000e+00, 1.23124357640940894e-09,
                                         1.11386452467640189e-09, -1.23124358489779700e-09, 1.00000000000000000e+00 ) );
      break;

    case 32:
      checkOrigin( Bump.Vector3.create( -2.38313781348144197e-10, -1.06535999966477206e+01, -5.37347589887037659e-10 ) );
      checkBasis( Bump.Matrix3x3.create( 1.00000000000000000e+00, -6.31382824683006953e-09, -1.13440355495560392e-09,
                                         6.31382824798724557e-09, 1.00000000000000000e+00, 1.02007437571917680e-09,
                                         1.13440354851502967e-09, -1.02007438288160593e-09, 1.00000000000000000e+00 ) );
      break;

    case 33:
      checkOrigin( Bump.Vector3.create( -8.18085446520937499e-10, -1.06228799971886332e+01, -7.16463453182716879e-10 ) );
      checkBasis( Bump.Matrix3x3.create( 1.00000000000000000e+00, -5.29545094856289140e-09, -1.15750344595803369e-09,
                                         5.29545094955314570e-09, 1.00000000000000000e+00, 8.55508536231294494e-10,
                                         1.15750344142773008e-09, -8.55508542360797131e-10, 1.00000000000000000e+00 ) );
      break;

    case 34:
      checkOrigin( Bump.Vector3.create( -1.29144129079051107e-09, -1.05983039976098752e+01, -8.95579316478396098e-10 ) );
      checkBasis( Bump.Matrix3x3.create( 1.00000000000000000e+00, -4.50242173018892092e-09, -1.18265148316896783e-09,
                                         4.50242173104913085e-09, 1.00000000000000000e+00, 7.27357583743473208e-10,
                                         1.18265147989409733e-09, -7.27357589068268903e-10, 1.00000000000000000e+00 ) );
      break;

    case 35:
      checkOrigin( Bump.Vector3.create( -1.68183506445926675e-09, -1.05786431979376765e+01, -1.07469517977407532e-09 ) );
      checkBasis( Bump.Matrix3x3.create( 1.00000000000000000e+00, -3.88533507991770395e-09, -1.20943890047214826e-09,
                                         3.88533508067679106e-09, 1.00000000000000000e+00, 6.27635829610458057e-10,
                                         1.20943889803357266e-09, -6.27635834309533392e-10, 1.00000000000000000e+00 ) );
      break;

    case 36:
      checkOrigin( Bump.Vector3.create( -2.00759058703973693e-09, -1.05629145581925652e+01, -1.25381104306975443e-09 ) );
      checkBasis( Bump.Matrix3x3.create( 1.00000000000000000e+00, -3.40553752563296548e-09, -1.23753747022743574e-09,
                                         3.40553752631372768e-09, 1.00000000000000000e+00, 5.50094247728233358e-10,
                                         1.23753746835406893e-09, -5.50094251942713616e-10, 1.00000000000000000e+00 ) );
      break;

    case 37:
      checkOrigin( Bump.Vector3.create( -2.28302018788895780e-09, -1.05503316463906014e+01, -1.43292690636543376e-09 ) );
      checkBasis( Bump.Matrix3x3.create( 1.00000000000000000e+00, -3.03279850914784462e-09, -1.26668440862799813e-09,
                                         3.03279850976833265e-09, 1.00000000000000000e+00, 4.89851855338240678e-10,
                                         1.26668440714237596e-09, -4.89851859179839289e-10, 1.00000000000000000e+00 ) );
      break;

    case 38:
      checkOrigin( Bump.Vector3.create( -2.51930374463210130e-09, -1.05402653169443195e+01, -1.61204276966111308e-09 ) );
      checkBasis( Bump.Matrix3x3.create( 1.00000000000000000e+00, -2.74348248136867497e-09, -1.29667094924535105e-09,
                                         2.74348248194321973e-09, 1.00000000000000000e+00, 4.43092387983540425e-10,
                                         1.29667094802973470e-09, -4.43092391540934460e-10, 1.00000000000000000e+00 ) );
      break;

    case 39:
      checkOrigin( Bump.Vector3.create( -2.72515441211426232e-09, -1.05322122533835234e+01, -1.79115863295679240e-09 ) );
      checkBasis( Bump.Matrix3x3.create( 1.00000000000000000e+00, -2.51913350221238269e-09, -1.32732860700139482e-09,
                                         2.51913350275238853e-09, 1.00000000000000000e+00, 4.06836363997886562e-10,
                                         1.32732860597651969e-09, -4.06836367341604542e-10, 1.00000000000000000e+00 ) );
      break;

    case 40:
      checkOrigin( Bump.Vector3.create( -2.90737288098121702e-09, -1.05257698025318795e+01, -1.97027449625247173e-09 ) );
      checkBasis( Bump.Matrix3x3.create( 1.00000000000000000e+00, -2.34533250603399737e-09, -1.35852357893395879e-09,
                                         2.34533250654853101e-09, 1.00000000000000000e+00, 3.78744717204841590e-10,
                                         1.35852357804567641e-09, -3.78744720391031087e-10, 1.00000000000000000e+00 ) );
      break;

    case 41:
      checkOrigin( Bump.Vector3.create( -3.07124979336808074e-09, -1.05206158418481497e+01, -2.14939035954815105e-09 ) );
      checkBasis( Bump.Matrix3x3.create( 1.00000000000000000e+00, -2.21083833815043722e-09, -1.39014788620354902e-09,
                                         2.21083833864673483e-09, 1.00000000000000000e+00, 3.57010369959106915e-10,
                                         1.39014788541425700e-09, -3.57010373032499169e-10, 1.00000000000000000e+00 ) );
      break;

    case 42:
      checkOrigin( Bump.Vector3.create( -3.22090950117507628e-09, -1.05164926732992363e+01, -2.32850622284383037e-09 ) );
      checkBasis( Bump.Matrix3x3.create( 1.00000000000000000e+00, -2.10687851791630235e-09, -1.42211581984211835e-09,
                                         2.10687851840012029e-09, 1.00000000000000000e+00, 3.40210055298291817e-10,
                                         1.42211581912533698e-09, -3.40210058294517116e-10, 1.00000000000000000e+00 ) );
      break;

    case 43:
      checkOrigin( Bump.Vector3.create( -3.35955653038110980e-09, -1.05131941384585765e+01, -2.50762208613950970e-09 ) );
      checkBasis( Bump.Matrix3x3.create( 1.00000000000000000e+00, -2.02662323054443321e-09, -1.45435852773017338e-09,
                                         2.02662323102034496e-09, 1.00000000000000000e+00, 3.27231138808825722e-10,
                                         1.45435852706699911e-09, -3.27231141756262460e-10, 1.00000000000000000e+00 ) );
      break;

    case 44:
      checkOrigin( Bump.Vector3.create( -3.48968695964420757e-09, -1.05105553105848095e+01, -2.68673794943518902e-09 ) );
      checkBasis( Bump.Matrix3x3.create( 1.00000000000000000e+00, -1.96474573342558453e-09, -1.48682125953313913e-09,
                                         1.96474573389724870e-09, 1.00000000000000000e+00, 3.17229839606935467e-10,
                                         1.48682125890986308e-09, -3.17229842528161231e-10, 1.00000000000000000e+00 ) );
      break;

    case 45:
      checkOrigin( Bump.Vector3.create( -3.61323736375680955e-09, -1.05084442482848086e+01, -2.86585381273086834e-09 ) );
      checkBasis( Bump.Matrix3x3.create( 1.00000000000000000e+00, -1.91710417070564430e-09, -1.51946004512455576e-09,
                                         1.91710417117596183e-09, 1.00000000000000000e+00, 3.09529216963792518e-10,
                                         1.51946004453115583e-09, -3.09529219876755677e-10, 1.00000000000000000e+00 ) );
      break;

    case 46:
      checkOrigin( Bump.Vector3.create( -3.73170886287294263e-09, -1.05067553984440245e+01, -3.04496967602654766e-09 ) );
      checkBasis( Bump.Matrix3x3.create( 1.00000000000000000e+00, -1.88048047134082661e-09, -1.55223956674080908e-09,
                                         1.88048047181209457e-09, 1.00000000000000000e+00, 3.03605046401621774e-10,
                                         1.55223956616988571e-09, -3.03605049320577960e-10, 1.00000000000000000e+00 ) );
      break;

    case 47:
      checkOrigin( Bump.Vector3.create( -3.84626781265843954e-09, -1.05054043185707631e+01, -3.22408553932222699e-09 ) );
      checkBasis( Bump.Matrix3x3.create( 1.00000000000000000e+00, -1.85237211663984637e-09, -1.58513203771811730e-09,
                                         1.85237211711389366e-09, 1.00000000000000000e+00, 2.99058521489975284e-10,
                                         1.58513203716414949e-09, -2.99058524426229678e-10, 1.00000000000000000e+00 ) );
      break;

    case 48:
      checkOrigin( Bump.Vector3.create( -3.95781582837030791e-09, -1.05043234546716437e+01, -3.40320140261790631e-09 ) );
      checkBasis( Bump.Matrix3x3.create( 1.00000000000000000e+00, -1.83083689229723510e-09, -1.61811471525064909e-09,
                                         1.83083689277550762e-09, 1.00000000000000000e+00, 2.95573804791902903e-10,
                                         1.61811471470950174e-09, -2.95573807754407046e-10, 1.00000000000000000e+00 ) );
      break;

    case 100:
      checkOrigin( Bump.Vector3.create( -9.28471710457453468e-09, -1.05000000385571788e+01, -1.27172262939932063e-08 ) );
      checkBasis( Bump.Matrix3x3.create( 1.00000000000000000e+00, -1.76377987447759413e-09, -3.35049126067306519e-09,
                                         1.76377987543157864e-09, 1.00000000000000000e+00, 2.84729715827018982e-10,
                                         3.35049126017086481e-09, -2.84729721736548031e-10, 1.00000000000000000e+00 ) );
      break;

    case 200:
      checkOrigin( Bump.Vector3.create( 2.38397599491786552e-03, -1.05000000015279262e+01, 1.82360117721143671e-03 ) );
      checkBasis( Bump.Matrix3x3.create( 9.99999991660996401e-01, 6.60651704805003249e-09, 1.29143358461554188e-04,
                                         -6.60768185977537299e-09, 9.99999999999999889e-01, 9.01909813818045452e-09,
                                         -1.29143358461494611e-04, -9.01995140119717860e-09, 9.99999991660996401e-01 ) );
      break;

    case 300:
      checkOrigin( Bump.Vector3.create( 1.03223042392595020e-03, -1.05029276187459057e+01, 8.11260013315025360e-04 ) );
      checkBasis( Bump.Matrix3x3.create( 9.99998164261661660e-01, -1.76678114485843345e-03, -7.41591324663819153e-04,
                                         1.76838009012971506e-03, 9.99996101424325823e-01, 2.16101087600097672e-03,
                                         7.37770400244368144e-04, -2.16231832428401055e-03, 9.99997390033744549e-01 ) );
      break;

    case 400:
      checkOrigin( Bump.Vector3.create( 1.77756633095135720e-03, -1.04999997123866109e+01, 4.25904117261104479e-04 ) );
      checkBasis( Bump.Matrix3x3.create( 9.99999644074560989e-01, 9.17609428015596218e-07, -8.43711982466181462e-04,
                                         -9.17636110324966759e-07, 9.99999999999578448e-01, -3.12377923623126172e-08,
                                         8.43711982437161706e-04, 3.20120018258124949e-08, 9.99999644074981542e-01 ) );
      break;

    case 500:
      checkOrigin( Bump.Vector3.create( -1.86188672474239662e-03, -1.05001606708520558e+01, 3.43212272362656157e-03 ) );
      checkBasis( Bump.Matrix3x3.create( 9.99999674409227990e-01, -1.93551798121095313e-04, -7.83402284508641572e-04,
                                         1.93446742904069402e-04, 9.99999972287741179e-01, -1.34174790936021572e-04,
                                         7.83428232570842868e-04, 1.34023200629626018e-04, 9.99999684138943135e-01 ) );
      break;
    }
  }

  strictEqual( dynamicsWorld.getNumCollisionObjects(), 2 );
  dynamicsWorld.getCollisionObjectArray()[0].getMotionState().getWorldTransform( trans );
  deepEqual( trans.origin, Bump.Vector3.create( 0, -510, 0 ) );

  ok( true, 'finish' );
});
