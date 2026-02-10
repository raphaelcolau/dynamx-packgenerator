const ResEdit = require('resedit');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const OUTPUT_EXE = path.join(DIST, 'PackManager.exe');
const ICON = path.join(__dirname, 'assets', 'icon.ico');

const VERSION = [2, 4, 2, 0]; // major, minor, patch, build

async function main() {
    if (process.platform !== 'win32') {
        console.error('win-build.js must be run on Windows.');
        process.exit(1);
    }

    if (!fs.existsSync(OUTPUT_EXE)) {
        console.error(`${OUTPUT_EXE} not found. Run "npm run build" first.`);
        process.exit(1);
    }

    console.log('=== Applying Windows icon & metadata ===\n');

    // Load the executable (ignoreCert because postject corrupts the signature)
    const data = fs.readFileSync(OUTPUT_EXE);
    const exe = ResEdit.NtExecutable.from(data, { ignoreCert: true });
    const res = ResEdit.NtExecutableResource.from(exe);

    // Set icon
    console.log('Setting icon...');
    const iconFile = ResEdit.Data.IconFile.from(fs.readFileSync(ICON));
    ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
        res.entries,
        101,
        1033,
        iconFile.icons.map((item) => item.data)
    );

    // Set version metadata
    console.log('Setting version metadata...');
    const viList = ResEdit.Resource.VersionInfo.fromEntries(res.entries);
    const vi = viList[0];

    vi.setFileVersion(...VERSION, 1033);
    vi.setProductVersion(...VERSION, 1033);

    vi.setStringValues(
        { lang: 1033, codepage: 1200 },
        {
            FileDescription: 'Pack Manager for DynamX',
            ProductName: 'DynamX Pack Manager',
            LegalCopyright: 'Raphael Colau https://raphael.colau.fr',
            OriginalFilename: 'PackManager.exe',
            FileVersion: VERSION.slice(0, 3).join('.'),
            ProductVersion: VERSION.slice(0, 3).join('.')
        }
    );

    vi.outputToResourceEntries(res.entries);

    // Save
    console.log('Writing modified executable...');
    res.outputResource(exe);
    const newBinary = exe.generate();
    fs.writeFileSync(OUTPUT_EXE, Buffer.from(newBinary));

    console.log(`\n=== Windows build complete: ${OUTPUT_EXE} ===`);
}

main().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
