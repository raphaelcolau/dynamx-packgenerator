export function packCreator(files, input) {
    const command = input.trim();
    let step = 0;
    const element = [];
    let packId = [...Array(6)].map(() => Math.random().toString(36).charAt(2)).join('');

    console.log("Creator mode activated. Type /exit to exit creator mode.");
}