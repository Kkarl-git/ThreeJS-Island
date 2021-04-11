import { Water } from '../node_modules/three/examples/jsm/objects/Water.js';
import { Sky } from '../node_modules/three/examples/jsm/objects/Sky.js';
import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, water, sun, mesh, controls, stats;

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
			waterNormals: new THREE.TextureLoader().load( '../node_modules/three/examples/jsm/textures/waternormals.jpg', function ( texture ) {

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

	function updateSun() {

		const theta = Math.PI * ( parameters.inclination - 0.5 );
		const phi = 2 * Math.PI * ( parameters.azimuth - 0.5 );

		sun.x = Math.cos( phi );
		sun.y = Math.sin( phi ) * Math.sin( theta );
		sun.z = Math.sin( phi ) * Math.cos( theta );

		sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
		water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

		scene.environment = pmremGenerator.fromScene( sky ).texture;

	}

	updateSun();

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


	water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
	renderer.render( scene, camera );

}
window.onload = init;
window.onload = animate();
window.addEventListener( 'resize', onResize, true );
