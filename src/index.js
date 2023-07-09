import { detector } from "./tools/detector/detector.js";
import { createInterface } from "readline";

const files = await detector();

// const obj = files.obj[2];
// console.log("File: " + obj.file);
// obj.dependencies.forEach(dependency => {
//     if (dependency) console.log("Dependency: " + dependency.file);
// });

//TODO: Create lang file [Pack]/assets/lang/en_US.lang

const stdin = createInterface({
    input: process.stdin,
    output: process.stdout
});

stdin.question("/help to start\r\n", input => {
    if (input === "/help") {
        console.log('-- Help --');
        console.log('\t/help - Show this help');
        console.log('\t/pack - help for pack command');
        console.log("\t/list <type> ");
    } else if (input === "/pack") {
        console.log("/pack create <name> - Create a new pack");
        console.log("/pack add <name> <file> - Add a file to a pack");
        console.log("/pack remove <name> <file> - Remove a file from a pack");
        console.log("/pack list - List all packs");
        console.log("/pack list <name> - List all files in a pack");
    } else if (input === "/list") {
        console.log("/list <type> - List all files of a type");
        console.log("\ttype: vehicle, trailer, armor, wheel, engine, sounds, block, block_prop, boat, plane, obj, unknown");
    } else if (input.startsWith("/list ")) {
        const type = input.split(" ")[1];
        if (!files[type]) {
            console.log("Invalid type: " + type);
            console.log("valid type: vehicle, trailer, armor, wheel, engine, sounds, block, block_prop, boat, plane, obj, unknown");
        } else {
            console.log("Files of type: " + type);
            files[type].forEach(file => {
                try {
                    console.log(file.file ? file.file : file.dir);
                } catch (e) {
                    console.log(e);
                }
            });
        }
    }
    // stdin.close();
});