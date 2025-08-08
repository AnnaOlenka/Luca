const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando servidor de desarrollo...');

const child = spawn('npm', ['start'], {
  cwd: path.join(__dirname),
  stdio: 'inherit',
  env: { ...process.env, PORT: '3003', BROWSER: 'none' }
});

child.on('close', (code) => {
  console.log(`Proceso terminado con código ${code}`);
  process.exit(code);
});

child.on('error', (error) => {
  console.error('Error:', error);
  process.exit(1);
});

console.log('Servidor iniciado. Accede a http://localhost:3003');

// Mantener el proceso vivo
process.on('SIGINT', () => {
  console.log('Cerrando servidor...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Cerrando servidor...');
  child.kill('SIGTERM');
});