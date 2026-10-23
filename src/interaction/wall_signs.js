import * as THREE from 'three';
import { building } from '../data/building_measurements.js';
import { sign_catalog } from '../data/sign_catalog.js';
import { photo_bundle } from '../generated/photo_bundle.js';

const storage_key = 'letreros-positions-v3';
const wall_offset = 0.06;
const sidewalk_margin = 0.4;
const texture_loader = new THREE.TextureLoader();

const walls = {
  calle_12: {
    plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), -wall_offset), normal: new THREE.Vector3(0, 0, 1), rotation_y: 0,
    nearest: 0.2, farthest: building.calle_12_facade_length - 0.5, top: building.total_height,
    to_position: (distance, height) => new THREE.Vector3(-distance, height, wall_offset), to_distance: point => -point.x,
  },
  carrera_7: {
    plane: new THREE.Plane(new THREE.Vector3(1, 0, 0), -wall_offset), normal: new THREE.Vector3(1, 0, 0), rotation_y: Math.PI / 2,
    nearest: building.corner_pier_depth + 0.2, farthest: building.carrera_7_facade_length - 0.5, top: building.ground_floor_height,
    to_position: (distance, height) => new THREE.Vector3(wall_offset, height, -distance), to_distance: point => -point.z,
  },
};

export function build_wall_signs(scene) {
  const saved_placements = load_placements();
  return sign_catalog.map(entry => create_wall_sign(scene, entry, saved_placements[entry.key]));
}

// Clamps the sign inside its wall, between the sidewalk and the wall top.
export function move_sign(sign, [distance, height]) {
  const { wall, size: [width, sign_height] } = sign;
  const clamped_distance = THREE.MathUtils.clamp(distance, wall.nearest + width / 2, wall.farthest - width / 2);
  const clamped_height = THREE.MathUtils.clamp(height, sidewalk_margin + sign_height / 2, wall.top - 0.2 - sign_height / 2);
  sign.placement = [clamped_distance, clamped_height];
  sign.group.position.copy(wall.to_position(clamped_distance, clamped_height));
}

export function reset_signs(signs) {
  signs.forEach(sign => move_sign(sign, [sign.entry.distance_from_corner, sign.entry.center_height]));
  save_placements(signs);
}

export function save_placements(signs) {
  const placements = Object.fromEntries(signs.map(sign => [sign.entry.key, sign.placement]));
  try { localStorage.setItem(storage_key, JSON.stringify(placements)); } catch (storage_error) { console.warn('Sign positions not saved', storage_error); }
}

function load_placements() {
  try { return JSON.parse(localStorage.getItem(storage_key) || '{}'); } catch (storage_error) { return {}; }
}

function create_wall_sign(scene, entry, saved_placement) {
  const image = photo_bundle[entry.key];
  const size = [entry.width, entry.width * image.height / image.width];
  const group = new THREE.Group();
  const hit_meshes = [create_face(entry, image, size)];
  if (entry.has_backing) hit_meshes.push(create_backing(size));
  group.add(...hit_meshes);
  group.rotation.y = walls[entry.wall].rotation_y;
  scene.add(group);
  const sign = { entry, wall: walls[entry.wall], size, group, hit_meshes };
  hit_meshes.forEach(mesh => { mesh.userData.sign = sign; });
  move_sign(sign, saved_placement || [entry.distance_from_corner, entry.center_height]);
  return sign;
}

function create_face(entry, image, size) {
  const texture = texture_loader.load(image.source);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const material = new THREE.MeshStandardMaterial({ map: texture, transparent: !entry.has_backing, roughness: 0.6 });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(...size), material);
  face.position.z = 0.03;
  return face;
}

function create_backing([width, height]) {
  const backing = new THREE.Mesh(new THREE.BoxGeometry(width + 0.08, height + 0.08, 0.04), new THREE.MeshStandardMaterial({ color: 0x222222 }));
  backing.castShadow = true;
  return backing;
}
