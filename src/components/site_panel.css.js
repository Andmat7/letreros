export const site_panel_styles = new CSSStyleSheet();

site_panel_styles.replaceSync(/* css */ `
  :host {
    position: fixed; top: 16px; left: 16px; width: 290px; max-height: calc(100% - 32px); overflow: auto;
    background: var(--panel); color: var(--text); border: 1px solid var(--line); border-radius: 12px;
    padding: 14px 14px 10px; box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15); backdrop-filter: blur(6px);
  }
  h1 { font-size: 16px; margin: 0 0 2px; }
  h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); margin: 12px 0 6px; }
  .subtitle { color: var(--muted); font-size: 12px; margin: 0 0 10px; }
  .list { display: grid; gap: 6px; }
  .item {
    display: flex; align-items: center; gap: 10px; padding: 6px; width: 100%; border-radius: 8px;
    border: 1px solid transparent; background: var(--chip); color: inherit; font: inherit; text-align: left; cursor: pointer;
  }
  .item:hover, .item.active { border-color: var(--accent); }
  .item img { width: 44px; height: 44px; object-fit: cover; border-radius: 6px; flex: none; background: #fff; }
  .item small { display: block; color: var(--muted); font-size: 11px; }
  .commands { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
  button.command, button.toggle {
    border: 1px solid var(--line); background: var(--chip); color: inherit; border-radius: 8px;
    padding: 6px 10px; font: inherit; font-size: 12px; cursor: pointer;
  }
  button.command:hover { border-color: var(--accent); }
  .hint { color: var(--muted); font-size: 11px; margin: 10px 0 0; }
  .toggle { display: none; float: right; }
  @media (max-width: 640px) {
    :host { width: auto; right: 16px; max-height: 45%; }
    :host(.collapsed) .body { display: none; }
    .toggle { display: block; }
  }
`);
