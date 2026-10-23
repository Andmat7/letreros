import * as THREE from 'three';

const edge_color = 0xff3df2;
const edge_background = new THREE.Color(0x101418);
// Faces meeting at a smaller angle than this share no drawn edge, so curved shapes stay clean.
const crease_angle = 25;

// Draws the model as its edges only, to compare with the edges found in a photo. Faces are
// kept as invisible depth, so edges behind a wall stay hidden.
export function create_model_edges(scene) {
  return { scene, group: new THREE.Group(), saved_background: scene.background };
}

export function set_model_edges(model_edges, is_on) {
  const { scene } = model_edges;
  // Rebuilt every time, so dragged signs show where they are now.
  scene.remove(model_edges.group);
  model_edges.group = is_on ? edge_group(scene) : new THREE.Group();
  scene_meshes(scene).flatMap(mesh => [mesh.material].flat()).forEach(material => hide_faces(material, is_on));
  scene.background = is_on ? edge_background : model_edges.saved_background;
  scene.add(model_edges.group);
}

function edge_group(scene) {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({ color: edge_color });
  scene_meshes(scene).forEach(mesh => {
    const lines = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, crease_angle), material);
    mesh.updateWorldMatrix(true, false);
    lines.applyMatrix4(mesh.matrixWorld);
    group.add(lines);
  });
  return group;
}

function scene_meshes(scene) {
  const meshes = [];
  scene.traverseVisible(object => { if (object.isMesh) meshes.push(object); });
  return meshes;
}

// Pushing the faces back a little keeps their own edges from being hidden by them.
function hide_faces(material, is_hidden) {
  material.colorWrite = !is_hidden;
  material.polygonOffset = is_hidden;
  material.polygonOffsetFactor = 1;
  material.polygonOffsetUnits = 1;
  material.needsUpdate = true;
}
