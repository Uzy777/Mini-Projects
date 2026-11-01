import yaml from "js-yaml";
import { hasContent, normalizeSections, sectionHasContent, sectionTitle } from "./sections.js";
import { normalizeLinks, linkLabel, socialUrl, safeWebUrl } from "./social-links.js";
import template from "./cv-template.html?raw";
import exampleYaml from "./example.yaml?raw";
import { DEFAULT_ACCENT, readableAccent } from "./accent.js";

export const STORAGE_KEY = "cv-studio-draft-v1";
export const TEMPLATES = [
    { id: "original", name: "Original", description: "Your signature two-column layout.", detail: "Two columns · Colour accents", tag: "Default" },
    { id: "essential", name: "Essential", description: "A clear, straightforward reading order.", detail: "One column · Sans serif", tag: "Simple" },
    { id: "editorial", name: "Editorial", description: "Classic typography with room to breathe.", detail: "One column · Serif headings", tag: "Classic" },
    { id: "modern", name: "Modern", description: "A bold header with a geometric accent and optional photo.", detail: "One column · Photo option", tag: "Contemporary" },
    { id: "structured", name: "Structured", description: "Experience beside a compact information rail.", detail: "Two columns · Sidebar", tag: "Professional" },
    { id: "minimal", name: "Minimal", description: "Section labels sit in a quiet left margin.", detail: "Offset headings · Serif name", tag: "Refined" },
];

const text = (value) => (value == null ? "" : String(value));
const list = (value) => (Array.isArray(value) ? value.map(text) : []);
const records = (value) => (Array.isArray(value) ? value.filter((item) => item && typeof item === "object" && !Array.isArray(item)) : []);
const photo = (value) => typeof value === "string" && value.length < 350000 && /^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=]+$/i.test(value) ? value : "";

const entries = (value, group) => {
    const ids = new Set();
    return records(value).map((item, index) => {
        let id = text(item.id) || `${group}-${index}`;
        while (ids.has(id)) id += "-copy";
        ids.add(id);
        return { ...item, id };
    });
};

export function normalizeCv(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("The file must contain a CV with named fields.");
    }

    const contact = value.contact && typeof value.contact === "object" ? value.contact : {};
    const links = normalizeLinks(value, contact);
    const legacyLink = (platform) => links.find((link) => link.platform === platform)?.value || "";
    const cv = {
        name: text(value.name),
        header: { name: value.header?.name !== false, title: value.header?.title !== false, photo: value.header?.photo !== false },
        customSections: entries(records(value.customSections).map((item, index) => ({ id: `custom-${text(item.id || index).replace(/^custom-/, "")}`, content: text(item.content) })), "custom"),
        contactVisibility: Object.fromEntries(["email", "phone", "location"].map((key) => [key, value.contactVisibility?.[key] !== false])),
        title: text(value.title),
        photo: photo(value.photo),
        website: legacyLink("website"),
        links,
        contact: {
            email: text(contact.email),
            phone: text(contact.phone),
            linkedin: legacyLink("linkedin"),
            github: legacyLink("github"),
            location: text(contact.location),
        },
        summary: text(value.summary),
        experience: entries(value.experience, "experience").map((item) => ({
            id: item.id, hidden: item.hidden === true,
            role: text(item.role), company: text(item.company), location: text(item.location),
            type: text(item.type), start: text(item.start), end: text(item.end),
            info: text(item.info), bullets: list(item.bullets), tech: list(item.tech),
        })),
        projects: entries(value.projects, "projects").map((item) => ({
            id: item.id, hidden: item.hidden === true,
            name: text(item.name), description: text(item.description),
            bullets: list(item.bullets), tech: list(item.tech), link: text(item.link),
        })),
        education: entries(value.education, "education").map((item) => ({
            id: item.id, hidden: item.hidden === true,
            institution: text(item.institution), course: text(item.course),
            start: text(item.start), end: text(item.end),
        })),
        certifications: entries(value.certifications, "certifications").map((item) => ({
            id: item.id, hidden: item.hidden === true,
            title: text(item.title), issuer: text(item.issuer), issued: text(item.issued),
        })),
        skills: list(value.skills),
        languages: list(value.languages),
        interests: list(value.interests),
        volunteering: entries(value.volunteering, "volunteering").map((item) => ({
            id: item.id, hidden: item.hidden === true, role: text(item.role), organization: text(item.organization),
            start: text(item.start), end: text(item.end), bullets: list(item.bullets),
        })),
    };
    cv.sections = normalizeSections(value.sections, cv);
    return cv;
}

export const blankCv = normalizeCv({});
export const exampleCv = normalizeCv(yaml.load(exampleYaml));

export function parseCv(source, filename = "") {
    let parsed;
    try {
        parsed = filename.toLowerCase().endsWith(".json") ? JSON.parse(source) : yaml.load(source);
    } catch {
        throw new Error("Could not read this file. Choose a valid YAML or JSON CV file.");
    }
    return normalizeCv(parsed);
}

export function toYaml(cv) {
    const portable = normalizeCv(cv);
    for (const group of ["links", "experience", "projects", "education", "certifications", "volunteering"]) {
        portable[group] = portable[group].map(({ id, ...item }) => item);
    }
    return yaml.dump(portable, { lineWidth: 100, noRefs: true });
}

const escapeHtml = (value) => text(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

const projectUrl = safeWebUrl;

// Stable field IDs survive pagination and let the editor point to exact text.
const field = (key, value) => `<span data-cv-field="${escapeHtml(key)}">${escapeHtml(value)}</span>`;
const joinedFields = (prefix, record, keys, separator) => keys.filter((key) => record[key]).map((key) => field(`${prefix}${key}`, record[key])).join(separator)
    + keys.filter((key) => !record[key]).map((key) => field(`${prefix}${key}`, "")).join("");

function renderedLink(link, index) {
    const content = field(`links.${index}.value`, link.value);
    const url = socialUrl(link);
    return url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${content}</a>` : content;
}

function renderSections(cv, content, column) {
    return cv.sections.filter((item) => item.enabled && (!column || item.column === column) && sectionHasContent(cv, item.id)).map((item) => {
        const customIndex = cv.customSections.findIndex((custom) => custom.id === item.id);
        const body = customIndex >= 0 ? `<p>${field(`customSections.${customIndex}.content`, cv.customSections[customIndex].content)}</p>` : content[item.id];
        return body ? `<section class="section" data-cv-section="${escapeHtml(item.id)}"><h2>${field(`sections.${cv.sections.indexOf(item)}.title`, sectionTitle(item))}</h2>${body}</section>` : "";
    }).join("");
}

export function renderCv(source, templateId = "original", selectedAccent = DEFAULT_ACCENT) {
    const cv = { ...source, contact: { ...source.contact, ...Object.fromEntries(["email", "phone", "location"].map((key) => [key, source.contactVisibility?.[key] === false ? "" : source.contact[key]])) }, name: source.header.name ? source.name : "", title: source.header.title ? source.title : "", photo: source.header.photo ? source.photo : "" };
    const accent = readableAccent(selectedAccent);
    if (templateId !== "original") return renderSingleColumn(cv, templateId, accent);
    const e = escapeHtml;
    const skills = cv.skills.filter((skill) => skill.trim()).map((skill) => `<li>${e(skill)}</li>`).join("");
    const projects = cv.projects.map((project, index) => {
        if (!hasContent(project)) return "";
        const techKey = `projects.${index}.tech`;
        const tech = project.tech.filter(Boolean).map(e).join(" · ");
        const url = projectUrl(project.link);
        return `<div class="job">
            <div class="job-header"><span><strong>${field(`projects.${index}.name`, project.name)}</strong></span></div>
            <p>${field(`projects.${index}.description`, project.description)}</p>
            ${project.bullets.some((bullet) => bullet.trim()) ? `<ul data-cv-field="projects.${index}.bullets">${project.bullets.filter((bullet) => bullet.trim()).map((bullet) => `<li>${e(bullet)}</li>`).join("")}</ul>` : field(`projects.${index}.bullets`, "")}
            ${tech ? `<p class="job-tech" data-cv-field="${techKey}"><strong>Technologies:</strong> ${tech}</p>` : field(techKey, "")}
            ${url ? `<p><a href="${e(url)}" target="_blank" rel="noopener noreferrer">${field(`projects.${index}.link`, project.link)}</a></p>` : field(`projects.${index}.link`, "")}
        </div>`;
    }).join("");
    const experience = cv.experience.map((job, index) => {
        if (!hasContent(job)) return "";
        const techKey = `experience.${index}.tech`;
        const tech = job.tech.filter(Boolean).map(e).join(" · ");
        const detail = joinedFields(`experience.${index}.`, job, ["company", "location", "type"], " - ");
        return `<div class="job">
            <div class="job-top"><span class="job-role">${field(`experience.${index}.role`, job.role)}</span><span class="job-date">${joinedFields(`experience.${index}.`, job, ["start", "end"], " - ")}</span></div>
            <div class="job-sub">${detail}</div>
            <p>${field(`experience.${index}.info`, job.info)}</p>
            <ul data-cv-field="experience.${index}.bullets">${job.bullets.filter((bullet) => bullet.trim()).map((bullet) => `<li>${e(bullet)}</li>`).join("")}</ul>
            ${tech ? `<p class="job-tech" data-cv-field="${techKey}"><strong>Technologies:</strong> ${tech}</p>` : field(techKey, "")}
        </div>`;
    }).join("");
    const education = cv.education.map((item, index) => !hasContent(item) ? "" : `<div class="job">
        <div class="job-header"><span>${field(`education.${index}.institution`, item.institution)}</span><span>${joinedFields(`education.${index}.`, item, ["start", "end"], " - ")}</span></div>
        <p>${field(`education.${index}.course`, item.course)}</p>
    </div>`).join("");
    const certifications = cv.certifications.map((item, index) => !hasContent(item) ? "" : `<span class="qual-title">${field(`certifications.${index}.title`, item.title)}</span>
        <p class="qual-meta">${joinedFields(`certifications.${index}.`, item, ["issuer", "issued"], " · ")}</p>`).join("");
    const volunteering = cv.volunteering.map((item, index) => hasContent(item) ? `<div class="job"><div class="job-top"><span class="job-role">${field(`volunteering.${index}.role`, item.role)}</span><span class="job-date">${joinedFields(`volunteering.${index}.`, item, ["start", "end"], " - ")}</span></div><div class="job-sub">${field(`volunteering.${index}.organization`, item.organization)}</div><ul data-cv-field="volunteering.${index}.bullets">${item.bullets.filter((bullet) => bullet.trim()).map((bullet) => `<li>${e(bullet)}</li>`).join("")}</ul></div>` : "").join("");
    const links = cv.links.map((link, index) => !link.hidden && link.value.trim() ? `<div class="contact-item"><strong data-cv-field="links.${index}.label">${e(linkLabel(link))}</strong><p>${renderedLink(link, index)}</p></div>` : "").join("");
    const contact = ["email", "phone", "location"].filter((key) => cv.contact[key].trim()).map((key) => `<div class="contact-item"><strong>${{ email: "Email", phone: "Phone", location: "Location" }[key]}</strong><p>${field(`contact.${key}`, cv.contact[key])}</p></div>`).join("") + links;
    const content = { summary: `<p>${field("summary", cv.summary)}</p>`, contact, experience, projects, education, certifications, volunteering,
        skills: `<ul data-cv-field="skills">${skills}</ul>`,
        ...Object.fromEntries(["languages", "interests"].map((key) => [key, `<p data-cv-field="${key}">${cv[key].filter((value) => value.trim()).map(e).join(" · ")}</p>`])),
    };
    const mainSections = renderSections(cv, content, "main");
    const sidebarSections = renderSections(cv, content, "sidebar");
    const replacements = { name: cv.name, title: cv.title, mainSections, sidebarSections };

    return template.replace("</style>", `.header h1, .section h2 { color: ${accent}; }
            ${!mainSections || !sidebarSections ? ".main { display: block; } .main > div { width: 100%; border: 0; padding: 0; } .main > div:empty { display: none; }" : ""}
            ${!cv.name.trim() && !cv.title.trim() ? "header { display: none; }" : ""}
            @media screen {
                body { padding: 14mm; }
                .page { max-width: none; margin: 0; padding: 0; }
            }
        </style>`).replace(/{{(\w+)}}/g, (_, key) => {
        const value = replacements[key] ?? "";
        const path = ["email", "phone", "linkedin", "github", "location"].includes(key) ? `contact.${key}` : key;
        return ["mainSections", "sidebarSections"].includes(key) ? value : field(path, value);
    });
}

// All CV content remains ordinary text, headings and lists. The structured
// layout has a left rail followed by the main content in both DOM and print.
function renderSingleColumn(cv, templateId, accent) {
    const e = escapeHtml;
    const dates = (item, prefix) => joinedFields(prefix, item, ["start", "end"], " - ");
    const tech = (values, key) => values.some((value) => value.trim()) ? `<p class="technology" data-cv-field="${key}"><strong>Technologies:</strong> ${values.filter((value) => value.trim()).map(e).join(" · ")}</p>` : field(key, "");
    const contact = [["contact.email", cv.contact.email], ["contact.phone", cv.contact.phone], ["contact.location", cv.contact.location]];
    const contactHtml = [...contact.filter(([, value]) => value).map(([key, value]) => field(key, value)), ...cv.links.map((link, index) => !link.hidden && link.value.trim() ? `${link.label.trim() ? `${field(`links.${index}.label`, link.label)}: ` : ""}${renderedLink(link, index)}` : "").filter(Boolean)].join(" · ") + contact.filter(([, value]) => !value).map(([key]) => field(key, "")).join("");
    const experience = cv.experience.map((job, index) => !hasContent(job) ? "" : `<article>
        <h3>${field(`experience.${index}.role`, job.role)}</h3>
        <p class="meta">${joinedFields(`experience.${index}.`, job, ["company", "location", "type"], " · ")}${(job.company || job.location || job.type) && (job.start || job.end) ? " - " : ""}${dates(job, `experience.${index}.`)}</p>
        <p>${field(`experience.${index}.info`, job.info)}</p>
        ${job.bullets.some((value) => value.trim()) ? `<ul data-cv-field="experience.${index}.bullets">${job.bullets.filter((value) => value.trim()).map((value) => `<li>${e(value)}</li>`).join("")}</ul>` : field(`experience.${index}.bullets`, "")}
        ${tech(job.tech, `experience.${index}.tech`)}
    </article>`).join("");
    const projects = cv.projects.map((project, index) => !hasContent(project) ? "" : `<article><h3>${field(`projects.${index}.name`, project.name)}</h3>
        <p>${field(`projects.${index}.description`, project.description)}</p>
        ${project.bullets.some((value) => value.trim()) ? `<ul data-cv-field="projects.${index}.bullets">${project.bullets.filter((value) => value.trim()).map((value) => `<li>${e(value)}</li>`).join("")}</ul>` : field(`projects.${index}.bullets`, "")}
        ${tech(project.tech, `projects.${index}.tech`)}
        ${projectUrl(project.link) ? `<p class="project-link"><a href="${e(projectUrl(project.link))}" target="_blank" rel="noopener noreferrer">${field(`projects.${index}.link`, project.link)}</a></p>` : field(`projects.${index}.link`, "")}
    </article>`).join("");
    const education = cv.education.map((item, index) => !hasContent(item) ? "" : `<article><h3>${field(`education.${index}.institution`, item.institution)}</h3><p>${field(`education.${index}.course`, item.course)}</p><p class="meta">${dates(item, `education.${index}.`)}</p></article>`).join("");
    const certifications = cv.certifications.map((item, index) => !hasContent(item) ? "" : `<article class="certificate"><h3>${field(`certifications.${index}.title`, item.title)}</h3><p class="meta">${joinedFields(`certifications.${index}.`, item, ["issuer", "issued"], " · ")}</p></article>`).join("");
    const volunteering = cv.volunteering.map((item, index) => hasContent(item) ? `<article><h3>${field(`volunteering.${index}.role`, item.role)}</h3><p class="meta">${field(`volunteering.${index}.organization`, item.organization)}${item.organization && (item.start || item.end) ? " · " : ""}${dates(item, `volunteering.${index}.`)}</p>${item.bullets.some((value) => value.trim()) ? `<ul data-cv-field="volunteering.${index}.bullets">${item.bullets.filter((value) => value.trim()).map((value) => `<li>${e(value)}</li>`).join("")}</ul>` : field(`volunteering.${index}.bullets`, "")}</article>` : "").join("");
    const optionalList = (key, values) => values.some((value) => value.trim()) ? `<p data-cv-field="${key}">${values.filter((value) => value.trim()).map(e).join(" · ")}</p>` : field(key, "");
    const style = {
        editorial: `body { font-size: 13px; line-height: 1.6; } header { border-bottom-width: 1px; padding-bottom: 19px; margin-bottom: 24px; } h1 { font: 38px/1.1 Georgia, serif; letter-spacing: -.8px; color: ${accent}; } .title { margin-top: 7px; color: #444; } h2 { font: bold 17px/1.25 Georgia, serif; text-transform: none; letter-spacing: 0; border: 0; margin-bottom: 12px; } section { margin-bottom: 24px; } article { margin-bottom: 16px; }`,
        essential: `body { line-height: 1.42; } header { padding-bottom: 12px; margin-bottom: 16px; } section { margin-bottom: 10px; } h2 { margin-bottom: 6px; color: ${accent}; } article { margin-bottom: 8px; } .meta { margin-bottom: 3px; }`,
        modern: `header.modern-head { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 18px; min-height: 144px; padding: 20px 24px; border: 0; overflow: hidden; background: #f3f5f8; }
            .modern-head::before { content: ""; position: absolute; right: -55px; top: -65px; width: 220px; height: 230px; border-radius: 38px; transform: rotate(28deg); background: ${accent}; }
            .modern-head .identity { position: relative; z-index: 1; min-width: 0; max-width: 75%; }
            .modern-head h1 { font-size: 34px; color: #20242c; overflow-wrap: anywhere; }
            .modern-head .title { color: ${accent}; font-weight: 700; }
            .modern-head .contact { max-width: 420px; }
            .modern-head .photo-frame { position: relative; z-index: 1; flex: 0 0 106px; width: 106px; height: 106px; overflow: hidden; border: 4px solid white; border-radius: 50%; background: white; }
            .modern-head .photo-frame img { width: 100%; height: 100%; display: block; object-fit: cover; }
            main.modern-layout h2 { display: flex; align-items: center; gap: 10px; border: 0; color: ${accent}; }
            main.modern-layout h2::after { content: ""; flex: 1; height: 1px; background: #cbd1d8; }
            main.modern-layout article { margin-bottom: 15px; }`,
        structured: `header.structured-head { padding-bottom: 15px; border-bottom: 4px solid ${accent}; }
            .structured-head h1 { color: ${accent}; }
            .structured-grid { display: grid; grid-template-columns: minmax(0, 31%) minmax(0, 1fr); gap: 24px; align-items: start; }
            .structured-grid .left { min-width: 0; padding-right: 18px; border-right: 1px solid #d5d9de; }
            .structured-grid .right { min-width: 0; }
            .structured-grid .left h2 { color: ${accent}; border: 0; }
            .structured-grid .right h2 { color: ${accent}; border: 0; border-left: 3px solid ${accent}; padding-left: 9px; }
            .structured-grid .contact { line-height: 1.65; }
            .structured-grid .meta { color: #444; }
            .structured-grid h3 { font-size: 15px; }`,
        minimal: `body { font-size: 13px; line-height: 1.6; }
            header.minimal-head { display: grid; grid-template-columns: minmax(0, 1fr) 190px; align-items: end; gap: 24px; padding-bottom: 20px; margin-bottom: 24px; border-bottom: 1px solid #bbb; }
            .minimal-head h1 { font: 36px/1.12 Georgia, serif; color: ${accent}; overflow-wrap: anywhere; }
            .minimal-head .contact { text-align: right; }
            main.minimal-layout section { position: relative; padding-left: 132px; margin-bottom: 24px; }
            main.minimal-layout h2 { position: absolute; left: 0; top: 0; width: 115px; margin: 0; padding: 0; border: 0; font-size: 10px; line-height: 1.5; letter-spacing: 1.5px; color: ${accent}; }
            main.minimal-layout article { margin-bottom: 15px; }`,
    }[templateId] || "";

    const content = { summary: `<p>${field("summary", cv.summary)}</p>`, contact: `<p class="contact">${contactHtml}</p>`, experience, projects, education, certifications, volunteering,
        ...Object.fromEntries(["skills", "languages", "interests"].map((key) => [key, optionalList(key, cv[key])])),
    };
    const identity = `<h1>${field("name", cv.name)}</h1><p class="title">${field("title", cv.title)}</p>`;
    const headerHtml = `<header class="${templateId}-head"><div class="identity">${identity}</div>${templateId === "modern" && cv.photo ? `<span class="photo-frame"><img data-cv-field="photo" src="${e(cv.photo)}" alt=""></span>` : ""}</header>`;
    const mainSections = renderSections(cv, content, "main");
    const sidebarSections = renderSections(cv, content, "sidebar");
    const mainHtml = templateId === "structured" && mainSections && sidebarSections
        ? `<main class="main structured-grid"><div class="left">${sidebarSections}</div><div class="right">${mainSections}</div></main>`
        : `<main class="${templateId === "modern" ? "modern-layout" : templateId === "minimal" ? "minimal-layout" : ""}">${renderSections(cv, content)}</main>`;

    return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>CV</title><style>
        @page { size: A4; margin: 14mm; }
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #fff; color: #222; color-scheme: light; }
        body { font: 13px/1.5 Arial, sans-serif; }
        header { border-bottom: 2px solid #222; padding-bottom: 16px; margin-bottom: 20px; }
        h1 { font-size: 30px; line-height: 1.12; margin: 0 0 5px; letter-spacing: -.4px; }
        .title { font-size: 15px; margin-bottom: 8px; }
        .contact { font-size: 11px; color: #444; overflow-wrap: anywhere; }
        .contact a { color: inherit; text-decoration: none; }
        section { margin-bottom: 18px; }
        h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px; padding-bottom: 4px; border-bottom: 1px solid #ccc; break-after: avoid; }
        h3 { font-size: 14px; margin: 0 0 2px; }
        article { margin-bottom: 12px; break-inside: avoid; }
        article:last-child { margin-bottom: 0; }
        p { margin: 0; white-space: pre-line; overflow-wrap: anywhere; }
        .meta { font-size: 12px; color: #555; margin-bottom: 5px; }
        ul { margin: 5px 0 0; padding-left: 18px; }
        li { margin-bottom: 3px; }
        .technology, .project-link { font-size: 11px; margin-top: 4px; }
        a { color: #222; overflow-wrap: anywhere; }
        .certificate { margin-bottom: 9px; }
        .certificate h3 { font-size: 13px; }
        ${style}
        header.minimal-head { display: block; }
        ${!cv.name.trim() && !cv.title.trim() && !(templateId === "modern" && cv.photo) ? "header { display: none; }" : ""}
        @media screen { body { padding: 14mm; } }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style></head><body>${headerHtml}${mainHtml}</body></html>`;
}
