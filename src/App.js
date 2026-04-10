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
import { TrendingUp, TrendingDown, Clock, Activity, BarChart3, Globe, Zap, Loader2 } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0f172a]/95 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-md" dir="ltr">
        <div className="font-mono text-sm text-right">
          <p className="text-slate-400 mb-1">Date: <span className="text-white font-bold">{data.label}</span></p>
          <p className="text-slate-400">Price: <span className="text-emerald-400 font-bold text-base">${data.price.toFixed(2)}</span></p>
        </div>
      </div>
    );
  }
  return null;
};

// הגדרות בסיס למניות - הוספנו את הנכסים החדשים שלך
const STOCKS_CONFIG = {
  "S&P 500 (SPY)": { symbol: "SPY", market: "NYSE" },
  "Synopsys": { symbol: "SNPS", market: "NASDAQ" },
  "Vanguard S&P 500": { symbol: "VOO", market: "NYSE" },
  "Silver Trust": { symbol: "SIVR", market: "NYSE" },
  "Israel ETF (EIS)": { symbol: "EIS", market: "NYSE" }
};

const TIMEFRAME_INFO = {
  "1D": "מציג יום מסחר אחרון (נרות של 5 דקות)",
  "1W": "מציג 5 ימי מסחר אחרונים (שבועי)",
  "1M": "מציג 22 ימי מסחר אחרונים (חודשי)",
  "3M": "מציג 65 ימי מסחר אחרונים (רבעוני)",
  "1Y": "מציג 252 ימי מסחר אחרונים (שנתי)"
};

const App = () => {
  const [selectedStock, setSelectedStock] = useState("S&P 500 (SPY)");
  const [timeframe, setTimeframe] = useState("1M");
  const [chartData, setChartData] = useState([]);
  const [companyInfo, setCompanyInfo] = useState({ price: 0, high: 0, low: 0, marketCap: 0, sector: "", volume: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const stockConfig = STOCKS_CONFIG[selectedStock];

  const TWELVE_DATA_KEY = '3c3ee35909374066b4b76cce47402888';
  const FINNHUB_KEY = 'd7am3s9r01qmvlmggir0d7am3s9r01qmvlmggirg';

  useEffect(() => {
    const fetchHybridData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let interval = "1day";
        let outputSize = 22;

        if (timeframe === "1D") { interval = "5min"; outputSize = 78; }
        else if (timeframe === "1W") { interval = "1h"; outputSize = 35; }
        else if (timeframe === "1M") { outputSize = 22; }
        else if (timeframe === "3M") { outputSize = 65; }
        else if (timeframe === "1Y") { outputSize = 252; }

        const [tdResponse, fhResponse] = await Promise.all([
          fetch(`https://api.twelvedata.com/time_series?symbol=${stockConfig.symbol}&interval=${interval}&outputsize=${outputSize}&apikey=${TWELVE_DATA_KEY}`),
          fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${stockConfig.symbol}&token=${FINNHUB_KEY}`)
        ]);

        const tdData = await tdResponse.json();
        const fhData = await fhResponse.json();

        if (tdData.status === "error" && tdData.code === 429) {
          setError("הגעת למגבלת קצב הרענון. אנא המתן חצי דקה.");
          setIsLoading(false);
          return;
        }

        if (tdData.status === "ok") {
          // 1. קודם כל נשמור את המחיר העדכני ביותר (הוא הראשון ברשימה שהגיעה מה-API)
          const latestPrice = parseFloat(tdData.values[0].close);

          // 2. עכשיו נהפוך את הנתונים עבור הגרף
          const formattedChart = tdData.values.reverse().map((item) => {
            // ... (שאר הקוד של המפה נשאר אותו דבר)
            const dateObj = new Date(item.datetime);
            const label = timeframe === "1D"
              ? `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`
              : `${String(dateObj.getDate()).padStart(2, '0')}.${String(dateObj.getMonth() + 1).padStart(2, '0')}`;

            return {
              price: parseFloat(item.close),
              label: label
            };
          });

          setChartData(formattedChart);
          setCompanyInfo({
            price: latestPrice, // <--- עכשיו זה ישתמש במחיר העדכני ששמרנו בצד!
            marketCap: fhData.marketCapitalization || 0,
            sector: fhData.finnhubIndustry || "תעודת סל / אחר",
            volume: parseInt(tdData.values[0].volume) || 0,
            high: parseFloat(tdData.values[0].high) || 0,
            low: parseFloat(tdData.values[0].low) || 0
          });
        }
        else {
          setError("שגיאה במשיכת נתונים.");
        }
      } catch (err) {
        setError("שגיאת תקשורת.");
      }
      setIsLoading(false);
    };

    fetchHybridData();
  }, [selectedStock, timeframe, stockConfig.symbol]);

  const changePercentage = chartData.length >= 2
    ? (((chartData[chartData.length - 1].price - chartData[0].price) / chartData[0].price) * 100).toFixed(2)
    : 0;
  const isPositive = changePercentage >= 0;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 font-sans" dir="rtl">
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Zap size={24} className="text-blue-500" />
          <h1 className="text-2xl font-black text-white italic tracking-tighter">MARKET.CORE</h1>
        </div>
        <nav className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
          {Object.keys(STOCKS_CONFIG).map((stock) => (
            <button
              key={stock}
              onClick={() => setSelectedStock(stock)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedStock === stock ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              {stock}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl text-right">

          <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <p className="text-slate-400 text-[12px] font-black uppercase tracking-[0.2em] mb-1">
                {stockConfig.market} : {stockConfig.symbol}
              </p>
              <div className="flex items-baseline gap-3 flex-row-reverse">
                <h2 className="text-4xl font-mono font-bold text-white tracking-tighter">
                  {isLoading ? "---" : (companyInfo.price || 0).toFixed(2)}
                  <span className="text-lg mr-1 opacity-50">$</span>
                </h2>
                {!isLoading && chartData.length > 0 && (
                  <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span>{isPositive ? '+' : ''}{changePercentage}%</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex bg-black/40 p-1 rounded-lg border border-slate-800">
                {["1D", "1W", "1M", "3M", "1Y"].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-5 py-2 rounded-md text-[10px] font-black tracking-widest transition-all ${timeframe === tf ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"
                      }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 font-medium px-1">
                {TIMEFRAME_INFO[timeframe]}
              </p>
            </div>
          </div>

          <div className="h-[400px] w-full p-4 relative pl-8 pb-8">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="text-blue-500 animate-spin" size={40} /></div>
            ) : error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-rose-400 font-bold mb-2">אופס!</p>
                <p className="text-slate-400 text-sm max-w-xs">{error}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="label" stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} dy={10} minTickGap={40} />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toFixed(0)}`} width={50} orientation="right" dx={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="linear" dataKey="price" stroke={isPositive ? "#10b981" : "#f43f5e"} strokeWidth={3} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-black/40 grid grid-cols-2 md:grid-cols-4 border-t border-slate-800">
            {[
              { label: "מחזור מסחר", val: (companyInfo.volume || 0).toLocaleString(), icon: Activity },
              { label: "טווח יומי", val: `$${(companyInfo.low || 0).toFixed(2)} - $${(companyInfo.high || 0).toFixed(2)}`, icon: Clock },
              { label: "שווי שוק", val: companyInfo.marketCap > 1000 ? (companyInfo.marketCap / 1000).toFixed(2) + "B" : (companyInfo.marketCap || 0).toFixed(2) + "M", icon: BarChart3 },
              { label: "מגזר", val: companyInfo.sector || "N/A", icon: Globe },
            ].map((item, i) => (
              <div key={i} className={`p-6 flex items-center gap-5 ${i !== 0 ? "border-r border-slate-800/50" : ""}`}>
                {/* הגדלנו את האייקון ל-22 */}
                <div className="text-slate-500"><item.icon size={22} /></div>
                <div>
                  {/* הגדלנו את הפונט מ-text-[9px] ל-text-xs (12px) */}
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">{item.label}</p>
                  {/* הגדלנו את הפונט מ-text-sm (14px) ל-text-base (16px) ושינינו לצבע לבן בוהק */}
                  <p className="text-base font-mono font-bold text-white" dir="ltr">{item.val}</p>
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