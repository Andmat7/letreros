// Arrow pieces hang from the piece before them (the body from the tip, or from the turn): a joined piece takes the
// scale of the piece it hangs from and stays centered on it. It can still slide along its own direction (its offset)
// and its "ancho" is its own, so the body can be moved and made longer or shorter without leaving the center line.

// Same overlap as BODY_OVERLAP in tools/make_store_header_parts.py, so no seam shows between the pieces.
const overlap = 3;

export function align_joints(parts, layout, size_of) {
  for (const part of parts) {
    if (part.joint && has_size(size_of, part.name, part.joint.to)) align(part, layout, size_of);
  }
}

// The direction a joined piece may slide in: along a body leaving to the right, or down from the tip for the turn.
export function sliding_axis(part) {
  return part.joint.anchor === 'below_center' ? 'y' : 'x';
}

function align(part, layout, size_of) {
  const { to, anchor, stem } = part.joint;
  const follower = layout[part.name];
  follower.scale = layout[to].scale;
  const leader = box(layout[to], size_of(to));
  const own = box(follower, size_of(part.name));
  const gap = overlap * follower.scale;
  const positions = {
    right_middle: [leader.right - gap, leader.top + (leader.height - own.height) / 2],
    right_bottom: [leader.right - gap, leader.bottom - own.height],
    below_center: [leader.left + (leader.width - stem * follower.scale) / 2, leader.bottom - gap],
  };
  const [x, y] = positions[anchor];
  const slide = follower.offset * follower.scale;
  [follower.x, follower.y] = (sliding_axis(part) === 'x' ? [x + slide, y] : [x, y + slide]).map(Math.round);
}

function box(placement, size) {
  const width = size.width * placement.scale * placement.widen;
  const height = size.height * placement.scale * placement.stretch;
  return { left: placement.x, top: placement.y, width, height, right: placement.x + width, bottom: placement.y + height };
}

function has_size(size_of, ...names) {
  return names.every((name) => size_of(name).width > 0);
}
