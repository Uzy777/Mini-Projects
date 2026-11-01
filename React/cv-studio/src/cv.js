import yaml from "js-yaml";
import template from "./cv-template.html?raw";
import exampleYaml from "./example.yaml?raw";

export const STORAGE_KEY = "cv-studio-draft-v1";
export const TEMPLATES = [
    { id: "original", name: "Original", description: "Your signature two-column layout.", detail: "Two columns · Blue accents", tag: "Default" },
    { id: "essential", name: "Essential", description: "A clear, straightforward reading order.", detail: "One column · Sans serif", tag: "Simple" },
    { id: "editorial", name: "Editorial", description: "Classic typography with room to breathe.", detail: "One column · Serif headings", tag: "Classic" },
];

const text = (value) => (value == null ? "" : String(value));
const list = (value) => (Array.isArray(value) ? value.map(text) : []);
const records = (value) => (Array.isArray(value) ? value.filter((item) => item && typeof item === "object" && !Array.isArray(item)) : []);

export function normalizeCv(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("The file must contain a CV with named fields.");
    }

    const contact = value.contact && typeof value.contact === "object" ? value.contact : {};
    return {
        name: text(value.name),
        title: text(value.title),
        website: text(value.website),
        contact: {
            email: text(contact.email),
            phone: text(contact.phone),
            linkedin: text(contact.linkedin),
            github: text(contact.github),
            location: text(contact.location),
        },
        summary: text(value.summary),
        experience: records(value.experience).map((item) => ({
            role: text(item.role), company: text(item.company), location: text(item.location),
            type: text(item.type), start: text(item.start), end: text(item.end),
            info: text(item.info), bullets: list(item.bullets), tech: list(item.tech),
        })),
        projects: records(value.projects).map((item) => ({
            name: text(item.name), description: text(item.description),
            bullets: list(item.bullets), tech: list(item.tech), link: text(item.link),
        })),
        education: records(value.education).map((item) => ({
            institution: text(item.institution), course: text(item.course),
            start: text(item.start), end: text(item.end),
        })),
        certifications: records(value.certifications).map((item) => ({
            title: text(item.title), issuer: text(item.issuer), issued: text(item.issued),
        })),
        skills: list(value.skills),
    };
}

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
    return yaml.dump(cv, { lineWidth: 100, noRefs: true });
}

const escapeHtml = (value) => text(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

function projectUrl(value) {
    const input = text(value).trim();
    if (!input) return "";
    try {
        const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
        return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
        return "";
    }
}

// Stable field IDs survive pagination and let the editor point to exact text.
const field = (key, value) => `<span data-cv-field="${escapeHtml(key)}">${escapeHtml(value)}</span>`;
const joinedFields = (prefix, record, keys, separator) => keys.filter((key) => record[key]).map((key) => field(`${prefix}${key}`, record[key])).join(separator)
    + keys.filter((key) => !record[key]).map((key) => field(`${prefix}${key}`, "")).join("");

export function renderCv(cv, templateId = "original") {
    if (templateId === "essential" || templateId === "editorial") return renderSingleColumn(cv, templateId);
    const e = escapeHtml;
    const skills = cv.skills.filter((skill) => skill.trim()).map((skill) => `<li>${e(skill)}</li>`).join("");
    const projects = cv.projects.map((project, index) => {
        const techKey = `projects.${index}.tech`;
        const tech = project.tech.filter(Boolean).map(e).join(" · ");
        const url = projectUrl(project.link);
        return `<div class="job">
            <div class="job-header"><span><strong>${field(`projects.${index}.name`, project.name)}</strong></span></div>
            <p>${field(`projects.${index}.description`, project.description)}</p>
            ${tech ? `<p class="job-tech" data-cv-field="${techKey}"><strong>Technologies:</strong> ${tech}</p>` : field(techKey, "")}
            ${url ? `<p><a href="${e(url)}" target="_blank" rel="noopener noreferrer">${field(`projects.${index}.link`, project.link)}</a></p>` : field(`projects.${index}.link`, "")}
        </div>`;
    }).join("");
    const experience = cv.experience.map((job, index) => {
        const techKey = `experience.${index}.tech`;
        const tech = job.tech.filter(Boolean).map(e).join(" · ");
        const detail = joinedFields(`experience.${index}.`, job, ["company", "location", "type"], " - ");
        return `<div class="job">
            <div class="job-top"><span class="job-role">${field(`experience.${index}.role`, job.role)}</span><span class="job-date">${field(`experience.${index}.start`, job.start)} - ${field(`experience.${index}.end`, job.end)}</span></div>
            <div class="job-sub">${detail}</div>
            <p>${field(`experience.${index}.info`, job.info)}</p>
            <ul data-cv-field="experience.${index}.bullets">${job.bullets.filter((bullet) => bullet.trim()).map((bullet) => `<li>${e(bullet)}</li>`).join("")}</ul>
            ${tech ? `<p class="job-tech" data-cv-field="${techKey}"><strong>Technologies:</strong> ${tech}</p>` : field(techKey, "")}
        </div>`;
    }).join("");
    const education = cv.education.map((item, index) => `<div class="job">
        <div class="job-header"><span>${field(`education.${index}.institution`, item.institution)}</span><span>${field(`education.${index}.start`, item.start)} - ${field(`education.${index}.end`, item.end)}</span></div>
        <p>${field(`education.${index}.course`, item.course)}</p>
    </div>`).join("");
    const certifications = cv.certifications.map((item, index) => `<span class="qual-title">${field(`certifications.${index}.title`, item.title)}</span>
        <p class="qual-meta">${field(`certifications.${index}.issuer`, item.issuer)} | ${field(`certifications.${index}.issued`, item.issued)}</p>`).join("");

    const replacements = {
        name: cv.name, title: cv.title, summary: cv.summary,
        email: cv.contact.email, phone: cv.contact.phone, linkedin: cv.contact.linkedin,
        github: cv.contact.github, location: cv.contact.location, website: cv.website,
        skills, projects, experience, education, certifications,
    };

    return template.replace("</style>", `@media screen {
                body { padding: 14mm; }
                .page { max-width: none; margin: 0; padding: 0; }
            }
        </style>`).replace(/{{(\w+)}}/g, (_, key) => {
        const value = replacements[key] ?? "";
        const path = ["email", "phone", "linkedin", "github", "location"].includes(key) ? `contact.${key}` : key;
        return ["skills", "projects", "experience", "education", "certifications"].includes(key) ? value : field(path, value);
    });
}

// These layouts keep the visual and DOM reading order identical. All CV content
// is ordinary text, headings and lists; the surrounding app theme never enters here.
function renderSingleColumn(cv, templateId) {
    const e = escapeHtml;
    const dates = (item, prefix) => joinedFields(prefix, item, ["start", "end"], " - ");
    const section = (heading, content) => content ? `<section><h2>${heading}</h2>${content}</section>` : "";
    const tech = (values, key) => values.some((value) => value.trim()) ? `<p class="technology" data-cv-field="${key}"><strong>Technologies:</strong> ${values.filter((value) => value.trim()).map(e).join(" · ")}</p>` : field(key, "");
    const contact = [["contact.email", cv.contact.email], ["contact.phone", cv.contact.phone], ["contact.location", cv.contact.location], ["website", cv.website], ["contact.linkedin", cv.contact.linkedin], ["contact.github", cv.contact.github]];
    const contactHtml = contact.filter(([, value]) => value).map(([key, value]) => field(key, value)).join(" · ") + contact.filter(([, value]) => !value).map(([key]) => field(key, "")).join("");
    const experience = cv.experience.map((job, index) => `<article>
        <h3>${field(`experience.${index}.role`, job.role)}</h3>
        <p class="meta">${joinedFields(`experience.${index}.`, job, ["company", "location", "type"], " · ")}${job.start || job.end ? " - " : ""}${dates(job, `experience.${index}.`)}</p>
        <p>${field(`experience.${index}.info`, job.info)}</p>
        ${job.bullets.some((value) => value.trim()) ? `<ul data-cv-field="experience.${index}.bullets">${job.bullets.filter((value) => value.trim()).map((value) => `<li>${e(value)}</li>`).join("")}</ul>` : field(`experience.${index}.bullets`, "")}
        ${tech(job.tech, `experience.${index}.tech`)}
    </article>`).join("");
    const projects = cv.projects.map((project, index) => `<article><h3>${field(`projects.${index}.name`, project.name)}</h3>
        <p>${field(`projects.${index}.description`, project.description)}</p>${tech(project.tech, `projects.${index}.tech`)}
        ${projectUrl(project.link) ? `<p class="project-link"><a href="${e(projectUrl(project.link))}" target="_blank" rel="noopener noreferrer">${field(`projects.${index}.link`, project.link)}</a></p>` : field(`projects.${index}.link`, "")}
    </article>`).join("");
    const education = cv.education.map((item, index) => `<article><h3>${field(`education.${index}.institution`, item.institution)}</h3><p>${field(`education.${index}.course`, item.course)}</p><p class="meta">${dates(item, `education.${index}.`)}</p></article>`).join("");
    const certifications = cv.certifications.map((item, index) => `<article class="certificate"><h3>${field(`certifications.${index}.title`, item.title)}</h3><p class="meta">${joinedFields(`certifications.${index}.`, item, ["issuer", "issued"], " · ")}</p></article>`).join("");

    return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>CV</title><style>
        @page { size: A4; margin: 14mm; }
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #fff; color: #222; color-scheme: light; }
        body { font: 13px/1.5 Arial, sans-serif; }
        header { border-bottom: 2px solid #222; padding-bottom: 16px; margin-bottom: 20px; }
        h1 { font-size: 30px; line-height: 1.12; margin: 0 0 5px; letter-spacing: -.4px; }
        .title { font-size: 15px; margin-bottom: 8px; }
        .contact { font-size: 11px; color: #444; overflow-wrap: anywhere; }
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
        ${templateId === "editorial" ? `
            body { font-size: 13px; line-height: 1.6; }
            header { border-bottom-width: 1px; padding-bottom: 19px; margin-bottom: 24px; }
            h1 { font: 38px/1.1 Georgia, serif; letter-spacing: -.8px; }
            .title { margin-top: 7px; color: #444; }
            h2 { font: bold 17px/1.25 Georgia, serif; text-transform: none; letter-spacing: 0; border: 0; margin-bottom: 12px; }
            section { margin-bottom: 24px; }
            article { margin-bottom: 16px; }
        ` : `
            body { line-height: 1.42; }
            header { padding-bottom: 12px; margin-bottom: 16px; }
            section { margin-bottom: 10px; }
            h2 { margin-bottom: 6px; }
            article { margin-bottom: 8px; }
            .meta { margin-bottom: 3px; }
        `}
        @media screen { body { padding: 14mm; } }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    </style></head><body><header><h1>${field("name", cv.name)}</h1><p class="title">${field("title", cv.title)}</p><p class="contact">${contactHtml}</p></header><main>
        ${section("Professional Profile", cv.summary ? `<p>${field("summary", cv.summary)}</p>` : "")}${!cv.summary ? field("summary", "") : ""}
        ${section("Professional Experience", experience)}
        ${section("Projects", projects)}
        ${section("Education", education)}
        ${section("Certifications", certifications)}
        ${section("Skills", cv.skills.some((value) => value.trim()) ? `<p data-cv-field="skills">${cv.skills.filter((value) => value.trim()).map(e).join(" · ")}</p>` : "")}
        ${!cv.skills.some((value) => value.trim()) ? field("skills", "") : ""}
        ${section("References", "<p>Available upon request.</p>")}
    </main></body></html>`;
}
