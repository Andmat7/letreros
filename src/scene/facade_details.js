import * as THREE from 'three';
import { building, esika_shop, streets } from '../data/building_measurements.js';
import { add_box, add_wall_plane, standard_material } from './primitives.js';
import { canvas_texture } from './textures.js';

// Positions on Calle 12 are distances from the corner, estimated from the photo "costado".
const on_calle_12 = (distance, height, offset) => [-distance, height, offset];

export function build_facade_details(scene) {
  add_shutter(scene);
  add_esika_shop(scene);
  add_riviera_sign(scene);
  add_street_plate(scene);
  add_one_way_signs(scene);
  add_round_sign(scene, { position: [0.4, 3.0, -building.corner_pier_depth / 2], rotation_y: Math.PI / 2 });
  add_round_sign(scene, { position: [-3.95, 3.2, 0.6], rotation_y: 0 });
}

function add_shutter(scene) {
  const texture = canvas_texture(64, 256, (context, width, height) => {
    context.fillStyle = '#d7d9db'; context.fillRect(0, 0, width, height);
    context.fillStyle = '#b4b7ba';
    for (let slat = 0; slat < height; slat += 8) context.fillRect(0, slat, width, 2);
  });
  add_wall_plane(scene, { size: [2.4, 2.6], position: on_calle_12(10.3, 1.3, 0.02), material: standard_material({ map: texture }) });
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
