import { Link } from "react-router";
import ImageConverterForm from "./components/ImageConverterForm";

function ImageConverterPage() {
    return (
        <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:px-6">
            <div className="mx-auto max-w-4xl">
                <Link to="/" className="mb-6 inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-900">
                    ← Back to Utility Deck
                </Link>

                <header className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight">Image Converter</h1>

                    <p className="mt-3 max-w-2xl text-lg text-slate-600">Convert images between PNG, JPEG and WebP directly in your browser.</p>
                </header>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <ImageConverterForm />
                </section>
            </div>
        </main>
    );
}

export default ImageConverterPage;
