import * as THREE from 'three';
import { photo_bundle } from '../generated/photo_bundle.js';

const default_fov = 50;

// Puts the camera where a photo was taken, with the same lens, and lays the photo over the
// view so the model can be checked against it. on_close runs when the comparison ends.
export function create_photo_comparison({ stage, flight, overlay }, on_close) {
  const comparison = { stage, overlay, on_close, active_photo: null };
  overlay.addEventListener('overlay-fov', ({ detail }) => change_fov(comparison, detail.fov));
  overlay.addEventListener('overlay-copy', () => copy_camera(comparison));
  overlay.addEventListener('overlay-close', () => close_photo(comparison));
  addEventListener('resize', () => comparison.active_photo && match_lens(comparison));
  return {
    open: (viewpoint) => open_photo(comparison, flight, viewpoint),
    close: () => close_photo(comparison),
  };
}

function open_photo(comparison, flight, viewpoint) {
  const image = photo_bundle[viewpoint.key];
  comparison.active_photo = { viewpoint, fov: viewpoint.fov, aspect: image.width / image.height };
  flight.fly_to(viewpoint);
  match_lens(comparison);
  comparison.overlay.show({ title: viewpoint.title, image: image.source, fov: viewpoint.fov });
}

function close_photo(comparison) {
  if (!comparison.active_photo) return;
  comparison.active_photo = null;
  comparison.stage.camera.fov = default_fov;
  comparison.stage.camera.updateProjectionMatrix();
  comparison.overlay.hide();
  comparison.on_close();
}

function change_fov(comparison, fov) {
  comparison.active_photo.fov = fov;
  match_lens(comparison);
}

// The photo is shown whole and centered, so when it does not fill the screen height the
// camera opens wider until the photo's own vertical field of view spans the photo's height.
function match_lens({ stage, active_photo }) {
  const photo_height_share = Math.min(1, (innerWidth / innerHeight) / active_photo.aspect);
  const half_tangent = Math.tan(THREE.MathUtils.degToRad(active_photo.fov / 2)) / photo_height_share;
  stage.camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(half_tangent));
  stage.camera.updateProjectionMatrix();
}

// Copies the adjusted camera as a line for photo_viewpoints.js.
async function copy_camera({ stage, overlay, active_photo }) {
  const rounded = (vector) => vector.toArray().map(value => Number(value.toFixed(2))).join(', ');
  const text = `{ key: '${active_photo.viewpoint.key}', camera_position: [${rounded(stage.camera.position)}], look_at: [${rounded(stage.controls.target)}], fov: ${active_photo.fov} },`;
  try {
    await navigator.clipboard.writeText(text);
    overlay.set_status('Cámara copiada ✓ Pégamela para dejarla fija.');
  } catch (clipboard_error) {
    overlay.set_status(text);
  }
}
