// Every cut piece with the place it had in the original proposal (pixels of the 960 x 4382 sign).
const base_folder = '../../images/signs/partes/bancolombia_oscuro_1x4_6';

export const sign_size = { width: 960, height: 4382 };
export const original_image = '../../images/signs/propuestas/bancolombia_oscuro_1x4_6.webp';

// Positions are pixels of the sign. Pieces are listed from back to front. The Nequi band follows its new art's
// proportion (1241 px tall) and the Bancolombia band takes the rest, so its pieces are spread over the taller band.
const bands = [
  ['01_flecha_superior', 0],
  ['02_nequi', 370],
  ['03_bancolombia', 1611],
  ['04_servicios', 2818],
  ['05_servicios_publicos', 3153],
  ['06_davivienda', 3589],
  ['07_flecha_inferior', 4082],
];
const pieces = [
  ['logos', 'destellos_izquierda', 145, 875],
  ['logos', 'destellos_derecha', 625, 925],
  ['textos', 'texto_recarga', 50, 430],
  ['textos', 'texto_corresponsal', 112, 2504],
  ['textos', 'texto_pago_servicios', 123, 3154],
  ['logos', 'logo_nequi', 125, 560],
  ['logos', 'logo_bancolombia', 85, 2238],
  ['logos', 'iconos_servicios', 325, 2863],
  ['logos', 'logo_davivienda', 49, 3625],
  ['logos', 'logo_daviplata', 190, 3916],
  ['fotos', 'facturas', 672, 2818],
  ['fotos', 'tarjeta_bancolombia', 235, 1643],
  ['fotos', 'celular_nequi', 150, 795],
  ['fotos', 'celular_davivienda', 605, 3460],
];

// Sections from top to bottom. Each owns one background band that defines its slot of the sign; the flecha bands
// carry artwork, so they keep their proportions and are centered in their slot instead of being stretched.
export const sections = [
  { title: '1. flecha superior', background: '01_flecha_superior', stretch_background: false, pieces: ['01_flecha_superior'] },
  { title: '2. nequi', background: '02_nequi', stretch_background: true, pieces: ['02_nequi', 'texto_recarga', 'logo_nequi', 'destellos_izquierda', 'destellos_derecha', 'celular_nequi'] },
  { title: '3. bancolombia', background: '03_bancolombia', stretch_background: true, pieces: ['03_bancolombia', 'tarjeta_bancolombia', 'logo_bancolombia', 'texto_corresponsal'] },
  { title: '4. servicios', background: '04_servicios', stretch_background: true, pieces: ['04_servicios', 'iconos_servicios', 'facturas'] },
  { title: '5. servicios_publicos', background: '05_servicios_publicos', stretch_background: true, pieces: ['05_servicios_publicos', 'texto_pago_servicios'] },
  { title: '6. davivienda', background: '06_davivienda', stretch_background: true, pieces: ['06_davivienda', 'logo_davivienda', 'logo_daviplata', 'celular_davivienda'] },
  { title: '7. flecha inferior', background: '07_flecha_inferior', stretch_background: false, pieces: ['07_flecha_inferior'] },
];

const section_of = Object.fromEntries(sections.flatMap((section) => section.pieces.map((name) => [name, section.title])));

export const parts_catalog = [
  ...bands.map(([name, y]) => ({ name, source: `${base_folder}/fondos/${name}.webp`, x: 0, y, is_background: true })),
  ...pieces.map(([folder, name, x, y]) => ({ name, source: `${base_folder}/${folder}/${name}.webp`, x, y, is_background: false })),
].map((part) => ({ ...part, section: section_of[part.name] }));

// Height of every section slot in the original proposal, from top to bottom.
export const original_section_heights = bands.map(([, top], index) => (bands[index + 1]?.[1] ?? sign_size.height) - top);
