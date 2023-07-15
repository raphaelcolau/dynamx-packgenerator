const chalk = require("chalk");

exports.listCommand = function listCommand() {
    console.log(chalk.blue("/list <type>") + " - List all files of a type");
    console.log(chalk.yellow("vehicle, trailer, armor, wheel, engine, sounds, block, block_prop, boat, plane, obj, unknown"));
}

exports.list = function list(files, type) {
    if (!files[type]) {
        console.log("Invalid type: " + type);
        console.log("Valid types: vehicle, trailer, armor, wheel, engine, sounds, block, block_prop, boat, plane, obj, unknown");
    } else {
        console.log("Files of type: " + type);
        files[type].forEach(file => {
            try {
                console.log(file.file ? " - " +  chalk.green(file.file.split("/")[file.file.split("/").length - 1]) : " - " + chalk.green(file.dir.split("/")[file.dir.split("/").length - 1]));
            } catch (e) {
                console.log(e);
            }
        });
        console.log("Total of " + files[type].length + " " + type + " files.");
    }
}