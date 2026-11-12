import { section_tops } from './section_space.js';

// A group of sections can have a frame: its color fills a padding around the group and the group's outer corners
// are rounded, so its sections read as one block. The frame lies over the sections and is drawn here at the group's
// current size, so it follows the group when its share of the sign changes.

export function frame_parts(groups, sign_width) {
  return groups.filter((group) => group.frame).map((group) => ({
    name: group.frame.name, source: '', x: 0, y: 0, is_background: true, frame: { ...group.frame, group, width: sign_width },
  }));
}

// Keeps each frame on its group: at the group's top, at its natural size.
export function place_frames(parts, heights, layout) {
  for (const part of parts.filter((candidate) => candidate.frame)) {
    Object.assign(layout[part.name], { x: 0, y: frame_box(part.frame, heights).top, scale: 1, stretch: 1, widen: 1 });
  }
}

export function frame_box(frame, heights) {
  const tops = section_tops(heights);
  const [first, last] = [frame.group.sections[0], frame.group.sections.at(-1)];
  return { top: tops[first], height: tops[last] + heights[last] - tops[first] };
}

// The frame as an image: the color everywhere except a rounded window inside the padding.
export function draw_frame(frame, height) {
  const canvas = document.createElement('canvas');
  Object.assign(canvas, { width: frame.width, height });
  const context = canvas.getContext('2d');
  context.fillStyle = frame.color;
  context.fillRect(0, 0, frame.width, height);
  context.globalCompositeOperation = 'destination-out';
  context.beginPath();
  context.roundRect(frame.padding, frame.padding, frame.width - 2 * frame.padding, height - 2 * frame.padding, frame.radius);
  context.fill();
  return canvas.toDataURL('image/png');
}
