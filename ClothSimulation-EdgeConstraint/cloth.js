let camera;
let angleY = 0; // rotation angle
let angleX = 90;
let models = [];
let numModels = 0;
let index = 0;
let scene, renderer;

function preload() {
  // Load all obj models from folder
  for (let i = 1; i < 8; i++) { // assuming there are at most 100 models in the folder
    let modelPath = `assets/model${i}.obj`;
    if (loadModel(modelPath)) {
      models.push(loadModel(modelPath));
      numModels++;
    } else {
      break; // stop loading models when there are no more files to load
    }
  }
}

function init() {
  // create a new scene
  scene = new THREE.Scene();

  // create a new camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // create a new renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // add ground plane
  let geometry = new THREE.PlaneGeometry(20, 20, 32);
  let material = new THREE.MeshBasicMaterial({color: 0x555555, side: THREE.DoubleSide});
  let plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);

  // add back wall
  let backGeometry = new THREE.PlaneGeometry(20, 20, 32);
  let backMaterial = new THREE.MeshBasicMaterial({color: 0x555555, side: THREE.DoubleSide});
  let backWall = new THREE.Mesh(backGeometry, backMaterial);
  backWall.position.set(0, 0, -10);
  scene.add(backWall);

  // Load all obj models from folder
  for (let i = 1; i < 8; i++) { // assuming there are at most 100 models in the folder
    let modelPath = `assets/model${i}.obj`;
    let loader = new THREE.OBJLoader();
    loader.load(modelPath, function(object) {
      models.push(object);
      numModels++;
      if (numModels === 1) {
        scene.add(object);
      }
    });
  }
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  angleMode(DEGREES);
  scale(120);
  rotateX(angleX);
  rotateY(angleY);
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);

  angleY += 0.5; // increment rotation angle

  if (angleY >= 360) {
    angleY = 0;
    angleX += 30;
  }

  if (angleX >= 180) {
    index += 1;
    angleX = 90;
    if (index < numModels) {
      scene.remove(models[index - 1]);
      scene.add(models[index]);
    }
  }

  if (index === numModels) {
    noLoop();
  }

  rotateX(30);
}

init();
animate();
