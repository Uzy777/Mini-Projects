export type ImageOutputFormat = "image/png" | "image/jpeg" | "image/webp";

const fileExtensions: Record<ImageOutputFormat, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
};

function createImageElement(imageFile: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const imageUrl = URL.createObjectURL(imageFile);

        image.onload = () => {
            URL.revokeObjectURL(imageUrl);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(imageUrl);
            reject(new Error("The selected file could not be read as an image."));
        };

        image.src = imageUrl;
    });
}

export function createConvertedImageFilename(originalFilename: string, outputFormat: ImageOutputFormat): string {
    const filenameWithoutExtension = originalFilename.replace(/\.[^/.]+$/i, "");

    const extension = fileExtensions[outputFormat];

    return `${filenameWithoutExtension || "converted-image"}.${extension}`;
}

export async function convertImage(imageFile: File, outputFormat: ImageOutputFormat): Promise<Blob> {
    const image = await createImageElement(imageFile);

    const canvas = document.createElement("canvas");

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext("2d");

    if (!context) {
        throw new Error("The image could not be converted.");
    }

    if (outputFormat === "image/jpeg") {
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    context.drawImage(image, 0, 0);

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error("The browser could not create the converted image."));
                    return;
                }

                resolve(blob);
            },
            outputFormat,
            0.92,
        );
    });
}
