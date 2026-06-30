import UrlToMarkdownForm from "./components/UrlToMarkdownForm";
import { Link } from "react-router";

function UrlToMarkdownPage() {
    return (
        <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:px-6">
            <div className="mx-auto max-w-4xl">

                <Link to="/" className="mb-6 inline-flex items-center text-sm font-medium text-slate-600 transition hover:text-slate-900">
                    🠈 Back to Utility Deck
                </Link>

                <header className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight">Utility Deck</h1>

                    <p className="mt-3 max-w-2xl text-lg text-slate-600">Simple and reliable tools for everyday tasks and conversions.</p>
                </header>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold">URL to Markdown</h2>

                    <p className="mt-2 text-slate-600">Enter a public webpage URL and convert its main content into Markdown.</p>

                    <UrlToMarkdownForm />
                </section>
            </div>
        </main>
    );
}

export default UrlToMarkdownPage;
