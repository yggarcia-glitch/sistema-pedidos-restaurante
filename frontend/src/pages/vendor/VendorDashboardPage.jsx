import { useState, useEffect, useRef } from 'react';
import { restaurantsApi } from '../../api/restaurants.api';
import { ordersApi } from '../../api/orders.api';
import { useMyRestaurant } from '../../hooks/useMyRestaurant';
import { CreateRestaurantForm } from '../../components/vendor/CreateRestaurantForm';
import { SidebarLayout } from '../../components/layout/SidebarLayout';
import { TopBar } from '../../components/layout/TopBar';
import { SalesArea } from '../../components/ui/SalesArea';
import { PageSpinner } from '../../components/ui/Spinner';
import { money } from '../../lib/format';

const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const dayKey = (d) => new Date(d).toDateString();
const isDelivered = (o) => o.estado?.nombre === 'ENTREGADO';
const POLL = 15000;

const COLUMNS = [
  { label: 'Pendientes', statuses: ['PENDIENTE'] },
  { label: 'Preparando', statuses: ['CONFIRMADO', 'EN_PREPARACION'] },
  { label: 'Listos', statuses: ['LISTO'] },
];
const NEXT_STATUS = {
  PENDIENTE: 'CONFIRMADO',
  CONFIRMADO: 'EN_PREPARACION',
  EN_PREPARACION: 'LISTO',
  LISTO: 'EN_CAMINO',
};
const ACTION_LABELS = {
  PENDIENTE: 'Aceptar',
  CONFIRMADO: 'Preparar',
  EN_PREPARACION: 'Marcar listo',
  LISTO: 'Despachar',
};

function pctDelta(today, yesterday) {
  if (yesterday === 0) return today > 0 ? 100 : 0;
  return ((today - yesterday) / yesterday) * 100;
}

function Delta({ value }) {
  const up = value >= 0;
  return (
    <span className={`text-[11px] font-semibold ${up ? 'text-green-600' : 'text-red-600'}`}>
      {up ? '↑' : '↓'} {Math.abs(value).toFixed(0)}%
    </span>
  );
}

function Metric({ label, value, delta }) {
  return (
    <div className="px-[18px] py-[15px]">
      <p className="text-[11px] text-txt-2">{label}</p>
      <p className="text-[22px] font-bold text-txt mt-[3px] leading-none tracking-tight">{value}</p>
      {delta != null && (
        <p className="mt-[5px]">
          <Delta value={delta} /> <span className="text-[10px] text-txt-3">vs. ayer</span>
        </p>
      )}
    </div>
  );
}

export default function VendorDashboardPage() {
  const { restaurant, setRestaurant, loading: rLoading } = useMyRestaurant();
  const [orders, setOrders] = useState([]);
  const [oLoading, setOLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const pollRef = useRef(null);
  const loading = rLoading || oLoading;

  const fetchOrders = async () => {
    try {
      const { data } = await ordersApi.findAll({ limit: 50 });
      setOrders(data.data ?? []);
    } finally {
      setOLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    pollRef.current = setInterval(fetchOrders, POLL);
    return () => clearInterval(pollRef.current);
  }, []);

  const handleToggleOpen = async () => {
    if (!restaurant) return;
    setToggling(true);
    try {
      const { data } = await restaurantsApi.toggleOpen(restaurant.id);
      setRestaurant((r) => ({ ...r, isOpen: data.isOpen }));
    } finally {
      setToggling(false);
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await ordersApi.updateStatus(id, { status });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message ?? 'Error al cambiar estado');
    }
  };

  if (loading) return <SidebarLayout><PageSpinner /></SidebarLayout>;

  if (!restaurant) {
    return (
      <SidebarLayout>
        <CreateRestaurantForm onCreated={setRestaurant} />
      </SidebarLayout>
    );
  }

  const todayKey = dayKey(new Date());
  const yKey = dayKey(new Date(Date.now() - 86400000));
  const ordersOn = (k) => orders.filter((o) => dayKey(o.createdAt) === k);
  const salesOn = (k) => ordersOn(k).filter(isDelivered).reduce((s, o) => s + Number(o.total), 0);
  const avgOn = (k) => {
    const list = ordersOn(k);
    return list.length ? list.reduce((s, o) => s + Number(o.total), 0) / list.length : 0;
  };

  const salesToday = salesOn(todayKey);
  const ordersToday = ordersOn(todayKey);

  const weekly = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    weekly.push({ label: DOW[d.getDay()], value: salesOn(dayKey(d)) });
  }

  const active = orders.filter((o) =>
    ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO'].includes(o.estado?.nombre),
  );
  const deliveredToday = ordersOn(todayKey).filter(isDelivered).length;
  const inPrepCount = orders.filter((o) => o.estado?.nombre === 'EN_PREPARACION').length;

  return (
    <SidebarLayout>
      <TopBar
        title={restaurant?.name ?? 'Dashboard'}
        subtitle="Hoy"
        actions={
          <button
            onClick={handleToggleOpen}
            disabled={toggling}
            className="flex items-center gap-[7px] text-[12px] font-semibold text-txt"
          >
            <span className={`w-[8px] h-[8px] rounded-full ${restaurant?.isOpen ? 'bg-green-500' : 'bg-txt-3'}`} />
            {restaurant?.isOpen ? 'Abierto' : 'Cerrado'}
          </button>
        }
      />

      <div className="bg-white min-h-[calc(100vh-60px)] px-[28px] py-[26px]">
        {/* Hero */}
        <p className="text-[12px] text-txt-2">Ventas de hoy</p>
        <div className="flex items-end gap-[12px] mt-[2px]">
          <h2 className="text-[40px] font-bold text-txt leading-none tracking-tight">{money(salesToday)}</h2>
          <span className="mb-[4px]">
            <Delta value={pctDelta(salesToday, salesOn(yKey))} />{' '}
            <span className="text-[11px] text-txt-3">vs. ayer</span>
          </span>
        </div>

        {/* Gráfico */}
        <div className="mt-[18px]">
          <SalesArea data={weekly} />
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-y border-border divide-x divide-border mt-[24px]">
          <Metric label="Pedidos de hoy" value={ordersToday.length} delta={pctDelta(ordersToday.length, ordersOn(yKey).length)} />
          <Metric label="Ticket promedio" value={money(avgOn(todayKey))} delta={pctDelta(avgOn(todayKey), avgOn(yKey))} />
          <Metric label="Entregados hoy" value={deliveredToday} />
          <Metric label="En preparación" value={inPrepCount} />
        </div>

        {/* Gestión de pedidos (tablero) */}
        <div className="mt-[28px]">
          <h3 className="text-[13px] font-bold text-txt mb-[12px]">
            Gestión de pedidos <span className="text-txt-3">({active.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[16px]">
            {COLUMNS.map((col) => {
              const colOrders = active.filter((o) => col.statuses.includes(o.estado?.nombre));
              return (
                <div key={col.label}>
                  <div className="flex items-center justify-between mb-[10px] pb-[6px] border-b border-border">
                    <h4 className="text-[12px] font-bold text-txt">{col.label}</h4>
                    <span className="text-[11px] text-txt-3">{colOrders.length}</span>
                  </div>
                  {colOrders.length === 0 && (
                    <p className="text-[11px] text-txt-3 py-[6px]">Sin pedidos</p>
                  )}
                  {colOrders.map((order) => {
                    const next = NEXT_STATUS[order.estado?.nombre];
                    return (
                      <div key={order.id} className="border border-border rounded-[10px] p-[11px] mb-[8px]">
                        <div className="flex items-center justify-between mb-[4px]">
                          <p className="font-bold text-[11px] text-txt">#{order.id.slice(0, 4).toUpperCase()}</p>
                          <span className="text-[10px] text-txt-3">
                            {new Date(order.createdAt).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-[10px] text-txt-2 mb-[6px]">
                          {order.items?.map((i) => (
                            <p key={i.id}>{i.quantity}× {i.productName}</p>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-bold text-txt">{money(order.total)}</span>
                          <div className="flex gap-[6px]">
                            {order.estado?.nombre === 'PENDIENTE' && (
                              <button
                                onClick={() => changeStatus(order.id, 'RECHAZADO')}
                                className="text-[10px] font-semibold text-red-600 px-[8px] py-[5px] rounded-[7px] border border-border"
                              >
                                Rechazar
                              </button>
                            )}
                            {next && (
                              <button
                                onClick={() => changeStatus(order.id, next)}
                                className="text-[10px] font-semibold text-white bg-primary px-[10px] py-[5px] rounded-[7px]"
                              >
                                {ACTION_LABELS[order.estado?.nombre]}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
