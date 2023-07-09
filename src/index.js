import { detector } from "./tools/detector/detector.js";

const files = await detector();

// const obj = files.obj[2];
// console.log("File: " + obj.file);
// obj.dependencies.forEach(dependency => {
//     if (dependency) console.log("Dependency: " + dependency.file);
// });

console.log(files.sounds[2].dir);
console.log(files.sounds[2].content);
files.sounds[2].dependencies.forEach(dependency => {
    if (dependency) console.log("Dependency: " + dependency.file);
});

//TODO: Create lang file [Pack]/assets/lang/en_US.lang
