// load: bump.js
// load: BulletCollision/CollisionShapes/StridingMeshInterface.js

// run: LinearMath/Vector3.js
// run: BulletCollision/CollisionShapes/ConcaveShape.js

(function( window, Bump ) {

  Bump.IndexedMesh = Bump.type({
    init: function IndexedMesh() {
      // Initializer list
      this.indexType = Bump.PHY_ScalarType.PHY_INTEGER;
      this.vertexType = Bump.PHY_ScalarType.PHY_DOUBLE;
      // End initializer list

      // Default initializers
      this.numTriangles = 0;
      this.triangleIndexBase = null;
      this.triangleIndexStride = 0;
      this.numVertices = 0;
      this.vertexBase = null;
      this.vertexStride = 0;
      // End default initializers
    }
  });

  Bump.TriangleIndexVertexArray = Bump.type({
    parent: Bump.StridingMeshInterface,

    init: function TriangleIndexVertexArray() {
      this._super();

      // Initializer list
      this.hasAabb = false;
      // End initializer list

      // Default initializers
      this.indexedMeshes = [];
      this.aabbMin = Bump.Vector3.create();
      this.aabbMax = Bump.Vector3.create();
      // End default initializers
    },

    members: {
      addIndexedMesh: Bump.notImplemented,

      // Note: has default arguments
      getLockedVertexIndexBase: Bump.notImplemented,

      // Arguments are all pointers or references, so they have been collapsed
      // to a single `data` object.
      getLockedReadOnlyVertexIndexBase: function( data, subpart ) {
        if ( arguments.length < 2 ) {
          subpart = 0;
        }

        var mesh = this.indexedMeshes[ subpart ];

        data.numVerts = mesh.numVertices;
        data.vertexbase = mesh.vertexBase;

        data.type = mesh.vertexType;

        data.vertexStride = mesh.vertexStride;

        data.numFaces = mesh.numTriangles;
        data.indexbase = mesh.triangleIndexBase;
        data.indexStride = mesh.triangleIndexStride;
        data.indicesType = mesh.indexType;
      },

      // `unLockVertexBase` finishes the access to a subpart of the triangle
      // mesh. Make a call to `unLockVertexBase` when the read and write access
      // (using `getLockedVertexIndexBase`) is finished.
      unLockVertexBase: Bump.noop,
      unLockReadOnlyVertexBase: Bump.noop,

      // `getNumSubParts` returns the number of seperate subparts. Each subpart
      // has a continuous array of vertices and indices.
      getNumSubParts: function() {
        return this.indexedMeshes.length;
      },

      getIndexedMeshArray: function() {
        return this.indexedMeshes;
      },

      preallocateVertices: Bump.noop,
      preallocateIndices: Bump.noop,

      hasPremadeAabb: function() {
        return this.hasAabb;
      },

      setPremadeAabb: function( aabbMin, aabbMax ) {
        this.aabbMin.assign( aabbMin );
        this.aabbMax.assign( aabbMax );
        this.hasAabb = true;
      },

      getPremadeAabb: function( aabbMin, aabbMax ) {
        aabbMin.assign( this.aabbMin );
        aabbMax.assign( this.aabbMax );
      }

    }
  });

})( this, this.Bump );
