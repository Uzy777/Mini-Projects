import { useEffect, useId, useRef, useState } from "react";
import { ArrowDownToLine, Check, ChevronDown, FileText, FolderOpen, LayoutTemplate, Moon, PanelLeft, Plus, RotateCcw, ShieldCheck, Sun, Trash2, X } from "lucide-react";
import { exampleCv, normalizeCv, parseCv, renderCv, STORAGE_KEY, TEMPLATES, toYaml } from "./cv.js";
import { TemplatePicker } from "./TemplatePicker.jsx";
import { PAGE_WIDTH, paginateDocument, printPages } from "./pagination.js";

const PREFERENCES_KEY = "cv-studio-preferences-v1";
const sections = [
    { id: "basics", label: "Profile" },
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "qualifications", label: "Qualifications" },
    { id: "skills", label: "Skills" },
];
const emptyItems = {
    experience: { role: "", company: "", location: "", type: "", start: "", end: "", info: "", bullets: [], tech: [] },
    projects: { name: "", description: "", bullets: [], tech: [], link: "" },
    education: { institution: "", course: "", start: "", end: "" },
    certifications: { title: "", issuer: "", issued: "" },
};

function loadDraft() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? normalizeCv(JSON.parse(stored)) : exampleCv;
    } catch { return exampleCv; }
}
function loadPreferences() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(PREFERENCES_KEY)) || {}; } catch { /* Use device defaults. */ }
    return {
        theme: ["light", "dark"].includes(saved.theme) ? saved.theme : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
        template: TEMPLATES.some((item) => item.id === saved.template) ? saved.template : "original",
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
function Field({ label, value, onChange, multiline = false, hint, placeholder, type = "text" }) {
    const id = useId();
    const props = { id, value, placeholder, onChange: (event) => onChange(event.target.value), "aria-describedby": hint ? `${id}-hint` : undefined };
    return <div className="field">
        <label htmlFor={id}>{label}</label>
        {multiline ? <textarea {...props} rows={4} /> : <input {...props} type={type} />}
        {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
    </div>;
}
function ListField({ label, values, onChange, hint }) {
    return <Field label={label} value={values.join("\n")} onChange={(value) => onChange(value ? value.split("\n") : [])} multiline hint={hint || "One item per line"} />;
}
function ItemCard({ title, subtitle, onRemove, children, initiallyOpen = false }) {
    const [open, setOpen] = useState(initiallyOpen);
    const id = useId();
    return <article className="item-card">
        <button type="button" className="item-heading" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
            <span className="min-w-0"><span className="block truncate text-sm font-semibold">{title}</span>{subtitle && <span className="mt-1 block truncate text-xs text-muted">{subtitle}</span>}</span>
            <ChevronDown size={17} className={`shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
        {open && <div id={id} className="item-content panel-enter">{children}<button className="button-quiet text-danger" type="button" onClick={onRemove} aria-label={`Remove ${title}`}><Trash2 size={14} />Remove entry</button></div>}
    </article>;
}
function Collection({ title, description, items, onAdd, renderItem, addLabel }) {
    const listRef = useRef(null);
    const previousLength = useRef(items.length);
    useEffect(() => {
        if (items.length > previousLength.current) {
            const input = listRef.current?.lastElementChild?.querySelector("input, textarea");
            input?.focus({ preventScroll: true });
            input?.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
        }
        previousLength.current = items.length;
    }, [items.length]);
    return <>
        <div className="section-intro"><h2>{title}</h2><p>{description}</p></div>
        <div className="space-y-3" ref={listRef}>{items.length ? items.map((item, index) => <div key={index}>{renderItem(item, index)}</div>) : <p className="empty-state">No entries yet.</p>}</div>
        <button className="add-button" type="button" onClick={onAdd}><Plus size={16} />{addLabel}</button>
    </>;
}

export default function App() {
    const [cv, setCv] = useState(loadDraft);
    const [preferences, setPreferences] = useState(loadPreferences);
    const [section, setSection] = useState("basics");
    const [mode, setMode] = useState("content");
    const [mobileView, setMobileView] = useState("editor");
    const [zoom, setZoom] = useState("fit");
    const [previewHtml, setPreviewHtml] = useState(() => renderCv(cv, preferences.template));
    const [saveMessage, setSaveMessage] = useState("Saved locally");
    const [notice, setNotice] = useState("");
    const [undoCv, setUndoCv] = useState(null);
    const [previewScale, setPreviewScale] = useState(1);
    const [previewHeight, setPreviewHeight] = useState(1123);
    const [pageCount, setPageCount] = useState(0);
    const [preparingPdf, setPreparingPdf] = useState(false);
    const pagesRef = useRef(null);
    const pendingPrintRef = useRef(null);
    const paperRef = useRef(null);
    const fileRef = useRef(null);
    const fileMenuRef = useRef(null);
    const resetRef = useRef(null);
    const template = TEMPLATES.find((item) => item.id === preferences.template);
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
        try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences)); }
        catch { setNotice("Preferences could not be saved in this browser."); }
    }, [preferences]);
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cv));
            setSaveMessage("Saved locally");
        } catch { setSaveMessage("Save unavailable — export a backup"); }
    }, [cv]);
    useEffect(() => {
        const timer = window.setTimeout(() => setPreviewHtml(renderCv(cv, preferences.template)), 180);
        return () => window.clearTimeout(timer);
    }, [cv, preferences.template]);
    useEffect(() => {
        const closeMenu = (event) => {
            if (fileMenuRef.current && !fileMenuRef.current.contains(event.target)) fileMenuRef.current.open = false;
        };
        document.addEventListener("pointerdown", closeMenu);
        return () => document.removeEventListener("pointerdown", closeMenu);
    }, []);

    const edit = (change) => { setUndoCv(null); setNotice(""); setCv(change); };
    const update = (key, value) => edit((current) => ({ ...current, [key]: value }));
    const updateContact = (key, value) => edit((current) => ({ ...current, contact: { ...current.contact, [key]: value } }));
    const updateItem = (group, index, key, value) => edit((current) => ({ ...current, [group]: current[group].map((item, position) => position === index ? { ...item, [key]: value } : item) }));
    const addItem = (group) => edit((current) => ({ ...current, [group]: [...current[group], { ...emptyItems[group] }] }));
    const removeItem = (group, index) => {
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
            setUndoCv(cv);
            setCv(imported);
            setSection("basics");
            setMode("content");
            setNotice(`Imported ${file.name}.`);
        } catch (error) { setNotice(error.message); }
    }
    function printCv() {
        const latest = renderCv(cv, preferences.template);
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
        setUndoCv(cv);
        setCv(exampleCv);
        setSection("basics");
        setMode("content");
        setNotice("Example CV restored.");
        resetRef.current.close();
    }

    return <div className="min-h-dvh bg-canvas text-ink transition-colors duration-200">
        <a className="skip-link" href="#editor">Skip to editor</a>
        <header className="app-header">
            <a href="#" className="brand" aria-label="CV Studio home"><span className="brand-mark"><FileText size={21} strokeWidth={1.6} /></span><span>cv<span className="hidden font-normal text-muted min-[380px]:inline">studio</span><span className="brand-period">.</span></span></a>
            <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden items-center gap-1.5 text-xs text-muted xl:flex" role="status"><Check size={14} />{saveMessage}</span>
                <button className="icon-button" type="button" aria-label={`Switch to ${preferences.theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${preferences.theme === "dark" ? "light" : "dark"} mode`} onClick={() => setPreferences((current) => ({ ...current, theme: current.theme === "dark" ? "light" : "dark" }))}>{preferences.theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>
                <details ref={fileMenuRef} className="relative" onKeyDown={(event) => { if (event.key === "Escape") { fileMenuRef.current.open = false; fileMenuRef.current.querySelector("summary").focus(); } }}>
                    <summary className="button-secondary list-none" aria-label="File actions"><FolderOpen size={16} /><span className="hidden sm:inline">File</span><ChevronDown size={13} className="hidden sm:block" /></summary>
                    <div className="file-menu panel-enter">
                        <button onClick={() => fileAction(() => fileRef.current?.click())}><FolderOpen size={16} />Import YAML / JSON</button>
                        <button onClick={() => fileAction(() => download("cv.yaml", toYaml(cv), "text/yaml"))}><ArrowDownToLine size={16} />Export YAML backup</button>
                        <div className="my-1 border-t border-line" />
                        <button className="text-danger" onClick={() => fileAction(() => resetRef.current.showModal())}><RotateCcw size={16} />Reset to example</button>
                    </div>
                </details>
                <button className="button-primary" type="button" onClick={printCv} disabled={preparingPdf || pageCount === 0}><ArrowDownToLine size={16} /><span>{preparingPdf ? "Preparing PDF…" : "Save PDF"}</span></button>
            </div>
        </header>
        <div className="mobile-switch" role="group" aria-label="Workspace view">
            <button aria-pressed={mobileView === "editor"} onClick={() => setMobileView("editor")}><PanelLeft size={15} />Editor</button>
            <button aria-pressed={mobileView === "preview"} onClick={() => setMobileView("preview")}><FileText size={15} />Preview</button>
        </div>
        <main className="workspace">
            <section className={`editor ${mobileView === "preview" ? "hidden lg:flex" : "flex"}`} id="editor" aria-label="CV editor">
                <div className="editor-toolbar">
                    <div className="mode-switch" role="group" aria-label="Editor view">
                        <button aria-pressed={mode === "content"} onClick={() => setMode("content")}><PanelLeft size={15} />Content</button>
                        <button aria-pressed={mode === "templates"} onClick={() => setMode("templates")}><LayoutTemplate size={15} />Templates</button>
                    </div>
                    <span className="hidden text-[11px] text-muted sm:block">Local draft</span>
                </div>
                {mode === "content" && <nav className="section-nav" aria-label="CV sections">
                    {sections.map((entry) => <button key={entry.id} type="button" aria-current={section === entry.id ? "page" : undefined} onClick={() => setSection(entry.id)}>{entry.label}</button>)}
                </nav>}
                <div className="editor-scroll">
                    <div key={`${mode}-${section}`} className="editor-content panel-enter">
                        {mode === "templates" ? <TemplatePicker selected={preferences.template} onSelect={(id) => setPreferences((current) => ({ ...current, template: id }))} /> : <>
                    {section === "basics" && <>
                        <div className="section-intro"><h2>Profile</h2><p>Start with the details at the top of your CV.</p></div>
                        <div className="field-grid"><Field label="Full name" value={cv.name} onChange={(value) => update("name", value)} placeholder="Your name" /><Field label="Job title" value={cv.title} onChange={(value) => update("title", value)} placeholder="Your role" /></div>
                        <Field label="Location" value={cv.contact.location} onChange={(value) => updateContact("location", value)} placeholder="City, country" />
                        <Field label="Personal profile" value={cv.summary} onChange={(value) => update("summary", value)} multiline  />
                        <h3 className="form-subheading">Contact details</h3>
                        <div className="field-grid"><Field label="Email" type="email" value={cv.contact.email} onChange={(value) => updateContact("email", value)} /><Field label="Phone" type="tel" value={cv.contact.phone} onChange={(value) => updateContact("phone", value)} /></div>
                        <div className="field-grid"><Field label="LinkedIn" value={cv.contact.linkedin} onChange={(value) => updateContact("linkedin", value)} placeholder="linkedin.com/in/you" /><Field label="GitHub" value={cv.contact.github} onChange={(value) => updateContact("github", value)} placeholder="github.com/you" /></div>
                        <Field label="Website" value={cv.website} onChange={(value) => update("website", value)} placeholder="your-site.com" />
                    </>}

                    {section === "experience" && <Collection title="Experience" description="Your most recent role first." items={cv.experience} addLabel="Add experience" onAdd={() => addItem("experience")} renderItem={(item, index) => <ItemCard initiallyOpen={index === 0 || !item.role} title={item.role || `Role ${index + 1}`} subtitle={item.company} onRemove={() => removeItem("experience", index)}>
                        <div className="field-grid"><Field label="Role" value={item.role} onChange={(value) => updateItem("experience", index, "role", value)} /><Field label="Company" value={item.company} onChange={(value) => updateItem("experience", index, "company", value)} /></div>
                        <div className="field-grid"><Field label="Location" value={item.location} onChange={(value) => updateItem("experience", index, "location", value)} /><Field label="Employment type" value={item.type} onChange={(value) => updateItem("experience", index, "type", value)} /></div>
                        <div className="field-grid"><Field label="Start" value={item.start} onChange={(value) => updateItem("experience", index, "start", value)} placeholder="Jan 2024" /><Field label="End" value={item.end} onChange={(value) => updateItem("experience", index, "end", value)} placeholder="Present" /></div>
                        <Field label="Overview" value={item.info} onChange={(value) => updateItem("experience", index, "info", value)} multiline hint="Optional paragraph before your highlights." />
                        <ListField label="Highlights" values={item.bullets} onChange={(value) => updateItem("experience", index, "bullets", value)} />
                        <ListField label="Technologies" values={item.tech} onChange={(value) => updateItem("experience", index, "tech", value)} />
                    </ItemCard>} />}

                    {section === "projects" && <Collection title="Projects" description="Show the work you want readers to notice." items={cv.projects} addLabel="Add project" onAdd={() => addItem("projects")} renderItem={(item, index) => <ItemCard initiallyOpen={index === 0 || !item.name} title={item.name || `Project ${index + 1}`} onRemove={() => removeItem("projects", index)}>
                        <Field label="Project name" value={item.name} onChange={(value) => updateItem("projects", index, "name", value)} />
                        <Field label="Description" value={item.description} onChange={(value) => updateItem("projects", index, "description", value)} multiline />
                        <ListField label="Technologies" values={item.tech} onChange={(value) => updateItem("projects", index, "tech", value)} />
                        <Field label="Project link" value={item.link} onChange={(value) => updateItem("projects", index, "link", value)} placeholder="example.com/project" />
                    </ItemCard>} />}

                    {section === "qualifications" && <>
                        <Collection title="Education" description="Degrees, courses, and other education." items={cv.education} addLabel="Add education" onAdd={() => addItem("education")} renderItem={(item, index) => <ItemCard initiallyOpen={index === 0 || !item.institution} title={item.institution || `Education ${index + 1}`} onRemove={() => removeItem("education", index)}>
                            <Field label="Institution" value={item.institution} onChange={(value) => updateItem("education", index, "institution", value)} />
                            <Field label="Course or qualification" value={item.course} onChange={(value) => updateItem("education", index, "course", value)} />
                            <div className="field-grid"><Field label="Start" value={item.start} onChange={(value) => updateItem("education", index, "start", value)} /><Field label="End" value={item.end} onChange={(value) => updateItem("education", index, "end", value)} /></div>
                        </ItemCard>} />
                        <div className="collection-divider" />
                        <Collection title="Certifications" description="Professional certificates and awards." items={cv.certifications} addLabel="Add certification" onAdd={() => addItem("certifications")} renderItem={(item, index) => <ItemCard initiallyOpen={index === 0 || !item.title} title={item.title || `Certification ${index + 1}`} onRemove={() => removeItem("certifications", index)}>
                            <Field label="Title" value={item.title} onChange={(value) => updateItem("certifications", index, "title", value)} />
                            <div className="field-grid"><Field label="Issuer" value={item.issuer} onChange={(value) => updateItem("certifications", index, "issuer", value)} /><Field label="Issued" value={item.issued} onChange={(value) => updateItem("certifications", index, "issued", value)} /></div>
                        </ItemCard>} />
                    </>}

                    {section === "skills" && <>
                        <div className="section-intro"><h2>Skills</h2><p>A few things you do well.</p></div>
                        <ListField label="Skills" values={cv.skills} onChange={(value) => update("skills", value)} hint="One skill per line" />
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
                    <div className="paper-wrap" style={{ width: PAGE_WIDTH * scale, height: previewHeight * scale }}>
                        <iframe title="CV document preview" srcDoc={previewHtml} sandbox="allow-same-origin" onLoad={preparePreview} style={{ width: PAGE_WIDTH, height: previewHeight, transform: `scale(${scale})` }} />
                    </div>
                    <p className="preview-tip">These A4 pages are used for your PDF. Choose “Save as PDF” at 100% scale.</p>
                </div>
            </aside>
        </main>
        <input ref={fileRef} className="sr-only" type="file" accept=".yaml,.yml,.json,text/yaml,application/json" onChange={importFile} tabIndex={-1} aria-label="Choose a CV YAML or JSON file" />
        {notice && <div className="toast panel-enter"><p role="status">{notice}</p>{undoCv && <button className="button-quiet text-accent" onClick={() => { setCv(undoCv); setUndoCv(null); setNotice("Draft restored."); }}>Undo</button>}<button className="icon-button" aria-label="Dismiss notification" onClick={() => { setNotice(""); setUndoCv(null); }}><X size={16} /></button></div>}
        <dialog ref={resetRef} className="confirm-dialog" aria-labelledby="reset-title">
            <div className="p-6 sm:p-8"><span className="dialog-icon"><RotateCcw size={22} /></span><h2 id="reset-title" className="mt-5 text-xl font-semibold tracking-tight">Start from the example?</h2><p className="mt-2 text-sm leading-relaxed text-muted">This replaces your current draft. Export a backup from File if you want to keep a copy.</p><div className="mt-7 flex justify-end gap-2"><button className="button-secondary" autoFocus onClick={() => resetRef.current.close()}>Keep editing</button><button className="button-primary" onClick={reset}>Reset draft</button></div></div>
        </dialog>
    </div>;
}
