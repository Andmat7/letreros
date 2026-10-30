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

export function describe_board() {
  return `tablero ${column_board.width * 100} × ${column_board.height * 100} cm`;
}

function format_centimeters(value) {
  return value.toFixed(1).replace('.', ',');
}
