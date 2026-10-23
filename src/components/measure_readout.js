import { measure_readout_styles } from './measure_readout.css.js';

const template = /* html */ `
  <div class="distance"></div>
  <div class="parts"></div>
  <div class="points"></div>
  <button class="copy">Copiar coordenadas</button>
`;

// Shows the current measuring tape points in meters and copies them as plain text.
export class MeasureReadout extends HTMLElement {
  #text = '';

  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [measure_readout_styles];
    root.innerHTML = template;
    root.querySelector('.copy').addEventListener('click', () => this.#copy());
    this.hidden = true;
  }

  // points: [] | [[x, y, z]] | [[x, y, z], [x, y, z]], in scene meters.
  show(points) {
    this.hidden = points.length === 0;
    this.#text = describe(points);
    const [distance_line, parts_line, ...point_lines] = this.#text.split('\n');
    this.shadowRoot.querySelector('.distance').textContent = distance_line;
    this.shadowRoot.querySelector('.parts').textContent = parts_line;
    this.shadowRoot.querySelector('.points').textContent = point_lines.join('\n');
  }

  async #copy() {
    const button = this.shadowRoot.querySelector('.copy');
    try {
      await navigator.clipboard.writeText(this.#text);
      button.textContent = 'Copiado ✓';
    } catch (clipboard_error) {
      button.textContent = 'No se pudo copiar';
    }
    setTimeout(() => { button.textContent = 'Copiar coordenadas'; }, 1500);
  }
}

function describe([start, end]) {
  if (!start) return '';
  if (!end) return ['Falta el punto final', '', point_line('Inicio', start)].join('\n');
  const horizontal = Math.hypot(end[0] - start[0], end[2] - start[2]);
  const height = Math.abs(end[1] - start[1]);
  const distance = Math.hypot(horizontal, height);
  return [`Medida: ${meters(distance)}`, `horizontal ${meters(horizontal)} · altura ${meters(height)}`,
    point_line('Inicio', start), point_line('Final', end)].join('\n');
}

function point_line(name, [x, y, z]) {
  return `${name}: x ${x.toFixed(2)}, y ${y.toFixed(2)}, z ${z.toFixed(2)}`;
}

function meters(value) {
  return `${value.toFixed(2).replace('.', ',')} m`;
}

customElements.define('measure-readout', MeasureReadout);
