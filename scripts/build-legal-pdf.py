#!/usr/bin/env python3
"""Build the WorldCup26 legal PDF from its Markdown source.

This regenerates legal/WorldCup26-Terms-Privacy-and-Game-Rules.pdf from the
matching Markdown file. Run it after editing the Markdown (for example, after
filling in the operator's registration details) so the PDF stays in sync.

Requirements (PyMuPDF-based, no system libraries needed):

    pip install markdown-pdf

Usage:

    python3 scripts/build-legal-pdf.py
"""

from __future__ import annotations

import pathlib

from markdown_pdf import MarkdownPdf, Section

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = REPO_ROOT / "legal" / "WorldCup26-Terms-Privacy-and-Game-Rules.md"
OUT = REPO_ROOT / "legal" / "WorldCup26-Terms-Privacy-and-Game-Rules.pdf"

CSS = """
* { font-family: "Helvetica", "Arial", sans-serif; }
body { font-size: 10.5pt; line-height: 1.45; color: #1a1a1a; }
h1 { font-size: 20pt; color: #0b1f3a; margin-bottom: 4pt; }
h2 { font-size: 14.5pt; color: #0b1f3a; margin-top: 16pt; margin-bottom: 4pt; border-bottom: 1px solid #c7d0dc; padding-bottom: 2pt; }
h3 { font-size: 12pt; color: #14406e; margin-top: 11pt; margin-bottom: 3pt; }
p { margin-top: 4pt; margin-bottom: 4pt; }
u { text-decoration: underline; }
strong { color: #0b1f3a; }
table { width: 100%; border-collapse: collapse; margin-top: 6pt; margin-bottom: 8pt; }
th { background-color: #0b1f3a; color: #ffffff; text-align: left; padding: 5pt 7pt; font-size: 9.5pt; border: 1px solid #0b1f3a; }
td { padding: 4pt 7pt; font-size: 9.5pt; border: 1px solid #c7d0dc; }
tr:nth-child(even) td { background-color: #f2f5f9; }
code { font-family: "Courier", monospace; font-size: 9pt; background-color: #eef1f5; }
pre { background-color: #f4f6f9; padding: 7pt; font-size: 9pt; border: 1px solid #d8dee8; }
pre code { background-color: #f4f6f9; }
blockquote { background-color: #f4f7fb; border-left: 3px solid #14406e; padding: 5pt 10pt; color: #2a2a2a; }
hr { border: 0; border-top: 1px solid #c7d0dc; margin: 12pt 0; }
a { color: #14406e; }
"""


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    pdf = MarkdownPdf(toc_level=2, optimize=True)
    pdf.add_section(Section(text, toc=True, root=str(SRC.parent), paper_size="A4"), user_css=CSS)
    pdf.meta["title"] = "WorldCup26 — Game Rules, Terms & Conditions, and Privacy Policy"
    pdf.meta["author"] = "WorldCup26"
    pdf.meta["subject"] = "Operator Policy Pack prepared for Revolut onboarding review"
    pdf.meta["keywords"] = "WorldCup26, fantasy game of skill, terms, privacy, rules, subscription"
    pdf.save(OUT)
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
