// The sign is a stack of sections whose heights add up to the sign height; moving a border hands space from one
// section to its neighbour and fits the pieces of both into their new slots.
export const minimum_height = 60;

export function section_tops(heights) {
  let top = 0;
  return heights.map((height) => {
    const current = top;
    top += height;
    return current;
  });
}

// index is the section whose upper border moves (1..last). Mutates heights and layout.
export function move_border(sections, heights, layout, size_of, index, requested_top) {
  const tops = section_tops(heights);
  const lowest = tops[index - 1] + minimum_height;
  const highest = tops[index] + heights[index] - minimum_height;
  const new_top = Math.round(Math.min(Math.max(requested_top, lowest), highest));
  const old_slots = [index - 1, index].map((position) => ({ top: tops[position], height: heights[position] }));
  heights[index - 1] = new_top - tops[index - 1];
  heights[index] = old_slots[1].top + old_slots[1].height - new_top;
  fit_section(sections[index - 1], old_slots[0], { top: tops[index - 1], height: heights[index - 1] }, layout, size_of);
  fit_section(sections[index], old_slots[1], { top: new_top, height: heights[index] }, layout, size_of);
}

// The last section grows upward because the sign bottom is fixed; the others grow downward.
export function set_section_height(sections, heights, layout, size_of, index, requested_height) {
  const tops = section_tops(heights);
  const is_last = index === heights.length - 1;
  if (is_last) return move_border(sections, heights, layout, size_of, index, tops[index] + heights[index] - requested_height);
  return move_border(sections, heights, layout, size_of, index + 1, tops[index] + requested_height);
}

function fit_section(section, old_slot, new_slot, layout, size_of) {
  const ratio = new_slot.height / old_slot.height;
  for (const name of section.pieces) {
    if (name === section.background) fit_background(section, layout[name], size_of(name), new_slot);
    else layout[name].y = Math.round(new_slot.top + (layout[name].y - old_slot.top) * ratio);
  }
}

function fit_background(section, placement, size, new_slot) {
  const shown_height = size.height * placement.scale;
  if (section.stretch_background) {
    placement.y = new_slot.top;
    placement.stretch = new_slot.height / shown_height;
  } else {
    placement.y = Math.round(new_slot.top + (new_slot.height - shown_height * placement.stretch) / 2);
  }
}
