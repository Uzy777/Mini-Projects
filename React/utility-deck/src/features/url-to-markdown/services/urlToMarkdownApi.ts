import type { UrlToMarkdownResult } from "../types/urlToMarkdown.types";

type ApiErrorResponse = {
    error?: string;
};

export async function requestUrlToMarkdown(url: string): Promise<UrlToMarkdownResult> {
    const response = await fetch("/api/url-to-markdown", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
    });

    const responseText = await response.text();

    let data: UrlToMarkdownResult | ApiErrorResponse;

    try {
        data = JSON.parse(responseText) as UrlToMarkdownResult | ApiErrorResponse;
    } catch {
        throw new Error(response.ok ? "The server returned an invalid response." : `The server failed with status ${response.status}.`);
    }

    if (!response.ok) {
        const message = "error" in data && data.error ? data.error : `The conversion failed with status ${response.status}.`;

        throw new Error(message);
    }

    return data as UrlToMarkdownResult;
}
