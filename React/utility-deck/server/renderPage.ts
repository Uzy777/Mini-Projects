import puppeteer from "puppeteer";

export async function renderPage(url: string): Promise<string> {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"],
    });

    try {
        const page = await browser.newPage();

        await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 30_000,
        });

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
