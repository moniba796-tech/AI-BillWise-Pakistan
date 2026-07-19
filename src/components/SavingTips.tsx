import { useState } from 'react';
import {
  Lightbulb,
  Thermometer,
  Fan,
  Refrigerator,
  Shirt,
  Droplets,
  Sun,
  Plug,
  ChevronDown,
  ChevronUp,
  Sparkles,
  PiggyBank,
} from 'lucide-react';
import { SAVING_TIPS } from '../lib/calculations';

const iconMap: Record<string, React.ElementType> = {
  Thermometer: Thermometer,
  Fan: Fan,
  Lightbulb: Lightbulb,
  Plug: Plug,
  Refrigerator: Refrigerator,
  Shirt: Shirt,
  Droplets: Droplets,
  Sun: Sun,
};

export function SavingTips() {
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(SAVING_TIPS.map(tip => tip.category))];

  const filteredTips = selectedCategory
    ? SAVING_TIPS.filter(tip => tip.category === selectedCategory)
    : SAVING_TIPS;

  const totalPotentialSavings = SAVING_TIPS.reduce((acc, tip) => acc + tip.potential_savings, 0);

  return (
    <div className="min-h-screen pt-20 lg:pt-8 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-2xl mb-4">
            <Lightbulb className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            Smart Saving Tips
          </h1>
          <p className="text-slate-600">بجلی کی بچت کے ذرائع - اپنی بجلی کی کھپت کم کریں</p>
        </div>

        {/* Potential Savings Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm mb-1">Potential Monthly Savings</p>
              <p className="text-3xl font-bold">PKR {totalPotentialSavings.toLocaleString()}</p>
              <p className="text-emerald-200 text-sm mt-1">ممکنہ ماہانہ بچت</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <PiggyBank className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Tips
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                selectedCategory === category
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Tips List */}
        <div className="space-y-4">
          {filteredTips.map((tip) => {
            const Icon = iconMap[tip.icon] || Lightbulb;
            const isExpanded = expandedTip === tip.title;

            return (
              <div
                key={tip.title}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setExpandedTip(isExpanded ? null : tip.title)}
                  className="w-full p-5 text-left flex items-start justify-between group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">{tip.title}</h3>
                      <p className="text-sm text-emerald-600">{tip.titleUrdu}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-amber-600 font-medium">
                          Save up to PKR {tip.potential_savings.toLocaleString()}/month
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 capitalize">
                      {tip.category}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5">
                    <div className="ml-16 space-y-4">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-slate-700">{tip.description}</p>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-4">
                        <p className="text-emerald-700 text-sm font-medium mb-1">Urdu / اردو میں</p>
                        <p className="text-emerald-800">{tip.descriptionUrdu}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-medium">
                          <PiggyBank className="w-4 h-4" />
                          PKR {tip.potential_savings.toLocaleString()} monthly
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Card */}
        <div className="mt-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Quick Implementation Guide
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">No Cost</p>
              <p className="font-medium text-slate-800 mb-2">Free Tips</p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>Set AC to 24-26°C</li>
                <li>Unplug unused devices</li>
                <li>Use natural light when possible</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">One-time Investment</p>
              <p className="font-medium text-slate-800 mb-2">Upgrade Tips</p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>Switch to LED bulbs</li>
                <li>Install solar water heater</li>
                <li>Buy inverter AC</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
