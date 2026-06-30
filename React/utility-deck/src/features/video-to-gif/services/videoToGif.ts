import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const ffmpeg = new FFmpeg();

let ffmpegLoadPromise: Promise<void> | null = null;

async function ensureFfmpegLoaded(): Promise<void> {
    if (!ffmpegLoadPromise) {
        ffmpegLoadPromise = (async () => {
            const baseUrl = `${window.location.origin}/ffmpeg`;

            const coreUrl = await toBlobURL(`${baseUrl}/ffmpeg-core.js`, "text/javascript");

            const wasmUrl = await toBlobURL(`${baseUrl}/ffmpeg-core.wasm`, "application/wasm");

            await ffmpeg.load({
                coreURL: coreUrl,
                wasmURL: wasmUrl,
            });
        })();
    }

    try {
        await ffmpegLoadPromise;
    } catch (error) {
        ffmpegLoadPromise = null;
        throw error;
    }
}

export function getVideoDuration(videoFile: File): Promise<number> {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        const videoUrl = URL.createObjectURL(videoFile);

        function cleanUp() {
            URL.revokeObjectURL(videoUrl);
            video.removeAttribute("src");
        }

        video.preload = "metadata";

        video.onloadedmetadata = () => {
            const duration = video.duration;

            cleanUp();

            if (!Number.isFinite(duration)) {
                reject(new Error("The video duration could not be determined."));
                return;
            }

            resolve(duration);
        };

        video.onerror = () => {
            cleanUp();

            reject(new Error("The selected file could not be read as a video."));
        };

        video.src = videoUrl;
    });
}

export async function convertVideoToGif(videoFile: File): Promise<Blob> {
    await ensureFfmpegLoaded();

    const fileExtension = videoFile.name.split(".").pop()?.toLowerCase() || "mp4";

    const jobId = crypto.randomUUID();

    const inputFilename = `input-${jobId}.${fileExtension}`;

    const outputFilename = `output-${jobId}.gif`;

    try {
        await ffmpeg.writeFile(inputFilename, await fetchFile(videoFile));

        const filter = [
            "[0:v]",
            "fps=20,",
            "scale=960:-1:flags=lanczos,",
            "split[paletteInput][gifInput];",
            "[paletteInput]",
            "palettegen=max_colors=256:stats_mode=full[palette];",
            "[gifInput][palette]",
            "paletteuse=dither=sierra2_4a",
        ].join("");

        const exitCode = await ffmpeg.exec(["-i", inputFilename, "-filter_complex", filter, "-loop", "0", outputFilename]);

        if (exitCode !== 0) {
            throw new Error(`FFmpeg conversion failed with exit code ${exitCode}.`);
        }
        const outputData = await ffmpeg.readFile(outputFilename);

        if (typeof outputData === "string") {
            throw new Error("FFmpeg returned an unexpected output format.");
        }

        const gifBytes = new Uint8Array(outputData);

        return new Blob([gifBytes], {
            type: "image/gif",
        });
    } finally {
        await ffmpeg.deleteFile(inputFilename).catch(() => undefined);

        await ffmpeg.deleteFile(outputFilename).catch(() => undefined);
    }
}
