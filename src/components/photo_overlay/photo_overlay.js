import { photo_overlay_styles } from './photo_overlay.css.js';

const svg_namespace = 'http://www.w3.org/2000/svg';
const template = /* html */ `
  <div class="layer">
    <img class="photo" alt="">
    <svg class="edges" preserveAspectRatio="xMidYMid meet"></svg>
  </div>
  <div class="controls">
    <div class="title"></div>
    <label>Foto <input class="opacity" type="range" min="0" max="100" value="50"><span class="opacity_value">50 %</span></label>
    <label>Lente <input class="fov" type="range" min="10" max="100" step="0.5"><span class="fov_value"></span></label>
    <div class="buttons">
      <button data-action="toggle">Ocultar foto</button>
      <button data-action="edges">Ver bordes</button>
      <button data-action="copy">Copiar cámara</button>
      <button data-action="close">Cerrar</button>
    </div>
    <div class="hint">Tecla F: ocultar o mostrar. Tecla B: foto o bordes (verde: foto, magenta: modelo).
      Gira, desplaza y acerca el modelo hasta que coincida.</div>
    <div class="status"></div>
  </div>
`;

// Shows a photo, or the straight edges found in it, over the whole 3D view, the same size and
// place as the camera picture. Emits "overlay-fov" ({ fov }), "overlay-edges" ({ is_on }),
// "overlay-copy" and "overlay-close".
export class PhotoOverlay extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [photo_overlay_styles];
    root.innerHTML = template;
    this.hidden = true;
    this.#connect_controls(root);
    this.#connect_keys();
  }

  // edges: { width, height, segments: [[x1, y1, x2, y2]] } in photo pixels.
  show({ title, image, fov, edges }) {
    const root = this.shadowRoot;
    root.querySelector('.title').textContent = title;
    root.querySelector('.photo').src = image;
    root.querySelector('.fov').value = fov;
    root.querySelector('.fov_value').textContent = `${fov}°`;
    draw_segments(root.querySelector('.edges'), edges);
    this.#set_concealed(false);
    this.#set_edges(false);
    this.set_status('');
    this.hidden = false;
  }

  hide() {
    this.hidden = true;
  }

  set_status(text) {
    this.shadowRoot.querySelector('.status').textContent = text;
  }

  #connect_controls(root) {
    root.querySelector('.opacity').addEventListener('input', ({ target }) => {
      root.querySelector('.layer').style.opacity = target.value / 100;
      root.querySelector('.opacity_value').textContent = `${target.value} %`;
    });
    root.querySelector('.fov').addEventListener('input', ({ target }) => {
      root.querySelector('.fov_value').textContent = `${target.value}°`;
      this.#emit('overlay-fov', { fov: Number(target.value) });
    });
    root.querySelector('[data-action="toggle"]').addEventListener('click', () => this.#toggle_concealed());
    root.querySelector('[data-action="edges"]').addEventListener('click', () => this.#toggle_edges());
    root.querySelector('[data-action="copy"]').addEventListener('click', () => this.#emit('overlay-copy'));
    root.querySelector('[data-action="close"]').addEventListener('click', () => this.#emit('overlay-close'));
    root.querySelector('.layer').style.opacity = 0.5;
  }

  #connect_keys() {
    addEventListener('keydown', (event) => {
      if (this.hidden || event.target.closest?.('input')) return;
      if (event.key.toLowerCase() === 'f') this.#toggle_concealed();
      if (event.key.toLowerCase() === 'b') this.#toggle_edges();
    });
  }

  #toggle_concealed() {
    this.#set_concealed(!this.shadowRoot.querySelector('.layer').classList.contains('concealed'));
  }

  #toggle_edges() {
    const is_on = !this.shadowRoot.querySelector('.layer').classList.contains('showing_edges');
    this.#set_edges(is_on);
    this.#emit('overlay-edges', { is_on });
  }

  #set_concealed(is_concealed) {
    this.shadowRoot.querySelector('.layer').classList.toggle('concealed', is_concealed);
    this.shadowRoot.querySelector('[data-action="toggle"]').textContent = is_concealed ? 'Mostrar' : 'Ocultar';
  }

  #set_edges(is_on) {
    this.shadowRoot.querySelector('.layer').classList.toggle('showing_edges', is_on);
    this.shadowRoot.querySelector('[data-action="edges"]').textContent = is_on ? 'Ver foto' : 'Ver bordes';
  }

  #emit(name, detail) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }
}

// The viewBox uses photo pixels, so the lines land on the photo wherever it is drawn.
function draw_segments(svg, { width, height, segments }) {
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.replaceChildren(...segments.map(([x1, y1, x2, y2]) => {
    const line = document.createElementNS(svg_namespace, 'line');
    Object.entries({ x1, y1, x2, y2 }).forEach(([name, value]) => line.setAttribute(name, value));
    return line;
  }));
}

customElements.define('photo-overlay', PhotoOverlay);
