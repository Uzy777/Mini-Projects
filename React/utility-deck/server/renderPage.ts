import type { Browser } from "puppeteer-core";
import { assertPublicUrl } from "./assertPublicUrl.js";

async function isAllowedPageRequest(value: string, checkedOrigins: Map<string, Promise<boolean>>): Promise<boolean> {
    let parsedUrl: URL;

    try {
        parsedUrl = new URL(value);
    } catch {
        return false;
    }

    if (parsedUrl.protocol === "data:" || parsedUrl.protocol === "blob:") {
        return true;
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return false;
    }

    if (parsedUrl.username || parsedUrl.password) {
        return false;
    }

    const cacheKey = parsedUrl.origin;

    let publicAddressCheck = checkedOrigins.get(cacheKey);

    if (!publicAddressCheck) {
        publicAddressCheck = assertPublicUrl(parsedUrl.toString())
            .then(() => true)
            .catch(() => false);

        checkedOrigins.set(cacheKey, publicAddressCheck);
    }

    return publicAddressCheck;
}

function isVercelRuntime(): boolean {
    return process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview";
}

export async function renderPage(url: string): Promise<string> {
    let browser: Browser;

    if (isVercelRuntime()) {
        const { default: puppeteer } = await import("puppeteer-core");
        const { default: chromium } = await import("@sparticuz/chromium-min");

        const deploymentHost = process.env.VERCEL_URL;

        if (!deploymentHost) {
            throw new Error("The Vercel deployment URL is unavailable.");
        }

        const chromiumPackUrl = `https://${deploymentHost}/chromium-pack.tar`;

        browser = await puppeteer.launch({
            args: await puppeteer.defaultArgs({
                args: chromium.args,
                headless: "shell",
            }),
            executablePath: await chromium.executablePath(chromiumPackUrl),
            headless: "shell",
        });
    } else {
        const { default: puppeteer } = await import("puppeteer");

        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox"],
        });
    }

    try {
        const page = await browser.newPage();

        const checkedOrigins = new Map<string, Promise<boolean>>();

        await page.setBypassServiceWorker(true);
        await page.setRequestInterception(true);

        page.on("request", (request) => {
            void (async () => {
                const allowed = await isAllowedPageRequest(request.url(), checkedOrigins);

                if (request.isInterceptResolutionHandled()) {
                    return;
                }

                if (allowed) {
                    await request.continue();
                } else {
                    await request.abort("accessdenied");
                }
            })().catch(async () => {
                if (!request.isInterceptResolutionHandled()) {
                    await request.abort("failed");
                }
            });
        });

        await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 30_000,
        });

        await assertPublicUrl(page.url());

        await page
            .waitForNetworkIdle({
                idleTime: 1_000,
                timeout: 15_000,
            })
            .catch(() => undefined);

        return await page.content();
    } finally {
        await browser.close();
    }
}
