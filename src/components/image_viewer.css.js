export const image_viewer_styles = new CSSStyleSheet();

image_viewer_styles.replaceSync(/* css */ `
  :host {
    position: fixed; right: 16px; bottom: 16px; width: min(420px, calc(100% - 32px)); padding: 10px;
    background: var(--panel); color: var(--text); border: 1px solid var(--line); border-radius: 12px;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
  }
  :host([hidden]) { display: none; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; gap: 8px; }
  .title { font-size: 13px; font-weight: 600; }
  img { display: block; width: 100%; max-height: 55vh; object-fit: contain; border-radius: 8px; background: #000; }
  button {
    border: 1px solid var(--line); background: var(--chip); color: inherit; border-radius: 8px;
    padding: 6px 10px; font: inherit; font-size: 12px; cursor: pointer;
  }
`);
