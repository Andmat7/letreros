// The Calle 12 corner sign, cut into bands and pieces by tools/cut_corner_sign_parts.py.
export const corner_sign_key = 'esquina_calle_12';

const sign_folder = '../../images/signs/partes/esquina_calle_12_nueva';
const sign_height = 4480;
const bands = [
  ['01_cabecera', 0],
  ['02_nequi', 583],
  ['03_bancolombia', 1520],
  ['04_servicios', 2260],
  ['05_davivienda', 3529],
];
const band_titles = ['1. cabecera', '2. nequi', '3. bancolombia', '4. servicios', '5. davivienda'];
// Pieces as [section index, folder, name, x, y], in pixels of the sign, back to front.
const pieces = [
  [0, 'logos', 'flecha', 371, 23],
  [0, 'textos', 'texto_a_la_vuelta', 909, 51],
  [0, 'textos', 'texto_tagline', 103, 434],
  [1, 'textos', 'texto_recarga', 240, 634],
  [1, 'logos', 'logo_nequi', 171, 846],
  [1, 'textos', 'texto_hazlo_facil', 343, 1309],
  [1, 'fotos', 'celular_nequi', 1200, 806],
  [2, 'fotos', 'tarjeta_bancolombia', 699, 1533],
  [2, 'logos', 'logo_bancolombia', 263, 1823],
  [2, 'textos', 'texto_corresponsal', 423, 2034],
  [3, 'textos', 'texto_pago_servicios', 274, 2303],
  [3, 'textos', 'texto_servicios_lista', 474, 2583],
  [3, 'fotos', 'facturas', 160, 2680],
  [3, 'logos', 'iconos_servicios', 286, 3349],
  [4, 'logos', 'logo_davivienda', 371, 3594],
  [4, 'logos', 'logo_daviplata', 303, 3949],
  [4, 'fotos', 'celular_davivienda', 1331, 3566],
  [4, 'textos', 'texto_envia', 331, 4326],
];

export const sign_size = { width: 1920, height: sign_height };
export const original_image = '../../images/signs/propuestas/esquina_calle_12_nueva_0x6_1x4.webp';

const band_parts = bands.map(([name, y], index) => ({
  name, source: `${sign_folder}/fondos/${name}.webp`, x: 0, y, is_background: true, section: band_titles[index],
}));
const piece_parts = pieces.map(([index, folder, name, x, y]) => ({
  name, source: `${sign_folder}/${folder}/${name}.webp`, x, y, is_background: false, section: band_titles[index],
}));
export const parts_catalog = [...band_parts, ...piece_parts];

// The header keeps its proportions, the other bands stretch to their slot like the column sign's bands.
export const sections = bands.map(([name], index) => ({
  title: band_titles[index],
  background: name,
  stretch_background: index > 0,
  pieces: [name, ...pieces.filter(([section]) => section === index).map(([, , piece]) => piece)],
}));

export const original_section_heights = bands.map(([, top], index) => (bands[index + 1]?.[1] ?? sign_height) - top);
