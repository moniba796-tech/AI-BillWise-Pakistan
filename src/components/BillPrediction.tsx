import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Bar,
} from 'recharts';
import { supabase } from '../lib/supabase';
import { predictNextMonthBill, calculateBillAmount } from '../lib/calculations';
import type { Bill } from '../types';

export function BillPrediction() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [usageScenarios, setUsageScenarios] = useState([
    { name: 'Reduce AC by 2 hours', change: -10 },
    { name: 'Switch to LED bulbs', change: -5 },
    { name: 'Use fans more often', change: -8 },
    { name: 'Optimize refrigerator', change: -3 },
  ]);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setBills(data);
    }
    setLoading(false);
  };

  const prediction = predictNextMonthBill(bills);
  const latestBill = bills[bills.length - 1];

  // Create chart data with future prediction
  const chartData = bills.slice(-6).map((bill) => ({
    month: `${bill.month.slice(0, 3)}`,
    units: bill.units_consumed,
    amount: bill.total_amount,
    type: 'actual',
  }));

  // Add prediction point
  const currentMonth = new Date().toLocaleString('default', { month: 'long' }).slice(0, 3);
  const predictedUnits = prediction.predicted_units || (latestBill?.units_consumed || 400);
  const predictedAmount = prediction.predicted_amount || (latestBill?.total_amount || 15000);

  if (prediction.predicted_units > 0) {
    chartData.push({
      month: currentMonth,
      units: predictedUnits,
      amount: predictedAmount,
      type: 'predicted',
    });
  }

  // Calculate scenario impacts
  const scenarioResults = usageScenarios.map((scenario) => {
    const newUnits = predictedUnits * (1 + scenario.change / 100);
    const newAmount = calculateBillAmount(newUnits);
    return {
      ...scenario,
      newUnits,
      newAmount,
      savings: predictedAmount - newAmount,
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen pt-20 lg:pt-8 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (bills.length < 2) {
    return (
      <div className="min-h-screen pt-20 lg:pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center py-16">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Need More Data</h2>
          <p className="text-slate-500 mb-6">
            کم از کم 2 بل شامل کریں پیشگوئی کے لیے
          </p>
          <p className="text-sm text-slate-400">
            Please add at least 2 bills to generate predictions. Add more bills for better accuracy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 lg:pt-8 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            AI Bill Prediction
          </h1>
          <p className="text-slate-600">AI بل پیشگوئی - اگلے مہینے کے بل کا اندازہ</p>
        </div>

        {/* Prediction Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className={`rounded-2xl p-6 ${
            prediction.trend === 'up'
              ? 'bg-gradient-to-br from-red-500 to-orange-500'
              : prediction.trend === 'down'
              ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
              : 'bg-gradient-to-br from-blue-500 to-indigo-500'
          } text-white`}>
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 opacity-80" />
              {prediction.trend === 'up' ? (
                <ArrowUpRight className="w-6 h-6" />
              ) : prediction.trend === 'down' ? (
                <ArrowDownRight className="w-6 h-6" />
              ) : (
                <Minus className="w-6 h-6" />
              )}
            </div>
            <p className="text-3xl font-bold">{prediction.predicted_units}</p>
            <p className="text-white/80 text-sm">Predicted Units / متوقع یونٹس</p>
          </div>

          <div className={`rounded-2xl p-6 ${
            prediction.trend === 'up'
              ? 'bg-gradient-to-br from-orange-500 to-amber-500'
              : prediction.trend === 'down'
              ? 'bg-gradient-to-br from-teal-500 to-cyan-500'
              : 'bg-gradient-to-br from-indigo-500 to-purple-500'
          } text-white`}>
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 opacity-80" />
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                Next Month
              </span>
            </div>
            <p className="text-3xl font-bold">PKR {prediction.predicted_amount.toLocaleString()}</p>
            <p className="text-white/80 text-sm">Predicted Bill / متوقع بل</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                {prediction.trend === 'up' ? (
                  <TrendingUp className="w-5 h-5 text-red-500" />
                ) : prediction.trend === 'down' ? (
                  <TrendingDown className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Minus className="w-5 h-5 text-slate-500" />
                )}
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800 capitalize">{prediction.trend}</p>
            <p className="text-slate-500 text-sm">Trend / رجحان</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Units Trend & Prediction
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
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
                  formatter={(value: number, name: string) => [
                    name === 'units' ? `${value} kWh` : `PKR ${value.toLocaleString()}`,
                    name === 'units' ? 'Units' : 'Amount'
                  ]}
                />
                <Bar
                  dataKey="units"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="units"
                  stroke="#6366F1"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-slate-600">Predicted</span>
            </div>
          </div>
        </div>

        {/* Scenario Analysis */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">What-If Scenarios</h3>
              <p className="text-sm text-slate-500">See how usage changes affect your bill</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {scenarioResults.map((result, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-xl p-5 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-slate-800">{result.name}</h4>
                    <p className="text-xs text-emerald-600">-{Math.abs(result.change)}% units</p>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <ArrowDownRight className="w-4 h-4" />
                    <span className="font-semibold">-{result.change}%</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">New Bill:</span>
                    <span className="font-semibold text-slate-800">
                      PKR {result.newAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-500">Your Savings:</span>
                    <span className="font-semibold text-emerald-600">
                      PKR {result.savings.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-800"> Recommendations</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span>Set AC temperature between 24-26°C to reduce cooling costs</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span>Use ceiling fans to supplement AC cooling</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span>Switch to LED bulbs for lighting efficiency</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Usage Alerts</h3>
            </div>
            <ul className="space-y-3">
              {prediction.trend === 'up' && (
                <li className="flex items-start gap-2 text-sm text-slate-700">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>Your usage is trending upward. Consider reducing AC usage.</span>
                </li>
              )}
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>Peak usage hours (6-10 PM) contribute to higher bills</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-700">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>Check for phantom loads from standby devices</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
