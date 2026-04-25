#!/usr/bin/env python3
"""
build_predictions.py
讀取 public/data/episodes/*.json，查 Yahoo Finance 三個時間點收盤，
產生 public/data/predictions.json。
時間點：D+1（次日）、D+7（一週後）、D+14（兩週後）
"""

import json
import time
import datetime
import pathlib
import urllib.request

ROOT = pathlib.Path(__file__).parent.parent
EPISODES_DIR = ROOT / "public" / "data" / "episodes"
OUT_FILE = ROOT / "public" / "data" / "predictions.json"

SKIP_STANCES = {"觀察", "中立", "neutral", "observe"}


def to_ticker(code: str) -> str:
    if code.isdigit():
        return code + ".TW"
    return code


def fetch_close(ticker: str, date_str: str) -> tuple[float | None, str | None]:
    """回傳 (收盤價, 實際交易日)，查不到回傳 (None, None)"""
    try:
        d = datetime.date.fromisoformat(date_str)
    except ValueError:
        return None, None

    # 未來日期直接跳過（還沒發生）
    if d > datetime.date.today():
        return None, None

    ts1 = int(datetime.datetime(d.year, d.month, d.day).timestamp())
    ts2 = int((datetime.datetime(d.year, d.month, d.day) + datetime.timedelta(days=6)).timestamp())

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
        for ts, close in zip(timestamps, closes):
            day = datetime.datetime.utcfromtimestamp(ts).date()
            if str(day) >= date_str and close is not None:
                return round(close, 2), str(day)
    except Exception:
        pass
    return None, None


def pct(base: float | None, target: float | None) -> float | None:
    if base and target:
        return round((target - base) / base * 100, 2)
    return None


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

            print(f"  EP{ep_num} {code} ...", flush=True)

            ep_price, ep_date_actual = fetch_close(ticker, ep_date)
            time.sleep(0.3)

            if ep_date_actual:
                d1_target = str(datetime.date.fromisoformat(ep_date_actual) + datetime.timedelta(days=1))
                d7_target = str(datetime.date.fromisoformat(ep_date_actual) + datetime.timedelta(days=7))
                d14_target = str(datetime.date.fromisoformat(ep_date_actual) + datetime.timedelta(days=14))

                d1_price, d1_date = fetch_close(ticker, d1_target); time.sleep(0.3)
                d7_price, d7_date = fetch_close(ticker, d7_target); time.sleep(0.3)
                d14_price, d14_date = fetch_close(ticker, d14_target); time.sleep(0.3)
            else:
                d1_price = d1_date = None
                d7_price = d7_date = None
                d14_price = d14_date = None

            d1_pct = pct(ep_price, d1_price)
            d7_pct = pct(ep_price, d7_price)
            d14_pct = pct(ep_price, d14_price)

            # 勝率判斷以 D+1 為準
            if ep_price and d1_price:
                correct = (d1_pct > 0) if stance_score > 0 else (d1_pct < 0)
                status = "hit" if correct else "miss"
            elif ep_price is None:
                correct, status = None, "no_data"
            else:
                correct, status = None, "pending"

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
                "d1_date": d1_date,
                "d1_price": d1_price,
                "d1_pct": d1_pct,
                "d7_date": d7_date,
                "d7_price": d7_price,
                "d7_pct": d7_pct,
                "d14_date": d14_date,
                "d14_price": d14_price,
                "d14_pct": d14_pct,
                "correct": correct,
                "status": status,
            })

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
