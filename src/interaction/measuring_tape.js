import * as THREE from 'three';
import { canvas_texture } from '../scene/textures.js';

const tape_color = '#0b6bcb';

// Two clicks on any surface give the distance between them, split into horizontal and height.
// Every tape part is a line or sprite, so surface hits never land on the tape itself.
// on_change receives the placed points (not the live preview) as [x, y, z] arrays.
export function create_measuring_tape(scene, on_change) {
  const line = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: tape_color, depthTest: false }));
  // Dots keep the same size on screen so they stay easy to grab from far away.
  const dot_material = new THREE.SpriteMaterial({ map: dot_texture(), depthTest: false, sizeAttenuation: false });
  const dots = [new THREE.Sprite(dot_material), new THREE.Sprite(dot_material)];
  dots.forEach(dot => dot.scale.set(0.03, 0.03, 1));
  const label = new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: false }));
  label.scale.set(2.4, 0.9, 1);
  [line, ...dots, label].forEach(part => { part.renderOrder = 30; part.visible = false; });
  scene.add(line, ...dots, label);
  return { scene, on_change, active: false, points: [], line, dots, label };
}

export function set_measuring(tape, active) {
  tape.active = active;
  tape.points = [];
  show_points(tape, []);
}

// The first click sets the start, the second the end, and a third starts over.
export function add_tape_point(tape, raycaster) {
  const point = surface_point(tape, raycaster);
  if (!point) return;
  tape.points = tape.points.length === 1 ? [tape.points[0], point] : [point];
  show_points(tape, tape.points);
}

// Index of the start or end dot under the pointer, or -1, so placed points can be dragged.
export function grab_tape_point(tape, raycaster) {
  // Only placed points count: the preview end dot follows the pointer and would always be hit.
  const hit = raycaster.intersectObjects(tape.dots.slice(0, tape.points.length))[0];
  return hit ? tape.dots.indexOf(hit.object) : -1;
}

export function move_tape_point(tape, index, raycaster) {
  const point = surface_point(tape, raycaster);
  if (!point) return;
  tape.points[index] = point;
  show_points(tape, tape.points);
}

export function preview_tape_end(tape, raycaster) {
  const point = tape.points.length === 1 && surface_point(tape, raycaster);
  if (point) show_points(tape, [tape.points[0], point]);
}

function surface_point(tape, raycaster) {
  const hit = raycaster.intersectObjects(tape.scene.children, true).find(candidate => candidate.object.isMesh);
  return hit && hit.point.clone();
}

function show_points(tape, points) {
  tape.dots.forEach((dot, index) => {
    dot.visible = Boolean(points[index]);
    if (points[index]) dot.position.copy(points[index]);
  });
  tape.on_change(tape.points.map(point => point.toArray()));
  tape.line.visible = tape.label.visible = points.length === 2;
  if (points.length !== 2) return;
  tape.line.geometry.setFromPoints(points);
  tape.label.material.map?.dispose();
  tape.label.material.map = label_texture(points);
  tape.label.material.needsUpdate = true;
  tape.label.position.copy(points[0]).lerp(points[1], 0.5).add(new THREE.Vector3(0, 0.5, 0));
}

function label_texture([start, end]) {
  const meters = (value) => `${value.toFixed(2).replace('.', ',')} m`;
  const horizontal = Math.hypot(end.x - start.x, end.z - start.z);
  return canvas_texture(512, 192, (context, width) => {
    context.fillStyle = 'rgba(255,255,255,0.95)'; context.fillRect(0, 0, width, 192);
    context.strokeStyle = tape_color; context.lineWidth = 8; context.strokeRect(4, 4, width - 8, 184);
    context.textAlign = 'center'; context.fillStyle = '#1d2229';
    context.font = 'bold 84px system-ui'; context.fillText(meters(start.distanceTo(end)), width / 2, 100);
    context.font = '32px system-ui';
    context.fillText(`horizontal ${meters(horizontal)} · altura ${meters(Math.abs(end.y - start.y))}`, width / 2, 158);
  });
}

function dot_texture() {
  return canvas_texture(64, 64, (context) => {
    context.fillStyle = '#ffffff'; context.beginPath(); context.arc(32, 32, 30, 0, 7); context.fill();
    context.fillStyle = tape_color; context.beginPath(); context.arc(32, 32, 20, 0, 7); context.fill();
  });
}
