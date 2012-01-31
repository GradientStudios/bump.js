(function( window, Bump ) {

  Bump.Element = Bump.type({
    init: function Element() {
      this.id = 0;
      this.sz = 0;

      return this;
    },

    members: {
      clone: function( dest ) {
        dest = dest || Bump.Element.create();

        dest.id = this.id;
        dest.sz = this.sz;

        return dest;
      },

      assign: function( other ) {
        this.id = other.id;
        this.sz = other.sz;

        return this;
      }
    }
  });

  Bump.UnionFindElementSortPredicate = Bump.type({
    typeMembers: {
      _functor: function( lhs, rhs ) {
        return lhs.id < rhs.id;
      },

      create: function() {
        return this._functor;
      }
    }
  });

  Bump.UnionFind = Bump.type({
    init: function UnionFind() {
      this.elements = [];
    },

    members: {
      destruct: function() {
        this.Free();
      },

      clone: function( dest ) {
        dest = dest || Bump.UnionFind.create();

        dest.elements.length = this.elements.length;
        for ( var i = 0; i < this.elements.length; ++i ) {
          dest.elements[i] = this.elements[i].clone();
        }

        return dest;
      },

      assign: function( other ) {
        this.elements.length = 0;
        this.elements.length = other.elements.length;

        for ( var i = 0; i < this.elements.length; ++i ) {
          this.elements[i] = other.elements[i].clone();
        }

        return this;
      },

      sortIslands: function() {
        // First store the original body index, and islandId
        var numElements = this.elements.length;

        for ( var i = 0; i < numElements; ++i ) {
          this.elements[i].id = this.find( i );
        }

        Bump.quickSort( this.elements, Bump.UnionFindElementSortPredicate.create() );
      },

      reset: function( N ) {
        this.allocate( N );

        for ( var i = 0; i < N; ++i ) {
          this.elements[i].id = i;
          this.elements[i].sz = 1;
        }
      },

      getNumElements: function() {
        return this.elements.length;
      },

      isRoot: function( x ) {
        return ( x === this.elements[x].id );
      },

      getElement: function( index ) {
        return this.elements[index];
      },

      allocate: function( N ) {
        Bump.resize( this.elements, N, Bump.Element.create() );
      },

      Free: function() {
        Bump.resize( this.elements, 0 );
      },

      find: function( p, q ) {
        if ( q === undefined ) {
          while ( p !== this.elements[p].id ) {
            var elementPtr = this.elements[ this.elements[p].id ];
            this.elements[p].id = elementPtr.id;
            p = elementPtr.id;
          }
          return p;
        }

        return ( this.find( p ) === this.find( q ) );
      },

      unite: function( p, q ) {
        var i = this.find( p ), j = this.find( q );
        if ( i === j ) {
          return;
        }

        this.elements[i].id = j;
        this.elements[j].sz += this.elements[i].sz;
      }

    }
  });

})( this, this.Bump );
