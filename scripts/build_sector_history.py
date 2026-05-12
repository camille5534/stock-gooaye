#!/usr/bin/env python3
"""
build_sector_history.py
掃描 public/data/episodes/*.json，讀取每集的 sectors 陣列，
依族群名稱分組後輸出 public/data/sector_history.json。
"""

import json
import pathlib

ROOT = pathlib.Path(__file__).parent.parent
EPISODES_DIR = ROOT / "public" / "data" / "episodes"
OUT_FILE = ROOT / "public" / "data" / "sector_history.json"


def build():
    ep_files = sorted(EPISODES_DIR.glob("ep_*.json"))
    history: dict[str, list] = {}

    for ep_file in ep_files:
        with open(ep_file, encoding="utf-8") as f:
            ep = json.load(f)

        ep_num = ep["episode"]
        ep_date = ep["date"]
        sectors = ep.get("sectors", [])

        for sector in sectors:
            name = sector.get("name", "").strip()
            if not name:
                continue

            entry = {
                "ep": ep_num,
                "date": ep_date,
                "stance": sector.get("stance", "觀察"),
                "intensity": sector.get("intensity", 1),
                "quote": sector.get("quote", ""),
            }

            if name not in history:
                history[name] = []
            history[name].append(entry)

    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=2)

    total_entries = sum(len(v) for v in history.values())
    print(f"完成：{len(history)} 個族群，{total_entries} 筆記錄，存至 {OUT_FILE}")
    for name, entries in history.items():
        print(f"  {name}: {len(entries)} 筆，最新 EP{entries[-1]['ep']}")


if __name__ == "__main__":
    build()
