import { renderPage } from "../server/renderPage";

type RenderPageRequest = {
    url?: string;
};

export async function POST(request: Request) {
    const body = (await request.json()) as RenderPageRequest;
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

    const html = await renderPage(url);

    return Response.json({
        htmlLength: html.length,
        containsLessonHeading: html.includes("What Are Attributes"),
    });
}
