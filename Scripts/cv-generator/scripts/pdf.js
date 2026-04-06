const { chromium } = require("playwright");
const path = require("path");

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const previewPath = "file://" + path.resolve(__dirname, "..", "output", "preview.html");

    const pdfPath = path.resolve(__dirname, "..", "output", "cv.pdf");

    await page.goto(previewPath, { waitUntil: "load" });

    await page.pdf({
        path: pdfPath,
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
    console.log("Created output/cv.pdf");
})();
