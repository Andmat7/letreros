import * as column_sign from './parts_catalog.js';
import * as corner_sign from './corner_sign.js';

// The page shows the sign named in the address, so each sign has its own address and its own saved layout.
const requested_key = new URLSearchParams(window.location.search).get('sign');
const is_corner = requested_key === corner_sign.corner_sign_key;
const active = is_corner ? corner_sign : column_sign;

export const active_sign_key = is_corner ? corner_sign.corner_sign_key : 'columna_esquina';
// The column layout was saved under its first name, so that name keeps its saved work.
export const active_storage_name = is_corner ? corner_sign.corner_sign_key : 'bancolombia_nueva_1x4_6';
export const { parts_catalog, sections, sign_size, original_image, original_section_heights } = active;
