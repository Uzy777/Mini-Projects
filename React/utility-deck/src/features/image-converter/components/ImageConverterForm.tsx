function ImageConverterForm() {
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
                    className="block w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                />
            </div>

            <div>
                <label htmlFor="output-format" className="mb-2 block font-medium text-slate-900">
                    Convert to
                </label>

                <select
                    id="output-format"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    defaultValue="image/webp"
                >
                    <option value="image/webp">WebP</option>
                    <option value="image/png">PNG</option>
                    <option value="image/jpeg">JPEG</option>
                </select>
            </div>

            <button type="button" className="w-fit rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700">
                Convert Image
            </button>
        </div>
    );
}

export default ImageConverterForm;
