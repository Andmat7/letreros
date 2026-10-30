export const layout_editor_styles = new CSSStyleSheet();

layout_editor_styles.replaceSync(/* css */ `
  :host { display: grid; grid-template-columns: 1fr 340px; height: 100vh; font: 14px system-ui, sans-serif; color: #1c1c22; }
  .viewport { overflow: auto; background: #cfd0d6; padding: 16px; }
  .sizer { margin: 0 auto; }
  .stage { position: relative; background: #fff; transform-origin: top left; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3); }
  .board_view { background: #fff center / 100% 100% no-repeat; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3); }
  .stage img { position: absolute; transform-origin: top left; user-select: none; -webkit-user-drag: none; cursor: grab; }
  .stage img.in_section { outline: 4px dashed #00a8ff; }
  .stage img.selected { outline: 6px solid #00a8ff; }
  .stage img.locked { cursor: default; }
  .stage .divider { position: absolute; left: 0; right: 0; z-index: 9500; cursor: ns-resize; background: linear-gradient(transparent 45%, #ff3d71 45%, #ff3d71 55%, transparent 55%); }
  .stage .handle { position: absolute; z-index: 10000; background: #00a8ff; border: 2px solid #fff; cursor: nwse-resize; box-sizing: border-box; }
  .stage img.reference { opacity: 0.45; pointer-events: none; outline: 4px dashed #f0f; }
  .panel { display: flex; flex-direction: column; gap: 10px; padding: 12px; overflow: auto; background: #fff; border-left: 1px solid #ccc; }
  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .row label { display: flex; gap: 4px; align-items: center; }
  button { padding: 6px 10px; border: 1px solid #999; border-radius: 6px; background: #f4f4f7; cursor: pointer; }
  button.primary { background: #1a73e8; color: #fff; border-color: #1a73e8; }
  ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
  li { display: flex; gap: 6px; align-items: center; padding: 4px 6px; border-radius: 6px; cursor: pointer; }
  li.section_header { margin-top: 8px; font-weight: 700; background: #eef0f5; }
  li.section_header label { display: flex; gap: 4px; align-items: center; font-weight: 400; font-size: 12px; }
  li.section_header input { width: 64px; }
  li.section_header { flex-wrap: wrap; }
  li.section_header .section_size { flex-basis: 100%; font-weight: 400; color: #5d6673; }
  .sign_size { padding: 4px 8px; font-size: 12px; color: #5d6673; }
  li.section_header button { padding: 2px 8px; font-size: 12px; }
  li.deleted { opacity: 0.55; }
  li.deleted span { text-decoration: line-through; }
  :host(.clean) .stage .divider, :host(.clean) .stage .handle, :host(.clean) .stage img.reference { display: none !important; }
  :host(.clean) .stage img { outline: none !important; cursor: default; }
  li.selected { background: #dff0ff; }
  li span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .fields { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .fields label { display: flex; flex-direction: column; font-size: 12px; gap: 2px; }
  input[type=number] { width: 100%; box-sizing: border-box; }
  textarea { width: 100%; box-sizing: border-box; min-height: 60px; }
  .section_name { font-size: 12px; color: #555; }
  .message { font-size: 12px; color: #555; min-height: 1.2em; }
`);
