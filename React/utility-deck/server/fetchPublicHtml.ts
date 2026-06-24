import { assertPublicUrl } from "./assertPublicUrl";

type FetchPublicHtmlResult = {
    html: string;
    finalUrl: string;
};

const MAX_REDIRECTS = 5;

const REDIRECT_STATUS_CODES = new Set([301, 302, 303, 307, 308]);

export async function fetchPublicHtml(initialUrl: string): Promise<FetchPublicHtmlResult> {
    let currentUrl = (await assertPublicUrl(initialUrl)).toString();

    for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
        const response = await fetch(currentUrl, {
            redirect: "manual",
            signal: AbortSignal.timeout(20_000),
        });

        if (REDIRECT_STATUS_CODES.has(response.status)) {
            const location = response.headers.get("location");

            await response.body?.cancel();

            if (!location) {
                throw new Error("The webpage returned an invalid redirect.");
            }

            if (redirectCount === MAX_REDIRECTS) {
                throw new Error("The webpage redirected too many times.");
            }

            const nextUrl = new URL(location, currentUrl).toString();

            currentUrl = (await assertPublicUrl(nextUrl)).toString();

            continue;
        }

        if (!response.ok) {
            throw new Error(`The webpage returned HTTP ${response.status}.`);
        }

        const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

        const isHtml = contentType.includes("text/html") || contentType.includes("application/xhtml+xml");

        if (!isHtml) {
            throw new Error("The URL did not return an HTML webpage.");
        }

        return {
            html: await response.text(),
            finalUrl: currentUrl,
        };
    }

    throw new Error("The webpage redirected too many times.");
}
