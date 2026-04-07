import React, { useState, useEffect } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Activity, 
  BarChart3,
  Globe,
  Zap,
  Loader2
} from 'lucide-react';

// הגדרות בסיס למניות ומדדים
const STOCKS_CONFIG = {
  "S&P 500": { symbol: "SPX", currency: "USD", market: "NYSE" },
  "תל אביב 125": { symbol: "TA125.TA", currency: "ILS", market: "TASE" },
  "Apple": { symbol: "AAPL", currency: "USD", market: "NASDAQ" }
};

const App = () => {
  const [selectedStock, setSelectedStock] = useState("S&P 500");
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const stockConfig = STOCKS_CONFIG[selectedStock];
  const API_KEY = '3c3ee35909374066b4b76cce47402888'; // <--- כאן שים את המפתח שלך

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // פנייה ל-Twelve Data לקבלת נתוני סוף יום (EOD) של החודש האחרון
        const response = await fetch(
          `https://api.twelvedata.com/time_series?symbol=${stockConfig.symbol}&interval=1day&outputsize=30&apikey=${API_KEY}`
        );
        const result = await response.json();

        if (result.status === "ok") {
          // הנתונים מגיעים מהחדש לישן, אנחנו הופכים אותם כדי שהגרף יזרום משמאל לימין
          const formattedData = result.values.reverse().map((item, index) => ({
            index: index,
            price: parseFloat(item.close),
            label: new Date(item.datetime).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })
          }));
          setChartData(formattedData);
        } else {
          setError("לא ניתן היה למשוך נתונים. בדוק את ה-API Key.");
        }
      } catch (err) {
        setError("שגיאת תקשורת. נסה שוב מאוחר יותר.");
      }
      setIsLoading(false);
    };

    fetchData();
  }, [selectedStock]);

  // חישוב שינוי באחוזים (השוואה בין היום הראשון לאחרון בנתונים שקיבלנו)
  const calculateChange = () => {
    if (chartData.length < 2) return 0;
    const first = chartData[0].price;
    const last = chartData[chartData.length - 1].price;
    return (((last - first) / first) * 100).toFixed(2);
  };

  const change = calculateChange();
  const isPositive = change >= 0;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 font-sans" dir="rtl">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-blue-500 p-1.5 rounded-lg">
              <Zap size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white">MARKET.CORE</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">מערכת ניטור שוק בזמן אמת</p>
        </div>

        <nav className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          {Object.keys(STOCKS_CONFIG).map((stock) => (
            <button
              key={stock}
              onClick={() => setSelectedStock(stock)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                selectedStock === stock 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {stock}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
          {/* Top Info Bar */}
          <div className="p-6 border-b border-slate-800 flex justify-between items-end">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                {stockConfig.market} : {stockConfig.symbol}
              </p>
              <div className="flex items-baseline gap-3">
                <h2 className="text-4xl font-mono font-bold text-white tracking-tighter">
                  {isLoading ? "---" : chartData[chartData.length - 1]?.price.toLocaleString()}
                  <span className="text-lg mr-1 opacity-50">{stockConfig.currency === "ILS" ? "₪" : "$"}</span>
                </h2>
                {!isLoading && (
                  <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span>{isPositive ? '+' : ''}{change}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="h-[400px] w-full p-4 relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="text-blue-500 animate-spin" size={40} />
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center text-rose-400 font-bold">
                {error}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    reversed={true} // כדי להתאים לכתיבה מימין לשמאל
                  />
                  <YAxis 
                    hide={true} 
                    domain={['dataMin - 50', 'dataMax + 50']} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={isPositive ? "#10b981" : "#f43f5e"} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Footer Stats */}
          <div className="bg-black/40 grid grid-cols-2 md:grid-cols-4 border-t border-slate-800">
            {[
              { label: "מקור נתונים", val: "Twelve Data", icon: Globe },
              { label: "סטטוס", val: isLoading ? "טוען..." : "מעודכן", icon: Activity },
              { label: "בורסה", val: stockConfig.market, icon: BarChart3 },
              { label: "רזולוציה", val: "יומי (30 יום)", icon: Clock },
            ].map((item, i) => (
              <div key={i} className={`p-5 flex items-center gap-4 ${i !== 0 ? "border-r border-slate-800/50" : ""}`}>
                <div className="text-slate-600">
                  <item.icon size={18} />
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] mb-0.5">{item.label}</p>
                  <p className="text-sm font-mono font-bold text-slate-200">{item.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;