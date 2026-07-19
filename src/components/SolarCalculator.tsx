import { useState } from 'react';
import {
  Sun,
  Calculator,
  IndianRupee,
  Zap,
  TrendingUp,
  Calendar,
  CheckCircle,
  MapPin,
  Home,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { calculateSolarSystem, CITIES } from '../lib/calculations';
import { supabase } from '../lib/supabase';

export function SolarCalculator() {
  const [formData, setFormData] = useState({
    monthlyBill: '',
    roofSize: '',
    city: 'Lahore',
  });
  const [result, setResult] = useState<ReturnType<typeof calculateSolarSystem> | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleCalculate = () => {
    const result = calculateSolarSystem(
      parseFloat(formData.monthly),
      formData.roofSize ? parseInt(formData.roofSize) : undefined,
      formData.city
    );
    setResult(result);
    setShowResult(true);

    // Save to database
    supabase.from('solar_calculations').insert([{
      monthly_bill: parseFloat(formData.monthly),
      roof_size: formData.roofSize ? parseInt(formData.roofSize) : null,
      city: formData.city,
      recommended_system_kw: result.system_kw,
      estimated_cost: result.estimated_cost,
      monthly_savings: result.monthly_savings,
      payback_years: result.payback_years,
    }]);
  };

  const reset = () => {
    setFormData({ monthlyBill: '', roofSize: '', city: 'Lahore' });
    setResult(null);
    setShowResult(false);
  };

  return (
    <div className="min-h-screen pt-20 lg:pt-8 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-2xl mb-4">
            <Sun className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            Solar Savings Calculator
          </h1>
          <p className="text-slate-600">سولر بچت کیلکولیٹر - سولر پینل لگانا فائدہ مند ہے یا نہیں؟</p>
        </div>

        {!showResult ? (
          <>
            {/* Input Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current Monthly Bill (PKR)
                    <span className="text-slate-400 font-normal ml-2">/ موجودہ ماہانہ بل</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <IndianRupee className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      value={formData.monthlyBill}
                      onChange={(e) => setFormData({ ...formData, monthlyBill: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-lg"
                      placeholder="e.g., 15000"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Roof Size (sq ft)
                      <span className="text-slate-400 font-normal ml-2">/ چھت کا سائز</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Home className="w-5 h-5 text-slate-400" />
                      </div>
                      <input
                        type="number"
                        value={formData.roofSize}
                        onChange={(e) => setFormData({ ...formData, roofSize: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      City / شہر
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <MapPin className="w-5 h-5 text-slate-400" />
                      </div>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all appearance-none"
                      >
                        {CITIES.map((city) => (
                          <option key={city.name} value={city.name}>
                            {city.name}, {city.state}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCalculate}
                  disabled={!formData.monthlyBill}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  <Calculator className="w-5 h-5" />
                  <span>Calculate Savings / بچت کا حساب</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                <Sun className="w-8 h-8 text-amber-500 mb-3" />
                <h3 className="font-semibold text-slate-800 mb-1">Pakistan's Solar Potential</h3>
                <p className="text-sm text-slate-600">
                  Average 5-6 peak sun hours daily makes Pakistan ideal for solar
                </p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                <TrendingUp className="w-8 h-8 text-emerald-500 mb-3" />
                <h3 className="font-semibold text-slate-800 mb-1">Rising Tariffs</h3>
                <p className="text-sm text-slate-600">
                  Electricity prices in Pakistan are continuously increasing
                </p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                <Calendar className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-slate-800 mb-1">Long Term Benefits</h3>
                <p className="text-sm text-slate-600">
                  Solar systems last 25+ years with minimal maintenance
                </p>
              </div>
            </div>
          </>
        ) : (
          result && (
            <>
              {/* Results Card */}
              <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-6 text-white mb-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Your Solar Recommendation</h2>
                      <p className="text-amber-100 text-sm">آپ کی سولر سفارش</p>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                    <p className="text-amber-100 text-xs mb-1">System Size</p>
                    <p className="text-3xl font-bold">{result.system_kw} kW</p>
                    <p className="text-amber-200 text-sm">{result.panels} panels</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                    <p className="text-amber-100 text-xs mb-1">Est. Installation</p>
                    <p className="text-3xl font-bold">
                      PKR {(result.estimated_cost / 1000).toFixed(0)}K
                    </p>
                    <p className="text-amber-200 text-sm">approximate</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                    <p className="text-amber-100 text-xs mb-1">Payback Period</p>
                    <p className="text-3xl font-bold">{result.payback_years} yrs</p>
                    <p className="text-amber-200 text-sm">Return on investment</p>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Financial Analysis / مالی تجزیہ
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Monthly Savings</p>
                        <p className="text-xs text-slate-500">After installation</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-emerald-600">
                      PKR {result.monthly_savings.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Annual Savings</p>
                        <p className="text-xs text-slate-500">12 months projection</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-blue-600">
                      PKR {(result.monthly_savings * 12).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Sun className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Annual Generation</p>
                        <p className="text-xs text-slate-500">Estimated kWh/year</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-amber-600">
                      {result.annual_generation.toLocaleString()} kWh
                    </span>
                  </div>
                </div>
              </div>

              {/* Benefits List */}
              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Benefits of Going Solar / سولر کے فوائد
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    'Reduce your electricity bill by 80-90%',
                    'Increase your property value',
                    'Environmentally friendly energy',
                    'Low maintenance costs',
                    'Protection from power outages (with battery)',
                    'Government net metering incentives',
                    '25+ years system lifespan',
                    'Energy independence',
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={reset}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Calculate Again
                </button>
                <a
                  href="https://www.google.com/search?q=solar+panel+installers+in+pakistan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Find Installers
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
