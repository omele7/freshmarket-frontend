// Script para probar la conectividad con el backend
const https = require('https');
const http = require('http');

console.log('🔍 Probando conectividad con el backend de productos...\n');

// Probar HTTPS
const httpsUrl = 'https://localhost:5003/api/products';
console.log('Probando HTTPS:', httpsUrl);

const httpsOptions = {
  rejectUnauthorized: false, // Ignorar certificados SSL auto-firmados
};

https
  .get(httpsUrl, httpsOptions, (res) => {
    console.log('✅ HTTPS funciona!');
    console.log('   Status:', res.statusCode);
    console.log('   Headers:', JSON.stringify(res.headers, null, 2));

    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      try {
        const products = JSON.parse(data);
        console.log('   Productos encontrados:', Array.isArray(products) ? products.length : 'N/A');
      } catch (e) {
        console.log('   Respuesta:', data.substring(0, 200));
      }
    });
  })
  .on('error', (e) => {
    console.log('❌ HTTPS falló:', e.message);

    // Probar HTTP
    const httpUrl = 'http://localhost:5003/api/products';
    console.log('\nProbando HTTP:', httpUrl);

    http
      .get(httpUrl, (res) => {
        console.log('✅ HTTP funciona!');
        console.log('   Status:', res.statusCode);

        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const products = JSON.parse(data);
            console.log(
              '   Productos encontrados:',
              Array.isArray(products) ? products.length : 'N/A',
            );
            console.log('\n💡 El backend usa HTTP, no HTTPS');
            console.log(
              '   Cambia productServiceUrl en environments.ts a: http://localhost:5003/api',
            );
          } catch (e) {
            console.log('   Respuesta:', data.substring(0, 200));
          }
        });
      })
      .on('error', (e) => {
        console.log('❌ HTTP también falló:', e.message);
        console.log('\n⚠️ El backend no parece estar corriendo en el puerto 5003');
        console.log('   Asegúrate de iniciar el backend antes de probar el frontend');
      });
  });
