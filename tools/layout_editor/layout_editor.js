import { layout_editor_styles } from './layout_editor.css.js';
import { active_sign_key, original_image, original_section_heights, parts_catalog, sections, sign_size } from './active_sign.js';
import { render_section_blob } from './section_image.js';
import { move_border, set_section_height, section_tops } from './section_space.js';
import { load_layout, save_layout, load_section_heights, save_section_heights, original_layout, parse_layout, describe_layout, ordered_names } from './layout_store.js';
import { describe_signs, describe_size } from './physical_size.js';
import { sign_catalog } from '../../src/data/sign_catalog.js';

const sign_options = sign_catalog.map(({ key, title }) => `<option value="${key}">${title}</option>`).join('');

const template = /* html */ `
  <div class="viewport"><div class="sizer"><div class="stage"></div></div></div>
  <aside class="panel">
    <div class="row">
      <label>Zoom <input class="zoom" type="range" min="0.1" max="1.5" step="0.01"></label>
      <label><input class="show_reference" type="checkbox"> Original encima</label>
      <label><input class="move_backgrounds" type="checkbox"> Mover fondos</label>
      <label><input class="clean_view" type="checkbox"> Vista final</label>
    </div>
    <div class="row"><label>Letrero <select class="sign_choice">${sign_options}</select></label></div>
    <div class="sign_size">${describe_signs().map((line) => `<div>${line}</div>`).join('')}</div>
    <ul class="list"></ul>
    <div class="row"><button class="copy_all primary">Copiar imagen completa</button></div>
    <div class="selected_controls">
      <strong class="selected_name">Ninguna pieza elegida</strong>
      <div class="fields">
        <label>x<input class="field_x" type="number"></label>
        <label>y<input class="field_y" type="number"></label>
        <label>escala<input class="field_scale" type="number" step="0.05" min="0.1"></label>
      </div>
      <div class="row"><button class="to_front">Al frente</button><button class="to_back">Al fondo</button><button class="delete_piece">Eliminar imagen</button></div>
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
  #heights = load_section_heights();
  #dividers = [];
  #selected_name = null;
  #selected_section = null;
  #zoom = 0.3;
  static viewport_padding = 32;
  #images = new Map();
  #handle = null;
  static scale_step = 1.05;

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [layout_editor_styles];
    this.shadowRoot.innerHTML = template;
    this.#build_stage();
    this.#zoom = this.#zoom_to_fit_screen();
    this.#bind_controls();
    this.#refresh();
  }

  #build_stage() {
    const stage = this.#element('.stage');
    stage.style.width = `${sign_size.width}px`;
    stage.style.height = `${sign_size.height}px`;
    for (const part of parts_catalog) stage.append(this.#create_image(part));
    stage.append(this.#create_reference());
    stage.append(this.#create_handle());
    for (let index = 1; index < sections.length; index++) stage.append(this.#create_divider(index));
  }

  // The line between two sections; dragging it hands height from one section to the other.
  #create_divider(index) {
    const divider = document.createElement('div');
    divider.className = 'divider';
    divider.addEventListener('pointerdown', (event) => this.#start_divider_drag(event, index));
    this.#dividers[index] = divider;
    return divider;
  }

  #create_image(part) {
    const image = new Image();
    image.src = part.source;
    image.draggable = false;
    image.addEventListener('pointerdown', (event) => this.#start_drag(event, part));
    image.addEventListener('wheel', (event) => this.#scale_with_wheel(event, part), { passive: false });
    this.#images.set(part.name, image);
    return image;
  }

  // The corner square that scales the selected piece when dragged.
  #create_handle() {
    this.#handle = document.createElement('div');
    this.#handle.className = 'handle';
    this.#handle.addEventListener('pointerdown', (event) => this.#start_resize(event));
    return this.#handle;
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

  // The whole board fits the window, both its width and its height, until the person zooms in.
  #zoom_to_fit_screen() {
    const viewport = this.#element('.viewport');
    const fit_width = (viewport.clientWidth - LayoutEditor.viewport_padding) / sign_size.width;
    const fit_height = (viewport.clientHeight - LayoutEditor.viewport_padding) / sign_size.height;
    return Math.min(1.5, Math.max(0.1, Math.floor(Math.min(fit_width, fit_height) * 100) / 100));
  }

  #bind_controls() {
    this.#element('.sign_choice').value = active_sign_key;
    this.#element('.sign_choice').addEventListener('change', (event) => { window.location.search = `?sign=${event.target.value}`; });
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
    this.#element('.delete_piece').addEventListener('click', () => this.#toggle_deleted());
    this.#element('.copy').addEventListener('click', () => this.#copy_instructions());
    this.#element('.clean_view').addEventListener('change', (event) => this.classList.toggle('clean', event.target.checked));
    this.#element('.copy_all').addEventListener('click', () => this.#copy_all());
    this.#element('.reset').addEventListener('click', () => {
      this.#layout = original_layout();
      this.#heights = [...original_section_heights];
      this.#changed();
    });
    this.#element('.load').addEventListener('click', () => this.#load_pasted());
    this.addEventListener('keydown', (event) => this.#nudge(event));
    this.tabIndex = 0;
  }

  #start_drag(event, part) {
    this.#select(part.name);
    if (this.#is_locked(part)) return;
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
      this.#save();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    event.preventDefault();
  }

  #start_divider_drag(event, index) {
    const stage = this.#element('.stage');
    const move = (moved) => {
      const pointer_y = (moved.clientY - stage.getBoundingClientRect().top) / this.#zoom;
      move_border(sections, this.#heights, this.#layout, (name) => this.#natural_size(name), index, pointer_y);
      this.#refresh();
    };
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      this.#save();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    event.preventDefault();
  }

  #start_resize(event) {
    const placement = this.#layout[this.#selected_name];
    const natural_width = this.#images.get(this.#selected_name).naturalWidth;
    const stage = this.#element('.stage');
    const move = (moved) => {
      const pointer_x = (moved.clientX - stage.getBoundingClientRect().left) / this.#zoom;
      placement.scale = Math.max(0.05, Math.round(((pointer_x - placement.x) / natural_width) * 100) / 100);
      this.#refresh_stage();
      this.#fill_fields();
    };
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      this.#save();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    event.preventDefault();
    event.stopPropagation();
  }

  // The wheel scales only the selected piece; anywhere else it keeps scrolling the page.
  #scale_with_wheel(event, part) {
    if (part.name !== this.#selected_name || this.#is_locked(part)) return;
    const factor = event.deltaY < 0 ? LayoutEditor.scale_step : 1 / LayoutEditor.scale_step;
    this.#edit_selected({ scale: Math.round(this.#layout[part.name].scale * factor * 100) / 100 });
    event.preventDefault();
  }

  #is_locked(part) {
    return part.is_background && !this.#element('.move_backgrounds').checked;
  }

  #nudge(event) {
    if (event.key === 'Delete') return this.#toggle_deleted();
    if (event.key === '+' || event.key === '-') return this.#scale_with_key(event);
    const steps = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
    if (!steps || !this.#selected_name) return;
    const distance = event.shiftKey ? 10 : 1;
    const placement = this.#layout[this.#selected_name];
    this.#edit_selected({ x: placement.x + steps[0] * distance, y: placement.y + steps[1] * distance });
    event.preventDefault();
  }

  // A deleted image leaves the sign and every copy but stays selected, so it can be restored with the same button.
  #toggle_deleted() {
    if (!this.#selected_name) return this.#say('Elige una imagen primero.');
    this.#edit_selected({ deleted: !this.#layout[this.#selected_name].deleted });
  }

  #scale_with_key(event) {
    if (!this.#selected_name) return;
    const factor = event.key === '+' ? LayoutEditor.scale_step : 1 / LayoutEditor.scale_step;
    this.#edit_selected({ scale: Math.round(this.#layout[this.#selected_name].scale * factor * 100) / 100 });
  }

  #select(name) {
    this.#selected_name = name;
    this.#selected_section = parts_catalog.find((part) => part.name === name).section;
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
    this.#save();
    this.#refresh();
  }

  #save() {
    save_layout(this.#layout);
    save_section_heights(this.#heights);
  }

  #refresh() {
    this.#refresh_stage();
    this.#refresh_list();
    this.#fill_fields();
    this.#element('.selected_controls').hidden = !this.#selected_name;
  }

  #refresh_stage() {
    const sizer = this.#element('.sizer');
    sizer.style.width = `${sign_size.width * this.#zoom}px`;
    sizer.style.height = `${sign_size.height * this.#zoom}px`;
    this.#element('.stage').style.transform = `scale(${this.#zoom})`;
    const can_move_backgrounds = this.#element('.move_backgrounds').checked;
    for (const part of parts_catalog) this.#place_image(part, can_move_backgrounds);
    this.#place_handle();
    this.#place_dividers();
    this.#images.get('reference').style.display = this.#element('.show_reference').checked ? 'block' : 'none';
  }

  #place_dividers() {
    const tops = section_tops(this.#heights);
    this.#dividers.forEach((divider, index) => {
      divider.style.top = `${tops[index]}px`;
      divider.style.height = `${24 / this.#zoom}px`;
      divider.style.marginTop = `${-12 / this.#zoom}px`;
    });
  }

  #place_handle() {
    const part = parts_catalog.find((candidate) => candidate.name === this.#selected_name);
    this.#handle.style.display = part && !this.#is_locked(part) && !this.#layout[part.name].deleted ? 'block' : 'none';
    if (!part) return;
    const placement = this.#layout[part.name];
    const image = this.#images.get(part.name);
    const size = 28 / this.#zoom;
    this.#handle.style.width = this.#handle.style.height = `${size}px`;
    this.#handle.style.left = `${placement.x + image.naturalWidth * placement.scale - size / 2}px`;
    this.#handle.style.top = `${placement.y + image.naturalHeight * placement.scale - size / 2}px`;
  }

  #place_image(part, can_move_backgrounds) {
    const placement = this.#layout[part.name];
    const image = this.#images.get(part.name);
    image.style.left = `${placement.x}px`;
    image.style.top = `${placement.y}px`;
    image.style.zIndex = placement.order;
    image.style.transform = `scale(${placement.scale}, ${placement.scale * placement.stretch})`;
    image.style.display = placement.visible && !placement.deleted ? 'block' : 'none';
    image.classList.toggle('selected', part.name === this.#selected_name);
    image.classList.toggle('in_section', part.section === this.#selected_section);
    image.classList.toggle('locked', part.is_background && !can_move_backgrounds);
  }

  // The sections are always listed; the pieces show only under the section that is open.
  #refresh_list() {
    const items = sections.flatMap((section) => [this.#create_section_header(section), ...this.#pieces_listed_under(section)]);
    this.#element('.list').replaceChildren(...items);
  }

  #pieces_listed_under(section) {
    if (section.title !== this.#selected_section) return [];
    return this.#section_names(section).map((name) => this.#create_list_item(name));
  }

  #natural_size(name) {
    const image = this.#images.get(name);
    return { width: image.naturalWidth, height: image.naturalHeight };
  }

  #section_names(section) {
    return ordered_names(this.#layout).filter((name) => section.pieces.includes(name)).reverse();
  }

  #create_section_header(section) {
    const header = document.createElement('li');
    header.className = section.title === this.#selected_section ? 'section_header selected' : 'section_header';
    header.innerHTML = /* html */ `<span></span><small class="section_size"></small><label>alto <input class="section_height" type="number" step="10"></label><button class="copy_image" title="Copiar esta sección como imagen">Copiar imagen</button>`;
    header.querySelector('span').textContent = section.title;
    header.querySelector('.section_size').textContent = describe_size(this.#heights[sections.indexOf(section)]);
    this.#bind_header(header, section);
    return header;
  }

  #bind_header(header, section) {
    const height_field = header.querySelector('.section_height');
    height_field.value = this.#heights[sections.indexOf(section)];
    height_field.addEventListener('click', (event) => event.stopPropagation());
    height_field.addEventListener('change', () => this.#set_height(section, Number(height_field.value)));
    const copy_button = header.querySelector('.copy_image');
    copy_button.addEventListener('click', (event) => { event.stopPropagation(); this.#copy_section(section); });
    header.addEventListener('click', () => this.#select_section(section));
  }

  #set_height(section, requested_height) {
    set_section_height(sections, this.#heights, this.#layout, (name) => this.#natural_size(name), sections.indexOf(section), requested_height);
    this.#changed();
  }

  #select_section(section) {
    this.#selected_section = section.title;
    this.#selected_name = null;
    this.#refresh();
  }

  #create_list_item(name) {
    const item = document.createElement('li');
    item.className = [name === this.#selected_name ? 'selected' : '', this.#layout[name].deleted ? 'deleted' : ''].join(' ');
    item.innerHTML = /* html */ `<input type="checkbox"><span></span>`;
    item.querySelector('span').textContent = this.#layout[name].deleted ? `${name} (eliminada)` : name;
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
    this.#element('.delete_piece').textContent = placement.deleted ? 'Restaurar imagen' : 'Eliminar imagen';
    this.#element('.field_x').value = placement.x;
    this.#element('.field_y').value = placement.y;
    this.#element('.field_scale').value = placement.scale;
    if (this.shadowRoot.activeElement !== this.#element('.note')) this.#element('.note').value = placement.note;
  }

  async #copy_instructions() {
    try {
      await navigator.clipboard.writeText(describe_layout(this.#layout, this.#heights));
      this.#say('Copiado. Pégalo en el chat.');
    } catch (clipboard_error) {
      this.#element('.import').value = describe_layout(this.#layout, this.#heights);
      this.#say('No pude copiar solo: el texto quedó en el cuadro de abajo, cópialo a mano.');
    }
  }

  async #copy_section(section) {
    const parts = parts_catalog.filter((part) => part.section === section.title && !this.#layout[part.name].deleted);
    await this.#copy_image(parts, null, `Sección "${section.title}"`);
  }

  // The whole sign at its real size, without deleted images; whatever sticks out of the canvas is cut off.
  async #copy_all() {
    const bounds = { left: 0, top: 0, right: sign_size.width, bottom: sign_size.height };
    const parts = parts_catalog.filter((part) => !this.#layout[part.name].deleted);
    await this.#copy_image(parts, bounds, 'Imagen completa');
  }

  async #copy_image(parts, bounds, label) {
    try {
      const blob = await render_section_blob(parts, this.#layout, this.#images, bounds);
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      this.#say(`${label} copiada como imagen.`);
    } catch (copy_error) {
      this.#say(`No se pudo copiar la imagen: ${copy_error.message}`);
    }
  }

  #load_pasted() {
    try {
      ({ layout: this.#layout, heights: this.#heights } = parse_layout(this.#element('.import').value));
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
