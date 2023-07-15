const fs = require('fs');
const path = require('path');

// Returns an array of the names of the subdirectories in the specified directory.
exports.getSubdirectoryNames = function getSubdirectoryNames(directoryPath) {
    const directoryContents = fs.readdirSync(directoryPath);
    const subdirectoryNames = directoryContents.filter(item => {
        const itemPath = path.join(directoryPath, item);
        return fs.statSync(itemPath).isDirectory();
    });
    return subdirectoryNames;
}