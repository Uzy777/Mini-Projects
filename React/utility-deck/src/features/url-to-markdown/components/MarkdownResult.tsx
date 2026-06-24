import type { UrlToMarkdownResult } from "../types/urlToMarkdown.types";

type MarkdownResultProps = {
    result: UrlToMarkdownResult;
};

function MarkdownResult({ result }: MarkdownResultProps) {
    return (
        <section className="mt-8">
            <h2>{result.title}</h2>

            <p>{result.sourceUrl}</p>

            <textarea value={result.markdown} readOnly rows={15} />
            {/* <p className="w-full h-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200">{result.markdown}</p> */}
        </section>
    );
}

export default MarkdownResult;
