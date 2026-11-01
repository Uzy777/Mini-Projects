// Section choices travel with the CV, independently of its visual template.
export const SECTION_TYPES = [
    { id: "contact", title: "Contact", column: "sidebar", description: "Email, phone, location and online links." },
    { id: "summary", title: "Summary", column: "main", description: "A short introduction in your own words." },
    { id: "experience", title: "Experience", column: "main", description: "Employment, freelance work and placements." },
    { id: "projects", title: "Projects", column: "main", description: "Selected work, personal projects or portfolios." },
    { id: "education", title: "Education", column: "sidebar", description: "Degrees, courses and training." },
    { id: "certifications", title: "Certifications", column: "sidebar", description: "Professional certificates and licences." },
    { id: "skills", title: "Skills", column: "sidebar", description: "The abilities relevant to your next role." },
    { id: "volunteering", title: "Volunteering", column: "main", description: "Community, charity and unpaid work." },
    { id: "languages", title: "Languages", column: "sidebar", description: "Languages and your level of proficiency." },
    { id: "interests", title: "Interests", column: "sidebar", description: "Interests you would like to share." },
];

export function hasContent(value) {
    if (typeof value === "string") return Boolean(value.trim());
    if (Array.isArray(value)) return value.some(hasContent);
    if (!value || typeof value !== "object" || value.hidden === true) return false;
    return Object.entries(value).some(([key, item]) => !["id", "hidden", "platform", "label"].includes(key) && hasContent(item));
}

export function sectionHasContent(cv, id) {
    if (id === "contact") return hasContent([...["email", "phone", "location"].map((key) => cv.contactVisibility?.[key] === false ? "" : cv.contact[key]), ...cv.links.filter((link) => !link.hidden).map((link) => link.value)]);
    if (id.startsWith("custom-")) return hasContent(cv.customSections.find((item) => item.id === id)?.content);
    return hasContent(cv[id]);
}

export function normalizeSections(value, cv) {
    const definitions = [...SECTION_TYPES, ...cv.customSections.map((item) => ({ id: item.id, title: "Custom section", column: "main" }))];
    const saved = Array.isArray(value) ? value : [];
    const ordered = [];
    const seen = new Set();
    for (const entry of [...saved, ...definitions]) {
        const definition = definitions.find((item) => item.id === entry?.id);
        if (!definition || seen.has(definition.id)) continue;
        seen.add(definition.id);
        const settings = saved.find((item) => item?.id === definition.id);
        ordered.push({
            id: definition.id,
            title: typeof settings?.title === "string" ? settings.title : definition.title,
            enabled: typeof settings?.enabled === "boolean" ? settings.enabled : sectionHasContent(cv, definition.id),
            column: ["main", "sidebar"].includes(settings?.column) ? settings.column : definition.column,
        });
    }
    return ordered;
}

export function sectionTitle(section = { title: "", id: "" }) {
    return section.title.trim() || SECTION_TYPES.find((item) => item.id === section.id)?.title || "Custom section";
}

export function moveSection(sections, id, direction, column) {
    const visible = sections.filter((item) => item.enabled && (!column || item.column === column));
    const index = visible.findIndex((item) => item.id === id);
    const target = visible[index + direction];
    if (index < 0 || !target) return sections;
    const next = [...sections];
    const from = next.findIndex((item) => item.id === id);
    const to = next.findIndex((item) => item.id === target.id);
    [next[from], next[to]] = [next[to], next[from]];
    return next;
}
