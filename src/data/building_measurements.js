// Every size is in meters. Values marked "estimated" are guesses; "from photos" values were
// fitted from the photos with calibrated cameras (scale set by the on-site measurements).
// Window heights are measured from the sidewalk surface, as with a tape on site.
// Origin: outer corner of the ground floor walls at road level. Calle 12 runs along -x,
// Carrera 7 runs along -z.

export const reference_person = {
  height: 1.70,
  eye_height: 1.58,
};

export const building = {
  ground_floor_height: 3.0, // from photos: underside of the band above the windows
  total_height: 10, // estimated
  brick_course_height: 0.075, // estimated: one brick plus its mortar joint
  calle_12_facade_length: 14.4, // from photos: up to the glass building
  carrera_7_facade_length: 18, // estimated
  corner_pier_depth: 0.42, // measured on site: brick from the corner to the first yellow window, on Carrera 7
  // The ground floor wall on Carrera 7 is flush with the corner (checked on site). The upper
  // floors start right above the corner and only a short slab projects over Carrera 7.
  carrera_7_overhang: 0.4, // estimated from the photo "esquina_calle_12"
};

export const streets = {
  curb_height: 0.15, // estimated: sidewalk surface above the road
  calle_12_sidewalk_width: 3.5, // estimated
  calle_12_road_width: 8, // estimated
  carrera_7_sidewalk_width: 3.5, // estimated
  carrera_7_road_width: 12, // estimated
};

// distance_from_corner: from the building corner to the window edge nearest to it.
// mullions: vertical bars, measured from the left edge as seen from the street.
// transom_from_top: horizontal bar, measured down from the top edge.
// Measured on site: sill_height, and distance_from_corner of the first window (0.88).
// The rest is from photos, mainly the straight-on photo "costado".
export const calle_12_windows = [
  { width: 1.86, height: 1.6, sill_height: 1.20, distance_from_corner: 0.88, mullions: [0.27, 1.04], transom_from_top: 0.63, frame_color: 0x8a7d70, interior: 'menu', has_ledge: true },
  { width: 1.77, height: 1.5, sill_height: 1.20, distance_from_corner: 3.79, mullions: [0.27, 1.05], transom_from_top: 0.58, frame_color: 0x8a7d70, interior: 'menu', has_ledge: true },
  { width: 1.25, height: 1.5, sill_height: 1.20, distance_from_corner: 5.94, mullions: [0.28], transom_from_top: 0.53, frame_color: 0x8a7d70, interior: 'neon', has_ledge: true },
];

// Yellow-framed windows on the Carrera 7 ground floor, measured along the wall. The first one
// is from the photo "esquina_diagonal"; the other two are still estimated.
export const carrera_7_windows = [
  { width: 1.55, height: 1.6, sill_height: 1.2, distance_from_corner: 0.42, mullions: [0.26], transom_from_top: 0.75, frame_color: 0xe0b326, interior: 'plain' },
  { width: 2.6, height: 1.6, sill_height: 1.2, distance_from_corner: 5.5, mullions: [0.9], transom_from_top: 0.55, frame_color: 0xe0b326, interior: 'plain' },
  { width: 2.6, height: 1.6, sill_height: 1.2, distance_from_corner: 9.3, mullions: [0.9], transom_from_top: 0.55, frame_color: 0xe0b326, interior: 'plain' },
];

export const upper_windows = {
  sill_heights: [4.05, 6.85], // first from photos, second estimated
  height: 1.6, // estimated
  frame_color: 0x2a2a2a,
  calle_12: [ // from the photo "calle_12_frontal"
    { width: 1.87, distance_from_corner: 1.0, mullions: [0.93] },
    { width: 1.81, distance_from_corner: 4.0, mullions: [0.9] },
    { width: 0.91, distance_from_corner: 6.53, mullions: [] },
    { width: 0.68, distance_from_corner: 8.2, mullions: [] },
    { width: 1.54, distance_from_corner: 9.77, mullions: [0.77] },
    { width: 1.27, distance_from_corner: 11.64, mullions: [0.63] },
  ],
  carrera_7: [
    { width: 2.2, distance_from_corner: 2.5, mullions: [1.1] },
    { width: 2.2, distance_from_corner: 6.3, mullions: [1.1] },
    { width: 2.2, distance_from_corner: 10.1, mullions: [1.1] },
    { width: 2.2, distance_from_corner: 13.9, mullions: [1.1] },
  ],
};

// Shop with the red ÉSIKA sign, next to the AIDEV shop on Calle 12. From the photo
// "calle_12_frontal" with its calibrated camera. Heights from the sidewalk.
export const esika_shop = {
  door: { distance_from_corner: 9.11, width: 1.49, height: 2.25 },
  display: { distance_from_corner: 10.6, width: 1.4, height: 2.25 },
  red_sign: { distance_from_corner: 10.7, width: 1.1, height: 0.4, bottom_height: 1.87 },
  services_sign: { distance_from_corner: 9.13, width: 1.64, height: 0.36, bottom_height: 2.3 },
  brand_sign: { distance_from_corner: 9.95, width: 3.4, height: 1.15, bottom_height: 2.75 },
};
