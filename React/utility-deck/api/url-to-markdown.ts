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

    return Response.json({
        message: "URL to Markdown API is working",
        receivedUrl: url,
    });
}
