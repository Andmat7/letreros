import * as THREE from 'three';
import { building, calle_12_windows, carrera_7_windows, streets, upper_windows } from '../data/building_measurements.js';
import { standard_material } from './primitives.js';
import { brick_texture, canvas_texture } from './textures.js';

const frame_thickness = 0.07;
const facades = {
  calle_12: { to_position: (distance, height) => [-distance, height, 0.02], rotation_y: 0 },
  carrera_7_arcade: { to_position: (distance, height) => [-building.arcade_depth + 0.02, height, -distance], rotation_y: Math.PI / 2 },
  carrera_7_upper: { to_position: (distance, height) => [0.02, height, -distance], rotation_y: Math.PI / 2 },
};
const interior_textures = new Map();

export function build_windows(scene) {
  calle_12_windows.forEach(window_spec => add_window(scene, window_spec, facades.calle_12));
  carrera_7_windows.forEach(window_spec => add_window(scene, window_spec, facades.carrera_7_arcade));
  upper_window_specs().forEach(([window_spec, facade_name]) => add_window(scene, window_spec, facades[facade_name]));
}

function upper_window_specs() {
  const { sill_heights, height, frame_color } = upper_windows;
  const shared = { height, frame_color, interior: 'glass' };
  return sill_heights.flatMap(sill_height => [
    ...upper_windows.calle_12.map(spec => [{ ...spec, ...shared, sill_height }, 'calle_12']),
    ...upper_windows.carrera_7.map(spec => [{ ...spec, ...shared, sill_height }, 'carrera_7_upper']),
  ]);
}

function add_window(scene, window_spec, facade) {
  const group = new THREE.Group();
  group.add(create_glass(window_spec));
  const frame_material = standard_material({ color: window_spec.frame_color, roughness: 0.5 });
  frame_bars(window_spec).forEach(bar => group.add(create_bar(bar, frame_material)));
  if (window_spec.has_ledge) group.add(create_ledge(window_spec));
  const center_distance = window_spec.distance_from_corner + window_spec.width / 2;
  group.position.set(...facade.to_position(center_distance, streets.curb_height + window_spec.sill_height + window_spec.height / 2));
  group.rotation.y = facade.rotation_y;
  scene.add(group);
}

// Bars in the window's own frame: outer frame, vertical mullions, then the transom.
function frame_bars({ width, height, mullions, transom_from_top }) {
  const vertical = (offset_x) => ({ size: [frame_thickness, height], position: [offset_x, 0] });
  const horizontal = (offset_y) => ({ size: [width + frame_thickness, frame_thickness], position: [0, offset_y] });
  const bars = [horizontal(height / 2), horizontal(-height / 2), vertical(-width / 2), vertical(width / 2)];
  mullions.forEach(from_left => bars.push(vertical(-width / 2 + from_left)));
  if (transom_from_top) bars.push(horizontal(height / 2 - transom_from_top));
  return bars;
}

function create_bar({ size, position }, material) {
  const bar = new THREE.Mesh(new THREE.BoxGeometry(...size, 0.08), material);
  bar.position.set(...position, 0.02);
  return bar;
}

function create_ledge({ width, height }) {
  const ledge_width = width + 0.3;
  const material = standard_material({ map: brick_texture('dark', ledge_width, 0.22) });
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(ledge_width, 0.22, 0.25), material);
  ledge.position.set(0, -height / 2 - 0.11, 0.1);
  ledge.castShadow = true;
  return ledge;
}

function create_glass({ width, height, interior }) {
  const material = interior === 'glass'
    ? standard_material({ color: 0x3b4450, roughness: 0.15, metalness: 0.4 })
    : new THREE.MeshBasicMaterial({ map: interior_texture(interior) });
  return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
}

function interior_texture(kind) {
  if (!interior_textures.has(kind)) {
    const draw = kind === 'menu' ? draw_menu_posters : (context) => draw_shop_interior(context, kind === 'neon');
    interior_textures.set(kind, canvas_texture(512, 256, draw));
  }
  return interior_textures.get(kind);
}

function draw_shop_interior(context, has_neon) {
  const gradient = context.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, '#5a5f66');
  gradient.addColorStop(1, '#2a2d31');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 256);
  context.fillStyle = 'rgba(255,255,240,0.8)';
  for (let lamp = 0; lamp < 4; lamp++) {
    context.beginPath(); context.ellipse(70 + lamp * 120, 18, 22, 6, 0, 0, 7); context.fill();
  }
  if (!has_neon) return;
  context.font = 'italic 70px Georgia, serif';
  context.fillStyle = '#6f8bff';
  context.shadowColor = '#4c6bff';
  context.shadowBlur = 20;
  context.fillText('La Riviera', 60, 150);
}

function draw_menu_posters(context) {
  context.fillStyle = '#3a3f46'; context.fillRect(0, 0, 512, 256);
  context.fillStyle = '#16181b'; context.fillRect(20, 60, 200, 190);
  context.fillStyle = '#f1c232'; context.font = 'bold 22px system-ui'; context.fillText('MENÚ', 85, 95);
  for (let dish = 0; dish < 14; dish++) {
    context.fillStyle = ['#e06c3c', '#f1c232', '#ffffff'][dish % 3];
    context.beginPath(); context.arc(270 + (dish % 5) * 50, 90 + Math.floor(dish / 5) * 55, 20, 0, 7); context.fill();
  }
}
