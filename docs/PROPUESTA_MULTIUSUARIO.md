# U-RENT-IT — Propuesta: versión multiusuario con datos compartidos

**Estado:** esbozo de arquitectura para discusión (no implementado).
**Punto de partida:** `index.html` v3 calibrado, autocontenido, con datos en `localStorage`.

---

## 1. Problema que resuelve

La versión actual funciona bien para un analista en su equipo, pero tiene tres límites para trabajo en equipo:

- **Datos aislados:** cada navegador guarda sus propios expedientes; no hay un pipeline común. Hoy se comparte exportando/importando JSON manualmente.
- **API Key en el cliente:** la clave de Anthropic vive en el navegador de cada persona, lo que dificulta el control de costos y la seguridad.
- **Sin control de acceso ni auditoría:** no hay roles (analista / gerente), ni bitácora de quién dictaminó qué y cuándo.

El objetivo de esta versión es que **todo el equipo vea y trabaje sobre el mismo pipeline**, con la IA y la clave centralizadas, y con trazabilidad.

---

## 2. Arquitectura propuesta

```
[ Navegador del analista ]
        │  (HTTPS)
        ▼
[ Backend API ]  ──►  [ Base de datos ]   (expedientes, parámetros, usuarios, bitácora)
        │
        └──►  [ Proxy de IA ]  ──►  API de Anthropic   (la API Key vive aquí, no en el cliente)
```

**Componentes:**

| Componente | Recomendación | Función |
|---|---|---|
| Frontend | El mismo HTML/SPA actual, adaptado | Captura, pipeline, semáforo, dictamen, reportes |
| Backend API | Node.js + Express o Python + FastAPI | CRUD de expedientes y parámetros; orquesta la IA |
| Base de datos | PostgreSQL (SQLite para arrancar) | Almacén central de expedientes y configuración |
| Proxy de IA | Endpoint del backend | Recibe los PDFs, llama a Claude con la key del servidor |
| Hospedaje | Azure App Service (encaja con su entorno Microsoft 365) o servidor interno con Docker | Despliegue |

---

## 3. Modelo de datos (centralizado)

Se reutiliza el modelo de expediente que ya existe en el sistema. Tablas mínimas:

- **expedientes**: `id (folio), tipo, cliente, rfc, renta, analista_id, fecha_ingreso, etapa, resolucion, causales (jsonb), semaforo (jsonb), dictamen, documentos (jsonb), cualitativo (jsonb), fecha_cierre, vigencia_hasta`.
- **parametros**: los 18 parámetros calibrados v3, versionados (para no perder calibración y poder auditar cambios).
- **usuarios**: `id, nombre, email, rol (analista | gerente | admin)`.
- **bitacora**: `id, usuario_id, accion, expediente_id, timestamp, detalle` — para auditoría.

---

## 4. Cambios en el frontend (acotados)

La buena noticia: la lógica ya está modularizada en funciones puntuales, así que migrar de `localStorage` a una API es un cambio contenido.

- Reemplazar `getExpedientes()` / `saveExpedientes()` por llamadas `fetch` al backend (`GET/POST/PUT/DELETE /expedientes`).
- Reemplazar `getParams()` / `saveParams()` por `GET/PUT /parametros`.
- Cambiar `ejecutarAnalisis()` para que envíe los PDFs al backend (`POST /analisis`) en lugar de llamar directo a `api.anthropic.com`.
- Quitar del UI el campo de **API Key** (ya no se necesita en el cliente).
- Agregar inicio de sesión y mostrar el rol del usuario (el botón de cerrar dictamen / visto bueno del gerente queda condicionado al rol).

El resto —semáforo, dictamen, reportes, exportación a Word/PDF y CSV— se mantiene igual.

---

## 5. IA del lado servidor

Mover la llamada a Anthropic al backend aporta tres beneficios concretos:

1. **Seguridad:** la API Key vive en variables de entorno del servidor; nunca llega al navegador.
2. **Control de costos:** un solo punto para medir uso, aplicar límites y cachear.
3. **Auditoría:** se registra cada análisis (quién, cuándo, qué expediente, costo).

El backend recibe los PDFs (o sus base64), arma el mismo system prompt calibrado que ya usamos, llama a Claude y devuelve al frontend el dictamen + el JSON estructurado del semáforo.

---

## 6. Autenticación y roles

- **SSO con Microsoft / Azure AD**, aprovechando que ya usan el entorno Microsoft 365 (SharePoint). Alternativa: login propio con correo y contraseña.
- **Roles:**
  - *Analista*: captura, analiza, redacta dictamen.
  - *Gerente*: da el visto bueno / firma el dictamen (regla de negocio ya documentada).
  - *Admin*: ajusta parámetros y gestiona usuarios.

---

## 7. Seguridad y cumplimiento

Al ser datos de crédito y datos personales (buró, INE, estados de cuenta), conviene tratar el cumplimiento desde el diseño:

- **HTTPS** en tránsito y cifrado en reposo en la base de datos.
- **Control de acceso** por rol y por usuario.
- **Bitácora de auditoría** (quién dictaminó qué y cuándo).
- **Retención y borrado** conforme a la LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de los Particulares).
- **PDFs:** hoy no se almacenan. Si se decide guardarlos, usar almacenamiento de objetos (p. ej. Azure Blob) con cifrado y política de retención.

> Esto es orientación general de diseño, no asesoría legal; conviene validar la parte de protección de datos con el área jurídica/cumplimiento de U-RENT-IT.

---

## 8. Plan por fases

| Fase | Alcance | Resultado |
|---|---|---|
| **A** | Backend mínimo + base de datos + migrar el CRUD de expedientes (sin tocar la IA) | Pipeline compartido entre el equipo |
| **B** | Proxy de IA en el servidor + quitar la API Key del cliente | IA centralizada y segura |
| **C** | Autenticación/SSO + roles + visto bueno del gerente | Control de acceso y firma |
| **D** | Bitácora de auditoría, respaldos automáticos, retención, PDFs en blob | Listo para producción/cumplimiento |

Las fases A y B ya entregan el mayor valor (datos compartidos + IA segura). C y D endurecen para producción.

---

## 9. Estimación y riesgos

- **Esfuerzo aproximado:** Fase A: 1–2 semanas; Fase B: ~1 semana; Fase C: 1–2 semanas; Fase D: 1–2 semanas. (Depende de SSO y de la infraestructura disponible.)
- **Riesgos principales:** integración con Azure AD, definición de retención de datos personales, y migración de los expedientes que hoy estén en `localStorage` de cada analista (se puede hacer con la importación de JSON existente).

---

## 10. Siguiente decisión

Para arrancar, conviene confirmar tres cosas:

1. **Hospedaje:** ¿Azure App Service (encaja con Microsoft 365) o servidor interno con Docker?
2. **Autenticación:** ¿SSO con Azure AD o login propio para el piloto?
3. **Alcance del piloto:** ¿empezamos con Fase A (pipeline compartido) y luego Fase B (IA segura)?

Con esas tres respuestas puedo aterrizar el plan técnico detallado y, si quieres, empezar a construir el backend de la Fase A.

---

*Propuesta de arquitectura · U-RENT-IT · Sistema de Pre-aprobación Crediticia.*
