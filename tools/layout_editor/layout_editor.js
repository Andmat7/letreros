import { layout_editor_styles } from './layout_editor.css.js';
import { active_sign_key, original_image, original_section_heights, parts_catalog, section_groups, sections, sign_size } from './active_sign.js';
import { render_section_blob } from './section_image.js';
import { align_joints, has_length, joint_root, thickness_holder } from './arrow_joints.js';
import { group_bounds, move_group, movable_names, scale_group, set_group, snapshot, with_companions } from './piece_groups.js';
import { move_border, set_section_height, section_tops } from './section_space.js';
import { group_share, set_group_share } from './group_space.js';
import { draw_frame, frame_box, place_frames } from './group_frame.js';
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
    <div class="row group_share" title="Parte del alto bajo la cabecera para cada grupo de secciones"><label><span class="first_group"></span> <input class="share_field" type="number" min="10" max="90" step="1"> %</label><span class="second_group"></span></div>
    <div class="sign_size">${describe_signs().map((line) => `<div>${line}</div>`).join('')}</div>
    <ul class="list"></ul>
    <div class="row"><button class="copy_all primary">Copiar imagen completa</button><button class="publish primary" title="Guarda el letrero en el proyecto: se ve en la página 3D y genera el PDF de impresión">Guardar en 3D y PDF</button></div>
    <div class="selected_controls">
      <strong class="selected_name">Ninguna pieza elegida</strong>
      <div class="fields">
        <label class="plain_field">x<input class="field_x" type="number"></label>
        <label class="plain_field">y<input class="field_y" type="number"></label>
        <label class="plain_field">escala<input class="field_scale" type="number" step="0.05" min="0.1"></label>
        <label class="plain_field" title="Estira la imagen a lo ancho: 1 es su ancho normal, 1.2 un 20 % más ancha">ancho<input class="field_widen" type="number" step="0.05" min="0.1"></label>
        <label class="joined_field" title="Grosor del rectángulo de la flecha: 1 es el normal">grosor<input class="field_thickness" type="number" step="0.05" min="0.1"></label>
        <label class="joined_field length_field" title="Largo del rectángulo de la flecha: 1 es el normal">largo<input class="field_length" type="number" step="0.05" min="0.1"></label>
      </div>
      <div class="group_hint">Arrástralas para moverlas juntas; el cuadrito, la rueda o + y − las escalan juntas.</div>
      <div class="row"><button class="make_group" title="Guarda estas piezas como grupo: un clic en cualquiera elige todas">Agrupar</button><button class="break_group">Desagrupar</button></div>
      <div class="row single_only"><button class="to_front">Al frente</button><button class="to_back">Al fondo</button><button class="delete_piece">Eliminar imagen</button></div>
      <textarea class="note single_only" placeholder="Instrucción para esta pieza (ej. más grande, tapar la parte baja…)"></textarea>
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
  // Every piece chosen right now: the clicked one, its arrow, its saved group and any added with Ctrl or Shift.
  #chosen = new Set();
  #selected_section = null;
  #zoom = 0.3;
  static viewport_padding = 32;
  #images = new Map();
  #handle = null;
  #publish_timer = null;
  #publishing = Promise.resolve();
  static scale_step = 1.05;
  static publish_delay = 1200;

  connectedCallback() {
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [layout_editor_styles];
    this.shadowRoot.innerHTML = template;
    this.#build_stage();
    this.#zoom = this.#zoom_to_fit_screen();
    this.#bind_controls();
    this.#refresh();
    this.#publish_when_loaded();
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
    image.classList.toggle('frame', Boolean(part.frame));
    image.addEventListener('load', () => this.#refresh_stage());
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
    for (const field of ['x', 'y', 'scale', 'widen', 'length']) {
      this.#element(`.field_${field}`).addEventListener('input', (event) => this.#edit_selected({ [field]: Number(event.target.value) }));
    }
    this.#element('.field_thickness').addEventListener('input', (event) => this.#set_thickness(Number(event.target.value)));
    this.#element('.note').addEventListener('input', (event) => this.#edit_selected({ note: event.target.value }));
    this.#element('.to_front').addEventListener('click', () => this.#edit_selected({ order: this.#extreme_order(Math.max) + 1 }));
    this.#element('.to_back').addEventListener('click', () => this.#edit_selected({ order: this.#extreme_order(Math.min) - 1 }));
    this.#element('.delete_piece').addEventListener('click', () => this.#toggle_deleted());
    this.#element('.copy').addEventListener('click', () => this.#copy_instructions());
    this.#element('.clean_view').addEventListener('change', (event) => this.classList.toggle('clean', event.target.checked));
    this.#element('.copy_all').addEventListener('click', () => this.#copy_all());
    this.#element('.publish').addEventListener('click', () => this.#publish());
    this.#element('.reset').addEventListener('click', () => {
      this.#layout = original_layout();
      this.#heights = [...original_section_heights];
      this.#changed();
    });
    this.#element('.load').addEventListener('click', () => this.#load_pasted());
    this.#element('.share_field').addEventListener('change', (event) => this.#set_share(Number(event.target.value)));
    this.#element('.make_group').addEventListener('click', () => this.#save_group(`grupo_${Date.now()}`, 'Grupo guardado: un clic en cualquiera de sus piezas lo elige entero.'));
    this.#element('.break_group').addEventListener('click', () => this.#save_group('', 'Grupo deshecho.'));
    this.#element('.viewport').addEventListener('pointerdown', (event) => {
      if (!event.target.closest('img, .handle, .divider')) this.#clear_choice();
    });
    this.addEventListener('keydown', (event) => this.#nudge(event));
    this.tabIndex = 0;
  }

  // Dragging moves every chosen piece; arrow pieces move with their tip. Ctrl or Shift adds or takes out a piece.
  #start_drag(event, part) {
    this.#select(part.name, event.ctrlKey || event.shiftKey || event.metaKey);
    event.preventDefault();
    if (this.#is_locked(part) || !this.#chosen.has(part.name)) return;
    const before = snapshot(this.#layout, this.#movable_chosen());
    this.#follow_pointer((moved) => {
      move_group(this.#layout, before, { x: (moved.clientX - event.clientX) / this.#zoom, y: (moved.clientY - event.clientY) / this.#zoom });
      this.#refresh_stage();
      this.#fill_fields();
    });
  }

  // The handle of several pieces scales them all from the top left corner of the box around them.
  #start_group_resize(event) {
    const bounds = this.#chosen_bounds();
    const before = snapshot(this.#layout, this.#movable_chosen());
    const stage = this.#element('.stage');
    this.#follow_pointer((moved) => {
      const pointer_x = (moved.clientX - stage.getBoundingClientRect().left) / this.#zoom;
      const factor = Math.max(0.05, (pointer_x - bounds.left) / (bounds.right - bounds.left));
      scale_group(this.#layout, before, factor, { x: bounds.left, y: bounds.top });
      this.#refresh_stage();
    });
    event.preventDefault();
    event.stopPropagation();
  }

  // Wheel and + / − scale several pieces around the center of the box around them.
  #scale_chosen(factor) {
    const bounds = this.#chosen_bounds();
    const center = { x: (bounds.left + bounds.right) / 2, y: (bounds.top + bounds.bottom) / 2 };
    scale_group(this.#layout, snapshot(this.#layout, this.#movable_chosen()), factor, center);
    this.#changed();
  }

  #follow_pointer(move) {
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      this.#save();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
  }

  #movable_chosen() {
    return movable_names(parts_catalog, this.#chosen).filter((name) => !this.#is_locked(this.#part(name)));
  }

  #chosen_bounds() {
    return group_bounds(this.#layout, [...this.#chosen], (name) => this.#natural_size(name));
  }

  // More than one piece that moves on its own (an arrow counts as one).
  #is_many() {
    return movable_names(parts_catalog, this.#chosen).length > 1;
  }

  #save_group(group_name, message) {
    if (!this.#is_many() && group_name) return this.#say('Elige dos o más piezas con Ctrl+clic para agruparlas.');
    set_group(parts_catalog, this.#layout, this.#chosen, group_name);
    this.#changed();
    this.#say(message);
  }

  #clear_choice() {
    this.#chosen = new Set();
    this.#selected_name = null;
    this.#refresh();
  }

  #part(name) {
    return parts_catalog.find((part) => part.name === name);
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

  // An arrow body's handle changes its length ("largo"); any other piece's handle changes its scale.
  #start_resize(event) {
    if (this.#is_many()) return this.#start_group_resize(event);
    const placement = this.#layout[this.#selected_name];
    const is_joined = Boolean(parts_catalog.find((part) => part.name === this.#selected_name).joint);
    const tip_scale = this.#layout[joint_root(parts_catalog, this.#selected_name)].scale;
    const natural_width = this.#images.get(this.#selected_name).naturalWidth;
    const stage = this.#element('.stage');
    const move = (moved) => {
      const pointer_x = (moved.clientX - stage.getBoundingClientRect().left) / this.#zoom;
      const ratio = Math.max(0.05, (pointer_x - placement.x) / natural_width);
      if (is_joined) placement.length = Math.max(0.05, Math.round((ratio / tip_scale) * 100) / 100);
      else placement.scale = Math.max(0.05, Math.round((ratio / placement.widen) * 100) / 100);
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
  // On an arrow body the wheel changes its thickness instead.
  #scale_with_wheel(event, part) {
    const factor = event.deltaY < 0 ? LayoutEditor.scale_step : 1 / LayoutEditor.scale_step;
    if (this.#is_many() && this.#chosen.has(part.name)) {
      event.preventDefault();
      return this.#scale_chosen(factor);
    }
    if (part.name !== this.#selected_name || this.#is_locked(part)) return;
    if (part.joint) this.#set_thickness(Math.round(this.#layout[thickness_holder(part)].thickness * factor * 100) / 100);
    else this.#edit_selected({ scale: Math.round(this.#layout[part.name].scale * factor * 100) / 100 });
    event.preventDefault();
  }

  // The turn and the body of a turning arrow share one thickness, kept on the turn.
  #set_thickness(thickness) {
    const part = parts_catalog.find((candidate) => candidate.name === this.#selected_name);
    if (!part?.joint) return;
    this.#layout[thickness_holder(part)].thickness = thickness;
    this.#changed();
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
    move_group(this.#layout, snapshot(this.#layout, this.#movable_chosen()), { x: steps[0] * distance, y: steps[1] * distance });
    this.#changed();
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
    if (this.#is_many()) return this.#scale_chosen(factor);
    this.#edit_selected({ scale: Math.round(this.#layout[this.#selected_name].scale * factor * 100) / 100 });
  }

  // A click picks the piece with its arrow and its saved group; with adding it joins the choice or leaves it.
  // Clicking a piece that is already chosen keeps the whole choice, so it can be dragged together.
  #select(name, adding = false) {
    const companions = with_companions(parts_catalog, this.#layout, [name]);
    if (adding && this.#chosen.has(name)) companions.forEach((member) => this.#chosen.delete(member));
    else if (adding) companions.forEach((member) => this.#chosen.add(member));
    else if (!this.#chosen.has(name)) this.#chosen = new Set(companions);
    this.#selected_name = this.#chosen.has(name) ? name : ([...this.#chosen][0] ?? null);
    this.#selected_section = this.#selected_name ? this.#part(this.#selected_name).section : null;
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
    this.#schedule_publish();
  }

  #refresh() {
    this.#refresh_stage();
    this.#refresh_list();
    this.#fill_fields();
    this.#fill_share();
    this.#element('.selected_controls').hidden = !this.#selected_name;
    this.#element('.selected_controls').classList.toggle('many', this.#is_many());
  }

  #refresh_stage() {
    place_frames(parts_catalog, this.#heights, this.#layout);
    this.#redraw_frames();
    align_joints(parts_catalog, this.#layout, (name) => this.#natural_size(name));
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

  // A frame is redrawn only when its group changed height, since a new image reloads the stage.
  #redraw_frames() {
    for (const part of parts_catalog.filter((candidate) => candidate.frame)) {
      const image = this.#images.get(part.name);
      const height = frame_box(part.frame, this.#heights).height;
      if (Number(image.dataset.height) === height) continue;
      image.dataset.height = height;
      image.src = draw_frame(part.frame, height);
    }
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
    if (this.#is_many()) return this.#place_group_handle();
    const part = parts_catalog.find((candidate) => candidate.name === this.#selected_name);
    const can_resize = part && !this.#is_locked(part) && !this.#layout[part.name].deleted && (!part.joint || has_length(part));
    this.#handle.style.display = can_resize ? 'block' : 'none';
    if (!part) return;
    const placement = this.#layout[part.name];
    const image = this.#images.get(part.name);
    const size = 28 / this.#zoom;
    this.#handle.style.width = this.#handle.style.height = `${size}px`;
    this.#handle.style.left = `${placement.x + image.naturalWidth * placement.scale * placement.widen - size / 2}px`;
    this.#handle.style.top = `${placement.y + image.naturalHeight * placement.scale - size / 2}px`;
  }

  #place_group_handle() {
    const bounds = this.#chosen_bounds();
    const size = 28 / this.#zoom;
    Object.assign(this.#handle.style, {
      display: 'block', width: `${size}px`, height: `${size}px`, left: `${bounds.right - size / 2}px`, top: `${bounds.bottom - size / 2}px`,
    });
  }

  #place_image(part, can_move_backgrounds) {
    const placement = this.#layout[part.name];
    const image = this.#images.get(part.name);
    image.style.left = `${placement.x}px`;
    image.style.top = `${placement.y}px`;
    image.style.zIndex = placement.order;
    image.style.transform = `scale(${placement.scale * placement.widen}, ${placement.scale * placement.stretch})`;
    image.style.display = placement.visible && !placement.deleted ? 'block' : 'none';
    image.classList.toggle('selected', this.#chosen.has(part.name));
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

  // The share of the first group of sections; the second gets the rest.
  #set_share(percent) {
    const share = Math.min(90, Math.max(10, percent)) / 100;
    const sign = { sections, heights: this.#heights, size_of: (name) => this.#natural_size(name), width: sign_size.width };
    set_group_share(section_groups, sign, this.#layout, share);
    this.#changed();
  }

  #fill_share() {
    const row = this.#element('.group_share');
    row.hidden = section_groups.length !== 2;
    if (row.hidden) return;
    const percent = Math.round(group_share(section_groups, this.#heights) * 100);
    this.#element('.first_group').textContent = section_groups[0].title;
    if (this.shadowRoot.activeElement !== this.#element('.share_field')) this.#element('.share_field').value = percent;
    this.#element('.second_group').textContent = `${section_groups[1].title} ${100 - percent} %`;
  }

  #select_section(section) {
    this.#selected_section = section.title;
    this.#selected_name = null;
    this.#chosen = new Set();
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
    item.addEventListener('click', (event) => this.#select(name, event.ctrlKey || event.shiftKey || event.metaKey));
    return item;
  }

  #fill_fields() {
    const placement = this.#layout[this.#selected_name];
    this.#element('.selected_name').textContent = this.#selected_name ?? 'Ninguna pieza elegida';
    if (this.#is_many()) this.#element('.selected_name').textContent = `${movable_names(parts_catalog, this.#chosen).length} piezas elegidas`;
    if (!placement || this.#is_many()) return;
    this.#element('.delete_piece').textContent = placement.deleted ? 'Restaurar imagen' : 'Eliminar imagen';
    this.#element('.field_x').value = placement.x;
    this.#element('.field_y').value = placement.y;
    this.#element('.field_scale').value = placement.scale;
    this.#element('.field_widen').value = placement.widen;
    this.#fill_joined_fields();
    if (this.shadowRoot.activeElement !== this.#element('.note')) this.#element('.note').value = placement.note;
  }

  // An arrow body shows its thickness and length instead of position and scale; the turn has no length.
  #fill_joined_fields() {
    const part = parts_catalog.find((candidate) => candidate.name === this.#selected_name);
    const fields = this.#element('.fields');
    fields.classList.toggle('joined', Boolean(part.joint));
    fields.classList.toggle('without_length', Boolean(part.joint) && !has_length(part));
    if (!part.joint) return;
    this.#element('.field_thickness').value = this.#layout[thickness_holder(part)].thickness;
    this.#element('.field_length').value = this.#layout[part.name].length;
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
    await this.#copy_image(() => render_section_blob(parts, this.#layout, this.#images), `Sección "${section.title}"`);
  }

  async #copy_all() {
    await this.#copy_image(() => this.#render_full_sign(), 'Imagen completa');
  }

  // The 3D page shows what the editor shows without pressing anything: the sign is published when the editor opens
  // (so changes to the default layout reach it too) and shortly after every change. Only the local dev server saves.
  async #publish_when_loaded() {
    if (window.location.hostname !== 'localhost') return;
    await Promise.all([...this.#images.values()].map((image) => loaded(image)));
    this.#publish();
  }

  #schedule_publish() {
    if (window.location.hostname !== 'localhost') return;
    clearTimeout(this.#publish_timer);
    this.#publish_timer = setTimeout(() => this.#publish(), LayoutEditor.publish_delay);
  }

  // The dev server (tools/dev_server.py) saves the sign as the board's finished layout, rebuilds the 3D page's
  // images and writes the print PDF at the board's real size; the open 3D page then reloads itself.
  // Publishes run one after another, so an older sign never overwrites a newer one.
  #publish() {
    this.#publishing = this.#publishing.then(() => this.#send_sign());
    return this.#publishing;
  }

  async #send_sign() {
    this.#say('Guardando en 3D y PDF…');
    try {
      const response = await fetch(`/publish_layout?sign=${active_sign_key}`, { method: 'POST', body: await this.#render_full_sign() });
      const reply = await response.text();
      if (!response.ok) throw new Error(reply);
      this.#say(`Guardado en 3D (${window.location.origin}/ se recarga solo) y PDF: ${reply}`);
    } catch (publish_error) {
      this.#say(`No se pudo guardar (¿está corriendo tools/dev_server.py?): ${publish_error.message}`);
    }
  }

  // The whole sign at its real size, without deleted images; whatever sticks out of the canvas is cut off.
  #render_full_sign() {
    const bounds = { left: 0, top: 0, right: sign_size.width, bottom: sign_size.height };
    const parts = parts_catalog.filter((part) => !this.#layout[part.name].deleted);
    return render_section_blob(parts, this.#layout, this.#images, bounds);
  }

  async #copy_image(render, label) {
    try {
      const blob = await render();
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

// Load events instead of decode(), because a browser may hold back decoding in a background tab and the sign would
// never be published. A failed image counts as done, so one missing file does not stop the rest.
function loaded(image) {
  if (image.complete && image.naturalWidth) return Promise.resolve();
  return new Promise((resolve) => {
    image.addEventListener('load', resolve, { once: true });
    image.addEventListener('error', resolve, { once: true });
  });
}

customElements.define('layout-editor', LayoutEditor);
