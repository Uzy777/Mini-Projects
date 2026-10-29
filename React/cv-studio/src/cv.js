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

export function renderCv(cv, templateId = "original") {
    if (templateId === "essential" || templateId === "editorial") return renderSingleColumn(cv, templateId);
    const e = escapeHtml;
    const skills = cv.skills.filter((skill) => skill.trim()).map((skill) => `<li>${e(skill)}</li>`).join("");
    const projects = cv.projects.map((project) => {
        const tech = project.tech.filter(Boolean).map(e).join(" · ");
        const url = projectUrl(project.link);
        return `<div class="job">
            <div class="job-header"><span><strong>${e(project.name)}</strong></span></div>
            <p>${e(project.description)}</p>
            ${tech ? `<p class="job-tech"><strong>Technologies:</strong> ${tech}</p>` : ""}
            ${url ? `<p><a href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(project.link)}</a></p>` : ""}
        </div>`;
    }).join("");
    const experience = cv.experience.map((job) => {
        const tech = job.tech.filter(Boolean).map(e).join(" · ");
        const detail = [job.company, job.location, job.type].filter(Boolean).map(e).join(" - ");
        return `<div class="job">
            <div class="job-top"><span class="job-role">${e(job.role)}</span><span class="job-date">${e(job.start)} - ${e(job.end)}</span></div>
            <div class="job-sub">${detail}</div>
            <p>${e(job.info)}</p>
            <ul>${job.bullets.filter((bullet) => bullet.trim()).map((bullet) => `<li>${e(bullet)}</li>`).join("")}</ul>
            ${tech ? `<p class="job-tech"><strong>Technologies:</strong> ${tech}</p>` : ""}
        </div>`;
    }).join("");
    const education = cv.education.map((item) => `<div class="job">
        <div class="job-header"><span>${e(item.institution)}</span><span>${e(item.start)} - ${e(item.end)}</span></div>
        <p>${e(item.course)}</p>
    </div>`).join("");
    const certifications = cv.certifications.map((item) => `<span class="qual-title">${e(item.title)}</span>
        <p class="qual-meta">${e(item.issuer)} | ${e(item.issued)}</p>`).join("");

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
        return ["skills", "projects", "experience", "education", "certifications"].includes(key) ? value : e(value);
    });
}

// These layouts keep the visual and DOM reading order identical. All CV content
// is ordinary text, headings and lists; the surrounding app theme never enters here.
function renderSingleColumn(cv, templateId) {
    const e = escapeHtml;
    const dates = (item) => [item.start, item.end].filter(Boolean).map(e).join(" - ");
    const section = (heading, content) => content ? `<section><h2>${heading}</h2>${content}</section>` : "";
    const tech = (values) => values.some((value) => value.trim()) ? `<p class="technology"><strong>Technologies:</strong> ${values.filter((value) => value.trim()).map(e).join(" · ")}</p>` : "";
    const contact = [cv.contact.email, cv.contact.phone, cv.contact.location, cv.website, cv.contact.linkedin, cv.contact.github].filter(Boolean).map(e).join(" · ");
    const experience = cv.experience.map((job) => `<article>
        <h3>${e(job.role)}</h3>
        <p class="meta">${[job.company, job.location, job.type].filter(Boolean).map(e).join(" · ")}${dates(job) ? ` - ${dates(job)}` : ""}</p>
        ${job.info ? `<p>${e(job.info)}</p>` : ""}
        ${job.bullets.some((value) => value.trim()) ? `<ul>${job.bullets.filter((value) => value.trim()).map((value) => `<li>${e(value)}</li>`).join("")}</ul>` : ""}
        ${tech(job.tech)}
    </article>`).join("");
    const projects = cv.projects.map((project) => `<article><h3>${e(project.name)}</h3>
        <p>${e(project.description)}</p>${tech(project.tech)}
        ${projectUrl(project.link) ? `<p class="project-link"><a href="${e(projectUrl(project.link))}" target="_blank" rel="noopener noreferrer">${e(project.link)}</a></p>` : ""}
    </article>`).join("");
    const education = cv.education.map((item) => `<article><h3>${e(item.institution)}</h3><p>${e(item.course)}</p><p class="meta">${dates(item)}</p></article>`).join("");
    const certifications = cv.certifications.map((item) => `<article class="certificate"><h3>${e(item.title)}</h3><p class="meta">${[item.issuer, item.issued].filter(Boolean).map(e).join(" · ")}</p></article>`).join("");

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
    </style></head><body><header><h1>${e(cv.name)}</h1><p class="title">${e(cv.title)}</p><p class="contact">${contact}</p></header><main>
        ${section("Professional Profile", cv.summary ? `<p>${e(cv.summary)}</p>` : "")}
        ${section("Professional Experience", experience)}
        ${section("Projects", projects)}
        ${section("Education", education)}
        ${section("Certifications", certifications)}
        ${section("Skills", cv.skills.some((value) => value.trim()) ? `<p>${cv.skills.filter((value) => value.trim()).map(e).join(" · ")}</p>` : "")}
        ${section("References", "<p>Available upon request.</p>")}
    </main></body></html>`;
}
