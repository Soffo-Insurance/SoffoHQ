import { readFileSync, writeFileSync, mkdirSync } from "fs";

const src = readFileSync("untitled (2).tsx", "utf8");

const framesMatch = src.match(/const FRAMES = \[([\s\S]*?)\n\];/);
if (!framesMatch) { console.error("Could not find FRAMES"); process.exit(1); }

const frameLines = framesMatch[1].trim().split(/\n\t"/);
const frames = frameLines.map(line => {
  const raw = line.replace(/^"/, "").replace(/",?\s*$/, "");
  return raw.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\\\/g, "\\");
});

console.log(`Extracted ${frames.length} frames`);

mkdirSync("js", { recursive: true });
writeFileSync(
  "js/ascii-frames.js",
  `window.ASCII_FRAMES=${JSON.stringify(frames)};`
);

const bytes = Buffer.byteLength("js/ascii-frames.js");
const stat = readFileSync("js/ascii-frames.js");
console.log(`Written js/ascii-frames.js (${(stat.length / 1024 / 1024).toFixed(1)} MB)`);
