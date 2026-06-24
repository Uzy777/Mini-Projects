import type { UrlToMarkdownResult } from "../types/urlToMarkdown.types";

export async function requestUrlToMarkdown(url: string): Promise<UrlToMarkdownResult> {
    const response = await fetch("/api/url-to-markdown", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
    });

    const data = (await response.json()) as UrlToMarkdownResult;

    return data;
}
