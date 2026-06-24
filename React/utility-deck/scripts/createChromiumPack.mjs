import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");

const chromiumBinDirectory = path.join(projectRoot, "node_modules", "@sparticuz", "chromium", "bin");

const publicDirectory = path.join(projectRoot, "public");
const outputPath = path.join(publicDirectory, "chromium-pack.tar");

if (!existsSync(chromiumBinDirectory)) {
    throw new Error("Chromium files were not found. Make sure @sparticuz/chromium is installed.");
}

mkdirSync(publicDirectory, {
    recursive: true,
});

rmSync(outputPath, {
    force: true,
});

execFileSync("tar", ["-cf", outputPath, "-C", chromiumBinDirectory, "."], {
    stdio: "inherit",
});

console.log(`Created Chromium pack: ${outputPath}`);
