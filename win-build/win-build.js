const exe = require('@angablue/exe');

console.log('Building...');
const build = exe({
    entry: './src/index.js',
    out: './dist/PackManager.exe',
    pkg: ['-C', 'GZip'], // Specify extra pkg arguments
    version: '2.4.2',
    target: 'latest-win-x64',
    icon: './win-build/assets/icon.ico', // Application icons must be in .ico format
    properties: {
        FileDescription: 'Pack Manager for DynamX',
        ProductName: 'DynamX Pack Manager',
        LegalCopyright: 'Raphael Colau https://raphael.colau.fr',
        OriginalFilename: 'PackManager.exe'
    }
});

build.then(() => console.log('Build completed!'));