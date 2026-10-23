import { photo_overlay_styles } from './photo_overlay.css.js';

const template = /* html */ `
  <img class="photo" alt="">
  <div class="controls">
    <div class="title"></div>
    <label>Foto <input class="opacity" type="range" min="0" max="100" value="50"><span class="opacity_value">50 %</span></label>
    <label>Lente <input class="fov" type="range" min="10" max="100" step="0.5"><span class="fov_value"></span></label>
    <div class="buttons">
      <button data-action="toggle">Ocultar foto</button>
      <button data-action="copy">Copiar cámara</button>
      <button data-action="close">Cerrar</button>
    </div>
    <div class="hint">Tecla F: ocultar o mostrar la foto. Gira, desplaza y acerca el modelo hasta que coincida.</div>
    <div class="status"></div>
  </div>
`;

// Shows a photo over the whole 3D view, the same size and place as the camera picture.
// Emits "overlay-fov" ({ fov }), "overlay-copy" and "overlay-close".
export class PhotoOverlay extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [photo_overlay_styles];
    root.innerHTML = template;
    this.hidden = true;
    this.#connect_controls(root);
  }

  // roll: degrees that turn the photo level, for photos taken with the phone tilted.
  show({ title, image, fov, roll }) {
    const root = this.shadowRoot;
    root.querySelector('.title').textContent = title;
    root.querySelector('.photo').src = image;
    root.querySelector('.photo').style.transform = `rotate(${roll}deg)`;
    root.querySelector('.fov').value = fov;
    root.querySelector('.fov_value').textContent = `${fov}°`;
    this.#set_concealed(false);
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
      root.querySelector('.photo').style.opacity = target.value / 100;
      root.querySelector('.opacity_value').textContent = `${target.value} %`;
    });
    root.querySelector('.fov').addEventListener('input', ({ target }) => {
      root.querySelector('.fov_value').textContent = `${target.value}°`;
      this.#emit('overlay-fov', { fov: Number(target.value) });
    });
    root.querySelector('[data-action="toggle"]').addEventListener('click', () => this.#toggle_photo());
    root.querySelector('[data-action="copy"]').addEventListener('click', () => this.#emit('overlay-copy'));
    root.querySelector('[data-action="close"]').addEventListener('click', () => this.#emit('overlay-close'));
    addEventListener('keydown', (event) => {
      if (!this.hidden && event.key.toLowerCase() === 'f' && !event.target.closest?.('input')) this.#toggle_photo();
    });
    root.querySelector('.photo').style.opacity = 0.5;
  }

  #toggle_photo() {
    this.#set_concealed(!this.shadowRoot.querySelector('.photo').classList.contains('concealed'));
  }

  #set_concealed(is_concealed) {
    this.shadowRoot.querySelector('.photo').classList.toggle('concealed', is_concealed);
    this.shadowRoot.querySelector('[data-action="toggle"]').textContent = is_concealed ? 'Mostrar foto' : 'Ocultar foto';
  }

  #emit(name, detail) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }
}

customElements.define('photo-overlay', PhotoOverlay);
