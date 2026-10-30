import * as THREE from 'three';
import { building } from '../data/building_measurements.js';
import { sign_artwork } from '../data/sign_artwork.js';
import { sign_catalog } from '../data/sign_catalog.js';
import { create_board_canvas, load_artwork_image, paint_board } from './sign_artwork_canvas.js';

const storage_key = 'letreros-positions-v9';
const artwork_storage_key = 'letreros-artwork-v2';
const blank_artwork = { key: '', fit: 'contain', rotated: false };
const default_artwork = { key: 'bancolombia_nueva_1x4_6', fit: 'contain', rotated: false };
const wall_offset = 0.06;
const sidewalk_margin = 0.4;

const walls = {
  calle_12: {
    plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), -wall_offset), normal: new THREE.Vector3(0, 0, 1), rotation_y: 0,
    nearest: 0, farthest: building.calle_12_facade_length - 0.5, top: building.total_height,
    to_position: (distance, height) => new THREE.Vector3(-distance, height, wall_offset), to_distance: point => -point.x,
  },
  carrera_7: {
    plane: new THREE.Plane(new THREE.Vector3(1, 0, 0), -wall_offset), normal: new THREE.Vector3(1, 0, 0), rotation_y: Math.PI / 2,
    nearest: 0, farthest: building.carrera_7_facade_length - 0.5, top: building.ground_floor_height,
    to_position: (distance, height) => new THREE.Vector3(wall_offset, height, -distance), to_distance: point => -point.z,
  },
};

export function build_wall_signs(scene) {
  const saved_placements = load_stored(storage_key);
  const saved_artwork = load_stored(artwork_storage_key);
  const signs = sign_catalog.map(entry => create_wall_sign(scene, entry, saved_placements[entry.key]));
  signs.forEach(sign => set_sign_artwork(sign, known_artwork(saved_artwork[sign.entry.key] ?? default_artwork)));
  return signs;
}

// A design removed from the catalog may still be saved in the browser.
function known_artwork(artwork) {
  return sign_artwork.some(({ key }) => key === artwork?.key) ? artwork : blank_artwork;
}

// Paints the design on the board; the caller changes one of key, fit or rotated at a time.
export async function set_sign_artwork(sign, artwork) {
  sign.artwork = artwork;
  const image = artwork.key ? await load_artwork_image(artwork.key) : null;
  paint_board(sign.canvas, image, artwork);
  sign.texture.needsUpdate = true;
}

export function save_artwork(signs) {
  save_stored(artwork_storage_key, Object.fromEntries(signs.map(sign => [sign.entry.key, sign.artwork])));
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

function load_stored(name) {
  try { return JSON.parse(localStorage.getItem(name) || '{}'); } catch (storage_error) { return {}; }
}

function save_stored(name, value) {
  try { localStorage.setItem(name, JSON.stringify(value)); } catch (storage_error) { console.warn('Not saved', storage_error); }
}

function create_wall_sign(scene, entry, saved_placement) {
  const size = [entry.width, entry.height];
  const group = new THREE.Group();
  const canvas = create_board_canvas(size);
  const texture = new THREE.CanvasTexture(canvas);
  const hit_meshes = [create_face(size, texture), create_backing(size)];
  group.add(...hit_meshes);
  group.rotation.y = walls[entry.wall].rotation_y;
  scene.add(group);
  const sign = { entry, wall: walls[entry.wall], size, group, hit_meshes, canvas, texture, artwork: blank_artwork };
  hit_meshes.forEach(mesh => { mesh.userData.sign = sign; });
  move_sign(sign, saved_placement || [entry.distance_from_corner, entry.center_height]);
  return sign;
}

function create_face(size, texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  // The artwork emits its own light, like a lightbox, so it stays readable in the shade of the facade.
  const material = new THREE.MeshStandardMaterial({ map: texture, emissiveMap: texture, emissive: 0xffffff, emissiveIntensity: 0.45, roughness: 0.6 });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(...size), material);
  face.position.z = 0.03;
  return face;
}

function create_backing([width, height]) {
  const backing = new THREE.Mesh(new THREE.BoxGeometry(width + 0.08, height + 0.08, 0.04), new THREE.MeshStandardMaterial({ color: 0x222222 }));
  backing.castShadow = true;
  return backing;
}
