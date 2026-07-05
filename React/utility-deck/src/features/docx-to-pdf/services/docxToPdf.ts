import { renderAsync } from "docx-preview";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

function createPdfFilename(docxFilename: string): string {
    const filenameWithoutExtension = docxFilename.replace(/\.docx$/i, "");

    return `${filenameWithoutExtension || "converted-document"}.pdf`;
}

async function waitForImages(container: HTMLElement): Promise<void> {
    const images = Array.from(container.querySelectorAll("img"));

    await Promise.all(
        images.map((image) => {
            if (image.complete) {
                return Promise.resolve();
            }

            return new Promise<void>((resolve) => {
                image.onload = () => resolve();
                image.onerror = () => resolve();
            });
        }),
    );
}

export async function convertDocxToPdf(docxFile: File): Promise<void> {
    const renderContainer = document.createElement("div");

    renderContainer.id = "docx-pdf-render-container";
    renderContainer.setAttribute("aria-hidden", "true");

    renderContainer.style.position = "fixed";
    renderContainer.style.inset = "0";
    renderContainer.style.zIndex = "0";
    renderContainer.style.overflow = "auto";
    renderContainer.style.background = "white";
    renderContainer.style.padding = "24px";
    renderContainer.style.opacity = "0";
    renderContainer.style.pointerEvents = "none";

    document.body.appendChild(renderContainer);

    try {
        await renderAsync(docxFile, renderContainer, renderContainer, {
            inWrapper: true,
            breakPages: true,
            ignoreLastRenderedPageBreak: false,
            useBase64URL: true,
        });

        await document.fonts.ready;
        await waitForImages(renderContainer);

        await new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => resolve());
            });
        });

        const pages = Array.from(renderContainer.querySelectorAll<HTMLElement>(".docx-wrapper > section.docx"));

        if (pages.length === 0) {
            throw new Error("No rendered document pages were found.");
        }

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            compress: true,
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();

        const pdfHeight = pdf.internal.pageSize.getHeight();

        for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
            const page = pages[pageIndex];

            const canvas = await html2canvas(page, {
                scale: 2,
                backgroundColor: "#ffffff",
                useCORS: true,
                logging: false,
                scrollX: 0,
                scrollY: 0,
                onclone: (clonedDocument) => {
                    const clonedContainer = clonedDocument.getElementById("docx-pdf-render-container");

                    if (clonedContainer) {
                        clonedContainer.style.opacity = "1";
                    }
                },
            });

            const imageData = canvas.toDataURL("image/png");

            const scale = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);

            const imageWidth = canvas.width * scale;

            const imageHeight = canvas.height * scale;

            const x = (pdfWidth - imageWidth) / 2;

            const y = (pdfHeight - imageHeight) / 2;

            if (pageIndex > 0) {
                pdf.addPage();
            }

            pdf.addImage(imageData, "PNG", x, y, imageWidth, imageHeight);
        }

        pdf.save(createPdfFilename(docxFile.name));
    } finally {
        renderContainer.remove();
    }
}
