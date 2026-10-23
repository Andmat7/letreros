import { reference_person } from './building_measurements.js';

const eye = reference_person.eye_height;

// Where each photo was taken from (estimated) and what it looks at.
export const photo_viewpoints = [
  { key: 'costado', title: 'Fachada sobre la Calle 12', camera_position: [-5.5, eye, 10.5], look_at: [-5.5, 2.2, 0] },
  { key: 'lado', title: 'Esquina desde el frente', camera_position: [-6, eye, 9], look_at: [1.5, 2.6, -5] },
  { key: 'frente', title: 'Columna de la esquina', camera_position: [4.5, eye, 3.6], look_at: [-1, 2.2, -2.5] },
  { key: 'calle_12_frontal', title: 'Calle 12 desde la acera opuesta', camera_position: [-4, eye, 12], look_at: [-7, 2.4, 0] },
  { key: 'calle_12_diagonal', title: 'Calle 12 desde la esquina opuesta', camera_position: [2, 1.3, 12.5], look_at: [-12, 2.2, 1] },
  { key: 'esquina_cerca', title: 'Columna de la esquina de cerca', camera_position: [1.5, 1.5, 0.8], look_at: [0, 1.9, -0.3] },
  { key: 'esquina_calle_12', title: 'Esquina desde la Calle 12', camera_position: [-2, 1.5, 1.2], look_at: [0.6, 2.2, -0.2] },
  { key: 'esquina_diagonal', title: 'Esquina desde la acera de enfrente', camera_position: [15, eye, 13], look_at: [-1, 2.8, -1] },
];

export const overview_views = {
  home: { camera_position: [18, 13, 20], look_at: [-5, 2, -5] },
  top: { camera_position: [-4, 45, 8], look_at: [-4, 0, -2] },
};
