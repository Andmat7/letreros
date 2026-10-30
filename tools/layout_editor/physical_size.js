import { sign_catalog } from '../../src/data/sign_catalog.js';
import { active_sign_key, sign_size } from './active_sign.js';
import { sign_size as column_sign_size } from './parts_catalog.js';

// The column board is the reference: its width gives the real size of every pixel, and the corner sign uses the same scale.
const column_board = sign_catalog.find(({ key }) => key === 'columna_esquina');
const centimeters_per_pixel = (column_board.width * 100) / column_sign_size.width;

export function describe_size(height_in_pixels) {
  const width = sign_size.width * centimeters_per_pixel;
  const height = height_in_pixels * centimeters_per_pixel;
  return `${format_centimeters(width)} × ${format_centimeters(height)} cm`;
}

// The full sign of the open page, and the board it is printed on.
export function describe_signs() {
  const board = sign_catalog.find(({ key }) => key === active_sign_key);
  return [`Letrero completo: ${describe_size(sign_size.height)}`, board.title];
}

function format_centimeters(value) {
  return value.toFixed(1).replace('.', ',');
}
