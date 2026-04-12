import React, { useState, useEffect } from 'react';
// ייבוא ספריות הגרפים מ-Recharts
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * הגדרת נתוני התיק האמיתיים שלך.
 * המחיר לקנייה מחושב אוטומטית לפי הסכום הכולל ששילמת חלקי הכמות.
 */
const myPortfolio = [
  { symbol: "VOO", description: "עוקב מדד S&P 500 (Vanguard)", buyDate: "2025-10-06", buyPrice: 6775.78 / 11, quantity: 11 },
  { symbol: "VGSH", description: "אג\"ח ממשלת ארה\"ב קצר (1-3 שנים)", buyDate: "2025-10-06", buyPrice: 1350.21 / 23, quantity: 23 },
  { symbol: "VGIT", description: "אג\"ח ממשלת ארה\"ב בינוני (3-10 שנים)", buyDate: "2025-10-06", buyPrice: 1378.16 / 23, quantity: 23 },
  { symbol: "BIL", description: "אג\"ח ממשלתי קצרצר (1-3 חודשים)", buyDate: "2025-10-06", buyPrice: 1281.13 / 14, quantity: 14 },
  { symbol: "VEA", description: "מניות שווקים מפותחים (ללא ארה\"ב)", buyDate: "2025-10-06", buyPrice: 2018.11 / 33, quantity: 33 },
  { symbol: "VWO", description: "מניות שווקים מתעוררים", buyDate: "2025-10-06", buyPrice: 824.33 / 15, quantity: 15 },
  // הניירות החדשים:
  { symbol: "SIVR", description: "עוקב מחיר כסף (Silver Trust)", buyDate: "2026-02-06", buyPrice: 71.20, quantity: 2 }
];

// הוספתי עוד צבעים כדי שלכל 8 הניירות יהיה צבע ייחודי בגרף
const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f97316'];

const PortfolioTracker = () => {
  // State לניהול המחירים מהשרת, מצב טעינה ושגיאות
  const [currentMarketPrices, setCurrentMarketPrices] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // משיכת נתונים חיים מה-FastAPI כשהקומפוננטה נטענת
  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // מפיקים רשימת סימולים ייחודית מהתיק
        const symbols = [...new Set(myPortfolio.map(item => item.symbol))];
        
        // יצירת בקשות במקביל לכל המניות (Parallel Fetching)
        const fetchPromises = symbols.map(async (symbol) => {
          const response = await fetch(`http://localhost:8000/api/stock/${symbol}`);
          if (!response.ok) throw new Error(`Failed to fetch ${symbol}`);
          const data = await response.json();
          // השרת מחזיר JSON עם שדה price (או current_price בהתאם למימוש שלך)
          return { symbol, price: data.price || data.current_price || 0 };
        });

        const results = await Promise.all(fetchPromises);
        
        // המרה למפה (Object) לגישה מהירה: { "VOO": 620.5, ... }
        const pricesMap = {};
        results.forEach(item => {
          pricesMap[item.symbol] = item.price;
        });

        setCurrentMarketPrices(pricesMap);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("שגיאה בחיבור לשרת הנתונים. וודא ששרת ה-FastAPI רץ על פורט 8000.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
  }, []);

  // פונקציית עזר לפורמט דולרי
  const formatCurrency = (value) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // הצגת מצב טעינה
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-indigo-400 font-medium animate-pulse">מעדכן נתוני שוק חיים...</p>
      </div>
    );
  }

  // הצגת שגיאה במידה והשרת למטה
  if (error) {
    return (
      <div className="p-8 bg-rose-900/20 border border-rose-500/50 rounded-lg text-rose-500 text-center">
        <h3 className="text-xl font-bold mb-2">אופס! משהו השתבש</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 transition-colors"
        >
          נסה שנית
        </button>
      </div>
    );
  }

  // חישובי התיק הכוללים
  const totalCost = myPortfolio.reduce((sum, item) => sum + (item.buyPrice * item.quantity), 0);
  const totalValue = myPortfolio.reduce((sum, item) => sum + ((currentMarketPrices[item.symbol] || 0) * item.quantity), 0);
  const totalProfitNominal = totalValue - totalCost;
  const totalProfitPercent = (totalProfitNominal / totalCost) * 100;
  const isTotalPositive = totalProfitNominal >= 0;

  // הכנת נתונים לגרף העוגה
  const pieData = myPortfolio.map((item) => ({
    name: item.symbol,
    value: (currentMarketPrices[item.symbol] || 0) * item.quantity,
  })).filter(item => item.value > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* כרטיסי סיכום עליונים */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-slate-900 rounded-xl shadow-lg border border-slate-800">
          <h3 className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">שווי תיק נוכחי</h3>
          <p className="text-3xl font-black text-white">{formatCurrency(totalValue)}</p>
        </div>
        
        <div className="p-6 bg-slate-900 rounded-xl shadow-lg border border-slate-800">
          <h3 className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">עלות השקעה כוללת</h3>
          <p className="text-2xl font-bold text-slate-300">{formatCurrency(totalCost)}</p>
        </div>

        <div className="p-6 bg-slate-900 rounded-xl shadow-lg border border-slate-800">
          <h3 className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">רווח/הפסד כולל</h3>
          <p className={`text-2xl font-bold flex items-center gap-2 ${isTotalPositive ? 'text-green-500' : 'text-rose-500'}`}>
            {isTotalPositive ? '▲' : '▼'} 
            {formatCurrency(Math.abs(totalProfitNominal))} ({Math.abs(totalProfitPercent).toFixed(2)}%)
          </p>
        </div>
      </div>

      {/* אזור תוכן מרכזי */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* עמודה 1: גרף התפלגות */}
        <div className="p-6 bg-slate-900 rounded-xl shadow-lg border border-slate-800 lg:col-span-1">
          <h2 className="text-lg font-bold mb-6 text-indigo-400 border-b border-slate-800 pb-2">התפלגות התיק</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', color: '#cbd5e1', paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* עמודה 2: טבלת פוזיציות מפורטת */}
        <div className="p-6 bg-slate-900 rounded-xl shadow-lg border border-slate-800 lg:col-span-2">
          <h2 className="text-lg font-bold mb-6 text-indigo-400 border-b border-slate-800 pb-2">פירוט פוזיציות</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-right" dir="rtl">
              <thead className="text-slate-400 text-xs uppercase tracking-wider">
                <tr className="border-b border-slate-800">
                  <th className="p-4 font-semibold text-right">סימול</th>
                  <th className="p-4 font-semibold text-right">תיאור נייר הערך</th>
                  <th className="p-4 font-semibold">קנייה</th>
                  <th className="p-4 font-semibold">נוכחי</th>
                  <th className="p-4 font-semibold text-center">תשואה</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {myPortfolio.map((item, index) => {
                  const currentPrice = currentMarketPrices[item.symbol] || 0;
                  const profitPercent = currentPrice ? ((currentPrice - item.buyPrice) / item.buyPrice) * 100 : 0;
                  const isPositive = profitPercent >= 0;

                  return (
                    <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/80 transition-colors group">
                      <td className="p-4 font-bold text-white group-hover:text-indigo-400 transition-colors">{item.symbol}</td>
                      <td className="p-4 text-slate-500 text-xs">{item.description}</td>
                      <td className="p-4 text-slate-300">{formatCurrency(item.buyPrice)}</td>
                      <td className="p-4 text-white font-medium">
                        {currentPrice ? formatCurrency(currentPrice) : '---'}
                      </td>
                      <td className={`p-4 font-bold text-center ${isPositive ? 'text-green-500' : 'text-rose-500'}`}>
                         <div className="flex items-center justify-center gap-1">
                            {isPositive ? '▲' : '▼'} {Math.abs(profitPercent).toFixed(2)}%
                         </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default PortfolioTracker;