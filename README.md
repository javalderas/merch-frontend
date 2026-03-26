# Merch — Band Merchandising Manager

Aplicación web para gestionar el merchandising de una banda: catálogo de productos, inventario, punto de venta (POS), gastos y reportes de beneficios. Diseñada para usarse en tablets y móviles durante conciertos.

---

## Arranque rápido (solo frontend, sin backend)

```bash
# 1. Instalar dependencias
npm install

# 2. Arrancar el servidor de desarrollo
npm run dev

# 3. Abrir en el navegador
open http://localhost:3000
```

La aplicación arranca con **datos de ejemplo** (mock). No necesita backend ni base de datos para funcionar en modo desarrollo.

---

## Requisitos del entorno

| Herramienta | Versión mínima | Cómo instalar |
|-------------|---------------|---------------|
| Node.js | 18.x LTS o superior | https://nodejs.org o `brew install node` |
| npm | 9.x o superior | Incluido con Node |

Verificar versiones:
```bash
node --version   # debe ser >= 18
npm --version    # debe ser >= 9
```

---

## Estructura del proyecto

```
merch/
├── api/
│   └── openapi.yaml          ← Contrato REST completo (fuente de verdad)
├── src/
│   ├── app/
│   │   ├── globals.css        ← Tema visual (variables CSS, paleta)
│   │   ├── layout.tsx         ← Layout raíz (fuentes, providers, PWA meta)
│   │   ├── manifest.ts        ← Manifiesto PWA
│   │   └── (app)/             ← Todas las páginas de la app
│   │       ├── page.tsx           → /          Dashboard
│   │       ├── pos/page.tsx       → /pos       Punto de Venta (pantalla principal)
│   │       ├── products/          → /products  Catálogo
│   │       ├── sales/             → /sales     Historial de ventas
│   │       ├── expenses/          → /expenses  Gastos
│   │       └── reports/           → /reports   Informes
│   ├── components/
│   │   ├── layout/            ← app-shell, sidebar, bottom-nav, header
│   │   ├── ui/                ← shadcn/ui + empty-state, loading, error
│   │   ├── products/          ← product-card, product-form, stock-adjustment-dialog
│   │   ├── pos/               ← product-grid, cart-panel, cart-sheet
│   │   ├── sales/             ← sale-table
│   │   └── expenses/          ← expense-form-dialog
│   ├── hooks/                 ← TanStack Query: use-products, use-sales, etc.
│   ├── lib/
│   │   ├── api/               ← Funciones de API (swap point para backend real)
│   │   │   ├── mock-store.ts  ← Store en memoria (simula el backend)
│   │   │   ├── mock-data.ts   ← Datos de ejemplo
│   │   │   ├── product-api.ts
│   │   │   ├── sale-api.ts
│   │   │   ├── expense-api.ts
│   │   │   ├── stock-movement-api.ts
│   │   │   └── report-api.ts
│   │   ├── validations/       ← Schemas Zod para formularios
│   │   └── format.ts          ← Formateo de moneda/fechas (es-ES, EUR)
│   ├── types/                 ← TypeScript: product, sale, expense, report, pos
│   └── contexts/
│       └── cart-context.tsx   ← Estado del carrito POS (cliente)
├── next.config.ts             ← Proxy /api/* → backend
├── components.json            ← Config shadcn/ui
└── .env.example               ← Variables de entorno
```

---

## Variables de entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Contenido del `.env.local`:
```env
# Puerto donde escucha el backend Kotlin
BACKEND_PORT=8080
```

Con esta variable, el frontend redirige automáticamente **todas las llamadas a `/api/*`** al backend. No hace falta tocar ningún código para cambiar el puerto.

---

## Cómo conectar el backend Kotlin

El frontend está preparado para conectarse al backend **sin modificar páginas ni componentes**. Solo hay que seguir estos pasos:

### 1. Respetar el contrato OpenAPI

El archivo `api/openapi.yaml` define todos los endpoints. El backend debe implementarlos exactamente:

```
# Productos
GET    /api/v1/products              Lista con filtro opcional ?category=
POST   /api/v1/products              Crear producto
GET    /api/v1/products/{id}         Obtener producto
PUT    /api/v1/products/{id}         Actualizar producto
DELETE /api/v1/products/{id}         Eliminar producto

# Stock
GET    /api/v1/products/{id}/stock-movements   Historial de movimientos
POST   /api/v1/products/{id}/stock-movements   Crear movimiento (ajuste de stock)

# Ventas
GET    /api/v1/sales                 Lista con filtros ?dateFrom= &dateTo=
POST   /api/v1/sales                 Registrar venta (descuenta stock automáticamente)
GET    /api/v1/sales/{id}            Detalle de venta con items

# Gastos
GET    /api/v1/expenses              Lista con filtros ?dateFrom= &dateTo= &category=
POST   /api/v1/expenses              Crear gasto
PUT    /api/v1/expenses/{id}         Actualizar gasto
DELETE /api/v1/expenses/{id}         Eliminar gasto

# Informes (solo GET, calculados en backend)
GET    /api/v1/reports/summary       Ingresos, gastos, beneficio
GET    /api/v1/reports/top-products  Productos más vendidos
GET    /api/v1/reports/stock-value   Valoración del inventario
```

### 2. Activar el proxy

En `.env.local`, apuntar al puerto del backend:
```env
BACKEND_PORT=8080
```

El `next.config.ts` ya tiene el rewrite configurado:
```typescript
// next.config.ts
rewrites() {
  return [{
    source: "/api/:path*",
    destination: `http://localhost:${BACKEND_PORT}/api/:path*`
  }]
}
```

Esto evita problemas de CORS — el navegador solo habla con `localhost:3000`, que hace de proxy.

### 3. Reemplazar el mock por llamadas reales

Cada archivo en `src/lib/api/` tiene el comentario:
```typescript
// TODO: Replace mock-store calls with real API calls when backend is ready
```

Solo hay que intercambiar la implementación. **Las firmas de las funciones no cambian**, así que hooks y páginas no necesitan modificarse.

**Ejemplo — `src/lib/api/product-api.ts`:**

```typescript
// ── ANTES (mock) ──────────────────────────────────
import * as store from "./mock-store"
export async function getProducts(category?: string) {
  return store.getProducts(category)
}

// ── DESPUÉS (backend real) ────────────────────────
import { apiClient } from "./client"
import type { Product } from "@/types/product"

export async function getProducts(category?: string): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>("/api/v1/products", {
    params: category ? { category } : undefined,
  })
  return data
}
```

El **cliente Axios** está en `src/lib/api/client.ts`. Si el backend requiere autenticación, añadir el interceptor de JWT ahí (hay un comentario preparado).

### 4. Tipos que debe devolver el backend

Los tipos están en `src/types/`. El backend debe serializar JSON que coincida exactamente:

```json
// Product
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Camiseta Logo",
  "description": "Camiseta negra con logo",
  "category": "CLOTHING",
  "sku": "CAM-001",
  "barcode": "8400001000010",
  "imageUrl": null,
  "purchasePrice": "8.00",
  "salePrice": "20.00",
  "stock": 45,
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-03-20T14:30:00Z"
}
```

```json
// Sale (respuesta del POST /api/v1/sales)
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "productName": "Camiseta Logo",
      "quantity": 2,
      "unitPrice": "20.00",
      "subtotal": "40.00"
    }
  ],
  "total": "40.00",
  "paymentMethod": "CASH",
  "notes": null,
  "createdAt": "2026-03-22T22:15:00Z"
}
```

> **Regla de oro sobre importes monetarios**: todos los campos de dinero (`salePrice`, `purchasePrice`, `total`, `subtotal`, `amount`) deben ser **strings que representen BigDecimal**, nunca `Double` ni `Float`. En Kotlin, usar `@JsonSerialize(using = ToStringSerializer::class)` o configurar el `ObjectMapper` para serializar `BigDecimal` como string.

### 5. Enumerados que debe usar el backend

```kotlin
// Kotlin
enum class ProductCategory { CLOTHING, MUSIC, ACCESSORIES, OTHER }
enum class PaymentMethod { CASH, CARD, BIZUM }
enum class ExpenseCategory { PRODUCTION, TRANSPORT, VENUE, MARKETING, OTHER }
enum class StockMovementType { IN, OUT, ADJUSTMENT }
```

### 6. Respuestas de error

El frontend espera errores en formato [RFC 7807 ProblemDetail](https://www.rfc-editor.org/rfc/rfc7807):

```json
{
  "status": 404,
  "detail": "Producto no encontrado",
  "code": "PRODUCT_NOT_FOUND"
}
```

Spring Boot 6+ lo soporta nativamente con `@ResponseStatus` + `ProblemDetail`. El campo `detail` es lo que se muestra al usuario en el toast de error.

---

## Simulador de móvil

El archivo `simulator.html` en la raíz del proyecto permite previsualizar la app en distintos tamaños de pantalla sin necesidad de DevTools ni dispositivo físico.

**Cómo usarlo:**

1. Arranca el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Abre el simulador en el navegador (sin servidor, se abre directamente):
   ```bash
   open simulator.html        # macOS
   start simulator.html       # Windows
   xdg-open simulator.html    # Linux
   ```

3. Selecciona el dispositivo con los botones superiores.

**Dispositivos disponibles:**

| Dispositivo | Resolución |
|---|---|
| iPhone SE | 375×667 |
| iPhone 14 | 390×844 |
| iPhone 15 Pro | 393×852 |
| iPhone Plus | 430×932 |
| iPad | 768×1024 |

> El simulador carga `http://localhost:3000` en un iframe con la resolución exacta del dispositivo. Usa el botón **↺ Recargar** para refrescar la app sin cerrar el simulador.

---

## Imágenes de productos

Los productos admiten imagen con **drag & drop** en el formulario de creación y edición.

- **Formatos aceptados:** JPG, PNG, WebP
- **Tamaño máximo:** 5 MB
- **Resolución recomendada:** 400×400 px (cuadrada)
- Si la imagen supera 800×800 px, se redimensiona automáticamente en el navegador antes de guardarla (Canvas API, calidad 85%)
- Con el mock, la imagen se almacena como data URL en memoria (se pierde al recargar)
- Con el backend real: implementar `POST /api/v1/products/{id}/image` y almacenar en S3/disco; el frontend ya tiene `uploadProductImage()` en `product-api.ts`

---

## Scripts disponibles

```bash
npm run dev            # Servidor de desarrollo → http://localhost:3000
npm run build          # Build de producción + verificación TypeScript
npm run start          # Arranca el build de producción (necesita npm run build antes)
npm run lint           # ESLint
npm run test:e2e       # Tests E2E con Playwright (necesita servidor corriendo)
npm run test:e2e:ui    # Tests E2E con interfaz visual
```

---

## Tecnologías

| Categoría | Tecnología | Notas |
|-----------|-----------|-------|
| Framework | Next.js 16 App Router | SSR/SSG, file-based routing |
| UI | React 19 | Server Components por defecto |
| Tipado | TypeScript 5 strict | Tipos en `src/types/` |
| Estilos | Tailwind CSS v4 | `@theme inline` en globals.css, sin tailwind.config |
| Componentes | shadcn/ui (new-york) | Basado en Radix UI |
| Server state | TanStack Query v5 | Cache, invalidación, loading/error states |
| Formularios | react-hook-form v7 + zod v4 | Schemas en `src/lib/validations/` |
| HTTP | Axios | Cliente en `src/lib/api/client.ts` |
| Notificaciones | Sonner | Toasts en mutations |
| Iconos | Lucide React | |
| Tests E2E | Playwright | |

---

## Datos mock (modo sin backend)

`src/lib/api/mock-data.ts` contiene datos realistas:

- 10 productos (camisetas, vinilos, CDs, parches, púas, sudadera, tote bags, posters)
- 5 ventas con items y métodos de pago variados
- 5 gastos (producción, transporte, local, marketing)
- 4 movimientos de stock

El store en memoria (`mock-store.ts`) simula el comportamiento del backend: crear, editar, borrar, calcular totales, decrementar stock al vender, calcular informes. Los **datos se pierden al recargar la página** — esto es intencionado para un entorno de prueba.

---

## Diseño y UX

- **Tema oscuro** por defecto (pensado para salas de concierto). Toggle en el header.
- **Mobile-first**: bottom navigation en móvil (5 tabs), sidebar en desktop (md+).
- **PWA-ready**: instalable en home screen desde iOS/Android via el manifiesto.
- **Touch targets** mínimos de 44px en todos los botones e interacciones.
- **POS** (`/pos`) es la pantalla principal — grid de productos para añadir al carrito, panel lateral en desktop, sheet deslizable en móvil. Un toque = producto al carrito.
- **Regulador de grid** en `/products` y `/pos`: botones 2/3/4/5 columnas para ajustar la densidad según el dispositivo.
- **Confirmación de cobro**: al pulsar "Cobrar" se abre un diálogo con el resumen de la venta para mostrar al cliente; tras confirmar, muestra pantalla de éxito antes de limpiar el carrito.
- **Informes por página**: `/reports` es un hub de navegación con 3 botones grandes, cada uno lleva a su propia página de informe (`/reports/summary`, `/reports/products`, `/reports/stock`).

---

## Próximos pasos para el backend

1. Crear proyecto Kotlin + Spring Boot
2. Implementar los endpoints siguiendo `api/openapi.yaml`
3. Configurar PostgreSQL + Flyway migrations
4. Añadir `BACKEND_PORT=8080` a `.env.local` en el frontend
5. Reemplazar mock en `src/lib/api/*-api.ts` por llamadas Axios reales
6. Añadir autenticación JWT si es necesario (interceptor en `client.ts`)
7. CI/CD y despliegue
