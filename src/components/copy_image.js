// The clipboard only accepts PNG images, so any source (a JPEG data URL, for instance) is redrawn as PNG first.
export async function copy_image_to_clipboard(source) {
  const image = await load_image(source);
  const blob = await to_png_blob(image);
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}

function load_image(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The photo could not be loaded'));
    image.src = source;
  });
}

function to_png_blob(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  canvas.getContext('2d').drawImage(image, 0, 0);
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('The photo could not be converted')), 'image/png'));
}
