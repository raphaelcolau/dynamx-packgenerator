import { detector } from "./tools/detector/detector.js";

const files = await detector();
detector()

const obj = files.obj[5];
console.log(obj.file);
obj.dependencies.forEach(dependency => {
    console.log(dependency.file);
});
