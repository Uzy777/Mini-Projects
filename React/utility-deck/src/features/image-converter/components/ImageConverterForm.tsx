import { useEffect, useState, type ChangeEvent } from "react";

import { convertImage, createConvertedImageFilename, type ImageOutputFormat } from "../services/imageConverter";

const acceptedImageTypes = ["image/png", "image/jpeg", "image/webp"];

function ImageConverterForm() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [outputFormat, setOutputFormat] = useState<ImageOutputFormat>("image/webp");
    const [convertedImageUrl, setConvertedImageUrl] = useState<string | null>(null);
    const [downloadFilename, setDownloadFilename] = useState("converted-image.webp");
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        return () => {
            if (convertedImageUrl) {
                URL.revokeObjectURL(convertedImageUrl);
            }
        };
    }, [convertedImageUrl]);

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        setError("");
        setSelectedFile(null);
        setConvertedImageUrl(null);

        if (!file) {
            return;
        }

        const isAcceptedImage = acceptedImageTypes.includes(file.type) || /\.(png|jpe?g|webp)$/i.test(file.name);

        if (!isAcceptedImage) {
            setError("Choose a PNG, JPEG or WebP image.");

            event.target.value = "";
            return;
        }

        setSelectedFile(file);
    }

    async function handleConvert() {
        if (!selectedFile) {
            setError("Choose an image first.");
            return;
        }

        setError("");
        setIsConverting(true);

        try {
            const convertedImageBlob = await convertImage(selectedFile, outputFormat);

            const imageUrl = URL.createObjectURL(convertedImageBlob);

            setConvertedImageUrl(imageUrl);

            setDownloadFilename(createConvertedImageFilename(selectedFile.name, outputFormat));
        } catch (error) {
            console.error("Image conversion failed:", error);

            const message = error instanceof Error ? error.message : "The image could not be converted.";

            setError(message);
        } finally {
            setIsConverting(false);
        }
    }

    return (
        <div className="mt-6 grid gap-4">
            <div>
                <label htmlFor="image-file" className="mb-2 block font-medium text-slate-900">
                    Choose an image
                </label>

                <input
                    id="image-file"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    disabled={isConverting}
                    className="block w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                />
            </div>

            <div>
                <label htmlFor="output-format" className="mb-2 block font-medium text-slate-900">
                    Convert to
                </label>

                <select
                    id="output-format"
                    value={outputFormat}
                    onChange={(event) => setOutputFormat(event.target.value as ImageOutputFormat)}
                    disabled={isConverting}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <option value="image/webp">WebP</option>
                    <option value="image/png">PNG</option>
                    <option value="image/jpeg">JPEG</option>
                </select>
            </div>

            {selectedFile && (
                <p className="text-sm text-slate-600">
                    Selected: <span className="font-medium">{selectedFile.name}</span>
                </p>
            )}

            {error && (
                <p role="alert" className="text-sm font-medium text-red-600">
                    {error}
                </p>
            )}

            <button
                type="button"
                onClick={handleConvert}
                disabled={!selectedFile || isConverting}
                className="w-fit rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isConverting ? "Converting..." : "Convert Image"}
            </button>

            {convertedImageUrl && (
                <section className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <img src={convertedImageUrl} alt="Converted result" className="mx-auto max-h-[32rem] max-w-full rounded-lg" />

                    <a
                        href={convertedImageUrl}
                        download={downloadFilename}
                        className="mt-4 inline-block rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
                    >
                        Download converted image
                    </a>
                </section>
            )}
        </div>
    );
}

export default ImageConverterForm;
