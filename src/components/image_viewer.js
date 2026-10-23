import { image_viewer_styles } from './image_viewer.css.js';

const template = /* html */ `
  <div class="header"><span class="title"></span><button>Cerrar</button></div>
  <img alt="">
`;

// Emits "viewer-close" when the user closes it.
export class ImageViewer extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [image_viewer_styles];
    root.innerHTML = template;
    this.hidden = true;
    root.querySelector('button').addEventListener('click', () => {
      this.hide();
      this.dispatchEvent(new CustomEvent('viewer-close'));
    });
  }

  show({ title, image }) {
    this.shadowRoot.querySelector('.title').textContent = title;
    this.shadowRoot.querySelector('img').src = image;
    this.hidden = false;
  }

  hide() {
    this.hidden = true;
  }
}

customElements.define('image-viewer', ImageViewer);
