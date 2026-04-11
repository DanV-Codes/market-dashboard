import React, { useState } from 'react';
// ייבוא רכיבי הגרף של Recharts למסך השוק
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// --- חבילות הנתונים השונות שלנו (Market Data Simulation) ---
const data1D = [
  { time: '10:00', sp500: 5150, ta125: 2010 },
  { time: '11:00', sp500: 5165, ta125: 2015 },
  { time: '12:00', sp500: 5140, ta125: 2020 },
  { time: '13:00', sp500: 5120, ta125: 2018 },
  { time: '14:00', sp500: 5090, ta125: 2025 },
  { time: '15:00', sp500: 5110, ta125: 2030 },
  { time: '16:00', sp500: 5085, ta125: 2028 },
];

const data1W = [
  { time: 'יום א׳', sp500: 5020, ta125: 1980 },
  { time: 'יום ב׳', sp500: 5050, ta125: 1995 },
  { time: 'יום ג׳', sp500: 5090, ta125: 2010 },
  { time: 'יום ד׳', sp500: 5120, ta125: 2005 },
  { time: 'יום ה׳', sp500: 5085, ta125: 2028 },
];

const data1M = [
  { time: 'שבוע 1', sp500: 4800, ta125: 1900 },
  { time: 'שבוע 2', sp500: 4950, ta125: 1950 },
  { time: 'שבוע 3', sp500: 4900, ta125: 1980 },
  { time: 'שבוע 4', sp500: 5085, ta125: 2028 },
];

const data1Y = [
  { time: 'ינו׳', sp500: 4100, ta125: 1700 },
  { time: 'אפר׳', sp500: 4400, ta125: 1850 },
  { time: 'יול׳', sp500: 4600, ta125: 1800 },
  { time: 'אוק׳', sp500: 4300, ta125: 1750 },
  { time: 'היום', sp500: 5085, ta125: 2028 },
];

// מפה של מס' ימי מסחר לכל טווח זמן
const tradingDaysMap = {
  '1D': 1,
  '1W': 5,
  '1M': 22,
  '1Y': 252 // ממוצע ימי מסחר בשנה
};

// כרטיסיות המידע למדדים המרכזיים
const marketIndices = [
  { name: "S&P 500", value: 5085.20, change: "-1.14%", isPositive: false },
  { name: "תל אביב 125", value: 2028.40, change: "+0.28%", isPositive: true },
  { name: "Synopsys (SNPS)", value: 510.20, change: "-0.55%", isPositive: false }
];

const MarketOverview = () => {
  // פונקציית עזר לעיצוב מטבע - בדיוק כמו בתיק האישי (DRY!)
  const formatCurrency = (value) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // הזיכרון של הרכיב: איזה טווח זמן נבחר כרגע? (ברירת מחדל: 1D)
  const [timeRange, setTimeRange] = useState('1D');

  // פונקציה חכמה שמחליטה אילו נתונים להחזיר לגרף לפי טווח הזמן שנבחר
  const getChartData = () => {
    switch (timeRange) {
      case '1W': return data1W;
      case '1M': return data1M;
      case '1Y': return data1Y;
      default: return data1D; // ה-1D שלנו
    }
  };

  // רשימת הכפתורים שנייצר
  const timeButtons = [
    { id: '1D', label: 'יום' },
    { id: '1W', label: 'שבוע' },
    { id: '1M', label: 'חודש' },
    { id: '1Y', label: 'שנה' }
  ];

  return (
    <div className="space-y-6">
      
      {/* שורת כרטיסיות - תמונת מצב מהירה */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {marketIndices.map((index, i) => (
          <div key={i} className="p-6 bg-slate-900 rounded-lg shadow-lg border border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">{index.name}</h3>
              {/* שימוש בפונקציית העזר לעיצוב המחיר עם דולר */}
              <p className="text-2xl font-bold text-white">{formatCurrency(index.value)}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${index.isPositive ? 'bg-green-500/10 text-green-500' : 'bg-rose-500/10 text-rose-500'}`}>
              {index.change}
            </div>
          </div>
        ))}
      </div>

      {/* אזור הגרף המרכזי */}
      <div className="p-6 bg-slate-900 rounded-lg shadow-lg border border-slate-800">
        
        {/* כותרת וכפתורי זמן בראש הגרף */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-blue-400">מגמת מסחר - השוואת מדדים</h2>
            {/* סטאמפה של זמן כמו בתמונה */}
            <p className="text-sm text-slate-500">עדכון אחרון: לפני 3 דקות</p>
          </div>
          
          {/* אזור כפתורי הזמן והכיתוב שמתחת */}
          <div className="flex flex-col items-center sm:items-end gap-1.5 w-full sm:w-auto">
            {/* כפתורי הזמן (Toggle Buttons) */}
            <div className="flex bg-slate-800 rounded-lg p-1 w-full sm:w-auto">
              {timeButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setTimeRange(btn.id)}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    timeRange === btn.id 
                      ? 'bg-blue-600 text-white shadow-sm' // עיצוב לכפתור פעיל
                      : 'text-slate-400 hover:text-white hover:bg-slate-700' // עיצוב לכפתור כבוי
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            {/* הצגת מס' ימי המסחר מתחת לרזולוציית התצוגה */}
            <p className="text-xs text-slate-500">
              מס׳ ימי מסחר בתצוגה: <span className="font-bold text-slate-400">{tradingDaysMap[timeRange]}</span>
            </p>
          </div>
        </div>

        {/* ציור הגרף עצמו (מקבל את הנתונים מהפונקציה) */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getChartData()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#64748b' }} />
              <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fill: '#64748b' }} hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ fontWeight: 'bold' }}
                // עיצוב הדולר בתוך החלונית הצפה
                formatter={(value) => formatCurrency(value)}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              {/* הקווים הלינאריים - שינינו ל-type="linear" כדי שיהיו ישרים בין נקודות */}
              <Line type="linear" dataKey="sp500" name="S&P 500" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              <Line type="linear" dataKey="ta125" name="תל אביב 125" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default MarketOverview;