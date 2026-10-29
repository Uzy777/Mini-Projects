export const PAGE_WIDTH = 210 * 96 / 25.4;

const PAGE_STYLES = `
    html, body { margin: 0; padding: 0; background: transparent; }
    .cv-document { width: 210mm; margin: 0; padding: 0 !important; background: transparent; color-scheme: light; overflow-wrap: anywhere; }
    .cv-page { margin: 0 0 24px; }
    .cv-page:last-child { margin-bottom: 0; }
    .cv-page-label { font: 12px/1.5 Arial, sans-serif; color: #69736d; padding: 0 0 8px; }
    .cv-sheet { box-sizing: border-box; width: 210mm; height: 297mm; padding: 14mm; background: white; color: #222; }
    .cv-sheet .page { max-width: none; margin: 0; padding: 0; }
    .cv-continuation { margin-top: 0 !important; }
    li.cv-continuation { list-style: none; }
    @page { size: A4; margin: 0; }
    @media print {
        .cv-document { padding: 0 !important; }
        .cv-page { margin: 0; break-inside: avoid; break-after: page; }
        .cv-page:last-child { break-after: auto; }
        .cv-page-label { display: none; }
        .cv-sheet { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
`;

const keepWithNext = (node) => node.nodeType === 1 && node.matches("h2, h3, .job-top, .job-header, .job-sub, .meta, .qual-title");
const meaningful = (node) => node.nodeType === 1 || Boolean(node.textContent.trim());

// Split through text nodes so links, emphasis and literal user text survive.
function splitText(element, offset) {
    const doc = element.ownerDocument;
    const walker = doc.createTreeWalker(element, 4);
    let textNode = walker.nextNode();
    let remaining = offset;
    while (textNode && remaining > textNode.length) {
        remaining -= textNode.length;
        textNode = walker.nextNode();
    }
    const first = element.cloneNode(false);
    const rest = element.cloneNode(false);
    const range = doc.createRange();
    range.selectNodeContents(element);
    range.setEnd(textNode, remaining);
    first.append(range.cloneContents());
    range.selectNodeContents(element);
    range.setStart(textNode, remaining);
    rest.append(range.cloneContents());
    rest.classList.add("cv-continuation");
    return [first, rest];
}

function appendText(element, parent, fits) {
    const text = element.textContent;
    if (!text.length) return element;
    // Prefer whole words. Fall back to characters for a word longer than a page.
    const boundaries = [...text.matchAll(/\s+/g)].map((match) => match.index + match[0].length);
    if (boundaries.at(-1) !== text.length) boundaries.push(text.length);
    const findFit = (positions) => {
        let low = 0;
        let high = positions.length - 1;
        let best = 0;
        while (low <= high) {
            const middle = Math.floor((low + high) / 2);
            const [part] = splitText(element, positions[middle]);
            parent.append(part);
            const fitsHere = fits();
            part.remove();
            if (fitsHere) { best = positions[middle]; low = middle + 1; }
            else high = middle - 1;
        }
        return best;
    };
    let offset = findFit(boundaries);
    if (!offset && boundaries[0] > 1) {
        let length = 0;
        const characters = Array.from(text.slice(0, boundaries[0]), (character) => (length += character.length));
        offset = findFit(characters);
    }
    if (!offset) return element;
    const [first, rest] = splitText(element, offset);
    parent.append(first);
    return rest.textContent.length ? rest : null;
}

function appendFragment(element, parent, fits) {
    const whole = element.cloneNode(true);
    parent.append(whole);
    if (fits()) return null;
    whole.remove();
    if (keepWithNext(element)) return element;

    // Paragraphs and list items can continue at a word boundary. Containers split
    // between their blocks first, avoiding an oversized unbreakable job entry.
    const hasBlocks = [...element.children].some((child) => child.matches("section, article, div, p, ul, ol, li, h2, h3"));
    if (!hasBlocks) return appendText(element, parent, fits);

    const part = element.cloneNode(false);
    const rest = element.cloneNode(false);
    rest.classList.add("cv-continuation");
    parent.append(part);
    const children = [...element.childNodes].filter(meaningful);
    for (let index = 0; index < children.length; index += 1) {
        const child = children[index];
        if (child.nodeType !== 1) {
            part.append(child.cloneNode(true));
            continue;
        }
        const remainder = appendFragment(child, part, fits);
        if (remainder) {
            rest.append(remainder);
            rest.append(...children.slice(index + 1).map((node) => node.cloneNode(true)));
            while (part.lastElementChild && (keepWithNext(part.lastElementChild) || !part.lastElementChild.textContent.trim())) {
                rest.prepend(part.lastElementChild);
            }
            if (!part.textContent.trim()) part.remove();
            return rest;
        }
    }
    return null;
}

/** Paginate in the preview's own document, with its fonts and without app CSS. */
export function paginateDocument(doc) {
    const style = doc.querySelector("style");
    // Give the template's body typography an explicit root, also usable inside
    // the isolated print shadow root. The template sources are controlled CSS.
    style.textContent = style.textContent.replace(/\bbody\b/g, ".cv-document");
    const pageStyle = doc.createElement("style");
    pageStyle.textContent = PAGE_STYLES;
    doc.head.append(pageStyle);

    const header = doc.querySelector("header");
    const main = doc.querySelector("main");
    const twoColumns = main.classList.contains("main");
    const sources = twoColumns ? [...main.children] : [main];
    const queues = sources.map((source) => [...source.children].map((element) => element.cloneNode(true)));
    const root = doc.createElement("div");
    root.className = "cv-document";
    doc.body.replaceChildren(root);
    const pages = [];

    function addPage() {
        const page = doc.createElement("div");
        page.className = "cv-page";
        const label = doc.createElement("div");
        label.className = "cv-page-label";
        label.textContent = `Page ${pages.length + 1}`;
        const sheet = doc.createElement("div");
        sheet.className = "cv-sheet";
        if (!pages.length) sheet.append(header.cloneNode(true));
        const pageMain = main.cloneNode(false);
        sheet.append(pageMain);
        const columns = twoColumns ? sources.map((source) => {
            const column = source.cloneNode(false);
            pageMain.append(column);
            return column;
        }) : [pageMain];
        page.append(label, sheet);
        root.append(page);
        const padding = parseFloat(doc.defaultView.getComputedStyle(sheet).paddingBottom);
        // Leave a pixel for fractional CSS millimetre rounding between engines.
        const bottom = sheet.getBoundingClientRect().bottom - padding - 1;
        const result = { columns, bottom };
        pages.push(result);
        return result;
    }

    addPage();
    queues.forEach((queue, columnIndex) => {
        let pageIndex = 0;
        let failures = 0;
        while (queue.length) {
            const page = pages[pageIndex] || addPage();
            const column = page.columns[columnIndex];
            const before = column.textContent.length;
            const remainder = appendFragment(queue[0], column, () => column.getBoundingClientRect().bottom <= page.bottom);
            if (!remainder) { queue.shift(); failures = 0; }
            else {
                queue[0] = remainder;
                failures = column.textContent.length > before ? 0 : failures + 1;
                if (failures > 1) throw new Error("This entry cannot fit on an A4 page. Shorten its heading and try again.");
                pageIndex += 1;
            }
        }
    });

    const styles = [...doc.querySelectorAll("style")].map((element) => element.textContent).join("\n");
    return { styles, html: root.outerHTML, pageCount: pages.length, height: Math.ceil(root.getBoundingClientRect().height) };
}

export function printPages(pages) {
    document.getElementById("cv-print-document")?.remove();
    const host = document.createElement("div");
    host.id = "cv-print-document";
    const shadow = host.attachShadow({ mode: "open" });
    const styles = document.createElement("style");
    styles.textContent = `:host { all: initial; display: block; }\n${pages.styles}`;
    shadow.append(styles);
    const content = document.createElement("div");
    content.innerHTML = pages.html;
    shadow.append(content);
    document.body.append(host);
    document.body.classList.add("cv-printing");
    const cleanup = () => {
        host.remove();
        document.body.classList.remove("cv-printing");
    };
    window.addEventListener("afterprint", cleanup, { once: true });
    window.print();
}
