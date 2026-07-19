import { useState, useEffect, useCallback } from 'react';
import { Gauge, Search, RefreshCw, AlertCircle, Zap, Calendar, Activity, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MeterReadingResult {
  meterId: string;
  unitsToday: number;
  unitsThisMonth: number;
  currentLoadKw: number;
  isSimulated: boolean;
  lastUpdated: string;
}

interface SavedMeter {
  id: string;
  meter_id: string;
  label: string | null;
}

export function MeterUsage() {
  const [meterIdInput, setMeterIdInput] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [savedMeters, setSavedMeters] = useState<SavedMeter[]>([]);
  const [result, setResult] = useState<MeterReadingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSavedMeters = useCallback(async () => {
    const { data, error } = await supabase
      .from('meters')
      .select('id, meter_id, label')
      .order('created_at', { ascending: false });

    if (!error && data) setSavedMeters(data);
  }, []);

  useEffect(() => {
    loadSavedMeters();
  }, [loadSavedMeters]);

  const checkUsage = async (meterId: string, label?: string) => {
    if (!meterId.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('meter-usage', {
        body: { meterId: meterId.trim(), label: label?.trim() || undefined },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data);
      loadSavedMeters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not fetch meter usage. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkUsage(meterIdInput, labelInput);
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen pt-20 lg:pt-8 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
            <Gauge className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Meter Usage</h1>
          <p className="text-slate-600">اپنے میٹر آئی ڈی سے موجودہ یونٹ استعمال دیکھیں</p>
        </div>

        {/* Search bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={meterIdInput}
                onChange={(e) => setMeterIdInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkUsage(meterIdInput, labelInput)}
                placeholder="Enter your Meter / Consumer ID"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
            <button
              onClick={() => checkUsage(meterIdInput, labelInput)}
              disabled={!meterIdInput.trim() || loading}
              className="px-5 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Gauge className="w-4 h-4" />}
              Check Usage
            </button>
          </div>

          {showAddForm ? (
            <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="Label (e.g. Home, Shop) — optional"
                className="flex-1 px-4 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors"
              >
                Save & Check
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-4 h-4" /> Add a label for this meter
            </button>
          )}
        </div>

        {/* Saved meters */}
        {savedMeters.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-600 mb-2">Your saved meters</p>
            <div className="flex flex-wrap gap-2">
              {savedMeters.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMeterIdInput(m.meter_id);
                    checkUsage(m.meter_id);
                  }}
                  className="px-4 py-2 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl text-sm font-medium text-slate-700 transition-colors"
                >
                  {m.label ? `${m.label} · ${m.meter_id}` : m.meter_id}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-4 mb-6">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-slate-500">Meter ID</p>
                <p className="font-semibold text-slate-800">{result.meterId}</p>
              </div>
              <button
                onClick={() => checkUsage(result.meterId)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-medium">Units Today</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">{result.unitsToday}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">Units This Month</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">{result.unitsThisMonth}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-600 mb-1">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs font-medium">Current Load</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">{result.currentLoadKw} kW</p>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Last updated {new Date(result.lastUpdated).toLocaleString()}
            </p>

            {result.isSimulated && (
              <div className="mt-4 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-xl p-3">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  This reading is <strong>simulated</strong> for demo purposes — no live provider is
                  connected yet. Connect a real smart-meter/DISCO API to replace this with live data.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
