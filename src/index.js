import { detector } from "./tools/detector/detector.js";

const files = await detector();
console.log(files);