/**
 * 🔧 Script de Debugging para Autenticación
 *
 * Copia y pega este código en la consola del navegador (F12 → Console)
 * para diagnosticar problemas de autenticación.
 */

// ============================================================================
// 🧹 LIMPIAR TODOS LOS DATOS DE AUTENTICACIÓN
// ============================================================================
function clearAuth() {
  console.log('🧹 Limpiando todos los datos de autenticación...');

  // Guardar datos actuales antes de limpiar (para debugging)
  const beforeClear = {
    token: localStorage.getItem('freshmarket_token'),
    user: localStorage.getItem('freshmarket_user'),
    legacyToken: localStorage.getItem('token'),
    legacyUser: localStorage.getItem('currentUser'),
  };

  console.log('📦 Datos antes de limpiar:', beforeClear);

  // Limpiar localStorage
  localStorage.removeItem('freshmarket_token');
  localStorage.removeItem('freshmarket_user');
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('refreshToken');

  // Limpiar sessionStorage
  sessionStorage.clear();

  console.log('✅ Datos de autenticación limpiados');
  console.log('💡 Recarga la página para aplicar los cambios: location.reload()');
}

// ============================================================================
// 🔍 VERIFICAR ESTADO DE AUTENTICACIÓN
// ============================================================================
function checkAuth() {
  console.log('🔍 Verificando estado de autenticación...\n');

  const token = localStorage.getItem('freshmarket_token');
  const userJson = localStorage.getItem('freshmarket_user');

  // 1. Verificar si existe el token
  if (!token) {
    console.error('❌ NO HAY TOKEN en localStorage');
    console.log('💡 Debes hacer login primero');
    return;
  }

  console.log('✅ Token presente en localStorage');
  console.log('📏 Longitud del token:', token.length, 'caracteres');
  console.log('🔑 Token (preview):', token.substring(0, 50) + '...\n');

  // 2. Decodificar JWT
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token JWT inválido (debe tener 3 partes)');
    }

    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));

    console.log('📋 JWT Header:', header);
    console.log('📦 JWT Payload:', {
      sub: payload.sub,
      email: payload.email,
      given_name: payload.given_name,
      family_name: payload.family_name,
      exp: payload.exp,
      iat: payload.iat,
      iss: payload.iss,
      aud: payload.aud,
    });

    // 3. Verificar expiración
    const expirationDate = new Date(payload.exp * 1000);
    const now = new Date();
    const isExpired = now >= expirationDate;

    console.log('\n⏰ Información de Expiración:');
    console.log('   Emitido:', new Date(payload.iat * 1000).toLocaleString());
    console.log('   Expira:', expirationDate.toLocaleString());
    console.log('   Estado:', isExpired ? '❌ EXPIRADO' : '✅ VÁLIDO');

    if (isExpired) {
      const expiredAgo = now - expirationDate;
      const hours = Math.floor(expiredAgo / (1000 * 60 * 60));
      console.log('   Expiró hace:', hours, 'horas');
      console.log('💡 Debes hacer login de nuevo');
    } else {
      const expiresIn = expirationDate - now;
      const hours = Math.floor(expiresIn / (1000 * 60 * 60));
      const minutes = Math.floor((expiresIn % (1000 * 60 * 60)) / (1000 * 60));
      console.log('   Expira en:', hours, 'horas y', minutes, 'minutos');
    }
  } catch (error) {
    console.error('❌ Error al decodificar el token:', error.message);
    console.log('💡 El token puede estar corrupto');
  }

  // 4. Verificar usuario en localStorage
  console.log('\n👤 Información del Usuario:');
  if (!userJson) {
    console.error('❌ NO HAY USUARIO en localStorage');
  } else {
    try {
      const user = JSON.parse(userJson);
      console.log('✅ Usuario guardado:', {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error('❌ Error al parsear usuario:', error.message);
    }
  }

  // 5. Verificar keys legacy
  console.log('\n🔍 Verificando keys legacy:');
  const legacyToken = localStorage.getItem('token');
  const legacyUser = localStorage.getItem('currentUser');

  if (legacyToken || legacyUser) {
    console.warn('⚠️ Hay datos legacy en localStorage:');
    if (legacyToken) console.log('   - token (legacy)');
    if (legacyUser) console.log('   - currentUser (legacy)');
    console.log('💡 Ejecuta clearAuth() para limpiarlos');
  } else {
    console.log('✅ No hay datos legacy');
  }
}

// ============================================================================
// 🧪 PROBAR ENDPOINT /api/auth/me
// ============================================================================
async function testAuthMe() {
  console.log('🧪 Probando endpoint /api/auth/me...\n');

  const token = localStorage.getItem('freshmarket_token');

  if (!token) {
    console.error('❌ No hay token. Debes hacer login primero.');
    return;
  }

  const url = 'https://localhost:5001/api/auth/me';

  try {
    console.log('📡 GET', url);
    console.log('🔑 Authorization: Bearer', token.substring(0, 30) + '...');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 Status:', response.status, response.statusText);

    if (response.ok) {
      const user = await response.json();
      console.log('✅ Usuario obtenido correctamente:', user);
    } else {
      const error = await response.text();
      console.error('❌ Error del servidor:', error);

      if (response.status === 401) {
        console.log('\n💡 Error 401 - Posibles causas:');
        console.log('   1. El token está expirado');
        console.log('   2. El usuario no existe en la nueva base de datos');
        console.log('   3. El token es inválido');
        console.log('\n🔧 Solución: Ejecuta clearAuth() y luego haz login de nuevo');
      }
    }
  } catch (error) {
    console.error('❌ Error de red:', error.message);
    console.log('💡 Asegúrate de que el backend esté corriendo en https://localhost:5001');
  }
}

// ============================================================================
// 📊 VER TODO EL LOCALSTORAGE
// ============================================================================
function showStorage() {
  console.log('📊 Contenido completo de localStorage:\n');

  if (localStorage.length === 0) {
    console.log('   (vacío)');
  } else {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      let value = localStorage.getItem(key);

      // Truncar valores largos
      if (value.length > 100) {
        value = value.substring(0, 100) + '... (' + value.length + ' caracteres)';
      }

      console.log(`   ${key}:`, value);
    }
  }

  console.log('\n📊 Contenido de sessionStorage:\n');
  if (sessionStorage.length === 0) {
    console.log('   (vacío)');
  } else {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      const value = sessionStorage.getItem(key);
      console.log(`   ${key}:`, value);
    }
  }
}

// ============================================================================
// 🎯 AYUDA - MOSTRAR COMANDOS DISPONIBLES
// ============================================================================
function help() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🔧 COMANDOS DE DEBUGGING DISPONIBLES                          ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  checkAuth()     - Verificar estado de autenticación          ║
║  clearAuth()     - Limpiar todos los datos de auth            ║
║  testAuthMe()    - Probar endpoint /api/auth/me               ║
║  showStorage()   - Ver todo el localStorage/sessionStorage    ║
║  help()          - Mostrar esta ayuda                         ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║  📝 EJEMPLO DE USO:                                            ║
║                                                                ║
║  1. checkAuth()    // Ver estado actual                       ║
║  2. testAuthMe()   // Probar si el token funciona             ║
║  3. clearAuth()    // Si hay problemas, limpiar todo          ║
║  4. location.reload()  // Recargar la página                  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
}

// ============================================================================
// 🚀 AUTO-EJECUTAR AL CARGAR EL SCRIPT
// ============================================================================
console.log(
  '%c🔧 Script de Debugging de Autenticación cargado',
  'color: #4CAF50; font-weight: bold; font-size: 14px;',
);
console.log(
  '%cEjecuta help() para ver los comandos disponibles',
  'color: #2196F3; font-size: 12px;',
);
console.log('');

// Mostrar ayuda automáticamente
help();
