// import { JSDOM } from "jsdom";
// import { Readability } from "@mozilla/readability";
// import TurndownService from "turndown";

import { convertHtmlToMarkdown } from "../server/convertHtmlToMarkdown";
import { renderPage } from "../server/renderPage";

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

    const webpageResponse = await fetch(url);
    const html = await webpageResponse.text();
    // const dom = new JSDOM(html, {
    //     url,
    // });

    // const document = dom.window.document;
    // const article = new Readability(document).parse();

    // if (!article) {
    //     return Response.json(
    //         {
    //             error: "No readable content could be extracted from this page.",
    //         },
    //         {
    //             status: 422,
    //         },
    //     );
    // }

    // const textContent = article.textContent?.trim();

    // if (!textContent) {
    //     return Response.json(
    //         {
    //             error: "The page did not contain any readable text.",
    //         },
    //         {
    //             status: 422,
    //         },
    //     );
    // }

    // const articleContent = article.content?.trim();

    // if (!articleContent) {
    //     return Response.json(
    //         {
    //             error: "The page did not contain any convertible content.",
    //         },
    //         {
    //             status: 422,
    //         },
    //     );
    // }

    // const turndownService = new TurndownService({
    //     headingStyle: "atx",
    //     codeBlockStyle: "fenced",
    //     bulletListMarker: "-",
    // });
    // const markdown = turndownService.turndown(articleContent);

    let conversion = convertHtmlToMarkdown(html, url);

    if (!conversion) {
        const renderedHtml = await renderPage(url);

        conversion = convertHtmlToMarkdown(renderedHtml, url);
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
        sourceUrl: url,
        title: conversion.title,
        markdown: conversion.markdown,
    });
}
