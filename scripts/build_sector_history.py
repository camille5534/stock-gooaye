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

# 族群名稱標準化對應表：別名 → 標準名稱
NAME_ALIASES: dict[str, str] = {
    # CPU 系列
    "CPU缺貨族群":      "CPU/處理器",
    "CPU缺貨":          "CPU/處理器",
    "CPU/AI運算":       "CPU/處理器",
    # ASIC 系列
    "ASIC/客製化晶片":  "ASIC/設計服務",
    # AI 算力系列
    "AI/GPU":           "AI算力",
    "AI算力/Token":     "AI算力",
    "AI/雲端基礎設施":  "AI算力",
    # AI 軟體系列
    "AI SaaS/軟體應用": "AI軟體/SaaS",
    "AI軟體":           "AI軟體/SaaS",
    "軟體/SaaS":        "AI軟體/SaaS",
    # 半導體代工系列
    "半導體/代工":      "半導體代工",
    # 先進封裝系列
    "先進封裝/玻璃基板": "半導體/先進封裝",
}


def normalize(name: str) -> str:
    return NAME_ALIASES.get(name, name)


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
            raw_name = sector.get("name", "").strip()
            if not raw_name:
                continue

            name = normalize(raw_name)
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
    for name, entries in sorted(history.items()):
        print(f"  {name}: {len(entries)} 筆，EP{entries[0]['ep']}–EP{entries[-1]['ep']}")


if __name__ == "__main__":
    build()
