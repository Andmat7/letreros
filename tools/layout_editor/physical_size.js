import { sign_catalog } from '../../src/data/sign_catalog.js';
import { sign_size } from './parts_catalog.js';

// The sign is printed on the corner column board, so the board width gives the real size of every pixel.
const column_board = sign_catalog.find(({ key }) => key === 'columna_esquina');
const centimeters_per_pixel = (column_board.width * 100) / sign_size.width;

export function describe_size(height_in_pixels) {
  const width = sign_size.width * centimeters_per_pixel;
  const height = height_in_pixels * centimeters_per_pixel;
  return `${format_centimeters(width)} × ${format_centimeters(height)} cm`;
}

// The full layout is the column sign; the corner sign from Calle 12 is listed by its catalog title.
export function describe_signs() {
  const corner_sign = sign_catalog.find(({ key }) => key === 'esquina_calle_12');
  return [`Letrero completo: ${describe_size(sign_size.height)}`, corner_sign.title];
}

// Pixels of the editor canvas that cover a board, at the same scale as the layout.
export function board_pixels(board) {
  return { width: (board.width * 100) / centimeters_per_pixel, height: (board.height * 100) / centimeters_per_pixel };
}

function format_centimeters(value) {
  return value.toFixed(1).replace('.', ',');
}
