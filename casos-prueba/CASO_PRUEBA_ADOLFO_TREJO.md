# Caso de prueba — ADOLFO TREJO SERVICIOS ESPECIALES SA DE CV

**Uso:** verdad de referencia para validar el análisis del sistema (Gemini o Claude).
Corre el expediente en el sistema y compara su semáforo, resolución y causales contra lo que se documenta aquí.

**Fuente:** Análisis Cualitativo ATSE, 22/07/2026 (incluye cualitativo + resumen de buró + estados de cuenta).

---

## 1. Datos del expediente

| Campo | Valor |
|---|---|
| Cliente | ADOLFO TREJO SERVICIOS ESPECIALES SA DE CV (PM) |
| RFC | ATS9103222B1 |
| Representante Legal | Ernesto Luis Fuentes Trejo (RFC FUTE890202IWA) |
| Obligado Solidario | Ernesto Luis Fuentes Trejo — **el mismo que el RL** |
| Antigüedad | 35 años 4 meses |
| Actividad | Transporte turístico, escolar y de personal |
| Asesor U-RENT-IT | Angel Hernández Nieto |

Unidades solicitadas (48 meses, s/IVA):

| Unidad | Renta mensual | Costo |
|---|---|---|
| VW Crafter Pas 4.7T 2026 | $46,364.98 | $1,568,513.35 |
| JAC Sunray Pas Diesel 2027 | $23,990.53 | $788,060.00 |
| **Renta total mensual** | **$70,355.51** | — |

Umbrales del sistema para este monto:
- Saldo mínimo (2× renta): **$140,711**
- Ingresos mínimos del OS (3× renta): **$211,067**

---

## 2. Cálculos clave

**Saldo promedio empresa** (BBVA + Banamex, últimos 3 meses ABR–JUN): ≈ **$492,000/mes** → ~7× la renta. Cumple de sobra.

**Saldo promedio OS** (Ernesto, cuenta personal): ≈ **$18,490/mes** → 0.26× la renta. **No cumple** el mínimo de 2×.

**Flujo bancario empresa:** depósitos millonarios recurrentes (BBVA jun $10.2M, Banamex jun $4.9M). Cuentas con alta rotación (se vacían), saldo promedio moderado.

**Buró empresa:** MOP 01 impecable. 15 cuentas activas, línea $25.247M, saldo vigente $12.811M (7 arrendamientos activos).

**Buró RL/OS:** MOP 01 impecable, sin atrasos. 10 cuentas activas, línea $17.604M, saldo $15.417M → **utilización ~88%**.

**Ratio renta/ingresos:** por depósitos bancarios <1% (excelente). **Falta el lado SAT** (declaración no incluida) para tomar el menor de los dos.

---

## 3. Semáforo esperado (10 dimensiones)

| # | Dimensión | Color | Nota |
|---|---|---|---|
| 1 | Identidad y documentos | Amarillo | Faltan INEs, CSF, comprobantes, acta constitutiva |
| 2 | Antigüedad de operación | Verde | 35 años (≥ 24) |
| 3 | Capacidad de pago | Verde | Flujo fuerte; ratio bancario <1% (pendiente confirmar con SAT) |
| 4 | Historial crediticio titular/RL | Verde | MOP 01 impecable; nota: utilización ~88% |
| 5 | Historial crediticio OS | Verde | Mismo que RL, pago impecable |
| 6 | Historial crediticio empresa | Verde | MOP 01; exposición arrendamiento $12.8M |
| 7 | Saldo bancario vs renta | Amarillo | Empresa >7× (ok); **OS 0.26×** (no cumple 2×) |
| 8 | Comportamiento bancario | Verde | Depósitos recurrentes millonarios |
| 9 | Salud financiera | Gris/Pendiente | Sin estados financieros → no se calcula liquidez/endeudamiento/capital |
| 10 | Monto vs perfil | Verde | Renta $70k vs flujo millonario; nota apalancamiento |

---

## 4. Resolución esperada: **CONDICIONADO** (escalar a comité)

Causales:
1. Saldo promedio del OS ($18,490) por debajo del mínimo de 2× renta ($140,711); además OS = RL.
2. Documentación incompleta: faltan EF formales, declaración ISR, CSF, actas, INEs, comprobantes de domicilio y cotización firmada.
3. Ratio renta/ingresos no confirmable por el lado SAT (declaración no presentada).
4. Alta utilización de crédito del RL en buró (~88%) y exposición a arrendamiento de la empresa ($12.8M): verificar contra estados financieros.

Condicionantes típicas de comité aplicables: OS alternativo con mejor perfil de liquidez, o anticipo mayor.

Fortalezas a favor: antigüedad de 35 años, buró impecable (empresa y RL), flujo bancario muy fuerte, cartera de clientes de primer nivel (colegios, TV Azteca, UPS, Grupo Salinas).

---

## 5. Trampas a vigilar en la prueba

- **Cliente de gobierno:** "Gobierno de la Ciudad de México" aparece como **cliente** del solicitante, NO como el solicitante. No aplica la causal de "giro de gobierno". Si la IA rechaza por esto, es un error a corregir.
- **Expediente incompleto:** si subes solo el PDF cualitativo, la regla estricta de "documento obligatorio ausente" puede empujar a RECHAZADO/incompleto. Para una prueba realista, súbelo con los documentos formales del expediente.
- **OS = RL:** la misma persona es representante legal y obligado solidario; sus saldos personales son bajos porque el flujo va por la empresa. El sistema debe marcar el saldo bajo del OS (correcto) pero el comité pondera la solidez de la empresa.

---

*Caso de prueba de referencia · U-RENT-IT · Analizador de crédito.*
