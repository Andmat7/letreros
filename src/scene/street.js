import * as THREE from 'three';
import { streets } from '../data/building_measurements.js';
import { add_box, add_ground_plane, standard_material } from './primitives.js';
import { asphalt_texture, brick_texture, canvas_texture } from './textures.js';

const street_length = 120;
const block_length = 60;
const curb_height = streets.curb_height;
const far_sidewalk_width = 4;

export function build_streets(scene) {
  add_ground_plane(scene, { size: [200, 200], position: [0, -0.02, 0], material: standard_material({ color: 0x8a8f86 }) });
  build_calle_12(scene);
  build_carrera_7(scene);
  const corner_size = [streets.carrera_7_sidewalk_width, streets.calle_12_sidewalk_width];
  add_sidewalk(scene, { size: corner_size, center: corner_size.map(side => side / 2) });
}

function build_calle_12(scene) {
  const { calle_12_sidewalk_width: sidewalk, calle_12_road_width: road } = streets;
  const road_center = sidewalk + road / 2;
  add_road(scene, { size: [street_length, road], center: [-10, road_center] });
  add_sidewalk(scene, { size: [block_length, sidewalk], center: [-block_length / 2, sidewalk / 2] });
  add_sidewalk(scene, { size: [block_length, far_sidewalk_width], center: [-block_length / 2, sidewalk + road + far_sidewalk_width / 2] });
  // Blue lane line seen in the photo "lado".
  add_ground_plane(scene, { size: [block_length, 0.3], position: [-block_length / 2, 0.01, sidewalk + road * 0.34], material: standard_material({ color: 0x3f6fa8 }) });
  add_ground_label(scene, { text: 'CALLE 12', position: [-30, 0.02, road_center], rotation_z: 0 });
}

function build_carrera_7(scene) {
  const { carrera_7_sidewalk_width: sidewalk, carrera_7_road_width: road } = streets;
  const road_center = sidewalk + road / 2;
  add_road(scene, { size: [road, street_length], center: [road_center, -10] });
  add_sidewalk(scene, { size: [sidewalk, block_length], center: [sidewalk / 2, -block_length / 2] });
  add_sidewalk(scene, { size: [far_sidewalk_width, block_length], center: [sidewalk + road + far_sidewalk_width / 2, -block_length / 2] });
  for (let dash = -60; dash < 0; dash += 6) {
    add_ground_plane(scene, { size: [0.15, 3], position: [road_center, 0.01, dash], material: standard_material({ color: 0xf2f2f2 }) });
  }
  add_ground_label(scene, { text: 'CARRERA 7', position: [road_center, 0.02, -28], rotation_z: Math.PI / 2 });
}

function add_road(scene, { size, center }) {
  const material = standard_material({ map: asphalt_texture(...size) });
  add_ground_plane(scene, { size, position: [center[0], 0, center[1]], material });
}

function add_sidewalk(scene, { size, center }) {
  const [width, depth] = size;
  const material = standard_material({ map: brick_texture('paver', width, depth) });
  add_box(scene, { size: [width, curb_height, depth], position: [center[0], curb_height / 2, center[1]], material });
}

function add_ground_label(scene, { text, position, rotation_z }) {
  const texture = canvas_texture(1024, 160, (context, width, height) => {
    context.fillStyle = 'rgba(255,255,255,0.85)';
    context.font = 'bold 110px system-ui, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, width / 2, height / 2);
  });
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  add_ground_plane(scene, { size: [9, 1.4], position, rotation_z, material });
}
