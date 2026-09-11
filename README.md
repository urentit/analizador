# U-RENT-IT — Analizador de crédito (aplicación web)

Sistema interno de **pre-aprobación crediticia asistida por IA** para arrendamiento puro vehicular (renting). El analista sube los PDFs del expediente y el sistema extrae datos, calcula indicadores, evalúa un semáforo de riesgo de 10 dimensiones y genera un dictamen — con las reglas de crédito calibradas de U-RENT-IT.

Aplicación web sobre **Vercel** (funciones serverless) + **Postgres** (pipeline compartido entre el equipo). La clave de IA vive en el servidor; el acceso está protegido por contraseña.

## Arquitectura

```
public/index.html        Frontend (una sola página; llama a /api)
api/
  login.js  logout.js    Acceso por contraseña (cookie de sesión firmada)
  analizar.js            Proxy a la IA (Gemini/Claude) — la clave vive en el servidor
  params.js              Lectura/edición de parámetros calibrados
  expedientes/           CRUD de expedientes (index.js, [id].js)
lib/
  db.js                  Postgres (expedientes y parámetros como JSONB)
  ia.js                  Llamadas a Gemini / Anthropic
  prompt.js              Reglas calibradas (v3) + armado del prompt
  auth.js                Sesión por cookie firmada (HMAC)
docs/                    GUIA_DESPLIEGUE, PROPUESTA_MULTIUSUARIO, METODOLOGIA, CONTEXTO
casos-prueba/            Casos de referencia para validar el análisis
legacy/standalone.html   Versión anterior de un solo archivo (referencia)
```

## Puesta en marcha

Ver **[DEPLOY.md](DEPLOY.md)**: importar el repo en Vercel, crear el Postgres y configurar las variables de entorno (`GEMINI_API_KEY`, `APP_PASSWORD`, `AUTH_SECRET`).

## Variables de entorno

Ver `.env.example`. Mínimas: `GEMINI_API_KEY`, `APP_PASSWORD`, `AUTH_SECRET`. Opcionales: `IA_PROVIDER`, `GEMINI_MODEL`.

## Reglas calibradas (v3)

Ratio renta/ingresos: aprobación ≤ 15 %, rechazo > 30 %. Endeudamiento máximo 50 %. Antigüedad mínima 24 meses. Vigencia del dictamen 60 días. Editables desde la pantalla de Configuración (se guardan en la base).

## Casos de referencia

- **Precio y Variedad SA de CV** → CONDICIONADO.
- **CREA Conectividad** → RECHAZADO.
- **Adolfo Trejo Servicios Especiales** → CONDICIONADO (ver `casos-prueba/`).

---

*U-RENT-IT · Analizador de crédito · v3 calibrado.*
