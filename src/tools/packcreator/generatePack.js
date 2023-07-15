const fs = require('fs');
const archiver = require('archiver');
const chalk = require("chalk");
const { generateDependencies } = require('./generateDependencies.js');
const { getSubdirectoryNames } = require('../folder/getSubdirectoryNames.js');
const { generateLangFile } = require('./generateLangFile.js');
const { generatePackInfo } = require('./generatePackInfo.js');

exports.generatePack = function generatePack(files, pack) {
    const outputDir = "./builds/" + pack.packId + "/";
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    pack.elements.forEach(element => {
        const origin = element.file ? element.file : element.dir;
        const fileName = origin.split("/")[origin.split("/").length - 1];
        const dir = origin.slice(0, origin.length - fileName.length);

        if (element.dependencies.length > 0) {
            element.dependencies.forEach(dependency => {
                generateDependencies(files, dependency, outputDir);
            });
        }

        fs.mkdirSync(outputDir + dir, { recursive: true });
        fs.writeFileSync(outputDir + origin, element.content);
    });

    const packFolderName = getSubdirectoryNames(outputDir)[0];
    console.log("Pack folder name: " + packFolderName);
    
    generatePackInfo(files, outputDir, packFolderName);
    generateLangFile(files, pack, packFolderName, outputDir);

    //Zip the DartcherPack folder recursively inside the outputDir
    const output = fs.createWriteStream(outputDir + packFolderName +"-"+ pack.packId + ".dnxpack");
    const archive = archiver("zip", {zlib: { level: 1 }}); // Sets the compression level. 1 = best speed, 9 = best compression
    archive.pipe(output);
    archive.directory(outputDir + packFolderName, false);
    archive.finalize();
    output.on("close", () => {
        console.log(chalk.green("Pack created: ") + outputDir + packFolderName +"-"+ pack.packId + ".dnxpack");
    });
    output.on("end", () => {
        console.log("Data has been drained");
    });

}