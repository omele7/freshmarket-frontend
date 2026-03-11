# FreshMarket - Frontend

Aplicación web de comercio electrónico desarrollada con Angular 21. Permite a los usuarios explorar un catálogo de productos, gestionar un carrito de compras, realizar pedidos y administrar su perfil. El proyecto consume una arquitectura de microservicios en el backend.

---

## Tabla de Contenidos

- [Descripcion General](#descripcion-general)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitectura del Proyecto](#arquitectura-del-proyecto)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Modulos y Funcionalidades](#modulos-y-funcionalidades)
- [Servicios del Backend](#servicios-del-backend)
- [Configuracion e Instalacion](#configuracion-e-instalacion)
- [Variables de Entorno](#variables-de-entorno)
- [Scripts Disponibles](#scripts-disponibles)
- [Seguridad y Autenticacion](#seguridad-y-autenticacion)
- [Sistema de Notificaciones](#sistema-de-notificaciones)
- [Convenios de Codigo](#convenios-de-codigo)

---

## Descripcion General

FreshMarket es una tienda en linea especializada en productos frescos. La aplicacion implementa un flujo de compra completo: registro e inicio de sesion, navegacion por el catalogo, administracion del carrito, checkout y consulta del historial de pedidos. Ademas incluye paginas informativas (Sobre Nosotros, Terminos y Condiciones, Politica de Privacidad) y un perfil de usuario con gestion de direccion de envio.

---

## Tecnologias Utilizadas

| Tecnologia         | Version | Proposito                                      |
| ------------------ | ------- | ---------------------------------------------- |
| Angular            | 21.1.x  | Framework principal                            |
| TypeScript         | 5.9.x   | Lenguaje de programacion                       |
| RxJS               | 7.8.x   | Programacion reactiva y manejo de observables  |
| TailwindCSS        | 4.1.x   | Estilos utilitarios                            |
| Angular Router     | 21.1.x  | Navegacion con lazy loading y view transitions |
| Angular HttpClient | 21.1.x  | Comunicacion con APIs REST                     |
| Vitest             | 4.x     | Pruebas unitarias                              |

No se utilizan librerias de componentes de terceros. Todos los elementos de interfaz (modales, notificaciones, formularios) son implementaciones propias.

---

## Arquitectura del Proyecto

La aplicacion sigue el patron de arquitectura por caracteristicas (feature-based architecture) con tres capas bien definidas:

- **Core**: Servicios singleton, interceptores HTTP, guards de ruta y el layout principal (navbar, footer). Se inicializa una sola vez a nivel de aplicacion.
- **Features**: Modulos independientes por funcionalidad de negocio (autenticacion, home, productos, carrito, pedidos, usuario, paginas legales, sobre nosotros). Cada uno gestiona sus propios componentes y sub-servicios.
- **Shared**: Modelos de datos, pipes reutilizables y componentes transversales (dialogo de confirmacion, notificacion toast).

Todos los componentes son **standalone** (sin NgModules). La carga de rutas es **lazy** para optimizar el tiempo de carga inicial.

---

## Estructura de Carpetas

```
src/
  app/
    core/
      guards/            # AuthGuard - proteje rutas privadas
      interceptors/      # authInterceptor, httpErrorInterceptor
      layout/            # LayoutComponent (shell con navbar y footer)
        navbar/
        footer/
      services/          # AuthService, CartService, OrderService, UserService
    features/
      auth/
        login/
        register/
      home/              # Pagina principal con productos destacados
      products/
        components/      # Listado de productos
        services/        # ProductService
      cart/
        components/      # Gestion del carrito
      orders/
        components/      # Historial y eliminacion de pedidos
      user/
        components/      # Perfil de usuario y direccion de envio
      about/             # Pagina Sobre Nosotros
      legal/
        terms/           # Terminos y Condiciones
        privacy/         # Politica de Privacidad
    shared/
      components/
        confirm-dialog/  # Modal de confirmacion personalizado
        toast/           # Notificacion tipo toast
      models/            # Interfaces TypeScript (auth, cart, order, product, user)
      pipes/             # CurrencyPipe, DateFormatPipe
  environments/
    environments.ts      # URLs de microservicios (desarrollo y produccion)
```

---

## Modulos y Funcionalidades

### Autenticacion

- Registro de nuevos usuarios con validacion de formulario reactivo.
- Inicio de sesion con JWT. El token se almacena en `localStorage`.
- Cierre de sesion con confirmacion mediante dialogo personalizado.
- Proteccion de rutas privadas mediante `AuthGuard`.
- Logout automatico ante respuestas HTTP 401 (sesion expirada).

### Catalogo de Productos

- Listado de todos los productos disponibles consumido desde el microservicio de productos.
- Indicador visual de stock disponible.
- Accion de agregar al carrito con notificacion de confirmacion.
- Datos de respaldo (mock) en caso de fallo de conexion con el servidor.

### Carrito de Compras

- Sincronizacion en tiempo real con el backend.
- Incremento, decremento y eliminacion de items individuales.
- Vaciado completo con confirmacion.
- Proceso de checkout con resumen del pedido y confirmacion previa.

### Pedidos

- Historial de pedidos agrupados por numero de orden.
- Eliminacion individual de pedidos con confirmacion.
- Eliminacion masiva de todo el historial.

### Perfil de Usuario

- Edicion de datos personales (nombre, apellido, telefono).
- Gestion de direccion de envio (agregar, actualizar, eliminar).

### Paginas Informativas

- **Home**: Muestra una seleccion aleatoria de 4 productos destacados.
- **Sobre Nosotros**: Informacion corporativa con mision, vision, historia y valores.
- **Terminos y Condiciones**: Documento legal completo con 11 secciones.
- **Politica de Privacidad**: Documento legal completo con 10 secciones.
- Las paginas legales detectan el estado de autenticacion para mostrar el enlace de retorno correspondiente.

---

## Servicios del Backend

La aplicacion consume tres microservicios independientes:

| Servicio             | Puerto (desarrollo)      | Responsabilidad                             |
| -------------------- | ------------------------ | ------------------------------------------- |
| User Service         | `https://localhost:5001` | Autenticacion, registro, perfil y direccion |
| Product Service      | `https://localhost:5003` | Catalogo de productos                       |
| Order & Cart Service | `https://localhost:5002` | Carrito de compras, checkout, pedidos       |

> Los tres servicios deben estar en ejecucion para el funcionamiento completo de la aplicacion. El backend debe tener CORS habilitado para el origen `https://localhost:4200`.

---

## Configuracion e Instalacion

### Requisitos previos

- Node.js 20 o superior
- npm 10 o superior
- Angular CLI 21 (`npm install -g @angular/cli@21`)
- Los tres microservicios del backend en ejecucion

### Pasos de instalacion

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd mini-shop-frontend

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm start
```

La aplicacion estara disponible en `https://localhost:4200`.

---

## Variables de Entorno

Las URLs de los microservicios se configuran en `src/environments/environments.ts`:

```typescript
export const environment = {
  production: false,
  productServiceUrl: 'https://localhost:5003/api',
  userServiceUrl: 'https://localhost:5001/api',
  orderServiceUrl: 'https://localhost:5002/api',
  cartServiceUrl: 'https://localhost:5002/api',
};
```

Para un entorno de produccion, actualizar los valores en `environmentProd` dentro del mismo archivo.

---

## Scripts Disponibles

| Comando         | Descripcion                                    |
| --------------- | ---------------------------------------------- |
| `npm start`     | Inicia el servidor de desarrollo en modo watch |
| `npm run build` | Genera el build de produccion en `/dist`       |
| `npm run watch` | Build en modo watch para desarrollo            |
| `npm test`      | Ejecuta las pruebas unitarias con Vitest       |

---

## Seguridad y Autenticacion

- **JWT Bearer Token**: Adjuntado automaticamente a todas las solicitudes HTTP privadas mediante `authInterceptor`.
- **X-User-Id Header**: Extraido del payload del JWT y enviado como cabecera adicional en cada solicitud autenticada.
- **Rutas protegidas**: `AuthGuard` redirige a `/login` si el usuario no esta autenticado.
- **Manejo de errores HTTP**: `httpErrorInterceptor` centraliza el tratamiento de errores (401, 403, 404, 409, 422, 429, 500, 502, 503, errores de red).
- **Auto-logout**: Al recibir un 401 en cualquier ruta protegida, se limpian todos los datos de sesion y se redirige al login con parametro `sessionExpired=true`.

---

## Sistema de Notificaciones

La aplicacion implementa un sistema de dialogo y notificacion propio, sin dependencias externas:

- **ConfirmDialogComponent**: Modal de confirmacion con variantes de tipo `danger`, `warning`, `success` e `info`. Utiliza una API basada en `Promise` para integrarse de forma limpia con flujos asincronos.
- **ToastComponent**: Notificacion flotante en la parte inferior de la pantalla. Se auto-descarta a los 3 segundos (configurable). Variantes: `success`, `error`, `warning`, `info`.
- **DialogService**: Servicio singleton que gestiona el estado de ambos componentes mediante signals de Angular. Montado globalmente en `AppComponent`.

Todos los `confirm()` y `alert()` nativos del navegador han sido reemplazados por este sistema.

---

## Convenios de Codigo

- **Componentes standalone**: Ningun componente usa NgModules.
- **Signals**: Estado local de componentes gestionado con `signal()` e `input()` de Angular.
- **Control flow moderno**: Se utiliza la sintaxis `@if`, `@for`, `@switch` en lugar de directivas estructurales.
- **Lazy loading**: Todas las rutas principales cargan sus componentes de forma diferida con `loadComponent`.
- **Scroll restaurado**: `withInMemoryScrolling({ scrollPositionRestoration: 'top' })` garantiza que cada navegacion inicie desde la parte superior de la pagina.
- **RxJS**: Los servicios exponen `Observable` y utilizan `pipe` con operadores (`map`, `tap`, `catchError`, `switchMap`). Los errores se propagan mediante `throwError`.
- **Formateo**: Prettier con `printWidth: 100` y `singleQuote: true`.
