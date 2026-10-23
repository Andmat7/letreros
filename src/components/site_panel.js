import { site_panel_styles } from './site_panel.css.js';

const template = /* html */ `
  <button class="toggle" aria-label="Mostrar u ocultar el panel">☰</button>
  <h1>Carrera 7 con Calle 12</h1>
  <p class="subtitle">Modelo 3D aproximado de la esquina de La Riviera</p>
  <div class="body">
    <h2>Fotos del lugar</h2>
    <div class="list" data-list="photo"></div>
    <h2>Letreros</h2>
    <div class="list" data-list="sign"></div>
    <div class="commands">
      <button class="command" data-command="home">Vista general</button>
      <button class="command" data-command="top">Desde arriba</button>
      <button class="command" data-command="reset">Reiniciar letreros</button>
      <button class="command" data-command="measure">📏 Medir</button>
    </div>
    <p class="hint">Arrastra para girar · rueda o pellizco para acercar · clic derecho para desplazar.<br>
      Arrastra un letrero sobre la pared para moverlo. La figura azul mide 1,70 m.<br>
      Medir: activa 📏 y haz clic en dos puntos del modelo; arrastra los puntos azules para ajustarlos.<br>
      Un clic fuera de los puntos empieza otra medida. «Copiar coordenadas» copia el resultado.</p>
  </div>
`;

// Emits "panel-select" ({ kind, key }) and "panel-command" ({ command }).
export class SitePanel extends HTMLElement {
  connectedCallback() {
    const root = this.attachShadow({ mode: 'open' });
    root.adoptedStyleSheets = [site_panel_styles];
    root.innerHTML = template;
    root.querySelector('.toggle').addEventListener('click', () => this.classList.toggle('collapsed'));
    root.querySelectorAll('[data-command]').forEach(button =>
      button.addEventListener('click', () => this.#emit('panel-command', { command: button.dataset.command })));
  }

  // items: [{ kind: 'photo' | 'sign', key, title, subtitle, image }]
  set_items(items) {
    items.forEach(item => this.shadowRoot.querySelector(`[data-list="${item.kind}"]`).append(this.#create_item(item)));
  }

  set_active(key) {
    this.shadowRoot.querySelectorAll('.item').forEach(element => element.classList.toggle('active', element.dataset.key === key));
  }

  set_pressed(command, is_pressed) {
    this.shadowRoot.querySelector(`[data-command="${command}"]`).classList.toggle('pressed', is_pressed);
  }

  #create_item({ kind, key, title, subtitle, image }) {
    const button = document.createElement('button');
    button.className = 'item';
    button.dataset.key = key;
    button.innerHTML = /* html */ `<img alt=""><span><span class="title"></span><small></small></span>`;
    button.querySelector('img').src = image;
    button.querySelector('.title').textContent = title;
    button.querySelector('small').textContent = subtitle;
    button.addEventListener('click', () => this.#emit('panel-select', { kind, key }));
    return button;
  }

  #emit(name, detail) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }
}

customElements.define('site-panel', SitePanel);
