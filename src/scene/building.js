import { building } from '../data/building_measurements.js';
import { add_box, add_brick_box, standard_material } from './primitives.js';

const cornice_material = standard_material({ color: 0x8c8378 });
const cornice_height = 0.35;
const cornice_depth = 0.5;

export function build_building(scene) {
  add_volumes(scene);
  add_cornices(scene);
  add_arcade_columns(scene);
}

function add_volumes(scene) {
  const { calle_12_facade_length: length_a, carrera_7_facade_length: length_b, ground_floor_height: ground, total_height: top, arcade_depth: arcade, corner_pier_depth: pier } = building;
  add_brick_box(scene, { size: [length_a, top - ground, length_b], position: [-length_a / 2, (top + ground) / 2, -length_b / 2], palette: 'light' });
  // The ground floor is set back on Carrera 7 to leave room for the arcade.
  add_brick_box(scene, { size: [length_a - arcade, ground, length_b], position: [-(length_a + arcade) / 2, ground / 2, -length_b / 2], palette: 'dark' });
  add_brick_box(scene, { size: [arcade, ground, pier], position: [-arcade / 2, ground / 2, -pier / 2], palette: 'dark' });
}

function add_cornices(scene) {
  const { calle_12_facade_length: length_a, carrera_7_facade_length: length_b, ground_floor_height: ground } = building;
  const height = ground + 0.05;
  add_box(scene, { size: [length_a + 0.3, cornice_height, cornice_depth], position: [-length_a / 2, height, 0.1], material: cornice_material });
  add_box(scene, { size: [cornice_depth, cornice_height, length_b + 0.3], position: [0.1, height, -length_b / 2], material: cornice_material });
}

function add_arcade_columns(scene) {
  const { arcade_first_column: first, arcade_column_spacing: spacing, arcade_column_width: width, carrera_7_facade_length: length_b, ground_floor_height: ground } = building;
  for (let distance = first; distance < length_b; distance += spacing) {
    add_brick_box(scene, { size: [width, ground, width], position: [-width / 2, ground / 2, -distance], palette: 'dark' });
  }
}
