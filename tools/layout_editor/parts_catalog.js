import { sign_catalog } from '../../src/data/sign_catalog.js';

// Every cut piece with the place it has in the proposal (pixels of the sign, 960 px wide).
const bancolombia_folder = '../../images/signs/partes/bancolombia_nueva_1x4_6';
const daviplata_folder = '../../images/signs/partes/daviplata_nueva_1x0_5';
const header_folder = '../../images/signs/partes/encabezado_tienda_esika';
// Pieces shared with the Calle 12 sign: its Poppins texts (tools/make_text_pieces.py), the plain top-ups strip
// (tools/make_plain_bands.py) and the carrier logos, as [source under its folder, name, x, y], back to front.
const calle_12_folder = '../../images/signs/partes/esquina_calle_12_nueva';
const calle_12_texts = `${calle_12_folder}/textos`;
const services_pieces = [
  ['textos/texto_paga_tus', 'texto_paga_tus', 58, 2385],
  ['fondos_lisos/panel_recargas_columna', 'panel_recargas_columna', 0, 3099],
  ['textos/texto_recargas_operadores', 'texto_recargas_operadores', 253, 3115],
  ['logos/logo_claro', 'logo_claro', 76, 3275],
  ['logos/logo_tigo_circulo', 'logo_tigo', 295, 3275],
  ['logos/logo_movistar', 'logo_movistar', 515, 3277],
  ['logos/logo_wom_circulo', 'logo_wom', 735, 3275],
];
const services_names = services_pieces.map(([, name]) => name);

// The printed board is 0.30 × 1.40 m, so the sign keeps that proportion; the extra height goes to the bottom band.
const column_board = sign_catalog.find(({ key }) => key === 'carrera_7');
const sign_width = 960;
export const sign_size = { width: sign_width, height: Math.round((sign_width * column_board.height) / column_board.width) };
export const original_image = '../../images/signs/propuestas/bancolombia_nueva_1x4_6.webp';

// Positions are pixels of the sign, the same boxes the cut scripts in tools/ use. Pieces are listed from back to front.
// The Davivienda band and its pieces come from the Daviplata art, which is as tall as that band.
const bands = [
  ['01_flecha_superior', 0, header_folder],
  ['02_nequi', 400, bancolombia_folder],
  ['03_bancolombia', 1480, bancolombia_folder],
  ['04_servicios', 2350, bancolombia_folder],
  ['05_davivienda', 3489, daviplata_folder],
  ['06_flecha_inferior', 4157, header_folder],
];
const pieces = [
  ['logos', 'destellos_izquierda', 145, 841],
  ['logos', 'destellos_derecha', 625, 892],
  ['textos', 'texto_recarga', 50, 460],
  ['logos', 'logo_nequi', 125, 568],
  ['logos', 'logo_bancolombia', 104, 1900],
  ['fotos', 'facturas', 191, 2585],
  ['fotos', 'tarjeta_bancolombia', 235, 1500],
  ['fotos', 'celular_nequi', 225, 799],
];
const davivienda_pieces = [
  ['logos', 'logo_davivienda', 125, 3546],
  ['logos', 'logo_daviplata', 100, 3836],
  ['fotos', 'celular_davivienda', 574, 3497],
];
// The "a la vuelta, en la tienda ÉSIKA, segundo local a la izquierda" header, drawn by tools/make_store_header_parts.py.
// The same pieces appear in the top and the bottom arrow, each at its own place in its section. Each arrow is a
// tip, a turn and a straight body; "ancho" on the body lengthens the arrow without bending the tip.
const top_arrow_pieces = [
  ['flecha_curva', 72, 176],
  ['flecha_cuerpo', 179, 246],
  ['flecha_punta', 36, 91],
  ['texto_rojo', 438, 124],
  ['texto_tienda', 333, 171],
  ['texto_azul', 328, 236],
];
// The bottom band is shorter than the header art, so its pieces sit higher to stay centered.
const bottom_arrow_pieces = [
  ['flecha_curva', 72, 138],
  ['flecha_cuerpo', 179, 208],
  ['flecha_punta', 36, 53],
  ['texto_rojo', 438, 86],
  ['texto_tienda', 333, 133],
  ['texto_azul', 328, 198],
];
// The turn hangs centered under the tip (its stem is as thick as the body, 63 px) and the body leaves the turn;
// both share the thickness kept on the turn.
const arrow_joints = (prefix) => ({
  [`${prefix}flecha_curva`]: { to: `${prefix}flecha_punta`, anchor: 'below_center', stem: 63 },
  [`${prefix}flecha_cuerpo`]: { to: `${prefix}flecha_curva`, anchor: 'right_bottom', thickness_from: `${prefix}flecha_curva` },
});
// The header pieces were redrawn (Poppins, then "A LA VUELTA" on its own line); new name prefixes let them start
// from these places while the rest of a saved column layout is kept.
const top_prefix = 'encabezado_';
const bottom_prefix = 'pie_';
const joints = { ...arrow_joints(top_prefix), ...arrow_joints(bottom_prefix) };
const top_arrow_names = top_arrow_pieces.map(([file]) => `${top_prefix}${file}`);
const bottom_arrow_names = bottom_arrow_pieces.map(([file]) => `${bottom_prefix}${file}`);

// Sections from top to bottom. Each owns one background band that defines its slot of the sign and stretches to it;
// the flecha bands are the plain red of the header, with white letters on it.
export const sections = [
  { title: '1. flecha superior', background: '01_flecha_superior', stretch_background: true, pieces: ['01_flecha_superior', ...top_arrow_names] },
  { title: '2. nequi', background: '02_nequi', stretch_background: true, pieces: ['02_nequi', 'texto_recarga', 'logo_nequi', 'destellos_izquierda', 'destellos_derecha', 'celular_nequi'] },
  { title: '3. bancolombia', background: '03_bancolombia', stretch_background: true, pieces: ['03_bancolombia', 'tarjeta_bancolombia', 'logo_bancolombia', 'texto_retiros_consignaciones'] },
  { title: '4. servicios', background: '04_servicios', stretch_background: true, pieces: ['04_servicios', 'facturas', ...services_names] },
  { title: '5. davivienda', background: '05_davivienda', stretch_background: true, pieces: ['05_davivienda', 'logo_davivienda', 'logo_daviplata', 'celular_davivienda'] },
  { title: '6. flecha inferior', background: '06_flecha_inferior', stretch_background: true, pieces: ['06_flecha_inferior', ...bottom_arrow_names] },
];

// Scale, stretch, hidden or deleted images and a moved background from the layout last saved in the editor.
// Browsers that already saved a layout keep their own copy until it is reset.
export const default_adjustments = {
  '06_flecha_inferior': { stretch: 323 / 400 },
  '02_nequi': { stretch: 0.8709677419354839 },
  '03_bancolombia': { stretch: 1.0754017305315204 },
  '04_servicios': { stretch: 0.9751712328767124 },
  '05_davivienda': { stretch: 1.3971486761710794 },
  logo_bancolombia: { scale: 0.85 },
  facturas: { scale: 0.62 },
  texto_paga_tus: { scale: 0.6 },
  texto_recargas_operadores: { scale: 0.8 },
  logo_claro: { scale: 0.987 },
  logo_tigo: { scale: 0.273 },
  logo_movistar: { scale: 1.079 },
  logo_wom: { scale: 0.339 },
  tarjeta_bancolombia: { scale: 1 },
  celular_nequi: { scale: 0.84 },
  celular_davivienda: { scale: 1.23 },
  texto_retiros_consignaciones: { scale: 0.82 },
};

// Both flecha bands use the one red header background drawn by tools/make_store_header_parts.py.
const band_source = (name, folder) => (folder === header_folder ? `${header_folder}/columna/fondo.webp` : `${folder}/fondos/${name}.webp`);

const section_of = Object.fromEntries(sections.flatMap((section) => section.pieces.map((name) => [name, section.title])));

export const parts_catalog = [
  ...bands.map(([name, y, folder]) => ({ name, source: band_source(name, folder), x: 0, y, is_background: true })),
  ...pieces.map(([folder, name, x, y]) => ({ name, source: `${bancolombia_folder}/${folder}/${name}.webp`, x, y, is_background: false })),
  { name: 'texto_retiros_consignaciones', source: `${calle_12_texts}/texto_retiros_consignaciones.webp`, x: 83, y: 2070, is_background: false },
  ...services_pieces.map(([file, name, x, y]) => ({ name, source: `${calle_12_folder}/${file}.webp`, x, y, is_background: false })),
  ...davivienda_pieces.map(([folder, name, x, y]) => ({ name, source: `${daviplata_folder}/${folder}/${name}.webp`, x, y, is_background: false })),
  ...top_arrow_pieces.map(([file, x, y]) => ({ name: `${top_prefix}${file}`, source: `${header_folder}/columna/${file}.webp`, x, y, is_background: false })),
  ...bottom_arrow_pieces.map(([file, x, y]) => ({ name: `${bottom_prefix}${file}`, source: `${header_folder}/columna/${file}.webp`, x, y: y + bands[5][1], is_background: false })),
].map((part) => ({ ...part, section: section_of[part.name], joint: joints[part.name] }));

// Height of every section slot in the original proposal, from top to bottom.
export const original_section_heights = bands.map(([, top], index) => (bands[index + 1]?.[1] ?? sign_size.height) - top);
