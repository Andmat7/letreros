// The Calle 12 corner sign, cut into bands and pieces by tools/cut_corner_sign_parts.py; the services band and
// its pieces come from new art cut by tools/cut_servicios_parts.py, the copy shop from tools/cut_fotocopias_parts.py.
import { frame_parts } from './group_frame.js';

export const corner_sign_key = 'calle_12';

const sign_folder = '../../images/signs/partes/esquina_calle_12_nueva';
const header_folder = '../../images/signs/partes/encabezado_tienda_esika';
// 3200 px per meter: the board is 2.00 m tall, 0.60 m wide.
const sign_height = 6400;
const bands = [
  ['01_cabecera', 0],
  ['02_nequi', 583],
  ['03_bancolombia', 1673],
  ['05_davivienda', 2420],
  ['04_servicios_publicos', 3340],
  ['06_fotocopiadora', 4600],
];
const band_titles = ['1. cabecera', '2. nequi', '3. bancolombia', '4. davivienda', '5. servicios', '6. fotocopias'];
// Under the header the sign has two parts: the banking agent services and the copy shop. The editor sets how much
// of that height each part gets (69 % and 31 % as last arranged). The banking part sits in an Ésika red frame with rounded
// corners and a border in Nequi's purple, so its four sections read as one block while each keeps its own colors.
export const section_groups = [
  { title: 'Corresponsal', sections: [1, 2, 3, 4], frame: { name: 'marco_corresponsal', padding: 56, radius: 96, color: 'rgb(190, 4, 4)', border: { width: 16, color: '#5c1d8f' } } },
  { title: 'Fotocopiadora', sections: [5] },
];
// Pieces as [section index, folder, name, x, y], in pixels of the sign, back to front.
const pieces = [
  // The arrow is a tip and a straight body, so "ancho" on the body lengthens it without bending the tip.
  [0, 'header', 'flecha_cuerpo', 198, 212],
  [0, 'header', 'flecha_punta', 45, 128],
  [0, 'header', 'texto_rojo', 512, 83],
  [0, 'header', 'texto_azul', 547, 344],
  // Each service shows only its name and what can be done there; the plain texts come from tools/make_text_pieces.py.
  [1, 'logos', 'logo_nequi', 120, 900],
  [1, 'textos', 'texto_retiros_recargas', 117, 1215],
  [1, 'fotos', 'celular_nequi', 1104, 791],
  [2, 'fotos', 'tarjeta_bancolombia', 92, 1778],
  [2, 'logos', 'logo_bancolombia', 793, 1880],
  [2, 'textos', 'texto_retiros_consignaciones', 841, 2085],
  [3, 'logos', 'logo_davivienda', 221, 2566],
  [3, 'logos', 'logo_daviplata', 143, 2904],
  [3, 'fotos', 'celular_davivienda', 1217, 2409],
  [4, 'textos', 'texto_paga_tus', 411, 3372],
  [4, 'textos', 'texto_luz_agua_gas', 531, 3595],
  [4, 'fotos', 'facturas_servicios', 358, 3695],
  [4, 'textos', 'texto_recargas_operadores', 492, 4190],
  [4, 'logos', 'logos_operadores', 509, 4305],
  [5, 'logos', 'flecha_fotocopias', 174, 4773],
  [5, 'textos', 'texto_fotocopias_documentos', 467, 4742],
  [5, 'textos', 'texto_primer_local_izquierda', 462, 4873],
  [5, 'fotos', 'impresora', 125, 5334],
  [5, 'fotos', 'panel_fotocopias', 909, 5148],
];

// Scale and stretch of the pieces from the layout last arranged in the editor. The frame lies over everything.
export const default_adjustments = {
  marco_corresponsal: { order: 1000 },
  flecha_cuerpo: { scale: 0.95, widen: 0.91, length: 0.91 },
  flecha_punta: { scale: 0.95 },
  texto_azul: { scale: 0.94 },
  '02_nequi': { stretch: 1.1632870864461047 },
  '03_bancolombia': { stretch: 1.0094594594594595 },
  '05_davivienda': { stretch: 0.9674027339642481 },
  '04_servicios_publicos': { stretch: 0.9984152139461173 },
  '06_fotocopiadora': { stretch: 1.0315186246418337 },
  logo_nequi: { scale: 0.85 },
  texto_retiros_recargas: { scale: 0.66 },
  celular_nequi: { scale: 1.16 },
  tarjeta_bancolombia: { scale: 1.82 },
  logo_bancolombia: { scale: 0.78 },
  texto_retiros_consignaciones: { scale: 0.95 },
  logo_davivienda: { scale: 0.872 },
  logo_daviplata: { scale: 0.823 },
  celular_davivienda: { scale: 1.27 },
  texto_paga_tus: { scale: 0.78 },
  texto_luz_agua_gas: { scale: 0.822 },
  facturas_servicios: { scale: 0.72 },
  texto_recargas_operadores: { scale: 0.75 },
  logos_operadores: { scale: 1.25 },
};

export const sign_size = { width: 1920, height: sign_height };
export const original_image = '../../images/signs/propuestas/esquina_calle_12_nueva_0x6_1x4.webp';

// The header band is the plain red of tools/make_store_header_parts.py, with white letters on it.
// The Nequi, Bancolombia and Davivienda bands are plain shadings from tools/make_plain_bands.py, because the cut
// bands keep traces of the texts lifted off them.
const plain_bands = ['02_nequi', '03_bancolombia', '05_davivienda'];
const band_source = (name) => {
  if (name === '01_cabecera') return `${header_folder}/ancho/fondo.webp`;
  return plain_bands.includes(name) ? `${sign_folder}/fondos_lisos/${name}.webp` : `${sign_folder}/fondos/${name}.webp`;
};
const band_parts = bands.map(([name, y], index) => ({
  name, source: band_source(name), x: 0, y, is_background: true, section: band_titles[index],
}));
// The header pieces live in their own folder, shared with the column sign's art.
// The DaviPlata logo is used without its red box (tools/key_daviplata_logo.py), so it sits on the plain band.
const keyed_files = { logo_daviplata: 'logo_daviplata_sin_fondo' };
const piece_source = (folder, name) => (folder === 'header' ? `${header_folder}/ancho/${name}.webp` : `${sign_folder}/${folder}/${keyed_files[name] ?? name}.webp`);
// The body stays centered on the tip; see arrow_joints.js.
const joints = { flecha_cuerpo: { to: 'flecha_punta', anchor: 'right_middle' } };
const piece_parts = pieces.map(([index, folder, name, x, y]) => ({
  name, source: piece_source(folder, name), joint: joints[name], x, y, is_background: false, section: band_titles[index],
}));
export const parts_catalog = [...band_parts, ...piece_parts, ...frame_parts(section_groups, 1920)];

// Every band stretches to its slot, the red header too.
export const sections = bands.map(([name], index) => ({
  title: band_titles[index],
  background: name,
  stretch_background: true,
  pieces: [name, ...pieces.filter(([section]) => section === index).map(([, , piece]) => piece)],
}));

export const original_section_heights = bands.map(([, top], index) => (bands[index + 1]?.[1] ?? sign_height) - top);
