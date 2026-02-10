const fs = require('fs');

exports.createImage = function createImage(imageObject, outputPath) {
    fs.writeFileSync(outputPath, imageObject.content);
    return Promise.resolve(outputPath);
}
