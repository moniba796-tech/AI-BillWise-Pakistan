import { useState, useEffect } from 'react';
import {
  Calculator,
  Plus,
  Trash2,
  RefreshCw,
  Zap,
  IndianRupee,
  TrendingUp,
  PieChart,
  Snowflake,
  Fan,
  Refrigerator,
  Shirt,
  WashingMachine,
  Droplets,
  Lightbulb,
  Tv,
  Monitor,
  Microwave,
  Flame,
  Sun,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { APPLIANCE_DATA, calculateApplianceConsumption, calculateBillAmount } from '../lib/calculations';
import type { Appliance } from '../types';

const iconMap: Record<string, React.ElementType> = {
  Snowflake: Snowflake,
  Fan: Fan,
  Refrigerator: Refrigerator,
  Shirt: Shirt,
  WashingMachine: WashingMachine,
  Droplets: Droplets,
  Lightbulb: Lightbulb,
  Tv: Tv,
  Monitor: Monitor,
  Microwave: Microwave,
  Flame: Flame,
  Sun: Sun,
};

export function ApplianceCalculator() {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAppliance, setNewAppliance] = useState({
    name: '',
    wattage: '',
    hours_daily: '8',
    quantity: '1',
    days_used: '30',
  });

  useEffect(() => {
    fetchAppliances();
  }, []);

  const fetchAppliances = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('appliances')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const appliancesWithCalc = data.map((app: Appliance) => {
        const { units, cost } = calculateApplianceConsumption(
          app.wattage,
          app.hours_daily,
          app.days_used
        );
        return { ...app, estimated_units: units, estimated_cost: cost };
      });
      setAppliances(appliancesWithCalc);
    }
    setLoading(false);
  };

  const addAppliance = async () => {
    const wattage = parseInt(newAppliance.wattage);
    const hoursDaily = parseFloat(newAppliance.hours_daily);
    const quantity = parseInt(newAppliance.quantity);
    const daysUsed = parseInt(newAppliance.days_used);

    const { units, cost } = calculateApplianceConsumption(wattage, hoursDaily * quantity, daysUsed);

    const applianceData = {
      name: newAppliance.name,
      category: 'custom',
      wattage,
      hours_daily: hoursDaily,
      quantity,
      days_used: daysUsed,
      estimated_units: units,
      estimated_cost: cost,
    };

    const { data, error } = await supabase
      .from('appliances')
      .insert([applianceData])
      .select();

    if (!error && data) {
      setAppliances([data[0], ...appliances]);
      setNewAppliance({
        name: '',
        wattage: '',
        hours_daily: '8',
        quantity: '1',
        days_used: '30',
      });
      setShowAddForm(false);
    }
  };

  const deleteAppliance = async (id: string) => {
    const { error } = await supabase.from('appliances').delete().eq('id', id);
    if (!error) {
      setAppliances(appliances.filter((a) => a.id !== id));
    }
  };

  const addPresetAppliance = async (preset: typeof APPLIANCE_DATA[0]) => {
    const { units, cost } = calculateApplianceConsumption(preset.wattage, 8, 30);

    const applianceData = {
      name: preset.name,
      category: preset.category,
      wattage: preset.wattage,
      hours_daily: 8,
      quantity: 1,
      days_used: 30,
      estimated_units: units,
      estimated_cost: cost,
    };

    const { data, error } = await supabase
      .from('appliances')
      .insert([applianceData])
      .select();

    if (!error && data) {
      const { units: newUnits, cost: newCost } = calculateApplianceConsumption(
        data[0].wattage,
        data[0].hours_daily,
        data[0].days_used
      );
      setAppliances([{ ...data[0], estimated_units: newUnits, estimated_cost: newCost }, ...appliances]);
    }
  };

  const totalUnits = appliances.reduce((acc, a) => acc + (a.estimated_units || 0), 0);
  const totalCost = appliances.reduce((acc, a) => acc + (a.estimated_cost || 0), 0);

  // Category breakdown
  const categoryBreakdown = appliances.reduce((acc, a) => {
    const category = a.category || 'other';
    if (!acc[category]) {
      acc[category] = { units: 0, cost: 0 };
    }
    acc[category].units += a.estimated_units || 0;
    acc[category].cost += a.estimated_cost || 0;
    return acc;
  }, {} as Record<string, { units: number; cost: number }>);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 lg:pt-8 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 lg:pt-8 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            Appliance Usage Calculator
          </h1>
          <p className="text-slate-600">آلات کے استعمال کا حساب - معلوم کریں کون سا آلہ زیادہ بجلی استعمال کرتا ہے</p>
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Monthly</span>
            </div>
            <p className="text-3xl font-bold">{totalUnits.toFixed(1)}</p>
            <p className="text-emerald-100 text-sm">Total Units / کل یونٹس (kWh)</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <IndianRupee className="w-8 h-8 opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Estimated</span>
            </div>
            <p className="text-3xl font-bold">PKR {totalCost.toLocaleString()}</p>
            <p className="text-blue-100 text-sm">Total Cost / کل قیمت</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <PieChart className="w-8 h-8 opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Appliances</span>
            </div>
            <p className="text-3xl font-bold">{appliances.length}</p>
            <p className="text-purple-100 text-sm">Added / شامل شدہ</p>
          </div>
        </div>

        {/* Quick Add Presets */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Add Common Appliances</h3>
          <div className="flex flex-wrap gap-2">
            {APPLIANCE_DATA.slice(0, 8).map((preset) => {
              const Icon = iconMap[preset.icon] || Zap;
              return (
                <button
                  key={preset.name}
                  onClick={() => addPresetAppliance(preset)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-emerald-100 rounded-xl text-sm font-medium text-slate-700 hover:text-emerald-700 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {preset.name}
                  <Plus className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Add Custom Appliance */}
        {showAddForm ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Add Custom Appliance</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newAppliance.name}
                  onChange={(e) => setNewAppliance({ ...newAppliance, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  placeholder="e.g., Heater"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Wattage (W)</label>
                <input
                  type="number"
                  value={newAppliance.wattage}
                  onChange={(e) => setNewAppliance({ ...newAppliance, wattage: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  placeholder="e.g., 1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hours/Day</label>
                <input
                  type="number"
                  value={newAppliance.hours_daily}
                  onChange={(e) => setNewAppliance({ ...newAppliance, hours_daily: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  step="0.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={newAppliance.quantity}
                  onChange={(e) => setNewAppliance({ ...newAppliance, quantity: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Days/Month</label>
                <input
                  type="number"
                  value={newAppliance.days_used}
                  onChange={(e) => setNewAppliance({ ...newAppliance, days_used: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  min="1"
                  max="31"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={addAppliance}
                disabled={!newAppliance.name || !newAppliance.wattage}
                className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                Add Appliance
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-colors mb-6"
          >
            <Plus className="w-5 h-5" />
            <span>Add Custom Appliance / اپنی مرضی کا آلہ شامل کریں</span>
          </button>
        )}

        {/* Appliances List */}
        {appliances.length > 0 ? (
          <div className="space-y-4">
            {appliances.map((appliance) => {
              const Icon = iconMap[APPLIANCE_DATA.find((p) => p.name === appliance.name)?.icon || ''] || Calculator;
              const usagePercentage = totalUnits > 0 ? ((appliance.estimated_units || 0) / totalUnits) * 100 : 0;

              return (
                <div
                  key={appliance.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{appliance.name}</h4>
                        <p className="text-sm text-slate-500">
                          {appliance.wattage}W × {appliance.hours_daily}h × {appliance.days_used} days
                          {appliance.quantity > 1 && ` × ${appliance.quantity}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">
                        PKR {(appliance.estimated_cost || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">{(appliance.estimated_units || 0).toFixed(1)} units</p>
                    </div>
                  </div>

                  {/* Usage Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>Usage Share</span>
                      <span>{usagePercentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${usagePercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {appliance.quantity} {appliance.quantity === 1 ? 'unit' : 'units'}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteAppliance(appliance.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calculator className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No Appliances Added</h3>
            <p className="text-slate-500">کوئی آلہ شامل نہیں۔ اوپر سے اپنے معمول کے آلات شامل کریں۔</p>
          </div>
        )}

        {/* Category Summary */}
        {Object.keys(categoryBreakdown).length > 0 && (
          <div className="mt-8 bg-slate-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Category Breakdown</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(categoryBreakdown).map(([category, data]) => (
                <div key={category} className="bg-white rounded-xl p-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{category}</p>
                  <p className="text-lg font-bold text-slate-800">
                    {(data.units as number).toFixed(1)} units
                  </p>
                  <p className="text-sm text-emerald-600">
                    PKR {(data.cost as number).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
