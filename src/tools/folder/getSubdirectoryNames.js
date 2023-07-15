import fs from 'fs';
import path from 'path';

// Returns an array of the names of the subdirectories in the specified directory.
export function getSubdirectoryNames(directoryPath) {
    const directoryContents = fs.readdirSync(directoryPath);
    const subdirectoryNames = directoryContents.filter(item => {
        const itemPath = path.join(directoryPath, item);
        return fs.statSync(itemPath).isDirectory();
    });
    return subdirectoryNames;
}