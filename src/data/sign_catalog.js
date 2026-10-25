// Proposed signs, drawn as blank white boards until their artwork exists. Each one hangs on
// a wall at a distance from the building corner and a center height above the sidewalk;
// both can be changed by dragging. reference_photo is the photo that shows the spot. Sizes are suggestions in meters.
export const sign_catalog = [
  // Boards are 1.4 m tall and start at 1.2 m, the window sill height.
  // Measured on site: the corner column is 0.39 m wide on Carrera 7, so a 0.30 m board fits with 4.5 cm to spare.
  { key: 'columna_esquina', reference_photo: 'esquina_cerca', title: 'Columna de la esquina (0.30 × 1.40 m)', wall: 'carrera_7', width: 0.3, height: 1.4, distance_from_corner: 0.195, center_height: 1.9 },
  // The same column is 0.88 m wide on Calle 12 (up to the first window); 0.60 m leaves 14 cm each side.
  { key: 'esquina_calle_12', reference_photo: 'esquina_calle_12', title: 'Esquina desde la Calle 12 (0.60 × 1.40 m)', wall: 'calle_12', width: 0.6, height: 1.4, distance_from_corner: 0.44, center_height: 1.9 },
];
