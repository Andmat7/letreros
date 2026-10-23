// Every size is in meters. Values marked "estimated" come from the photos and
// should be replaced with tape measurements taken on site.
// Window heights are measured from the sidewalk surface, as with a tape on site.
// Origin: outer corner of the ground floor walls at road level. Calle 12 runs along -x,
// Carrera 7 runs along -z.

export const reference_person = {
  height: 1.70,
  eye_height: 1.58,
};

export const building = {
  ground_floor_height: 3.4, // estimated
  total_height: 10, // estimated
  brick_course_height: 0.075, // estimated: one brick plus its mortar joint
  calle_12_facade_length: 16.5, // estimated: up to the glass building, past the Ésika shop
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
// Everything else on these windows is still estimated.
export const calle_12_windows = [
  { width: 2.2, height: 1.8, sill_height: 1.20, distance_from_corner: 0.88, mullions: [0.35, 1.28], transom_from_top: 0.68, frame_color: 0x8a7d70, interior: 'menu', has_ledge: true },
  { width: 2.1, height: 1.8, sill_height: 1.20, distance_from_corner: 4.6, mullions: [1.24], transom_from_top: 0.68, frame_color: 0x8a7d70, interior: 'menu', has_ledge: true },
  { width: 1.5, height: 1.8, sill_height: 1.20, distance_from_corner: 7.1, mullions: [], transom_from_top: 0.4, frame_color: 0x8a7d70, interior: 'neon', has_ledge: true },
];

// Yellow-framed windows on the Carrera 7 ground floor, under the overhang, measured along the wall.
export const carrera_7_windows = [
  { width: 2.6, height: 2.1, sill_height: 1.1, distance_from_corner: 0.42, mullions: [0.9], transom_from_top: 0.84, frame_color: 0xe0b326, interior: 'plain' },
  { width: 2.6, height: 2.1, sill_height: 1.1, distance_from_corner: 5.5, mullions: [0.9], transom_from_top: 0.84, frame_color: 0xe0b326, interior: 'plain' },
  { width: 2.6, height: 2.1, sill_height: 1.1, distance_from_corner: 9.3, mullions: [0.9], transom_from_top: 0.84, frame_color: 0xe0b326, interior: 'plain' },
];

export const upper_windows = {
  sill_heights: [4.85, 7.75], // estimated
  height: 1.6, // estimated
  frame_color: 0x2a2a2a,
  calle_12: [
    { width: 2.2, distance_from_corner: 1.15, mullions: [1.1] },
    { width: 2.1, distance_from_corner: 4.6, mullions: [1.05] },
    { width: 1.5, distance_from_corner: 7.1, mullions: [0.75] },
    { width: 2.2, distance_from_corner: 10.1, mullions: [1.1] },
  ],
  carrera_7: [
    { width: 2.2, distance_from_corner: 2.5, mullions: [1.1] },
    { width: 2.2, distance_from_corner: 6.3, mullions: [1.1] },
    { width: 2.2, distance_from_corner: 10.1, mullions: [1.1] },
    { width: 2.2, distance_from_corner: 13.9, mullions: [1.1] },
  ],
};

// Shop with the red ÉSIKA sign, next to the AIDEV shop on Calle 12. Estimated from
// the photos "calle_12_frontal" and "calle_12_diagonal". Heights from the sidewalk.
export const esika_shop = {
  door: { distance_from_corner: 11.7, width: 2.2, height: 2.25 },
  display: { distance_from_corner: 13.95, width: 1.5, height: 2.25 },
  red_sign: { distance_from_corner: 13.95, width: 1.4, height: 0.45, bottom_height: 1.8 },
  services_sign: { distance_from_corner: 11.8, width: 2.0, height: 0.45, bottom_height: 2.45 },
  brand_sign: { distance_from_corner: 12.4, width: 4.4, height: 1.2, bottom_height: 2.95 },
};
