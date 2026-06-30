import { useEffect, useState, type ChangeEvent } from "react";

import { convertVideoToGif, getVideoDuration } from "../services/videoToGif";

function VideoToGifForm() {
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState("");
    const [gifUrl, setGifUrl] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (gifUrl) {
                URL.revokeObjectURL(gifUrl);
            }
        };
    }, [gifUrl]);

    async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const videoFile = event.target.files?.[0];

        if (!videoFile) {
            return;
        }

        setError("");
        setGifUrl(null);
        setIsConverting(true);

        try {
            if (!videoFile.type.startsWith("video/")) {
                throw new Error("Choose a valid video file.");
            }

            const duration = await getVideoDuration(videoFile);

            if (duration > 30) {
                throw new Error("The video must be 30 seconds or shorter.");
            }

            const gifBlob = await convertVideoToGif(videoFile);

            const resultUrl = URL.createObjectURL(gifBlob);

            setGifUrl(resultUrl);
        }  catch (error) {
    console.error("Video-to-GIF conversion failed:", error);

    const message =
        error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "The video could not be converted.";

    setError(message);
} finally {
            setIsConverting(false);
        }
    }

    return (
        <form className="mt-6 grid gap-4">
            <div>
                <label htmlFor="video-file" className="mb-2 block font-medium text-slate-900">
                    Choose a video
                </label>

                <input
                    id="video-file"
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    disabled={isConverting}
                    className="block w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                />
            </div>

            <p className="text-sm text-slate-500">Videos must be 30 seconds or shorter.</p>

            {/* <button type="submit" className="w-fit rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700">
                Convert to GIF
            </button> */}

            {isConverting && (
                <p role="status" className="text-sm font-medium text-slate-600">
                    Converting video to GIF. This may take a moment...
                </p>
            )}

            {error && (
                <p role="alert" className="text-sm font-medium text-red-600">
                    {error}
                </p>
            )}

            {gifUrl && (
                <section className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <img src={gifUrl} alt="Converted GIF" className="mx-auto max-h-[32rem] max-w-full rounded-lg" />

                    <a
                        href={gifUrl}
                        download="converted-video.gif"
                        className="mt-4 inline-block rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
                    >
                        Download GIF
                    </a>
                </section>
            )}
        </form>
    );
}

export default VideoToGifForm;
