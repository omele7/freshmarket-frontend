/**
 * 🔍 Script de Debugging Avanzado - Token JWT
 *
 * Este script verifica exactamente qué está pasando con el token
 * que el frontend envía al backend
 */

// ============================================================================
// 📊 ANALIZAR TOKEN ACTUAL
// ============================================================================
function analyzeToken() {
  console.log('%c🔍 ANÁLISIS DEL TOKEN JWT', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
  console.log('');

  const token = localStorage.getItem('freshmarket_token');

  if (!token) {
    console.error('❌ No hay token en localStorage');
    console.log('💡 Haz login primero');
    return null;
  }

  console.log('✅ Token encontrado en localStorage');
  console.log('📏 Longitud:', token.length, 'caracteres\n');

  // Dividir el token en partes
  const parts = token.split('.');

  if (parts.length !== 3) {
    console.error('❌ Token JWT inválido - debe tener 3 partes separadas por puntos');
    console.log('   Partes encontradas:', parts.length);
    return null;
  }

  console.log('✅ Token tiene 3 partes (header.payload.signature)\n');

  try {
    // Decodificar header
    const header = JSON.parse(atob(parts[0]));
    console.log('📋 HEADER:', header);
    console.log('   Algoritmo:', header.alg);
    console.log('   Tipo:', header.typ);
    console.log('');

    // Decodificar payload
    const payload = JSON.parse(atob(parts[1]));
    console.log('📦 PAYLOAD:');
    console.log('   sub (User ID):', payload.sub || '❌ NO EXISTE');
    console.log('   email:', payload.email || '❌ NO EXISTE');
    console.log('   given_name:', payload.given_name || payload.GivenName || '-');
    console.log('   family_name:', payload.family_name || payload.FamilyName || '-');
    console.log('   iss (Issuer):', payload.iss || '❌ NO EXISTE');
    console.log('   aud (Audience):', payload.aud || '❌ NO EXISTE');
    console.log('   exp (Expiration):', payload.exp || '❌ NO EXISTE');
    console.log('   iat (Issued At):', payload.iat || '-');
    console.log('   jti (JWT ID):', payload.jti || '-');
    console.log('');

    // Verificar fechas
    if (payload.exp) {
      const expirationDate = new Date(payload.exp * 1000);
      const issuedDate = payload.iat ? new Date(payload.iat * 1000) : null;
      const now = new Date();
      const isExpired = now >= expirationDate;

      console.log('⏰ INFORMACIÓN DE TIEMPO:');
      if (issuedDate) {
        console.log('   Emitido:', issuedDate.toLocaleString());
      }
      console.log('   Expira:', expirationDate.toLocaleString());
      console.log('   Ahora:', now.toLocaleString());
      console.log('   Estado:', isExpired ? '❌ EXPIRADO' : '✅ VÁLIDO');

      if (!isExpired) {
        const expiresIn = expirationDate - now;
        const hours = Math.floor(expiresIn / (1000 * 60 * 60));
        const minutes = Math.floor((expiresIn % (1000 * 60 * 60)) / (1000 * 60));
        console.log('   Expira en:', hours, 'horas y', minutes, 'minutos');
      }
      console.log('');
    }

    // Verificar valores esperados por el backend
    console.log('✅ VERIFICACIÓN DE REQUISITOS DEL BACKEND:');
    const checks = {
      'sub existe': !!payload.sub,
      'sub es string': typeof payload.sub === 'string',
      'sub es numérico': !isNaN(payload.sub),
      'iss es "FreshMarket.UserService"': payload.iss === 'FreshMarket.UserService',
      'aud es "FreshMarket.Clients"': payload.aud === 'FreshMarket.Clients',
      'Token no expirado': payload.exp && new Date(payload.exp * 1000) > new Date(),
    };

    for (const [check, passed] of Object.entries(checks)) {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    }
    console.log('');

    // Signature
    console.log('🔐 SIGNATURE (firmada con secreto del backend):');
    console.log('   ', parts[2].substring(0, 50) + '...');
    console.log('   ⚠️ Esta firma debe coincidir con la clave secreta del backend');
    console.log('');

    // Full token para copiar
    console.log('📋 TOKEN COMPLETO (para copiar y verificar en jwt.io):');
    console.log(token);
    console.log('');
    console.log('🌐 Verifica el token en: https://jwt.io');
    console.log('   Pega el token en jwt.io y verifica que:');
    console.log('   1. El payload se decodifica correctamente');
    console.log('   2. La signature dice "Signature Verified" con la clave correcta');
    console.log('');

    return { header, payload, signature: parts[2] };
  } catch (error) {
    console.error('❌ Error al decodificar el token:', error.message);
    console.log('   El token puede estar corrupto o mal formado');
    return null;
  }
}

// ============================================================================
// 🧪 PROBAR LLAMADA A /api/auth/me CON DETALLES
// ============================================================================
async function testAuthMeDetailed() {
  console.log(
    '%c🧪 PRUEBA DETALLADA: GET /api/auth/me',
    'color: #2196F3; font-weight: bold; font-size: 16px;',
  );
  console.log('');

  const token = localStorage.getItem('freshmarket_token');

  if (!token) {
    console.error('❌ No hay token. Haz login primero.');
    return;
  }

  const url = 'https://localhost:5001/api/auth/me';

  console.log('📡 Preparando solicitud...');
  console.log('   URL:', url);
  console.log('   Method: GET');
  console.log('   Headers:');
  console.log('      Authorization: Bearer', token.substring(0, 30) + '...');
  console.log('      Content-Type: application/json');
  console.log('');

  try {
    console.log('⏳ Enviando solicitud...');
    const startTime = performance.now();

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    console.log('');
    console.log('📊 RESPUESTA RECIBIDA:');
    console.log('   Status:', response.status, response.statusText);
    console.log('   Tiempo:', duration, 'ms');
    console.log('');

    // Headers de respuesta
    console.log('📋 Response Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`   ${key}: ${value}`);
    }
    console.log('');

    if (response.ok) {
      const user = await response.json();
      console.log('%c✅ ÉXITO - Usuario obtenido:', 'color: #4CAF50; font-weight: bold;');
      console.log(user);
      console.log('');
      console.log('🎉 El frontend está funcionando correctamente!');
    } else {
      const error = await response.json();
      console.log('%c❌ ERROR DEL BACKEND:', 'color: #f44336; font-weight: bold;');
      console.log(error);
      console.log('');

      if (response.status === 401) {
        console.log('💡 Error 401 - Token rechazado por el backend');
        console.log('');
        console.log('🔍 POSIBLES CAUSAS (EN EL BACKEND):');
        console.log('   1. La clave secreta JWT es diferente entre:');
        console.log('      - El método que GENERA el token (login)');
        console.log('      - El método que VALIDA el token (auth/me)');
        console.log('');
        console.log('   2. app.UseAuthentication() no está configurado correctamente');
        console.log('      Debe estar ANTES de app.UseAuthorization()');
        console.log('');
        console.log('   3. El endpoint /api/auth/me no tiene el atributo [Authorize]');
        console.log('');
        console.log('   4. Los valores de Issuer o Audience no coinciden');
        console.log('      Token tiene: iss =', analyzeToken().payload.iss);
        console.log('                   aud =', analyzeToken().payload.aud);
        console.log('      Backend espera: iss = "FreshMarket.UserService"');
        console.log('                      aud = "FreshMarket.Clients"');
        console.log('');
        console.log('   5. El claim "sub" no se está leyendo correctamente');
        console.log('      Token tiene: sub =', analyzeToken().payload.sub);
        console.log('');
        console.log('📄 Consulta BACKEND_TOKEN_ISSUE.md para soluciones detalladas');
      }
    }
  } catch (error) {
    console.error('❌ Error de red:', error.message);
    console.log('');
    console.log('💡 Posibles causas:');
    console.log('   1. El backend no está corriendo en https://localhost:5001');
    console.log('   2. Problema de CORS - el backend no permite el origin');
    console.log('   3. Certificado SSL inválido');
  }
}

// ============================================================================
// 🔬 COMPARAR TOKEN ANTES Y DESPUÉS DE LOGIN
// ============================================================================
function monitorTokenChanges() {
  console.log(
    '%c🔬 MONITOR DE CAMBIOS DE TOKEN',
    'color: #FF9800; font-weight: bold; font-size: 16px;',
  );
  console.log('Este script monitorea cambios en el token cada 2 segundos');
  console.log('Presiona Ctrl+C o refresca la página para detener');
  console.log('');

  let previousToken = localStorage.getItem('freshmarket_token');

  const interval = setInterval(() => {
    const currentToken = localStorage.getItem('freshmarket_token');

    if (currentToken !== previousToken) {
      console.log('');
      console.log('🔔 CAMBIO DETECTADO EN EL TOKEN');
      console.log('   Timestamp:', new Date().toLocaleString());

      if (!previousToken && currentToken) {
        console.log('   Tipo: Token creado (login exitoso)');
        console.log('');
        analyzeToken();
      } else if (previousToken && !currentToken) {
        console.log('   Tipo: Token eliminado (logout)');
      } else {
        console.log('   Tipo: Token actualizado');
        console.log('');
        analyzeToken();
      }

      previousToken = currentToken;
    }
  }, 2000);

  console.log('✅ Monitor activo');
  return interval;
}

// ============================================================================
// 🎯 DIAGNÓSTICO COMPLETO
// ============================================================================
async function fullDiagnosis() {
  console.clear();
  console.log(
    '%c═══════════════════════════════════════════════════════════',
    'color: #9C27B0; font-weight: bold;',
  );
  console.log(
    '%c  🏥 DIAGNÓSTICO COMPLETO DEL TOKEN JWT',
    'color: #9C27B0; font-weight: bold; font-size: 18px;',
  );
  console.log(
    '%c═══════════════════════════════════════════════════════════',
    'color: #9C27B0; font-weight: bold;',
  );
  console.log('');

  // 1. Analizar token
  console.log('%c1️⃣ ANÁLISIS DEL TOKEN', 'color: #2196F3; font-weight: bold; font-size: 14px;');
  console.log('');
  const tokenData = analyzeToken();

  if (!tokenData) {
    console.log('❌ No se puede continuar sin un token válido');
    return;
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  // 2. Probar endpoint
  console.log(
    '%c2️⃣ PRUEBA DEL ENDPOINT /api/auth/me',
    'color: #2196F3; font-weight: bold; font-size: 14px;',
  );
  console.log('');
  await testAuthMeDetailed();

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('%c📊 DIAGNÓSTICO COMPLETADO', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
  console.log('');
}

// ============================================================================
// 🎯 AYUDA
// ============================================================================
function helpTokenDebug() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🔍 COMANDOS DE DEBUGGING DE TOKEN JWT                         ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  analyzeToken()           - Analizar el token actual          ║
║  testAuthMeDetailed()     - Probar endpoint /api/auth/me      ║
║  fullDiagnosis()          - Diagnóstico completo             ║
║  monitorTokenChanges()    - Monitorear cambios en el token    ║
║  helpTokenDebug()         - Mostrar esta ayuda               ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║  📝 USO RECOMENDADO:                                           ║
║                                                                ║
║  1. fullDiagnosis()    // Ejecutar diagnóstico completo       ║
║                                                                ║
║  Esto analizará el token y probará el endpoint /api/auth/me   ║
║  mostrando exactamente dónde está el problema                 ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
}

// Auto-ejecutar
console.log(
  '%c🔧 Script de Debugging de Token JWT cargado',
  'color: #4CAF50; font-weight: bold; font-size: 14px;',
);
console.log(
  '%cEjecuta helpTokenDebug() para ver los comandos disponibles',
  'color: #2196F3; font-size: 12px;',
);
console.log('');
helpTokenDebug();
