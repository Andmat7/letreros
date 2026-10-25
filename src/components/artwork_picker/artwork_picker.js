import { artwork_picker_styles } from './artwork_picker.css.js';

const board_template = /* html */ `
  <div class="board_title"></div>
  <select data-field="key" aria-label="Diseño"></select>
  <select data-field="fit" aria-label="Ajuste"></select>
  <label><input type="checkbox" data-field="rotated"> Girar 90° (diseño horizontal en tablero vertical)</label>
`;

// Emits "artwork-change" ({ board_key, key, fit, rotated }) whenever one control of a board changes.
export class ArtworkPicker extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' }).adoptedStyleSheets = [artwork_picker_styles];
  }

  // boards: [{ key, title, artwork: { key, fit, rotated } }]; artworks and fits: [{ key, title }]
  set_options({ boards, artworks, fits }) {
    this.shadowRoot.replaceChildren(...boards.map(board => this.#create_board(board, artworks, fits)));
  }

  #create_board({ key, title, artwork }, artworks, fits) {
    const element = document.createElement('div');
    element.className = 'board';
    element.innerHTML = board_template;
    element.querySelector('.board_title').textContent = title;
    this.#fill_select(element.querySelector('[data-field="key"]'), artworks, artwork.key);
    this.#fill_select(element.querySelector('[data-field="fit"]'), fits, artwork.fit);
    element.querySelector('[data-field="rotated"]').checked = artwork.rotated;
    element.addEventListener('change', () => this.#emit_change(key, element));
    return element;
  }

  #fill_select(select, options, selected_key) {
    select.replaceChildren(...options.map(({ key, title }) => new Option(title, key, false, key === selected_key)));
  }

  #emit_change(board_key, element) {
    const field = name => element.querySelector(`[data-field="${name}"]`);
    const detail = { board_key, key: field('key').value, fit: field('fit').value, rotated: field('rotated').checked };
    this.dispatchEvent(new CustomEvent('artwork-change', { detail }));
  }
}

customElements.define('artwork-picker', ArtworkPicker);
