import fs from 'fs';
import chalk from 'chalk';
import { getType } from '../parser/getType.js';

export function generateDependencies(files, dependency, outputDir) {
    const type = getType(dependency);
    const dependencyFilename = (() => {
        if (type !== "obj") {
            return dependency + ".dynx";
        } else if (type === "file") {
            return dependency.file.split("/")[dependency.file.split("/").length - 1];
        } else {
            return dependency;
        }
    })()

    let dependencyFile;
    if (type === "file") {
        dependencyFile = dependency;
    } else {
        dependencyFile = files[type].filter(file => file.file ? file.file.endsWith(dependencyFilename) : file.dir.endsWith(dependencyFilename))[0];
    }

    if (dependencyFile) {
        const origin = dependencyFile.file ? dependencyFile.file : dependencyFile.dir;
        const fileName = origin.split("/")[origin.split("/").length - 1];
        const dir = origin.slice(0, origin.length - fileName.length);
        fs.mkdirSync(outputDir + dir, { recursive: true });
        fs.writeFileSync(outputDir + origin, dependencyFile.content);
        console.log(chalk.green("Created: ") + outputDir + origin);

        if (dependencyFile.dependencies && dependencyFile.dependencies.length > 0) {
            dependencyFile.dependencies.forEach(dependency => {
                generateDependencies(files, dependency, outputDir);
            });
        }
    } else {
        console.log(chalk.red("Dependency not found: ") + dependency);
    }
}