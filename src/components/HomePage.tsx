import {
  Zap,
  Upload,
  BarChart3,
  Calculator,
  Lightbulb,
  TrendingUp,
  Sun,
  MapPin,
  MessageCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

const features = [
  {
    id: 'scanner',
    title: 'Bill Scanner',
    titleUrdu: 'بل سکینر',
    description: 'Upload your electricity bill and AI will extract all details automatically',
    descriptionUrdu: 'اپنا بجلی کا بل اپلوڈ کریں، AI خود تمام تفصیلات نکال لے گا',
    icon: Upload,
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'dashboard',
    title: 'Bill Dashboard',
    titleUrdu: 'بل ڈیش بورڈ',
    description: 'Visual breakdown of units, taxes, and comparison with previous months',
    descriptionUrdu: 'یونٹس، ٹیکسز اور پچھلے مہینوں کے موازنہ کا بصری تجزیہ',
    icon: BarChart3,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'calculator',
    title: 'Appliance Calculator',
    titleUrdu: 'آلات کیلکولیٹر',
    description: 'Calculate usage and cost for each appliance in your home',
    descriptionUrdu: 'اپنے گھر کے ہر آلے کے استعمال اور قیمت کا حساب لگائیں',
    icon: Calculator,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'tips',
    title: 'Saving Tips',
    titleUrdu: 'بچت کے طریقے',
    description: 'Personalized tips to reduce your electricity consumption',
    descriptionUrdu: 'بجلی کی کھپت کم کرنے کے نجی طریقے',
    icon: Lightbulb,
    color: 'from-yellow-500 to-amber-500',
    bgColor: 'bg-yellow-50',
  },
  {
    id: 'prediction',
    title: 'Bill Prediction',
    titleUrdu: 'بل کی پیشگوئی',
    description: 'AI predicts your next month bill based on usage patterns',
    descriptionUrdu: 'AI استعمال کے مطابق اگلے مہینے کے بل کی پیشگوئی کرتا ہے',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
  },
  {
    id: 'solar',
    title: 'Solar Calculator',
    titleUrdu: 'سولر کیلکولیٹر',
    description: 'Find out if solar panels are right for you and calculate savings',
    descriptionUrdu: 'سولر پینل آپ کے لیے موزوں ہیں یا نہیں اور بچت کا حساب',
    icon: Sun,
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-50',
  },
  {
    id: 'offices',
    title: 'WAPDA Offices',
    titleUrdu: 'واپڈا آفسز',
    description: 'Find nearest WAPDA offices with locations and contact info',
    descriptionUrdu: 'قریب ترین واپڈا آفسز کے مقامات اور رابطے کی معلومات',
    icon: MapPin,
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-50',
  },
  {
    id: 'assistant',
    title: 'Urdu Voice Assistant',
    titleUrdu: 'اردو آواز اسسٹنٹ',
    description: 'Ask questions in Urdu about your electricity bill',
    descriptionUrdu: 'اپنے بجلی کے بل کے بارے میں اردو میں سوالات پوچھیں',
    icon: MessageCircle,
    color: 'from-teal-500 to-green-500',
    bgColor: 'bg-teal-50',
  },
];

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen pt-16 lg:pt-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMi4yIDEuOC00IDQtNHM0IDEuOCA0IDQtMS44IDQtNCA0LTQtMS44LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-8">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>AI-Powered Electricity Bill Analyzer</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              AI BillWise Pakistan
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100 mb-3 leading-relaxed">
              اپنا بجلی کا بل سمجھیں، کم کریں اور مستقبل کے بل کا اندازہ حاصل کریں
            </p>
            <p className="text-base text-emerald-200 max-w-2xl mx-auto mb-10 leading-relaxed">
              Understand your electricity bill, reduce consumption, and predict future bills with AI
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('scanner')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-700 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-emerald-50 transition-all duration-200"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Bill / بل اپلوڈ کریں</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => onNavigate('calculator')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500/30 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-emerald-500/40 transition-all duration-200"
              >
                <Calculator className="w-5 h-5" />
                <span>Calculate Usage / استعمال کا حساب</span>
              </button>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-20 fill-slate-50">
            <path d="M0,64L48,69.3C96,75,192,85,288,90.7C384,96,480,96,576,85.3C672,75,768,53,864,48C960,43,1056,53,1152,58.7C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 lg:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-3">
              Why Use BillWise?
            </h2>
            <p className="text-slate-600">آپ کو یہ ٹول کیوں استعمال کرنا چاہیے</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">High Bills</h3>
              <p className="text-sm text-slate-600">
                بجلی کے بل بہت زیادہ آتے ہیں اور پتہ نہیں کیوں؟
              </p>
            </div>

            <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Unknown Consumption</h3>
              <p className="text-sm text-slate-600">
                پتہ نہیں کون سا آلہ زیادہ بجلی استعمال کر رہا ہے
              </p>
            </div>

            <div className="bg-white rounded-2xl p-7 shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <Sun className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Solar Confusion</h3>
              <p className="text-sm text-slate-600">
                سولر پینل لگانا فائدہ مند ہوگا یا نہیں؟
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-3">
              Powerful Features
            </h2>
            <p className="text-slate-600">طاقتور خصوصیات</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.id}
                  onClick={() => onNavigate(feature.id)}
                  className="group text-left p-7 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} style={{ color: undefined }} />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1">{feature.title}</h3>
                  <p className="text-xs text-emerald-600 mb-3">{feature.titleUrdu}</p>
                  <p className="text-sm text-slate-600 line-clamp-2">{feature.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-emerald-700 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">50,000+</div>
              <div className="text-emerald-100 text-sm">PKR Average Savings</div>
              <div className="text-emerald-200 text-xs">اکوسط بچت</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">8+</div>
              <div className="text-emerald-100 text-sm">City Coverage</div>
              <div className="text-emerald-200 text-xs">شہروں میں دستیاب</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">20%</div>
              <div className="text-emerald-100 text-sm">Bill Reduction</div>
              <div className="text-emerald-200 text-xs">بل میں کمی</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">100%</div>
              <div className="text-emerald-100 text-sm">Urdu Support</div>
              <div className="text-emerald-200 text-xs">اردو سپورٹ</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-6 h-6 text-emerald-400" />
            <span className="text-lg font-bold text-white">BillWise Pakistan</span>
          </div>
          <p className="text-sm">
            Empowering Pakistani citizens to understand and reduce electricity bills
          </p>
          <p className="text-xs mt-2 text-slate-500">
            پاکستانی شہریوں کو بجلی کے بل سمجھنے اور کم کرنے میں مدد
          </p>
        </div>
      </footer>
    </div>
  );
}
