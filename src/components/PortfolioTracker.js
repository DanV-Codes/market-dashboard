import React from 'react';

// ה"מסד נתונים" שלך - ממש קל לערוך ולהוסיף מניות חדשות!
const myPortfolio = [
  { symbol: "SNPS", buyDate: "2023-11-01", buyPrice: 480.50, quantity: 10 },
  { symbol: "AAPL", buyDate: "2024-01-15", buyPrice: 185.20, quantity: 5 }
];

const PortfolioTracker = () => {
  return (
    <div className="p-6 bg-slate-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-indigo-400">התיק האישי שלי</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-700 bg-slate-800">
            <tr>
              <th className="p-3">סימול</th>
              <th className="p-3">תאריך רכישה</th>
              <th className="p-3">מחיר קנייה ($)</th>
              <th className="p-3">כמות</th>
            </tr>
          </thead>
          <tbody>
            {myPortfolio.map((item, index) => (
              <tr key={index} className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="p-3 font-bold text-white">{item.symbol}</td>
                <td className="p-3 text-slate-400">{item.buyDate}</td>
                <td className="p-3 text-slate-300">{item.buyPrice}</td>
                <td className="p-3 text-slate-300">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioTracker;