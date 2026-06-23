import { useState, type FormEvent } from "react";

function isValidHttpUrl(value: string): boolean {
    try {
        const parsedUrl = new URL(value);

        return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch {
        return false;
    }
}

function UrlToMarkdownForm() {
    const [url, setUrl] = useState("");
    const [error, setError] = useState("");

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedUrl = url.trim();

        if (!isValidHttpUrl(trimmedUrl)) {
            setError("Enter a valid URL beginning with http:// or https://");
            return;
        }

        console.log("Submitted URL:", url);
    }

    return (
        <form className="mt-6 grid gap-3" onSubmit={handleSubmit}>
            <label className="font-medium" htmlFor="url">
                Website URL
            </label>

            <input
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                id="url"
                type="url"
                placeholder="https://example.com/article"
                value={url}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "url-error" : undefined}
                onChange={(event) => {
                    setUrl(event.target.value);

                    if (error) {
                        setError("");
                    }
                }}
            />

            {error && (
                <p id="url-error" className="text-sm font-medium text-red-600">
                    {error}
                </p>
            )}

            <button
                className="mt-2 w-fit rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                type="submit"
                disabled={!url.trim()}
            >
                Convert to Markdown
            </button>
        </form>
    );
}

export default UrlToMarkdownForm;
