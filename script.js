async function setup(canvas) {
  // setup renderer
  let renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.width, canvas.height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // set up camera
  let camera = new THREE.PerspectiveCamera(
    45,
    canvas.width / canvas.height,
    1,
    4000
  );
  camera.position.set(0, 10, -5);

  // set up orbit controls
  let controls = new THREE.OrbitControls(camera, renderer.domElement);

  // set up scene
  let scene = new THREE.Scene();
  scene.add(camera);

  // set up lights
  let mainLight = new THREE.PointLight(0xffffff, 1, 0, 5);
  mainLight.position.set(0, 30, 0);
  mainLight.castShadow = true;
  scene.add(mainLight);

  // set up lights
  let ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);

  // set up plane
  let plane = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200, 50, 50),
    new THREE.MeshPhongMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    })
  );
  plane.position.set(0, 0, 0);
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;

  scene.add(plane);

  // get bunny path
  let bunnyPath = generateBunnyPath();
  let bunnyRotation = generateRotation(bunnyPath);

  // set up bunny
  new THREE.OBJLoader().load('./assets/bunny.obj', bunny => {
    let texture = new THREE.TextureLoader().load('./assets/bunny.jpg');
    bunny.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.material.map = texture;
        child.castShadow = true;
      }
    });
    bunny.scale.set(32, 32, 32);
    bunny.position.set(0, 0, 0);
    scene.add(bunny);

    let bunnyAnimator = new KF.KeyFrameAnimator();
    bunnyAnimator.init({
      interps: [
        {
          ...bunnyPath,
          target: bunny.position
        },
        {
          ...bunnyRotation,
          target: bunny.rotation
        }
      ],
      loop: true,
      duration: 10000
    });
    bunnyAnimator.start();
  });

  // get bunny path
  let tortoisePath = generateTortoisePath();
  let tortoiseRotation = generateRotation(tortoisePath);

  // set up tortoise
  new THREE.OBJLoader().load('./assets/tortoise.obj', tortoise => {
    let texture = new THREE.TextureLoader().load('./assets/tortoise.jpg');
    tortoise.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.material.map = texture;
        child.castShadow = true;
      }
    });
    tortoise.position.set(0, 3, 0);
    tortoise.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);

    let obj = new THREE.Object3D();
    obj.add(tortoise);
    scene.add(obj);

    let tortoiseAnimator = new KF.KeyFrameAnimator();
    tortoiseAnimator.init({
      interps: [
        {
          ...tortoisePath,
          target: obj.position
        },
        {
          ...tortoiseRotation,
          target: obj.rotation
        }
      ],
      loop: true,
      duration: 40000
    });
    tortoiseAnimator.start();
  });

  // set up path line
  let pathGeometry = new THREE.Geometry();
  pathGeometry.vertices = tortoisePath.values;

  let pathLine = new THREE.Line(
    pathGeometry,
    new THREE.LineBasicMaterial({
      color: 0x0000ff
    })
  );

  scene.add(pathLine);

  return { renderer, scene, camera, controls };
}

function generateBunnyPath() {
  let result = { keys: [], values: [] };
  for (let i = 0; i <= 1; i += 0.0001) {
    result.keys.push(i);
    result.values.push({
      x: Math.sin(Math.PI * 2 * i) * 64,
      y: Math.abs(Math.sin(Math.PI * 10 * i)) * 16,
      z: Math.sin(Math.PI * 4 * i) * 32
    });
  }
  return result;
}

function generateTortoisePath() {
  let result = { keys: [], values: [] };
  for (let i = 0; i <= 1; i += 0.0001) {
    result.keys.push(i);
    result.values.push({
      x: Math.sin(Math.PI * 2 * i) * 64,
      y: 0,
      z: Math.sin(Math.PI * 4 * i) * 32
    });
  }
  return result;
}

function generateRotation(path) {
  let result = { keys: path.keys };
  result.values = path.values.map((el, i) => {
    if (i === path.values.length - 1) {
      return {
        x: 0,
        y:
          Math.PI / 2 +
          Math.atan2(path.values[0].x - el.x, path.values[0].z - el.z),
        z: 0
      };
    }
    return {
      x: 0,
      y:
        Math.PI / 2 +
        Math.atan2(path.values[i + 1].x - el.x, path.values[i + 1].z - el.z),
      z: 0
    };
  });
  return result;
}

function run(elements) {
  requestAnimationFrame(function() {
    run(elements);
  });

  elements.renderer.render(elements.scene, elements.camera);

  KF.update();

  elements.controls.update();
}

$(document).ready(async () => {
  let canvas = document.getElementById('bunny');
  let elements = await setup(canvas);
  run(elements);
});
