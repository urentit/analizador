# U-RENT-IT — Metodología de Análisis Crediticio

**Documento:** Metodología del sistema de pre-aprobación crediticia con IA  
**Versión:** 1.0 | Abril 2026

---

## 1. Visión general

El sistema evalúa un expediente de crédito en cuatro etapas secuenciales:

```
Extracción de datos → Cálculo de indicadores → Cruces de consistencia → Semáforo + Resolución
```

Ninguna etapa reemplaza el criterio del analista. El sistema proporciona insumos estructurados y fundamentados; la decisión final siempre requiere confirmación humana.

---

## 2. Extracción de datos

### 2.1 Cómo funciona

El sistema envía cada PDF a la API de Claude con instrucciones específicas de qué campos extraer de cada tipo de documento. Claude devuelve los valores encontrados campo por campo.

### 2.2 Manejo de información no disponible

- Si un campo no es visible en el documento: se registra como **"No visible en el documento"**
- Si un campo tiene baja confianza de lectura (documento escaneado, borroso, formato atípico): se marca con **⚠️** para revisión manual
- El analista puede corregir cualquier campo antes de confirmar el cálculo del semáforo

### 2.3 Campos críticos por tipo de documento

Los campos más importantes para la resolución son:

| Documento | Campos críticos |
|---|---|
| CSF | RFC, fecha inicio operaciones, estatus en padrón |
| Buró personal | Score FICO, MOP máximo activo, saldo vencido total |
| Estados de cuenta | Saldo promedio, total depósitos, retiros en efectivo |
| Declaración Anual | Ingresos acumulables, resultado fiscal |
| EF — Balance | Capital contable, activo circulante, pasivo circulante, pasivo total, activo total |
| EF — Resultados | Ventas netas, utilidad/pérdida neta |
| Cotización/Corrida | Renta mensual s/IVA, plazo, firma del cliente |

---

## 3. Indicadores financieros calculados

El sistema calcula automáticamente 11 indicadores a partir de los datos extraídos.

### 3.1 Razón de liquidez
```
Razón de liquidez = Activo circulante / Pasivo circulante
```
Mide la capacidad de la empresa para cubrir sus obligaciones de corto plazo con sus activos de corto plazo.

- **Alerta (amarillo):** < PARAM_LIQUIDEZ_MIN (default: 1.0)
- **Bloqueo (rojo):** Si el valor es < 0.80 junto con otras señales de riesgo

### 3.2 Nivel de endeudamiento
```
Endeudamiento = Pasivo total / Activo total
```
Mide qué proporción de los activos está financiada con deuda.

- **Alerta (amarillo):** > PARAM_ENDEUDAMIENTO_MAX (default: 0.70)

### 3.3 Capital contable
```
Capital contable = Activo total - Pasivo total
```
Indica el valor neto de la empresa para sus socios.

- **Bloqueo automático (rojo):** Si capital contable < 0 → RECHAZADO sin excepción

### 3.4 Margen de utilidad neta
```
Margen neto = Utilidad neta / Ventas netas
```
Mide la rentabilidad real de la operación después de todos los gastos e impuestos.

- **Alerta (amarillo):** Si el margen es negativo (empresa en pérdida)
- **Rojo:** Si hay pérdidas consecutivas en más de un período

### 3.5 Ratio renta/ingresos
```
Ratio = Renta mensual s/IVA / (Ingresos anuales declarados / 12)
```
Mide qué porcentaje del ingreso mensual promedio representa el compromiso de la renta.

- **Alerta (amarillo):** > PARAM_RATIO_RENTA_MAX (default: 35%)
- **Bloqueo (rojo) → RECHAZADO:** > PARAM_RATIO_RECHAZO (default: 50%)

### 3.6 Saldo promedio bancario
```
Saldo promedio = (Saldo final mes1 + mes2 + mes3) / 3
```
Referencia de liquidez real disponible del solicitante.

- **Alerta (amarillo):** Saldo promedio < Renta × PARAM_MULTIPLICADOR_SALDO (default: 2x)

### 3.7 Tendencia de saldo
Compara el saldo final del mes más reciente vs el mes más antiguo de los tres analizados.

- **Alerta (amarillo):** Tendencia decreciente en los tres meses consecutivos

### 3.8 Brecha fiscal (bancos vs declaración)
```
Brecha fiscal = |Depósitos anualizados - Ingresos declarados| / Ingresos declarados × 100
Depósitos anualizados = Promedio mensual depósitos × 12
```
Detecta inconsistencia entre lo que entra a las cuentas bancarias y lo que se declara al SAT.

- **Alerta (amarillo):** > PARAM_BRECHA_MAX_PCT (default: 20%)

### 3.9 Brecha EF vs declaración (solo PM)
```
Brecha EF = |Ventas EF - Ingresos declarados ISR| / Ventas EF × 100
```
Detecta inconsistencia entre los estados financieros formales y la declaración fiscal.

- **Alerta (amarillo):** > PARAM_BRECHA_EF_PCT (default: 15%)

### 3.10 Antigüedad de la empresa
```
Antigüedad (meses) = Meses transcurridos desde fecha inicio CSF hasta hoy
```
Mide el tiempo que lleva operando el negocio formalmente registrado ante el SAT.

- **Alerta (amarillo):** < PARAM_ANTIG_MIN_MESES (default: 24 meses)
- **Bloqueo si combinado con:** Buró empresarial sin historial Y antigüedad < 12 meses → RECHAZADO

### 3.11 Vigencia de documentos
- **Alerta (amarillo):** CSF con más de 90 días de emisión
- **Alerta (amarillo):** Comprobante de domicilio con más de 90 días de emisión
- **Bloqueo (rojo) → RECHAZADO:** Documento obligatorio ausente o con vigencia vencida crítica

---

## 4. Cruces de consistencia

El sistema realiza 9 cruces entre documentos para detectar inconsistencias que podrían indicar riesgo de fraude o información incorrecta.

| # | Cruce | Acción si falla |
|---|---|---|
| 1 | RFC en CSF == RFC en cotización == RFC en declaración | BLOQUEO — RECHAZADO |
| 2 | Nombre/razón social consistente entre CSF, buró y declaración | Alerta |
| 3 | Titular cuenta bancaria == razón social del solicitante | Alerta si no coincide sin justificación |
| 4 | Brecha depósitos bancarios anualizados vs ingresos declarados | Alerta si > parámetro |
| 5 | Brecha ventas EF vs ingresos declaración anual (solo PM) | Alerta si > parámetro |
| 6 | Fecha inicio CSF vs ejercicios en estados financieros | Alerta si inconsistente |
| 7 | Domicilio fiscal CSF vs dirección comprobante de domicilio | Alerta si entidades federativas distintas |
| 8 | Plazo en cotización dentro de plazos válidos (24, 36, 48 meses) | BLOQUEO si plazo no válido |
| 9 | Transferencias frecuentes empresa → cuenta personal del RL etiquetadas como "préstamos" | Alerta — documentar en dictamen |

El cruce 9 es especialmente relevante porque detecta el uso de recursos empresariales para gastos personales del socio, práctica que distorsiona la capacidad de pago real de la empresa.

---

## 5. Semáforo de riesgo — 10 dimensiones

Cada dimensión recibe un color (verde / amarillo / rojo) con justificación específica.

| # | Dimensión | Qué evalúa |
|---|---|---|
| 1 | Identidad y documentos | RFC consistente entre documentos, documentos vigentes, poderes suficientes del RL, objeto social congruente con la actividad declarada |
| 2 | Antigüedad de operación | Meses de operación desde fecha inicio CSF |
| 3 | Capacidad de pago | Ratio renta/ingresos, tendencia de ingresos en declaraciones parciales |
| 4 | Historial crediticio titular/RL | Score FICO, MOP máximo activo, saldo vencido total, mensajes HAWK, juicios |
| 5 | Historial crediticio OS | Mismos indicadores para el Obligado Solidario |
| 6 | Historial crediticio empresa | Buró empresarial: con historial, sin historial, datos no localizados |
| 7 | Saldo bancario vs renta | Saldo promedio 3 meses vs multiplicador requerido de la renta |
| 8 | Comportamiento bancario | Tendencia de saldo, proporción de efectivo, congruencia con actividad declarada, transferencias atípicas entre cuentas |
| 9 | Salud financiera (PM) | Liquidez, endeudamiento, capital contable, margen neto, pérdidas consecutivas |
| 10 | Monto vs perfil | Cotización vs ingresos reales, valor del vehículo vs antigüedad y tamaño del negocio |

### Regla de agregación

- **Verde:** La dimensión no presenta alertas relevantes
- **Amarillo:** La dimensión presenta alertas que no impiden la aprobación pero requieren atención
- **Rojo:** La dimensión presenta causales de rechazo o condiciones graves

---

## 6. Lógica de resolución

### 6.1 RECHAZADO — automático si cualquiera de estas condiciones se cumple

| Causal | Indicador |
|---|---|
| Capital contable negativo | Balance general |
| MOP activo >= 03 con saldo vencido | Buró personal |
| Score FICO < PARAM_SCORE_MIN_COMITE | Buró personal |
| Ratio renta/ingresos > PARAM_RATIO_RECHAZO | Cálculo |
| Buró empresarial sin historial Y antigüedad < 12 meses | Buró + CSF |
| Documento obligatorio vencido o ausente | Checklist |
| RFC inconsistente entre documentos | Cruce 1 |

El rechazo automático es definitivo: si cualquiera de estas causales se activa, la resolución es RECHAZADO independientemente del resto del expediente.

### 6.2 CONDICIONADO — requiere comité si cualquiera de estas condiciones se cumple

| Condición | Indicador |
|---|---|
| Score FICO entre PARAM_SCORE_MIN_COMITE y PARAM_SCORE_MIN_APROBADO | Buró personal |
| MOP 02 activo en créditos significativos | Buró personal |
| Ratio entre PARAM_RATIO_RENTA_MAX y PARAM_RATIO_RECHAZO | Cálculo |
| Liquidez entre 0.80 y PARAM_LIQUIDEZ_MIN | Balance |
| Antigüedad entre 12 y PARAM_ANTIG_MIN_MESES | CSF |
| Buró en blanco (sin historial, pero datos sí localizados) | Buró |
| 3 o más dimensiones del semáforo en amarillo | Semáforo |

### 6.3 APROBADO — si se cumplen todas estas condiciones simultáneamente

- Ninguna causal de rechazo activada
- Menos de 3 dimensiones del semáforo en amarillo
- Score FICO >= PARAM_SCORE_MIN_APROBADO
- Ratio renta/ingresos <= PARAM_RATIO_RENTA_MAX

---

## 7. Parámetros del sistema

Todos los umbrales numéricos son configurables desde la sección de Parámetros de la aplicación. Los valores por defecto son provisionales hasta completar la Fase 1.

| Parámetro | Default | Tipo | Descripción |
|---|---|---|---|
| PARAM_SCORE_MIN_APROBADO | 650 | Corte | Score FICO mínimo para aprobación directa |
| PARAM_SCORE_MIN_COMITE | 550 | Corte | Score FICO mínimo para escalar a comité |
| PARAM_MOP_MAX_SIN_COMITE | 2 | Corte | MOP máximo sin escalar a comité |
| PARAM_CONSULTAS_BURO_MAX | 5 | Alerta | Consultas al buró en últimos 6 meses |
| PARAM_RATIO_RENTA_MAX | 0.35 | Alerta | Ratio renta/ingresos — nivel de alerta |
| PARAM_RATIO_RECHAZO | 0.50 | Bloqueo | Ratio renta/ingresos — nivel de rechazo |
| PARAM_MULTIPLICADOR_SALDO | 2 | Alerta | Saldo promedio mínimo en múltiplos de renta |
| PARAM_BRECHA_MAX_PCT | 20 | Alerta | Brecha fiscal bancos vs declaración (%) |
| PARAM_BRECHA_EF_PCT | 15 | Alerta | Brecha EF vs declaración ISR (%) |
| PARAM_LIQUIDEZ_MIN | 1.0 | Alerta | Razón de liquidez mínima aceptable |
| PARAM_ENDEUDAMIENTO_MAX | 0.70 | Alerta | Nivel de endeudamiento máximo |
| PARAM_ANTIG_MIN_MESES | 24 | Alerta | Antigüedad mínima de operación en meses |
| PARAM_DEPOSITO_GARANTIA | 2 | Info | Depósito en garantía en múltiplos de renta |

**Tipo de parámetro:**
- **Corte:** Determina directamente la resolución (aprobado / comité / rechazado)
- **Bloqueo:** Activa rechazo automático
- **Alerta:** Cambia el color del semáforo a amarillo o rojo
- **Info:** Informativo, no afecta la resolución

---

## 8. El dictamen

El dictamen es el documento de cierre del análisis. Incluye:

1. **Encabezado:** Datos del expediente (nombre, RFC, tipo, fecha, analista)
2. **Resumen ejecutivo:** Resolución y justificación en 2-3 oraciones
3. **Datos extraídos:** Tabla con los valores más relevantes de cada documento
4. **Indicadores calculados:** Valores numéricos y semáforo de cada indicador
5. **Causales:** Lista detallada de las razones de la resolución
6. **Condicionantes (si aplica):** Qué documentos o acciones se requieren para reconsiderar
7. **Firma del analista:** Campo para nombre y fecha de revisión

El dictamen es editable por el analista antes de guardarse. El sistema genera un borrador; el analista tiene la última palabra.

---

## 9. Limitaciones conocidas del sistema

| Limitación | Impacto | Mitigación |
|---|---|---|
| PDFs escaneados de baja calidad | Claude puede no leer correctamente algunos campos | Campos marcados con ⚠️ para revisión manual |
| Estados financieros no estandarizados | La extracción puede requerir ajuste | El analista puede corregir antes de confirmar |
| Buró con layout complejo | La lectura del MOP puede fallar en formatos inusuales | Revisar siempre el campo MOP manualmente |
| Documentos en idioma distinto al español | No contemplado | No aplica en el contexto de U-RENT-IT |
| Límite de 4,000 tokens en respuesta de IA | Expedientes muy complejos pueden truncarse | Dividir el análisis en dos sesiones si es necesario |
| localStorage limitado por dispositivo | Expedientes no se comparten automáticamente entre equipos | Usar Exportar/Importar JSON para sincronizar |

---

## 10. Flujo completo de un expediente

```
1. Ejecutivo recibe documentos del cliente
          ↓
2. Abre el sistema → "Nuevo expediente"
          ↓
3. Selecciona tipo (PFAE / PM / CA) e ingresa datos básicos
          ↓
4. Carga PDFs del expediente (drag & drop)
          ↓
5. Sistema asigna automáticamente cada PDF a su documento
          ↓
6. Clic en "Analizar con IA"
          ↓
7. Claude extrae datos de cada PDF (~30-60 segundos)
          ↓
8. Analista revisa datos extraídos y corrige si hay errores (⚠️)
          ↓
9. Sistema muestra semáforo de 10 dimensiones + resolución
          ↓
10. Analista revisa y edita el dictamen pre-generado
          ↓
11. "Guardar expediente" → queda en el pipeline
          ↓
12. Comunicación al cliente según la resolución
```

---

*Elaborado con Claude (Anthropic) · Proyecto U-RENT-IT · Abril 2026*
