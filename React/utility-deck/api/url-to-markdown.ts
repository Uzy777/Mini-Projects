import { convertHtmlToMarkdown } from "../server/convertHtmlToMarkdown";
import { renderPage } from "../server/renderPage";
import { assertPublicUrl } from "../server/assertPublicUrl";
import { fetchPublicHtml } from "../server/fetchPublicHtml";

type UrlToMarkdownRequest = {
    url?: string;
};

function isValidHttpUrl(value: string): boolean {
    try {
        const parsedUrl = new URL(value);

        return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch {
        return false;
    }
}

export async function POST(request: Request) {
    const body = (await request.json()) as UrlToMarkdownRequest;
    const url = body.url?.trim();

    if (!url) {
        return Response.json(
            {
                error: "A URL is required.",
            },
            {
                status: 400,
            },
        );
    }

    if (!isValidHttpUrl(url)) {
        return Response.json(
            {
                error: "Enter a valid HTTP or HTTPS URL.",
            },
            {
                status: 400,
            },
        );
    }

    let safeUrlString: string;

    try {
        const safeUrl = await assertPublicUrl(url);
        safeUrlString = safeUrl.toString();
    } catch (error) {
        const message = error instanceof Error ? error.message : "The supplied URL is not allowed.";

        return Response.json(
            {
                error: message,
            },
            {
                status: 400,
            },
        );
    }

    const { html, finalUrl } = await fetchPublicHtml(safeUrlString);

    let conversion = convertHtmlToMarkdown(html, finalUrl);

    if (!conversion) {
        const renderedHtml = await renderPage(finalUrl);

        conversion = convertHtmlToMarkdown(renderedHtml, finalUrl);
    }

    if (!conversion) {
        return Response.json(
            {
                error: "No readable content could be extracted from this page.",
            },
            {
                status: 422,
            },
        );
    }

    return Response.json({
        sourceUrl: finalUrl,
        title: conversion.title,
        markdown: conversion.markdown,
    });
}
