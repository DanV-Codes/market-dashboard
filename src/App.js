import React, { useState } from 'react';
import MarketOverview from './components/MarketOverview';
import PortfolioTracker from './components/PortfolioTracker';

const App = () => {
  // כאן אנחנו מגדירים את "זיכרון" האפליקציה: איזה טאב פתוח עכשיו?
  // ברירת המחדל תהיה שוק (market)
  const [activeTab, setActiveTab] = useState('market');

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans" dir="rtl">
      {/* תפריט עליון - Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            Market.Core
          </h1>
          
          {/* כפתורי הטאבים */}
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('market')}
              className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'market' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              סקירת שוק
            </button>
            
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'portfolio' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              התיק שלי
            </button>
          </div>
        </div>
      </header>

      {/* אזור התוכן הדינמי */}
      <main className="max-w-6xl mx-auto p-4 mt-8">
        {/* שורת המחץ: מציגה את הרכיב הנכון לפי הטאב שנבחר */}
        {activeTab === 'market' ? <MarketOverview /> : <PortfolioTracker />}
      </main>
    </div>
  );
};

export default App;