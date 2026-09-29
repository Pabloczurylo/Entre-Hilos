# 🧶 EntreHilos — Sistema de Gestión para Amigurumis

> Plataforma web integral para administrar el flujo de trabajo de un emprendimiento de amigurumis y tejidos artesanales.

---

## ✨ ¿Qué es EntreHilos?

**EntreHilos** es una SPA (Single Page Application) diseñada específicamente para emprendedoras del rubro del tejido y los amigurumis. Centraliza en un solo lugar la gestión de pedidos por encargo, el cálculo de presupuestos, el registro de finanzas, las ventas rápidas para ferias y herramientas de trabajo diario como el contador de vueltas.

---

## 🗂️ Módulos principales

| Módulo | Descripción |
|---|---|
| 📦 **Tablero de Pedidos** | Kanban con 4 estados: `PENDIENTE → TEJIENDO → TERMINADO → ENTREGADO` |
| 🧮 **Cotizador Inteligente** | Calcula el precio sugerido: `Costo materiales + (Horas × Valor hora)` |
| 💸 **Ventas Rápidas** | Punto de venta de un clic para ferias físicas |
| 📊 **Finanzas & Dashboard** | Ingresos/egresos mensuales, ganancia neta y próximas entregas |
| 🔢 **Contador de Vueltas** | Widget persistente para contar rondas y puntos mientras tejés |
| 📋 **Catálogo de Productos** | Categorías con precios de referencia modificables |

---

## 🛠️ Stack Tecnológico

### Frontend (`/client`)
- **React 19** + **TypeScript**
- **Vite 8** como bundler
- **Tailwind CSS 3** para estilos
- **TanStack Query v5** para estado del servidor y caché
- **React Router v7** para navegación
- **Recharts** para gráficos financieros
- **Lucide React** para iconografía

### Backend (`/server`)
- **Node.js** + **Express**
- **TypeScript** + **tsx** para desarrollo
- **Prisma ORM** con **PostgreSQL** (Neon.tech)
- **Zod** para validación de esquemas
- **CORS** configurado para producción

### Infraestructura
- **Monorepo** con npm workspaces
- **Vercel** para deploy del frontend y backend (Serverless Functions)
- **Neon PostgreSQL** como base de datos en la nube

---

## 🗃️ Esquema de Base de Datos

```
Customer ──< Order ──< OrderItem
                  ──< Transaction
                  ──< Quote

FastSale ──> Transaction
CatalogItem ──< OrderItem
            ──< FastSale
Category ──< CatalogItem
AppConfig
```

**Modelos principales:**
- `Customer` — Clientes con nombre, Instagram y WhatsApp
- `Order` — Pedidos con total, seña, saldo y estado
- `OrderItem` — Ítems individuales de cada pedido con personalización
- `Quote` — Presupuestos calculados (vinculables a un pedido)
- `Transaction` — Registro contable de ingresos y egresos
- `FastSale` — Ventas rápidas de feria
- `CatalogItem` / `Category` — Catálogo de productos con precios de referencia
- `AppConfig` — Configuración global de la app (valor hora, etc.)

---

## 📁 Estructura del Proyecto

```
EntreHilos/
├── client/                    # Frontend React
│   └── src/
│       ├── features/          # Módulos por dominio
│       │   ├── orders/        # Pedidos & detalle
│       │   ├── finances/      # Finanzas & dashboard
│       │   ├── quotes/        # Cotizador
│       │   ├── fast-sale/     # Ventas rápidas
│       │   └── counter/       # Contador de vueltas
│       ├── shared/            # Componentes y tipos reutilizables
│       └── lib/               # Utilidades (cn, etc.)
│
├── server/                    # Backend Express
│   ├── src/
│   │   ├── routes/            # Definición de endpoints
│   │   ├── controllers/       # Manejo de req/res y validación
│   │   ├── services/          # Lógica de negocio
│   │   ├── middlewares/       # Error handling, etc.
│   │   └── config/            # Variables de entorno
│   ├── prisma/
│   │   └── schema.prisma      # Esquema de BD
│   └── api/
│       └── index.ts           # Entrypoint para Vercel
│
├── package.json               # Raíz del monorepo (npm workspaces)
└── README.md
```

---

## 🚀 Instalación y Desarrollo Local

### Prerrequisitos
- **Node.js** v18+
- **npm** v9+
- Una base de datos **PostgreSQL** (o cuenta en Neon.tech)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/entre-hilos.git
cd entre-hilos
```

### 2. Instalar dependencias

```bash
npm install
```

> Esto instala las dependencias de todos los workspaces (`client` y `server`) en un solo paso.

### 3. Configurar variables de entorno del backend

Duplicá el archivo de ejemplo y completá tus credenciales:

```bash
cp server/.env.example server/.env
```

```env
# server/.env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DATABASE_URL="postgresql://usuario:password@host/db?sslmode=require"
```

### 4. Sincronizar la base de datos

```bash
cd server
npx prisma db push        # Crea las tablas en la BD
npx prisma generate       # Genera el cliente de Prisma
```

### 5. Levantar el proyecto

Desde la raíz del monorepo, en terminales separadas:

```bash
# Terminal 1 — Frontend (http://localhost:5173)
npm run dev:client

# Terminal 2 — Backend (http://localhost:3001)
npm run dev:server
```

---

## 📜 Scripts disponibles

### Raíz del monorepo

| Script | Descripción |
|---|---|
| `npm run dev` | Levanta el frontend en modo desarrollo |
| `npm run dev:client` | Alias para el frontend |
| `npm run dev:server` | Levanta el backend en modo desarrollo (hot reload) |
| `npm run build` | Compila client y server para producción |
| `npm run build:client` | Solo compila el frontend |
| `npm run build:server` | Solo compila el backend |

### Backend (`/server`)

| Script | Descripción |
|---|---|
| `npm run dev` | Backend con hot reload vía `tsx watch` |
| `npm run build` | `prisma generate` + compilación TypeScript |
| `npm run prisma:migrate` | Crea y aplica una nueva migración |
| `npm run prisma:studio` | Abre Prisma Studio (UI para la BD) |
| `npm run prisma:seed` | Carga datos iniciales de ejemplo |

---

## 🚢 Deploy

El proyecto está configurado para desplegarse en **Vercel** con dos proyectos independientes:

### Frontend
- Framework: **Vite**
- Root directory: `client/`
- Build command: `npm run build`
- Output directory: `dist/`
- El archivo `client/vercel.json` configura el rewrite para SPA routing

### Backend
- Runtime: **Vercel Serverless Functions** (`@vercel/node`)
- Root directory: `server/`
- El entrypoint es `api/index.ts`
- El archivo `server/vercel.json` enruta todas las peticiones al handler

### Variables de entorno en Vercel (Backend)
```
DATABASE_URL=<tu-connection-string-de-neon>
NODE_ENV=production
CLIENT_URL=<url-del-frontend-en-vercel>
```

---

## 🎨 Paleta de Colores

La interfaz sigue un sistema de diseño **Soft Pastel** coherente:

| Token | Hex | Uso |
|---|---|---|
| `mist` | `#f4f3f1` | Fondo principal |
| `peony` | `#f2d1d4` | Cards y superficies |
| `mauve` | `#d8959b` | Botones y acentos primarios |
| `sage` | `#829672` | Estados positivos y éxito |
| `evergreen` | `#344c3d` | Texto principal y navegación |

---

## 🏗️ Arquitectura

### Backend — Arquitectura en Capas

```
Request → Route → Controller → Service → Prisma (DB)
                     ↓
                  Response
```

- **Routes:** Definen los endpoints REST y delegan al controller
- **Controllers:** Validan inputs, manejan HTTP status codes
- **Services:** Lógica de negocio (cálculo de presupuestos, transición de estados, cálculo de saldos)
- **Prisma:** Actúa como capa de acceso a datos

### Frontend — Arquitectura por Features

```
src/
├── features/<modulo>/
│   ├── components/    # UI específica del módulo
│   ├── hooks/         # Custom hooks del módulo
│   ├── services/      # Llamadas a la API
│   └── types.ts       # Tipos TypeScript del módulo
└── shared/            # Todo lo reutilizable entre módulos
```

---

## 🧾 Reglas de Negocio Clave

- **Precio opcional al crear un pedido:** El precio puede definirse después usando el Cotizador, que lo vincula directamente al pedido.
- **Control de señas:** Al registrar una seña, se calcula automáticamente el saldo restante.
- **Métodos de pago:** Todo ingreso debe tipificarse como `EFECTIVO` o `TRANSFERENCIA`.
- **Ventas rápidas:** No pasan por el flujo de estados del encargo; impactan directamente en las finanzas.
- **Sin inventario físico:** Los insumos se registran como egresos financieros, no como stock.

---

## 📄 Licencia

Este proyecto es privado y de uso personal para el emprendimiento. Todos los derechos reservados.

---

<p align="center">Hecho con 🧶 y mucho café</p>
