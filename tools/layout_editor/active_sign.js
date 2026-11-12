import * as column_sign from './parts_catalog.js';
import * as corner_sign from './corner_sign.js';

// The page shows the sign named in the address, so each sign has its own address and its own saved layout.
// Addresses with the signs' former names (before they were named after their street) still open the right sign.
const former_keys = { columna_esquina: 'carrera_7', esquina_calle_12: 'calle_12' };
const address_key = new URLSearchParams(window.location.search).get('sign');
const requested_key = former_keys[address_key] ?? address_key;
const is_corner = requested_key === corner_sign.corner_sign_key;
const active = is_corner ? corner_sign : column_sign;

export const active_sign_key = is_corner ? corner_sign.corner_sign_key : 'carrera_7';
// The column layout was saved under its first name, so that name keeps its saved work.
// The Calle 12 layout is saved under its former sign name plus a version (its sections were reordered once).
// Both storage names stay as they are so the saved work is kept.
export const active_storage_name = is_corner ? 'esquina_calle_12_v2' : 'bancolombia_nueva_1x4_6';
export const { parts_catalog, sections, sign_size, original_image, original_section_heights } = active;
export const default_adjustments = active.default_adjustments ?? {};
