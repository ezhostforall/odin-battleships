import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir);

// Create classes directory in dist
const distClassesDir = path.join(distDir, 'classes');
fs.mkdirSync(distClassesDir);

// Create utils directory in dist
const distUtilsDir = path.join(distDir, 'utils');
fs.mkdirSync(distUtilsDir);

// Copy HTML file
fs.copyFileSync(
  path.join(__dirname, 'src', 'index.html'),
  path.join(distDir, 'index.html')
);

// Copy CSS file
fs.copyFileSync(
  path.join(__dirname, 'src', 'styles.css'),
  path.join(distDir, 'styles.css')
);

// Copy main JS file
fs.copyFileSync(
  path.join(__dirname, 'src', 'index.js'),
  path.join(distDir, 'index.js')
);

// Copy all class files
const classFiles = ['ship.js', 'gameboard.js', 'player.js', 'gameController.js'];
classFiles.forEach(file => {
  fs.copyFileSync(
    path.join(__dirname, 'src', 'classes', file),
    path.join(distClassesDir, file)
  );
});

// Copy utils if any exist
const srcUtilsDir = path.join(__dirname, 'src', 'utils');
if (fs.existsSync(srcUtilsDir)) {
  const utilFiles = fs.readdirSync(srcUtilsDir);
  utilFiles.forEach(file => {
    if (file.endsWith('.js')) {
      fs.copyFileSync(
        path.join(srcUtilsDir, file),
        path.join(distUtilsDir, file)
      );
    }
  });
}

console.log('✅ Build completed successfully!');
console.log('📁 Files copied to dist/ directory');
console.log('🚀 Ready for deployment to GitHub Pages');