# Merch App — Siguientes Pasos

Estado actual: **Frontend funcional con datos mock** · Listo para demo con cliente

---

## ✅ Completado (Sprint actual)

- Catálogo de productos con grid responsive y modo vista/edición
- POS (punto de venta) con carrito y cobro por efectivo, tarjeta, Bizum
- Historial de ventas con filtros y columna de vendedor (admin)
- Gestión de gastos con categorías y filtros
- Pedidos especiales con envío, contrareembolso y seguimiento de estado
- Informes: resumen financiero, top productos, valor de stock
- Sistema de roles: admin y seller con permisos diferenciados
- Registro de actividad (auditoría) visible solo para admin
- Branding del grupo (nombre + logo configurable)
- Filtros y búsqueda en todos los listados

---

## 🔜 Próximas iteraciones recomendadas

### P0 — Antes de dar el front al cliente

- [ ] **Configurar BAND_CONFIG desde UI** — ahora el nombre del grupo está hardcodeado en `src/lib/api/mock-store.ts`. Crear una pantalla de ajustes básicos (nombre, logo, moneda).
- [ ] **Persistencia local** — los datos se pierden al recargar (mock en memoria). Mientras no hay backend, usar `localStorage` o `IndexedDB` para persistir ventas, gastos y pedidos entre sesiones.
- [ ] **Exportar a PDF/CSV** — informe de ventas y gastos exportable. Clave para el cierre contable tras cada gira.

### P1 — Backend Kotlin (cuando el cliente dé el ok)

- [ ] **Arrancar proyecto Spring Boot** — monolito con PostgreSQL. El contrato ya está definido en `api/openapi.yaml` (ampliar con pedidos especiales y auditoría).
- [ ] **Swap point del frontend** — todos los `src/lib/api/*-api.ts` son el único punto de cambio. Sustituir llamadas al mock-store por `axios` + `apiClient`.
- [ ] **Autenticación JWT** — login real con refresh token. El `AuthContext` ya está preparado para recibir el usuario del backend.
- [ ] **Upload de imágenes** — endpoint `POST /api/v1/products/{id}/image`. Recomienda Cloudflare R2 (barato, CDN global, compatible S3).

### P2 — Funcionalidades de producto

- [ ] **Múltiples grupos / workspaces** — actualmente la app es mono-grupo. Si el cliente gestiona más de una banda, necesitará seleccionar workspace al entrar.
- [ ] **Descuentos y promociones** — precio especial por bundle o por evento concreto (ej. "precio gira" vs "precio tienda online").
- [ ] **Variantes de producto** — tallas (S/M/L/XL), colores. Ahora un producto es un SKU único; habría que modelar variantes con stock independiente.
- [ ] **Historial de precios** — saber qué precio tenía un producto en una fecha concreta (útil para auditoría y corrección de errores).
- [ ] **Alertas de stock bajo** — notificación push / email cuando un producto baja del umbral configurado.

### P3 — Mejoras de UX

- [ ] **Modo offline (PWA)** — service worker para que funcione sin internet en locales con mala cobertura. Sincronización al recuperar conexión.
- [ ] **Escáner de código de barras** — usar la cámara del móvil para buscar productos en el POS por barcode (la API de barcode scanner está en los tipos).
- [ ] **Acceso rápido al POS desde pantalla de inicio** — shortcut en la home screen del móvil.
- [ ] **Ticket de venta** — generar PDF o vista imprimible del ticket tras una venta (útil si hay TPV físico).

### P4 — Integraciones futuras

- [ ] **Pasarela de pago online** — Stripe o Redsys para pedidos especiales enviados (cobro online antes de enviar).
- [ ] **Integración con mensajería** — enviar confirmación de pedido especial por WhatsApp/email al cliente.
- [ ] **Contabilidad** — exportar a formato compatible con Holded, Suma, u otros programas de facturación.

---

## 🔧 Deuda técnica conocida

| Item | Impacto | Esfuerzo |
|------|---------|----------|
| Mock store pierde datos al recargar | Alto (demo) | Bajo — localStorage |
| `next-themes` + React 19 console warning | Bajo (solo dev) | Esperando fix upstream |
| Tests E2E con Playwright | Medio | Medio |
| OpenAPI spec desactualizada (faltan pedidos especiales, auditoría) | Medio | Bajo |
| `BAND_CONFIG` hardcodeado | Medio (demo) | Bajo |

---

## 📋 Para la demo con el cliente

**Flujo recomendado para mostrar:**

1. Entrar como **Admin** → ver sidebar completo con "Actividad"
2. Crear un producto nuevo con imagen
3. Ir al **POS** → vender 2-3 productos → confirmar cobro
4. Ver la venta en **Historial** → activar "Ver vendedor"
5. Crear un **Pedido especial** de envío con contrareembolso
6. Avanzar el pedido a "Recibido" → "Enviado" → "Entregado" + marcar como pagado
7. Ver **Informes** → resumen financiero actualizado
8. Cambiar a usuario **Seller** → comprobar que no ve "Actividad" ni puede editar productos
9. Ver **Actividad** (volver a Admin) → log de todas las acciones

**Datos de prueba disponibles:** 10 productos, 5 ventas, 5 gastos, 3 pedidos especiales.
