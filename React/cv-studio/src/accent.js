export const DEFAULT_ACCENT = "#2563eb";

export function validAccent(value) {
    return /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : DEFAULT_ACCENT;
}

const rgb = (hex) => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
const hex = (channels) => `#${channels.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
const luminance = (channels) => channels.map((value) => {
    const unit = value / 255;
    return unit <= 0.04045 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
}).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);

// Preserve the selected hue while making text and filled controls readable.
export function readableAccent(value, background = "#ffffff", minimum = 4.5) {
    const selected = rgb(validAccent(value));
    const backdrop = luminance(rgb(background));
    const contrast = (channels) => {
        const foreground = luminance(channels);
        return (Math.max(foreground, backdrop) + 0.05) / (Math.min(foreground, backdrop) + 0.05);
    };
    if (contrast(selected) >= minimum) return hex(selected);
    const target = backdrop > 0.5 ? 0 : 255;
    let low = 0;
    let high = 1;
    for (let index = 0; index < 20; index += 1) {
        const middle = (low + high) / 2;
        const candidate = selected.map((channel) => channel + (target - channel) * middle);
        if (contrast(candidate) >= minimum) high = middle;
        else low = middle;
    }
    return hex(selected.map((channel) => channel + (target - channel) * high));
}
