if (!Detector.webgl) Detector.addGetWebGLMessage();

var container;
var fps;
var controls;
var gui;
var guiControls;
var camera, scene, renderer;



var sphere;
var box;
var boundingBox;
var bbox_window;
var object;


var clothGeo;

var rodMat, clothMat, sphereMat;
var floorMat;
init();
animate();

function init() {

	container = document.createElement('div');
	document.body.appendChild(container);

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog(0x071330, 100, 6000);


	camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.y = 0;
	camera.position.z = 1500;
	scene.add(camera);

	renderer = new THREE.WebGLRenderer({ antialias: true, devicePixelRatio: 1 });
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(scene.fog.color);

	container.appendChild(renderer.domElement);
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.shadowMap.enabled = true;

	fps = new Stats();
	container.appendChild(fps.domElement);

	// mouse controls
	controls = new THREE.TrackballControls(camera, renderer.domElement);

	var light, materials;
	scene.add(new THREE.AmbientLight(0x666666));
	light = new THREE.DirectionalLight(0xdfebff, 0.5);
	light.position.set(50, 200, 100);
	light.position.multiplyScalar(1.3);
	light.castShadow = true;
	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;

	var d = 300;
	light.shadow.camera.left = -d;
	light.shadow.camera.right = d;
	light.shadow.camera.top = d;
	light.shadow.camera.bottom = -d;
	light.shadow.camera.far = 1000;

	scene.add(light);

	
	var loader = new THREE.TextureLoader();
	var clothTexture = loader.load("textures/patterns/clothtex.jpg");
	clothTexture.wrapS = clothTexture.wrapT = THREE.RepeatWrapping;
	clothTexture.anisotropy = 16;

	clothMat = new THREE.MeshPhongMaterial({
		color: 0x585240,
		specular: 0xDFDBD0,
		wireframeLinewidth: 2,
		// map: clothTexture,
		side: THREE.DoubleSide,
		shininess: 10,

		alphaTest: 0.5
	});

	clothGeo = new THREE.ParametricGeometry(cloth_init, cloth.w, cloth.h);
	clothGeo.dynamic = true;
	object = new THREE.Mesh(clothGeo, clothMat);
	object.position.set(0, 0, 0);
	object.castShadow = true;

	scene.add(object); 


	var sphereGeo = new THREE.SphereGeometry(sphereSize, 20, 20);
	sphereMat = new THREE.MeshPhongMaterial({
		color: 0xaaaaaa,
		side: THREE.DoubleSide,
		transparent: true,
		opacity: 0.01
	});
	sphere = new THREE.Mesh(sphereGeo, sphereMat);
	sphere.castShadow = true;
	sphere.receiveShadow = true;
	scene.add(sphere); 

	var floorTex = loader.load("textures/terrain/floor2.jpg");
	floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
	floorTex.repeat.set(25, 25);
	floorTex.anisotropy = 16;

	floorMat = new THREE.MeshPhongMaterial(
		{
			color: 0x404761,
			specular: 0x404761,
			map: floorTex
		});

	var floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(20000, 20000), floorMat);
	floor.position.y = -229;
	floor.rotation.x = - Math.PI / 2;
	floor.receiveShadow = true;
	scene.add(floor); 


	var hangingRodGeo = new THREE.CylinderGeometry(5, 5, 1000, 10);
	rodMat = new THREE.MeshPhongMaterial({ color: 0x523A28, specular: 0x111111, shininess: 100, side: THREE.DoubleSide });

	
	var hangingRod = new THREE.Mesh(hangingRodGeo, rodMat);
	hangingRod.position.x = 0;
	hangingRod.position.z = -250;
	hangingRod.position.y = 500;
	hangingRod.receiveShadow = true;
	hangingRod.castShadow = true;
	hangingRod.rotation.z = 0.5 * Math.PI;

	scene.add(hangingRod);

	var boxGeo = new THREE.BoxGeometry(400, 500, 200);
	box = new THREE.Mesh(boxGeo, sphereMat);
	box.position.x = 0;
	box.position.y = 0;
	box.position.z = 0;
	box.receiveShadow = true;
	box.castShadow = true;
	scene.add(box);

	boxGeo.computeBoundingBox();
	boundingBox = box.geometry.boundingBox.clone();

	console.log('bounding box coordinates: ' + '(' + boundingBox.min.x + ', ' + boundingBox.min.y + ', ' + boundingBox.min.z + '), ' + '(' + boundingBox.max.x + ', ' + boundingBox.max.y + ', ' + boundingBox.max.z + ')' );

	window.addEventListener('resize', onWindowResize, false);


	obstacles('Sphere');


	var loadOBJ = function () {
		var manager = new THREE.LoadingManager();
		var loader = new THREE.OBJLoader(manager);

		loader.load('window3.obj', function (object) {
			banana = object;
			//Move the banana in the scene
			//   banana.rotation.x= -30 ;
			banana.scale.set(5, 6, 5)
			banana.position.y = 83;
			banana.position.z = -300;
			// Go through all children of the loaded object and search for a Mesh
			object.traverse(function (child) {
				//This allow us to check if the children is an instance of the Mesh constructor
				if (child instanceof THREE.Mesh) {
					child.material.color = new THREE.Color(0X783F04);
					//Sometimes there are some vertex normals missing in the .obj files, ThreeJs will compute them
					child.geometry.computeVertexNormals();
					child.geometry.computeBoundingBox();
					bbox_window = child.geometry.boundingBox;

					// // compute overall bbox
					// minX = Math.min(minX, bBox.min.x);
					// minY = Math.min(minY, bBox.min.y);
					// minZ = Math.min(minZ, bBox.min.z);
					// maxX = Math.max(maxX, bBox.max.x);
					// maxY = Math.max(maxY, bBox.max.y);
					// maxZ = Math.max(maxZ, bBox.max.z);
				}
			});
		

			// scene.add(banana);
			render();
		});
	};

	loadOBJ();
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

	requestAnimationFrame(animate);

	var time = Date.now();

	clothsim(time); 
	render(); 		
	fps.update();
	controls.update();

}


function restartCloth() {
	scene.remove(object);
	cloth = new Cloth(x_div, y_div, fabricLength, fabricWidth);

	g = new THREE.Vector3(0, - GRAVITY, 0).multiplyScalar(MASS);

	clothGeo = new THREE.ParametricGeometry(cloth_init, x_div, y_div);
	clothGeo.dynamic = true;

	object = new THREE.Mesh(clothGeo, clothMat);
	object.castShadow = true;

	scene.add(object); 
}

function render() {

	var timer = Date.now() * 0.0002;


	var p = cloth.particles;
	for (var i = 0, il = p.length; i < il; i++) {
		clothGeo.vertices[i].copy(p[i].pos);
	}

	clothGeo.computeFaceNormals();
	clothGeo.computeVertexNormals();

	clothGeo.normalsNeedUpdate = true;
	clothGeo.verticesNeedUpdate = true;


	camera.lookAt(scene.position);
	renderer.render(scene, camera);
}
