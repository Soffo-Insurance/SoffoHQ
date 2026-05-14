import { readFileSync, writeFileSync } from "fs";

const src = readFileSync("untitled (2).tsx", "utf8");

// Extract FRAMES array
const framesMatch = src.match(/const FRAMES = \[([\s\S]*?)\n\];/);
if (!framesMatch) { console.error("Could not find FRAMES"); process.exit(1); }

// Extract APPEARANCE object
const appearanceMatch = src.match(/const APPEARANCE = (\{[\s\S]*?\});/);
const appearance = appearanceMatch ? JSON.parse(appearanceMatch[1]) : {};

// Parse frames — split on newline+tab+quote (the delimiter between frame strings)
const frameLines = framesMatch[1].trim().split(/\n\t"/);
const frames = frameLines.map(line => {
  // Strip surrounding quotes and trailing comma
  const raw = line.replace(/^"/, "").replace(/",?\s*$/, "");
  // Convert JS escape sequences to real characters
  return raw.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\\\/g, "\\");
});

console.log(`Extracted ${frames.length} frames`);
console.log(`Lines in first frame: ${(frames[0].match(/\n/g) || []).length}`);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ASCII Animation Preview</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #111;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    padding: 20px;
  }
  #container {
    width: 100%;
    overflow: hidden;
    position: relative;
    background: ${appearance.backgroundColor || "transparent"};
    color: ${appearance.textColor || "#533a12"};
    font-family: ${appearance.fontFamily || "monospace"};
  }
  #scaler {
    transform-origin: left top;
  }
  #frame {
    font-size: ${appearance.fontSize || 8}px;
    line-height: ${appearance.lineHeight || 0.78};
    white-space: pre;
    font-weight: ${appearance.fontWeight || "normal"};
    font-style: ${appearance.fontStyle || "normal"};
    letter-spacing: ${appearance.letterSpacing || 0}px;
    display: block;
    margin: 0;
  }
</style>
</head>
<body>
<div id="container">
  <div id="scaler">
    <pre id="frame"></pre>
  </div>
</div>
<script>
const FPS = 30;
const FRAMES = ${JSON.stringify(frames)};

let currentFrame = 0;
let lastTime = 0;
const frameDuration = 1000 / FPS;
const frameEl = document.getElementById("frame");
const scaler = document.getElementById("scaler");
const container = document.getElementById("container");

function scaleFrame() {
  const available = container.clientWidth;
  const natural = frameEl.scrollWidth;
  if (available > 0 && natural > 0 && natural > available) {
    scaler.style.transform = \`scale(\${available / natural})\`;
    container.style.height = (frameEl.scrollHeight * (available / natural)) + "px";
  } else {
    scaler.style.transform = "scale(1)";
    container.style.height = "";
  }
}

function animate(time) {
  if (!lastTime) lastTime = time;
  const delta = time - lastTime;
  if (delta >= frameDuration) {
    currentFrame = (currentFrame + 1) % FRAMES.length;
    frameEl.textContent = FRAMES[currentFrame];
    lastTime = time - (delta % frameDuration);
  }
  requestAnimationFrame(animate);
}

frameEl.textContent = FRAMES[0];
scaleFrame();
window.addEventListener("resize", scaleFrame);
requestAnimationFrame(animate);
</script>
</body>
</html>`;

writeFileSync("ascii-preview.html", html);
console.log("Written ascii-preview.html");
