const fs = require('fs');
const chalk = require("chalk");

exports.clearOutputFolder = function clearOutputFolder() {
    const outputDir = "./builds/";
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