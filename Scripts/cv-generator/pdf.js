const { chromium } = require("playwright");
const path = require("path");

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const filePath = "file://" + path.resolve("preview.html");
    await page.goto(filePath, { waitUntil: "load" });

    await page.pdf({
        path: "cv.pdf",
        format: "A4",
        printBackground: true,
        margin: {
            top: "20px",
            right: "20px",
            bottom: "20px",
            left: "20px",
        },
    });

    await browser.close();
    console.log("Created cv.pdf");
})();
