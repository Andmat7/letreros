import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const sky_color = 0xc9d3dd;

export function create_stage(canvas) {
  const renderer = create_renderer(canvas);
  const scene = create_scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  // The default zoom jumps several meters per wheel tick or trackpad gesture; a gentler speed keeps it controllable.
  controls.zoomSpeed = 0.35;
  controls.maxPolarAngle = Math.PI / 2 - 0.03;
  controls.minDistance = 1;
  controls.maxDistance = 90;
  const resize = () => fit_to_window(renderer, camera);
  addEventListener('resize', resize);
  resize();
  return { renderer, scene, camera, controls };
}

function create_renderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  return renderer;
}

function create_scene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(sky_color);
  scene.fog = new THREE.Fog(sky_color, 60, 140);
  scene.add(new THREE.HemisphereLight(0xe8eef5, 0x6b5a4a, 1.1));
  scene.add(create_sun());
  return scene;
}

function create_sun() {
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(25, 40, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45 });
  return sun;
}

function fit_to_window(renderer, camera) {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
