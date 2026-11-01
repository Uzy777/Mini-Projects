import { useEffect, useId, useRef, useState } from "react";
import { Eye, EyeOff, ArrowDown, ArrowUp, BriefcaseBusiness, ExternalLink, Globe, Link, Plus, Trash2 } from "lucide-react";
import { LINK_TYPES, linkType, socialUrl } from "./social-links.js";

import linkedinIcon from "./assets/brands/linkedin.svg";
import githubIcon from "./assets/brands/github.svg";
import gitlabIcon from "./assets/brands/gitlab.svg";
import youtubeIcon from "./assets/brands/youtube.svg";

const brandIcons = { linkedin: linkedinIcon, github: githubIcon, gitlab: gitlabIcon, youtube: youtubeIcon };
const icons = { globe: Globe, portfolio: BriefcaseBusiness, link: Link };
function PlatformIcon({ platform }) {
    const type = linkType(platform);
    if (brandIcons[type.id]) return <img className="brand-icon" src={brandIcons[type.id]} width={17} height={17} alt="" aria-hidden="true" />;
    const Icon = icons[type.icon];
    return <Icon size={17} aria-hidden="true" />;
}

function LinkCard({ link, index, count, onChange, onRemove, onMove }) {
    const id = useId();
    const type = linkType(link.platform);
    const url = socialUrl(link);
    const invalid = Boolean(link.value.trim()) && !url;
    return <div className={`social-card ${link.hidden ? "entry-hidden" : ""}`} data-link-id={link.id}>
        <div className="social-heading">
            <span className="social-icon"><PlatformIcon platform={link.platform} /></span>
            <label className="sr-only" htmlFor={`${id}-platform`}>Platform for link {index + 1}</label>
            <select id={`${id}-platform`} value={link.platform} data-preview-field={`links.${index}.label`} onChange={(event) => onChange("platform", event.target.value)}>
                {LINK_TYPES.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
            <div className="entry-actions">
                <button className="entry-action" type="button" onClick={() => onChange("hidden", !link.hidden)} title={link.hidden ? "Show link" : "Hide link, keep content"} aria-label={`${link.hidden ? "Show" : "Hide"} ${type.label} link`}>{link.hidden ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                <button className="entry-action" type="button" disabled={!index} onClick={() => onMove(-1)} title="Move link up" aria-label={`Move ${type.label} link up`}><ArrowUp size={14} /></button>
                <button className="entry-action" type="button" disabled={index === count - 1} onClick={() => onMove(1)} title="Move link down" aria-label={`Move ${type.label} link down`}><ArrowDown size={14} /></button>
                <button className="entry-action text-danger" type="button" onClick={onRemove} title="Remove link" aria-label={`Remove ${type.label} link`}><Trash2 size={14} /></button>
            </div>
        </div>
        {link.hidden && <p className="field-hint mb-2">Hidden from your CV</p>}
        {(link.platform === "other" || link.label) && <div className="field">
            <label htmlFor={`${id}-label`}>Label</label>
            <input id={`${id}-label`} value={link.label} placeholder="e.g. Writing or publications" data-preview-field={`links.${index}.label`} onChange={(event) => onChange("label", event.target.value)} />
        </div>}
        <div className="field social-value">
            <label className="sr-only" htmlFor={`${id}-value`}>{type.label} address</label>
            <input id={`${id}-value`} value={link.value} placeholder={type.placeholder} data-preview-field={`links.${index}.value`} onChange={(event) => onChange("value", event.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-error` : undefined} />
            {url && <a className="entry-action" href={url} target="_blank" rel="noopener noreferrer" title="Open link in a new tab" aria-label={`Open ${type.label} link in a new tab`}><ExternalLink size={15} /></a>}
        </div>
        {invalid && <p id={`${id}-error`} className="field-hint text-danger">Enter a web address{type.base ? " or username" : ""} to make this link clickable.</p>}
    </div>;
}

export function SocialLinks({ links, onChange, onAdd, onRemove, onMove }) {
    const [choosing, setChoosing] = useState(false);
    const [focusId, setFocusId] = useState(null);
    const listRef = useRef(null);
    const pickerRef = useRef(null);
    const id = useId();
    useEffect(() => {
        if (!choosing) return;
        pickerRef.current?.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
        pickerRef.current?.querySelector("button")?.focus({ preventScroll: true });
    }, [choosing]);
    useEffect(() => {
        if (!focusId) return;
        const card = [...listRef.current.children].find((element) => element.dataset.linkId === focusId);
        card?.querySelector('input[data-preview-field$=".value"]')?.focus();
        setFocusId(null);
    }, [focusId, links.length]);
    return <section className="social-section" aria-labelledby={`${id}-heading`}>
        <div className="form-subheading flex items-center justify-between"><h3 id={`${id}-heading`}>Online links</h3><span className="count-badge">{links.length}</span></div>
        <div className="space-y-3" ref={listRef}>
            {links.map((link, index) => <LinkCard key={link.id} link={link} index={index} count={links.length} onChange={(key, value) => onChange(index, key, value)} onRemove={() => onRemove(index)} onMove={(direction) => onMove(index, direction)} />)}
        </div>
        <button className="add-button" type="button" aria-expanded={choosing} aria-controls={`${id}-picker`} onClick={() => setChoosing(!choosing)}><Plus size={16} />Add a link</button>
        {choosing && <div ref={pickerRef} id={`${id}-picker`} className="link-picker panel-enter" onKeyDown={(event) => { if (event.key === "Escape") { setChoosing(false); event.currentTarget.previousElementSibling.focus(); } }}>
            <p>Choose a platform</p>
            <div>{LINK_TYPES.map((type) => <button key={type.id} type="button" onClick={() => {
                setFocusId(onAdd(type.id));
                setChoosing(false);
            }}><PlatformIcon platform={type.id} /><span>{type.label}</span></button>)}</div>
        </div>}
    </section>;
}
