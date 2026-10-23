export const photo_overlay_styles = new CSSStyleSheet();

photo_overlay_styles.replaceSync(/* css */ `
  :host { position: fixed; inset: 0; pointer-events: none; }
  :host([hidden]) { display: none; }
  .layer, .photo, .edges { position: absolute; inset: 0; width: 100%; height: 100%; }
  .photo { object-fit: contain; }
  .layer.concealed { visibility: hidden; }
  .edges { display: none; overflow: visible; }
  .edges line { stroke: #39ff88; stroke-width: 2.5; vector-effect: non-scaling-stroke; }
  .layer.showing_edges .photo { display: none; }
  .layer.showing_edges .edges { display: block; }
  .controls {
    position: absolute; top: 16px; right: 16px; width: min(300px, calc(100% - 32px)); pointer-events: auto;
    padding: 10px 12px; background: var(--panel); color: var(--text); border: 1px solid var(--line);
    border-radius: 12px; box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2); font-size: 12px;
  }
  .title { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
  label { display: grid; grid-template-columns: 70px 1fr 44px; align-items: center; gap: 6px; margin: 4px 0; }
  .buttons { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  button {
    border: 1px solid var(--line); background: var(--chip); color: inherit; border-radius: 8px;
    padding: 6px 10px; font: inherit; cursor: pointer;
  }
  button:hover { border-color: var(--accent); }
  .hint, .status { color: var(--muted); margin-top: 6px; }
`);
