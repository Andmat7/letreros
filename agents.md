# Agents

## Style

- `snake_case` files/vars/funcs, `PascalCase` classes. No abbrevs.
- Names: meaningful and pronounceable (no `x`, `tmp`, `d1`).
- Imports: core→local→relative.
- Main functions first, human-readable. Components: template → main API → logic.
- Comments: why only. No dead code.
- Errors: specific exceptions, fail-fast. No `null`/magic codes.
- English only.

## Structure

- 1 file = 1 responsibility. Max 7/folder, subfolder if >3 deep.
- Functions: 1 task, ≤20 lines, ≤3 params, pure.
- API: minimal, strict types, sequential.
- Refactor if >10s to explain.

## Data models

- no suffix; like TS interfaces/MVC models.
- separate files for data shapes (`bill`, `client`, `payment`),
- import data models when necessary. No data duplication between data models.

## Web Components

- Split if large.
- Templates: `/* html */` / `/* css */`
- Order: template → public API (≤3) → logic.
- Styles: scoped, closest to component. `adoptedStyleSheets` + `.css.js`

## Python scripts

- Use .venv; deps pinned in requirements.txt; install steps in README.md first. minimal tokens
- class-based, with few public methods.

