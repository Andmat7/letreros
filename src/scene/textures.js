import * as THREE from 'three';
import { building } from '../data/building_measurements.js';

const tile_pixels = 256;
const course_pixels = 16;
const brick_pixels = 48;
const courses_per_tile = tile_pixels / course_pixels;
const asphalt_tile_size = 4;

const brick_palettes = {
  dark: { brick: '#7a3328', mortar: '#5c2a22', course_height: building.brick_course_height },
  light: { brick: '#b5583f', mortar: '#8d4835', course_height: building.brick_course_height },
  paver: { brick: '#b0584a', mortar: '#8e4a3f', course_height: 0.1 },
};
const brick_canvases = new Map();

export function canvas_texture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  return finish_texture(new THREE.CanvasTexture(canvas));
}

// Repeats are derived from real sizes so every brick keeps its measured height.
export function brick_texture(palette_name, width, height) {
  const palette = brick_palettes[palette_name];
  const tile_size = courses_per_tile * palette.course_height;
  const texture = finish_texture(new THREE.CanvasTexture(brick_canvas(palette_name)));
  return repeat_over(texture, width / tile_size, height / tile_size);
}

export function asphalt_texture(width, height) {
  const texture = canvas_texture(tile_pixels, tile_pixels, draw_asphalt);
  return repeat_over(texture, width / asphalt_tile_size, height / asphalt_tile_size);
}

function brick_canvas(palette_name) {
  if (!brick_canvases.has(palette_name)) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = tile_pixels;
    draw_bricks(canvas.getContext('2d'), brick_palettes[palette_name]);
    brick_canvases.set(palette_name, canvas);
  }
  return brick_canvases.get(palette_name);
}

function draw_bricks(context, palette) {
  context.fillStyle = palette.mortar;
  context.fillRect(0, 0, tile_pixels, tile_pixels);
  for (let row = 0; row < courses_per_tile; row++) {
    const top = row * course_pixels;
    for (let left = (row % 2) * -brick_pixels / 2; left < tile_pixels; left += brick_pixels) {
      context.fillStyle = shade(palette.brick, (Math.random() - 0.5) * 22);
      context.fillRect(left + 2, top + 2, brick_pixels - 3, course_pixels - 3);
    }
  }
}

function draw_asphalt(context, width, height) {
  context.fillStyle = '#5b5e62';
  context.fillRect(0, 0, width, height);
  for (let speck = 0; speck < 4000; speck++) {
    context.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';
    context.fillRect(Math.random() * width, Math.random() * height, 2, 2);
  }
}

function shade(hex_color, offset) {
  const value = parseInt(hex_color.slice(1), 16);
  const channels = [value >> 16, (value >> 8) & 255, value & 255];
  return `rgb(${channels.map(channel => Math.max(0, Math.min(255, channel + offset))).join(',')})`;
}

function finish_texture(texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function repeat_over(texture, repeat_x, repeat_y) {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat_x, repeat_y);
  return texture;
}
