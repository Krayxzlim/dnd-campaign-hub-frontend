# D&D Campaign Hub — React

Web para dirigir campañas, participantes, misiones y encuentros. Comparte Supabase Auth y la API Express/Prisma con DNDcompanion Android.

## Ejecutar

Requisitos: Node 22+ y el backend configurado con su conexión PostgreSQL.

```sh
npm ci
npm run dev
```

La URL y clave pública del proyecto ya están en `config/supabase.public.json`; no hace falta `.env.local` para usar este proyecto. Reiniciar Vite después de actualizar. Si ya existe un archivo con valores de ejemplo, quitarlos o reemplazarlos con `.env.example`.

Para sobrescribir la configuración, crear `.env.local` desde `.env.example` (PowerShell: `Copy-Item .env.example .env.local`):

- `VITE_API_URL`: URL de Express terminada en `/api`; por defecto `http://localhost:3001/api`.
- `VITE_SUPABASE_URL`: URL del mismo proyecto usado por el backend y Android. Sobrescribir siempre junto con la clave pública.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: clave pública. Nunca usar la clave secreta, `service_role` o una conexión PostgreSQL en variables VITE.

Agregar el origen de Vite a `CORS_ORIGINS` del backend. En Supabase Auth configurar Site URL y Redirect URLs para la web; habilitar email/password. Si se exige confirmación de email, el formulario indica que se debe confirmar antes del login.

## Cambios de integración

- Supabase administra login, registro, persistencia, renovación y cierre de sesión.
- `api.js` obtiene el access token de la sesión y lo envía como Bearer a Express. Elimina el token JWT anterior `dnd_token` al iniciar.
- La base de datos se consume exclusivamente a través de Express.
- Cualquier cuenta puede crear su campaña y pasa a ser DM de esa campaña. Botones de edición solo aparecen cuando `campaign.dmId === user.id`; el servidor vuelve a comprobarlo.
- Agregar participantes mediante búsqueda por correo exacto. Deben haberse registrado e iniciado sesión al menos una vez.
- Asignación y aceptación de misiones son acciones separadas. Se muestra quién aceptó desde Android o web.
- Recompensas XP y oro separadas del texto libre. No hay acreditación automática de XP todavía.
- La página de usuarios muestra compañeros de campañas; un DM no puede eliminar cuentas globales.

## Recorrido

1. Registrar/confirmar dos cuentas y entrar con ambas.
2. Crear una campaña con la primera y agregar a la segunda desde Jugadores.
3. Crear misión, asignarla y aceptarla desde Android con la segunda cuenta.
4. Recargar Misiones para ver la aceptación; completar como DM y actualizar Android.

La sincronización en esta entrega es por petición/recarga, no realtime. Conservar el backend activo y accesible por HTTPS para dispositivos reales. No usar cuentas demo del sistema de autenticación anterior.

## Verificación

```sh
npm run lint
npm run build
```

El contrato completo y la migración Prisma se mantienen en el [backend](https://github.com/Krayxzlim/dnd-campaign-hub-backend/tree/feat/supabase-prisma-integration/docs/integration.md). No se despliegan servicios con este cambio.

## Recuperación de contraseña

En el login, **Olvidé mi contraseña** solicita el correo sin requerir contraseña. El enlace abre `/?recovery=1`, donde el usuario escribe y confirma una nueva contraseña de al menos 8 caracteres. La pantalla valida la sesión con Supabase, informa enlaces inválidos/vencidos y permite solicitar otro. No necesita Express para completar el cambio. Tras guardar se solicita el cierre global de sesiones y se vuelve a ingresar con la nueva contraseña; los access tokens ya emitidos pueden seguir vigentes hasta expirar.

En **Supabase → Authentication → URL Configuration**, agregar a **Redirect URLs** las direcciones exactas usadas:

- `http://localhost:5173/?recovery=1` para abrir el correo en la computadora de desarrollo.
- `http://127.0.0.1:5173/?recovery=1` si se usa ese host.
- La dirección HTTPS real de la web con `/?recovery=1` para producción y celulares físicos.

La web usa su propio origen para el enlace. Configurar también Site URL con la web correcta; no dejar `localhost:3000` si Vite corre en 5173. Las plantillas de correo deben conservar `{{ .ConfirmationURL }}` (plantilla predeterminada de Supabase). El flujo usa enlaces de recuperación estándar; no cambia la contraseña de PostgreSQL ni expone claves privadas.

Comprobación: `node --test test/passwordRecovery.test.js`, `npm run build` y `npm run lint`. Para la aceptación real, solicitar el enlace con una cuenta propia, abrirlo, verificar mismatch/vencimiento, guardar, y probar login con la nueva contraseña en web y Android. Los tests automáticos no envían correos ni modifican cuentas reales.
