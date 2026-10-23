import { overview_views, photo_viewpoints } from './data/photo_viewpoints.js';
import { photo_bundle } from './generated/photo_bundle.js';
import { create_stage } from './stage.js';
import { build_building } from './scene/building.js';
import { build_facade_details } from './scene/facade_details.js';
import { build_streets } from './scene/street.js';
import { build_surroundings } from './scene/surroundings.js';
import { build_windows } from './scene/windows.js';
import { create_camera_flight } from './interaction/camera_flight.js';
import { build_photo_markers } from './interaction/photo_markers.js';
import { attach_pointer_controller } from './interaction/pointer_controller.js';
import { build_wall_signs, reset_signs } from './interaction/wall_signs.js';
import './components/image_viewer.js';
import './components/site_panel.js';

const stage = create_stage(document.getElementById('scene'));
const panel = document.querySelector('site-panel');
const viewer = document.querySelector('image-viewer');
build_world(stage.scene);
const signs = build_wall_signs(stage.scene);
const markers = build_photo_markers(stage.scene);
const flight = create_camera_flight(stage.camera, stage.controls);
attach_pointer_controller(stage, { signs, markers }, { on_photo: show_photo, on_sign: show_sign });
connect_panel();
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
    ...signs.map(sign => ({ kind: 'sign', key: sign.entry.key, title: sign.entry.title, subtitle: sign.entry.wall === 'calle_12' ? 'Fachada Calle 12' : 'Soportal Carrera 7', image: photo_bundle[sign.entry.key].source })),
  ]);
  panel.addEventListener('panel-select', ({ detail }) => detail.kind === 'photo'
    ? show_photo(photo_viewpoints.find(viewpoint => viewpoint.key === detail.key))
    : show_sign(signs.find(sign => sign.entry.key === detail.key)));
  panel.addEventListener('panel-command', ({ detail }) => run_command(detail.command));
  viewer.addEventListener('viewer-close', () => panel.set_active(''));
}

function run_command(command) {
  if (command === 'reset') return reset_signs(signs);
  flight.fly_to(overview_views[command]);
}

function show_photo(viewpoint) {
  flight.fly_to(viewpoint);
  viewer.show({ title: viewpoint.title, image: photo_bundle[viewpoint.key].source });
  panel.set_active(viewpoint.key);
}

function show_sign(sign) {
  const center = sign.group.position;
  const camera_position = center.clone().addScaledVector(sign.wall.normal, 4.5);
  flight.fly_to({ camera_position: [camera_position.x, center.y + 0.6, camera_position.z], look_at: center.toArray() });
  viewer.show({ title: sign.entry.title, image: photo_bundle[sign.entry.key].source });
  panel.set_active(sign.entry.key);
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
