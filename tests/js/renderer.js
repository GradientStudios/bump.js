/*global THREE:false*/

(function( window ) {
  var updateMeshFromOptions = function( mesh, options ) {
    options = options || {};
    if ( options.position ) {
      mesh.position.x = options.position.x || options.position[0] || 0;
      mesh.position.y = options.position.y || options.position[1] || 0;
      mesh.position.z = options.position.z || options.position[2] || 0;
    }

    if ( options.rotation ) {
      mesh.quaternion.x = options.rotation.x || options.rotation[0] || 0;
      mesh.quaternion.y = options.rotation.y || options.rotation[1] || 0;
      mesh.quaternion.z = options.rotation.z || options.rotation[2] || 0;
      mesh.quaternion.w = options.rotation.w || options.rotation[3] || 1;
    }
  };

  var THREEWrapper = function constructor() {
    if ( !( this instanceof constructor ) ) {
      throw Error( 'Called as function instead of with new' );
    }
  };

  THREEWrapper.prototype = {
    init: function() {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
      this.camera.position.z = 50;
      this.camera.position.y = -5;

      this.scene.add( this.camera );

      this.faceMaterials = [];
      for ( var i = 0; i < 6; i ++ ) {
        this.faceMaterials.push( new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff }) );
      }

      this.wireMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
      this.boxMaterial = new THREE.MeshFaceMaterial();

      this.meshes = [];

      this.renderer = new THREE.WebGLRenderer();

      window.onresize = function() {
        var width = window.innerWidth;
        var height = window.innerHeight - 4;
        this.renderer.setSize( width, height );
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
      }.bind( this );

      window.onresize();

      this.renderer.domElement.id = 'game-canvas';
      document.getElementById( 'game-container' ).appendChild( this.renderer.domElement );
    },

    addBox: function( options ) {
      if ( !options ) { options = {}; }

      var index = this.meshes.length;
      var size = ( options && options.size !== undefined) ? options.size : 200;
      var materials = options.wireframe ? this.wireMaterial : this.faceMaterials;
      var geometry = new THREE.CubeGeometry( size, size, size, 1, 1, 1, materials );

      var mesh = new THREE.Mesh( geometry, this.boxMaterial );
      mesh.useQuaternion = true;

      updateMeshFromOptions( mesh, options );

      this.meshes[ index ] = mesh;
      this.scene.add( mesh );

      return mesh;
    },

    render: function( milliseconds ) {
      this.renderer.render( this.scene, this.camera );
    }
  };

  window.THREEWrapper = THREEWrapper;

})( this );
