# Sistema de Extensión Basado en Vouchers Sin Asignar

## 🎯 Nueva Lógica de Precios

### Problema Anterior

- Se cobraba un precio fijo por toda la extensión, sin importar cuántos vouchers fueron realmente asignados
- No había distinción entre vouchers vendidos y vouchers aún disponibles para venta

### Solución Actual ✅

- **Solo se cobra por los vouchers que NO han sido asignados** de ese pago específico
- **Lógica**: Los vouchers ya asignados/vendidos no necesitan extensión, solo los que aún no se han vendido
- El precio se calcula dinámicamente: `vouchers_sin_asignar × precio_por_voucher`

## 🔧 Implementación Técnica

### Nueva Función SQL

```sql
CREATE OR REPLACE FUNCTION get_assigned_vouchers_by_payment(payment_id_param bigint)
RETURNS TABLE(
    total_vouchers_in_payment integer,    -- Total de vouchers comprados en este pago
    assigned_vouchers_count integer,      -- Vouchers que ya fueron asignados/usados
    unassigned_vouchers_count integer,    -- Vouchers que aún no se han asignado
    unit_price_per_voucher numeric,       -- Precio original por voucher
    partner_id_info bigint                -- ID del partner para validación
)
```

### Lógica de Cálculo

1. **Identifica el pago específico** y obtiene información básica
2. **Cuenta vouchers sin asignar** del pago usando lógica FIFO
3. **Calcula precio dinámico**: `vouchers_sin_asignar × extension_price_per_voucher`
4. **Casos especiales**:
   - Si `unassigned_vouchers_count = 0`: No se cobra nada, todos ya están vendidos
   - Si `unassigned_vouchers_count > 0`: Se cobra solo por esos vouchers sin vender

## 📊 Ejemplo Práctico

### Escenario

- **Pago**: Compró 18 vouchers a $50 cada uno
- **Estado actual**: 10 vouchers ya fueron asignados a estudiantes
- **Precio de extensión**: $5 por voucher

### Cálculo

```
Vouchers comprados: 18
Vouchers asignados: 10
Vouchers sin asignar: 8

Precio de extensión = 8 × $5 = $40 USD
```

**Solo paga $40** (por los 8 vouchers sin asignar), no por los 18 totales.

## 🎛️ Interfaz de Usuario

### Botón de Extensión

- **Texto**: "Extender (Calcular precio)"
- **Al hacer clic**: Calcula precio dinámico y muestra desglose

### Toast de Confirmación

```
• Total vouchers en pago: 18
• Vouchers asignados: 10
• Vouchers sin asignar: 8

Precio: $40 USD (solo por vouchers sin asignar)
Esto extenderá por 1 AÑO COMPLETO (12 meses).
```

### Casos Especiales

- **Sin vouchers sin asignar**: Toast de advertencia, no se procede al pago
- **Ya extendido**: Botón deshabilitado con "Extensión ya utilizada"

## 🔄 Flujo Completo

1. **Usuario hace clic** en "Extender"
2. **Sistema consulta** `get_assigned_vouchers_by_payment(payment_id)`
3. **Calcula precio** dinámico basado en vouchers sin asignar
4. **Muestra confirmación** con desglose detallado
5. **Usuario confirma** → Redirige a Stripe con precio calculado
6. **Pago exitoso** → Extiende fechas por 1 año y marca `extension_used = true`

## 📋 Parámetros de Sistema

### Requerido

- **Parámetro de precio**: Debe contener "precio" y "extensión" en el nombre
- **Valor**: Precio en USD por voucher para extensión

### Ejemplo

```
Nombre: "Precio de extensión por voucher"
Valor: "5.00"
```

## ✅ Beneficios

1. **Justicia**: Solo paga por lo que realmente está usando
2. **Transparencia**: Desglose claro de vouchers asignados vs no asignados
3. **Flexibilidad**: Precios adaptativos según uso real
4. **Prevención**: No se puede extender múltiples veces
5. **Precisión**: Extensión siempre de 1 año exacto

## 🚀 Casos de Uso

### Caso 1: Partner Activo

- Compró 20 vouchers, asignó 15
- **Paga extensión de**: 15 vouchers
- **Ahorra**: 5 vouchers de extensión gratuita

### Caso 2: Partner Nuevo

- Compró 10 vouchers, no asignó ninguno
- **Paga extensión de**: 0 vouchers
- **Resultado**: Extensión gratuita hasta que asigne vouchers

### Caso 3: Partner Completo

- Compró 50 vouchers, asignó los 50
- **Paga extensión de**: 50 vouchers
- **Resultado**: Pago completo por uso completo
