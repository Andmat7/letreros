// The Calle 12 corner sign, cut into one band per section by tools/cut_corner_sign_bands.py.
export const corner_sign_key = 'esquina_calle_12';

const band_folder = '../../images/signs/partes/esquina_calle_12_nueva';
const sign_height = 4480;
const bands = [
  ['01_cabecera', 0],
  ['02_nequi', 583],
  ['03_bancolombia', 1520],
  ['04_servicios', 2260],
  ['05_davivienda', 3529],
];
const band_titles = ['1. cabecera', '2. nequi', '3. bancolombia', '4. servicios', '5. davivienda'];

export const sign_size = { width: 1920, height: sign_height };
export const original_image = '../../images/signs/propuestas/esquina_calle_12_nueva_0x6_1x4.webp';

export const parts_catalog = bands.map(([name, y], index) => ({
  name, source: `${band_folder}/${name}.webp`, x: 0, y, is_background: true, section: band_titles[index],
}));

// The header keeps its proportions, the other bands stretch to their slot like the column sign's bands.
export const sections = bands.map(([name], index) => ({
  title: band_titles[index], background: name, stretch_background: index > 0, pieces: [name],
}));

export const original_section_heights = bands.map(([, top], index) => (bands[index + 1]?.[1] ?? sign_height) - top);
