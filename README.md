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

<p align="center">Hecho con 🧶 y mucho café</p>
