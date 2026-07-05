function DocxToPdfForm() {
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
                    className="block w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                />
            </div>

            <p className="text-sm text-slate-500">Select a Microsoft Word .docx document to convert into PDF.</p>

            <button type="button" className="w-fit rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700">
                Convert to PDF
            </button>
        </div>
    );
}

export default DocxToPdfForm;
