// Ver la estructura exacta de los datos del backend
const https = require('https');

const options = {
  rejectUnauthorized: false,
};

https
  .get('https://localhost:5003/api/products', options, (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      const products = JSON.parse(data);
      console.log('📦 Total de productos:', products.length);
      console.log('\n🔍 Estructura del primer producto:');
      console.log(JSON.stringify(products[0], null, 2));
      console.log('\n📋 Propiedades del primer producto:');
      console.log('Keys:', Object.keys(products[0]));
    });
  })
  .on('error', console.error);
