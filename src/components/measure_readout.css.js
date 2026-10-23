export const measure_readout_styles = new CSSStyleSheet();

measure_readout_styles.replaceSync(/* css */ `
  :host {
    position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%); width: min(360px, calc(100% - 32px));
    padding: 10px 12px; background: var(--panel); color: var(--text); border: 1px solid var(--line);
    border-radius: 12px; box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
  }
  :host([hidden]) { display: none; }
  .distance { font-size: 22px; font-weight: 700; }
  .parts, .points { color: var(--muted); font-size: 12px; }
  .points { margin: 6px 0 8px; font-family: ui-monospace, Consolas, monospace; white-space: pre-line; }
  button {
    border: 1px solid var(--accent); background: var(--accent); color: #fff; border-radius: 8px;
    padding: 6px 12px; font: inherit; font-size: 12px; cursor: pointer;
  }
`);
