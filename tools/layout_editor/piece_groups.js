import { joint_root } from './arrow_joints.js';

// Pieces chosen together move and scale as one. Arrow pieces follow their tip, so only tips and loose pieces are
// changed; a saved group is a shared name in each member's "group" field.

export function movable_names(parts, names) {
  return [...new Set([...names].map((name) => joint_root(parts, name)))];
}

// Every piece that belongs with the given ones: the saved group of each, and the whole arrow of each arrow piece.
export function with_companions(parts, layout, names) {
  const roots = new Set(movable_names(parts, names));
  const groups = new Set([...roots].map((name) => layout[name].group).filter(Boolean));
  return parts
    .filter((part) => groups.has(layout[joint_root(parts, part.name)].group) || roots.has(joint_root(parts, part.name)))
    .map((part) => part.name);
}

export function group_bounds(layout, names, size_of) {
  const boxes = names.filter((name) => is_shown(layout[name])).map((name) => box(layout[name], size_of(name)));
  if (!boxes.length) throw new Error('No visible piece is chosen');
  return {
    left: Math.min(...boxes.map(({ left }) => left)), top: Math.min(...boxes.map(({ top }) => top)),
    right: Math.max(...boxes.map(({ right }) => right)), bottom: Math.max(...boxes.map(({ bottom }) => bottom)),
  };
}

// Position and scale of each piece before a gesture, so every step starts from the same place and nothing drifts.
export function snapshot(layout, names) {
  return Object.fromEntries(names.map((name) => [name, { x: layout[name].x, y: layout[name].y, scale: layout[name].scale }]));
}

// Grows or shrinks the pieces of the snapshot by factor, keeping the anchor point where it is.
export function scale_group(layout, before, factor, anchor) {
  for (const [name, { x, y, scale }] of Object.entries(before)) {
    Object.assign(layout[name], {
      x: Math.round(anchor.x + (x - anchor.x) * factor),
      y: Math.round(anchor.y + (y - anchor.y) * factor),
      scale: Math.round(scale * factor * 1000) / 1000,
    });
  }
}

export function move_group(layout, before, distance) {
  for (const [name, { x, y }] of Object.entries(before)) {
    Object.assign(layout[name], { x: Math.round(x + distance.x), y: Math.round(y + distance.y) });
  }
}

// Saves the pieces as one group (on their tips, which carry the arrow), or frees them with an empty name.
export function set_group(parts, layout, names, group_name) {
  for (const name of movable_names(parts, names)) layout[name].group = group_name;
}

function box(placement, size) {
  const width = size.width * placement.scale * placement.widen;
  const height = size.height * placement.scale * placement.stretch;
  return { left: placement.x, top: placement.y, right: placement.x + width, bottom: placement.y + height };
}

function is_shown(placement) {
  return placement.visible && !placement.deleted;
}
