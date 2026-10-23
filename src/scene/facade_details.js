import * as THREE from 'three';
import { building, esika_shop, streets } from '../data/building_measurements.js';
import { add_box, add_wall_plane, standard_material } from './primitives.js';
import { canvas_texture } from './textures.js';

// Positions on Calle 12 are distances from the corner, fitted from the photos "costado" and
// "calle_12_frontal"; heights are above the road.
const on_calle_12 = (distance, height, offset) => [-distance, height, offset];

export function build_facade_details(scene) {
  add_shutter(scene);
  add_esika_shop(scene);
  add_riviera_sign(scene);
  add_street_plate(scene);
  add_one_way_signs(scene);
  // Both round signs stick out from the wall, facing along the street.
  add_round_sign(scene, { position: [0.41, 2.78, -building.corner_pier_depth / 2], rotation_y: 0 });
  add_round_sign(scene, { position: [-3.1, 2.65, 0.45], rotation_y: Math.PI / 2 });
}

function add_shutter(scene) {
  const texture = canvas_texture(64, 256, (context, width, height) => {
    context.fillStyle = '#d7d9db'; context.fillRect(0, 0, width, height);
    context.fillStyle = '#b4b7ba';
    for (let slat = 0; slat < height; slat += 8) context.fillRect(0, slat, width, 2);
  });
  add_wall_plane(scene, { size: [1.08, 2.2], position: on_calle_12(8.14, 1.25, 0.02), material: standard_material({ map: texture }) });
}

function add_esika_shop(scene) {
  const { door, display, red_sign, services_sign, brand_sign } = esika_shop;
  const white = standard_material({ color: 0xf2f2ef });
  add_shop_panel(scene, { ...door, width: door.width + 0.16, height: door.height + 0.08, bottom_height: 0 }, white, 0.015);
  add_shop_panel(scene, { ...door, bottom_height: 0 }, new THREE.MeshBasicMaterial({ map: shelves_texture() }), 0.025);
  add_box(scene, { size: [door.width + 0.2, 0.2, 0.22], position: on_calle_12(door.distance_from_corner + door.width / 2, streets.curb_height + door.height + 0.12, 0.11), material: white });
  add_shop_panel(scene, { ...display, bottom_height: 0 }, new THREE.MeshBasicMaterial({ map: display_texture() }), 0.025);
  add_shop_panel(scene, red_sign, standard_material({ map: red_esika_texture() }), 0.08);
  add_shop_panel(scene, services_sign, standard_material({ map: services_texture() }), 0.08);
  // The brand sign stands out from the wall, in front of the cornice.
  add_shop_panel(scene, brand_sign, new THREE.MeshStandardMaterial({ map: brand_texture(), emissive: 0x111111 }), 0.4);
}

// Panels are placed by their near edge to the corner and their bottom above the sidewalk.
function add_shop_panel(scene, { distance_from_corner, width, height, bottom_height }, material, offset) {
  const center_height = streets.curb_height + bottom_height + height / 2;
  add_wall_plane(scene, { size: [width, height], position: on_calle_12(distance_from_corner + width / 2, center_height, offset), material });
}

function shelves_texture() {
  return canvas_texture(256, 256, (context, width, height) => {
    context.fillStyle = '#e9e6df'; context.fillRect(0, 0, width, height);
    context.fillStyle = '#b98a5a'; context.fillRect(30, 70, 196, 186);
    const product_colors = ['#d23b5f', '#f2f2f2', '#3a6fb0', '#e0a43a', '#7a3d8c'];
    for (let shelf = 0; shelf < 6; shelf++) {
      for (let product = 0; product < 12; product++) {
        context.fillStyle = product_colors[(shelf + product) % product_colors.length];
        context.fillRect(36 + product * 16, 78 + shelf * 30, 12, 22);
      }
    }
  });
}

function display_texture() {
  return canvas_texture(128, 192, (context, width, height) => {
    context.fillStyle = '#1f2a44'; context.fillRect(0, 0, width, height);
    context.fillStyle = '#e8869a'; context.fillRect(70, 40, 50, 140);
    context.fillStyle = '#f0b07a'; context.fillRect(76, 90, 14, 70);
    context.fillStyle = '#6fbf73'; context.beginPath(); context.arc(96, 26, 16, 0, 7); context.fill();
    context.fillStyle = '#ffffff'; context.font = 'bold 14px system-ui'; context.fillText('Natura', 8, 40);
  });
}

function red_esika_texture() {
  return canvas_texture(420, 135, (context, width, height) => {
    context.fillStyle = '#c8102e'; context.fillRect(0, 0, width, height);
    context.fillStyle = '#ffffff'; context.textAlign = 'center';
    context.font = '96px Georgia, serif'; context.fillText('ÉSIKA', width / 2, 102);
  });
}

function services_texture() {
  return canvas_texture(440, 100, (context, width, height) => {
    context.fillStyle = '#f4f1ea'; context.fillRect(0, 0, width, height);
    context.fillStyle = '#2b2b2b'; context.textAlign = 'center';
    context.font = 'bold 26px system-ui'; context.fillText('Pago de servicios Públicos', width / 2, 32);
    context.font = '22px system-ui'; context.fillText('Retiros y Consignaciones', width / 2, 62);
    context.fillText('Recargas', width / 2, 88);
  });
}

function brand_texture() {
  return canvas_texture(880, 240, (context, width) => {
    context.fillStyle = '#30353a'; context.fillRect(0, 0, width, 240);
    context.fillStyle = '#ffffff'; context.font = 'bold 44px system-ui'; context.fillText('D|FER', 30, 70);
    context.textAlign = 'center'; context.font = 'bold 120px system-ui'; context.fillText('ÉSIKA', width / 2, 145);
    context.font = 'bold 30px system-ui';
    context.fillText('cyzone   natura   AVON   L’BEL   YANBAL   Boticário', width / 2, 215);
  });
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
  add_wall_plane(scene, { size: [2.6, 0.86], position: on_calle_12(7.4, 3.62, 0.08), material });
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
  add_wall_plane(scene, { size: [0.6, 0.31], position: on_calle_12(1.28, 3.6, 0.04), material: standard_material({ map: texture }) });
}

function add_one_way_signs(scene) {
  const arrow_material = standard_material({ map: arrow_texture() });
  const black = standard_material({ color: 0x111111 });
  add_wall_plane(scene, { size: [0.74, 0.25], position: on_calle_12(4.64, 3.4, 0.04), material: arrow_material });
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

// The faces are flat circles so the text stays upright; a cylinder cap would turn it sideways.
function add_round_sign(scene, { position, rotation_y }) {
  const radius = 0.27;
  const face_material = standard_material({ map: round_sign_texture() });
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.08, 32, 1, true), standard_material({ color: 0x222222 }));
  rim.rotation.x = Math.PI / 2;
  const holder = new THREE.Group();
  holder.add(rim);
  [0.041, -0.041].forEach((offset, index) => {
    const face = new THREE.Mesh(new THREE.CircleGeometry(radius, 32), face_material);
    face.position.z = offset;
    face.rotation.y = index * Math.PI;
    holder.add(face);
  });
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
