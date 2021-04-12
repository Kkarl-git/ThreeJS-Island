import { Water } from './examples/jsm/objects/Water.js';
import { Sky } from './examples/jsm/objects/Sky.js';
import Stats from './examples/jsm/libs/stats.module.js';
import { OrbitControls } from './examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, water, sun, mesh, controls, stats, object1,object2,object3,object4,object5,object6;


function init() {

	// Check if WebGL is available see Three/examples
	// No need for webgl2 here - change as appropriate
	if ( THREE.WEBGL.isWebGLAvailable() === false ) {

		// if not print error on console and exit
		document.body.appendChild( WEBGL.getWebGLErrorMessage() );

	}
	var container = document.createElement( 'div' );
	document.body.appendChild( container );
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	document.body.appendChild( renderer.domElement );

	function loadModel() {
		object1.traverse( function ( child ) {
			if ( child.isMesh ) { child.material.map = texture }

			//adjust these parameters to scale or more the island
			object1.position.y  = -1.2;
			object1.scale.set(20,20,20);
		});
		object2.traverse( function ( child1 ) {
			if ( child1.isMesh ) { child1.material.map = texture }
			object2.position.y  = 0;
			object2.position.z = -6;
			object2.scale.set(0.025,0.025,0.025);
		});
		object3.traverse( function ( child1 ) {
			if ( child1.isMesh ) { child1.material.map = texture }
			object3.position.y  = 0;
			object3.position.z = 6;
			object3.rotation.y = 35;
			object3.rotation.z = Math.PI/90;
			object3.scale.set(0.025,0.025,0.025);
		});
		object4.traverse( function ( child1 ) {
			if ( child1.isMesh ) { child1.material.map = texture }
			object4.position.y  = 5;
			object4.position.z = -6;
			object4.scale.set(3,3,3);
		});
		object5.traverse( function ( child1 ) {
			if ( child1.isMesh ) { child1.material.map = texture }
			object5.position.y  = 0;
			object5.position.x =-55;

			object5.scale.set(3,3,3);
		});
		object6.traverse( function ( child1 ) {
			if ( child1.isMesh ) { child1.material.map = texture }
			object6.position.y  = 10;
			object6.position.x = 5;

			object6.scale.set(10,10,10);
		});
	}

	var manager = new THREE.LoadingManager( loadModel );
	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
	};

	var textureLoader = new THREE.TextureLoader( manager );
	var texture = textureLoader.load( 'models/sand.jpg' );

	function onProgress( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( 'model ' + Math.round( percentComplete, 2 ) + '% downloaded' );
		}
	}


	function onError() {}

	var loader = new THREE.OBJLoader( manager );

	loader.load( 'models/island.obj',
		function ( obj ) {
			object1 = obj;
			scene.add(object1);
		},
		onProgress, onError );

	loader.load('models/efha6kh63bla.obj',
		function(obj1) {
			object2 = obj1;
		},
		onProgress, onError);
	loader.load('models/efha6kh63bla.obj',
		function(obj2) {
			object3 = obj2;
		},
		onProgress, onError);
	loader.load('models/Bush1.obj',
		function(obj3) {
			object4 = obj3;
		},
		onProgress, onError);
	loader.load('models/boat.obj',
		function(obj4) {
			object5 = obj4;
		},
		onProgress, onError);
	loader.load('models/model.obj',
		function(obj5) {
			object6 = obj5;
		},
		onProgress, onError);
	scene = new THREE.Scene();
	// Create axesHelper
	var axes = new THREE.AxesHelper(250);
	scene.add(axes);

	camera = new THREE.PerspectiveCamera(55,window.innerWidth/window.innerHeight, 1, 2000);
	camera.position.set(30,30,100);
	// camera.lookAt(scene.position);

	sun = new THREE.Vector3();

	// Water

	const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );

	water = new Water(
		waterGeometry,
		{
			textureWidth: 512,
			textureHeight: 512,
			waterNormals: new THREE.TextureLoader().load( './examples/jsm/textures/waternormals.jpg', function ( texture ) {

				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

			} ),
			sunDirection: new THREE.Vector3(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			distortionScale: 3.7,
			fog: scene.fog !== undefined
		}
	);

	water.rotation.x = - Math.PI / 2;

	scene.add( water );

	// Skybox

	const sky = new Sky();
	sky.scale.setScalar( 10000 );
	scene.add( sky );

	const skyUniforms = sky.material.uniforms;

	skyUniforms[ 'turbidity' ].value = 10;
	skyUniforms[ 'rayleigh' ].value = 2;
	skyUniforms[ 'mieCoefficient' ].value = 0.005;
	skyUniforms[ 'mieDirectionalG' ].value = 0.8;

	const parameters = {
		inclination: 0.49,
		azimuth: 0.205
	};

	const pmremGenerator = new THREE.PMREMGenerator( renderer );



	const theta = Math.PI * ( parameters.inclination - 0.5 );
	const phi = -3 * Math.PI * ( parameters.azimuth - 0.5 );

	sun.x = Math.cos( phi );
	sun.y = Math.sin( phi ) * Math.sin( theta );
	sun.z = Math.sin( phi ) * Math.cos( theta );

	sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
	water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

	scene.environment = pmremGenerator.fromScene( sky ).texture;

	//

	// const geometry = new THREE.BoxGeometry( 30, 30, 30 );
	// const material = new THREE.MeshStandardMaterial( { roughness: 0 } );

	// mesh = new THREE.Mesh( geometry, material );
	// scene.add( mesh );

	//

	controls = new OrbitControls( camera, renderer.domElement );
	controls.maxPolarAngle = Math.PI * 0.495;
	controls.target.set( 0, 10, 0 );
	controls.minDistance = 40.0;
	controls.maxDistance = 200.0;
	controls.update();

	//

	stats = new Stats();
	container.appendChild( stats.dom );


	window.addEventListener( 'resize', onResize );

}
function onResize() {

	// Modify camera to keep aspect ratio
	camera.aspect = window.innerWidth / window.innerHeight;

	camera.updateProjectionMatrix();
	// If we use a canvas then we also have to worry of resizing it
	renderer.setSize( window.innerWidth, window.innerHeight );
}
function animate() {

	requestAnimationFrame( animate );

	render();

	stats.update();
}

function render() {
	setTimeout(function(){scene.add(object2);},1000);
	setTimeout(function(){scene.add(object3);},1000);
	setTimeout(function(){scene.add(object4);},1000);
	setTimeout(function(){scene.add(object5);},1000);
	setTimeout(function(){scene.add(object6);},1000);
	water.material.uniforms[ 'time' ].value += 1.0 / 500.0;
	renderer.render( scene, camera );

}
window.onload = init();
window.onload = animate();
window.addEventListener( 'resize', onResize, true );
