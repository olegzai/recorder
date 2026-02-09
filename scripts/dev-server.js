const express = require('express');
const path = require('path');
const chokidar = require('chokidar');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;

// Serve static files from src directory
app.use(express.static(path.join(__dirname, '../')));

// Watch for changes in TypeScript files and rebuild
console.log('Watching for file changes...');
chokidar.watch('../src/**/*.ts').on('change', (event, path) => {
  console.log(`File changed: ${path}. Rebuilding...`);
  exec('npm run build', (error, stdout, stderr) => {
    if (error) {
      console.error(`Build error: ${error}`);
      return;
    }
    console.log(`Build completed: ${stdout}`);
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, () => {
  console.log(`Development server running at http://localhost:${PORT}`);
});
