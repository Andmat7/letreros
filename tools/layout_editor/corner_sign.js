// The Calle 12 corner sign, cut into bands and pieces by tools/cut_corner_sign_parts.py; the services band and
// its pieces come from new art cut by tools/cut_servicios_parts.py.
export const corner_sign_key = 'esquina_calle_12';

const sign_folder = '../../images/signs/partes/esquina_calle_12_nueva';
const sign_height = 4480;
const bands = [
  ['01_cabecera', 0],
  ['02_nequi', 583],
  ['03_bancolombia', 1563],
  ['04_servicios_publicos', 2263],
  ['05_davivienda', 3525],
];
const band_titles = ['1. cabecera', '2. nequi', '3. bancolombia', '4. servicios', '5. davivienda'];
// Pieces as [section index, folder, name, x, y], in pixels of the sign, back to front.
const pieces = [
  [0, 'logos', 'flecha_izquierda', 134, 156],
  [0, 'textos', 'en_la_tienda', 770, 62],
  [0, 'logos', 'logo_esika', 746, 241],
  [1, 'textos', 'texto_recarga', 228, 678],
  [1, 'logos', 'logo_nequi', 121, 915],
  [1, 'textos', 'texto_hazlo_facil', 231, 1293],
  [1, 'fotos', 'celular_nequi', 1313, 877],
  [2, 'fotos', 'tarjeta_bancolombia', 75, 1705],
  [2, 'logos', 'logo_bancolombia', 608, 1747],
  [2, 'textos', 'texto_corresponsal', 899, 2034],
  [3, 'textos', 'texto_paga_aqui', 250, 2270],
  [3, 'textos', 'texto_luz_agua_gas', 435, 2552],
  [3, 'fotos', 'facturas_servicios', 131, 2648],
  [3, 'textos', 'texto_tambien_recargas', 427, 3266],
  [3, 'logos', 'logos_operadores', 616, 3355],
  [4, 'logos', 'logo_davivienda', 178, 3584],
  [4, 'logos', 'logo_daviplata', 172, 3960],
  [4, 'fotos', 'celular_davivienda', 1256, 3512],
  [4, 'textos', 'texto_envia', 57, 4356],
];

// Scale, stretch, hidden or deleted pieces from the layout last saved in the editor. The header
// background is hidden because its old text is baked into the cut file.
export const default_adjustments = {
  '01_cabecera': { visible: false },
  '02_nequi': { stretch: 1.0458911419423693 },
  '03_bancolombia': { stretch: 0.9459459459459459 },
  '05_davivienda': { stretch: 1.0042060988433228 },
  flecha_izquierda: { scale: 1.16 },
  en_la_tienda: { scale: 2 },
  logo_esika: { scale: 2 },
  texto_recarga: { scale: 0.95 },
  logo_nequi: { scale: 0.94 },
  celular_nequi: { scale: 0.94 },
  tarjeta_bancolombia: { scale: 1.44 },
  logo_bancolombia: { scale: 0.99 },
  texto_corresponsal: { scale: 0.7 },
  logo_davivienda: { scale: 1.06 },
  celular_davivienda: { scale: 1.41 },
};

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
