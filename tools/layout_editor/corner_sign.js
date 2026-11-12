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
  [0, 'header', 'flecha_cuerpo', 200, 235],
  [0, 'header', 'flecha_punta', 81, 169],
  [0, 'header', 'texto_rojo', 437, 114],
  [0, 'header', 'texto_azul', 395, 371],
  // Each service shows only its name and what can be done there; the plain texts come from tools/make_text_pieces.py.
  [1, 'textos', 'texto_retiros_recargas', 193, 717],
  [1, 'logos', 'logo_nequi', 113, 1041],
  [1, 'fotos', 'celular_nequi', 1168, 846],
  [2, 'fotos', 'tarjeta_bancolombia', 56, 1787],
  [2, 'logos', 'logo_bancolombia', 730, 1817],
  [2, 'textos', 'texto_retiros_consignaciones', 887, 2103],
  [3, 'logos', 'logo_davivienda', 194, 2566],
  [3, 'logos', 'logo_daviplata', 188, 2922],
  [3, 'fotos', 'celular_davivienda', 1135, 2409],
  // Two columns: paying the bills on the left, phone top-ups on the right with the carriers in an even 2 x 2 grid,
  // each as big as the others and centered in its cell (split by tools/split_operator_logos.py).
  [4, 'fondos_lisos', 'panel_recargas', 1220, 3340],
  [4, 'textos', 'texto_paga_tus', 109, 3496],
  [4, 'textos', 'texto_tipos_servicios', 221, 4335],
  [4, 'fotos', 'facturas_servicios', -21, 3764],
  [4, 'textos', 'texto_recargas_operadores', 1285, 3524],
  [4, 'logos', 'logo_claro', 1255, 3800],
  [4, 'logos', 'logo_tigo', 1574, 3800],
  [4, 'logos', 'logo_movistar', 1254, 4182],
  [4, 'logos', 'logo_wom', 1574, 4180],
  [5, 'logos', 'flecha_fotocopias', 174, 4767],
  // Both copy shop texts are drawn in Poppins by tools/make_text_pieces.py.
  [5, 'textos', 'texto_fotocopias_titulo', 520, 4680],
  [5, 'textos', 'texto_fotocopias_direccion', 616, 4895],
  [5, 'fotos', 'impresora', 125, 5307],
  // The services panel is redrawn in Poppins without the laptop by tools/make_copy_shop_panel.py.
  [5, 'fotos', 'panel_servicios_fotocopias', 963, 5339],
];

// Scale and stretch of the pieces from the layout last arranged in the editor. The frame lies over everything.
export const default_adjustments = {
  marco_corresponsal: { order: 1000 },
  '02_nequi': { stretch: 1.1632870864461047 },
  '03_bancolombia': { stretch: 1.0094594594594595 },
  '05_davivienda': { stretch: 0.9674027339642481 },
  '04_servicios_publicos': { stretch: 0.9984152139461173 },
  '06_fotocopiadora': { stretch: 1.0315186246418337 },
  texto_fotocopias_titulo: { scale: 0.9 },
  texto_fotocopias_direccion: { scale: 0.85 },
  texto_rojo: { scale: 0.98 },
  logo_nequi: { scale: 0.92 },
  texto_retiros_recargas: { scale: 1.15 },
  celular_nequi: { scale: 1.16 },
  tarjeta_bancolombia: { scale: 1.82 },
  logo_bancolombia: { scale: 0.84 },
  texto_retiros_consignaciones: { scale: 0.91 },
  logo_davivienda: { scale: 0.872 },
  logo_daviplata: { scale: 0.823 },
  celular_davivienda: { scale: 1.49 },
  texto_paga_tus: { scale: 0.74 },
  texto_tipos_servicios: { scale: 0.82 },
  facturas_servicios: { scale: 0.77 },
  logo_claro: { scale: 1.58 },
  logo_tigo: { scale: 0.438 },
  logo_movistar: { scale: 1.73 },
  logo_wom: { scale: 0.543 },
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
// The DaviPlata logo is used without its red box (tools/key_daviplata_logo.py), so it sits on the plain band, and
// Tigo and WOM are the round logos cut by tools/cut_round_logos.py.
const keyed_files = { logo_daviplata: 'logo_daviplata_sin_fondo', logo_tigo: 'logo_tigo_circulo', logo_wom: 'logo_wom_circulo' };
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
