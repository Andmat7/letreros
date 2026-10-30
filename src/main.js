import { overview_views, photo_viewpoints } from './data/photo_viewpoints.js';
import { artwork_fits, sign_artwork } from './data/sign_artwork.js';
import { photo_bundle } from './generated/photo_bundle.js';
import { create_stage } from './stage.js';
import { build_building } from './scene/building.js';
import { build_facade_details } from './scene/facade_details.js';
import { build_streets } from './scene/street.js';
import { build_surroundings } from './scene/surroundings.js';
import { build_windows } from './scene/windows.js';
import { create_camera_flight } from './interaction/camera_flight.js';
import { zoom_camera } from './interaction/camera_zoom.js';
import { create_measuring_tape, set_measuring } from './interaction/measuring_tape.js';
import { create_photo_comparison } from './interaction/photo_comparison.js';
import { build_photo_markers, set_markers_visible } from './interaction/photo_markers.js';
import { attach_pointer_controller } from './interaction/pointer_controller.js';
import { build_wall_signs, reset_signs, save_artwork, set_sign_artwork } from './interaction/wall_signs.js';
import './components/artwork_picker/artwork_picker.js';
import './components/image_viewer.js';
import './components/measure_readout.js';
import './components/photo_overlay/photo_overlay.js';
import './components/site_panel.js';
import './components/zoom_control.js';

const stage = create_stage(document.getElementById('scene'));
const panel = document.querySelector('site-panel');
const viewer = document.querySelector('image-viewer');
const readout = document.querySelector('measure-readout');
const overlay = document.querySelector('photo-overlay');
const picker = document.querySelector('artwork-picker');
let markers_hidden = true;
build_world(stage.scene);
const signs = build_wall_signs(stage.scene);
const markers = build_photo_markers(stage.scene);
const tape = create_measuring_tape(stage.scene, points => readout.show(points));
const flight = create_camera_flight(stage.camera, stage.controls);
const comparison = create_photo_comparison({ stage, flight, overlay }, end_photo);
attach_pointer_controller(stage, { signs, markers, tape }, { on_photo: show_photo, on_sign: show_sign });
connect_panel();
document.querySelector('zoom-control').addEventListener('zoom-step', ({ detail }) => zoom_camera(stage, detail.direction));
set_markers_visible(markers, !markers_hidden);
start(overview_views.home);

function build_world(scene) {
  build_streets(scene);
  build_building(scene);
  build_windows(scene);
  build_facade_details(scene);
  build_surroundings(scene);
}

function connect_panel() {
  panel.set_items([
    ...photo_viewpoints.map(viewpoint => ({ kind: 'photo', key: viewpoint.key, title: viewpoint.title, subtitle: 'Ver desde donde se tomó', image: photo_bundle[viewpoint.key].source })),
    ...signs.map(sign => ({ kind: 'sign', key: sign.entry.key, title: sign.entry.title, subtitle: sign.entry.wall === 'calle_12' ? 'Fachada Calle 12' : 'Soportal Carrera 7', image: photo_bundle[sign.entry.reference_photo].source })),
  ]);
  panel.addEventListener('panel-select', ({ detail }) => detail.kind === 'photo'
    ? show_photo(photo_viewpoints.find(viewpoint => viewpoint.key === detail.key))
    : show_sign(signs.find(sign => sign.entry.key === detail.key)));
  picker.set_options({
    boards: signs.map(sign => ({ key: sign.entry.key, title: sign.entry.title, artwork: sign.artwork })),
    artworks: sign_artwork.map(({ key, title }) => ({ key, title: key ? `${title} (${photo_ratio(key)})` : title })),
    fits: artwork_fits,
  });
  picker.addEventListener('artwork-change', ({ detail }) => change_artwork(detail));
  panel.addEventListener('panel-command', ({ detail }) => run_command(detail.command));
  viewer.addEventListener('viewer-close', () => panel.set_active(''));
}

function photo_ratio(key) {
  const { width, height } = photo_bundle[key];
  return `ancho/alto ${(width / height).toFixed(2)}`;
}

async function change_artwork({ board_key, ...artwork }) {
  await set_sign_artwork(signs.find(sign => sign.entry.key === board_key), artwork);
  save_artwork(signs);
}

function run_command(command) {
  if (command === 'reset') return reset_signs(signs);
  if (command === 'measure') return toggle_measuring();
  if (command === 'markers') return toggle_markers();
  comparison.close();
  flight.fly_to(overview_views[command]);
}

function toggle_measuring() {
  set_measuring(tape, !tape.active);
  panel.set_pressed('measure', tape.active);
}

function toggle_markers() {
  markers_hidden = !markers_hidden;
  set_markers_visible(markers, !markers_hidden);
  panel.set_pressed('markers', !markers_hidden);
}

// The panel folds away so it does not cover the photo laid over the view.
function show_photo(viewpoint) {
  viewer.hide();
  panel.classList.add('collapsed');
  set_markers_visible(markers, false);
  comparison.open(viewpoint);
  panel.set_active(viewpoint.key);
}

function end_photo() {
  set_markers_visible(markers, !markers_hidden);
  panel.set_active('');
}

function show_sign(sign) {
  comparison.close();
  const center = sign.group.position;
  const camera_position = center.clone().addScaledVector(sign.wall.normal, 4.5);
  flight.fly_to({ camera_position: [camera_position.x, center.y + 0.6, camera_position.z], look_at: center.toArray() });
  viewer.show({ title: sign.entry.title, image: photo_bundle[sign.entry.reference_photo].source });
  panel.set_active(sign.entry.key);
  panel.classList.remove('collapsed');
  picker.highlight_board(sign.entry.key);
}

function start(view) {
  stage.camera.position.set(...view.camera_position);
  stage.controls.target.set(...view.look_at);
  stage.renderer.setAnimationLoop(now => {
    flight.update(now);
    stage.controls.update();
    stage.renderer.render(stage.scene, stage.camera);
  });
}
