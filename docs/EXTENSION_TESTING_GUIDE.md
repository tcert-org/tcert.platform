# Guía de Pruebas - Funcionalidad de Extensión

## 🎯 Funcionalidades Implementadas

### 1. **Extensión con Precio Dinámico**

- ✅ El precio de extensión se obtiene de los parámetros del sistema
- ✅ Si no hay parámetro configurado, usa un precio por defecto
- ✅ El precio se muestra en el botón de extensión

### 2. **Integración con Stripe**

- ✅ Al hacer clic en "Extender", redirige a Stripe Checkout
- ✅ El checkout incluye el precio dinámico de extensión
- ✅ Después del pago exitoso, procesa automáticamente la extensión

### 3. **Lógica de Extensión**

- ✅ **SIEMPRE agrega exactamente 1 año** (independiente de parámetros)
- ✅ Si no hay fecha de extensión previa, extiende desde la fecha de expiración
- ✅ Si ya hay fecha de extensión, extiende desde esa fecha

### 4. **Prevención de Uso Múltiple**

- ✅ Cada pago solo puede usar la extensión **UNA VEZ**
- ✅ Campo `extension_used` en la base de datos
- ✅ El botón se deshabilita después del primer uso
- ✅ El campo de fecha se vuelve de solo lectura

### 5. **Feedback de Usuario**

- ✅ **Todos los mensajes usan toasts** (no alerts del navegador)
- ✅ Mensajes de éxito, error y confirmación
- ✅ Toast de éxito al completar la extensión

### 6. **Indicadores Visuales**

- ✅ Badge "✓ Consumida" en la columna de fecha de extensión
- ✅ Botón deshabilitado con texto "Extensión ya utilizada"
- ✅ Estilos diferenciados para extensiones consumidas

## 🧪 Cómo Probar

### Paso 1: Configurar Parámetro de Precio

1. Ve al panel de administración
2. Configura el parámetro `extension_price` con el valor deseado
3. Si no existe, el sistema usará un precio por defecto

### Paso 2: Acceder como Partner

1. Inicia sesión como partner en: `http://localhost:3001/sign-in`
2. Ve a la sección de reportes/pagos

### Paso 3: Probar Extensión (Primera Vez)

1. Busca un pago que no tenga `extension_used = true`
2. Haz clic en el botón "Extender ($X.XX)"
3. Deberías ser redirigido a Stripe Checkout
4. Completa el pago (usa tarjeta de prueba de Stripe)
5. Al regresar, deberías ver:
   - Toast de éxito
   - Fecha de extensión actualizada (+1 año)
   - Badge "✓ Consumida"
   - Botón deshabilitado

### Paso 4: Verificar Prevención de Reuso

1. En el mismo pago que ya extendiste
2. El botón debe mostrar "Extensión ya utilizada"
3. El botón debe estar deshabilitado
4. El campo debe ser de solo lectura

## 🔧 Archivos Modificados

### Frontend

- `src/app/dashboard/partner/reports/page.tsx` - Lógica principal y UI
- `src/app/layout.tsx` - Provider de Sonner para toasts

### Backend APIs

- `src/app/api/payments/extension/route.ts` - Obtiene precio de extensión
- `src/app/api/checkout/extension/route.ts` - Stripe checkout
- `src/app/api/payments/extension/process/route.ts` - Procesa extensión
- `src/app/api/params/extension-price/route.ts` - Verifica parámetros

### Base de Datos

- `payments` tabla: Nuevo campo `extension_used BOOLEAN`
- `get_payments_with_filters()` función: Incluye `extension_used`
- Módulos de payments actualizados

### Tipos TypeScript

- `PaymentDynamicTable` incluye `extension_used?: boolean`
- Tipos de base de datos actualizados

## 🐛 Posibles Problemas y Soluciones

### Error: "Función no encontrada"

- **Causa**: La función SQL no se actualizó correctamente
- **Solución**: Verificar que se ejecutaron los DROP y CREATE FUNCTION

### Error: "extension_used no existe"

- **Causa**: La columna no se agregó a la tabla
- **Solución**: Ejecutar `ALTER TABLE payments ADD COLUMN extension_used BOOLEAN DEFAULT FALSE;`

### Toast no aparece

- **Causa**: Sonner no está configurado
- **Solución**: Verificar que `<Toaster />` está en el layout

### Redirección a Stripe falla

- **Causa**: Variables de entorno de Stripe no configuradas
- **Solución**: Verificar `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` y `STRIPE_SECRET_KEY`

## 🎉 Resultado Final

El usuario ahora puede:

1. ✅ Extender pagos con precio dinámico del sistema
2. ✅ Ver claramente cuáles extensiones han sido utilizadas
3. ✅ No poder usar la extensión más de una vez por pago
4. ✅ Recibir feedback claro mediante toasts
5. ✅ Siempre obtener exactamente 1 año de extensión

La funcionalidad está **completamente implementada y lista para producción**.
