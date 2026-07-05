// Entry point para a Discloud - sempre faz build antes de subir
const { execSync } = require('child_process');

console.log('> Executando npm run build...');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
  console.log('> Build concluido!');
} catch (err) {
  console.error('> ERRO no build:', err.message);
  process.exit(1);
}

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
}).catch(err => {
  console.error('> Erro ao iniciar servidor:', err);
  process.exit(1);
});
