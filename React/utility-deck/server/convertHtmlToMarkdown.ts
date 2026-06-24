import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";

export type MarkdownConversion = {
    title: string;
    markdown: string;
};

export function convertHtmlToMarkdown(html: string, url: string): MarkdownConversion | null {
    const dom = new JSDOM(html, { url });

    const article = new Readability(dom.window.document).parse();

    const articleContent = article?.content?.trim();
    const textContent = article?.textContent?.trim();

    if (!article || !articleContent || !textContent) {
        return null;
    }

    const title = article.title?.trim() || new URL(url).hostname;

    const turndownService = new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
        bulletListMarker: "-",
    });

    const markdown = turndownService.turndown(articleContent).trim();

    if (!markdown) {
        return null;
    }

    return {
        title,
        markdown,
    };
}
