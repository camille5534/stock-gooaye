#!/usr/bin/env python3
"""
build_predictions.py
讀取 public/data/episodes/*.json，查 Yahoo Finance 次日收盤，
產生 public/data/predictions.json。
"""

import json
import time
import datetime
import pathlib
import urllib.request
import urllib.error

ROOT = pathlib.Path(__file__).parent.parent
EPISODES_DIR = ROOT / "public" / "data" / "episodes"
OUT_FILE = ROOT / "public" / "data" / "predictions.json"

SKIP_STANCES = {"觀察", "中立", "neutral", "observe"}


def to_ticker(code: str) -> str:
    if code.isdigit():
        return code + ".TW"
    return code


def fetch_close(ticker: str, date_str: str) -> tuple[float | None, str | None]:
    """回傳 (收盤價, 實際日期)，找不到回傳 (None, None)"""
    try:
        d = datetime.date.fromisoformat(date_str)
    except ValueError:
        return None, None

    # 往前抓 5 天，確保能抓到當日或最近交易日
    ts1 = int(datetime.datetime(d.year, d.month, d.day).timestamp())
    ts2 = int((datetime.datetime(d.year, d.month, d.day) + datetime.timedelta(days=5)).timestamp())

    url = (
        f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
        f"?interval=1d&period1={ts1}&period2={ts2}"
    )
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
        result = data["chart"]["result"][0]
        timestamps = result["timestamp"]
        closes = result["indicators"]["quote"][0]["close"]
        # 找 >= date_str 的第一筆
        for ts, close in zip(timestamps, closes):
            day = datetime.datetime.utcfromtimestamp(ts).date()
            if str(day) >= date_str and close is not None:
                return round(close, 2), str(day)
    except Exception:
        pass
    return None, None


def next_trading_date(date_str: str) -> str:
    d = datetime.date.fromisoformat(date_str) + datetime.timedelta(days=1)
    return str(d)


def build():
    ep_files = sorted(EPISODES_DIR.glob("ep_*.json"))
    picks = []

    for ep_file in ep_files:
        with open(ep_file, encoding="utf-8") as f:
            ep = json.load(f)

        ep_num = ep["episode"]
        ep_date = ep["date"]
        stocks = ep.get("stocks", [])

        for stock in stocks:
            stance = stock.get("stance", "")
            stance_score = stock.get("stance_score", 0)
            if stance in SKIP_STANCES or stance_score == 0:
                continue

            code = stock["code"]
            ticker = to_ticker(code)
            quote = stock.get("quote", "")
            name = stock.get("name", code)

            print(f"  EP{ep_num} {code} ({ticker}) {stance} ...", flush=True)

            ep_price, ep_date_actual = fetch_close(ticker, ep_date)
            time.sleep(0.3)

            if ep_date_actual:
                next_date = next_trading_date(ep_date_actual)
                next_price, next_day = fetch_close(ticker, next_date)
                time.sleep(0.3)
            else:
                next_price, next_day = None, None

            if ep_price and next_price:
                ret = round((next_price - ep_price) / ep_price * 100, 2)
                if stance_score > 0:
                    correct = ret > 0
                else:
                    correct = ret < 0
                status = "hit" if correct else "miss"
            elif ep_price is None and next_price is None:
                ret, correct, status = None, None, "no_data"
            else:
                ret, correct, status = None, None, "pending"

            picks.append({
                "episode": ep_num,
                "date": ep_date,
                "code": code,
                "name": name,
                "stance": stance,
                "stance_score": stance_score,
                "quote": quote,
                "ticker": ticker,
                "ep_date_actual": ep_date_actual,
                "ep_price": ep_price,
                "next_day": next_day,
                "next_price": next_price,
                "return_pct": ret,
                "correct": correct,
                "status": status,
            })

    # 統計
    valid = [p for p in picks if p["status"] in ("hit", "miss")]
    hits = [p for p in valid if p["status"] == "hit"]
    misses = [p for p in valid if p["status"] == "miss"]
    pending = [p for p in picks if p["status"] == "pending"]
    win_rate = round(len(hits) / len(valid) * 100) if valid else 0

    output = {
        "generated_at": str(datetime.date.today()),
        "stats": {
            "total": len(picks),
            "valid": len(valid),
            "hits": len(hits),
            "misses": len(misses),
            "pending": len(pending),
            "win_rate": win_rate,
        },
        "picks": picks,
    }

    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n完成：{len(picks)} 筆，勝率 {win_rate}%，存至 {OUT_FILE}")


if __name__ == "__main__":
    build()
