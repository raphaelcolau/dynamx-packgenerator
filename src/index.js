import { detector } from "./tools/detector/detector.js";

const files = await detector();
detector()

const obj = files.obj[2];
console.log("File: " + obj.file);
obj.dependencies.forEach(dependency => {
    if (dependency) console.log("Dependency: " + dependency.file);
});
