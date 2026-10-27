// Draws the visible pieces of one section, back to front, into a PNG cropped to the area they cover.
export function render_section_blob(parts, layout, images) {
  const placed = parts.filter((part) => layout[part.name].visible).sort((first, second) => layout[first.name].order - layout[second.name].order);
  if (!placed.length) throw new Error('The section has no visible pieces');
  const rectangles = placed.map((part) => rectangle_of(layout[part.name], images.get(part.name)));
  const bounds = union_of(rectangles);
  const canvas = new OffscreenCanvas(Math.ceil(bounds.right - bounds.left), Math.ceil(bounds.bottom - bounds.top));
  const context = canvas.getContext('2d');
  placed.forEach((part, index) => {
    const { left, top, width, height } = rectangles[index];
    context.drawImage(images.get(part.name), left - bounds.left, top - bounds.top, width, height);
  });
  return canvas.convertToBlob({ type: 'image/png' });
}

function rectangle_of(placement, image) {
  const width = image.naturalWidth * placement.scale;
  const height = image.naturalHeight * placement.scale * placement.stretch;
  return { left: placement.x, top: placement.y, width, height, right: placement.x + width, bottom: placement.y + height };
}

function union_of(rectangles) {
  return {
    left: Math.min(...rectangles.map((rectangle) => rectangle.left)),
    top: Math.min(...rectangles.map((rectangle) => rectangle.top)),
    right: Math.max(...rectangles.map((rectangle) => rectangle.right)),
    bottom: Math.max(...rectangles.map((rectangle) => rectangle.bottom)),
  };
}
