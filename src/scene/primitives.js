import * as THREE from 'three';
import { brick_texture } from './textures.js';

export function standard_material(options) {
  return new THREE.MeshStandardMaterial({ roughness: 0.9, ...options });
}

export function add_box(parent, { size, position, material }) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

// Each face gets its own repeat so bricks keep their real size on every side.
export function add_brick_box(parent, { size, position, palette }) {
  const [width, height, depth] = size;
  const face_sizes = [[depth, height], [depth, height], [width, depth], [width, depth], [width, height], [width, height]];
  const materials = face_sizes.map(([face_width, face_height]) =>
    standard_material({ map: brick_texture(palette, face_width, face_height) }));
  return add_box(parent, { size, position, material: materials });
}

export function add_wall_plane(parent, { size, position, rotation_y = 0, material }) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...size), material);
  mesh.position.set(...position);
  mesh.rotation.y = rotation_y;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function add_ground_plane(parent, { size, position, rotation_z = 0, material }) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...size), material);
  mesh.rotation.set(-Math.PI / 2, 0, rotation_z);
  mesh.position.set(...position);
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
