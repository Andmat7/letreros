// Every cut piece with the place it had in the original proposal (pixels of the 960 x 4382 sign).
const base_folder = '../../images/signs/partes/bancolombia_oscuro_1x4_6';

export const sign_size = { width: 960, height: 4382 };
export const original_image = '../../images/signs/propuestas/bancolombia_oscuro_1x4_6.webp';

// Pieces are listed from back to front; sign_top is the row where the sign starts in the original image.
const sign_top = 60;
const bands = [
  ['01_flecha_superior', 0],
  ['02_nequi', 370],
  ['03_bancolombia', 1957],
  ['04_servicios_publicos', 2818],
  ['05_davivienda', 3589],
  ['06_flecha_inferior', 4082],
];
const pieces = [
  ['textos', 'texto_recarga', 40, 553],
  ['textos', 'texto_corresponsal', 112, 2654],
  ['textos', 'texto_pago_servicios', 123, 3214],
  ['logos', 'logo_nequi', 60, 707],
  ['logos', 'logo_bancolombia', 85, 2464],
  ['logos', 'iconos_servicios', 325, 2923],
  ['logos', 'logo_davivienda', 49, 3685],
  ['logos', 'logo_daviplata', 190, 3976],
  ['fotos', 'facturas', 672, 2878],
  ['fotos', 'tarjeta_bancolombia', 235, 2040],
  ['fotos', 'celular_nequi', 150, 996],
  ['fotos', 'celular_davivienda', 605, 3520],
];

// Sections of the sign from top to bottom; each lists the pieces that belong to it.
export const sections = [
  { title: '1. flecha superior', pieces: ['01_flecha_superior'] },
  { title: '2. nequi', pieces: ['02_nequi', 'texto_recarga', 'logo_nequi', 'celular_nequi'] },
  { title: '3. bancolombia', pieces: ['03_bancolombia', 'tarjeta_bancolombia', 'logo_bancolombia', 'texto_corresponsal'] },
  { title: '4. servicios', pieces: ['iconos_servicios', 'facturas'] },
  { title: '5. servicios_publicos', pieces: ['04_servicios_publicos', 'texto_pago_servicios'] },
  { title: '6. davivienda', pieces: ['05_davivienda', 'logo_davivienda', 'logo_daviplata', 'celular_davivienda'] },
  { title: '7. flecha inferior', pieces: ['06_flecha_inferior'] },
];

const section_of = Object.fromEntries(sections.flatMap((section) => section.pieces.map((name) => [name, section.title])));

export const parts_catalog = [
  ...bands.map(([name, y]) => ({ name, source: `${base_folder}/fondos/${name}.webp`, x: 0, y, is_background: true })),
  ...pieces.map(([folder, name, x, y]) => ({ name, source: `${base_folder}/${folder}/${name}.webp`, x, y: y - sign_top, is_background: false })),
].map((part) => ({ ...part, section: section_of[part.name] }));
