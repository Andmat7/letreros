export const artwork_picker_styles = new CSSStyleSheet();

artwork_picker_styles.replaceSync(/* css */ `
  :host { display: block; }
  .board { margin-top: 8px; padding: 8px; background: var(--chip); border: 1px solid var(--line); border-radius: 8px; }
  .board.selected { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent); }
  .board_title { font-size: 12px; font-weight: 600; margin-bottom: 6px; }
  select {
    width: 100%; margin-bottom: 4px; padding: 4px 6px; font: inherit; font-size: 12px;
    color: inherit; background: var(--panel); border: 1px solid var(--line); border-radius: 6px;
  }
  label { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); }
`);
