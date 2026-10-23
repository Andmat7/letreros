import * as THREE from 'three';
import { building, reference_person, streets } from '../data/building_measurements.js';
import { add_box, standard_material } from './primitives.js';
import { canvas_texture } from './textures.js';

const curb_height = streets.curb_height;
const umbrella_colors = [0xd8342a, 0xf0c419, 0x2e9e5b, 0x2c6db5];

export function build_surroundings(scene) {
  add_neighbor_blocks(scene);
  add_street_furniture(scene);
  add_reference_person(scene, [-4, curb_height, 1.3]);
}

function add_neighbor_blocks(scene) {
  const length_a = building.calle_12_facade_length;
  const far_side_a = streets.calle_12_sidewalk_width + streets.calle_12_road_width + 11;
  const far_side_b = streets.carrera_7_sidewalk_width + streets.carrera_7_road_width + 11;
  const blocks = [
    [14, 7, 18, -length_a - 7.5, -9, 0xcfc4b3], [12, 12, 16, -8, -building.carrera_7_facade_length - 9, 0xb5634a],
    [16, 6, 14, -10, far_side_a, 0xd9d2c4], [10, 9, 14, -28, far_side_a, 0xb86b52],
    [14, 5, 14, far_side_b, 6, 0xe0d6c4], [14, 14, 18, far_side_b, -16, 0xc9c1b2],
  ];
  blocks.forEach(([width, height, depth, x, z, color]) =>
    add_box(scene, { size: [width, height, depth], position: [x, height / 2, z], material: standard_material({ color }) }));
}

function add_street_furniture(scene) {
  const bollard_material = standard_material({ color: 0xb0322c });
  for (let distance = 5; distance < building.carrera_7_facade_length; distance += 4) {
    add_box(scene, { size: [0.18, 2.6, 0.18], position: [0.9, 1.3, -distance], material: bollard_material });
  }
  [-11, -14.5].forEach(z => add_umbrella(scene, [1.6, curb_height, z]));
  const tree_line_x = streets.carrera_7_sidewalk_width + streets.carrera_7_road_width + 2.5;
  for (let z = 6; z > -40; z -= 9) add_tree(scene, [tree_line_x, 0, z]);
}

function add_umbrella(scene, position) {
  const umbrella = new THREE.Group();
  for (let panel = 0; panel < 8; panel++) {
    const geometry = new THREE.ConeGeometry(1.4, 0.6, 8, 1, true, panel * Math.PI / 4, Math.PI / 4);
    const canopy = new THREE.Mesh(geometry, standard_material({ color: umbrella_colors[panel % 4], side: THREE.DoubleSide }));
    canopy.position.y = 2.3;
    canopy.castShadow = true;
    umbrella.add(canopy);
  }
  add_box(umbrella, { size: [0.06, 2.3, 0.06], position: [0, 1.15, 0], material: standard_material({ color: 0xdddddd }) });
  umbrella.position.set(...position);
  scene.add(umbrella);
}

function add_tree(scene, [x, y, z]) {
  add_box(scene, { size: [0.3, 2.5, 0.3], position: [x, y + 1.25, z], material: standard_material({ color: 0x6b4f3a }) });
  const crown = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 10), standard_material({ color: 0x4f7d45 }));
  crown.position.set(x, y + 3.6, z);
  crown.castShadow = true;
  scene.add(crown);
}

// A 1.70 m figure gives a sense of scale next to the windows and signs.
function add_reference_person(scene, [x, y, z]) {
  const head_radius = 0.11;
  const body_radius = 0.18;
  const body_length = reference_person.height - 2 * head_radius - 2 * body_radius - 0.02;
  const material = standard_material({ color: 0x35506e });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(body_radius, body_length, 6, 12), material);
  body.position.set(x, y + body_radius + body_length / 2, z);
  const head = new THREE.Mesh(new THREE.SphereGeometry(head_radius, 16, 12), standard_material({ color: 0xc89a78 }));
  head.position.set(x, y + reference_person.height - head_radius, z);
  body.castShadow = head.castShadow = true;
  scene.add(body, head, height_tag([x, y + reference_person.height + 0.25, z]));
}

function height_tag(position) {
  const texture = canvas_texture(256, 96, (context) => {
    context.fillStyle = 'rgba(255,255,255,0.9)'; context.fillRect(0, 0, 256, 96);
    context.fillStyle = '#1d2229'; context.font = 'bold 56px system-ui'; context.textAlign = 'center';
    context.fillText(`${reference_person.height.toFixed(2).replace('.', ',')} m`, 128, 66);
  });
  const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
  tag.scale.set(0.6, 0.225, 1);
  tag.position.set(...position);
  return tag;
}
