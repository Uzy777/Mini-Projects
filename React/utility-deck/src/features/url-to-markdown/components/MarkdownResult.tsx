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
        </section>
    );
}

export default MarkdownResult;
