// Script para preparar o build standalone após npm run build
const fs = require('fs');
const path = require('path');

console.log('📦 Preparando build standalone...');

// Copia recursivamente um diretório
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`⚠️  Diretório não encontrado: ${src}`);
    return;
  }
  
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  // Copia arquivos estáticos para o standalone
  const staticSrc = '.next/static';
  const staticDest = '.next/standalone/.next/static';
  
  if (fs.existsSync(staticSrc)) {
    console.log('📁 Copiando .next/static...');
    copyDir(staticSrc, staticDest);
  }

  // Copia pasta public para o standalone
  const publicSrc = 'public';
  const publicDest = '.next/standalone/public';
  
  if (fs.existsSync(publicSrc)) {
    console.log('📁 Copiando public...');
    copyDir(publicSrc, publicDest);
  }

  console.log('✅ Build standalone preparado com sucesso!');
} catch (error) {
  console.error('❌ Erro ao preparar build:', error);
  process.exit(1);
}
