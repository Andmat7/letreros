// Every cut piece with the place it has in the proposal (pixels of the 960 x 4379 sign).
const bancolombia_folder = '../../images/signs/partes/bancolombia_nueva_1x4_6';
const daviplata_folder = '../../images/signs/partes/daviplata_nueva_1x0_5';

export const sign_size = { width: 960, height: 4379 };
export const original_image = '../../images/signs/propuestas/bancolombia_nueva_1x4_6.webp';

// Positions are pixels of the sign, the same boxes the cut scripts in tools/ use. Pieces are listed from back to front.
// The Davivienda band and its pieces come from the Daviplata art, which is as tall as that band.
const bands = [
  ['01_flecha_superior', 0, bancolombia_folder],
  ['02_nequi', 370, bancolombia_folder],
  ['03_bancolombia', 1610, bancolombia_folder],
  ['04_servicios', 2419, bancolombia_folder],
  ['05_davivienda', 3587, daviplata_folder],
  ['06_flecha_inferior', 4080, bancolombia_folder],
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

// Sections from top to bottom. Each owns one background band that defines its slot of the sign; the flecha bands
// carry artwork, so they keep their proportions and are centered in their slot instead of being stretched.
export const sections = [
  { title: '1. flecha superior', background: '01_flecha_superior', stretch_background: false, pieces: ['01_flecha_superior'] },
  { title: '2. nequi', background: '02_nequi', stretch_background: true, pieces: ['02_nequi', 'texto_recarga', 'logo_nequi', 'destellos_izquierda', 'destellos_derecha', 'celular_nequi'] },
  { title: '3. bancolombia', background: '03_bancolombia', stretch_background: true, pieces: ['03_bancolombia', 'tarjeta_bancolombia', 'logo_bancolombia', 'texto_corresponsal'] },
  { title: '4. servicios', background: '04_servicios', stretch_background: true, pieces: ['04_servicios', 'facturas', 'texto_pago_servicios'] },
  { title: '5. davivienda', background: '05_davivienda', stretch_background: true, pieces: ['05_davivienda', 'logo_davivienda', 'logo_daviplata', 'celular_davivienda'] },
  { title: '6. flecha inferior', background: '06_flecha_inferior', stretch_background: false, pieces: ['06_flecha_inferior'] },
];

const section_of = Object.fromEntries(sections.flatMap((section) => section.pieces.map((name) => [name, section.title])));

export const parts_catalog = [
  ...bands.map(([name, y, folder]) => ({ name, source: `${folder}/fondos/${name}.webp`, x: 0, y, is_background: true })),
  ...pieces.map(([folder, name, x, y]) => ({ name, source: `${bancolombia_folder}/${folder}/${name}.webp`, x, y, is_background: false })),
  ...davivienda_pieces.map(([folder, name, x, y]) => ({ name, source: `${daviplata_folder}/${folder}/${name}.webp`, x, y, is_background: false })),
].map((part) => ({ ...part, section: section_of[part.name] }));

// Height of every section slot in the original proposal, from top to bottom.
export const original_section_heights = bands.map(([, top], index) => (bands[index + 1]?.[1] ?? sign_size.height) - top);
