import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// --- הוספנו נתונים גם עבור SNPS כדי שנוכל לראות את כולם על הגרף! ---
const data1D = [
  { time: '10:00', sp500: 5150, ta125: 2010, snps: 512.50 },
  { time: '11:00', sp500: 5165, ta125: 2015, snps: 514.00 },
  { time: '12:00', sp500: 5140, ta125: 2020, snps: 510.80 },
  { time: '13:00', sp500: 5120, ta125: 2018, snps: 508.20 },
  { time: '14:00', sp500: 5090, ta125: 2025, snps: 505.50 },
  { time: '15:00', sp500: 5110, ta125: 2030, snps: 509.00 },
  { time: '16:00', sp500: 5085, ta125: 2028, snps: 510.20 },
];

const data1W = [
  { time: 'יום א׳', sp500: 5020, ta125: 1980, snps: 495.00 },
  { time: 'יום ב׳', sp500: 5050, ta125: 1995, snps: 502.50 },
  { time: 'יום ג׳', sp500: 5090, ta125: 2010, snps: 508.00 },
  { time: 'יום ד׳', sp500: 5120, ta125: 2005, snps: 515.20 },
  { time: 'יום ה׳', sp500: 5085, ta125: 2028, snps: 510.20 },
];

const data1M = [
  { time: 'שבוע 1', sp500: 4800, ta125: 1900, snps: 470.00 },
  { time: 'שבוע 2', sp500: 4950, ta125: 1950, snps: 490.50 },
  { time: 'שבוע 3', sp500: 4900, ta125: 1980, snps: 485.00 },
  { time: 'שבוע 4', sp500: 5085, ta125: 2028, snps: 510.20 },
];

const data1Y = [
  { time: 'ינו׳', sp500: 4100, ta125: 1700, snps: 380.00 },
  { time: 'אפר׳', sp500: 4400, ta125: 1850, snps: 420.00 },
  { time: 'יול׳', sp500: 4600, ta125: 1800, snps: 450.50 },
  { time: 'אוק׳', sp500: 4300, ta125: 1750, snps: 410.00 },
  { time: 'היום', sp500: 5085, ta125: 2028, snps: 510.20 },
];

const tradingDaysMap = {
  '1D': 1, '1W': 5, '1M': 22, '1Y': 252
};

// הוספנו "id" וצבע לכל כרטיסייה כדי שנוכל לזהות אותה בקלות
const marketIndices = [
  { id: 'sp500', name: "S&P 500", value: 5085.20, change: "-1.14%", isPositive: false, color: "#3b82f6" },
  { id: 'ta125', name: "תל אביב 125", value: 2028.40, change: "+0.28%", isPositive: true, color: "#10b981" },
  { id: 'snps', name: "Synopsys (SNPS)", value: 510.20, change: "-0.55%", isPositive: false, color: "#a855f7" }
];

const MarketOverview = () => {
  const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const [timeRange, setTimeRange] = useState('1D');
  
  // הזיכרון החדש: איזה קווים מוצגים כרגע? (ברירת מחדל: רק S&P 500 מוצג בהתחלה)
  const [activeLines, setActiveLines] = useState(['sp500']);

  // פונקציה שמדליקה ומכבה את הקווים כשהמשתמש לוחץ על כרטיסייה
  const toggleLine = (id) => {
    setActiveLines(prev => {
      // אם זה כבר מסומן - נסיר אותו מהרשימה
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      // אם זה לא מסומן - נוסיף אותו לרשימה
      return [...prev, id];
    });
  };

  const getChartData = () => {
    switch (timeRange) {
      case '1W': return data1W;
      case '1M': return data1M;
      case '1Y': return data1Y;
      default: return data1D;
    }
  };

  const timeButtons = [
    { id: '1D', label: 'יום' },
    { id: '1W', label: 'שבוע' },
    { id: '1M', label: 'חודש' },
    { id: '1Y', label: 'שנה' }
  ];

  return (
    <div className="space-y-6">
      
      {/* שורת כרטיסיות - עכשיו הן לחיצות! */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {marketIndices.map((index) => {
          // בודקים האם הכרטיסייה הזו מופעלת כרגע
          const isActive = activeLines.includes(index.id);
          
          return (
            <div 
              key={index.id} 
              onClick={() => toggleLine(index.id)}
              // הוספנו אפקטים של מעבר עכבר ושינוי צבע גבול אם היא פעילה
              className={`p-6 rounded-lg shadow-lg border transition-all cursor-pointer select-none
                ${isActive 
                  ? 'bg-slate-800 border-slate-500 opacity-100 ring-1 ring-slate-400' 
                  : 'bg-slate-900 border-slate-800 opacity-60 hover:opacity-100 hover:bg-slate-800/50'
                }
              `}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-2">
                    {/* עיגול צבע קטן שמייצג את המניה */}
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: index.color }}></span>
                    {index.name}
                  </h3>
                  <p className="text-2xl font-bold text-white">{formatCurrency(index.value)}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${index.isPositive ? 'bg-green-500/10 text-green-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {index.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* אזור הגרף המרכזי */}
      <div className="p-6 bg-slate-900 rounded-lg shadow-lg border border-slate-800">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-blue-400">מגמת מסחר - השוואת מדדים</h2>
            <p className="text-sm text-slate-500">עדכון אחרון: לפני 3 דקות</p>
          </div>
          
          <div className="flex flex-col items-center sm:items-end gap-1.5 w-full sm:w-auto">
            <div className="flex bg-slate-800 rounded-lg p-1 w-full sm:w-auto">
              {timeButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setTimeRange(btn.id)}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    timeRange === btn.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              מס׳ ימי מסחר בתצוגה: <span className="font-bold text-slate-400">{tradingDaysMap[timeRange]}</span>
            </p>
          </div>
        </div>

        <div className="h-80 w-full">
          {/* אם לא בחרנו כלום, נציג הודעה נחמדה */}
          {activeLines.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-lg">
              לחץ על הכרטיסיות למעלה כדי להוסיף נתונים לגרף
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getChartData()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#64748b' }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fill: '#64748b' }} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ fontWeight: 'bold' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                
                {/* התניה חכמה: הקו מצויר רק אם הוא נמצא ברשימת הזיכרון שלנו! */}
                {activeLines.includes('sp500') && <Line type="linear" dataKey="sp500" name="S&P 500" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />}
                {activeLines.includes('ta125') && <Line type="linear" dataKey="ta125" name="תל אביב 125" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />}
                {activeLines.includes('snps') && <Line type="linear" dataKey="snps" name="Synopsys (SNPS)" stroke="#a855f7" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  );
};

export default MarketOverview;