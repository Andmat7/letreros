export const zoom_control_styles = new CSSStyleSheet();

zoom_control_styles.replaceSync(/* css */ `
  :host {
    position: fixed; right: 16px; bottom: 16px; display: flex; flex-direction: column; overflow: hidden;
    background: var(--panel); border: 1px solid var(--line); border-radius: 12px; box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
  }
  button {
    width: 40px; height: 40px; border: 0; background: transparent; color: var(--text);
    font: inherit; font-size: 22px; line-height: 1; cursor: pointer;
  }
  button:hover { background: var(--chip); }
  button + button { border-top: 1px solid var(--line); }
`);
