import * as THREE from 'three';
import { add_tape_point, grab_tape_point, move_tape_point, preview_tape_end } from './measuring_tape.js';
import { move_sign, save_placements } from './wall_signs.js';

const click_tolerance = 5;

// Handles hover labels, clicks on photo markers, dragging signs along their wall and the measuring tape.
// targets: { signs, markers, tape }; callbacks: { on_photo, on_sign }.
export function attach_pointer_controller(stage, targets, callbacks) {
  const state = { stage, targets, callbacks, raycaster: new THREE.Raycaster(), drag: { active: false }, pressed_at: [0, 0] };
  const canvas = stage.renderer.domElement;
  canvas.addEventListener('pointerdown', event => handle_press(state, event));
  canvas.addEventListener('pointermove', event => handle_move(state, event));
  canvas.addEventListener('pointerup', event => handle_release(state, event));
}

function handle_press(state, event) {
  aim(state, event);
  state.pressed_at = [event.clientX, event.clientY];
  if (state.targets.tape.active) return grab_tape_dot(state, event);
  const hit = state.raycaster.intersectObjects(sign_meshes(state))[0];
  if (!hit || event.button !== 0) return;
  const sign = hit.object.userData.sign;
  const point = wall_point(state, sign);
  if (!point) return;
  state.drag = { active: true, moved: false, sign, grab_offset: [sign.wall.to_distance(point) - sign.placement[0], point.y - sign.placement[1]] };
  state.stage.controls.enabled = false;
  state.stage.renderer.domElement.setPointerCapture(event.pointerId);
}

function handle_move(state, event) {
  aim(state, event);
  if (state.drag.tape_index >= 0) return move_tape_point(state.targets.tape, state.drag.tape_index, state.raycaster);
  if (state.targets.tape.active) return show_tape_preview(state, event);
  if (!state.drag.active) return show_hover_label(state, event);
  const { sign, grab_offset } = state.drag;
  const point = wall_point(state, sign);
  if (!point) return;
  move_sign(sign, [sign.wall.to_distance(point) - grab_offset[0], point.y - grab_offset[1]]);
  state.drag.moved = true;
}

function handle_release(state, event) {
  const is_click = Math.hypot(event.clientX - state.pressed_at[0], event.clientY - state.pressed_at[1]) < click_tolerance;
  if (state.drag.tape_index >= 0) return release_tape_dot(state);
  if (state.drag.active) {
    state.stage.controls.enabled = true;
    if (state.drag.moved) save_placements(state.targets.signs);
    if (is_click) state.callbacks.on_sign(state.drag.sign);
    state.drag = { active: false };
    return;
  }
  if (!is_click) return;
  aim(state, event);
  if (state.targets.tape.active) return add_tape_point(state.targets.tape, state.raycaster);
  const marker_hit = state.raycaster.intersectObjects(state.targets.markers)[0];
  if (marker_hit) state.callbacks.on_photo(marker_hit.object.userData.viewpoint);
}

function grab_tape_dot(state, event) {
  const tape_index = event.button === 0 ? grab_tape_point(state.targets.tape, state.raycaster) : -1;
  if (tape_index < 0) return;
  state.drag = { active: false, tape_index };
  state.stage.controls.enabled = false;
  state.stage.renderer.domElement.setPointerCapture(event.pointerId);
}

function release_tape_dot(state) {
  state.stage.controls.enabled = true;
  state.drag = { active: false };
}

function show_hover_label(state, event) {
  const marker_hit = state.raycaster.intersectObjects(state.targets.markers)[0];
  const sign_hit = state.raycaster.intersectObjects(sign_meshes(state))[0];
  const text = marker_hit ? `📷 ${marker_hit.object.userData.viewpoint.title}`
    : sign_hit ? `${sign_hit.object.userData.sign.entry.title} (arrastrar para mover)` : '';
  place_hover_label(state, event, text);
}

function show_tape_preview(state, event) {
  const { tape } = state.targets;
  const over_dot = grab_tape_point(tape, state.raycaster) >= 0;
  if (!over_dot) preview_tape_end(tape, state.raycaster);
  const text = over_dot ? 'Arrastra para mover el punto' : tape.points.length === 1 ? 'Clic en el punto final' : 'Clic en el punto inicial';
  place_hover_label(state, event, text);
  state.stage.renderer.domElement.style.cursor = over_dot ? 'grab' : 'crosshair';
}

function place_hover_label(state, event, text) {
  const label = document.getElementById('hover_label');
  state.stage.renderer.domElement.style.cursor = text ? 'pointer' : '';
  label.hidden = !text;
  label.textContent = text;
  label.style.left = `${event.clientX}px`;
  label.style.top = `${event.clientY}px`;
}

function aim(state, event) {
  const bounds = state.stage.renderer.domElement.getBoundingClientRect();
  const pointer = new THREE.Vector2(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
  state.raycaster.setFromCamera(pointer, state.stage.camera);
}

function wall_point(state, sign) {
  return state.raycaster.ray.intersectPlane(sign.wall.plane, new THREE.Vector3());
}

function sign_meshes(state) {
  return state.targets.signs.flatMap(sign => sign.hit_meshes);
}
