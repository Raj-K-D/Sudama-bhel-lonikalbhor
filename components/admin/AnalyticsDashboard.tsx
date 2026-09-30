'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import { getSupabase, rowToOrder, OrderRow } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { Order } from '@/lib/menu-data';

// ── Lazy-load Recharts to keep initial JS bundle small ───────────────────────
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ── Colours ──────────────────────────────────────────────────────────────────
const YELLOW = '#FFBC0D';
const GREEN  = '#2E7D32';
const CHART_COLORS = [YELLOW, GREEN, '#DA291C', '#6366f1', '#ec4899', '#14b8a6'];

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-4 sm:p-5">
      <p className="text-2xl">{icon}</p>
      <p className="mt-2 font-georgia text-xl sm:text-2xl font-black text-white">{value}</p>
      <p className="text-xs font-bold text-primary">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-white/40">{sub}</p>}
    </div>
  );
}

// ── Chart wrapper that avoids SSR issues ──────────────────────────────────────
function Chart({ children, height = 220, mounted = true }: { children: React.ReactNode; height?: number; mounted?: boolean }) {
  if (!mounted) {
    return (
      <div
        style={{ width: '100%', height }}
        className="flex items-center justify-center rounded-xl bg-white/5 animate-pulse text-xs text-white/30"
      >
        Loading chart…
      </div>
    );
  }
  return (
    <div style={{ width: '100%', height }}>
      {children}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
type Range = 'today' | '7d' | '30d';

interface Props { initialOrders?: Order[] }

export default function AnalyticsDashboard({ initialOrders }: Props) {
  const storeOrders = useStore((s) => s.placedOrders);
  const fallbackOrders = useMemo(
    () => Object.values(storeOrders).flat(),
    [storeOrders],
  );

  const [orders, setOrders]   = useState<Order[]>(() => initialOrders && initialOrders.length > 0 ? initialOrders : fallbackOrders);
  const [range, setRange]     = useState<Range>('7d');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch different date range on demand
  const fetchRange = useCallback(async (r: Range) => {
    setLoading(true);
    const days = r === 'today' ? 1 : r === '7d' ? 7 : 30;
    const since = startOfDay(subDays(new Date(), days - 1)).toISOString();
    const sb = getSupabase();
    if (sb) {
      try {
        const { data } = await sb.from('orders').select('*').gte('created_at', since).order('created_at');
        if (data) {
          setOrders(data.map((row) => rowToOrder(row as OrderRow)));
        }
      } catch (err) {
        console.warn('Analytics fetchRange error:', err);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRange('7d');
  }, [fetchRange]);

  const handleRangeChange = (r: Range) => {
    setRange(r);
    fetchRange(r);
  };

  // ── Derived metrics ────────────────────────────────────────────────────────
  const completed = useMemo(
    () => orders.filter((o) => o.status === 'completed' || o.status === 'ready'),
    [orders],
  );
  const totalRevenue = useMemo(() => completed.reduce((s, o) => s + (o.totalAmount ?? 0), 0), [completed]);
  const aov = completed.length ? totalRevenue / completed.length : 0;

  const days = range === 'today' ? 1 : range === '7d' ? 7 : 30;

  const dailyData = useMemo(() => {
    const interval = eachDayOfInterval({ start: subDays(new Date(), days - 1), end: new Date() });
    return interval.map((day) => {
      const label = format(day, days > 7 ? 'dd MMM' : 'EEE dd');
      const dayOrders = completed.filter((o) => {
        const d = new Date(o.timestamp);
        return d >= startOfDay(day) && d <= endOfDay(day);
      });
      return { label, revenue: dayOrders.reduce((s, o) => s + (o.totalAmount ?? 0), 0), count: dayOrders.length };
    });
  }, [completed, days]);

  const hourData = useMemo(() => {
    const hrs = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, orders: 0 }));
    completed.forEach((o) => { hrs[new Date(o.timestamp).getHours()].orders += 1; });
    return hrs.filter((h) => h.orders > 0);
  }, [completed]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    completed.forEach((o) =>
      o.items?.forEach((oi) => {
        const cat = oi.itemId.startsWith('p') ? 'Pizza'
          : oi.itemId.startsWith('b') ? 'Burger'
          : oi.itemId.startsWith('d') ? 'Desserts'
          : oi.itemId.startsWith('s') ? 'Softies'
          : oi.itemId.startsWith('v') ? 'Beverages'
          : 'Combos';
        map[cat] = (map[cat] ?? 0) + oi.quantity;
      }),
    );
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [completed]);

  const peakHour = hourData.length ? hourData.reduce((a, b) => (a.orders > b.orders ? a : b)).hour : '–';

  const tooltipStyle = { background: '#221C19', border: '1px solid rgba(255,188,13,0.3)', borderRadius: 12, color: '#fff', fontSize: 12 };
  const tickStyle = { fill: 'rgba(255,255,255,0.45)', fontSize: 10 };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Range selector */}
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-bold text-white/50 mr-1">Period:</p>
        {(['today', '7d', '30d'] as Range[]).map((r) => (
          <button key={r} onClick={() => handleRangeChange(r)}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-colors ${range === r ? 'bg-primary text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}>
            {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : '30 Days'}
          </button>
        ))}
        {loading && <span className="text-xs text-white/30 animate-pulse ml-2">Refreshing…</span>}
      </div>

      {/* KPI row — 2 cols on mobile, 4 on sm+ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard icon="💰" label="Total Revenue"   value={`₹${totalRevenue.toLocaleString()}`}    sub={`${completed.length} orders`} />
        <KpiCard icon="📋" label="Total Orders"    value={`${orders.length}`}                     sub={`${completed.length} completed`} />
        <KpiCard icon="🧾" label="Avg Order Value" value={`₹${Math.round(aov)}`}                  sub="per completed order" />
        <KpiCard icon="⏰" label="Peak Hour"       value={peakHour}                               sub="most orders placed" />
      </div>

      {/* Revenue trend */}
      <div className="rounded-2xl border border-white/10 bg-white/6 p-4 sm:p-5">
        <p className="mb-4 font-georgia text-sm font-bold text-white">📈 Revenue Trend</p>
        <Chart height={220} mounted={mounted}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={YELLOW} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={YELLOW} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="label" tick={tickStyle} />
              <YAxis tick={tickStyle} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`₹${v as number}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke={YELLOW} strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Chart>
      </div>

      {/* Orders per day + Peak hours — stack on mobile, side-by-side on sm */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
          <p className="mb-3 font-georgia text-sm font-bold text-white">📦 Orders Per Day</p>
          <Chart height={180} mounted={mounted}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="label" tick={tickStyle} />
                <YAxis tick={tickStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill={GREEN} radius={[6, 6, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </Chart>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
          <p className="mb-3 font-georgia text-sm font-bold text-white">⏰ Peak Hours</p>
          <Chart height={180} mounted={mounted}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="hour" tick={tickStyle} />
                <YAxis tick={tickStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="orders" fill={YELLOW} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Chart>
        </div>
      </div>

      {/* Category pie — only show if there is data */}
      {categoryData.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/6 p-4 sm:p-5">
          <p className="mb-4 font-georgia text-sm font-bold text-white">🍕 Category Breakdown</p>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Chart height={200} mounted={mounted}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%" cy="50%" outerRadius={80}
                    dataKey="value"
                    label={(p: { name?: string; percent?: number }) =>
                      `${p.name ?? ''} ${((p.percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </Chart>
            <div className="flex flex-wrap gap-3 sm:flex-col">
              {categoryData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-sm text-white/80">
                  <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span>{d.name}</span>
                  <span className="ml-auto font-bold text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent orders log */}
      <div className="rounded-2xl border border-white/10 bg-white/6 p-4 sm:p-5">
        <p className="mb-4 font-georgia text-sm font-bold text-white">🧾 Recent Orders Log</p>
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full min-w-[480px] text-left text-xs text-white/80">
            <thead>
              <tr className="border-b border-white/10 text-[11px] text-white/40">
                <th className="pb-2 pr-4">Order ID</th>
                <th className="pb-2 pr-4">Table</th>
                <th className="pb-2 pr-4">Time</th>
                <th className="pb-2 pr-4">Amount</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...orders].reverse().slice(0, 25).map((o) => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2 pr-4 font-mono text-[10px] text-white/40">#{o.id.slice(-6)}</td>
                  <td className="py-2 pr-4">T{o.tableNumber}</td>
                  <td className="py-2 pr-4">{format(new Date(o.timestamp), 'dd MMM HH:mm')}</td>
                  <td className="py-2 pr-4 font-bold text-primary">₹{o.totalAmount ?? '–'}</td>
                  <td className="py-2">
                    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                      o.status === 'completed' ? 'bg-accent-green/20 text-accent-green'
                      : o.status === 'ready'     ? 'bg-blue-500/20 text-blue-400'
                      : o.status === 'preparing' ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-primary/20 text-primary'
                    }`}>{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="py-12 text-center text-sm text-white/25">No orders in selected period.</p>
          )}
        </div>
      </div>
    </div>
  );
}
