// Entry point para a Discloud — inicia o servidor standalone do Next.js
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '8080';
process.env.HOSTNAME = '0.0.0.0';

// O standalone gera seu próprio server.js em .next/standalone/server.js
// Este arquivo apenas o invoca com as variáveis corretas
require('./.next/standalone/server.js');
