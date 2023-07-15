const fs = require('fs');
const chalk = require("chalk");

exports.generateLangFile = function generateLangFile(files, pack, packName, outputDir) {
    let langFileContent = [];
    
    if (!packName) {
        console.log(chalk.red("/!\ Can't generate lang file: ") + "No pack name provided.");
        return;
    }

    pack.elements.forEach(element => {
        const lines = element.content.split("\n");
        const elementName = element.file ? element.file.split("/")[element.file.split("/").length - 1] : element.dir.split("/")[element.dir.split("/").length - 1];
        let displayName;
        const itemName = "item.dynamxmod." + packName.toLowerCase() + "." + elementName.toLowerCase().replace(".dynx", "");

        lines.forEach(line => {
            if (line.startsWith("Name:")) {
                displayName = line.replace("Name:", "").replace("\n", "").replace("\r", "").trim();
                langFileContent.push(itemName + ".name=" + displayName);
            } else if (line.startsWith("\tVariants:") || line.startsWith("    Variants:")) {
                const allColors = line.replace("\tVariants:", "").replace("    Variants:", "").replace("\n", "").replace("\r", "").trim().split(" ");
                allColors.forEach(color => {
                    langFileContent.push(itemName + "_" + color.toLowerCase() + ".name=" + displayName + " (" + color + ")");
                });
            }
        });
    });

    langFileContent = langFileContent.join("\n");
    const langFileDir = "./builds/" + pack.packId + "/" + packName + "/" + "/assets/dynamxmod/lang/";
    const langFilePath = langFileDir + "en_US.lang";
    fs.mkdirSync(langFileDir, { recursive: true });
    fs.writeFileSync(langFilePath, langFileContent);
    console.log(chalk.green("Created: ") + langFilePath);
}