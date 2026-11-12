// Arrow pieces hang from the piece before them (the body from the tip, or from the turn) and always stay attached
// and centered on the tip. Only two things of an arrow's body can change: its thickness ("grosor", relative to the
// tip) and its length ("largo"). On a turning arrow the turn and the body share one thickness, kept on the turn.

// Same overlap as BODY_OVERLAP in tools/make_store_header_parts.py, so no seam shows between the pieces.
const overlap = 3;

export function align_joints(parts, layout, size_of) {
  for (const part of parts) {
    if (part.joint && has_size(size_of, part.name, part.joint.to)) align(parts, part, layout, size_of);
  }
}

// Dragging any piece of an arrow moves the whole arrow, which hangs from its tip.
export function joint_root(parts, name) {
  const part = parts.find((candidate) => candidate.name === name);
  return part?.joint ? joint_root(parts, part.joint.to) : name;
}

// The piece whose "grosor" sets this piece's thickness.
export function thickness_holder(part) {
  return part.joint.thickness_from ?? part.name;
}

// A body leaving to the side has a length; the turn under a tip only has a thickness.
export function has_length(part) {
  return part.joint.anchor !== 'below_center';
}

function align(parts, part, layout, size_of) {
  const { to, anchor, stem } = part.joint;
  const follower = layout[part.name];
  const thickness = layout[thickness_holder(part)].thickness;
  follower.scale = layout[joint_root(parts, part.name)].scale * thickness;
  follower.widen = has_length(part) ? follower.length / thickness : 1;
  const leader = box(layout[to], size_of(to));
  const own = box(follower, size_of(part.name));
  const gap = overlap * follower.scale;
  const positions = {
    right_middle: [leader.right - gap, leader.top + (leader.height - own.height) / 2],
    right_bottom: [leader.right - gap, leader.bottom - own.height],
    below_center: [leader.left + (leader.width - stem * follower.scale) / 2, leader.bottom - gap],
  };
  [follower.x, follower.y] = positions[anchor].map(Math.round);
}

function box(placement, size) {
  const width = size.width * placement.scale * placement.widen;
  const height = size.height * placement.scale * placement.stretch;
  return { left: placement.x, top: placement.y, width, height, right: placement.x + width, bottom: placement.y + height };
}

function has_size(size_of, ...names) {
  return names.every((name) => size_of(name).width > 0);
}
