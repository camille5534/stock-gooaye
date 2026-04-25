#!/usr/bin/env python3
"""
build_stock_picks.py
以「股票」為群組，抓從第一次被提到到今天的完整日線，
產生 public/data/stock_picks.json。
Active = 最近 7 天內有提到；History = 超過 7 天。
"""

import json
import time
import datetime
import pathlib
import urllib.request

ROOT = pathlib.Path(__file__).parent.parent
EPISODES_DIR = ROOT / "public" / "data" / "episodes"
OUT_FILE = ROOT / "public" / "data" / "stock_picks.json"

SKIP_STANCES = {"觀察", "中立", "neutral", "observe"}
ACTIVE_DAYS = 7
TODAY = datetime.date.today()


def to_ticker(code: str) -> str:
    return code + ".TW" if code.isdigit() else code


def fetch_daily_series(ticker: str, start_date: str) -> list[dict]:
    """從 start_date 到今天的每日收盤序列"""
    try:
        d_start = datetime.date.fromisoformat(start_date)
        ts1 = int(datetime.datetime(d_start.year, d_start.month, d_start.day).timestamp())
        ts2 = int(datetime.datetime(TODAY.year, TODAY.month, TODAY.day, 23, 59, 59).timestamp())

        url = (
            f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
            f"?interval=1d&period1={ts1}&period2={ts2}"
        )
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())

        result = data["chart"]["result"][0]
        timestamps = result["timestamp"]
        closes = result["indicators"]["quote"][0]["close"]

        series = []
        for ts, close in zip(timestamps, closes):
            if close is not None:
                day = datetime.datetime.utcfromtimestamp(ts).date()
                series.append({"date": str(day), "close": round(close, 2)})
        return series
    except Exception as e:
        print(f"    [warn] {ticker} 日線失敗: {e}", flush=True)
        return []


def build():
    ep_files = sorted(EPISODES_DIR.glob("ep_*.json"))

    # 收集所有提及（以 code 為 key）
    stocks: dict[str, dict] = {}

    for ep_file in ep_files:
        with open(ep_file, encoding="utf-8") as f:
            ep = json.load(f)

        ep_num = ep["episode"]
        ep_date = ep["date"]

        for stock in ep.get("stocks", []):
            stance = stock.get("stance", "")
            stance_score = stock.get("stance_score", 0)
            if stance in SKIP_STANCES or stance_score == 0:
                continue

            code = stock["code"]
            ticker = to_ticker(code)
            name = stock.get("name", code)

            if code not in stocks:
                stocks[code] = {
                    "code": code,
                    "name": name,
                    "ticker": ticker,
                    "mentions": [],
                }

            stocks[code]["mentions"].append({
                "episode": ep_num,
                "date": ep_date,
                "stance": stance,
                "stance_score": stance_score,
                "quote": stock.get("quote", ""),
            })

    # 對每支股票抓日線 + 計算統計
    active = []
    history = []

    for code, s in stocks.items():
        mentions = sorted(s["mentions"], key=lambda m: m["date"])
        first_date = mentions[0]["date"]
        last_date = mentions[-1]["date"]

        print(f"  {code} ({s['ticker']}) 從 {first_date} ...", flush=True)
        prices = fetch_daily_series(s["ticker"], first_date)
        time.sleep(0.4)

        # 找每個 mention 當天的收盤
        price_map = {p["date"]: p["close"] for p in prices}
        for m in mentions:
            m["ep_price"] = price_map.get(m["date"])

        # 最新價 & 相對最後一次提及的漲跌
        current_price = prices[-1]["close"] if prices else None
        last_ep_price = mentions[-1].get("ep_price")
        current_pct = (
            round((current_price - last_ep_price) / last_ep_price * 100, 2)
            if current_price and last_ep_price else None
        )

        entry = {
            **s,
            "mentions": mentions,
            "prices": prices,
            "last_mention_date": last_date,
            "last_ep_price": last_ep_price,
            "current_price": current_price,
            "current_pct": current_pct,
        }

        days_since = (TODAY - datetime.date.fromisoformat(last_date)).days
        if days_since <= ACTIVE_DAYS:
            active.append(entry)
        else:
            history.append(entry)

    # Active 照最後提及日期由新到舊；History 同
    active.sort(key=lambda x: x["last_mention_date"], reverse=True)
    history.sort(key=lambda x: x["last_mention_date"], reverse=True)

    output = {
        "generated_at": str(TODAY),
        "active": active,
        "history": history,
    }

    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n完成：Active {len(active)} 支，History {len(history)} 支")


if __name__ == "__main__":
    build()
