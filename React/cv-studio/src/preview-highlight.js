// This layer is added only after pagination has captured the printable pages.
// It never changes text metrics or enters the PDF snapshot.
export function highlightField(doc, key, theme) {
    if (!doc?.querySelector(".cv-document")) return null;
    doc.documentElement.dataset.editorTheme = theme;
    let layer = doc.getElementById("cv-highlight-layer");
    if (!layer) {
        const style = doc.createElement("style");
        style.textContent = `
            .cv-page-label { color: #626b7a; }
            html[data-editor-theme="dark"] .cv-page-label { color: #a1a1aa; }
            #cv-highlight-layer { position: absolute; inset: 0; pointer-events: none; }
            .cv-field-highlight { position: absolute; border: 1.5px solid #2563eb; border-radius: 4px;
                background: #3b82f614; box-shadow: 0 0 0 3px #3b82f614; }
            @media print { #cv-highlight-layer { display: none !important; } }
        `;
        doc.head.append(style);
        layer = doc.createElement("div");
        layer.id = "cv-highlight-layer";
        layer.setAttribute("aria-hidden", "true");
        doc.body.append(layer);
    }
    layer.replaceChildren();
    if (!key) return null;
    const fields = [...doc.querySelectorAll("[data-cv-field]")];
    let matches = fields.filter((element) => element.dataset.cvField === key);
    // Single-column templates show link text without a separate label.
    if (!matches.length && key.startsWith("links.") && key.endsWith(".label")) {
        matches = fields.filter((element) => element.dataset.cvField === key.replace(/\.label$/, ".value"));
    }
    let first = null;
    for (const element of matches) {
        const rect = element.getBoundingClientRect();
        const box = doc.createElement("div");
        box.className = "cv-field-highlight";
        // An empty field gets a small insertion marker at its intended position.
        const width = Math.max(16, rect.width);
        const height = Math.max(16, rect.height);
        box.style.cssText = `left:${Math.max(0, rect.left - 4)}px;top:${Math.max(0, rect.top - 3)}px;width:${width + 8}px;height:${height + 6}px`;
        layer.append(box);
        first ||= { top: rect.top, left: rect.left, width, height };
    }
    return first;
}
