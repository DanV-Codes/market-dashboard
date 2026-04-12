import React, { useState } from 'react';
import MarketOverview from './components/MarketOverview';
import PortfolioTracker from './components/PortfolioTracker';

function App() {
  // 'market' יהיה מסך ברירת המחדל
  const [activeTab, setActiveTab] = useState('market'); 

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      
      {/* תפריט ניווט עליון */}
      <nav className="mb-8 flex gap-4 border-b border-slate-800 pb-4">
        <button 
          onClick={() => setActiveTab('market')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'market' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          תמונת שוק
        </button>
        <button 
          onClick={() => setActiveTab('portfolio')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'portfolio' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          התיק שלי
        </button>
      </nav>

      {/* אזור התוכן - מתחלף לפי מה שנבחר */}
      <main>
        {activeTab === 'market' && <MarketOverview />}
        {activeTab === 'portfolio' && <PortfolioTracker />}
      </main>

    </div>
  );
}

export default App;