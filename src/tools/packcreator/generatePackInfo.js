const fs = require('fs');
const chalk = require("chalk");
const path = require('path');

exports.generatePackInfo = function generatePackInfo(files, outputDir, packFolderName) {
    const packInfo = files.unknown.filter(file => file.file ? file.file.endsWith("pack_info.dynx") : file.dir.endsWith("pack_info.dynx"))[0];

    if (!packInfo) {
        console.log(chalk.yellow("No pack info file found. ") + "Generating default pack info file.");
        packInfo.content = `PackName: ${packFolderName}\nCompatibleWithLoaderVersions: [1.0,1.1)\nPackVersion: 5.0.0\nDcFileVersion: 12.5.0`
        packInfo.dir = packFolderName + "/pack_info.dynx";
    }
    const dir = path.join(outputDir, "/" + packInfo.dir)
    fs.writeFileSync(dir , packInfo.content);
    console.log(chalk.green("Created: ") + dir);
}