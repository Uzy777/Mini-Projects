import { Link } from "react-router";

function HomePage() {
    return (
        <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:px-6">
            <div className="mx-auto max-w-5xl">
                <header className="mb-10">
                    <h1 className="text-4xl font-bold tracking-tight">Utility Deck</h1>

                    <p className="mt-3 max-w-2xl text-lg text-slate-600">A collection of simple tools for everyday conversions and tasks.</p>
                </header>

                <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        to="/tools/url-to-markdown"
                        className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                    >
                        <h2 className="text-xl font-semibold">URL to Markdown</h2>

                        <p className="mt-2 text-slate-600">Convert a public webpage into clean Markdown.</p>

                        <span className="mt-6 inline-block font-medium text-slate-900 group-hover:underline">Open tool →</span>
                    </Link>

                    <Link
                        to="/tools/docx-to-pdf"
                        className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                    >
                        <h2 className="text-xl font-semibold">DOCX to PDF</h2>

                        <p className="mt-2 text-slate-600">Convert Word documents into PDF files.</p>

                        <span className="mt-6 inline-block font-medium text-slate-900 group-hover:underline">Open tool →</span>
                    </Link>

                    <Link
                        to="/tools/video-to-gif"
                        className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                    >
                        <h2 className="text-xl font-semibold">Video to GIF</h2>

                        <p className="mt-2 text-slate-600">Turn short video clips into animated GIFs.</p>

                        <span className="mt-6 inline-block font-medium text-slate-900 group-hover:underline">Open tool →</span>
                    </Link>
                </section>
            </div>
        </main>
    );
}

export default HomePage;
