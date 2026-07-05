// start.js - Roda o build se necessário e depois inicia o servidor
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const buildIdPath = path.join(__dirname, '.next', 'BUILD_ID');
const forceRebuildPath = path.join(__dirname, '.next', 'REBUILD');

// Força rebuild se .next não existe ou se marcador de rebuild existe
if (!fs.existsSync(buildIdPath) || fs.existsSync(forceRebuildPath)) {
  console.log('> Executando npm run build...');
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
    // Remove marcador de rebuild se existir
    if (fs.existsSync(forceRebuildPath)) fs.unlinkSync(forceRebuildPath);
    console.log('> Build concluído!');
  } catch (err) {
    console.error('> ERRO no build:', err.message);
    process.exit(1);
  }
} else {
  console.log('> Build encontrado, iniciando servidor...');
}

// Inicia o servidor Next.js
process.env.NODE_ENV = 'production';

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT || '8080', 10);
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, '0.0.0.0', () => {
    console.log(`> GordaoAdmin rodando em http://0.0.0.0:${port}`);
  });
});
