#!/usr/bin/env python3
"""Copy docs/design/i18n/{en,uk}.json into the design prototypes.

The prototypes must work offline as single files, so they embed the
translations between `/* I18N:BEGIN */` and `/* I18N:END */`.
Edit the JSON files, then run:  python3 docs/design/sync-i18n.py
"""
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
LANGS = ("en", "uk")
TARGETS = [HERE / "notes-taker-design.html", HERE / "project" / "Main.dc.html"]
BLOCK = re.compile(r"(/\* I18N:BEGIN \*/\n).*?(\n/\* I18N:END \*/)", re.S)


def main() -> int:
    data = {lang: json.loads((HERE / "i18n" / f"{lang}.json").read_text("utf-8")) for lang in LANGS}
    payload = "var I18N = " + json.dumps(data, ensure_ascii=False, indent=2) + ";"
    for target in TARGETS:
        text = target.read_text("utf-8")
        new, count = BLOCK.subn(lambda m: m.group(1) + payload + m.group(2), text)
        if count != 1:
            print(f"{target.name}: expected one I18N block, found {count}", file=sys.stderr)
            return 1
        target.write_text(new, "utf-8")
        print(f"updated {target.relative_to(HERE)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
