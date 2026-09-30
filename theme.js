// Static CSS only. Never inspect, copy, store or transmit message contents.
// Screen-only rules keep the original email appearance when printing.
globalThis.__mailAfterDarkCSS = `
@media screen {
  :root { color-scheme: dark !important; background-color: #14181e !important; }
  body { background-color: #14181e !important; }
  :where(body, body *):where(:not(img, picture, video, canvas, svg, svg *, iframe)) {
    color: #e1e6ed !important;
    background-color: #14181e !important;
    border-color: #414a57 !important;
    text-shadow: none !important;
  }
  :where(span, a, b, strong, em, i, small, label, font, code) { background-color: transparent !important; }
  :where(a, a *) { color: #9fcaff !important; }
  :where(input, textarea, select, button, [role="button"], [role="dialog"], [role="menu"], [role="listbox"]) {
    background-color: #232b36 !important;
    color: #e1e6ed !important;
  }
  :where(input, textarea, [contenteditable="true"]) { caret-color: #b8dcc8 !important; }
  :where(input, textarea)::placeholder { color: #a6b0bf !important; }
  :where(button, [role="button"], [role="option"]):hover { background-color: #344152 !important; }
  :where([aria-selected="true"], [aria-current="page"], [aria-checked="true"]) {
    background-color: #294638 !important;
  }
  :where(:focus-visible) { outline: 2px solid #a4d6bc !important; outline-offset: 2px !important; }
  ::selection { color: #fff !important; background-color: #375979 !important; }
  /* Gmail: retain unread weight and distinguish hovered/selected conversations. */
  .zA.zE, .zA.zE :where(td, span, div) { background-color: #202833 !important; }
  .zA:hover, .zA:hover :where(td, span, div) { background-color: #2b3746 !important; }
  .zA.x7, .zA.x7 :where(td, span, div) { background-color: #294638 !important; }
  /* Pseudo elements often draw icon sprites. Do not change their images. */
}
`;
