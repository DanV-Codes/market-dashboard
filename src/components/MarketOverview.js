import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const tradingDaysMap = { '1D': 1, '5D': 5, '1M': 22, '1Y': 252, 'MAX': 'כל ההיסטוריה' };

// 1. הוצאנו את המבנה ההתחלתי החוצה כדי שלא ייצור לולאות אינסופיות של רינדורים
const initialMarketIndices = [
  { id: 'sp500', name: "S&P 500", ticker: "^GSPC", value: "טוען...", date: "מחפש נתונים...", currency: "USD", color: "#3b82f6" },
  { id: 'ta35', name: "תל אביב 35", ticker: "TA35.TA", value: "טוען...", date: "מחפש נתונים...", currency: "ILS", color: "#10b981" },
  { id: 'snps', name: "Synopsys (SNPS)", ticker: "SNPS", value: "טוען...", date: "מחפש נתונים...", currency: "USD", color: "#a855f7" }
];

const MarketOverview = () => {
  const [timeRange, setTimeRange] = useState('1D');
  const [activeLine, setActiveLine] = useState('sp500'); 
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [marketIndices, setMarketIndices] = useState(initialMarketIndices);

  // 2. עדכון מחירים חיים: רץ פעם אחת בטעינה, ואז כל 60 שניות בדיוק
  useEffect(() => {
    const fetchLivePrices = async () => {
      const updated = await Promise.all(initialMarketIndices.map(async (index) => {
        try {
          const res = await fetch(`https://market-backend-api.onrender.com/api/stock/${index.ticker}`);
          const data = await res.json();
          return { ...index, value: data.price || "לא נמצא", date: data.date || "לא ידוע" };
        } catch {
          return { ...index, value: "שגיאה", date: "שגיאת תקשורת" };
        }
      }));
      setMarketIndices(updated);
    };

    // קריאה ראשונית מיד
    fetchLivePrices();

    // הפעלת טיימר למשיכת נתונים כל 60,000 מילישניות (60 שניות)
    // אפשר לשנות ל- 30000 בשביל 30 שניות
    const intervalId = setInterval(fetchLivePrices, 60000);

    // פונקציית ניקוי - תעצור את הטיימר כשהמשתמש יוצא מהמסך כדי לחסוך סוללה
    return () => clearInterval(intervalId);
  }, []); // מערך ריק = מופעל פעם אחת בלבד בעליית הקומפוננטה

  // 3. עדכון נתוני הגרף: נמשך כשמשנים מניה/זמן, ומתעדכן גם הוא כל 60 שניות
  useEffect(() => {
    const fetchGraphData = async () => {
      setLoading(true);
      try {
        const ticker = initialMarketIndices.find(idx => idx.id === activeLine).ticker;
        const res = await fetch(`https://market-backend-api.onrender.com/api/stock/${ticker}/history?period=${timeRange.toLowerCase()}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setChartData(data);
        } else {
          setChartData([]);
        }
      } catch (e) {
        console.error("Graph fetch error:", e);
        setChartData([]);
      }
      setLoading(false);
    };

    // קריאה ראשונית בכל שינוי טאב
    fetchGraphData();

    // נרענן את הגרף כל 60 שניות כדי שיראה תנועה בזמן אמת (שימושי במיוחד בתצוגת 1D)
    const intervalId = setInterval(fetchGraphData, 60000);

    return () => clearInterval(intervalId);
  }, [activeLine, timeRange]);

  const formatCurrency = (val, currencyCode) => {
    if (isNaN(val)) return val;
    return Number(val).toLocaleString('he-IL', { style: 'currency', currency: currencyCode });
  };

  const activeIndexData = marketIndices.find(idx => idx.id === activeLine) || initialMarketIndices[0];

  return (
    <div className="space-y-6">
      {/* כרטיסיות */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {marketIndices.map((index) => {
          const isActive = activeLine === index.id;
          return (
            <div key={index.id} onClick={() => setActiveLine(index.id)}
              className={`p-6 rounded-lg shadow-lg border transition-all cursor-pointer 
              ${isActive ? 'bg-slate-800 border-blue-500 ring-1 ring-blue-500' : 'bg-slate-900 border-slate-800 opacity-60 hover:opacity-100'}`}>
              <h3 className="text-slate-400 text-sm mb-1 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: index.color }}></span>
                {index.name}
              </h3>
              <p className="text-2xl font-bold text-white">{formatCurrency(index.value, index.currency)}</p>
              <p className="text-xs text-slate-500 mt-2">מעודכן ל: {index.date}</p>
            </div>
          );
        })}
      </div>

      {/* אזור הגרף */}
      <div className="p-6 bg-slate-900 rounded-lg shadow-lg border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-blue-400">
                {activeIndexData.name} - מחיר לאורך זמן ({activeIndexData.currency === 'ILS' ? '₪' : '$'})
            </h2>
            <p className="text-sm text-slate-500">מספר ימי מסחר בתצוגה: {tradingDaysMap[timeRange]}</p>
          </div>
          <div className="flex bg-slate-800 rounded-lg p-1">
            {['1D', '5D', '1M', '1Y', 'MAX'].map(range => (
              <button key={range} onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 rounded-md text-sm ${timeRange === range ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* הוספנו dir="ltr" כדי למנוע מבעיות כיווניות של עברית לשבור את הגרף */}
        <div className="h-80 w-full relative" dir="ltr">
          {loading && chartData.length === 0 && (
            <div className="absolute inset-0 z-10 bg-slate-900/50 flex items-center justify-center text-white">
              טוען נתונים מהבורסה...
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" minTickGap={30} tick={{ fontSize: 12 }} />
              <YAxis 
                orientation="right"
                domain={['auto', 'auto']} 
                stroke="#64748b" 
                width={85} 
                tickMargin={10} 
                tick={{ fontSize: 12 }}
                tickFormatter={(val) => formatCurrency(val, activeIndexData.currency)} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} 
                formatter={(value) => [formatCurrency(value, activeIndexData.currency), 'מחיר סגירה']}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line type="linear" dataKey="price" name={activeIndexData.name}
                stroke={activeIndexData.color} strokeWidth={2.5} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;