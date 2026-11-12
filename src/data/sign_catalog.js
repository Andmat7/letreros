// Proposed signs, named after the street they face, drawn as blank white boards until their artwork exists. Each one hangs on
// a wall at a distance from the building corner and a center height above the sidewalk;
// both can be changed by dragging. reference_photo is the photo that shows the spot. Sizes are suggestions in meters.
export const sign_catalog = [
  // Boards start at 1.2 m, the window sill height; the Calle 12 board is 2 m tall to take another section.
  // Measured on site: the corner column is 0.39 m wide on Carrera 7, so a 0.30 m board fits with 4.5 cm to spare.
  { key: 'carrera_7', reference_photo: 'esquina_cerca', title: 'Pendón Carrera 7 – columna de la esquina (0.30 × 1.40 m)', wall: 'carrera_7', width: 0.3, height: 1.4, distance_from_corner: 0.195, center_height: 1.9 },
  // The same column is 0.88 m wide on Calle 12 (up to the first window); 0.60 m leaves 14 cm each side.
  { key: 'calle_12', reference_photo: 'esquina_calle_12', title: 'Pendón Calle 12 (0.60 × 2.00 m)', wall: 'calle_12', width: 0.6, height: 2, distance_from_corner: 0.44, center_height: 2.2 },
];
