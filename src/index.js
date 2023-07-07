import { detector } from "./tools/detector/detector.js";

const files = await detector();
detector()

const obj = files.obj[2];
obj.dependencies.forEach(dependency => {
    if (dependency) console.log(dependency.file);
});
