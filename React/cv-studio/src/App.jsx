import { useEffect, useId, useRef, useState } from "react";
import { Eye, EyeOff, ArrowDownToLine, ArrowUp, ArrowDown, Copy, Check, ChevronDown, FileText, FolderOpen, ImagePlus, LayoutTemplate, Moon, PanelLeft, Plus, RotateCcw, ShieldCheck, Sun, Trash2, X } from "lucide-react";
import { blankCv, exampleCv, normalizeCv, parseCv, renderCv, STORAGE_KEY, TEMPLATES, toYaml } from "./cv.js";
import { TemplatePicker } from "./TemplatePicker.jsx";
import { PAGE_WIDTH, paginateDocument, printPages } from "./pagination.js";
import { highlightField } from "./preview-highlight.js";
import { SocialLinks } from "./SocialLinks.jsx";
import { readableAccent, validAccent } from "./accent.js";

import { SectionsPanel } from "./SectionsPanel.jsx";
import { moveSection, sectionHasContent, sectionTitle } from "./sections.js";

const PREFERENCES_KEY = "cv-studio-preferences-v1";
const emptyItems = {
    experience: { role: "", company: "", location: "", type: "", start: "", end: "", info: "", bullets: [], tech: [] },
    projects: { name: "", description: "", bullets: [], tech: [], link: "" },
    education: { institution: "", course: "", start: "", end: "" },
    certifications: { title: "", issuer: "", issued: "" },
    volunteering: { role: "", organization: "", start: "", end: "", bullets: [] },
};

function loadDraft() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? normalizeCv(JSON.parse(stored)) : blankCv;
    } catch { return blankCv; }
}
function loadPreferences() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(PREFERENCES_KEY)) || {}; } catch { /* Use device defaults. */ }
    return {
        theme: ["light", "dark"].includes(saved.theme) ? saved.theme : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
        template: TEMPLATES.some((item) => item.id === saved.template) ? saved.template : "original",
        accent: validAccent(saved.accent),
    };
}
function download(filename, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Field({ fieldKey, label, value, onChange, multiline = false, hint, placeholder, type = "text", count }) {
    const id = useId();
    const props = { id, value, placeholder, "data-preview-field": fieldKey, onChange: (event) => onChange(event.target.value), "aria-describedby": hint ? `${id}-hint` : undefined };
    return <div className="field">
        <label htmlFor={id}>{label}{count !== undefined && <span className="field-count">{count}</span>}</label>
        {multiline ? <textarea {...props} rows={4} /> : <input {...props} type={type} />}
        {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
    </div>;
}
function ListField({ fieldKey, label, values, onChange, hint }) {
    return <Field fieldKey={fieldKey} label={label} count={values.filter((value) => value.trim()).length} value={values.join("\n")} onChange={(value) => onChange(value ? value.split("\n") : [])} multiline hint={hint || "One item per line"} />;
}
function ItemCard({ title, subtitle, onRemove, onMoveUp, onMoveDown, onDuplicate, hidden, onToggle, children, initiallyOpen = false }) {
    const [open, setOpen] = useState(initiallyOpen);
    const id = useId();
    return <article className={`item-card ${hidden ? "entry-hidden" : ""}`}>
        <div className="item-card-header"><button type="button" className="item-heading" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
            <span className="min-w-0"><span className="block truncate text-sm font-semibold">{title}{hidden && <span className="ml-2 text-xs font-normal text-muted">Hidden</span>}</span>{subtitle && <span className="mt-1 block truncate text-xs text-muted">{subtitle}</span>}</span>
            <ChevronDown size={17} className={`shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button><div className="entry-actions">
            <button className="entry-action" type="button" onClick={onToggle} title={hidden ? "Show entry" : "Hide entry, keep content"} aria-label={`${hidden ? "Show" : "Hide"} ${title}`} >{hidden ? <Eye size={14} /> : <EyeOff size={14} />}</button>
            <button className="entry-action" type="button" disabled={!onMoveUp} onClick={onMoveUp} title="Move up" aria-label={`Move ${title} up`}><ArrowUp size={14} /></button>
            <button className="entry-action" type="button" disabled={!onMoveDown} onClick={onMoveDown} title="Move down" aria-label={`Move ${title} down`}><ArrowDown size={14} /></button>
            <button className="entry-action" type="button" onClick={onDuplicate} title="Duplicate entry" aria-label={`Duplicate ${title}`}><Copy size={14} /></button>
        </div></div>
        {open && <div id={id} className="item-content panel-enter">{children}<button className="button-quiet text-danger" type="button" onClick={onRemove} aria-label={`Remove ${title}`}><Trash2 size={14} />Remove entry</button></div>}
    </article>;
}
function Collection({ title, description, items, onAdd, renderItem, addLabel, focusId }) {
    const listRef = useRef(null);
    useEffect(() => {
        const entry = [...listRef.current.children].find((element) => element.dataset.entryId === focusId);
        const input = entry?.querySelector("input, textarea");
        input?.focus({ preventScroll: true });
        input?.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }, [focusId]);
    return <>
        <div className="section-intro"><h2>{title}</h2><p>{description}</p></div>
        <div className="space-y-3" ref={listRef}>{items.length ? items.map((item, index) => <div key={item.id} data-entry-id={item.id}>{renderItem(item, index)}</div>) : <p className="empty-state">No entries yet.</p>}</div>
        <button className="add-button" type="button" onClick={onAdd}><Plus size={16} />{addLabel}</button>
    </>;
}

export default function App() {
    const [cv, setCv] = useState(loadDraft);
    const [preferences, setPreferences] = useState(loadPreferences);
    const [section, setSection] = useState("sections");
    const [resetKind, setResetKind] = useState("blank");
    const [mode, setMode] = useState("content");
    const [mobileView, setMobileView] = useState("editor");
    const [zoom, setZoom] = useState("fit");
    const [previewHtml, setPreviewHtml] = useState(() => renderCv(cv, preferences.template, preferences.accent));
    const [saveMessage, setSaveMessage] = useState("Saved locally");
    const [notice, setNotice] = useState("");
    const [undoCv, setUndoCv] = useState(null);
    const [newEntryId, setNewEntryId] = useState(null);
    const [previewScale, setPreviewScale] = useState(1);
    const [previewHeight, setPreviewHeight] = useState(1123);
    const [pageCount, setPageCount] = useState(0);
    const [preparingPdf, setPreparingPdf] = useState(false);
    const pagesRef = useRef(null);
    const previewFrameRef = useRef(null);
    const activeFieldRef = useRef(null);
    const pendingPrintRef = useRef(null);
    const paperRef = useRef(null);
    const editorScrollRef = useRef(null);
    const fileRef = useRef(null);
    const photoRef = useRef(null);
    const fileMenuRef = useRef(null);
    const resetRef = useRef(null);
    const template = TEMPLATES.find((item) => item.id === preferences.template);
    const activeSection = cv.sections.find((item) => item.id === section && item.enabled);
    const customIndex = cv.customSections.findIndex((item) => item.id === section);
    const twoColumns = ["original", "structured"].includes(preferences.template);
    const hasVisibleContent = (cv.header.name && cv.name.trim()) || (cv.header.title && cv.title.trim()) || (preferences.template === "modern" && cv.header.photo && cv.photo) || cv.sections.some((item) => item.enabled && sectionHasContent(cv, item.id));
    const scale = zoom === "fit" ? previewScale : 1;

    useEffect(() => {
        const paper = paperRef.current;
        const observer = new ResizeObserver(() => {
            if (paper.clientWidth > 48) setPreviewScale(Math.min(1, (paper.clientWidth - 48) / PAGE_WIDTH));
        });
        observer.observe(paper);
        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        document.documentElement.dataset.theme = preferences.theme;
        document.documentElement.style.setProperty("--accent", readableAccent(preferences.accent, preferences.theme === "dark" ? "#191b20" : "#ffffff"));
        document.documentElement.style.setProperty("--accent-filled", readableAccent(preferences.accent, "#ffffff"));
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", preferences.theme === "dark" ? "#191b20" : "#ffffff");
        try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences)); }
        catch { setNotice("Preferences could not be saved in this browser."); }
    }, [preferences]);
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeCv(cv)));
            setSaveMessage("Saved locally");
        } catch { setSaveMessage("Save unavailable — export a backup"); }
    }, [cv]);
    useEffect(() => {
        const timer = window.setTimeout(() => setPreviewHtml(renderCv(cv, preferences.template, preferences.accent)), 180);
        return () => window.clearTimeout(timer);
    }, [cv, preferences.template, preferences.accent]);
    useEffect(() => {
        const closeMenu = (event) => {
            if (fileMenuRef.current && !fileMenuRef.current.contains(event.target)) fileMenuRef.current.open = false;
        };
        document.addEventListener("pointerdown", closeMenu);
        return () => document.removeEventListener("pointerdown", closeMenu);
    }, []);

    function showField(scroll = false) {
        const frame = previewFrameRef.current;
        const viewport = paperRef.current;
        const rect = highlightField(frame?.contentDocument, activeFieldRef.current, preferences.theme, preferences.accent);
        if (!scroll || !rect || !viewport?.clientHeight) return;
        const frameBounds = frame.getBoundingClientRect();
        const bounds = viewport.getBoundingClientRect();
        const top = frameBounds.top + rect.top * scale;
        const left = frameBounds.left + rect.left * scale;
        const outsideY = top < bounds.top + 20 || top + rect.height * scale > bounds.bottom - 20;
        const outsideX = left < bounds.left + 20 || left + rect.width * scale > bounds.right - 20;
        if (outsideY || outsideX) viewport.scrollBy({
            top: outsideY ? top - bounds.top - 72 : 0,
            left: outsideX ? left - bounds.left - 24 : 0,
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        });
    }
    useEffect(() => {
        activeFieldRef.current = null;
        showField();
        if (editorScrollRef.current) editorScrollRef.current.scrollTop = 0;
    }, [section, mode]);
    useEffect(() => { showField(mobileView === "preview"); }, [scale, mobileView, preferences.theme, preferences.accent, previewHeight]);

    useEffect(() => {
        if (!["sections", "basics"].includes(section) && !activeSection) setSection("sections");
    }, [section, activeSection]);

    const edit = (change) => { setUndoCv(null); setNotice(""); setCv(change); };
    const update = (key, value) => edit((current) => ({ ...current, [key]: value }));
    const updateContact = (key, value) => edit((current) => ({ ...current, contact: { ...current.contact, [key]: value } }));
    const updateItem = (group, index, key, value) => edit((current) => ({ ...current, [group]: current[group].map((item, position) => position === index ? { ...item, [key]: value } : item) }));
    function structuralEdit(group, items, message) {
        activeFieldRef.current = null;
        showField();
        setUndoCv(cv);
        setCv((current) => ({ ...current, [group]: items }));
        setNotice(message);
    }
    function changeSection(id, changes, message) {
        const next = cv.sections.map((item) => item.id === id ? { ...item, ...changes } : item);
        if (message) structuralEdit("sections", next, message);
        else update("sections", next);
    }
    function toggleSection(id, enabled) {
        changeSection(id, { enabled }, enabled ? "Section added. Select it to edit your content." : "Section hidden. Your content is kept.");
        if (!enabled && section === id) setSection("sections");
    }
    function addCustomSection(title) {
        const id = `custom-${crypto.randomUUID()}`;
        setUndoCv(cv);
        setCv((current) => ({ ...current, customSections: [...current.customSections, { id, content: "" }], sections: [...current.sections, { id, title, enabled: true, column: "main" }] }));
        setSection(id);
        setNotice("Custom section added.");
    }
    function addItem(group) {
        const id = crypto.randomUUID();
        setNewEntryId(id);
        structuralEdit(group, [...cv[group], { ...structuredClone(emptyItems[group]), id }], "Entry added.");
    }
    function moveItem(group, index, direction) {
        const next = index + direction;
        if (next < 0 || next >= cv[group].length) return;
        const items = [...cv[group]];
        [items[index], items[next]] = [items[next], items[index]];
        structuralEdit(group, items, `Entry moved ${direction < 0 ? "up" : "down"}.`);
    }
    function duplicateItem(group, index) {
        const id = crypto.randomUUID();
        const items = [...cv[group]];
        items.splice(index + 1, 0, { ...structuredClone(items[index]), id });
        setNewEntryId(id);
        structuralEdit(group, items, "Entry duplicated.");
    }
    function addLink(platform) {
        const id = crypto.randomUUID();
        structuralEdit("links", [...cv.links, { id, platform, label: "", value: "" }], "Link added.");
        return id;
    }
    const removeItem = (group, index) => {
        activeFieldRef.current = null;
        showField();
        setUndoCv(cv);
        setCv((current) => ({ ...current, [group]: current[group].filter((_, position) => position !== index) }));
        setNotice("Entry removed.");
    };
    const fileAction = (action) => { fileMenuRef.current.open = false; action(); };
    async function importFile(event) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        if (file.size > 1024 * 1024) { setNotice("Choose a CV file under 1 MB."); return; }
        try {
            const imported = parseCv(await file.text(), file.name);
            activeFieldRef.current = null;
            setUndoCv(cv);
            setCv(imported);
            setSection("sections");
            setMode("content");
            setNotice(`Imported ${file.name}.`);
        } catch (error) { setNotice(error.message); }
    }
    async function importPhoto(event) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 8 * 1024 * 1024) {
            setNotice("Choose a JPG, PNG, or WebP photo under 8 MB.");
            return;
        }
        const url = URL.createObjectURL(file);
        try {
            const image = new Image();
            image.src = url;
            await image.decode();
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 360;
            const context = canvas.getContext("2d");
            if (!context) throw new Error("Photo processing is unavailable in this browser.");
            const side = Math.min(image.naturalWidth, image.naturalHeight);
            context.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, 360, 360);
            const data = canvas.toDataURL("image/jpeg", 0.8);
            if (data.length >= 350000) throw new Error("This photo is too large to save. Try a simpler image.");
            edit((current) => ({ ...current, photo: data }));
            setNotice("Photo added to the Modern layout.");
        } catch (error) { setNotice(error.message || "Could not read this photo."); }
        finally { URL.revokeObjectURL(url); }
    }
    function printCv() {
        const latest = renderCv(cv, preferences.template, preferences.accent);
        if (pagesRef.current?.source !== latest) {
            pendingPrintRef.current = latest;
            setPreparingPdf(true);
            setPreviewHtml(latest);
            return;
        }
        printPages(pagesRef.current);
    }
    function preparePreview(event) {
        try {
            const frame = event.currentTarget;
            const pages = paginateDocument(frame.contentDocument);
            pagesRef.current = { ...pages, source: frame.srcdoc };
            setPreviewHeight(pages.height);
            setPageCount(pages.pageCount);
            showField();
            if (pendingPrintRef.current === frame.srcdoc) {
                pendingPrintRef.current = null;
                setPreparingPdf(false);
                printPages(pages);
            }
        } catch (error) {
            pagesRef.current = null;
            pendingPrintRef.current = null;
            setPreparingPdf(false);
            setPageCount(0);
            setNotice(error.message);
        }
    }
    function reset() {
        activeFieldRef.current = null;
        setUndoCv(cv);
        setCv(resetKind === "blank" ? blankCv : exampleCv);
        setSection("sections");
        setMode("content");
        setNotice(resetKind === "blank" ? "Blank CV started. You can undo this change." : "Example CV loaded.");
        resetRef.current.close();
    }

    return <div className="app-shell bg-canvas text-ink transition-colors duration-200">
        <a className="skip-link" href="#editor">Skip to editor</a>
        <header className="app-header">
            <span className="save-status" role="status"><Check size={14} /><span>{saveMessage}</span></span>
            <div className="flex items-center gap-2 sm:gap-3">
                <button className="icon-button" type="button" aria-label={`Switch to ${preferences.theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${preferences.theme === "dark" ? "light" : "dark"} mode`} onClick={() => setPreferences((current) => ({ ...current, theme: current.theme === "dark" ? "light" : "dark" }))}>{preferences.theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>
                <details ref={fileMenuRef} className="relative" onKeyDown={(event) => { if (event.key === "Escape") { fileMenuRef.current.open = false; fileMenuRef.current.querySelector("summary").focus(); } }}>
                    <summary className="button-secondary list-none" aria-label="File actions"><FolderOpen size={16} /><span className="hidden sm:inline">File</span><ChevronDown size={13} className="hidden sm:block" /></summary>
                    <div className="file-menu panel-enter">
                        <button onClick={() => fileAction(() => fileRef.current?.click())}><FolderOpen size={16} />Import YAML / JSON</button>
                        <button onClick={() => fileAction(() => download("cv.yaml", toYaml(cv), "text/yaml"))}><ArrowDownToLine size={16} />Export YAML backup</button>
                        <div className="my-1 border-t border-line" />
                        <button onClick={() => fileAction(() => { setResetKind("blank"); resetRef.current.showModal(); })}><Plus size={16} />Start a blank CV</button>
                        <button onClick={() => fileAction(() => { setResetKind("example"); resetRef.current.showModal(); })}><RotateCcw size={16} />Load example CV</button>
                    </div>
                </details>
                <button className="button-primary" type="button" onClick={printCv} disabled={preparingPdf || pageCount === 0 || !hasVisibleContent}><ArrowDownToLine size={16} /><span>{preparingPdf ? "Preparing PDF…" : "Save PDF"}</span></button>
            </div>
        </header>
        <div className="mobile-switch" role="group" aria-label="Workspace view">
            <button aria-pressed={mobileView === "editor"} onClick={() => setMobileView("editor")}><PanelLeft size={15} />Editor</button>
            <button aria-pressed={mobileView === "preview"} onClick={() => setMobileView("preview")}><FileText size={15} />Preview</button>
        </div>
        <main className="workspace">
            <section className={`editor ${mobileView === "preview" ? "hidden lg:flex" : "flex"}`} id="editor" aria-label="CV editor" onFocusCapture={(event) => {
                const key = event.target.dataset.previewField;
                if (key) { activeFieldRef.current = key; showField(true); }
            }}>
                <div className="editor-toolbar">
                    <div className="mode-switch" role="group" aria-label="Editor view">
                        <button aria-pressed={mode === "content"} onClick={() => setMode("content")}><PanelLeft size={15} />Edit CV</button>
                        <button aria-pressed={mode === "templates"} onClick={() => setMode("templates")}><LayoutTemplate size={15} />Design</button>
                    </div>
                    <span className="hidden text-[11px] text-muted sm:block">Local draft</span>
                </div>
                {mode === "content" && <nav className="section-navigation" aria-label="CV sections">
                    <button className="sections-overview" type="button" aria-current={section === "sections" ? "page" : undefined} onClick={() => { setNewEntryId(null); setSection("sections"); }}><PanelLeft size={16} /><span>Your sections</span></button>
                    <div className="section-select">
                        <label htmlFor="editor-section">Jump to section</label>
                        <select id="editor-section" value={(activeSection || ["sections", "basics"].includes(section)) ? section : "sections"} onChange={(event) => { setNewEntryId(null); setSection(event.target.value); }}>
                            <option value="sections">Section overview</option>
                            <option value="basics">Name &amp; headline</option>
                            {cv.sections.some((item) => item.enabled) && <optgroup label="Included sections">
                                {cv.sections.filter((item) => item.enabled).map((entry) => <option key={entry.id} value={entry.id}>{sectionTitle(entry)}</option>)}
                            </optgroup>}
                        </select>
                    </div>
                </nav>}
                <div className="editor-scroll" ref={editorScrollRef}>
                    <div key={`${mode}-${section}`} className="editor-content panel-enter">
                        {mode === "templates" ? <TemplatePicker selected={preferences.template} accent={preferences.accent} onAccentChange={(accent) => setPreferences((current) => ({ ...current, accent }))} onSelect={(id) => setPreferences((current) => ({ ...current, template: id }))} /> : <>
                    {section === "sections" && <SectionsPanel cv={cv} twoColumns={twoColumns} onEdit={setSection} onToggle={toggleSection} onMove={(id, direction, column) => structuralEdit("sections", moveSection(cv.sections, id, direction, column), "Section moved.")} onColumn={(id, column) => changeSection(id, { column }, "Section moved to the other column.")} onCustom={addCustomSection} />}
                    {activeSection && <div className="section-settings">
                        <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-semibold text-muted">Section settings</span><button className="button-quiet" onClick={() => toggleSection(section, false)}><EyeOff size={14} />Hide section</button></div>
                        <Field label="Section heading" fieldKey={`sections.${cv.sections.indexOf(activeSection)}.title`} value={activeSection.title} placeholder={sectionTitle(activeSection)} onChange={(title) => changeSection(section, { title })} />
                    </div>}
                    {customIndex >= 0 && activeSection && <Field fieldKey={`customSections.${customIndex}.content`} label="Content" value={cv.customSections[customIndex].content} onChange={(value) => updateItem("customSections", customIndex, "content", value)} multiline hint="Use your own words. Line breaks are kept in the CV; you can paste bullet points too." />}
                    {section === "basics" && <>
                        <div className="section-intro"><h2>Name & headline</h2><p>Use the details you want to share. All fields are optional.</p></div>
                        <div className="field-grid"><Field fieldKey="name" label="Full name" value={cv.name} onChange={(value) => update("name", value)} placeholder="Your name" /><Field fieldKey="title" label="Headline or job title" value={cv.title} onChange={(value) => update("title", value)} placeholder="Your role" /></div>
                        <div className="header-options">{["name", "title"].map((key) => <label key={key}><input type="checkbox" checked={cv.header[key]} onChange={(event) => update("header", { ...cv.header, [key]: event.target.checked })} />Show {key === "name" ? "name" : "headline"} on CV</label>)}</div>
                        {preferences.template === "modern" && <div className="photo-panel">
                            <div className="photo-preview">{cv.photo ? <img src={cv.photo} alt="Your profile photo" /> : <ImagePlus size={20} aria-hidden="true" />}</div>
                            <div className="min-w-0"><h3 className="text-xs font-semibold">Profile photo</h3><p className="mt-1 text-[11px] leading-relaxed text-muted">Optional. Shown in the Modern layout only. The image stays in your local draft and YAML backup.</p>
                                <div className="mt-3 flex flex-wrap gap-2"><button className="button-secondary" type="button" data-preview-field="photo" onClick={() => photoRef.current?.click()}>{cv.photo ? "Change photo" : "Add photo"}</button>{cv.photo && <button className="button-quiet text-danger" type="button" onClick={() => update("photo", "")}>Remove</button>}</div>
                            </div>
                        </div>}
                        {preferences.template === "modern" && cv.photo && <label className="visibility-option"><input type="checkbox" checked={cv.header.photo} onChange={(event) => update("header", { ...cv.header, photo: event.target.checked })} />Show photo on CV</label>}
                    </>}
                    {section === "summary" && <Field fieldKey="summary" label="Introduction" value={cv.summary} onChange={(value) => update("summary", value)} multiline hint="A short summary, personal statement or objective — your choice." />}
                    {section === "contact" && <>
                        <div className="section-intro"><h2>{sectionTitle(activeSection)}</h2><p>Include only the details you want to share. Leave any field blank to omit it.</p></div>
                        <Field fieldKey="contact.location" label="Location" value={cv.contact.location} onChange={(value) => updateContact("location", value)} placeholder="City, country" />
                        <h3 className="form-subheading">Contact</h3>
                        <div className="field-grid"><Field fieldKey="contact.email" label="Email" type="email" value={cv.contact.email} onChange={(value) => updateContact("email", value)} /><Field fieldKey="contact.phone" label="Phone" type="tel" value={cv.contact.phone} onChange={(value) => updateContact("phone", value)} /></div>
                        <div className="header-options">{["email", "phone", "location"].map((key) => <label key={key}><input type="checkbox" checked={cv.contactVisibility[key]} onChange={(event) => update("contactVisibility", { ...cv.contactVisibility, [key]: event.target.checked })} />Show {key}</label>)}</div>
                        <SocialLinks links={cv.links} onAdd={addLink} onChange={(index, key, value) => updateItem("links", index, key, value)} onRemove={(index) => removeItem("links", index)} onMove={(index, direction) => moveItem("links", index, direction)} />
                    </>}

                    {section === "experience" && <Collection focusId={newEntryId} title={sectionTitle(activeSection)} description="Add your most recent role first." items={cv.experience} addLabel="Add role" onAdd={() => addItem("experience")} renderItem={(item, index) => <ItemCard hidden={item.hidden} onToggle={() => updateItem("experience", index, "hidden", !item.hidden)} onMoveUp={index > 0 ? () => moveItem("experience", index, -1) : undefined} onMoveDown={index < cv.experience.length - 1 ? () => moveItem("experience", index, 1) : undefined} onDuplicate={() => duplicateItem("experience", index)} initiallyOpen={index === 0 || !item.role || item.id === newEntryId} title={item.role || `Role ${index + 1}`} subtitle={item.company} onRemove={() => removeItem("experience", index)}>
                        <div className="field-grid"><Field fieldKey={`experience.${index}.role`} label="Role" value={item.role} onChange={(value) => updateItem("experience", index, "role", value)} /><Field fieldKey={`experience.${index}.company`} label="Company" value={item.company} onChange={(value) => updateItem("experience", index, "company", value)} /></div>
                        <div className="field-grid"><Field fieldKey={`experience.${index}.location`} label="Location" value={item.location} onChange={(value) => updateItem("experience", index, "location", value)} /><Field fieldKey={`experience.${index}.type`} label="Employment type" value={item.type} onChange={(value) => updateItem("experience", index, "type", value)} /></div>
                        <div className="field-grid"><Field fieldKey={`experience.${index}.start`} label="Start" value={item.start} onChange={(value) => updateItem("experience", index, "start", value)} placeholder="Jan 2024" /><Field fieldKey={`experience.${index}.end`} label="End" value={item.end} onChange={(value) => updateItem("experience", index, "end", value)} placeholder="Present" /></div>
                        <Field fieldKey={`experience.${index}.info`} label="Overview" value={item.info} onChange={(value) => updateItem("experience", index, "info", value)} multiline hint="Optional paragraph before your highlights." />
                        <ListField fieldKey={`experience.${index}.bullets`} label="Highlights" values={item.bullets} onChange={(value) => updateItem("experience", index, "bullets", value)} />
                        <ListField fieldKey={`experience.${index}.tech`} label="Technologies" values={item.tech} onChange={(value) => updateItem("experience", index, "tech", value)} />
                    </ItemCard>} />}

                    {section === "projects" && <Collection focusId={newEntryId} title={sectionTitle(activeSection)} description="Show work that reflects your skills and results." items={cv.projects} addLabel="Add project" onAdd={() => addItem("projects")} renderItem={(item, index) => <ItemCard hidden={item.hidden} onToggle={() => updateItem("projects", index, "hidden", !item.hidden)} onMoveUp={index > 0 ? () => moveItem("projects", index, -1) : undefined} onMoveDown={index < cv.projects.length - 1 ? () => moveItem("projects", index, 1) : undefined} onDuplicate={() => duplicateItem("projects", index)} initiallyOpen={index === 0 || !item.name || item.id === newEntryId} title={item.name || `Project ${index + 1}`} onRemove={() => removeItem("projects", index)}>
                        <Field fieldKey={`projects.${index}.name`} label="Project name" value={item.name} onChange={(value) => updateItem("projects", index, "name", value)} />
                        <Field fieldKey={`projects.${index}.description`} label="Description" value={item.description} onChange={(value) => updateItem("projects", index, "description", value)} multiline />
                        <ListField fieldKey={`projects.${index}.bullets`} label="Highlights" values={item.bullets} onChange={(value) => updateItem("projects", index, "bullets", value)} hint="Optional results or outcomes, one per line" />
                        <ListField fieldKey={`projects.${index}.tech`} label="Technologies" values={item.tech} onChange={(value) => updateItem("projects", index, "tech", value)} />
                        <Field fieldKey={`projects.${index}.link`} label="Project link" value={item.link} onChange={(value) => updateItem("projects", index, "link", value)} placeholder="example.com/project" />
                    </ItemCard>} />}

                    {section === "education" && <>
                        <Collection focusId={newEntryId} title={sectionTitle(activeSection)} description="Degrees, courses and training." items={cv.education} addLabel="Add education" onAdd={() => addItem("education")} renderItem={(item, index) => <ItemCard hidden={item.hidden} onToggle={() => updateItem("education", index, "hidden", !item.hidden)} onMoveUp={index > 0 ? () => moveItem("education", index, -1) : undefined} onMoveDown={index < cv.education.length - 1 ? () => moveItem("education", index, 1) : undefined} onDuplicate={() => duplicateItem("education", index)} initiallyOpen={index === 0 || !item.institution || item.id === newEntryId} title={item.institution || `Education ${index + 1}`} onRemove={() => removeItem("education", index)}>
                            <Field fieldKey={`education.${index}.institution`} label="Institution" value={item.institution} onChange={(value) => updateItem("education", index, "institution", value)} />
                            <Field fieldKey={`education.${index}.course`} label="Course or qualification" value={item.course} onChange={(value) => updateItem("education", index, "course", value)} />
                            <div className="field-grid"><Field fieldKey={`education.${index}.start`} label="Start" value={item.start} onChange={(value) => updateItem("education", index, "start", value)} /><Field fieldKey={`education.${index}.end`} label="End" value={item.end} onChange={(value) => updateItem("education", index, "end", value)} /></div>
                        </ItemCard>} />
                    </>}
                    {section === "certifications" && <>
                        <Collection focusId={newEntryId} title={sectionTitle(activeSection)} description="Professional certificates, licences and awards." items={cv.certifications} addLabel="Add certification" onAdd={() => addItem("certifications")} renderItem={(item, index) => <ItemCard hidden={item.hidden} onToggle={() => updateItem("certifications", index, "hidden", !item.hidden)} onMoveUp={index > 0 ? () => moveItem("certifications", index, -1) : undefined} onMoveDown={index < cv.certifications.length - 1 ? () => moveItem("certifications", index, 1) : undefined} onDuplicate={() => duplicateItem("certifications", index)} initiallyOpen={index === 0 || !item.title || item.id === newEntryId} title={item.title || `Certification ${index + 1}`} onRemove={() => removeItem("certifications", index)}>
                            <Field fieldKey={`certifications.${index}.title`} label="Title" value={item.title} onChange={(value) => updateItem("certifications", index, "title", value)} />
                            <div className="field-grid"><Field fieldKey={`certifications.${index}.issuer`} label="Issuer" value={item.issuer} onChange={(value) => updateItem("certifications", index, "issuer", value)} /><Field fieldKey={`certifications.${index}.issued`} label="Issued" value={item.issued} onChange={(value) => updateItem("certifications", index, "issued", value)} /></div>
                        </ItemCard>} />
                    </>}

                    {section === "skills" && <>
                        <div className="section-intro"><h2>{sectionTitle(activeSection)}</h2><p>List the skills most relevant to your next role.</p></div>
                        <ListField fieldKey="skills" label="Skills" values={cv.skills} onChange={(value) => update("skills", value)} hint="One skill per line" />
                    </>}

                    {["languages", "interests"].includes(section) && <ListField fieldKey={section} label={sectionTitle(activeSection)} values={cv[section]} onChange={(value) => update(section, value)} hint={section === "languages" ? "One language and proficiency per line, for example Spanish — fluent" : "One interest per line"} />}
                    {section === "volunteering" && <>
                        <Collection focusId={newEntryId} title={sectionTitle(activeSection)} description="Relevant community, charity, or unpaid work." items={cv.volunteering} addLabel="Add volunteering" onAdd={() => addItem("volunteering")} renderItem={(item, index) => <ItemCard hidden={item.hidden} onToggle={() => updateItem("volunteering", index, "hidden", !item.hidden)} onMoveUp={index > 0 ? () => moveItem("volunteering", index, -1) : undefined} onMoveDown={index < cv.volunteering.length - 1 ? () => moveItem("volunteering", index, 1) : undefined} onDuplicate={() => duplicateItem("volunteering", index)} initiallyOpen={index === 0 || !item.role || item.id === newEntryId} title={item.role || `Volunteer role ${index + 1}`} subtitle={item.organization} onRemove={() => removeItem("volunteering", index)}>
                            <div className="field-grid"><Field fieldKey={`volunteering.${index}.role`} label="Role" value={item.role} onChange={(value) => updateItem("volunteering", index, "role", value)} /><Field fieldKey={`volunteering.${index}.organization`} label="Organization" value={item.organization} onChange={(value) => updateItem("volunteering", index, "organization", value)} /></div>
                            <div className="field-grid"><Field fieldKey={`volunteering.${index}.start`} label="Start" value={item.start} onChange={(value) => updateItem("volunteering", index, "start", value)} /><Field fieldKey={`volunteering.${index}.end`} label="End" value={item.end} onChange={(value) => updateItem("volunteering", index, "end", value)} /></div>
                            <ListField fieldKey={`volunteering.${index}.bullets`} label="Highlights" values={item.bullets} onChange={(value) => updateItem("volunteering", index, "bullets", value)} />
                        </ItemCard>} />
                    </>}

                        </>}
                    </div>
                    <footer className="editor-footer"><ShieldCheck size={14} className="shrink-0" /><span>{saveMessage}. Your details stay in this browser.</span></footer>
                </div>
            </section>
            <aside className={`preview-area ${mobileView === "editor" ? "hidden lg:flex" : "flex"}`} aria-label="CV preview">
                <div className="preview-toolbar">
                    <div className="flex items-center gap-2 text-xs"><span className="preview-dot" /><span className="font-medium">{template.name}</span><span className="text-muted">/ A4{pageCount > 0 && ` · ${pageCount} ${pageCount === 1 ? "page" : "pages"}`}</span></div>
                    <div className="zoom-switch" role="group" aria-label="Preview zoom"><button aria-pressed={zoom === "fit"} onClick={() => setZoom("fit")}>Fit</button><button aria-pressed={zoom === "actual"} onClick={() => setZoom("actual")}>100%</button></div>
                </div>
                <div className="preview-viewport" ref={paperRef}>
                    {!hasVisibleContent && <p className="preview-empty">Your CV will appear here as you add details.</p>}
                    <div className="paper-wrap" style={{ width: PAGE_WIDTH * scale, height: previewHeight * scale }}>
                        <iframe ref={previewFrameRef} title="CV document preview" srcDoc={previewHtml} sandbox="allow-same-origin" onLoad={preparePreview} style={{ width: PAGE_WIDTH, height: previewHeight, transform: `scale(${scale})` }} />
                    </div>
                    <p className="preview-tip">These A4 pages are used for your PDF. Choose “Save as PDF” at 100% scale.</p>
                </div>
            </aside>
        </main>
        <input ref={fileRef} className="sr-only" type="file" accept=".yaml,.yml,.json,text/yaml,application/json" onChange={importFile} tabIndex={-1} aria-label="Choose a CV YAML or JSON file" />
        <input ref={photoRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={importPhoto} tabIndex={-1} aria-label="Choose a profile photo" />
        {notice && <div className="toast panel-enter"><p role="status">{notice}</p>{undoCv && <button className="button-quiet text-accent" onClick={() => { setCv(undoCv); setUndoCv(null); setNotice("Draft restored."); }}>Undo</button>}<button className="icon-button" aria-label="Dismiss notification" onClick={() => { setNotice(""); setUndoCv(null); }}><X size={16} /></button></div>}
        <dialog ref={resetRef} className="confirm-dialog" aria-labelledby="reset-title">
            <div className="p-6 sm:p-8"><span className="dialog-icon"><RotateCcw size={22} /></span><h2 id="reset-title" className="mt-5 text-xl font-semibold tracking-tight">{resetKind === "blank" ? "Start a blank CV?" : "Load the example CV?"}</h2><p className="mt-2 text-sm leading-relaxed text-muted">This replaces your current draft. Export a backup from File if you want to keep a copy.</p><div className="mt-7 flex justify-end gap-2"><button className="button-secondary" autoFocus onClick={() => resetRef.current.close()}>Keep editing</button><button className="button-primary" onClick={reset}>{resetKind === "blank" ? "Start blank" : "Load example"}</button></div></div>
        </dialog>
    </div>;
}
