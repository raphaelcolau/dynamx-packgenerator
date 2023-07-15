import fs from 'fs';

export function clearOutputFolder() {
    const outputDir = "./builds/";
    if (fs.existsSync(outputDir)) {
        fs.rm(outputDir, { recursive: true, force: true }, (err) => {
            if (err) {
                console.error(err);
            } else {
                fs.mkdirSync(outputDir, { recursive: true });
            }
        });
    }
}