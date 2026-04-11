import React from 'react';
// ייבוא רכיבי הגרף של Recharts למסך השוק
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// 1. נתוני "סימולציה" לגרף המגמה היומי של המדדים
const dailyMarketTrend = [
  { time: '10:00', sp500: 5150, ta125: 2010 },
  { time: '11:00', sp500: 5165, ta125: 2015 },
  { time: '12:00', sp500: 5140, ta125: 2020 },
  { time: '13:00', sp500: 5120, ta125: 2018 },
  { time: '14:00', sp500: 5090, ta125: 2025 },
  { time: '15:00', sp500: 5110, ta125: 2030 },
  { time: '16:00', sp500: 5085, ta125: 2028 }, // S&P בירידה, ת"א בעלייה מתונה
];

// 2. כרטיסיות המידע למדדים המרכזיים
const marketIndices = [
  { name: "S&P 500", value: "5,085.20", change: "-1.14%", isPositive: false },
  { name: "תל אביב 125", value: "2,028.40", change: "+0.28%", isPositive: true },
  { name: "Synopsys (SNPS)", value: "510.20", change: "-0.55%", isPositive: false }
];

const MarketOverview = () => {
  return (
    <div className="space-y-6">
      
      {/* שורת כרטיסיות - תמונת מצב מהירה */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {marketIndices.map((index, i) => (
          <div key={i} className="p-6 bg-slate-900 rounded-lg shadow-lg border border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">{index.name}</h3>
              <p className="text-2xl font-bold text-white">{index.value}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${index.isPositive ? 'bg-green-500/10 text-green-500' : 'bg-rose-500/10 text-rose-500'}`}>
              {index.change}
            </div>
          </div>
        ))}
      </div>

      {/* אזור הגרף המרכזי */}
      <div className="p-6 bg-slate-900 rounded-lg shadow-lg border border-slate-800">
        <h2 className="text-xl font-bold mb-6 text-blue-400">מגמת מסחר יומית - השוואת מדדים</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyMarketTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              {/* רשת רקע עדינה */}
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              {/* ציר זמן תחתון */}
              <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#64748b' }} />
              {/* ציר מספרים שמאלי (מוסתר חלקית כדי לשמור על מראה נקי) */}
              <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fill: '#64748b' }} hide />
              {/* חלונית פרטים במעבר עכבר */}
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              {/* הקווים עצמם */}
              <Line type="monotone" dataKey="sp500" name="S&P 500" stroke="#3b82f6" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="ta125" name="תל אביב 125" stroke="#10b981" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default MarketOverview;