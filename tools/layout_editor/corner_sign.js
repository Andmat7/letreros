// The Calle 12 corner sign, cut into bands and pieces by tools/cut_corner_sign_parts.py; the services band and
// its pieces come from new art cut by tools/cut_servicios_parts.py.
export const corner_sign_key = 'calle_12';

const sign_folder = '../../images/signs/partes/esquina_calle_12_nueva';
const header_folder = '../../images/signs/partes/encabezado_tienda_esika';
// 3200 px per meter: the board is 2.00 m tall, 0.60 m wide.
const sign_height = 6400;
const bands = [
  ['01_cabecera', 0],
  ['02_nequi', 583],
  ['03_bancolombia', 1673],
  ['04_servicios_publicos', 2420],
  ['05_davivienda', 3735],
  ['06_seccion_nueva', 4655],
];
const band_titles = ['1. cabecera', '2. nequi', '3. bancolombia', '4. servicios', '5. davivienda', '6. fotocopias'];
// Under the header the sign has two parts: the banking agent services and the copy shop. The editor sets how much
// of that height each part gets (70 % and 30 % to start).
export const section_groups = [
  { title: 'Corresponsal', sections: [1, 2, 3, 4] },
  { title: 'Fotocopiadora', sections: [5] },
];
// Pieces as [section index, folder, name, x, y], in pixels of the sign, back to front.
const pieces = [
  // The arrow is a tip and a straight body, so "ancho" on the body lengthens it without bending the tip.
  [0, 'header', 'flecha_cuerpo', 198, 212],
  [0, 'header', 'flecha_punta', 45, 128],
  [0, 'header', 'texto_rojo', 512, 83],
  [0, 'header', 'texto_azul', 547, 344],
  [1, 'textos', 'texto_recarga', 367, 692],
  [1, 'logos', 'logo_nequi', 279, 950],
  [1, 'textos', 'texto_hazlo_facil', 370, 1375],
  [1, 'fotos', 'celular_nequi', 1259, 909],
  [2, 'fotos', 'tarjeta_bancolombia', 237, 1823],
  [2, 'logos', 'logo_bancolombia', 675, 1870],
  [2, 'textos', 'texto_corresponsal', 915, 2175],
  [3, 'textos', 'texto_paga_aqui', 378, 2429],
  [3, 'textos', 'texto_luz_agua_gas', 530, 2723],
  [3, 'fotos', 'facturas_servicios', 280, 2827],
  [3, 'textos', 'texto_tambien_recargas', 523, 3467],
  [3, 'logos', 'logos_operadores', 679, 3558],
  [4, 'logos', 'logo_davivienda', 321, 3787],
  [4, 'logos', 'logo_daviplata', 316, 4152],
  [4, 'fotos', 'celular_davivienda', 1208, 3724],
  [4, 'textos', 'texto_envia', 221, 4531],
  [5, 'textos', 'texto_fotocopias', 76, 4930],
  [5, 'logos', 'flecha_primer_local', 76, 5622],
  [5, 'textos', 'texto_en_el_primer_local', 783, 5669],
];

// Scale and stretch of the pieces at the 70 % / 30 % split.
export const default_adjustments = {
  flecha_cuerpo: { scale: 0.95, widen: 0.91, length: 0.91 },
  flecha_punta: { scale: 0.95 },
  texto_azul: { scale: 0.94 },
  '02_nequi': { stretch: 1.1632870864461047 },
  '03_bancolombia': { stretch: 1.0094594594594595 },
  '04_servicios_publicos': { stretch: 1.0419968304278922 },
  '05_davivienda': { stretch: 0.9674027339642481 },
  '06_seccion_nueva': { stretch: 0.9088541666666666 },
  texto_recarga: { scale: 0.781 },
  logo_nequi: { scale: 0.773 },
  texto_hazlo_facil: { scale: 0.822 },
  celular_nequi: { scale: 0.764 },
  tarjeta_bancolombia: { scale: 1.183 },
  logo_bancolombia: { scale: 0.814 },
  texto_corresponsal: { scale: 0.575 },
  texto_paga_aqui: { scale: 0.822 },
  texto_luz_agua_gas: { scale: 0.822 },
  facturas_servicios: { scale: 0.822 },
  texto_tambien_recargas: { scale: 0.822 },
  logos_operadores: { scale: 0.822 },
  logo_davivienda: { scale: 0.872 },
  logo_daviplata: { scale: 0.823 },
  celular_davivienda: { scale: 1.16 },
  texto_envia: { scale: 0.823 },
  texto_fotocopias: { scale: 1.105 },
  flecha_primer_local: { scale: 1.547 },
  texto_en_el_primer_local: { scale: 1.105 },
};

export const sign_size = { width: 1920, height: sign_height };
export const original_image = '../../images/signs/propuestas/esquina_calle_12_nueva_0x6_1x4.webp';

// The header band is the plain red of tools/make_store_header_parts.py, with white letters on it.
const band_source = (name) => (name === '01_cabecera' ? `${header_folder}/ancho/fondo.webp` : `${sign_folder}/fondos/${name}.webp`);
const band_parts = bands.map(([name, y], index) => ({
  name, source: band_source(name), x: 0, y, is_background: true, section: band_titles[index],
}));
// The header pieces live in their own folder, shared with the column sign's art.
const piece_source = (folder, name) => (folder === 'header' ? `${header_folder}/ancho/${name}.webp` : `${sign_folder}/${folder}/${name}.webp`);
// The body stays centered on the tip; see arrow_joints.js.
const joints = { flecha_cuerpo: { to: 'flecha_punta', anchor: 'right_middle' } };
const piece_parts = pieces.map(([index, folder, name, x, y]) => ({
  name, source: piece_source(folder, name), joint: joints[name], x, y, is_background: false, section: band_titles[index],
}));
export const parts_catalog = [...band_parts, ...piece_parts];

// Every band stretches to its slot, the red header too.
export const sections = bands.map(([name], index) => ({
  title: band_titles[index],
  background: name,
  stretch_background: true,
  pieces: [name, ...pieces.filter(([section]) => section === index).map(([, , piece]) => piece)],
}));

export const original_section_heights = bands.map(([, top], index) => (bands[index + 1]?.[1] ?? sign_height) - top);
