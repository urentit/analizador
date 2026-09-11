# Despliegue en Vercel

Guía para poner en línea el Analizador de crédito como aplicación web con pipeline compartido.

## Requisitos

- Repositorio en GitHub: `github.com/urentit/analizador` (ya configurado como `origin`).
- Cuenta en [vercel.com](https://vercel.com) (puedes entrar con tu GitHub).
- Una API Key de Google Gemini (gratis) — [aistudio.google.com](https://aistudio.google.com) → *Get API key*.

## Paso 1 — Subir el código a GitHub

Desde la carpeta del proyecto:

```bash
git add -A
git commit -m "Aplicación web (Vercel)"
git push -u origin main
```

## Paso 2 — Importar el proyecto en Vercel

1. En Vercel: **Add New → Project → Import** y elige el repo `urentit/analizador`.
2. Framework preset: **Other** (Vercel detecta las funciones en `/api` y sirve `/public`).
3. No cambies el build; pulsa **Deploy** (fallará la primera vez hasta configurar la base y las variables — es normal).

## Paso 3 — Crear la base de datos (Postgres)

1. En el proyecto → pestaña **Storage → Create Database → Postgres** (Neon).
2. Conéctala al proyecto. Vercel agrega automáticamente las variables `POSTGRES_URL` y relacionadas.
3. No hay que crear tablas a mano: la app las crea sola en la primera consulta.

## Paso 4 — Variables de entorno

En **Settings → Environment Variables** agrega (Production y Preview):

| Variable | Valor | Obligatoria |
|---|---|---|
| `GEMINI_API_KEY` | tu clave de Gemini (empieza con `AIza` o `AQ.`) | Sí |
| `APP_PASSWORD` | la contraseña que usará el equipo para entrar | Sí |
| `AUTH_SECRET` | una cadena larga y aleatoria (firma la sesión) | Sí |
| `IA_PROVIDER` | `gemini` (por defecto) o `anthropic` | No |
| `GEMINI_MODEL` | `gemini-3.6-flash` (por defecto) | No |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | solo si usas Claude | No |

Para generar un `AUTH_SECRET`: en cualquier terminal `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

## Paso 5 — Desplegar y probar

1. **Deployments → Redeploy** (para tomar las variables nuevas).
2. Abre la URL que da Vercel (p. ej. `https://analizador-urentit.vercel.app`).
3. Entra con la contraseña de `APP_PASSWORD`.
4. Crea un expediente, sube PDFs y ejecuta el análisis. Los expedientes quedan en la base compartida: **todo el equipo ve el mismo pipeline**.

## Notas y límites

- **Tamaño de la petición:** Vercel limita el cuerpo de cada función (~4.5 MB). Sube pocos PDFs a la vez o comprímelos; si el análisis falla con error de tamaño, esa es la causa.
- **Duración:** el análisis puede tardar; `vercel.json` fija `maxDuration` de 60 s para `/api/analizar`. En el plan gratuito el máximo puede ser menor; si ves timeouts, reduce el número de PDFs o considera el plan Pro.
- **Seguridad:** la clave de Gemini vive solo en el servidor (variable de entorno), nunca en el navegador. El acceso está protegido por contraseña; para roles de gerente/analista, ver la siguiente fase en `docs/PROPUESTA_MULTIUSUARIO.md`.

## Desarrollo local (opcional)

```bash
npm i -g vercel
vercel link          # conecta la carpeta al proyecto de Vercel
vercel env pull      # descarga las variables a .env.local
vercel dev           # levanta la app en http://localhost:3000
```

---

*U-RENT-IT · Analizador de crédito — despliegue en Vercel.*
