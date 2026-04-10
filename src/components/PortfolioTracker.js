import React from 'react';
// 1. ייבוא ספריות הגרפים
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const myPortfolio = [
  { symbol: "SNPS", buyDate: "2023-11-01", buyPrice: 480.50, quantity: 10 },
  { symbol: "AAPL", buyDate: "2024-01-15", buyPrice: 185.20, quantity: 5 },
  { symbol: "TSLA", buyDate: "2024-02-10", buyPrice: 205.00, quantity: 8 }
];

const currentMarketPrices = {
  "SNPS": 510.20,
  "AAPL": 175.50,
  "TSLA": 215.30
};

// צבעים לפרוסות העוגה (השתמשתי בצבעים שמשתלבים עם פלטת ה-Tailwind שלנו)
const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6'];

const PortfolioTracker = () => {
  const formatCurrency = (value) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const totalCost = myPortfolio.reduce((sum, item) => sum + (item.buyPrice * item.quantity), 0);
  const totalValue = myPortfolio.reduce((sum, item) => sum + (currentMarketPrices[item.symbol] * item.quantity), 0);
  const totalProfitNominal = totalValue - totalCost;
  const totalProfitPercent = (totalProfitNominal / totalCost) * 100;
  const isTotalPositive = totalProfitNominal >= 0;

  // 2. הכנת הנתונים לגרף: מחשבים את שווי הפרוסה של כל מניה
  const pieData = myPortfolio.map((item) => ({
    name: item.symbol,
    value: currentMarketPrices[item.symbol] * item.quantity,
  }));

  return (
    <div className="space-y-6">
      {/* אזור כרטיסי הסיכום */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-slate-900 rounded-lg shadow-lg border border-slate-800">
          <h3 className="text-slate-400 text-sm font-medium mb-1">שווי התיק הנוכחי</h3>
          <p className="text-3xl font-black text-white">{formatCurrency(totalValue)}</p>
        </div>
        <div className="p-6 bg-slate-900 rounded-lg shadow-lg border border-slate-800">
          <h3 className="text-slate-400 text-sm font-medium mb-1">עלות רכישה כוללת</h3>
          <p className="text-2xl font-bold text-slate-300">{formatCurrency(totalCost)}</p>
        </div>
        <div className="p-6 bg-slate-900 rounded-lg shadow-lg border border-slate-800">
          <h3 className="text-slate-400 text-sm font-medium mb-1">תשואה כוללת</h3>
          <p className={`text-2xl font-bold flex items-center gap-2 ${isTotalPositive ? 'text-green-500' : 'text-rose-500'}`}>
            {isTotalPositive ? '▲' : '▼'} 
            {formatCurrency(Math.abs(totalProfitNominal))} ({Math.abs(totalProfitPercent).toFixed(2)}%)
          </p>
        </div>
      </div>

      {/* אזור תוכן מרכזי: חלוקה ל-2 עמודות במסכים גדולים */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* הגרף תופס עמודה 1 */}
        <div className="p-6 bg-slate-900 rounded-lg shadow-lg border border-slate-800 lg:col-span-1">
          <h2 className="text-xl font-bold mb-4 text-indigo-400">התפלגות התיק</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60} /* זה יוצר חור באמצע - Donut Chart */
                  outerRadius={90} /* הגדלנו את הרדיוס כדי שהגרף יהיה גדול יותר */
                  paddingAngle={5} /* רווח קטן בין הפרוסות שייראה יוקרתי */
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                {/* חלון צף כשמרחפים עם העכבר */}
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                {/* המקרא שלנו - הגדרנו לו להיות אנכי ובצד */}
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '15px', color: '#cbd5e1' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* הטבלה תופסת 2 עמודות */}
        <div className="p-6 bg-slate-900 rounded-lg shadow-lg border border-slate-800 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 text-indigo-400">פירוט פוזיציות</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-700 bg-slate-800 text-slate-300">
                <tr>
                  <th className="p-4 font-semibold rounded-tr-lg">סימול</th>
                  <th className="p-4 font-semibold">מחיר קנייה</th>
                  <th className="p-4 font-semibold">מחיר נוכחי</th>
                  <th className="p-4 font-semibold text-center rounded-tl-lg">תשואה (%)</th>
                </tr>
              </thead>
              <tbody>
                {myPortfolio.map((item, index) => {
                  const currentPrice = currentMarketPrices[item.symbol];
                  const profitPercent = ((currentPrice - item.buyPrice) / item.buyPrice) * 100;
                  const isPositive = profitPercent >= 0;

                  return (
                    <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/80 transition-colors">
                      <td className="p-4 font-bold text-white">{item.symbol}</td>
                      <td className="p-4 text-slate-300">{formatCurrency(item.buyPrice)}</td>
                      <td className="p-4 text-slate-300">{formatCurrency(currentPrice)}</td>
                      <td className={`p-4 font-bold flex items-center justify-center gap-1 ${isPositive ? 'text-green-500' : 'text-rose-500'}`}>
                        {isPositive ? '▲' : '▼'} {Math.abs(profitPercent).toFixed(2)}%
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