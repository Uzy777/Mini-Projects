import { useState } from "react";
import type { UrlToMarkdownResult } from "../types/urlToMarkdown.types";

type MarkdownResultProps = {
    result: UrlToMarkdownResult;
};

function MarkdownResult({ result }: MarkdownResultProps) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(result.markdown);

            setCopied(true);

            window.setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch {
            setCopied(false);
        }
    }

    return (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-slate-900">{result.title}</h2>

                    <a
                        href={result.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block break-all text-sm text-slate-500 underline-offset-4 hover:text-slate-700 hover:underline"
                    >
                        {result.sourceUrl}
                    </a>
                </div>

                <button
                    type="button"
                    onClick={handleCopy}
                    className="self-end shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 sm:self-auto"
                >
                    {copied ? "Copied!" : "Copy Markdown"}
                </button>
            </div>

            <label htmlFor="markdown-output" className="mb-2 block text-sm font-medium text-slate-700">
                Markdown output
            </label>

            <textarea
                id="markdown-output"
                value={result.markdown}
                readOnly
                spellCheck={false}
                className="min-h-[32rem] w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-4 py-4 font-mono text-sm leading-6 text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
        </section>
    );
}

export default MarkdownResult;
