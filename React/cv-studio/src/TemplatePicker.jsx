import { Check, ArrowUpRight } from "lucide-react";
import { exampleCv, renderCv, TEMPLATES } from "./cv.js";

const thumbnails = Object.fromEntries(TEMPLATES.map((template) => [template.id, renderCv(exampleCv, template.id)]));

export function TemplatePicker({ selected, onSelect }) {
    return <>
        <div className="section-intro"><h2>Choose a template</h2><p>Your details carry across. Pick a layout to preview it.</p></div>
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
        <p className="mt-6 text-xs leading-relaxed text-muted">Every template uses real text and clear headings. Essential and Editorial follow a single reading column.</p>
        <a className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline" href="https://help.lever.co/s/article/Understanding-Resume-Parsing" target="_blank" rel="noreferrer">About CV parsing<ArrowUpRight size={12} /></a>
    </>;
}
