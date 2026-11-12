import { fit_background, section_tops } from './section_space.js';

// Some signs join their sections into groups (Corresponsal and Fotocopiadora on the Calle 12 sign). Changing the
// share of the first group resizes every section of both groups in proportion; the sections outside them keep
// their height. Pieces grow as much as the sign width lets them and spread over their section's new height.
const side_margin = 0.04;

export function group_share(groups, heights) {
  const [first, second] = groups.map((group) => group_height(group, heights));
  return first / (first + second);
}

// share is the fraction of the grouped height that goes to the first group. Mutates heights and layout.
export function set_group_share(groups, sign, layout, share) {
  const { sections, heights, size_of } = sign;
  const old_tops = section_tops(heights);
  const old_heights = [...heights];
  const total = groups.reduce((sum, group) => sum + group_height(group, heights), 0);
  resize_group(groups[0], heights, Math.round(total * share));
  resize_group(groups[1], heights, total - group_height(groups[0], heights));
  const new_tops = section_tops(heights);
  for (const index of groups.flatMap((group) => group.sections)) {
    const old_slot = { top: old_tops[index], height: old_heights[index] };
    const new_slot = { top: new_tops[index], height: heights[index] };
    fit_section_scaled(sections[index], { old_slot, new_slot, sign_width: sign.width }, layout, size_of);
  }
}

function group_height(group, heights) {
  return group.sections.reduce((sum, index) => sum + heights[index], 0);
}

// The last section of the group takes the rounding, so the group is exactly the requested height.
function resize_group(group, heights, target) {
  const ratio = target / group_height(group, heights);
  const [last, ...others] = [...group.sections].reverse();
  for (const index of others) heights[index] = Math.round(heights[index] * ratio);
  heights[last] = target - others.reduce((sum, index) => sum + heights[index], 0);
}

function fit_section_scaled(section, slots, layout, size_of) {
  const { old_slot, new_slot, sign_width } = slots;
  const names = section.pieces.filter((name) => name !== section.background);
  const ratio = new_slot.height / old_slot.height;
  const bounds = horizontal_bounds(names, layout, size_of);
  const fitting = (sign_width * (1 - 2 * side_margin)) / (bounds.right - bounds.left);
  const factor = ratio < 1 ? ratio : Math.max(1, Math.min(ratio, fitting));
  const center_x = (bounds.left + bounds.right) / 2;
  for (const name of names) place_piece(layout[name], size_of(name), { old_slot, new_slot, ratio, factor, center_x });
  fit_background(section, layout[section.background], size_of(section.background), new_slot);
}

// Each piece keeps its center where it was, relative to the section: across the width around the pieces' middle,
// down the height relative to the section top.
function place_piece(placement, size, fit) {
  const { old_slot, new_slot, ratio, factor, center_x } = fit;
  const old_width = size.width * placement.scale * placement.widen;
  const old_height = size.height * placement.scale * placement.stretch;
  const piece_center_x = center_x + (placement.x + old_width / 2 - center_x) * factor;
  const piece_center_y = new_slot.top + (placement.y + old_height / 2 - old_slot.top) * ratio;
  placement.scale = Math.round(placement.scale * factor * 1000) / 1000;
  placement.x = Math.round(piece_center_x - (old_width * factor) / 2);
  placement.y = Math.round(piece_center_y - (old_height * factor) / 2);
}

function horizontal_bounds(names, layout, size_of) {
  const boxes = names.map((name) => {
    const placement = layout[name];
    return { left: placement.x, right: placement.x + size_of(name).width * placement.scale * placement.widen };
  });
  return { left: Math.min(...boxes.map(({ left }) => left)), right: Math.max(...boxes.map(({ right }) => right)) };
}
