'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Download, TrendingUp, DollarSign, Users, CreditCard, RefreshCw, Loader2 } from 'lucide-react';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [stats, setStats] = useState({ mrr: 0, arr: 0, churnRate: 0, totalRevenue: 0, activeCustomers: 0 });
  const [revenueData, setRevenueData] = useState<{ date: string; amount: number }[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<{ method: string; count: number; amount: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; revenue: number; count: number }[]>([]);

  useEffect(() => { fetchData(); }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    const { data: payments } = await supabase.from('payments').select('amount, payment_method, created_at').eq('merchant_id', user?.id).eq('status', 'confirmed').gte('created_at', startDate.toISOString());
    const { data: subs } = await supabase.from('subscriptions').select('status, prices(amount, billing_cycle), products(name)').eq('merchant_id', user?.id);

    const revByDate: Record<string, number> = {};
    const methodStats: Record<string, { count: number; amount: number }> = {};
    let totalRev = 0;

    payments?.forEach((p: any) => {
      const date = new Date(p.created_at).toISOString().split('T')[0];
      revByDate[date] = (revByDate[date] || 0) + Number(p.amount);
      totalRev += Number(p.amount);
      if (!methodStats[p.payment_method]) methodStats[p.payment_method] = { count: 0, amount: 0 };
      methodStats[p.payment_method].count++;
      methodStats[p.payment_method].amount += Number(p.amount);
    });

    let mrr = 0;
    const prodStats: Record<string, { revenue: number; count: number }> = {};
    subs?.filter((s: any) => s.status === 'active').forEach((s: any) => {
      if (s.prices?.billing_cycle === 'monthly') mrr += Number(s.prices.amount);
      else if (s.prices?.billing_cycle === 'yearly') mrr += Number(s.prices.amount) / 12;
      const name = s.products?.name || 'Unknown';
      if (!prodStats[name]) prodStats[name] = { revenue: 0, count: 0 };
      prodStats[name].revenue += Number(s.prices?.amount || 0);
      prodStats[name].count++;
    });

    const cancelled = subs?.filter((s: any) => s.status === 'cancelled').length || 0;
    const churn = subs?.length ? (cancelled / subs.length) * 100 : 0;

    setStats({ mrr, arr: mrr * 12, churnRate: churn, totalRevenue: totalRev, activeCustomers: subs?.filter((s: any) => s.status === 'active').length || 0 });
    setRevenueData(Object.entries(revByDate).map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date)));
    setPaymentMethods(Object.entries(methodStats).map(([method, data]) => ({ method, ...data })));
    setTopProducts(Object.entries(prodStats).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.revenue - a.revenue).slice(0, 5));
    setLoading(false);
  };

  const exportCSV = () => {
    const csv = 'Date,Revenue\n' + revenueData.map(r => `${r.date},${r.amount}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `revenue-${dateRange}days.csv`;
    a.click();
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Business performance metrics</p>
        </div>
        <div className="flex gap-2">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="input">
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
          </select>
          <button onClick={exportCSV} className="btn-secondary"><Download className="h-4 w-4 mr-2" />Export</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card p-4"><p className="text-sm text-gray-500">MRR</p><p className="text-xl font-bold">{formatCurrency(stats.mrr, 'SSP')}</p></div>
        <div className="card p-4"><p className="text-sm text-gray-500">ARR</p><p className="text-xl font-bold">{formatCurrency(stats.arr, 'SSP')}</p></div>
        <div className="card p-4"><p className="text-sm text-gray-500">Revenue</p><p className="text-xl font-bold">{formatCurrency(stats.totalRevenue, 'SSP')}</p></div>
        <div className="card p-4"><p className="text-sm text-gray-500">Active Subs</p><p className="text-xl font-bold">{stats.activeCustomers}</p></div>
        <div className="card p-4"><p className="text-sm text-gray-500">Churn Rate</p><p className="text-xl font-bold">{stats.churnRate.toFixed(1)}%</p></div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Revenue Trend</h3>
          <div className="h-48 flex items-end gap-1">
            {revenueData.length > 0 ? revenueData.map((d, i) => {
              const max = Math.max(...revenueData.map(r => r.amount));
              const h = max > 0 ? (d.amount / max) * 100 : 0;
              return <div key={i} className="flex-1 bg-primary-500 rounded-t" style={{ height: `${h}%`, minHeight: 4 }} title={`${d.date}: ${formatCurrency(d.amount, 'SSP')}`} />;
            }) : <p className="text-gray-500 m-auto">No data</p>}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Payment Methods</h3>
          {paymentMethods.length > 0 ? paymentMethods.map((m) => (
            <div key={m.method} className="flex justify-between py-2 border-b last:border-0">
              <span className="capitalize">{m.method.replace('_', ' ')}</span>
              <span className="font-medium">{m.count} ({formatCurrency(m.amount, 'SSP')})</span>
            </div>
          )) : <p className="text-gray-500">No data</p>}
        </div>

        <div className="card p-6 md:col-span-2">
          <h3 className="font-semibold mb-4">Top Products</h3>
          {topProducts.length > 0 ? (
            <table className="w-full">
              <thead><tr className="text-left text-sm text-gray-500"><th className="pb-2">Product</th><th className="pb-2">Subscriptions</th><th className="pb-2">Revenue</th></tr></thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.name} className="border-t">
                    <td className="py-2 font-medium">{p.name}</td>
                    <td className="py-2">{p.count}</td>
                    <td className="py-2 font-medium text-green-600">{formatCurrency(p.revenue, 'SSP')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-gray-500">No data</p>}
        </div>
      </div>
    </div>
  );
}
