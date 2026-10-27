import { layout_editor_styles } from './layout_editor.css.js';
import { parts_catalog, sign_size, original_image } from './parts_catalog.js';
import { load_layout, save_layout, original_layout, parse_layout, describe_layout, ordered_names } from './layout_store.js';

const template = /* html */ `
  <div class="viewport"><div class="sizer"><div class="stage"></div></div></div>
  <aside class="panel">
    <div class="row">
      <label>Zoom <input class="zoom" type="range" min="0.1" max="1.5" step="0.05"></label>
      <label><input class="show_reference" type="checkbox"> Original encima</label>
      <label><input class="move_backgrounds" type="checkbox"> Mover fondos</label>
    </div>
    <ul class="list"></ul>
    <div class="selected_controls">
      <strong class="selected_name">Ninguna pieza elegida</strong>
      <div class="fields">
        <label>x<input class="field_x" type="number"></label>
        <label>y<input class="field_y" type="number"></label>
        <label>escala<input class="field_scale" type="number" step="0.05" min="0.1"></label>
      </div>
      <div class="row"><button class="to_front">Al frente</button><button class="to_back">Al fondo</button></div>
      <textarea class="note" placeholder="Instrucción para esta pieza (ej. más grande, tapar la parte baja…)"></textarea>
    </div>
    <div class="row"><button class="copy primary">Copiar instrucciones</button><button class="reset">Restaurar original</button></div>
    <textarea class="import" placeholder="Pega aquí un layout para cargarlo"></textarea>
    <button class="load">Cargar layout pegado</button>
    <div class="message"></div>
  </aside>
`;

// Drag the cut pieces of the sign into place, write notes, and copy the result as instructions.
export class LayoutEditor extends HTMLElement {
  #layout = load_layout();
  #selected_name = null;
  #zoom = 0.3;
  #images = new Map();

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [layout_editor_styles];
    this.shadowRoot.innerHTML = template;
    this.#build_stage();
    this.#bind_controls();
    this.#refresh();
  }

  #build_stage() {
    const stage = this.#element('.stage');
    stage.style.width = `${sign_size.width}px`;
    stage.style.height = `${sign_size.height}px`;
    for (const part of parts_catalog) stage.append(this.#create_image(part));
    stage.append(this.#create_reference());
  }

  #create_image(part) {
    const image = new Image();
    image.src = part.source;
    image.draggable = false;
    image.addEventListener('pointerdown', (event) => this.#start_drag(event, part));
    this.#images.set(part.name, image);
    return image;
  }

  // The original image includes the black frame, so it sits above the sign by the frame height.
  #create_reference() {
    const reference = new Image();
    reference.src = original_image;
    reference.className = 'reference';
    reference.style.cssText = `left: 0; top: -60px; z-index: 9999; display: none;`;
    this.#images.set('reference', reference);
    return reference;
  }

  #bind_controls() {
    this.#element('.zoom').value = this.#zoom;
    this.#element('.zoom').addEventListener('input', (event) => { this.#zoom = Number(event.target.value); this.#refresh(); });
    this.#element('.show_reference').addEventListener('change', () => this.#refresh());
    this.#element('.move_backgrounds').addEventListener('change', () => this.#refresh());
    for (const field of ['x', 'y', 'scale']) {
      this.#element(`.field_${field}`).addEventListener('input', (event) => this.#edit_selected({ [field]: Number(event.target.value) }));
    }
    this.#element('.note').addEventListener('input', (event) => this.#edit_selected({ note: event.target.value }));
    this.#element('.to_front').addEventListener('click', () => this.#edit_selected({ order: this.#extreme_order(Math.max) + 1 }));
    this.#element('.to_back').addEventListener('click', () => this.#edit_selected({ order: this.#extreme_order(Math.min) - 1 }));
    this.#element('.copy').addEventListener('click', () => this.#copy_instructions());
    this.#element('.reset').addEventListener('click', () => { this.#layout = original_layout(); this.#changed(); });
    this.#element('.load').addEventListener('click', () => this.#load_pasted());
    this.addEventListener('keydown', (event) => this.#nudge(event));
    this.tabIndex = 0;
  }

  #start_drag(event, part) {
    this.#select(part.name);
    if (part.is_background && !this.#element('.move_backgrounds').checked) return;
    const placement = this.#layout[part.name];
    const origin = { pointer_x: event.clientX, pointer_y: event.clientY, x: placement.x, y: placement.y };
    const move = (moved) => {
      placement.x = Math.round(origin.x + (moved.clientX - origin.pointer_x) / this.#zoom);
      placement.y = Math.round(origin.y + (moved.clientY - origin.pointer_y) / this.#zoom);
      this.#refresh_stage();
      this.#fill_fields();
    };
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      save_layout(this.#layout);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    event.preventDefault();
  }

  #nudge(event) {
    const steps = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
    if (!steps || !this.#selected_name) return;
    const distance = event.shiftKey ? 10 : 1;
    const placement = this.#layout[this.#selected_name];
    this.#edit_selected({ x: placement.x + steps[0] * distance, y: placement.y + steps[1] * distance });
    event.preventDefault();
  }

  #select(name) {
    this.#selected_name = name;
    this.#refresh();
    this.focus();
  }

  #edit_selected(changes) {
    if (!this.#selected_name) return;
    Object.assign(this.#layout[this.#selected_name], changes);
    this.#changed();
  }

  #extreme_order(pick) {
    return pick(...Object.values(this.#layout).map((placement) => placement.order));
  }

  #changed() {
    save_layout(this.#layout);
    this.#refresh();
  }

  #refresh() {
    this.#refresh_stage();
    this.#refresh_list();
    this.#fill_fields();
  }

  #refresh_stage() {
    const sizer = this.#element('.sizer');
    sizer.style.width = `${sign_size.width * this.#zoom}px`;
    sizer.style.height = `${sign_size.height * this.#zoom}px`;
    this.#element('.stage').style.transform = `scale(${this.#zoom})`;
    const can_move_backgrounds = this.#element('.move_backgrounds').checked;
    for (const part of parts_catalog) this.#place_image(part, can_move_backgrounds);
    this.#images.get('reference').style.display = this.#element('.show_reference').checked ? 'block' : 'none';
  }

  #place_image(part, can_move_backgrounds) {
    const placement = this.#layout[part.name];
    const image = this.#images.get(part.name);
    image.style.left = `${placement.x}px`;
    image.style.top = `${placement.y}px`;
    image.style.zIndex = placement.order;
    image.style.transform = `scale(${placement.scale})`;
    image.style.display = placement.visible ? 'block' : 'none';
    image.classList.toggle('selected', part.name === this.#selected_name);
    image.classList.toggle('locked', part.is_background && !can_move_backgrounds);
  }

  #refresh_list() {
    const list = this.#element('.list');
    list.replaceChildren(...ordered_names(this.#layout).reverse().map((name) => this.#create_list_item(name)));
  }

  #create_list_item(name) {
    const item = document.createElement('li');
    item.className = name === this.#selected_name ? 'selected' : '';
    item.innerHTML = /* html */ `<input type="checkbox"><span></span>`;
    item.querySelector('span').textContent = name;
    const visibility = item.querySelector('input');
    visibility.checked = this.#layout[name].visible;
    visibility.addEventListener('click', (event) => event.stopPropagation());
    visibility.addEventListener('change', () => {
      this.#layout[name].visible = visibility.checked;
      this.#changed();
    });
    item.addEventListener('click', () => this.#select(name));
    return item;
  }

  #fill_fields() {
    const placement = this.#layout[this.#selected_name];
    this.#element('.selected_name').textContent = this.#selected_name ?? 'Ninguna pieza elegida';
    if (!placement) return;
    this.#element('.field_x').value = placement.x;
    this.#element('.field_y').value = placement.y;
    this.#element('.field_scale').value = placement.scale;
    if (this.shadowRoot.activeElement !== this.#element('.note')) this.#element('.note').value = placement.note;
  }

  async #copy_instructions() {
    try {
      await navigator.clipboard.writeText(describe_layout(this.#layout));
      this.#say('Copiado. Pégalo en el chat.');
    } catch (clipboard_error) {
      this.#element('.import').value = describe_layout(this.#layout);
      this.#say('No pude copiar solo: el texto quedó en el cuadro de abajo, cópialo a mano.');
    }
  }

  #load_pasted() {
    try {
      this.#layout = parse_layout(this.#element('.import').value);
      this.#changed();
      this.#say('Layout cargado.');
    } catch (parse_error) {
      this.#say(`No se pudo cargar: ${parse_error.message}`);
    }
  }

  #say(text) {
    this.#element('.message').textContent = text;
  }

  #element(selector) {
    return this.shadowRoot.querySelector(selector);
  }
}

customElements.define('layout-editor', LayoutEditor);
