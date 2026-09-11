# U-RENT-IT — Contexto del Proyecto

**Documento:** Contexto y antecedentes del sistema de pre-aprobación crediticia  
**Versión:** 1.0 | Abril 2026

---

## 1. La empresa

U-RENT-IT es una empresa mexicana de **arrendamiento puro vehicular (renting)**. A diferencia del arrendamiento financiero, en el arrendamiento puro el cliente **nunca es propietario del vehículo**. La renta mensual incluye:

- Seguro del vehículo
- Mantenimiento preventivo y correctivo
- GPS y rastreo
- Gestión de trámites (tenencia, verificación, placas)

Los contratos se ofrecen a plazos de **24, 36 o 48 meses**.

---

## 2. El problema que resuelve este sistema

### Situación actual (antes del sistema)

El proceso de análisis de expedientes en U-RENT-IT era:

- **Manual:** El analista revisaba cada documento de forma individual, sin apoyo de cálculo automático
- **Sin criterios estandarizados:** Cada analista aplicaba su propio criterio para evaluar los mismos indicadores
- **Sin trazabilidad:** No existía un registro estructurado de por qué se aprobó, condicionó o rechazó un expediente
- **Lento:** El proceso completo podía tomar días, dependiendo de la disponibilidad del analista
- **Susceptible a error:** La extracción manual de datos de 14 documentos en formatos distintos generaba errores de captura y omisiones

### Solución implementada

Una herramienta web con IA embebida donde:

1. El ejecutivo sube los PDFs del expediente
2. Claude extrae automáticamente los datos de cada documento
3. El sistema calcula los indicadores financieros y realiza los cruces de consistencia
4. Se emite un semáforo de riesgo con resolución fundamentada
5. Se genera un dictamen pre-redactado listo para revisión del analista

---

## 3. Tipos de cliente

### PFAE — Persona Física con Actividad Empresarial

Persona física que realiza actividades empresariales y puede deducir gastos. El análisis se basa principalmente en:
- Declaraciones de ISR (anual + parciales del año en curso) como sustituto de estados financieros formales
- Estados de cuenta bancarios propios y del Obligado Solidario (OS)
- Buró de crédito del titular y del OS

**Documentos requeridos (13):**  
Solicitud, CSF, INE titular, INE OS, Comprobante domicilio PFAE, Comprobante domicilio OS, Estados de cuenta PFAE (3 meses), Estados de cuenta OS (3 meses), Declaración Anual ISR, Declaración Parcial año en curso, Buró PFAE, Buró OS, Cotización Firmada.

### PM — Persona Moral

Empresa constituida formalmente. Requiere documentación adicional para acreditar su existencia legal, la representación del RL y su salud financiera formal.

**Documentos requeridos (17):**  
Todo lo de PFAE más: Acta Constitutiva + Poderes, Estados Financieros último ejercicio, Estados Financieros parciales año en curso, Buró Empresarial. INE del Representante Legal en lugar de INE del titular.

### Cliente Actual

Cliente con contrato de renting vigente que solicita un vehículo adicional. Al tener relación previa con U-RENT-IT, se omiten los INEs (ya están en archivo) y la cotización se denomina "Corrida".

**Documentos requeridos (12):**  
Solicitud, CSF, Comprobante domicilio empresa, Comprobante domicilio OS, Estados de cuenta (3 meses), Estados de cuenta OS (3 meses), EF parciales año en curso (si PM), Declaración Anual, Declaración Parcial, Buró titular, Buró OS, Corrida Firmada.

---

## 4. Campos que extrae el sistema por tipo de documento

### Constancia de Situación Fiscal (CSF)
RFC, razón social, régimen fiscal, fecha inicio operaciones, estatus en padrón (activo/suspendido/cancelado), domicilio fiscal.

### Declaración Anual ISR
RFC, razón social, período/ejercicio, total ingresos acumulables, total deducciones autorizadas, utilidad fiscal antes de PTU, resultado fiscal, ISR a cargo o a favor, pérdidas fiscales anteriores, fecha de presentación.

### Declaración Parcial (mensual/bimestral)
RFC, período, ejercicio, fecha de presentación, ingresos cobrados del mes (base IVA 16%), IVA a cargo, ISR a cargo, estatus de pago.

### Buró de Crédito — Persona Física
Nombre, RFC, score FICO (BC Score), MOP máximo últimos 24 meses por crédito, saldo vencido total activo, número de créditos activos, consultas últimos 6 meses, mensajes HAWK, juicios reportados.

### Buró de Crédito — Empresa (Buró Empresas)
Razón social, RFC, resultado (con historial / datos no localizados), score si existe, créditos reportados.

### Estado de Cuenta Bancario (por cada mes)
Titular, banco, tipo de cuenta, RFC titular, saldo inicial, total depósitos, total retiros, número de movimientos, saldo final, saldo promedio reportado, retiros en efectivo del mes.

### Estado de Resultados (EF)
Ventas netas, costo de ventas, utilidad bruta, gastos operativos, utilidad/pérdida de operación, resultado financiero, utilidad/pérdida antes de impuestos, impuesto a la utilidad, resultado integral. Período. Firmado por contador (sí/no).

### Balance General (EF)
Activo circulante, activo no circulante, activo total, pasivo circulante, pasivo no circulante, pasivo total, capital social, resultado ejercicios anteriores, resultado del ejercicio, capital contable total. Período.

### Cotización / Corrida Firmada
Número, fecha, bien (marca/modelo/año), valor vehículo c/IVA, plazo (meses), anticipo 20%, comisión apertura, anticipo total, renta mensual s/IVA, renta mensual c/IVA, valor residual, firma del cliente (sí/no).

### Comprobante de Domicilio
Fecha de emisión, nombre titular, dirección completa, tipo (CFE/Telmex/agua/predial/otro), número de servicio.

### Acta Constitutiva + Poderes
Razón social, fecha de constitución, objeto social, sello RPPyC, representante legal (nombre), facultades, socios con % de participación.

---

## 5. Decisiones de diseño tomadas

| Decisión | Alternativas consideradas | Por qué se eligió |
|---|---|---|
| Artifact HTML/JS como interfaz | Odoo, Excel, aplicación web standalone | Sin infraestructura, sin deployment, listo en días. Migrable a standalone después. |
| localStorage por equipo para persistencia | Base de datos central, Supabase | Sin servidor ni costo adicional. Exportación JSON para compartir entre equipos. |
| Claude API embebida en el artifact | Captura manual, formularios, OCR externo | Claude puede leer PDFs de estructura variable que ningún formulario puede anticipar. |
| 10 dimensiones en el semáforo | Score único, 5 dimensiones, 15 dimensiones | Cubre todas las causales de riesgo relevantes sin ser redundante. |
| Resolución con causales específicas | Solo color del semáforo | El dictamen necesita justificación detallada para ser útil y auditable. |
| Parámetros como constantes editables | Hardcodeados, base de datos | Fáciles de actualizar sin tocar la lógica. Un cambio de política = editar un número. |
| Confirmar datos extraídos antes de calcular | Calcular y mostrar sin confirmación | La IA puede cometer errores en documentos de baja calidad. El analista es la última línea. |

---

## 6. Caso de prueba de referencia — CREA Conectividad

Este caso se usa para validar que el sistema extrae correctamente y emite la resolución correcta.

| Campo | Valor esperado |
|---|---|
| Razón social | CREA CONECTIVIDAD EN REDES ESPECIALES ALMERALLA SA DE CV |
| RFC | CCR240215EB0 |
| Tipo de cliente | PM (Persona Moral) |
| Resolución esperada | RECHAZADO |
| Ingresos 2025 | $2,217,297 |
| Resultado neto 2025 | -$133,914 (pérdida) |
| Capital contable dic/25 | -$103,235 (negativo) |
| Razón de liquidez dic/25 | 0.83 (< 1.0) |
| Score FICO RL | 665 |
| MOP máximo RL | 03 con saldo vencido de $5,806 |
| Buró empresarial | Datos no localizados (sin historial) |
| Antigüedad empresa | 14 meses (< 24 meses) |
| Ratio renta/ingresos | ~118% del flujo de febrero 2026 |
| Saldo promedio RL | ~$953 (cuenta prácticamente vacía) |
| Comportamiento bancario | La PM drena a cuenta personal del RL vía transferencias etiquetadas como préstamos |
| Vigencia comprobante domicilio | Vencido — CFE de octubre 2025 (> 90 días) |

**Causales de rechazo que el sistema debe identificar (9):**

1. Capital contable negativo — bloqueo automático
2. MOP 03 activo con saldo vencido en hipoteca del RL
3. Pérdida neta en el único ejercicio disponible
4. Razón de liquidez < 1.0 en todos los períodos
5. Ratio renta/ingresos > 100% con base en flujo real del mes
6. Saldo bancario RL promedio de $953 vs renta de $72,469/mes
7. Sin historial en Buró Empresas
8. Antigüedad de 14 meses (< parámetro de 24 meses)
9. Comprobante de domicilio vencido (> 90 días)

---

## 7. Archivos de trabajo del proyecto

| Archivo | Contenido | Para qué lo usa Claude |
|---|---|---|
| Criterios_Analisis_Expedientes_URENTIT.docx | 10 tablas de evaluación con criterios, metodología y alertas por tipo de documento | Afinar la extracción cuando un documento tiene estructura inusual |
| Mapa_Componentes_URENTIT.xlsx | 48 criterios clasificados: cálculo automático, campo capturado o checklist guiado | Referencia de qué campos son automáticos vs requieren intervención humana |
| Fase1_Parametros_URENTIT.xlsx | 25 parámetros numéricos y 18 reglas de negocio | Los valores definitivos con los que calibrar el sistema |
| PDFs caso CREA | 17 documentos de empresa de telecomunicaciones (alto riesgo) | Caso de prueba para validar la extracción y la resolución |

---

## 8. Hoja de ruta del proyecto

### Fase 0 — Construcción (completada)
- Diseño del system prompt operativo
- Construcción del artifact HTML/JS
- Definición de la arquitectura de módulos

### Fase 1 — Calibración (pendiente)
- Sesión con equipo de crédito para definir 25 parámetros numéricos
- Definición de 18 reglas de negocio propias de U-RENT-IT
- Actualización del system prompt con valores definitivos

### Fase 2 — Piloto (pendiente)
- Análisis de 10 expedientes históricos con el sistema
- Comparación de resoluciones del sistema vs resoluciones reales
- Ajuste de parámetros según resultados

### Fase 3 — Operación (pendiente)
- Uso operativo por el equipo de crédito
- Monitoreo de tasas de aprobación, rechazo y falsos positivos
- Evaluación de migración a aplicación standalone con multiusuario

---

*Elaborado con Claude (Anthropic) · Proyecto U-RENT-IT · Abril 2026*

---

## 9. Caso de prueba de referencia 2 — Precio y Variedad SA de CV

Segundo caso de prueba con perfil de riesgo muy distinto al de CREA Conectividad.

| Campo | Valor |
|---|---|
| Razón social | PRECIO Y VARIEDAD SA DE CV |
| RFC | PVA220420SB8 |
| Tipo de cliente | PM |
| Actividad | Comercio al por mayor de cigarros — Distribuidor autorizado Philip Morris |
| Antigüedad | 4 años (inicio: 20/04/2022) |
| Empleados | 78 |
| Flotilla solicitada | 5 vehículos (Tiguan R Line + Caddy Cargo + 3x Renault Kwid) |
| Renta total s/IVA | $64,960.68/mes |
| Declaración anual 2025 | ISR a favor $1,237,464 (presenta EF) |
| Declaración parcial feb/26 | ISR a cargo $124,914 + retenciones salarios $69,304 |
| Buró empresa | 3 cuentas MOP 111, límite $10.5M Philip Morris |
| Buró RL | 22 cuentas MOP 111, límite $58.8M, pagos puntuales |
| Estados de cuenta PM | Depósitos $57-92M/mes, saldo promedio ~$4.6M (dic-feb) |
| Estados de cuenta OS | Saldo promedio decreciente en 3 meses: $752K → $72K → $166K |
| Instalaciones | Rentadas, $45,800/mes, 5 meses en el lugar |

**Documentos presentes en el ZIP (11):**
- CSF PM ✅
- Acta constitutiva (2 versiones) ✅
- Comprobante domicilio empresa ✅ (escaneo, verificar vigencia)
- Comprobante domicilio OS ✅ (escaneo, verificar vigencia)
- Acuse declaración anual 2025 ✅
- Acuse declaración parcial feb/2026 (2 versiones con diferente folio) ✅
- Cotizaciones firmadas ✅
- Checklists de referencia ✅

**Documentos faltantes para completar el expediente:**
- Estados de cuenta PM (3 meses) ❌
- Estados de cuenta OS (3 meses) ❌
- Buró de crédito RL ❌
- Buró de crédito OS ❌
- Buró empresarial ❌
- INE Representante Legal ❌
- INE Obligado Solidario ❌
- Estados Financieros (último ejercicio + parciales) ❌

**Perfil cualitativo:** Distribuidor con contrato vigente de Philip Morris, 16 años de experiencia del RL en el sector, 48 rutas, modelo de negocio con ingresos recurrentes y referencias sólidas en la industria.
