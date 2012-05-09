(function( window, Bump ) {
  // GJK
  var GJK_MAX_ITERATIONS = 128;
  var GJK_ACCURARY       = 0.0001;
  var GJK_MIN_DISTANCE   = 0.0001;
  var GJK_DUPLICATED_EPS = 0.0001;
  var GJK_SIMPLEX2_EPS   = 0.0;
  var GJK_SIMPLEX3_EPS   = 0.0;
  var GJK_SIMPLEX4_EPS   = 0.0;

  // EPA
  var EPA_MAX_VERTICES   = 64;
  var EPA_MAX_FACES      = EPA_MAX_VERTICES * 2;
  var EPA_MAX_ITERATIONS = 255;
  var EPA_ACCURACY       = 0.0001;
  var EPA_FALLBACK       = 10 * EPA_ACCURACY;
  var EPA_PLANE_EPS      = 0.00001;
  var EPA_INSIDE_EPS     = 0.01;

  // Used by `projectorigin3` and `projectorigin4`
  var imd3 = new Uint32Array([ 1, 2, 0 ]);
  var i1m3 = new Uint32Array([ 1, 2, 0 ]);
  var i2m3 = new Uint32Array([ 2, 0, 1 ]);

  var MinkowskiDiff = Bump.type({
    init: function MinkowskiDiff() {
      // Default initializers
      this.shapes0 = null;
      this.shapes1 = null;
      this.toshape1 = Bump.Matrix3x3.create();
      this.toshape0 = Bump.Transform.create();

      // btVector3 (btConvexShape::*Ls)(const btVector3&) const
      this.Ls = null;
      // End default initializers
    },

    members: {
      EnableMargin: function( enable ) {
        if ( enable ) {
          this.Ls = Bump.ConvexShape.prototype.localGetSupportVertexNonVirtual;
        } else {
          this.Ls = Bump.ConvexShape.prototype.localGetSupportVertexWithoutMarginNonVirtual;
        }
      },

      Support0: function( d ) {
        return this.Ls.call( this.shapes0, d );
      },

      Support1: function( d ) {
        return this.toshape0.multiplyVector( this.Ls.call( this.shapes1, this.toshape1.multiplyVector( d ) ) );
      },

      Support: function( d, index ) {
        if ( arguments.length < 2 ) {
          return this.Support0( d ).subtract( this.Support1( d.negate() ) );
        }

        if ( index ) {
          return this.Support1( d );
        } else {
          return this.Support0( d );
        }
      }

    }
  });

  var tShape = MinkowskiDiff;

  // _GJK is for referencing GJK inside of constructor named GJK.
  var _GJK, GJK;
  _GJK = GJK = Bump.type({
    init: function GJK() {
      // Default initializers
      this.shape = tShape.create();
      this.ray = Bump.Vector3.create();
      this.distance = 0;
      this.simplices = [
        _GJK.sSimplex.create(),
        _GJK.sSimplex.create()
      ];
      this.store = [
        _GJK.sSV.create(),
        _GJK.sSV.create(),
        _GJK.sSV.create(),
        _GJK.sSV.create()
      ];
      this.free = [ null, null, null, null ];
      this.nfree = 0;
      this.current = 0;
      this.simplex = null;
      this.status = 0;
      // End default initializers

      this.Initialize();
    },

    members: {
      Initialize: function() {
        this.ray.setValue( 0, 0, 0 );
        this.nfree = 0;
        this.status = GJK.eStatus.Failed;
        this.current = 0;
        this.distance = 0;
      },

      Evaluate: function( shapearg, guess ) {
        var eStatus      = GJK.eStatus;
        var m_simplices  = this.simplices;
        var m_ray        = this.ray;
        var m_free       = this.free;
        var m_store      = this.store;

        var iterations = 0;
        var sqdist     = 0;
        var alpha      = 0;
        var lastw;              // lastw initialized below
        var clastw     = 0;

        // Initialize solver
        m_free[0]     = m_store[0];
        m_free[1]     = m_store[1];
        m_free[2]     = m_store[2];
        m_free[3]     = m_store[3];
        this.nfree    = 4;
        this.current  = 0;
        this.status   = eStatus.Valid;
        this.shape    = shapearg;
        this.distance = 0;

        // Initialize simplex
        m_simplices[0].rank = 0;
        m_ray.assign( guess );
        var sqrl = m_ray.length2();
        this.appendvertice( m_simplices[0], sqrl > 0 ? m_ray.negate() : Bump.Vector3.create( 1, 0, 0 ) );
        m_simplices[0].p[0] = 1;
        m_ray.assign( m_simplices[0].c[0].w );
        sqdist = sqrl;
        lastw = [               // lastw initialized here
          m_ray.clone(),
          m_ray.clone(),
          m_ray.clone(),
          m_ray.clone()
        ];

        // Loop
        var i;
        do {
          var next = 1 - this.current;
          var cs = m_simplices[ this.current ];
          var ns = m_simplices[ next ];

          // Check zero
          var rl = m_ray.length();
          if ( rl < GJK_MIN_DISTANCE ) {
            // Touching or inside
            this.status = eStatus.Inside;
            break;
          }

          // Append new vertice in -'v' direction
          this.appendvertice( cs, m_ray.negate() );
          var w = cs.c[ cs.rank - 1 ].w;
          var found = false;
          for ( i = 0; i < 4; ++i ) {
            if ( w.subtract( lastw[i] ).length2() < GJK_DUPLICATED_EPS ) {
              found = true;
              break;
            }
          }

          if ( found ) {
            // Return old simplex
            this.removevertice( m_simplices[ this.current ] );
            break;
          } else {
            // Update lastw
            lastw[ clastw = (( clastw + 1 ) & 3) ].assign( w );
          }

          // Check for termination
          var omega = m_ray.dot( w ) / rl;
          alpha = Math.max( omega, alpha );
          if ( ( ( rl - alpha ) - ( GJK_ACCURARY * rl ) ) <= 0 ) {
            // Return old simplex
            this.removevertice( m_simplices[ this.current ] );
            break;
          }

          // Reduce simplex
          var weights = [ 0, 0, 0, 0 ];
          var maskRef = { value: 0 };
          switch ( cs.rank ) {
          case 2:
            sqdist = this.projectorigin2( cs.c[0].w,
                                          cs.c[1].w,
                                          weights, maskRef );
            break;
          case 3:
            sqdist = this.projectorigin3( cs.c[0].w,
                                          cs.c[1].w,
                                          cs.c[2].w,
                                          weights, maskRef );
            break;
          case 4:
            sqdist = this.projectorigin4( cs.c[0].w,
                                          cs.c[1].w,
                                          cs.c[2].w,
                                          cs.c[3].w,
                                          weights, maskRef );
            break;
          }
          var mask = maskRef.value;

          if ( sqdist >= 0 ) {
            // Valid
            ns.rank = 0;
            m_ray.setValue( 0, 0, 0 );
            this.current = next;
            var ni;
            for ( i = 0, ni = cs.rank; i < ni; ++i ) {
              if ( mask & ( 1 << i ) ) {
                ns.c[ ns.rank   ] = ( cs.c[i] );
                ns.p[ ns.rank++ ] = weights[i];
                m_ray.addSelf( cs.c[i].w.multiplyScalar( weights[i] ) );
              } else {
                m_free[ this.nfree++ ] = cs.c[i];
              }
            }
            if ( mask === 15 ) {
              this.status = eStatus.Inside;
            }
          }

          // Return old simplex
          else {
            this.removevertice( m_simplices[ this.current ] );
            break;
          }

          this.status = ( (++iterations) < GJK_MAX_ITERATIONS ) ? this.status : eStatus.Failed;
        } while ( this.status === eStatus.Valid );

        this.simplex = m_simplices[ this.current ];
        switch ( this.status ) {
        case eStatus.Valid:
          this.distance = m_ray.length();
          break;
        case eStatus.Inside:
          this.distance = 0;
          break;
        }

        return this.status;
      },

      EncloseOrigin: function() {
        var m_simplex = this.simplex;

        var i, axis;
        switch ( m_simplex.rank ) {
        case 1:
          for ( i = 0; i < 3; ++i ) {
            axis = Bump.Vector3.create( 0, 0, 0 );
            axis[i] = 1;
            this.appendvertice( m_simplex, axis );
            if ( this.EncloseOrigin() ) { return true; }
            this.removevertice( m_simplex );
            this.appendvertice( m_simplex, axis.negate() );
            if ( this.EncloseOrigin() ) { return true; }
            this.removevertice( m_simplex );
          }
          break;

        case 2:
          var d = m_simplex.c[1].w.subtract( m_simplex.c[0].w );
          for ( i = 0; i < 3; ++i ) {
            axis = Bump.Vector3.create( 0, 0, 0 );
            axis[i] = 1;
            var p = d.cross( axis );
            if ( p.length2() > 0 ) {
              this.appendvertice( m_simplex, p );
              if ( this.EncloseOrigin() ) { return true; }
              this.removevertice( m_simplex );
              this.appendvertice( m_simplex, p.negate() );
              if ( this.EncloseOrigin() ) { return true; }
              this.removevertice( m_simplex );
            }
          }
          break;

        case 3:
          var n = m_simplex.c[1].w
            .subtract( m_simplex.c[0].w )
            .cross( m_simplex.c[2].w.subtract( m_simplex.c[0].w ) );
          if ( n.length2() > 0 ) {
            this.appendvertice( m_simplex, n );
            if ( this.EncloseOrigin() ) { return true; }
            this.removevertice( m_simplex );
            this.appendvertice( m_simplex, n.negate() );
            if ( this.EncloseOrigin() ) { return true; }
            this.removevertice( m_simplex );
          }
          break;

        case    4:
          if ( Math.abs(
            this.det( m_simplex.c[0].w.subtract( m_simplex.c[3].w ),
                      m_simplex.c[1].w.subtract( m_simplex.c[3].w ),
                      m_simplex.c[2].w.subtract( m_simplex.c[3].w ) )
          ) > 0 ) {
            return true;
          }
          break;

        }
        return false;
      },

      getsupport: function( d, sv ) {
        sv.d = d.divideScalar( d.length() );
        sv.w = this.shape.Support( sv.d );
      },

      removevertice: Bump.notImplemented,

      appendvertice: function( simplex, v ) {
        simplex.p[ simplex.rank ] = 0;
        simplex.c[ simplex.rank ] = ( this.free[ --this.nfree ] );
        this.getsupport( v, simplex.c[ simplex.rank++ ] );
      },

      det: function( a, b, c ) {
        return (
          a.y * b.z * c.x + a.z * b.x * c.y -
          a.x * b.z * c.y - a.y * b.x * c.z +
          a.x * b.y * c.z - a.z * b.y * c.x
        );
      },

      projectorigin: function() {
        throw new Error( 'projectorigin is overloaded, see projectorigin[2-4]' );
      },

      projectorigin2: function( a, b, w, m ) {
        var d = b.subtract( a );
        var l = d.length2();
        if ( l > GJK_SIMPLEX2_EPS ) {
          var t = l > 0 ? -( a.dot(d) ) / l : 0;
          if      ( t >= 1 ) { w[0] = 0;   w[1] = 1 ; m.value = 2; return b.length2(); }
          else if ( t <= 0 ) { w[0] = 1;   w[1] = 0 ; m.value = 1; return a.length2(); }
          else               { w[0] = 1 - (w[1] = t); m.value = 3; return a.add( d.multiplyScalar(t) ).length2(); }
        }
        return -1;
      },

      projectorigin3: function( a, b, c, w, m ) {
        var vt = [ a, b, c ];
        var dl = [
          a.subtract( b ),
          b.subtract( c ),
          c.subtract( a )
        ];
        var n = dl[0].cross( dl[1] );
        var l = n.length2();
        if ( l > GJK_SIMPLEX3_EPS ) {
          var mindist = -1;
          var subw = [ 0, 0 ];
          var subm = { value: 0 };
          for ( var i = 0; i < 3; ++i ) {
            if ( vt[i].dot( dl[i].cross(n) ) > 0 ) {
              var j = imd3[i];
              var subd = this.projectorigin2( vt[i], vt[j], subw, subm );
              if ( (mindist < 0) || (subd < mindist) ) {
                mindist = subd;
                m.value = ( (subm.value & 1) ? 1 << i : 0 ) + ( (subm.value & 2) ? 1 << j : 0 );
                Bump.Assert( m.value >= 0 );
                w[ i ] = subw[0];
                w[ j ] = subw[1];
                w[ imd3[ j ] ] = 0;
              }
            }
          }

          if ( mindist < 0 ) {
            var d = a.dot( n );
            var s = Math.sqrt( l );
            var p = n.multiplyScalar( d / l );

            mindist = p.length2();
            m.value = 7;
            w[0]    = dl[1].cross( b.subtract(p) ).length() / s;
            w[1]    = dl[2].cross( c.subtract(p) ).length() / s;
            w[2]    = 1 - ( w[0] + w[1] );
          }
          return mindist;
        }
        return -1;
      },

      projectorigin4: function( a, b, c, d, w, m ) {
        var tmp = Bump.Vector3.create();

        var vt = [ a, b, c, d ];
        var dl = [
          a.subtract( d ),
          b.subtract( d ),
          c.subtract( d )
        ];
        var vl = this.det( dl[0], dl[1], dl[2] );
        var ng = vl *
          a.dot(
            b.subtract( c )
              .cross(
                a.subtract( b, tmp ), tmp ) ) <= 0;
        if ( ng && ( Math.abs( vl ) > GJK_SIMPLEX4_EPS ) ) {
          var mindist = -1;
          var subw = [ 0, 0, 0 ];
          var subm = { value: 0 };
          for ( var i = 0; i < 3; ++i ) {
            var j = imd3[i];
            var s = vl * d.dot( dl[i].cross( dl[j], tmp ) );
            if ( s > 0 ) {
              var subd = this.projectorigin3( vt[i], vt[j], d, subw, subm );
              if ( (mindist < 0) || (subd < mindist) ) {
                mindist = subd;
                m.value =
                  ( subm.value & 1 ? 1 << i : 0 ) +
                  ( subm.value & 2 ? 1 << j : 0 ) +
                  ( subm.value & 4 ? 8      : 0 );
                Bump.Assert( m.value >= 0 );
                w[ i ]         = subw[0];
                w[ j ]         = subw[1];
                w[ imd3[ j ] ] = 0;
                w[ 3 ]         = subw[2];
              }
            }
          }

          if ( mindist < 0 ) {
            mindist = 0;
            m.value = 15;

            w[0] = this.det( c, b, d ) / vl;
            w[1] = this.det( a, c, d ) / vl;
            w[2] = this.det( b, a, d ) / vl;
            w[3] = 1 - ( w[0] + w[1] + w[2] );
          }
          return mindist;
        }
        return -1;
      }

    },

    typeMembers: {
      sSV: Bump.type({
        init: function sSV() {
          this.d = Bump.Vector3.create();
          this.w = Bump.Vector3.create();
        },

        members: {
          assign: function( other ) {
            this.d.assign( other.d );
            this.w.assign( other.d );
          }
        }
      }),

      sSimplex: Bump.type({
        init: function sSimplex() {
          this.c = [ null, null, null, null ];
          this.p = new Float64Array(4);
          this.rank = 0;
        }
      }),

      eStatus: Bump.Enum([
        'Valid',
        'Inside',
        'Failed'
      ])

    }
  });

  // _EPA is for referencing EPA inside of constructor named EPA.
  var EPA, _EPA;
  EPA = _EPA = Bump.type({
    init: function EPA() {
      var i;

      // Default initializers
      this.status = 0;
      this.result = GJK.sSimplex.create();
      this.normal = Bump.Vector3.create();
      this.depth  = 0;

      this.sv_store = new Array( EPA_MAX_VERTICES );
      for ( i = 0; i < this.sv_store.length; ++i ) {
        this.sv_store[i] = _EPA.sSV.create();
      }

      this.fc_store = new Array( EPA_MAX_FACES );
      for ( i = 0; i < this.fc_store.length; ++i ) {
        this.fc_store[i] = _EPA.sFace.create();
      }

      this.nextsv = 0;
      this.hull   = _EPA.sList.create();
      this.stock  = _EPA.sList.create();
      // End default initializers

      this.Initialize();
    },

    members: {
      Initialize: function() {
        this.status = EPA.eStatus.Failed;
        this.normal.setValue( 0, 0, 0 );
        this.depth  = 0;
        this.nextsv = 0;
        for ( var i = 0; i < EPA_MAX_FACES; ++i ) {
          EPA.append( this.stock, this.fc_store[ EPA_MAX_FACES - i - 1 ] );
        }
      },

      Evaluate: function( gjk, guess ) {
        var tmpVec1    = Bump.Vector3.create();
        var tmpVec2    = Bump.Vector3.create();
        var bind       = EPA.bind;
        var append     = EPA.append;
        var remove     = EPA.remove;
        var eStatus    = EPA.eStatus;
        var m_result   = this.result;
        var m_hull     = this.hull;
        var m_stock    = this.stock;
        var m_sv_store = this.sv_store;

        var simplex = gjk.simplex;
        if ( ( simplex.rank > 1 ) && gjk.EncloseOrigin() ) {
          // Clean up
          while ( m_hull.root ) {
            var f = m_hull.root;
            remove( m_hull, f );
            append( m_stock, f );
          }
          this.status = eStatus.Valid;
          this.nextsv = 0;

          // Orient simplex
          if ( gjk.det( simplex.c[0].w.subtract( simplex.c[3].w ),
                        simplex.c[1].w.subtract( simplex.c[3].w ),
                        simplex.c[2].w.subtract( simplex.c[3].w ) ) < 0 )
          {
            var tmp;

            tmp = simplex.c[0];
            simplex.c[0] = simplex.c[1];
            simplex.c[1] = tmp;

            tmp = simplex.p[0];
            simplex.p[0] = simplex.p[1];
            simplex.p[1] = tmp;
          }

          // Build initial hull
          var tetra = [
            this.newface( simplex.c[0], simplex.c[1], simplex.c[2], true ),
            this.newface( simplex.c[1], simplex.c[0], simplex.c[3], true ),
            this.newface( simplex.c[2], simplex.c[1], simplex.c[3], true ),
            this.newface( simplex.c[0], simplex.c[2], simplex.c[3], true )
          ];

          if ( m_hull.count === 4 ) {
            var best  = this.findbest();
            var outer = best.clone();
            var pass  = 0;
            var iterations = 0;
            bind( tetra[0], 0, tetra[1], 0 );
            bind( tetra[0], 1, tetra[2], 0 );
            bind( tetra[0], 2, tetra[3], 0 );
            bind( tetra[1], 1, tetra[3], 2 );
            bind( tetra[1], 2, tetra[2], 1 );
            bind( tetra[2], 2, tetra[3], 1 );
            this.status = eStatus.Valid;
            for ( ; iterations < EPA_MAX_ITERATIONS; ++iterations ) {
              if ( this.nextsv < EPA_MAX_VERTICES ) {
                var horizon = EPA.sHorizon.create();
                // w is supposed to be a sSV*, but its never used like an array,
                // for now.
                var w = m_sv_store[ this.nextsv++ ];
                var valid = true;
                best.pass[0] = ++pass;
                gjk.getsupport( best.n, w );
                var wdist = best.n.dot( w.w ) - best.d;
                if ( wdist > EPA_ACCURACY ) {
                  for ( var j = 0; ( j < 3 ) && valid; ++j ) {
                    valid = valid &&
                      this.expand( pass, w, best.f[j], best.e[j], horizon );
                  }

                  if ( valid && ( horizon.nf >= 3 ) ) {
                    bind( horizon.cf, 1, horizon.ff, 2 );
                    remove( m_hull, best );
                    append( m_stock, best );
                    best = this.findbest();
                    if ( best.p >= outer.p ) { outer.assign( best ); }
                  } else { this.status = eStatus.InvalidHull; break; }
                } else { this.status = eStatus.AccuraryReached; break; }
              } else { this.status = eStatus.OutOfVertices; break; }
            }

            var projection = outer.n.multiplyScalar( outer.d );
            this.normal.assign( outer.n );
            this.depth    = outer.d;
            m_result.rank = 3;
            m_result.c[0] = outer.c[0];
            m_result.c[1] = outer.c[1];
            m_result.c[2] = outer.c[2];
            m_result.p[0] = outer.c[1].w
              .subtract( projection, tmpVec1 )
              .cross( outer.c[2].w.subtract( projection, tmpVec2 ), tmpVec1 )
              .length();
            m_result.p[1] = outer.c[2].w
              .subtract( projection, tmpVec1 )
              .cross( outer.c[0].w.subtract( projection, tmpVec2 ), tmpVec1 )
              .length();
            m_result.p[2] = outer.c[0].w
              .subtract( projection, tmpVec1 )
              .cross( outer.c[1].w.subtract( projection, tmpVec2 ), tmpVec1 )
              .length();

            var sum        = m_result.p[0] + m_result.p[1] + m_result.p[2];
            m_result.p[0] /= sum;
            m_result.p[1] /= sum;
            m_result.p[2] /= sum;
            return this.status;
          }
        }

        // Fallback
        var m_normal = this.normal;
        this.status = eStatus.FallBack;
        m_normal.assign( guess.negate() );
        var nl = m_normal.length();
        if ( nl > 0 ) {
          m_normal.divideScalarSelf( nl );
        } else {
          m_normal.setValue( 1, 0, 0 );
        }
        this.depth = 0;
        m_result.rank = 1;
        m_result.c[0] = simplex.c[0];
        m_result.p[0] = 1;
        return this.status;
      },

      newface: function( a, b, c, forced ) {
        var eStatus = EPA.eStatus;
        var m_stock = this.stock;

        if ( m_stock.root ) {
          var face = m_stock.root;
          EPA.remove( m_stock, face );
          EPA.append( this.hull, face );
          face.pass[0] = 0;
          face.c[0] = a;
          face.c[1] = b;
          face.c[2] = c;
          face.n.assign( b.w.subtract(a.w).cross( c.w.subtract(a.w) ) );

          var l = face.n.length();
          var v = l > EPA_ACCURACY;
          face.p = Math.min(
            a.w.dot( face.n.cross( a.w.subtract(b.w) ) ),
            b.w.dot( face.n.cross( b.w.subtract(c.w) ) ),
            c.w.dot( face.n.cross( c.w.subtract(a.w) ) )
          ) / ( v ? l : 1 );
          face.p = face.p >= -EPA_INSIDE_EPS ? 0 : face.p;

          if ( v ) {
            face.d = a.w.dot( face.n ) / l;
            face.n.divideScalarSelf( l );
            if ( forced || ( face.d >= -EPA_PLANE_EPS ) ) {
              return face;
            } else { this.status = eStatus.NonConvex; }
          } else { this.status = eStatus.Degenerated; }

          EPA.remove( this.hull, face );
          EPA.append( m_stock, face );
          return null;
        }
        this.status = m_stock.root ? eStatus.OutOfVertices : eStatus.OutOfFaces;
        return null;
      },

      findbest: function() {
        var minf = this.hull.root;
        var mind = minf.d * minf.d;
        var maxp = minf.p;
        for ( var f = minf.l[1]; f; f = f.l[1] ) {
          var sqd = f.d * f.d;
          if ( ( f.p >= maxp ) && ( sqd < mind ) ) {
            minf = f;
            mind = sqd;
            maxp = f.p;
          }
        }
        return minf;
      },

      expand: function( pass, w, f, e, horizon ) {
        if ( f.pass[0] !== pass ) {
          var e1 = i1m3[e];
          if ( ( f.n.dot(w.w) - f.d ) < -EPA_PLANE_EPS ) {
            var nf = this.newface( f.c[e1], f.c[e], w, false );
            if ( nf ) {
              EPA.bind( nf, 0, f, e );
              if ( horizon.cf ) {
                EPA.bind( horizon.cf, 1, nf, 2 );
              } else {
                horizon.ff = nf;
              }
              horizon.cf = nf;
              ++horizon.nf;
              return true;
            }
          }

          else {
            var e2 = i2m3[e];
            f.pass[0] = pass;
            if ( this.expand( pass, w, f.f[e1], f.e[e1], horizon ) &&
                 this.expand( pass, w, f.f[e2], f.e[e2], horizon ) )
            {
              EPA.remove( this.hull, f );
              EPA.append( this.stock, f );
              return true;
            }
          }
        }

        return false;
      }

    },

    typeMembers: {
      bind: function( fa, ea, fb, eb ) {
        fa.e[ea] = eb; fa.f[ea] = fb;
        fb.e[eb] = ea; fb.f[eb] = fa;
      },

      append: function( list, face ) {
        face.l[0] = null;
        face.l[1] = list.root;
        if ( list.root ) { list.root.l[0] = face; }
        list.root = face;
        ++list.count;
      },

      remove: function( list, face ) {
        if ( face.l[1] ) { face.l[1].l[0] = face.l[0]; }
        if ( face.l[0] ) { face.l[0].l[1] = face.l[1]; }
        if ( face === list.root ) { list.root = face.l[1]; }
        --list.count;
      },

      sSV: GJK.sSV,

      sFace: Bump.type({
        init: function sFace() {
          this.n = Bump.Vector3.create();
          this.d = 0;
          this.p = 0;
          this.c = [ null, null, null ];
          this.f = [ null, null, null ];
          this.l = [ null, null ];

          var buffer = new ArrayBuffer( 4 );
          this.e    = new Uint8Array( buffer, 0, 3 );
          this.pass = new Uint8Array( buffer, 3, 1 );
        },

        members: {
          clone: function( dest ) {
            if ( !dest ) { dest = EPA.sFace.create(); }
            dest.n.assign( this.n );
            dest.d = this.d;
            dest.p = this.p;
            for ( var i = 0; i < 3; ++i ) {
              dest.c[i] = this.c[i];
              dest.f[i] = this.f[i];
            }
            dest.l[0] = this.l[0];
            dest.l[1] = this.l[1];

            dest.e.set( this.e );
            dest.pass.set( this.pass );
            return dest;
          },

          assign: function( other ) {
            this.n.assign( other.n );
            this.d = other.d;
            this.p = other.p;
            for ( var i = 0; i < 3; ++i ) {
              this.c[i] = other.c[i];
              this.f[i] = other.f[i];
            }
            this.l[0] = other.l[0];
            this.l[1] = other.l[1];

            this.e.set( other.e );
            this.pass.set( other.pass );
            return this;
          }

        }
      }),

      sList: Bump.type({
        init: function sList() {
          this.root = null;
          this.count = 0;
        }
      }),

      sHorizon: Bump.type({
        init: function sHorizon() {
          this.cf = null;
          this.ff = null;
          this.nf = 0;
        }
      }),

      eStatus: Bump.Enum([
        'Valid',
        'Touching',
        'Degenerated',
        'NonConvex',
        'InvalidHull',
        'OutOfFaces',
        'OutOfVertices',
        'AccuraryReached',
        'FallBack',
        'Failed'
      ])

    }
  });

  var Initialize = function Initialize(
    shape0, wtrs0,
    shape1, wtrs1,
    results,
    shape,
    withmargins
  ) {
    // Results
    results.witnesses0.assign(
      results.witnesses1.assign( Bump.Vector3.create( 0, 0, 0 ) )
    );
    results.status = Bump.GjkEpaSolver2.sResults.eStatus.Separated;
    // Shape
    shape.shapes0 = shape0;
    shape.shapes1 = shape1;
    shape.toshape1.assign( wtrs1.basis.transposeTimes( wtrs0.basis ) );
    shape.toshape0.assign( wtrs0.inverseTimes( wtrs1 ) );
    shape.EnableMargin( withmargins );
  };

  var GjkEpaSolver2 = function GjkEpaSolver2() {};
  GjkEpaSolver2.prototype = {
    sResults: Bump.type({
      init: function GjkEpaSolver2sResults() {
        // Default initializers
        this.witnesses0 = Bump.Vector3.create();
        this.witnesses1 = Bump.Vector3.create();
        this.normal = Bump.Vector3.create();
        this.distance = 0;
        // End default initializers
      },

      members: {
        clone: function( dest ) {
          dest = dest || Bump.GjkEpaSolver2.sResults.create();

          dest.witnesses0.assign( this.witnesses0 );
          dest.witnesses1.assign( this.witnesses1 );
          dest.normal.assign( this.normal );
          dest.distance = this.distance;

          return dest;
        },

        assign: function( other ) {
          this.witnesses0.assign( other.witnesses0 );
          this.witnesses1.assign( other.witnesses1 );
          this.normal.assign( other.normal );
          this.distance = other.distance;

          return this;
        }
      },

      typeMembers: {
        eStatus: Bump.Enum([
          'Separated',     // Shapes doesnt penetrate
          'Penetrating',   // Shapes are penetrating
          'GJK_Failed',    // GJK phase fail, no big issue, shapes are probably
                           // just 'touching'.
          'EPA_Failed'     // EPA phase fail, bigger problem, need to save
                           // parameters, and debug
        ])

      }
    }),

    StackSizeRequirement: Bump.notImplemented,
    Distance: Bump.notImplemented,

    Penetration: function(
      shape0,                   // const ConvexShape*
      wtrs0,                    // const Transform&
      shape1,                   // const ConvexShape*
      wtrs1,                    // const Transform&
      guess,                    // const btVector3&
      results,                  // sResults&
      usemargins                // bool = true
    ) {
      if ( arguments.length < 7 ) {
        usemargins = true;
      }

      var GJK_eStatus = GJK.eStatus;
      var sResults_eStatus = Bump.GjkEpaSolver2.sResults.eStatus;

      var shape = tShape.create();
      Initialize( shape0, wtrs0, shape1, wtrs1, results, shape, usemargins );
      var gjk = GJK.create();

      var gjk_status = gjk.Evaluate( shape, guess.negate() );
      switch ( gjk_status ) {
      case GJK_eStatus.Inside:
        var epa = EPA.create();
        var epa_status = epa.Evaluate( gjk, guess.negate() );
        if ( epa_status !== EPA.eStatus.Failed ) {
          var w0 = Bump.Vector3.create( 0, 0, 0 );
          for ( var i = 0; i < epa.result.rank; ++i ) {
            w0.addSelf( shape.Support( epa.result.c[i].d, 0 ).multiplyScalar( epa.result.p[i] ) );
          }

          results.status = sResults_eStatus.Penetrating;
          results.witnesses0.assign( wtrs0.multiplyVector( w0 ) );
          results.witnesses1.assign( wtrs0.multiplyVector( w0.subtract( epa.normal.multiplyScalar( epa.depth ) ) ) );
          results.normal.assign( epa.normal.negate() );
          results.distance = -epa.depth;
          return true;
        } else {
          results.status = sResults_eStatus.EPA_Failed;
        }
        break;
      case GJK_eStatus.Failed:
        results.status = sResults_eStatus.GJK_Failed;
        break;
      }
      return false;
    },

    SignedDistance: Bump.notImplemented
  };
  GjkEpaSolver2.prototype.constructor = GjkEpaSolver2;

  Bump.GjkEpaSolver2 = new GjkEpaSolver2();

})( this, this.Bump );
