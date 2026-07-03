// Entry point para a Discloud — inicia o servidor standalone do Next.js
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '8080';
process.env.HOSTNAME = '0.0.0.0';

const path = require('path');
const fs = require('fs');

const standalonePath = path.join(__dirname, '.next', 'standalone', 'server.js');

if (!fs.existsSync(standalonePath)) {
  console.error('❌ ERRO: .next/standalone/server.js não encontrado!');
  console.error('   O build não foi executado corretamente.');
  console.error('   Execute: npm run build && node build.js');
  process.exit(1);
}

console.log('> Iniciando servidor standalone...');
require(standalonePath);
