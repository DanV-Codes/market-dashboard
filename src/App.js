import React, { useState, useMemo } from 'react';
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
  Zap
} from 'lucide-react';

// פונקציית עזר לייצור נתונים ברזולוציה גבוהה (סימולציה של שוק)
const generateData = (basePrice, volatility, points, trend = 1.0) => {
  let data = [];
  let currentPrice = basePrice;
  for (let i = 0; i < points; i++) {
    const change = currentPrice * (Math.random() - 0.48) * volatility; 
    currentPrice = (currentPrice + change) * trend;
    data.push({ 
      index: i, 
      price: parseFloat(currentPrice.toFixed(2)),
      label: points > 100 ? `P${i}` : `T${i}` 
    });
  }
  return data;
};

// הגדרות בסיס למניות
const STOCKS_CONFIG = {
  "S&P 500": { symbol: "SPX", base: 6531.25, currency: "USD", vol: "3.2B", market: "NYSE" },
  "תל אביב 125": { symbol: "TA125", base: 4243.03, currency: "ILS", vol: "840M", market: "TASE" },
  "Synopsys": { symbol: "SNPS", base: 425.88, currency: "USD", vol: "1.1M", market: "NASDAQ" }
};

export default function App() {
  const [selectedStock, setSelectedStock] = useState("S&P 500");
  const [timeframe, setTimeframe] = useState("1W");

  // יצירת סט הנתונים (מזכרון כדי למנוע ריצוד)
  const marketData = useMemo(() => {
    const resolutions = { "1D": 78, "1W": 65, "3M": 63, "1Y": 252 };
    const datasets = {};
    
    Object.keys(STOCKS_CONFIG).forEach(name => {
      const base = STOCKS_CONFIG[name].base;
      datasets[name] = {
        "1D": generateData(base * 0.995, 0.002, resolutions["1D"], 1.0001),
        "1W": generateData(base * 0.98, 0.004, resolutions["1W"], 1.0005),
        "3M": generateData(base * 0.92, 0.015, resolutions["3M"], 1.001),
        "1Y": generateData(base * 0.85, 0.025, resolutions["1Y"], 1.0008)
      };
    });
    return datasets;
  }, []);

  // חישוב דינמי של ביצועים לפי טווח הזמן שנבחר
  const calculateStats = (data) => {
    if (!data || data.length === 0) return { current: 0, change: 0, percent: 0, isPositive: true };
    const firstPrice = data[0].price;
    const lastPrice = data[data.length - 1].price;
    const change = lastPrice - firstPrice;
    const percent = (change / firstPrice) * 100;
    
    return {
      current: lastPrice,
      change: change,
      percent: percent,
      isPositive: change >= 0
    };
  };

  const stockConfig = STOCKS_CONFIG[selectedStock];
  const chartData = marketData[selectedStock][timeframe];
  const activeStats = calculateStats(chartData);
  const mainColor = activeStats.isPositive ? "#10b981" : "#ef4444";

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-md shadow-2xl backdrop-blur-md text-right font-sans" dir="rtl">
          <p className="text-slate-500 text-[10px] font-bold mb-1 tracking-widest uppercase">נקודת מחיר</p>
          <p className="text-white font-mono text-lg font-bold">
            {stockConfig.currency === "ILS" ? "₪" : "$"}{payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="w-full h-1 mt-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full" style={{ width: '60%', backgroundColor: mainColor }}></div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-10 font-sans selection:bg-blue-500/30" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* כותרת עליונה */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              <Zap size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white leading-none text-left">Market.Core</h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                <span className="flex items-center gap-1 text-emerald-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> 
                  מנוע חישוב נתונים פעיל
                </span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg">
               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">טווח זמן פעיל</p>
               <p className="text-xs font-mono font-bold text-blue-400">תצוגת {timeframe}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* רשימת מעקב */}
          <div className="lg:col-span-3 space-y-2 order-2 lg:order-1">
            <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 px-2 text-right">ביצועי רשימת מעקב</h2>
            {Object.entries(STOCKS_CONFIG).map(([name, config]) => {
              const itemStats = calculateStats(marketData[name][timeframe]);
              const isSelected = selectedStock === name;
              
              return (
                <button
                  key={name}
                  onClick={() => setSelectedStock(name)}
                  className={`w-full group relative overflow-hidden text-right p-4 rounded-xl transition-all border block ${
                    isSelected
                      ? "bg-slate-900 border-blue-600/50 shadow-lg"
                      : "bg-transparent border-slate-800/50 hover:bg-slate-900/30 hover:border-slate-700"
                  }`}
                >
                  {isSelected && <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                  <div className="flex justify-between items-center mb-1">
                    <div className={`flex items-center gap-1 text-[10px] font-bold ${itemStats.isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                      {itemStats.isPositive ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
                      {itemStats.isPositive ? "+" : ""}{itemStats.percent.toFixed(2)}%
                    </div>
                    <span className={`text-[10px] font-black tracking-tighter uppercase transition-colors ${isSelected ? "text-blue-400" : "text-slate-500 group-hover:text-blue-400"}`}>
                      {config.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-sm font-mono font-bold text-white">
                      {config.currency === "ILS" ? "₪" : "$"}{itemStats.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <h3 className="text-sm font-bold text-slate-200">{name}</h3>
                  </div>
                </button>
              );
            })}
          </div>

          {/* אזור הגרף המרכזי */}
          <div className="lg:col-span-9 order-1 lg:order-2">
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl backdrop-blur-sm">
              
              {/* כותרת גרף ונתונים דינמיים */}
              <div className="p-6 border-b border-slate-800/50 flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="w-full md:w-auto">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">{stockConfig.market}</span>
                    <span className="text-slate-700 font-bold">/</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{selectedStock}</span>
                  </div>
                  <div className="flex items-end gap-6">
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                      {stockConfig.symbol}
                    </h2>
                    <div className="mb-1 flex items-center gap-4">
                      <span className="text-2xl font-mono text-white font-bold">
                        {stockConfig.currency === "ILS" ? "₪" : "$"}{activeStats.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className={`text-sm font-bold flex items-center gap-1 ${activeStats.isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                        {activeStats.isPositive ? "▲" : "▼"} {Math.abs(activeStats.change).toFixed(2)} ({activeStats.percent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex bg-black/40 p-1 rounded-lg border border-slate-800 mr-auto lg:mr-0">
                  {["1D", "1W", "3M", "1Y"].map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-5 py-2 rounded-md text-[10px] font-black tracking-widest transition-all ${
                        timeframe === tf 
                          ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* גרף ליניארי ברזולוציה גבוהה */}
              <div className="h-[480px] w-full p-4 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 30, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={mainColor} stopOpacity={0.15}/>
                        <stop offset="100%" stopColor={mainColor} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="0" 
                      vertical={false} 
                      stroke="#1e293b" 
                      opacity={0.5}
                    />
                    <XAxis dataKey="index" hide={true} />
                    <YAxis 
                      hide={false}
                      orientation="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />
                    <Area 
                      type="linear" 
                      dataKey="price" 
                      stroke={mainColor} 
                      strokeWidth={1.5}
                      fillOpacity={1} 
                      fill="url(#chartGradient)" 
                      animationDuration={800}
                      dot={false}
                      activeDot={{ r: 4, fill: mainColor, stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                
                {/* תצוגת שיאים תקופתיים */}
                <div className="absolute right-10 bottom-10 flex gap-10 pointer-events-none text-right">
                   <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-1">שיא תקופתי</p>
                      <p className="text-xs font-mono font-bold text-white">
                        {stockConfig.currency === "ILS" ? "₪" : "$"}{Math.max(...chartData.map(d => d.price)).toFixed(2)}
                      </p>
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-1">שפל תקופתי</p>
                      <p className="text-xs font-mono font-bold text-white">
                        {stockConfig.currency === "ILS" ? "₪" : "$"}{Math.min(...chartData.map(d => d.price)).toFixed(2)}
                      </p>
                   </div>
                </div>
              </div>

              {/* נתונים טכניים תחתונים */}
              <div className="bg-black/40 grid grid-cols-2 md:grid-cols-4 border-t border-slate-800">
                {[
                  { label: "יחידות נפח", val: stockConfig.vol, icon: BarChart3 },
                  { label: "זרימת שוק", val: "רזולוציה גבוהה", icon: Activity },
                  { label: "בורסת מסחר", val: stockConfig.market, icon: Globe },
                  { label: "רזולוציה", val: timeframe === "1D" ? "5 דקות" : timeframe === "1W" ? "30 דקות" : "1 יום", icon: Clock },
                ].map((item, i) => (
                  <div key={i} className={`p-5 flex items-center gap-4 ${i !== 0 ? "border-r border-slate-800/50" : ""}`}>
                    <div className="text-slate-600">
                      <item.icon size={18} />
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] mb-0.5">{item.label}</p>
                      <p className="text-sm font-mono font-bold text-slate-200 uppercase">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}