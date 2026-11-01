export const LINK_TYPES = [
    { id: "linkedin", label: "LinkedIn", icon: "linkedin", placeholder: "linkedin.com/in/you", base: "https://www.linkedin.com/in/" },
    { id: "github", label: "GitHub", icon: "github", placeholder: "github.com/you", base: "https://github.com/" },
    { id: "website", label: "Website", icon: "globe", placeholder: "your-site.com" },
    { id: "portfolio", label: "Portfolio", icon: "portfolio", placeholder: "your-portfolio.com" },
    { id: "gitlab", label: "GitLab", icon: "gitlab", placeholder: "gitlab.com/you", base: "https://gitlab.com/" },
    { id: "youtube", label: "YouTube", icon: "youtube", placeholder: "youtube.com/@you", base: "https://www.youtube.com/@" },
    { id: "other", label: "Other link", icon: "link", placeholder: "example.com/you" },
];

export const linkType = (platform) => LINK_TYPES.find((type) => type.id === platform) || LINK_TYPES.at(-1);
export const linkLabel = (link) => link.label.trim() || linkType(link.platform).label;

export function safeWebUrl(value) {
    const input = String(value || "").trim();
    if (!input || /\s/.test(input)) return "";
    if (/^[a-z][a-z\d+.-]*:/i.test(input) && !/^https?:\/\//i.test(input)) return "";
    try {
        const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
        if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || !url.hostname.includes(".")) return "";
        return url.href;
    } catch { return ""; }
}

export function socialUrl(link) {
    const input = link.value.trim();
    const type = linkType(link.platform);
    if (type.base && /^@?[\w-]+$/.test(input)) return `${type.base}${encodeURIComponent(input.replace(/^@/, ""))}`;
    return safeWebUrl(input);
}

// Removed picker options remain recoverable as custom links in existing drafts.
const retiredTypes = {
    codepen: { label: "CodePen", base: "https://codepen.io/" },
    behance: { label: "Behance", base: "https://www.behance.net/" },
    dribbble: { label: "Dribbble", base: "https://dribbble.com/" },
};

// Old YAML/drafts are upgraded once. An explicit empty list means the user
// removed their links, so legacy fields must not bring them back on reload.
export function normalizeLinks(value, contact) {
    const source = Array.isArray(value.links) ? value.links : [
        { platform: "linkedin", value: contact.linkedin },
        { platform: "github", value: contact.github },
        { platform: "website", value: value.website },
    ].filter((link) => link.value);
    const ids = new Set();
    return source.filter((link) => link && typeof link === "object" && !Array.isArray(link)).map((link, index) => {
        let id = typeof link.id === "string" && link.id ? link.id : `link-${index}`;
        while (ids.has(id)) id += "-copy";
        ids.add(id);
        const retired = Object.hasOwn(retiredTypes, link.platform) ? retiredTypes[link.platform] : null;
        const raw = String(link.value ?? "");
        const value = retired && /^@?[\w-]+$/.test(raw.trim()) ? retired.base + encodeURIComponent(raw.trim().replace(/^@/, "")) : raw;
        return { id, platform: linkType(link.platform).id, label: String(link.label || retired?.label || ""), value };
    });
}
