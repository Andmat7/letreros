import * as THREE from 'three';
import { add_box, add_wall_plane, standard_material } from './primitives.js';
import { canvas_texture } from './textures.js';

// Positions on Calle 12 are distances from the corner, estimated from the photo "costado".
const on_calle_12 = (distance, height, offset) => [-distance, height, offset];

export function build_facade_details(scene) {
  add_shutter(scene);
  add_riviera_sign(scene);
  add_street_plate(scene);
  add_one_way_signs(scene);
  add_round_sign(scene, { position: [0.4, 3.0, -1.2], rotation_y: Math.PI / 2 });
  add_round_sign(scene, { position: [-12, 3.0, 0.6], rotation_y: 0 });
}

function add_shutter(scene) {
  const texture = canvas_texture(64, 256, (context, width, height) => {
    context.fillStyle = '#d7d9db'; context.fillRect(0, 0, width, height);
    context.fillStyle = '#b4b7ba';
    for (let slat = 0; slat < height; slat += 8) context.fillRect(0, slat, width, 2);
  });
  add_wall_plane(scene, { size: [2.4, 2.6], position: on_calle_12(10.3, 1.3, 0.02), material: standard_material({ map: texture }) });
}

function add_riviera_sign(scene) {
  const texture = canvas_texture(1024, 290, (context, width) => {
    context.fillStyle = '#f6e81c'; context.fillRect(0, 0, width, 290);
    context.textAlign = 'center';
    context.fillStyle = '#d1281f'; context.font = 'bold italic 150px Georgia, serif';
    context.fillText('La Riviera', width / 2 + 50, 165);
    context.fillStyle = '#7a2b14'; context.font = 'italic 46px Georgia, serif';
    context.fillText('Pollo Asado y Restaurante', width / 2 + 50, 250);
    context.fillStyle = '#d1281f'; context.beginPath(); context.arc(90, 140, 70, 0, 7); context.fill();
  });
  const material = new THREE.MeshStandardMaterial({ map: texture, emissive: 0x333300 });
  add_wall_plane(scene, { size: [3.0, 0.86], position: on_calle_12(8.45, 4.2, 0.08), material });
}

function add_street_plate(scene) {
  const texture = canvas_texture(420, 196, (context, width, height) => {
    context.fillStyle = '#5b2a3b'; context.fillRect(0, 0, width, height);
    context.strokeStyle = '#fff'; context.lineWidth = 6; context.strokeRect(6, 6, width - 12, height - 12);
    context.fillStyle = '#fff'; context.font = '20px system-ui';
    context.fillText('AV. JULIO CÉSAR TURBAY', 24, 42);
    context.font = 'bold 44px system-ui';
    context.fillText('Carrera   7', 24, 105);
    context.fillText('Calle     12', 24, 165);
  });
  add_wall_plane(scene, { size: [0.75, 0.35], position: on_calle_12(1.45, 4.05, 0.04), material: standard_material({ map: texture }) });
}

function add_one_way_signs(scene) {
  const arrow_material = standard_material({ map: arrow_texture() });
  const black = standard_material({ color: 0x111111 });
  add_wall_plane(scene, { size: [0.9, 0.3], position: on_calle_12(5.35, 3.85, 0.04), material: arrow_material });
  add_box(scene, { size: [0.1, 2.8, 0.1], position: [1.0, 1.4, 0.8], material: standard_material({ color: 0xcfcfcf }) });
  add_box(scene, { size: [1.4, 0.45, 0.03], position: [1.0, 2.9, 0.8], material: [black, black, black, black, arrow_material, arrow_material] });
}

function arrow_texture() {
  return canvas_texture(256, 80, (context) => {
    context.fillStyle = '#111'; context.fillRect(0, 0, 256, 80);
    context.fillStyle = '#fff';
    context.beginPath();
    [[20, 40], [70, 12], [70, 30], [236, 30], [236, 50], [70, 50], [70, 68]].forEach(([x, y]) => context.lineTo(x, y));
    context.closePath(); context.fill();
  });
}

function add_round_sign(scene, { position, rotation_y }) {
  const face = standard_material({ map: round_sign_texture() });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 32), [standard_material({ color: 0x222222 }), face, face]);
  disc.rotation.x = Math.PI / 2;
  const holder = new THREE.Group();
  holder.add(disc);
  holder.rotation.y = rotation_y;
  holder.position.set(...position);
  scene.add(holder);
}

function round_sign_texture() {
  return canvas_texture(256, 256, (context) => {
    context.fillStyle = '#fff'; context.beginPath(); context.arc(128, 128, 124, 0, 7); context.fill();
    context.strokeStyle = '#222'; context.lineWidth = 10; context.stroke();
    context.fillStyle = '#d1281f'; context.textAlign = 'center';
    context.font = 'bold 64px system-ui'; context.fillText('24', 128, 150);
    context.font = 'bold 36px system-ui'; context.fillText('HORAS', 128, 195);
    context.fillStyle = '#f0b51e'; context.beginPath(); context.arc(128, 70, 26, 0, 7); context.fill();
  });
}
