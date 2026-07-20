import { useState } from 'react';
import {
  Zap,
  Upload,
  BarChart3,
  Calculator,
  Sun,
  MapPin,
  MessageCircle,
  Lightbulb,
  TrendingUp,
  Menu,
  X,
  LogOut,
  Gauge,
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userEmail?: string;
  onSignOut?: () => void;
}

const navItems = [
  { id: 'home', label: 'Home', labelUrdu: 'ہوم', icon: Zap },
  { id: 'scanner', label: 'Bill Scanner', labelUrdu: 'بل سکینر', icon: Upload },
  { id: 'dashboard', label: 'Dashboard', labelUrdu: 'ڈیش بورڈ', icon: BarChart3 },
  { id: 'calculator', label: 'Appliances', labelUrdu: 'آلات', icon: Calculator },
  { id: 'tips', label: 'Saving Tips', labelUrdu: 'بچت کے طریقے', icon: Lightbulb },
  { id: 'prediction', label: 'Prediction', labelUrdu: 'پیشگوئی', icon: TrendingUp },
  { id: 'solar', label: 'Solar', labelUrdu: 'سولر', icon: Sun },
  { id: 'offices', label: 'WAPDA Offices', labelUrdu: 'واپڈا آفسز', icon: MapPin },
  { id: 'assistant', label: 'Voice Assistant', labelUrdu: 'آواز اسسٹنٹ', icon: MessageCircle },
  { id: 'meter', label: 'Meter Usage', labelUrdu: 'میٹر یوزیج', icon: Gauge },
];

export function Navigation({ activeTab, onTabChange, userEmail, onSignOut }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
     <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:h-screen lg:sticky lg:top-0 bg-gradient-to-b from-emerald-800 via-emerald-700 to-teal-700 shadow-2xl z-50">
        <div className="flex items-center gap-3 px-6 py-7 border-b border-emerald-600/30">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
            <Zap className="w-8 h-8 text-yellow-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">BillWise</h1>
            <p className="text-xs text-emerald-200">Pakistan</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                    : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-yellow-300' : ''}`} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs opacity-75">{item.labelUrdu}</div>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-emerald-600/30 space-y-3">
          {userEmail && (
            <div className="flex items-center justify-between gap-2 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
              <span className="text-xs text-emerald-100 truncate">{userEmail}</span>
              <button
                onClick={onSignOut}
                className="p-1.5 rounded-lg text-emerald-100 hover:bg-white/10 hover:text-white transition-colors flex-shrink-0"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-xs text-emerald-100 text-center">
              Developed for Pakistani citizens to understand and reduce electricity bills
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-emerald-700 to-teal-600 shadow-lg z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Zap className="w-7 h-7 text-yellow-300" />
            <div>
              <h1 className="text-lg font-bold text-white">BillWise Pakistan</h1>
            </div>
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMenuOpen(false)}>
          <div
            className="absolute right-0 top-14 bottom-0 w-72 bg-gradient-to-b from-emerald-800 to-teal-700 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-emerald-100 hover:bg-white/10'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-yellow-300' : ''}`} />
                    <div>
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs opacity-75">{item.labelUrdu}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
            {userEmail && (
              <div className="px-3 pb-4">
                <div className="flex items-center justify-between gap-2 bg-white/10 rounded-xl px-4 py-3">
                  <span className="text-xs text-emerald-100 truncate">{userEmail}</span>
                  <button
                    onClick={onSignOut}
                    className="p-1.5 rounded-lg text-emerald-100 hover:bg-white/10 hover:text-white transition-colors flex-shrink-0"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      {children}
    </div>
  );
}
