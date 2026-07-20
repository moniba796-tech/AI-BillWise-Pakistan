import { useState, useCallback } from 'react';
import { Loader2, Zap } from 'lucide-react';
import { Navigation, Layout } from './components/Layout';
import { HomePage } from './components/HomePage';
import { BillScanner } from './components/BillScanner';
import { BillDashboard } from './components/BillDashboard';
import { ApplianceCalculator } from './components/ApplianceCalculator';
import { SavingTips } from './components/SavingTips';
import { BillPrediction } from './components/BillPrediction';
import { SolarCalculator } from './components/SolarCalculator';
import { WapdaOfficeLocator } from './components/WapdaOfficeLocator';
import { UrduVoiceAssistant } from './components/UrduVoiceAssistant';
import { MeterUsage } from './components/MeterUsage';
import { Auth } from './components/Auth';
import { useAuth } from './lib/auth-context';

function App() {
  const { session, loading, user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBillAdded = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab('dashboard');
  }, []);

  const handleNavigate = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <Zap className="w-7 h-7 text-emerald-600" />
          </div>
          <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'scanner':
        return <BillScanner onBillAdded={handleBillAdded} />;
      case 'dashboard':
        return <BillDashboard refreshTrigger={refreshTrigger} />;
      case 'calculator':
        return <ApplianceCalculator />;
      case 'tips':
        return <SavingTips />;
      case 'prediction':
        return <BillPrediction />;
      case 'solar':
        return <SolarCalculator />;
      case 'offices':
        return <WapdaOfficeLocator />;
      case 'assistant':
        return <UrduVoiceAssistant />;
      case 'meter':
        return <MeterUsage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout>
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userEmail={user?.email || (user?.is_anonymous ? 'Guest User' : undefined)}
        onSignOut={signOut}
      />
     <main className="lg:flex-1 lg:min-w-0">{renderContent()}</main>
    </Layout>
  );
}

export default App;
