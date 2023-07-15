const detector = require("./tools/detector/detector.js").detector;
const stdinListener = require("./tools/stdin/stdin.js").stdinListener;

async function main() {
    // Detect all Packs
    const files = await detector();
    
    // Start stdin listener
    stdinListener(files);
}

main();