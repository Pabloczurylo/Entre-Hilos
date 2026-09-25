import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from './shared/components/AppLayout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { OrdersPage } from './features/orders/OrdersPage';
import { OrderDetailPage } from './features/orders/OrderDetailPage';
import { NewOrderPage } from './features/orders/NewOrderPage';
import { QuotePage } from './features/quotes/QuotePage';
import { FinancesPage } from './features/finances/FinancesPage';
import { FastSalePage } from './features/fast-sale/FastSalePage';
import { CounterPage } from './features/counter/CounterPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true,             element: <DashboardPage /> },
      { path: 'pedidos',         element: <OrdersPage /> },
      { path: 'pedidos/nuevo',   element: <NewOrderPage /> },
      { path: 'pedidos/:id',     element: <OrderDetailPage /> },
      { path: 'cotizador',       element: <QuotePage /> },
      { path: 'finanzas',        element: <FinancesPage /> },
      { path: 'venta-rapida',    element: <FastSalePage /> },
      { path: 'contador',        element: <CounterPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
