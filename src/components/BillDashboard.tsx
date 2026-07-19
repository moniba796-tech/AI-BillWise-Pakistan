import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  Calendar,
  IndianRupee,
  AlertTriangle,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Bill } from '../types';

interface BillDashboardProps {
  refreshTrigger: number;
}

export function BillDashboard({ refreshTrigger }: BillDashboardProps) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  useEffect(() => {
    fetchBills();
  }, [refreshTrigger]);

  const fetchBills = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBills(data);
      if (data.length > 0) {
        setSelectedBill(data[0]);
      }
    }
    setLoading(false);
  };

  const deleteBill = async (id: string) => {
    const { error } = await supabase.from('bills').delete().eq('id', id);
    if (!error) {
      setBills(bills.filter((b) => b.id !== id));
      if (selectedBill?.id === id) {
        setSelectedBill(bills.length > 1 ? bills[1] : null);
      }
    }
  };

  // Calculate statistics
  const totalBills = bills.length;
  const latestBill = bills[0];
  const previousBill = bills[1];

  const unitChange = latestBill && previousBill
    ? ((latestBill.units_consumed - previousBill.units_consumed) / previousBill.units_consumed) * 100
    : 0;

  const amountChange = latestBill && previousBill
    ? ((latestBill.total_amount - previousBill.total_amount) / previousBill.total_amount) * 100
    : 0;

  const avgUnits = bills.length > 0
    ? bills.reduce((acc, b) => acc + b.units_consumed, 0) / bills.length
    : 0;

  const avgAmount = bills.length > 0
    ? bills.reduce((acc, b) => acc + b.total_amount, 0) / bills.length
    : 0;

  // Data for charts
  const monthlyData = bills
    .slice(0, 12)
    .reverse()
    .map((b) => ({
      month: `${b.month.slice(0, 3)} ${b.year}`,
      units: b.units_consumed,
      amount: b.total_amount,
    }));

  // Pie chart data for current bill breakdown
  const billBreakdown = selectedBill
    ? [
        { name: 'Base Amount', value: selectedBill.amount || 0, color: '#10B981' },
        { name: 'Taxes', value: selectedBill.taxes || 0, color: '#F59E0B' },
        { name: 'Fuel Adjustment', value: selectedBill.fuel_adjustment || 0, color: '#EF4444' },
        { name: 'Other', value: Math.max(0, selectedBill.total_amount - (selectedBill.amount || 0) - (selectedBill.taxes || 0) - (selectedBill.fuel_adjustment || 0)), color: '#6366F1' },
      ]
    : [];

  if (loading) {
    return (
      <div className="min-h-screen pt-20 lg:pt-8 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <div className="min-h-screen pt-20 lg:pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center py-16">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">No Bills Found</h2>
          <p className="text-slate-500 mb-6">کوئی بل نہیں ملا۔ براہ کرم پہلے بل اپلوڈ کریں۔</p>
          <p className="text-sm text-slate-400">
            Please upload or manually enter a bill to see analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 lg:pt-8 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            Bill Analysis Dashboard
          </h1>
          <p className="text-slate-600">بل تجزیہ ڈیش بورڈ - اپنے بلوں کا مکمل تجزیہ کریں</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              {unitChange !== 0 && (
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    unitChange > 0
                      ? 'bg-red-100 text-red-600'
                      : 'bg-green-100 text-green-600'
                  }`}
                >
                  {unitChange > 0 ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                  {' '}{Math.abs(unitChange).toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {latestBill?.units_consumed.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">Latest Units / تازہ ترین یونٹس</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-blue-600" />
              </div>
              {amountChange !== 0 && (
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    amountChange > 0
                      ? 'bg-red-100 text-red-600'
                      : 'bg-green-100 text-green-600'
                  }`}
                >
                  {amountChange > 0 ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                  {' '}{Math.abs(amountChange).toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-800">
              PKR {latestBill?.total_amount.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">Latest Bill / تازہ ترین بل</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{avgUnits.toFixed(0)}</p>
            <p className="text-xs text-slate-500">Avg Units / اوسط یونٹس</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">
              PKR {avgAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-slate-500">Avg Bill / اوسط بل</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Consumption Trend */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Units Consumption Trend
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="units"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10B981' }}
                    activeDot={{ r: 6, fill: '#10B981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Amount Trend */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Bill Amount Trend (PKR)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: number) => [`PKR ${value.toLocaleString()}`, 'Amount']}
                  />
                  <Bar dataKey="amount" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bill Breakdown Pie Chart */}
        {selectedBill && (
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Bill Breakdown / بل کی تفصیلات
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={billBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {billBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `PKR ${value.toLocaleString()}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Current Bill Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Selected Bill Details
              </h3>
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500">Consumer Name</p>
                  <p className="font-medium text-slate-800">{selectedBill.consumer_name || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500">Month</p>
                    <p className="font-medium text-slate-800">{selectedBill.month} {selectedBill.year}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500">Units</p>
                    <p className="font-medium text-slate-800">{selectedBill.units_consumed} kWh</p>
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4">
                  <p className="text-xs text-emerald-600">Total Amount / کل رقم</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    PKR {selectedBill.total_amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bills List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800">
              Bill History / بل کی تاریخ
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-slate-800">{bill.month} {bill.year}</p>
                        <p className="text-xs text-slate-400">{bill.consumer_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{bill.units_consumed} kWh</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-emerald-600">PKR {bill.total_amount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          bill.payment_status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {bill.payment_status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => deleteBill(bill.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
