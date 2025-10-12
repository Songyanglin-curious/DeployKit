const fs = require('fs');
const path = require('path');

const files = [
    'renderer-dist/index.html',
    'dist-electron/main.js',
    'package.json'
];

files.forEach(file => {
    const fullPath = path.join(__dirname, file);
    console.log(`${file}: ${fs.existsSync(fullPath) ? '✅ EXISTS' : '❌ MISSING'}`);
});