import * as THREE from 'three';
import { photo_viewpoints } from '../data/photo_viewpoints.js';
import { canvas_texture } from '../scene/textures.js';

const marker_color = 0xc8102e;

// A camera icon above each spot where a photo was taken, plus a dashed sight line.
export function build_photo_markers(scene) {
  const icon_material = new THREE.SpriteMaterial({ map: camera_icon_texture(), depthTest: false });
  return photo_viewpoints.map(viewpoint => {
    const marker = new THREE.Sprite(icon_material);
    const [x, y, z] = viewpoint.camera_position;
    marker.position.set(x, y + 1.2, z);
    marker.renderOrder = 10;
    marker.userData.viewpoint = viewpoint;
    scene.add(marker, sight_line(viewpoint));
    return marker;
  });
}

function sight_line({ camera_position, look_at }) {
  const points = [new THREE.Vector3(...camera_position), new THREE.Vector3(...look_at)];
  const material = new THREE.LineDashedMaterial({ color: marker_color, dashSize: 0.4, gapSize: 0.25 });
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
  line.computeLineDistances();
  return line;
}

function camera_icon_texture() {
  return canvas_texture(128, 128, (context) => {
    context.fillStyle = '#c8102e'; context.beginPath(); context.arc(64, 64, 60, 0, 7); context.fill();
    context.fillStyle = '#fff'; context.fillRect(28, 44, 72, 46); context.fillRect(50, 34, 28, 14);
    context.fillStyle = '#c8102e'; context.beginPath(); context.arc(64, 67, 15, 0, 7); context.fill();
    context.fillStyle = '#fff'; context.beginPath(); context.arc(64, 67, 8, 0, 7); context.fill();
  });
}
