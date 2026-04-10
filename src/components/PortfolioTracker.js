import React from 'react';

// מסד הנתונים האישי שלך
const myPortfolio = [
  { symbol: "SNPS", buyDate: "2023-11-01", buyPrice: 480.50, quantity: 10 },
  { symbol: "AAPL", buyDate: "2024-01-15", buyPrice: 185.20, quantity: 5 },
  { symbol: "TSLA", buyDate: "2024-02-10", buyPrice: 205.00, quantity: 8 } // הוספתי עוד מניה בשביל הדוגמה
];

// סימולציה של מחירי הבורסה נכון לרגע זה (Market Data)
const currentMarketPrices = {
  "SNPS": 510.20,
  "AAPL": 175.50,
  "TSLA": 215.30
};

const PortfolioTracker = () => {
  return (
    <div className="p-6 bg-slate-900 rounded-lg shadow-lg border border-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-indigo-400">התיק האישי שלי</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-700 bg-slate-800 text-slate-300">
            <tr>
              <th className="p-4 font-semibold rounded-tr-lg">סימול</th>
              <th className="p-4 font-semibold">תאריך רכישה</th>
              <th className="p-4 font-semibold">מחיר קנייה</th>
              <th className="p-4 font-semibold">מחיר נוכחי</th>
              <th className="p-4 font-semibold rounded-tl-lg text-center">תשואה (%)</th>
            </tr>
          </thead>
          <tbody>
            {myPortfolio.map((item, index) => {
              // שליפת המחיר העדכני של המניה מהסימולציה שלנו
              const currentPrice = currentMarketPrices[item.symbol];
              
              // חישוב התשואה: (נוכחי - קנייה) חלקי קנייה כפול 100
              const profitPercent = ((currentPrice - item.buyPrice) / item.buyPrice) * 100;
              
              // האם אנחנו ברווח? (גדול או שווה לאפס)
              const isPositive = profitPercent >= 0;

              return (
                <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/80 transition-colors">
                  <td className="p-4 font-bold text-white">{item.symbol}</td>
                  <td className="p-4 text-slate-400">{item.buyDate}</td>
                  <td className="p-4 text-slate-300">${item.buyPrice.toFixed(2)}</td>
                  <td className="p-4 text-slate-300">${currentPrice.toFixed(2)}</td>
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
  );
};

export default PortfolioTracker;