# U-RENT-IT — Guía de despliegue interno

**Aplica a:** `index.html` (Sistema de Pre-aprobación Crediticia, v3 calibrado)
**Objetivo:** que el equipo de crédito pueda abrir y usar el sistema desde sus equipos.

---

## 1. Requisitos por usuario

| Requisito | Detalle |
|---|---|
| Navegador | Google Chrome o Microsoft Edge 110 o superior |
| Internet | Necesario para el análisis con IA (llamada a Gemini o a Anthropic) |
| API Key | Una sola clave de equipo basta. El sistema soporta **Google Gemini (capa gratuita)** o **Anthropic Claude** |

No requiere instalación, servidor de aplicaciones ni base de datos: toda la lógica corre en el navegador.

---

## 2. Cómo entender los datos antes de elegir el hospedaje

Esto es lo más importante de toda la guía. El sistema guarda los expedientes en el **`localStorage` del navegador de cada persona**. Esto tiene dos consecuencias:

1. **Los datos NO se comparten automáticamente entre personas.** Si tres analistas abren el mismo archivo (o la misma URL), cada uno verá únicamente los expedientes que él mismo capturó. No hay un pipeline común en tiempo real.
2. **Para mover expedientes entre personas se usa Exportar / Importar JSON.** Quien tenga los expedientes los exporta desde el pipeline y el otro los importa. Es el mecanismo de colaboración actual.

Si lo que necesitas es que todo el equipo vea el **mismo** pipeline al mismo tiempo, eso requiere la versión multiusuario con datos compartidos (ver el documento `PROPUESTA_MULTIUSUARIO_URENTIT.md`).

---

## 3. Opciones de hospedaje

### Opción A — Servidor estático interno (recomendada)

Es la opción más limpia porque permite abrir el sistema desde una URL interna estable y conserva los datos de cada usuario entre sesiones.

1. Coloca `index.html` en la raíz de un sitio en IIS, Nginx o Apache (por ejemplo `https://intranet.urentit.mx/credito/`).
2. Asegura que el sitio se sirva por **HTTPS**.
3. Comparte la URL con el equipo.

Ventaja adicional: como el `localStorage` está ligado al **origen** (la URL), cada analista conserva sus expedientes mientras la URL no cambie, incluso cuando actualices el archivo.

### Opción B — SharePoint / OneDrive

Funciona, pero con una advertencia: SharePoint suele abrir los `.html` como descarga o en un visor, no como página ejecutable.

1. Sube `index.html` a una biblioteca de documentos del equipo.
2. Indica a los analistas que usen **Descargar** y luego abran el archivo en Chrome (no con el visor de Office).
3. Inconveniente: al abrir desde una ruta local (`file://`), el `localStorage` depende de la ruta exacta del archivo en cada equipo, así que conviene que cada quien lo guarde siempre en la misma carpeta.

### Opción C — Carpeta de red / OneDrive compartido (rápida y temporal)

1. Deja `index.html` en una carpeta compartida.
2. Cada analista lo copia a su equipo y lo abre en Chrome.
3. Es lo más rápido para empezar, pero el manejo de datos es el menos ordenado. Úsala como piloto.

---

## 3-bis. Proveedor de IA: Gemini (gratis) o Claude

En el **Paso 1** del expediente hay un selector **Proveedor de IA**:

- **Google Gemini (capa gratuita)** — recomendado para el piloto. No tiene costo dentro de los límites de la capa gratuita (aprox. 15 solicitudes por minuto y 1,500 por día). Ideal para probar con el equipo y con la dirección sin gastar.
- **Anthropic Claude** — mayor calidad para producción, pero es de pago por uso.

Cómo obtener la clave de **Gemini** (gratis): entra a **aistudio.google.com** con una cuenta de Google de la empresa → *Get API key* → *Create API key* → copia la clave (empieza con `AIza...`) y pégala en el Paso 1.

El campo **Modelo (opcional)** deja usar el modelo por defecto (`gemini-3.6-flash`). Solo cámbialo si Google renombra el modelo y aparece un error "modelo no encontrado (404)".

> Con Gemini gratis, **una sola cuenta de Google de la empresa** da servicio a todo el equipo del piloto: comparten esa misma clave. No hace falta que cada persona tenga la suya.

---

## 4. Seguridad de la API Key

La API Key se guarda **solo** en el `localStorage` del navegador de cada analista y nunca se sube a ningún lado, salvo en las llamadas directas a la API de Anthropic.

Recomendaciones:

- **No** incrustes una API Key dentro del archivo `index.html` antes de distribuirlo.
- Que cada analista use su propia key, o usen una key de equipo con un **límite de gasto** configurado en la consola de Anthropic.
- Si un equipo se reasigna o se da de baja, rota la key correspondiente.

> Nota: el modelo de API Key en el navegador es adecuado para un piloto interno, pero para producción con datos de crédito sensibles conviene mover la llamada de IA al lado servidor (ver propuesta multiusuario), de modo que la key viva en el servidor y no en cada equipo.

---

## 5. Respaldos

Como los datos viven en el navegador, el respaldo es responsabilidad del usuario:

- Exporta el JSON del pipeline de forma periódica (semanal, por ejemplo) y guárdalo en la carpeta del equipo.
- Antes de limpiar caché/cookies o de cambiar de equipo, exporta primero.

---

## 6. Actualizaciones del sistema

Cuando entregue una versión nueva:

1. Reemplaza el archivo `index.html` en el hospedaje.
2. En la Opción A (servidor con URL fija), los expedientes de cada usuario **se conservan**, porque el `localStorage` está ligado a la URL, no al archivo.
3. Pide a los analistas refrescar con `Ctrl+F5` para forzar la recarga.

---

## 7. Checklist de puesta en marcha

- [ ] Elegir opción de hospedaje (recomendado: A, servidor estático con HTTPS).
- [ ] Subir `index.html`.
- [ ] Definir el esquema de API Keys (individuales o de equipo con límite de gasto).
- [ ] Probar con el caso de referencia "Precio y Variedad" (CONDICIONADO) y "CREA Conectividad" (RECHAZADO).
- [ ] Establecer rutina de respaldo (exportar JSON).
- [ ] Comunicar al equipo el flujo de Exportar/Importar JSON para compartir expedientes.

---

*Documento de despliegue · U-RENT-IT · Sistema de Pre-aprobación Crediticia v3.*
