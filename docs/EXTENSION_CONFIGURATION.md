# Configuración de Extensión de Vouchers

## Descripción

Esta funcionalidad permite a los partners extender el vencimiento de sus vouchers mediante un pago adicional durante el período de extensión configurado.

## Configuración Requerida

### 1. Parámetro de Precio de Extensión

Para que la funcionalidad de extensión funcione correctamente, debe existir un parámetro en la tabla `params` que contenga:

- **Nombre**: Debe incluir las palabras "precio" y "extensión" (ej: "Precio de Extensión", "Precio Extensión Voucher", etc.)
- **Valor**: El precio en USD para extender un pago (ej: "25.00")

### 2. Ejemplo de Configuración

```sql
INSERT INTO params (name, value) VALUES ('Precio de Extensión', '25.00');
```

### 3. Parámetros Existentes Requeridos

- **ID 3**: "Tiempo Extensión" - Meses antes del vencimiento cuando se puede extender (solo para calcular nueva fecha de extensión)

**NOTA**: El parámetro ID 1 ("Expiración Vouchers") ya NO se utiliza para las extensiones. La extensión siempre es de 1 año fijo.

## Funcionamiento

### ⚡ **IMPORTANTE: Extensión Fija de 1 Año**

**El sistema SIEMPRE suma exactamente 1 año (12 meses) al vencimiento, sin importar los parámetros configurados.**

### Flujo de Extensión

1. El partner ve el botón "Extender" durante el período de extensión
2. Al hacer clic, se muestra el precio de extensión para confirmación
3. Se redirige a Stripe Checkout para procesar el pago
4. Una vez completado el pago, se extiende automáticamente:
   - **La fecha de vencimiento del pago se extiende exactamente 1 AÑO (12 meses)**
   - La fecha de extensión del pago se recalcula
   - Las fechas de vencimiento de todos los vouchers asociados se extienden 1 año

### Condiciones para Mostrar el Botón

- Debe existir el parámetro de precio de extensión
- El precio debe ser válido (> 0)
- La fecha actual debe estar en el período de extensión
- El período de extensión es: entre `extension_date` y `expiration_date`

## APIs Creadas

### 1. `/api/params/extension-price` (GET)

Verifica si existe y es válido el parámetro de precio de extensión.

### 2. `/api/payments/extension` (GET/POST)

- GET: Obtiene el precio de extensión
- POST: Obtiene información del pago para extensión

### 3. `/api/checkout/extension` (POST)

Crea la sesión de Stripe Checkout para el pago de extensión.

### 4. `/api/payments/extension/process` (POST)

Procesa la extensión después del pago exitoso, actualizando todas las fechas.

## URLs de Retorno

- **Éxito**: `/dashboard/partner/reports?extension_success=true&payment_id={id}`
- **Cancelación**: `/dashboard/partner/reports?extension_canceled=true`

## Notas Técnicas

- Los vouchers se extienden por el período completo configurado en "Expiración Vouchers"
- La nueva fecha de extensión se calcula automáticamente
- El sistema busca dinámicamente el parámetro por nombre, no por ID fijo
- Se incluye validación completa de errores y estado de configuración
