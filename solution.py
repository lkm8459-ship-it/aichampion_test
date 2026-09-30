"""2026 디지털혁신 백서 키워드 CSV 추출 도구.

사용법:
    python solution.py "사업"

동작:
    장데이터.json의 '본문'에 키워드가 포함된 장만
    결과_<키워드>.csv 파일로 저장합니다.
"""

import csv
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA = HERE / "장데이터.json"


def safe_filename(text: str) -> str:
    """Windows 등에서 파일명으로 사용할 수 없는 문자를 간단히 치환합니다."""
    invalid = '<>:"/\\|?*'
    cleaned = "".join("_" if ch in invalid else ch for ch in text).strip()
    return cleaned or "검색결과"


def main() -> None:
    if len(sys.argv) != 2 or not sys.argv[1].strip():
        print('사용법: python solution.py "키워드"')
        sys.exit(1)

    keyword = sys.argv[1].strip()

    try:
        chapters = json.loads(DATA.read_text(encoding="utf-8"))
    except FileNotFoundError:
        print(f"[ERROR] {DATA.name} 파일을 찾을 수 없습니다.")
        sys.exit(1)
    except json.JSONDecodeError as exc:
        print(f"[ERROR] JSON 형식 오류: {exc}")
        sys.exit(1)

    filtered = [
        chapter
        for chapter in chapters
        if keyword in str(chapter.get("본문", ""))
    ]

    out = HERE / f"결과_{safe_filename(keyword)}.csv"

    # starter.py와 동일하게 Excel에서도 한글이 안정적으로 보이도록 UTF-8-SIG 사용
    with out.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["장", "제목", "본문"])
        for chapter in filtered:
            writer.writerow([
                chapter.get("장", ""),
                chapter.get("제목", ""),
                chapter.get("본문", ""),
            ])

    print(f"[OK] {len(filtered)}건 저장 → {out.name}")


if __name__ == "__main__":
    main()
