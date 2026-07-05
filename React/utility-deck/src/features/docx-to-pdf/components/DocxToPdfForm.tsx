import { useState, type ChangeEvent } from "react";
import { convertDocxToPdf } from "../services/docxToPdf";

function DocxToPdfForm() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState("");

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        setError("");
        setSelectedFile(null);

        if (!file) {
            return;
        }

        const isDocx = file.name.toLowerCase().endsWith(".docx");

        if (!isDocx) {
            setError("Choose a valid .docx file.");
            event.target.value = "";
            return;
        }

        setSelectedFile(file);
    }

    async function handleConvert() {
        if (!selectedFile) {
            setError("Choose a DOCX file first.");
            return;
        }

        setError("");
        setIsConverting(true);

        try {
            await convertDocxToPdf(selectedFile);
        } catch (error) {
            console.error("DOCX-to-PDF conversion failed:", error);

            const message = error instanceof Error ? error.message : "The document could not be converted.";

            setError(message);
        } finally {
            setIsConverting(false);
        }
    }

    return (
        <div className="mt-6 grid gap-4">
            <div>
                <label htmlFor="docx-file" className="mb-2 block font-medium text-slate-900">
                    Choose a DOCX file
                </label>

                <input
                    id="docx-file"
                    type="file"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    disabled={isConverting}
                    className="block w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                />
            </div>

            <p className="text-sm text-slate-500">Select a Microsoft Word .docx document to convert into PDF.</p>

            {error && (
                <p role="alert" className="text-sm font-medium text-red-600">
                    {error}
                </p>
            )}

            <button
                type="button"
                onClick={handleConvert}
                disabled={!selectedFile || isConverting}
                className="w-fit rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
            >
                {isConverting ? "Converting..." : "Convert to PDF"}
            </button>
        </div>
    );
}

export default DocxToPdfForm;
