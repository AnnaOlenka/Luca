const { spawn } = require('child_process');

console.log('🚀 Iniciando servidor de desarrollo...\n');

const server = spawn('npm', ['start'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  if (output.includes('webpack compiled successfully') || output.includes('Compiled successfully')) {
    setTimeout(() => {
      console.log('\n✅ ¡APLICACIÓN LISTA!');
      console.log('🌐 Abre tu navegador en: http://localhost:3333');
      console.log('🌐 O prueba con: http://127.0.0.1:3333\n');
    }, 1000);
  }
});

server.stderr.on('data', (data) => {
  const error = data.toString();
  if (!error.includes('DeprecationWarning') && !error.includes('onAfterSetupMiddleware')) {
    console.error('❌ Error:', error);
  }
});

server.on('close', (code) => {
  console.log(`\n🛑 Servidor cerrado con código ${code}`);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  server.kill();
  process.exit();
});