// The Calle 12 corner sign, cut into bands and pieces by tools/cut_corner_sign_parts.py; the services band and
// its pieces come from new art cut by tools/cut_servicios_parts.py.
export const corner_sign_key = 'esquina_calle_12';

const sign_folder = '../../images/signs/partes/esquina_calle_12_nueva';
// 3200 px per meter: the board is 2.00 m tall, 0.60 m wide.
const sign_height = 6400;
const bands = [
  ['01_cabecera', 0],
  ['02_nequi', 583],
  ['03_bancolombia', 1909],
  ['06_seccion_nueva', 2818],
  ['04_servicios_publicos', 3682],
  ['05_davivienda', 5282],
];
const band_titles = ['1. cabecera', '2. nequi', '3. bancolombia', '4. fotocopias', '5. servicios', '6. davivienda'];
// Pieces as [section index, folder, name, x, y], in pixels of the sign, back to front.
const pieces = [
  [0, 'logos', 'flecha_izquierda', 134, 156],
  [0, 'textos', 'en_la_tienda', 770, 62],
  [0, 'logos', 'logo_esika', 746, 241],
  [1, 'textos', 'texto_recarga', 228, 715],
  [1, 'logos', 'logo_nequi', 121, 1029],
  [1, 'textos', 'texto_hazlo_facil', 231, 1547],
  [1, 'fotos', 'celular_nequi', 1313, 980],
  [2, 'fotos', 'tarjeta_bancolombia', 75, 2091],
  [2, 'logos', 'logo_bancolombia', 608, 2149],
  [2, 'textos', 'texto_corresponsal', 899, 2520],
  [3, 'textos', 'texto_fotocopias', 160, 2940],
  [3, 'logos', 'flecha_primer_local', 160, 3224],
  [3, 'textos', 'texto_en_el_primer_local', 800, 3240],
  [4, 'textos', 'texto_paga_aqui', 250, 3693],
  [4, 'textos', 'texto_luz_agua_gas', 435, 4051],
  [4, 'fotos', 'facturas_servicios', 131, 4177],
  [4, 'textos', 'texto_tambien_recargas', 427, 4956],
  [4, 'logos', 'logos_operadores', 616, 5067],
  [5, 'logos', 'logo_davivienda', 178, 5345],
  [5, 'logos', 'logo_daviplata', 172, 5789],
  [5, 'fotos', 'celular_davivienda', 1256, 5269],
  [5, 'textos', 'texto_envia', 57, 6249],
];

// Scale, stretch, hidden or deleted pieces from the layout last saved in the editor. The header
// background is hidden because its old text is baked into the cut file.
export const default_adjustments = {
  '01_cabecera': { visible: false },
  '02_nequi': { stretch: 1.415154749199573 },
  '03_bancolombia': { stretch: 1.2283783783783784 },
  '06_seccion_nueva': { stretch: 0.45 },
  '04_servicios_publicos': { stretch: 1.2678288431061806 },
  '05_davivienda': { stretch: 1.1756046267087277 },
  flecha_izquierda: { scale: 1.16 },
  en_la_tienda: { scale: 2 },
  logo_esika: { scale: 2 },
  texto_recarga: { scale: 0.95 },
  logo_nequi: { scale: 0.94 },
  celular_nequi: { scale: 0.93 },
  tarjeta_bancolombia: { scale: 1.44 },
  logo_bancolombia: { scale: 0.99 },
  texto_corresponsal: { scale: 0.7 },
  flecha_primer_local: { scale: 1.4 },
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
