# Sistema de Gestión para Tejidos y Amigurumis - Scope & Requerimientos

## 1. Visión General
Plataforma web (SPA) diseñada para administrar el flujo de trabajo de un emprendimiento de amigurumis. El sistema centraliza la gestión de pedidos por encargo, el cálculo automatizado de presupuestos, el registro de finanzas (ingresos y egresos) y ventas rápidas para ferias, integrando herramientas de uso diario como un contador de vueltas.

## 2. Stack Tecnológico (Monorepo)
- **Frontend:** React, Tailwind CSS, shadcn/ui.
- **Backend:** Node.js, Express.
- **Base de Datos & ORM:** PostgreSQL (Neon.tech), Prisma.
- **Despliegue:** Vercel (Front y Back).

## 3. Requerimientos Funcionales (MVP)

### A. Cotizador Inteligente y Catálogo
- **Catálogo Base:** Clasificación por categorías (Llaveros, Flores, Amigurumis General, Personajes, Mascotas, Otras) con precios de referencia modificables.
- **Calculadora de Presupuestos (Core Feature):** Herramienta que calcula el precio final sugerido en base a la fórmula: `Costo total de materiales (lana, accesorios, etc.) + (Cantidad de horas estimadas * Valor hora de tejido)`. Permite guardar el presupuesto o iniciar un encargo desde allí.

### B. Flujo de Pedidos por Encargo
- **Directorio de Clientes:** Nombre (Dato Obligatorio). Instagram y WhatsApp (Datos Opcionales).
- **Tablero de Estados:** Seguimiento del pedido a través de los estados: `PENDIENTE`, `TEJIENDO`, `TERMINADO`, `ENTREGADO`.
- **Detalle de Personalización:** Campo de texto libre en cada ítem del pedido para especificar colores, detalles o modificaciones.
- **Control de Señas:** Opción de registrar un pago anticipado (seña) al momento de crear el pedido, con cálculo automático del saldo restante.

### C. Ventas Rápidas (Punto de Venta)
- **Fast-Sale:** Función de un solo clic para registrar ventas de stock ya tejido de forma inmediata (ideal para ferias físicas en el Parque Avellaneda). Omite el flujo de estados del encargo y asienta el ingreso directamente en las finanzas.

### D. Finanzas y Dashboard
- **Registro de Métodos de Pago:** Todo ingreso (señas, pagos de saldo o ventas rápidas) debe tipificarse obligatoriamente como `EFECTIVO` o `TRANSFERENCIA`.
- **Gestión de Egresos:** Módulo para cargar los gastos operativos y de producción (compra de hilos, vellón, packaging, pago de stand).
- **Dashboard de Métricas:** Visualización de Ingresos del mes (segmentados por método de pago), Egresos totales, Ganancia Neta mensual y lista de "Próximas entregas" ordenadas cronológicamente.

### E. Herramienta de Trabajo Integrada
- **Contador de Vueltas:** Widget persistente o vista dedicada (reutilizando lógica de LocalStorage) para llevar el conteo de rondas y puntos sin necesidad de salir de la aplicación.

## 4. Reglas de Negocio y Límites (Out of Scope para Fase 1)
- **Inventario de Insumos:** NO se llevará un conteo estricto de unidades físicas de materiales (ej. "quedan 3 ovillos"). Las compras de material impactarán únicamente como un movimiento financiero en el módulo de Egresos.
- **Automatización de Mensajes:** El sistema no enviará mensajes automáticos por WhatsApp ni Instagram; el contacto se gestiona externamente.

## 5. Guía de Diseño (UI/UX)
La interfaz utilizará componentes minimalistas, tarjetas limpias y la siguiente paleta de colores "Soft Pastel"[cite: 1]:
- **Background (Fondo principal):** `#f4f3f1` (Mist)[cite: 1]
- **Surface/Cards (Fondos secundarios):** `#f2d1d4` (Peony)[cite: 1]
- **Primary (Botones principales/Acentos):** `#d8959b` (Mauve)[cite: 1]
- **Success/Secondary (Estados positivos/Insignias):** `#829672` (Sage)[cite: 1]
- **Text/Nav (Texto principal y menú):** `#344c3d` (Evergreen)[cite: 1]

## 6. Arquitectura y Patrones de Diseño
Para equilibrar velocidad de desarrollo y mantenibilidad en el monorepo, se evitará la sobre-ingeniería de Clean Architecture estricta, optando por una estructura modular y en capas.

### Backend (Node.js + Express)
Se utilizará una **Arquitectura en Capas (Layered Architecture)** basada en el patrón Controlador-Servicio:
- **Routes:** Definen los endpoints de la API y delegan la ejecución al controlador correspondiente.
- **Controllers:** Manejan el objeto de petición y respuesta (req, res), validan los inputs y manejan los códigos de estado HTTP.
- **Services (Business Logic):** Capa central donde reside la lógica de negocio (ej. el cálculo de presupuestos del cotizador, la transición de estados de un pedido, el cálculo de saldos). 
- **Data Access:** Prisma ORM actuará directamente como la capa de acceso a datos, interactuando con la base de datos PostgreSQL.

### Frontend (React)
Se implementará una estructura orientada a **Features (Módulos)** en lugar de agrupar por tipo de archivo global, facilitando la escalabilidad:
- **Features:** Carpetas aisladas por dominio (ej. `/features/orders`, `/features/finances`, `/features/quotes`), cada una conteniendo sus propios componentes, hooks y utilidades específicas.
- **Shared/UI:** Componentes de interfaz genéricos y reutilizables (botones, modales, tarjetas) provistos por shadcn/ui.
- **State Management:** Uso de estados locales y contexto (React Context) para flujos simples, o librerías de data-fetching (como TanStack Query) para el manejo del estado del servidor y caché.
- **Custom Hooks:** Extracción de lógica compleja de los componentes hacia hooks personalizados (ej. `useQuoteCalculator`, `useStitchCounter`).