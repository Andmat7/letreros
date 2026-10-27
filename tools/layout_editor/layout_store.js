import { parts_catalog, sign_size } from './parts_catalog.js';

const storage_key = 'layout_editor:bancolombia_oscuro_1x4_6';

export function original_layout() {
  return Object.fromEntries(parts_catalog.map((part, index) => [
    part.name, { x: part.x, y: part.y, scale: 1, visible: true, order: index, note: '' },
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
  try { localStorage.setItem(storage_key, JSON.stringify(layout)); } catch (storage_error) { console.warn('Layout not saved', storage_error); }
}

// Throws when the pasted text is not a layout, so the editor never loads half of one.
export function parse_layout(text) {
  const parsed = JSON.parse(text);
  const layout = parsed.layout ?? parsed;
  const unknown_names = Object.keys(layout).filter((name) => !(name in original_layout()));
  if (unknown_names.length) throw new Error(`Unknown pieces: ${unknown_names.join(', ')}`);
  return merge_with_original(layout);
}

// The text a person pastes back into the conversation: a readable list and the exact JSON.
export function describe_layout(layout) {
  const lines = ordered_names(layout).map((name) => describe_piece(name, layout[name]));
  const header = `Layout of bancolombia_oscuro_1x4_6 (canvas ${sign_size.width}x${sign_size.height} px, origin top-left, back to front):`;
  return `${header}\n${lines.join('\n')}\n\n${JSON.stringify({ layout }, null, 1)}`;
}

export function ordered_names(layout) {
  return Object.keys(layout).sort((first, second) => layout[first].order - layout[second].order);
}

function describe_piece(name, placement) {
  const state = placement.visible ? '' : ' [hidden]';
  const note = placement.note ? ` -> ${placement.note}` : '';
  return `- ${name}: x=${Math.round(placement.x)} y=${Math.round(placement.y)} scale=${placement.scale.toFixed(2)}${state}${note}`;
}

function merge_with_original(saved) {
  const merged = original_layout();
  for (const name of Object.keys(merged)) Object.assign(merged[name], saved?.[name]);
  return merged;
}
