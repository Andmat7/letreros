import { zoom_control_styles } from './zoom_control.css.js';

const template = /* html */ `
  <button class="in" aria-label="Acercar" title="Acercar">+</button>
  <button class="out" aria-label="Alejar" title="Alejar">−</button>
`;

// Two buttons that ask the scene to move the camera closer or farther; they do not move it themselves.
export class ZoomControl extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [zoom_control_styles];
    root.innerHTML = template;
    root.querySelector('.in').addEventListener('click', () => this.#request('in'));
    root.querySelector('.out').addEventListener('click', () => this.#request('out'));
  }

  #request(direction) {
    this.dispatchEvent(new CustomEvent('zoom-step', { detail: { direction } }));
  }
}

customElements.define('zoom-control', ZoomControl);
