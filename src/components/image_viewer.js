import { copy_image_to_clipboard } from './copy_image.js?v=a5e454d95f';
import { image_viewer_styles } from './image_viewer.css.js?v=a5e454d95f';

const template = /* html */ `
  <div class="header"><span class="title"></span><span class="buttons"><button class="copy">Copiar foto</button><button class="close">Cerrar</button></span></div>
  <img alt="">
  <div class="status"></div>
`;

// Emits "viewer-close" when the user closes it.
export class ImageViewer extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [image_viewer_styles];
    root.innerHTML = template;
    this.hidden = true;
    root.querySelector('.close').addEventListener('click', () => {
      this.hide();
      this.dispatchEvent(new CustomEvent('viewer-close'));
    });
    root.querySelector('.copy').addEventListener('click', () => this.#copy_photo());
  }

  show({ title, image }) {
    this.shadowRoot.querySelector('.title').textContent = title;
    this.shadowRoot.querySelector('img').src = image;
    this.shadowRoot.querySelector('.status').textContent = '';
    this.hidden = false;
  }

  hide() {
    this.hidden = true;
  }

  async #copy_photo() {
    const status = this.shadowRoot.querySelector('.status');
    try {
      await copy_image_to_clipboard(this.shadowRoot.querySelector('img').src);
      status.textContent = 'Foto copiada. Pégala donde quieras.';
    } catch (copy_error) {
      status.textContent = `No se pudo copiar la foto: ${copy_error.message}`;
    }
  }
}

customElements.define('image-viewer', ImageViewer);
