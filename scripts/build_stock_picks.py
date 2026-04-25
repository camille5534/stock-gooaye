#!/usr/bin/env python3
"""
build_stock_picks.py
以「股票」為群組，抓從第一次被提到到今天的完整日線，
產生 public/data/stock_picks.json。
Active = 最新 5 集內有提到；History = 最新 5 集都沒提到。
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
TODAY = datetime.date.today()


def to_ticker(code: str) -> str:
    return code + ".TW" if code.isdigit() else code


def fetch_daily_series_raw(ticker: str, ts1: int, ts2: int) -> list[dict]:
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


def fetch_daily_series(ticker: str, start_date: str) -> tuple[str, list[dict]]:
    """從 start_date 到今天的每日收盤。台股先試 .TW，失敗再試 .TWO（上櫃股）。
    回傳 (實際使用的 ticker, 序列)"""
    d_start = datetime.date.fromisoformat(start_date)
    ts1 = int(datetime.datetime(d_start.year, d_start.month, d_start.day).timestamp())
    ts2 = int(datetime.datetime(TODAY.year, TODAY.month, TODAY.day, 23, 59, 59).timestamp())

    tickers_to_try = [ticker]
    if ticker.endswith(".TW"):
        tickers_to_try.append(ticker[:-3] + ".TWO")  # 上櫃 fallback

    for t in tickers_to_try:
        try:
            series = fetch_daily_series_raw(t, ts1, ts2)
            if series:
                return t, series
        except Exception as e:
            print(f"    [warn] {t} 失敗: {e}", flush=True)

    return ticker, []


def find_closest_price(prices: list[dict], target_date: str) -> float | None:
    """找目標日期當天或之後最近一個交易日的收盤"""
    for p in prices:
        if p["date"] >= target_date:
            return p["close"]
    return None


def build():
    ep_files = sorted(EPISODES_DIR.glob("ep_*.json"))

    # 取得所有集數號碼，找出最新 5 集
    all_ep_nums = []
    for ep_file in ep_files:
        with open(ep_file, encoding="utf-8") as f:
            ep = json.load(f)
        all_ep_nums.append(ep["episode"])
    recent_5 = set(sorted(all_ep_nums)[-5:])

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
        actual_ticker, prices = fetch_daily_series(s["ticker"], first_date)
        s["ticker"] = actual_ticker  # 更新為實際有效的 ticker（可能是 .TWO）
        time.sleep(0.4)

        # 找每個 mention 當天（或最近交易日）的收盤
        for m in mentions:
            m["ep_price"] = find_closest_price(prices, m["date"])

        # 最新價
        current_price = prices[-1]["close"] if prices else None

        # 基準：最後一次提及的收盤（用 closest 確保不為 None）
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

        # Active = 最新 5 集內有提到
        is_active = any(m["episode"] in recent_5 for m in mentions)
        if is_active:
            active.append(entry)
        else:
            history.append(entry)

    active.sort(key=lambda x: x["last_mention_date"], reverse=True)
    history.sort(key=lambda x: x["last_mention_date"], reverse=True)

    output = {
        "generated_at": str(TODAY),
        "recent_episodes": sorted(recent_5),
        "active": active,
        "history": history,
    }

    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n完成：Active {len(active)} 支 (最新5集: EP{min(recent_5)}-EP{max(recent_5)})，History {len(history)} 支")


if __name__ == "__main__":
    build()
