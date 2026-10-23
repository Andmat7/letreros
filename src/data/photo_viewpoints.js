// Where each photo was taken from, what it looks at, the photo's vertical field of view in
// degrees and its roll: the degrees that turn the photo level. Each camera was fitted to
// points of the model seen in its photo; "esquina_calle_12" is still estimated by eye.
export const photo_viewpoints = [
  { key: 'costado', title: 'Fachada sobre la Calle 12', camera_position: [-3.4, 1.69, 11.06], look_at: [-3.39, 1.65, 1.07], fov: 28.1, roll: -0.1 },
  { key: 'lado', title: 'Esquina desde el frente', camera_position: [-0.48, 1.5, 8.72], look_at: [-0.77, 0.77, -1.25], fov: 58.1, roll: 0.3 },
  { key: 'frente', title: 'Columna de la esquina', camera_position: [2.59, 1.64, -0.37], look_at: [-7.38, 1.44, 0.32], fov: 67, roll: -0.1 },
  { key: 'calle_12_frontal', title: 'Calle 12 desde la acera opuesta', camera_position: [-0.64, 2.13, 9.03], look_at: [-4.68, 1.59, -0.1], fov: 42.8, roll: 0.5 },
  { key: 'calle_12_diagonal', title: 'Calle 12 desde la esquina opuesta', camera_position: [5.5, 1.06, 12.65], look_at: [-2.79, 0.55, 7.07], fov: 28.3, roll: 5.7 },
  { key: 'esquina_cerca', title: 'Columna de la esquina de cerca', camera_position: [1.16, 1.71, -0.13], look_at: [-8.56, 4.07, -0.47], fov: 67, roll: 0.2 },
  { key: 'esquina_calle_12', title: 'Esquina desde la Calle 12', camera_position: [-3.05, 1.5, 0.8], look_at: [0, 1.75, 0.25], fov: 67, roll: 0 },
  { key: 'esquina_diagonal', title: 'Esquina desde la acera de enfrente', camera_position: [38.05, 1.88, 17.6], look_at: [28.92, 1.7, 13.54], fov: 15.9, roll: 0.1 },
];

export const overview_views = {
  home: { camera_position: [18, 13, 20], look_at: [-5, 2, -5] },
  top: { camera_position: [-4, 45, 8], look_at: [-4, 0, -2] },
};
