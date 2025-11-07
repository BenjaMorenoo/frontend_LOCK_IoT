# Lock IoT — Frontend

Este directorio contiene la aplicación frontend del proyecto Lock IoT. Está construida con React + Vite y se comunica con el backend (API REST) y con el servidor WebSocket (Socket.IO) para recibir eventos en tiempo real.

Este README explica la estructura del proyecto, pasos de instalación y ejecución (PowerShell), variables de entorno relevantes, cómo integrar con el backend y recomendaciones de despliegue.

## Tecnologías principales

- Vite
- React (JSX)
- Tailwind CSS
- socket.io-client (para WebSocket)

## Estructura relevante

Paths importantes dentro de `src/`:

- `main.jsx` — punto de entrada (render React)
- `App.jsx` — componente raíz
- `index.css`, `App.css` — estilos globales
- `components/` — componentes reutilizables (e.g. `Sidebar.jsx`, `Modal.jsx`, `ProtectedRoute.jsx`)
- `pages/` — vistas principales (Login, Dashboard, Casilleros, Logs, etc.)
- `contexts/SidebarContext.jsx` — contexto para el sidebar
- `utils/api.js` — funciones para llamadas HTTP al backend

Revisa estos archivos cuando necesites cambiar la URL de la API o el comportamiento del socket.

## Requisitos

- Node.js >= 14 (recomendado 16+)
- npm o pnpm/yarn (aquí supondremos npm)

## Instalación (PowerShell)

Abrir PowerShell en la carpeta `frontend` y ejecutar:

```powershell
cd c:\Users\benja\Desktop\Poyectos\Lock_IoT_web\frontend
npm install
```

## Ejecución en desarrollo

Iniciar servidor de desarrollo (Vite):

```powershell
npm run dev
```

Esto levantará el frontend típicamente en `http://localhost:5173`.

## Variables de entorno y configuración

El proyecto utiliza una configuración mínima para la URL del backend. Por convención con Vite, crear un archivo `.env` o `.env.local` en la raíz del `frontend` con las siguientes variables (prefijo `VITE_` para exponerlas al código cliente):

```
VITE_API_BASE_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

Notas:
- `VITE_API_BASE_URL` debe apuntar al host y puerto donde corre el backend (ej. `http://localhost:3000`).
- `VITE_SOCKET_URL` se usa para la conexión Socket.IO si el cliente no deduce la URL automáticamente.

En el código, `src/utils/api.js` suele leer `import.meta.env.VITE_API_BASE_URL` para construir las llamadas HTTP.

## Integración con el backend

1) Llamadas HTTP
- Los endpoints REST (login, gestión de profesores, casilleros, logs) deben apuntar a `VITE_API_BASE_URL`. Asegúrate de enviar la cabecera `Authorization: Bearer <token>` en las rutas que lo requieran.

Ejemplo (fetch):

```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL;
const res = await fetch(`${API_BASE}/api/profesores`, {
	headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
});
```

2) WebSocket (Socket.IO)
- El frontend puede usar `socket.io-client` para conectarse y escuchar eventos en tiempo real (p. ej. `nueva-tarjeta`).

Ejemplo mínimo de uso en React:

```javascript
import { io } from 'socket.io-client';
import { useEffect } from 'react';

function useTarjetaSocket(onNewUid) {
	useEffect(() => {
		const socket = io(import.meta.env.VITE_SOCKET_URL || undefined);
		socket.on('nueva-tarjeta', onNewUid);
		return () => socket.disconnect();
	}, [onNewUid]);
}
```

Asegúrate de que el backend permita el origen del frontend en su configuración CORS (p. ej. `http://localhost:5173` durante desarrollo).

## Scripts útiles (package.json)

Los scripts típicos que puedes usar (revisa `package.json` para confirmar):

- `npm run dev` — iniciar servidor de desarrollo (Vite)
- `npm run build` — generar build de producción en `dist/`
- `npm run preview` — previsualizar el build localmente

## Build para producción

Generar artefactos estáticos:

```powershell
npm run build
```

El resultado se encuentra en la carpeta `dist/`. Sirve esos archivos con un servidor estático o mediante un proxy inverso (Nginx) que haga TLS y reenvíe las API al backend.

Recomendaciones de despliegue:

- Usar un servidor o CDN para servir los archivos `dist/`.
- Configurar Nginx para reenviar peticiones `/api` al backend en `http://localhost:3000` (u otra URL interna).
- Forzar HTTPS en producción.

## Linter / formateo / tests

Revisa `package.json` para comandos relacionados (p. ej. `lint`, `format`, `test`). Si no existen, considera agregar ESLint + Prettier y tests básicos para componentes críticos.

## Problemas comunes

- No se conectan eventos en tiempo real: verificar que `VITE_SOCKET_URL` apunta al backend correcto y que el backend permite el origen de frontend.
- 401/403 en llamadas a la API: comprobar cabecera `Authorization` y que el token no haya expirado.
- CORS: añadir `http://localhost:5173` a los orígenes permitidos en el backend mientras desarrollas.

## Siguientes pasos
- Añadir un `.env.example` con las variables `VITE_API_BASE_URL` y `VITE_SOCKET_URL` para que otros desarrolladores copien.
- Añadir scripts `lint` y `format`.

---
