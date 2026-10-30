import { active_sign_key, active_storage_name, original_section_heights, parts_catalog, sections, sign_size } from './active_sign.js';

const storage_key = `layout_editor:${active_storage_name}`;
const heights_key = `${storage_key}:section_heights`;

export function original_layout() {
  return Object.fromEntries(parts_catalog.map((part, index) => [
    part.name, { x: part.x, y: part.y, scale: 1, stretch: 1, visible: true, deleted: false, order: index, note: '' },
  ]));
}

export function load_layout() {
  try {
    return merge_with_original(JSON.parse(localStorage.getItem(storage_key)));
  } catch (storage_error) {
    return original_layout();
  }
}

export function save_layout(layout) {
  write_storage(storage_key, layout);
}

export function load_section_heights() {
  try {
    return check_heights(JSON.parse(localStorage.getItem(heights_key)));
  } catch (storage_error) {
    return [...original_section_heights];
  }
}

export function save_section_heights(heights) {
  write_storage(heights_key, heights);
}

// Throws when the pasted text is not a layout, so the editor never loads half of one.
export function parse_layout(text) {
  const parsed = JSON.parse(text);
  const layout = parsed.layout ?? parsed;
  const unknown_names = Object.keys(layout).filter((name) => !(name in original_layout()));
  if (unknown_names.length) throw new Error(`Unknown pieces: ${unknown_names.join(', ')}`);
  const heights = parsed.section_heights ? check_heights(parsed.section_heights) : [...original_section_heights];
  return { layout: merge_with_original(layout), heights };
}

// The text a person pastes back into the conversation: a readable list and the exact JSON.
export function describe_layout(layout, heights) {
  const header = `Layout of ${active_sign_key} (canvas ${sign_size.width}x${sign_size.height} px, origin top-left, back to front):`;
  const section_lines = sections.map((section, index) => `- ${section.title}: height=${heights[index]}`);
  const piece_lines = ordered_names(layout).map((name) => describe_piece(name, layout[name]));
  const data = JSON.stringify({ section_heights: heights, layout }, null, 1);
  return `${header}\nSection heights (top to bottom):\n${section_lines.join('\n')}\nPieces:\n${piece_lines.join('\n')}\n\n${data}`;
}

export function ordered_names(layout) {
  return Object.keys(layout).sort((first, second) => layout[first].order - layout[second].order);
}

function describe_piece(name, placement) {
  const state = placement.deleted ? ' [deleted]' : placement.visible ? '' : ' [hidden]';
  const stretch = placement.stretch === 1 ? '' : ` stretch=${placement.stretch.toFixed(2)}`;
  const note = placement.note ? ` -> ${placement.note}` : '';
  return `- ${name}: x=${Math.round(placement.x)} y=${Math.round(placement.y)} scale=${placement.scale.toFixed(2)}${stretch}${state}${note}`;
}

function merge_with_original(saved) {
  const merged = original_layout();
  for (const name of Object.keys(merged)) Object.assign(merged[name], saved?.[name]);
  return merged;
}

function check_heights(heights) {
  const total = heights?.reduce((sum, height) => sum + height, 0);
  if (heights?.length !== sections.length || Math.abs(total - sign_size.height) > 1) throw new Error('Section heights do not fit the sign');
  return heights;
}

function write_storage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (storage_error) { console.warn('Not saved', storage_error); }
}
