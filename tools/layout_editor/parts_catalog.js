import { sign_catalog } from '../../src/data/sign_catalog.js';

// Every cut piece with the place it has in the proposal (pixels of the sign, 960 px wide).
const bancolombia_folder = '../../images/signs/partes/bancolombia_nueva_1x4_6';
const daviplata_folder = '../../images/signs/partes/daviplata_nueva_1x0_5';
const arrow_folder = '../../images/signs/partes/flecha_esika_vuelta';

// The printed board is 0.30 × 1.40 m, so the sign keeps that proportion; the extra height goes to the bottom band.
const column_board = sign_catalog.find(({ key }) => key === 'columna_esquina');
const sign_width = 960;
export const sign_size = { width: sign_width, height: Math.round((sign_width * column_board.height) / column_board.width) };
export const original_image = '../../images/signs/propuestas/bancolombia_nueva_1x4_6.webp';

// Positions are pixels of the sign, the same boxes the cut scripts in tools/ use. Pieces are listed from back to front.
// The Davivienda band and its pieces come from the Daviplata art, which is as tall as that band.
const bands = [
  ['01_flecha_superior', 0, bancolombia_folder],
  ['02_nequi', 370, bancolombia_folder],
  ['03_bancolombia', 1610, bancolombia_folder],
  ['04_servicios', 2419, bancolombia_folder],
  ['05_davivienda', 3587, daviplata_folder],
  ['06_flecha_inferior', 4110, bancolombia_folder],
];
const pieces = [
  ['logos', 'destellos_izquierda', 145, 875],
  ['logos', 'destellos_derecha', 625, 925],
  ['textos', 'texto_recarga', 50, 430],
  ['textos', 'texto_corresponsal', 100, 2215],
  ['textos', 'texto_pago_servicios', 60, 2465],
  ['logos', 'logo_nequi', 125, 560],
  ['logos', 'logo_bancolombia', 50, 2005],
  ['fotos', 'facturas', 14, 2705],
  ['fotos', 'tarjeta_bancolombia', 240, 1625],
  ['fotos', 'celular_nequi', 150, 795],
];
const davivienda_pieces = [
  ['logos', 'logo_davivienda', 125, 3627],
  ['logos', 'logo_daviplata', 100, 3852],
  ['fotos', 'celular_davivienda', 655, 3587],
];
// The arrow art, cut by tools/cut_esika_arrow_parts.py. The same pieces appear in the top and the bottom arrow.
const arrow_pieces = [
  ['flecha', 40, 18],
  ['a_la_vuelta', 427, 44],
  ['linea_roja', 427, 117],
  ['en_la_tienda', 427, 138],
  ['logo_esika', 427, 213],
];
const top_arrow_names = arrow_pieces.map(([file]) => `sup_${file}`);
const bottom_arrow_names = arrow_pieces.map(([file]) => `inf_${file}`);

// Sections from top to bottom. Each owns one background band that defines its slot of the sign; the flecha bands
// carry artwork, so they keep their proportions and are centered in their slot instead of being stretched.
export const sections = [
  { title: '1. flecha superior', background: '01_flecha_superior', stretch_background: false, pieces: ['01_flecha_superior', ...top_arrow_names] },
  { title: '2. nequi', background: '02_nequi', stretch_background: true, pieces: ['02_nequi', 'texto_recarga', 'logo_nequi', 'destellos_izquierda', 'destellos_derecha', 'celular_nequi'] },
  { title: '3. bancolombia', background: '03_bancolombia', stretch_background: true, pieces: ['03_bancolombia', 'tarjeta_bancolombia', 'logo_bancolombia', 'texto_corresponsal'] },
  { title: '4. servicios', background: '04_servicios', stretch_background: true, pieces: ['04_servicios', 'facturas', 'texto_pago_servicios'] },
  { title: '5. davivienda', background: '05_davivienda', stretch_background: true, pieces: ['05_davivienda', 'logo_davivienda', 'logo_daviplata', 'celular_davivienda'] },
  { title: '6. flecha inferior', background: '06_flecha_inferior', stretch_background: false, pieces: ['06_flecha_inferior', ...bottom_arrow_names] },
];

const section_of = Object.fromEntries(sections.flatMap((section) => section.pieces.map((name) => [name, section.title])));

export const parts_catalog = [
  ...bands.map(([name, y, folder]) => ({ name, source: `${folder}/fondos/${name}.webp`, x: 0, y, is_background: true })),
  ...pieces.map(([folder, name, x, y]) => ({ name, source: `${bancolombia_folder}/${folder}/${name}.webp`, x, y, is_background: false })),
  ...davivienda_pieces.map(([folder, name, x, y]) => ({ name, source: `${daviplata_folder}/${folder}/${name}.webp`, x, y, is_background: false })),
  ...arrow_pieces.map(([file, x, y]) => ({ name: `sup_${file}`, source: `${arrow_folder}/${file}.webp`, x, y, is_background: false })),
  ...arrow_pieces.map(([file, x, y]) => ({ name: `inf_${file}`, source: `${arrow_folder}/${file}.webp`, x, y: y + bands[5][1], is_background: false })),
].map((part) => ({ ...part, section: section_of[part.name] }));

// Height of every section slot in the original proposal, from top to bottom.
export const original_section_heights = bands.map(([, top], index) => (bands[index + 1]?.[1] ?? sign_size.height) - top);
