(function( window, Bump ) {

  Bump.DbvtProxy = Bump.type( {
    parent: Bump.BroadphaseProxy,

    init: function DbvtProxy( aabbMin, aabbMax, userPtr, collisionFilterGroup, collisionFilterMask ) {
      this._super( aabbMin, aabbMax, userPtr, collisionFilterGroup, collisionFilterMask );

      this.leaf = null;
      this.links = [ null, null ];
      this.stage = 0;
    }
  } );

  Bump.DbvtBroadphase = Bump.type( {
    parent: Bump.BroadphaseInterface,

    init: function() {
      /* Fields */
      this.m_sets = [ Bump.Dbvt.create(), Bump.Dbvt.create() ]; // Dbvt sets
      this.m_stageRoots = new Array( Bump.DbvtBroadphase.Stages.STAGECOUNT + 1 ); // Stages list (btDbvtProxy*)
      this.m_paircache = null; // Pair cache (btOverlappingPairCache*)
      this.m_prediction = 0; // Velocity prediction (btScalar)
      this.m_stageCurrent = 0; // Current stage (int)
      this.m_fupdates = 0; // % of fixed updates per frame (int)
      this.m_dupdates = 0; // % of dynamic updates per frame (int)
      this.m_cupdates = 0; // % of cleanup updates per frame (int)
      this.m_newpairs = 0; // Number of pairs created (int)
      this.m_fixedleft = 0; // Fixed optimization left (int)
      this.m_updates_call = 0; // Number of updates call (unsigned)
      this.m_updates_done = 0; // Number of updates done (unsigned)
      this.m_updates_ratio = 0; // m_updates_done/m_updates_call (btScalar)
      this.m_pid = 0; // Parse id (int)
      this.m_cid = 0; // Cleanup index (int)
      this.m_gid = 0; // Gen id (int)
      this.m_releasepaircache = false; // Release pair cache on delete
      this.m_deferedcollide = false; // Defere dynamic/static collision to collide call
      this.m_needcleanup = false; // Need to run cleanup?

/* omitting for now
#if DBVT_BP_PROFILE
	btClock	m_clock;
	struct	{
		unsigned long m_total;
		unsigned long m_ddcollide;
		unsigned long m_fdcollide;
		unsigned long m_cleanup;
		unsigned long m_jobcount;
	} m_profiling;
#endif
*/

    },

    typeMembers: {
      Stages: Bump.Enum( [
        { id: 'DYNAMIC_SET' },
        { id: 'FIXED_SET' },
        { id: 'STAGECOUNT' }
      ] )
    }
  } );
} )( this, this.Bump );