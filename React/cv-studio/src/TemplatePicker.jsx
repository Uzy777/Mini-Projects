import { useEffect, useState } from "react";
import { Check, ArrowUpRight } from "lucide-react";
import { exampleCv, renderCv, TEMPLATES } from "./cv.js";

export function TemplatePicker({ selected, onSelect, accent, onAccentChange }) {
    const [hex, setHex] = useState(accent.toUpperCase());
    useEffect(() => setHex(accent.toUpperCase()), [accent]);
    const editHex = (value) => {
        setHex(value.toUpperCase());
        if (/^#?[0-9a-f]{6}$/i.test(value)) onAccentChange(`#${value.replace(/^#/, "").toLowerCase()}`);
    };
    const thumbnails = Object.fromEntries(TEMPLATES.map((template) => [template.id, renderCv(exampleCv, template.id, accent)]));
    return <>
        <div className="section-intro"><h2>Design</h2><p>Choose a layout and accent colour. Your content stays in place.</p></div>
        <div className="accent-panel">
            <div><h3 className="text-sm font-semibold">Accent colour</h3><p className="mt-1 text-xs text-muted">Used across the editor and in your CV. Light colours are adjusted for readable text.</p></div>
            <div className="accent-controls">
                <label className="accent-picker" title="Choose a custom accent colour"><input aria-label="Choose a custom accent colour" type="color" value={accent} onChange={(event) => onAccentChange(event.target.value)} /></label>
                <label className="accent-hex-label" htmlFor="accent-hex">Hex</label>
                <input id="accent-hex" className="accent-hex" aria-label="Accent hex code" value={hex} maxLength={7} spellCheck={false} onChange={(event) => editHex(event.target.value)} onBlur={() => setHex(accent.toUpperCase())} />
            </div>
        </div>
        <h3 className="design-subheading">Layouts</h3>
        <fieldset className="space-y-3">
            <legend className="sr-only">Choose a CV template</legend>
            {TEMPLATES.map((template) => <label key={template.id} className="template-option">
                <input className="peer sr-only" type="radio" name="cv-template" value={template.id} checked={selected === template.id} onChange={() => onSelect(template.id)} />
                <span className="template-card">
                    <span className="thumbnail-surround" aria-hidden="true"><span className="template-thumbnail"><iframe title={`${template.name} template thumbnail`} srcDoc={thumbnails[template.id]} sandbox="" tabIndex={-1} /></span></span>
                    <span className="min-w-0 py-2">
                        <span className="mb-3 inline-block rounded border border-line px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted">{template.tag}</span>
                        <span className="block text-base font-semibold tracking-tight">{template.name}</span>
                        <span className="mt-1.5 block text-xs leading-relaxed text-muted">{template.description}</span>
                        <span className="mt-4 block text-[10px] text-muted">{template.detail}</span>
                    </span>
                    <span className="template-check">{selected === template.id && <Check size={12} strokeWidth={3} />}</span>
                </span>
            </label>)}
        </fieldset>
        <p className="mt-6 text-xs leading-relaxed text-muted">Essential and Editorial keep a straightforward single reading column. The more visual layouts can suit direct sharing; check the employer's file requirements when applying. A design alone cannot guarantee an application score.</p>
        <a className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline" href="https://help.lever.co/s/article/Understanding-Resume-Parsing" target="_blank" rel="noreferrer">About CV parsing<ArrowUpRight size={12} /></a>
    </>;
}
