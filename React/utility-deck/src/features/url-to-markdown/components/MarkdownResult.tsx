import type { UrlToMarkdownResult } from "../types/urlToMarkdown.types";

type MarkdownResultProps = {
    result: UrlToMarkdownResult;
};

function MarkdownResult({ result }: MarkdownResultProps) {
    return (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
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
