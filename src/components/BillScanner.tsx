import { useState, useCallback } from 'react';
import {
  Upload,
  Camera,
  FileText,
  Check,
  Loader2,
  Zap,
  AlertCircle,
  Eye,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Bill } from '../types';

interface BillScannerProps {
  onBillAdded: () => void;
}

export function BillScanner({ onBillAdded }: BillScannerProps) {
  const [mode, setMode] = useState<'upload' | 'manual'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<Bill> | null>(null);
  const [manualForm, setManualForm] = useState({
    consumer_name: '',
    consumer_id: '',
    address: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    units_consumed: '',
    amount: '',
    taxes: '',
    fuel_adjustment: '',
    total_amount: '',
    due_date: '',
  });
  const [showPreview, setShowPreview] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setShowPreview(true);

    // Create a preview URL
    const reader = new FileReader();
    reader.onload = async (e) => {
      // Simulate OCR processing
      setIsProcessing(true);

      // Simulated AI extraction (in real app, this would call an AI API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulated extracted data
      const simulatedData: Partial<Bill> = {
        consumer_name: 'Muhammad Ahmed Khan',
        consumer_id: 'LESCO-12345678',
        address: 'House No. 45-B, Gulberg III, Lahore',
        month: months[new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1],
        year: new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear(),
        units_consumed: 450 + Math.floor(Math.random() * 100),
        amount: 0, // Will be calculated
        taxes: 0,
        fuel_adjustment: 1869,
        total_amount: 0,
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };

      // Calculate amounts based on units (simplified)
      const units = simulatedData.units_consumed || 0;
      simulatedData.amount = Math.round(units * 28.5);
      simulatedData.taxes = Math.round(simulatedData.amount * 0.17);
      simulatedData.total_amount = Math.round(
        (simulatedData.amount || 0) + (simulatedData.taxes || 0) + (simulatedData.fuel_adjustment || 0)
      );

      setExtractedData(simulatedData);
      setIsProcessing(false);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const saveExtractedBill = async () => {
    if (!extractedData) return;

    const { error } = await supabase.from('bills').insert([extractedData]);

    if (!error) {
      setExtractedData(null);
      setShowPreview(false);
      onBillAdded();
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const billData = {
      ...manualForm,
      units_consumed: parseFloat(manualForm.units_consumed),
      amount: parseFloat(manualForm.amount),
      taxes: parseFloat(manualForm.taxes) || 0,
      fuel_adjustment: parseFloat(manualForm.fuel_adjustment) || 0,
      total_amount: parseFloat(manualForm.total_amount),
      year: parseInt(String(manualForm.year)),
    };

    const { error } = await supabase.from('bills').insert([billData]);

    if (!error) {
      setManualForm({
        consumer_name: '',
        consumer_id: '',
        address: '',
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        units_consumed: '',
        amount: '',
        taxes: '',
        fuel_adjustment: '',
        total_amount: '',
        due_date: '',
      });
      onBillAdded();
    }
  };

  return (
    <div className="min-h-screen pt-20 lg:pt-8 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
            <Camera className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            Bill Scanner
          </h1>
          <p className="text-slate-600">بل سکینر - اپنا بل اپلوڈ کریں یا دستی طور پر درج کریں</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setMode('upload')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                mode === 'upload'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Upload className="w-5 h-5" />
              <span>Upload Bill</span>
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                mode === 'manual'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Manual Entry</span>
            </button>
          </div>
        </div>

        {mode === 'upload' ? (
          <div className="space-y-6">
            {/* Upload Area */}
            <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-emerald-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-emerald-600" />
                  )}
                </div>
                <p className="text-lg font-medium text-slate-800 mb-1">
                  {isUploading ? 'Processing...' : 'Upload Bill Photo'}
                </p>
                <p className="text-sm text-slate-500">
                  بل کی تصویر اپلوڈ کریں
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Supports: JPG, PNG, PDF (Max 10MB)
                </p>
              </div>
            </div>

            {/* Processing Preview */}
            {showPreview && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                {isProcessing ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
                    <p className="text-lg font-medium text-slate-800">AI is analyzing your bill...</p>
                    <p className="text-sm text-slate-500">AI آپ کے بل کا تجزیہ کر رہا ہے</p>
                  </div>
                ) : extractedData ? (
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">Data Extracted Successfully</h3>
                        <p className="text-sm text-slate-500">ڈیٹا کامیابی سے نکالا گیا</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-500 mb-1">Consumer Name / صارف کا نام</p>
                        <p className="font-medium text-slate-800">{extractedData.consumer_name}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-500 mb-1">Consumer ID / صارف آئی ڈی</p>
                        <p className="font-medium text-slate-800">{extractedData.consumer_id}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 sm:col-span-2">
                        <p className="text-xs text-slate-500 mb-1">Address / پتہ</p>
                        <p className="font-medium text-slate-800">{extractedData.address}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-500 mb-1">Month / مہینہ</p>
                        <p className="font-medium text-slate-800">{extractedData.month} {extractedData.year}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-xs text-slate-500 mb-1">Units Consumed / یونٹس</p>
                        <p className="font-medium text-slate-800">{extractedData.units_consumed} kWh</p>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-4">
                        <p className="text-xs text-emerald-600 mb-1">Base Amount / رقم</p>
                        <p className="font-semibold text-emerald-700">PKR {extractedData.amount?.toLocaleString()}</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-4">
                        <p className="text-xs text-amber-600 mb-1">Taxes + FC / ٹیکسز</p>
                        <p className="font-semibold text-amber-700">
                          PKR {((extractedData.taxes || 0) + (extractedData.fuel_adjustment || 0)).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4 sm:col-span-2">
                        <p className="text-xs text-blue-600 mb-1">Total Bill / کل بل</p>
                        <p className="text-2xl font-bold text-blue-700">PKR {extractedData.total_amount?.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={saveExtractedBill}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                      >
                        <Check className="w-5 h-5" />
                        <span>Save Bill</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowPreview(false);
                          setExtractedData(null);
                        }}
                        className="px-6 py-3 bg-slate-100 text-slate-600 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Tips Section */}
            <div className="bg-blue-50 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Tips for Best Results</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>Ensure the bill is well-lit and not blurry</li>
                    <li>Crop the image to show only the bill</li>
                    <li>Make sure all text is clearly visible</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Manual Entry Form */
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Consumer Name <span className="text-slate-400">/ صارف کا نام</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={manualForm.consumer_name}
                    onChange={(e) => setManualForm({ ...manualForm, consumer_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Consumer ID <span className="text-slate-400">/ صارف آئی ڈی</span>
                  </label>
                  <input
                    type="text"
                    value={manualForm.consumer_id}
                    onChange={(e) => setManualForm({ ...manualForm, consumer_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    placeholder="LESCO-XXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address <span className="text-slate-400">/ پتہ</span>
                </label>
                <input
                  type="text"
                  value={manualForm.address}
                  onChange={(e) => setManualForm({ ...manualForm, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  placeholder="Enter address"
                />
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
                  <select
                    value={manualForm.month}
                    onChange={(e) => setManualForm({ ...manualForm, month: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  >
                    {months.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={manualForm.year}
                    onChange={(e) => setManualForm({ ...manualForm, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    min="2020"
                    max="2040"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Units Consumed (kWh) <span className="text-slate-400">/ یونٹس</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={manualForm.units_consumed}
                    onChange={(e) => setManualForm({ ...manualForm, units_consumed: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    placeholder="450"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Base Amount (PKR) <span className="text-slate-400">/ رقم</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={manualForm.amount}
                    onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    placeholder="12500"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Taxes (PKR) <span className="text-slate-400">/ ٹیکسز</span>
                  </label>
                  <input
                    type="number"
                    value={manualForm.taxes}
                    onChange={(e) => setManualForm({ ...manualForm, taxes: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    placeholder="2125"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fuel Adjustment (PKR)
                  </label>
                  <input
                    type="number"
                    value={manualForm.fuel_adjustment}
                    onChange={(e) => setManualForm({ ...manualForm, fuel_adjustment: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    placeholder="1869"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Total Amount (PKR) <span className="text-slate-400">/ کل رقم</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={manualForm.total_amount}
                    onChange={(e) => setManualForm({ ...manualForm, total_amount: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    placeholder="16494"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Due Date <span className="text-slate-400">/ آخری تاریخ</span>
                  </label>
                  <input
                    type="date"
                    value={manualForm.due_date}
                    onChange={(e) => setManualForm({ ...manualForm, due_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
              >
                <Zap className="w-5 h-5" />
                <span>Save Bill</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
