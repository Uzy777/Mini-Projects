import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));

const projectRoot = path.resolve(scriptDirectory, "..");

const sourceDirectory = path.join(projectRoot, "node_modules", "@ffmpeg", "core", "dist", "esm");

const outputDirectory = path.join(projectRoot, "public", "ffmpeg");

const files = ["ffmpeg-core.js", "ffmpeg-core.wasm"];

if (!existsSync(sourceDirectory)) {
    throw new Error("@ffmpeg/core was not found. Run npm install first.");
}

mkdirSync(outputDirectory, {
    recursive: true,
});

for (const filename of files) {
    copyFileSync(path.join(sourceDirectory, filename), path.join(outputDirectory, filename));
}

console.log("Copied FFmpeg core files to public/ffmpeg.");
