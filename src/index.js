import { detector } from "./tools/detector/detector.js";
import { stdinListener } from "./tools/stdin/stdin.js";

// Detect all Packs
const files = await detector();

// Start stdin listener
stdinListener(files);