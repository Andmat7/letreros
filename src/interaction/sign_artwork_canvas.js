import { photo_bundle } from '../generated/photo_bundle.js';

const pixels_per_meter = 1000;
const scale_for_fit = { contain: Math.min, cover: Math.max };
const image_cache = new Map();

export function create_board_canvas([width, height]) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * pixels_per_meter);
  canvas.height = Math.round(height * pixels_per_meter);
  return canvas;
}

export function load_artwork_image(key) {
  if (!image_cache.has(key)) image_cache.set(key, decode_image(key));
  return image_cache.get(key);
}

// The image keeps its own ratio; a quarter turn lets a wide design read along a tall board.
export function paint_board(canvas, image, { fit, rotated }) {
  const context = canvas.getContext('2d');
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  if (!image) return;
  const [turned_width, turned_height] = rotated ? [image.height, image.width] : [image.width, image.height];
  const scale = scale_for_fit[fit](canvas.width / turned_width, canvas.height / turned_height);
  context.translate(canvas.width / 2, canvas.height / 2);
  if (rotated) context.rotate(Math.PI / 2);
  context.drawImage(image, -image.width * scale / 2, -image.height * scale / 2, image.width * scale, image.height * scale);
  context.setTransform(1, 0, 0, 1, 0, 0);
}

function decode_image(key) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Artwork "${key}" did not load`));
    image.src = photo_bundle[key].source;
  });
}
