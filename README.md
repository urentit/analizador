# U-RENT-IT — Analizador de crédito

Sistema interno de **pre-aprobación crediticia asistida por IA** para arrendamiento puro vehicular (renting). El analista sube los PDFs del expediente y el sistema extrae los datos, calcula indicadores, evalúa un semáforo de riesgo de 10 dimensiones y genera un dictamen — siguiendo las reglas de crédito calibradas de U-RENT-IT.

Es una aplicación de **un solo archivo HTML**, sin servidor ni base de datos. Los datos se guardan en el `localStorage` del navegador.

## Cómo usarlo

1. Abre `index.html` en Chrome o Edge (110+).
2. En el Paso 1, elige el **proveedor de IA**: Google Gemini (capa gratuita) o Anthropic Claude.
3. Pega la API Key del proveedor elegido (se guarda localmente).
4. Captura el análisis cualitativo (M0), sube los PDFs y ejecuta el análisis.

Clave gratuita de Gemini: aistudio.google.com → *Get API key*. Una sola clave de equipo da servicio a todo el piloto.

## Módulos

- **M0** Análisis cualitativo del negocio.
- **M1** Pipeline de expedientes (tablas ordenables/filtrables, reporte agregado, export CSV/JSON).
- **M2** Checklist de documentos + carga de PDFs.
- **M3** Análisis con IA (Gemini o Claude).
- **M4** Semáforo de riesgo (10 dimensiones).
- **M5** Dictamen con folio URIT-AAAA-MM-### y exportación a Word/PDF.
- **Configuración** Parámetros calibrados (Fase 1).

## Parámetros calibrados (v3)

Ratio renta/ingresos: aprobación ≤ 15 %, rechazo > 30 %. Endeudamiento máximo 50 %. Antigüedad mínima 24 meses. Vigencia del dictamen 60 días. (Ajustables en el panel de Configuración.)

## Estructura del repositorio

```
index.html                     Aplicación (un solo archivo)
docs/
  GUIA_DESPLIEGUE.md           Cómo hospedar/compartir con el equipo
  PROPUESTA_MULTIUSUARIO.md    Plan de la versión con servidor y datos compartidos
  METODOLOGIA.md               11 indicadores, 9 cruces, 10 dimensiones, lógica de decisión
  CONTEXTO.md                  Antecedentes, tipos de cliente, casos de referencia
casos-prueba/
  CASO_PRUEBA_ADOLFO_TREJO.md  Verdad de referencia para validar el análisis
```

## Casos de referencia

- **Precio y Variedad SA de CV** → CONDICIONADO.
- **CREA Conectividad** → RECHAZADO.
- **Adolfo Trejo Servicios Especiales** → CONDICIONADO (ver `casos-prueba/`).

## Nota de seguridad

Con Gemini capa gratuita, los documentos se envían a Google y hay límites de uso; adecuado para piloto. Para producción con datos sensibles, ver `docs/PROPUESTA_MULTIUSUARIO.md` (la clave vive en el servidor, no en el navegador).

---

*U-RENT-IT · Sistema de pre-aprobación crediticia · v3 calibrado.*
