import { building } from '../data/building_measurements.js';
import { add_box, add_brick_box, standard_material } from './primitives.js';

const cornice_material = standard_material({ color: 0x8c8378 });
const cornice_height = 0.35;
const cornice_depth = 0.5;

export function build_building(scene) {
  add_volumes(scene);
  add_cornices(scene);
}

// The upper floors project a little past the ground floor over the Carrera 7 sidewalk.
function add_volumes(scene) {
  const { calle_12_facade_length: length_a, carrera_7_facade_length: length_b, ground_floor_height: ground, total_height: top, carrera_7_overhang: overhang } = building;
  const upper_width = length_a + overhang;
  add_brick_box(scene, { size: [upper_width, top - ground, length_b], position: [overhang - upper_width / 2, (top + ground) / 2, -length_b / 2], palette: 'light' });
  add_brick_box(scene, { size: [length_a, ground, length_b], position: [-length_a / 2, ground / 2, -length_b / 2], palette: 'dark' });
}

function add_cornices(scene) {
  const { calle_12_facade_length: length_a, carrera_7_facade_length: length_b, ground_floor_height: ground, carrera_7_overhang: overhang } = building;
  const height = ground + 0.05;
  const calle_12_length = length_a + overhang + 0.3;
  add_box(scene, { size: [calle_12_length, cornice_height, cornice_depth], position: [overhang + 0.3 - calle_12_length / 2, height, 0.1], material: cornice_material });
  add_box(scene, { size: [cornice_depth, cornice_height, length_b + 0.3], position: [overhang + 0.1, height, -length_b / 2], material: cornice_material });
}
