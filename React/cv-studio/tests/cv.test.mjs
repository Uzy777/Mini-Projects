import { after, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import { moveSection, sectionHasContent } from "../src/sections.js";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
after(() => server.close());
const { blankCv, exampleCv, normalizeCv, parseCv, renderCv, toYaml, TEMPLATES } = await server.ssrLoadModule("/src/cv.js");
const sectionIds = (html) => [...html.matchAll(/data-cv-section="([^"]+)"/g)].map((match) => match[1]);
const body = (html) => html.split("<body>")[1];
const configure = (cv, id, changes) => { Object.assign(cv.sections.find((item) => item.id === id), changes); };

// Exercise old files and the real renderer, including every supplied layout.
test("a fresh CV has no imposed sections; old CVs retain populated sections", () => {
    assert.equal(blankCv.sections.some((item) => item.enabled), false);
    const legacy = normalizeCv({ name: "Alex", projects: [{ name: "Portfolio" }], contact: { github: "alex" } });
    assert.equal(legacy.sections.find((item) => item.id === "projects").enabled, true);
    assert.equal(legacy.sections.find((item) => item.id === "experience").enabled, false);
    assert.equal(legacy.links[0].value, "alex");
    assert.equal(exampleCv.sections.find((item) => item.id === "education").enabled, true);
});

test("backup and reload preserve hidden content, order, titles, columns and custom sections", () => {
    const cv = normalizeCv({ projects: [{ name: "Keep me", hidden: true }], customSections: [{ id: "custom-awards", content: "First prize\nSecond prize" }], links: [{ platform: "github", value: "alex", hidden: true }], contactVisibility: { email: false } });
    configure(cv, "projects", { enabled: false, title: "Selected work", column: "sidebar" });
    configure(cv, "custom-awards", { title: "Awards", enabled: true });
    cv.sections.reverse();
    const restored = parseCv(toYaml(cv));
    assert.deepEqual(restored.sections, cv.sections);
    assert.deepEqual(restored.customSections, cv.customSections);
    assert.equal(restored.projects[0].name, "Keep me");
    assert.equal(restored.projects[0].hidden, true);
    assert.equal(restored.links[0].hidden, true);
    assert.equal(restored.contactVisibility.email, false);
    assert.deepEqual(normalizeCv(JSON.parse(JSON.stringify(cv))), cv);
});

test("malformed section settings and duplicate custom IDs normalize without losing content", () => {
    const cv = normalizeCv({ customSections: [{ id: "awards", content: "One" }, { id: "custom-awards", content: "Two" }], sections: [null, {}, { id: "projects", title: 42, column: "invalid" }, { id: "projects" }, { id: "unknown" }] });
    assert.equal(new Set(cv.sections.map((item) => item.id)).size, cv.sections.length);
    assert.equal(new Set(cv.customSections.map((item) => item.id)).size, 2);
    assert.deepEqual(cv.customSections.map((item) => item.content), ["One", "Two"]);
    assert.equal(cv.sections[0].title, "Projects");
    assert.equal(cv.sections[0].column, "main");
});

test("moving skips hidden sections and respects column boundaries", () => {
    const cv = normalizeCv({ summary: "Hello", experience: [{ role: "Designer" }], projects: [{ name: "Work" }], skills: ["Drawing"] });
    configure(cv, "experience", { enabled: false });
    const moved = moveSection(cv.sections, "projects", -1, "main");
    assert.deepEqual(moved.filter((item) => item.enabled && item.column === "main").map((item) => item.id), ["projects", "summary"]);
    assert.equal(moveSection(moved, "projects", -1, "main"), moved);
    assert.equal(moved.find((item) => item.id === "skills").column, "sidebar");
});

for (const { id } of TEMPLATES) {
    test(`${id}: hidden and empty sections disappear, showing again restores content`, () => {
        const cv = normalizeCv({ name: "Alex", summary: "About Alex", projects: [{ name: "Private project" }], education: [{}], skills: [" "] });
        configure(cv, "education", { enabled: true });
        configure(cv, "skills", { enabled: true });
        configure(cv, "projects", { enabled: false });
        const html = renderCv(cv, id);
        assert.deepEqual(sectionIds(html), ["summary"]);
        assert.ok(!body(html).includes("Private project"));
        configure(cv, "projects", { enabled: true });
        assert.ok(body(renderCv(cv, id)).includes("Private project"));
        assert.deepEqual(sectionIds(renderCv(blankCv, id)), []);
    });

    test(`${id}: renamed and custom sections follow chosen order and escape HTML`, () => {
        const cv = normalizeCv({ summary: "Intro", projects: [{ name: "Project" }], customSections: [{ id: "custom-one", content: "Line one\n<script>bad()</script>" }] });
        for (const section of cv.sections) section.column = "main";
        configure(cv, "custom-one", { title: "Awards <img src=x>" });
        configure(cv, "projects", { title: "Selected work" });
        cv.sections = moveSection(cv.sections, "custom-one", -1);
        cv.sections = moveSection(cv.sections, "custom-one", -1);
        const html = renderCv(cv, id);
        assert.deepEqual(sectionIds(html), ["custom-one", "summary", "projects"]);
        assert.ok(html.includes("Selected work"));
        assert.ok(html.includes("Awards &lt;img src=x&gt;"));
        assert.ok(html.includes("Line one\n&lt;script&gt;bad()&lt;/script&gt;"));
        assert.ok(!html.includes("<script>"));
    });

    test(`${id}: hidden entries retain field indices and header/contact visibility is respected`, () => {
        const cv = normalizeCv({ name: "Secret Name", title: "Secret Title", header: { name: false, title: false }, contact: { email: "secret@example.com", phone: "1234" }, contactVisibility: { email: false }, projects: [{ name: "Hidden work", hidden: true }, { name: "Visible work" }], links: [{ platform: "github", value: "hidden-account", hidden: true }] });
        const html = body(renderCv(cv, id));
        for (const hidden of ["Secret Name", "Secret Title", "secret@example.com", "Hidden work", "hidden-account"]) assert.ok(!html.includes(hidden), hidden);
        assert.ok(html.includes('data-cv-field="projects.1.name"'));
        assert.ok(html.includes("Visible work"));
        cv.projects[1].hidden = true;
        assert.ok(!sectionIds(renderCv(cv, id)).includes("projects"));
        cv.contactVisibility.phone = false;
        assert.equal(sectionHasContent(cv, "contact"), false);
        assert.ok(!sectionIds(renderCv(cv, id)).includes("contact"));
    });
}

test("the initial section setup renders for both fresh and existing local drafts", async () => {
    const React = await import("react");
    const { renderToString } = await import("react-dom/server");
    const { default: App } = await server.ssrLoadModule("/src/App.jsx");
    globalThis.matchMedia = () => ({ matches: false });
    try {
        for (const draft of [null, exampleCv]) {
            globalThis.localStorage = { getItem: (key) => key === "cv-studio-draft-v1" && draft ? JSON.stringify(draft) : null };
            const html = renderToString(React.createElement(App));
            assert.ok(html.includes("Your CV, your sections"));
            assert.ok(html.includes("Add a section"));
            assert.ok(html.includes("Custom section"));
            assert.ok(html.includes(draft ? "Hide Projects section" : "A fresh start."));
        }
    } finally {
        delete globalThis.localStorage;
        delete globalThis.matchMedia;
    }
});
