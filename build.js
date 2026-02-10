const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const ENTRY = path.join(ROOT, 'src', 'index.ts');
const BUNDLE = path.join(DIST, 'bundle.cjs');
const BLOB = path.join(DIST, 'sea-prep.blob');
const SEA_CONFIG = path.join(ROOT, 'sea-config.json');

const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';
const OUTPUT_BIN = path.join(DIST, isWindows ? 'PackManager.exe' : 'PackManager');

const NODE_BUILTINS = [
    'assert', 'async_hooks', 'buffer', 'child_process', 'cluster',
    'console', 'constants', 'crypto', 'dgram', 'diagnostics_channel',
    'dns', 'domain', 'events', 'fs', 'http', 'http2', 'https',
    'inspector', 'module', 'net', 'os', 'path', 'perf_hooks',
    'process', 'punycode', 'querystring', 'readline', 'repl',
    'stream', 'string_decoder', 'sys', 'timers', 'tls', 'trace_events',
    'tty', 'url', 'util', 'v8', 'vm', 'wasi', 'worker_threads', 'zlib'
];

const EXTERNALS = NODE_BUILTINS
    .flatMap(m => [`--external:${m}`, `--external:node:${m}`])
    .join(' ');

function run(cmd, label) {
    console.log(`[${label}] ${cmd}`);
    execSync(cmd, { stdio: 'inherit', cwd: ROOT });
}

async function build() {
    console.log(`=== DynamX Pack Manager - SEA Build (${process.platform}) ===\n`);

    // Ensure dist directory
    if (!fs.existsSync(DIST)) {
        fs.mkdirSync(DIST, { recursive: true });
    }

    // 1. Bundle with esbuild
    console.log('[1/5] Bundling with esbuild...');
    run(`pnpm exec esbuild "${ENTRY}" --bundle --platform=node --format=cjs --outfile="${BUNDLE}" ${EXTERNALS}`, 'esbuild');

    // 2. Generate SEA blob
    console.log('[2/5] Generating SEA blob...');
    run(`node --experimental-sea-config "${SEA_CONFIG}"`, 'sea-config');

    // 3. Copy Node binary
    console.log('[3/5] Copying Node binary...');
    fs.copyFileSync(process.execPath, OUTPUT_BIN);
    if (!isWindows) {
        fs.chmodSync(OUTPUT_BIN, 0o755);
    }

    // 4. Inject blob with postject
    console.log('[4/5] Injecting SEA blob...');
    if (isMac) {
        run(
            `pnpm exec postject "${OUTPUT_BIN}" NODE_SEA_BLOB "${BLOB}" --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 --macho-segment-name NODE_SEA`,
            'postject'
        );
        run(`codesign --sign - "${OUTPUT_BIN}"`, 'codesign');
    } else {
        run(
            `pnpm exec postject "${OUTPUT_BIN}" NODE_SEA_BLOB "${BLOB}" --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`,
            'postject'
        );
    }

    // Cleanup blob
    if (fs.existsSync(BLOB)) {
        fs.unlinkSync(BLOB);
    }

    // 5. Apply Windows icon & metadata with resedit (after postject)
    if (isWindows) {
        console.log('[5/5] Applying Windows icon & metadata...');
        const ResEdit = require('resedit');
        const ICON = path.join(ROOT, 'win-build', 'assets', 'icon.ico');
        const VERSION = [2, 4, 2, 0];

        const data = fs.readFileSync(OUTPUT_BIN);
        const exe = ResEdit.NtExecutable.from(data, { ignoreCert: true });
        const res = ResEdit.NtExecutableResource.from(exe);

        // Set icon
        console.log('  Setting icon...');
        const iconFile = ResEdit.Data.IconFile.from(fs.readFileSync(ICON));
        ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
            res.entries, 101, 1033,
            iconFile.icons.map((item) => item.data)
        );

        // Set version metadata
        console.log('  Setting version metadata...');
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
                ProductVersion: VERSION.slice(0, 3).join('.'),
            }
        );
        vi.outputToResourceEntries(res.entries);

        // Write back
        console.log('  Writing modified executable...');
        res.outputResource(exe);
        const newBinary = exe.generate();
        fs.writeFileSync(OUTPUT_BIN, Buffer.from(newBinary));
        console.log('  Icon & metadata applied.');
    }

    console.log(`\n=== Build complete: ${OUTPUT_BIN} ===`);
}

build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
