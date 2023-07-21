const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

exports.createImage = function createImage(imageObject, outputPath) {
    return new Promise((resolve, reject) => {
        loadImage(imageObject.content).then((image) => {
          const canvas = createCanvas(image.width, image.height);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0, image.width, image.height);
    
          const out = fs.createWriteStream(outputPath);
          const stream = canvas.createPNGStream();
    
          stream.pipe(out);
          out.on('finish', () => resolve(outputPath));
          out.on('error', (err) => reject(err));
        }).catch((err) => reject(err));
      });
}