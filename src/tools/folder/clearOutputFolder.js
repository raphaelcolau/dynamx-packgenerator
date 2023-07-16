const fs = require('fs');
const chalk = require("chalk");
const path = require('path');

exports.clearOutputFolder = function clearOutputFolder(directory) {
    const outputDir = path.join(directory, "/builds/");
    if (fs.existsSync(outputDir)) {
        fs.rm(outputDir, { recursive: true, force: true }, (err) => {
            if (err) {
                console.error(err);
            } else {
                fs.mkdirSync(outputDir, { recursive: true });
                console.log(chalk.green("Build folder cleared."));
            }
        });
    }
}