from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf

# יצירת אפליקציית השרת
app = FastAPI()

# הגדרת CORS - מאפשר ל-React (צד לקוח) לתקשר עם השרת (צד שרת)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Market.Core Server is LIVE 🚀"}

# נתיב לקבלת מחיר עדכני ופרטי מניה בסיסיים
@app.get("/api/stock/{ticker}")
def get_stock_data(ticker: str):
    try:
        stock = yf.Ticker(ticker)
        # אנחנו מושכים נתונים ברזולוציה של 15 דקות כדי לקבל שעה מדויקת (לא 00:00)
        hist = stock.history(period="5d", interval="15m")
        
        # אם אין נתונים תוך-יומיים, ננסה רזולוציה יומית
        if hist.empty:
            hist = stock.history(period="5d")
            
        if hist.empty:
            return {"error": "Ticker not found"}
        
        current_price = hist['Close'].iloc[-1]
        
        # שליפת אזור הזמן של הבורסה (למשל EST, IDT)
        tz_string = hist.index[-1].strftime('%Z')
        if not tz_string:
            tz_string = "Local"
            
        # עיצוב חותמת הזמן כולל אזור הזמן
        last_date = hist.index[-1].strftime(f'%d/%m/%Y %H:%M {tz_string}')
        
        return {
            "symbol": ticker, 
            "price": round(current_price, 2), 
            "date": last_date
        }
    except Exception as e:
        return {"error": str(e)}

# נתיב לקבלת היסטוריית מחירים עבור הגרף
@app.get("/api/stock/{ticker}/history")
def get_stock_history(ticker: str, period: str = "1y"):
    try:
        stock = yf.Ticker(ticker)
        
        # מיפוי תקופות הזמן מה-Frontend לפורמט של yfinance
        yf_period = period
        interval = "1d"
        
        if period == "1d":
            yf_period = "1d"
            interval = "15m"
        elif period == "5d":
            yf_period = "5d"
            interval = "1h"
        elif period == "1m":
            yf_period = "1mo"
            interval = "1d"
        elif period == "1y":
            yf_period = "1y"
            interval = "1d"
        elif period == "max":
            yf_period = "max"
            interval = "1mo" # רזולוציה חודשית לתקופות ארוכות מאוד
            
        hist = stock.history(period=yf_period, interval=interval)
        
        if hist.empty:
            return {"error": "No history found"}
            
        chart_data = []
        for index, row in hist.iterrows():
            # עיצוב התוויות על ציר ה-X לפי תקופת הזמן שנבחרה
            if period == "1d":
                time_label = index.strftime('%H:%M') # רק שעה בגרף יומי
            elif period == "5d":
                time_label = index.strftime('%d/%m') # רק יום וחודש בגרף שבועי
            elif period == "max":
                time_label = index.strftime('%m/%Y') # חודש ושנה בגרף מקסימלי
            else:
                time_label = index.strftime('%d/%m/%Y')
            
            chart_data.append({
                "time": time_label,
                "price": round(row['Close'], 2)
            })
            
        return chart_data
    except Exception as e:
        return {"error": str(e)}