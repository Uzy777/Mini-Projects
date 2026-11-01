import { ArrowDown, ArrowUp, ChevronRight, EyeOff, Plus } from "lucide-react";
import { SECTION_TYPES, sectionHasContent, sectionTitle } from "./sections.js";

export function SectionsPanel({ cv, twoColumns, onEdit, onToggle, onMove, onColumn, onCustom }) {
    const included = cv.sections.filter((item) => item.enabled);
    const available = cv.sections.filter((item) => !item.enabled);
    const groups = twoColumns ? ["main", "sidebar"] : [null];
    return <>
        <div className="section-intro"><h2>Your CV, your sections</h2><p>Choose what to include. Every section is optional, and you can change your mind at any time.</p></div>
        <button className="profile-shortcut" type="button" onClick={() => onEdit("basics")}><span><strong>Name & headline</strong><span>{cv.name || "Start with your name, or leave it for later."}</span></span><ChevronRight size={17} /></button>
        <div className="section-list-heading"><h3>Included sections</h3><span>{included.length}</span></div>
        <p className="field-hint">Hide a section to keep its content for later. Empty sections stay off the CV.</p>
        {!included.length && <div className="empty-state">A fresh start. Add any sections below to build your CV.</div>}
        {groups.map((column) => {
            const items = included.filter((item) => !column || item.column === column);
            return <div key={column || "all"} className="section-group">
                {column && <h4 className="section-column-label">{column === "main" ? "Main column" : "Sidebar"}</h4>}
                {items.map((item, index) => <div className="section-choice" key={item.id}>
                    <button className="section-choice-edit" type="button" onClick={() => onEdit(item.id)}><strong>{sectionTitle(item)}</strong><span>{sectionHasContent(cv, item.id) ? "On your CV" : "Ready to fill in"}</span></button>
                    <div className="section-choice-actions">
                        {twoColumns && <select value={item.column} onChange={(event) => onColumn(item.id, event.target.value)} aria-label={`Column for ${sectionTitle(item)}`}><option value="main">Main</option><option value="sidebar">Sidebar</option></select>}
                        <button className="entry-action" type="button" disabled={index === 0} onClick={() => onMove(item.id, -1, column)} aria-label={`Move ${sectionTitle(item)} section up`} title="Move section up"><ArrowUp size={15} /></button>
                        <button className="entry-action" type="button" disabled={index === items.length - 1} onClick={() => onMove(item.id, 1, column)} aria-label={`Move ${sectionTitle(item)} section down`} title="Move section down"><ArrowDown size={15} /></button>
                        <button className="entry-action" type="button" onClick={() => onToggle(item.id, false)} aria-label={`Hide ${sectionTitle(item)} section`} title="Hide section, keep content"><EyeOff size={15} /></button>
                    </div>
                </div>)}
            </div>;
        })}
        {twoColumns && <p className="field-hint">Order applies within each column. Single-column designs follow the order in their section list.</p>}
        <div className="section-list-heading"><h3>Add a section</h3></div>
        <div className="section-catalog">
            {available.map((item) => <button key={item.id} type="button" className="catalog-choice" onClick={() => onToggle(item.id, true)}><Plus size={16} /><span><strong>{sectionTitle(item)}</strong><span>{sectionHasContent(cv, item.id) ? "Restore your saved content" : SECTION_TYPES.find((type) => type.id === item.id)?.description || "Your own heading and free-form text."}</span></span></button>)}
            <button type="button" className="catalog-choice custom-choice" onClick={() => onCustom("Custom section")}><Plus size={16} /><span><strong>Custom section</strong><span>Any heading, any text. Make it your own.</span></span></button>
        </div>
        <p className="field-hint mt-4">Or start a custom section for:</p>
        <div className="custom-suggestions">{["Awards", "Publications", "References", "Courses"].map((title) => <button key={title} type="button" className="button-secondary" onClick={() => onCustom(title)}>{title}<Plus size={13} /></button>)}</div>
    </>;
}
