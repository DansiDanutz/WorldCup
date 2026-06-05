#!/usr/bin/env python3
"""Build the WorldCup26 legal PDF from its Markdown source.

Renders legal/WorldCup26-Terms-Privacy-and-Game-Rules.pdf from the matching
Markdown file as a professionally typeset document: a branded cover page, a
table of contents with page numbers, running headers/footers with page
numbering, and refined typography suitable for a bank / payment onboarding
review.

Requirements:

    pip install markdown-it-py weasyprint

Usage:

    python3 scripts/build-legal-pdf.py
"""

from __future__ import annotations

import pathlib
import re

from markdown_it import MarkdownIt
from weasyprint import HTML

REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = REPO_ROOT / "legal" / "WorldCup26-Terms-Privacy-and-Game-Rules.md"
OUT = REPO_ROOT / "legal" / "WorldCup26-Terms-Privacy-and-Game-Rules.pdf"

# --- Cover metadata -------------------------------------------------------
OPERATOR = "Stack Finance LLC"
JURISDICTION = "Poland"
WEBSITE = "worldcup26.world"
VERSION = "1.0"
EFFECTIVE = "4 June 2026"
PREPARED = "5 June 2026"

# --- Styling --------------------------------------------------------------
CSS = """
@page {
  size: A4;
  margin: 24mm 17mm 20mm 17mm;
  @top-left {
    content: "WorldCup26 — Terms, Privacy & Game Rules";
    font-family: "Liberation Sans", Arial, sans-serif;
    font-size: 7.5pt; color: #6b7785; vertical-align: bottom; padding-bottom: 3mm;
  }
  @top-right {
    content: "Stack Finance LLC";
    font-family: "Liberation Sans", Arial, sans-serif;
    font-size: 7.5pt; color: #6b7785; vertical-align: bottom; padding-bottom: 3mm;
  }
  @bottom-left {
    content: "Confidential — Prepared for Revolut";
    font-family: "Liberation Sans", Arial, sans-serif;
    font-size: 7.5pt; color: #6b7785; vertical-align: top; padding-top: 3mm;
  }
  @bottom-center {
    content: "Effective 4 June 2026 · v1.0";
    font-family: "Liberation Sans", Arial, sans-serif;
    font-size: 7.5pt; color: #6b7785; vertical-align: top; padding-top: 3mm;
  }
  @bottom-right {
    content: "Page " counter(page) " of " counter(pages);
    font-family: "Liberation Sans", Arial, sans-serif;
    font-size: 7.5pt; color: #6b7785; vertical-align: top; padding-top: 3mm;
  }
}
@page :first {
  margin: 0;
  @top-left { content: none; }
  @top-right { content: none; }
  @bottom-left { content: none; }
  @bottom-center { content: none; }
  @bottom-right { content: none; }
}

html { font-size: 10.5pt; }
body {
  font-family: "Liberation Serif", "Georgia", serif;
  color: #1f2933; line-height: 1.5; margin: 0;
}

/* ---- Cover ---- */
.cover { position: relative; height: 297mm; width: 210mm; box-sizing: border-box; page-break-after: always; }
.cover-top { background: #0b2a4a; height: 46mm; padding: 14mm 20mm 0 20mm; box-sizing: border-box; }
.cover-brand { font-family: "Liberation Sans", Arial, sans-serif; color: #ffffff; font-size: 16pt; font-weight: bold; letter-spacing: 3px; }
.cover-brand-sub { font-family: "Liberation Sans", Arial, sans-serif; color: #9fc0e0; font-size: 8.5pt; letter-spacing: 2px; margin-top: 2mm; }
.cover-rule { height: 2.4mm; background: #c9a227; }
.cover-center { padding: 34mm 20mm 0 20mm; }
.cover-eyebrow { font-family: "Liberation Sans", Arial, sans-serif; color: #c9a227; font-size: 10pt; font-weight: bold; letter-spacing: 5px; }
.cover-title { font-family: "Liberation Sans", Arial, sans-serif; color: #0b2a4a; font-size: 46pt; font-weight: bold; margin: 4mm 0 0 0; letter-spacing: -1px; }
.cover-sub { font-family: "Liberation Sans", Arial, sans-serif; color: #33485f; font-size: 15pt; margin-top: 3mm; }
.cover-tag {
  display: inline-block; margin-top: 9mm; padding: 3mm 6mm;
  background: #eef3f9; border-left: 3px solid #0b2a4a;
  font-family: "Liberation Sans", Arial, sans-serif; font-size: 10.5pt; color: #0b2a4a;
}
.cover-info { margin-top: 12mm; border-collapse: collapse; width: 120mm; font-family: "Liberation Sans", Arial, sans-serif; }
.cover-info td { padding: 2.1mm 0; font-size: 10pt; vertical-align: top; }
.cover-info td.k { color: #6b7785; width: 46mm; }
.cover-info td.v { color: #0b2a4a; font-weight: bold; }
.cover-bottom {
  position: absolute; bottom: 0; left: 0; right: 0; height: 18mm;
  background: #0b2a4a; color: #ffffff;
  font-family: "Liberation Sans", Arial, sans-serif; font-size: 9pt; letter-spacing: 1px;
}
.cover-bottom .cb-inner { padding: 6mm 20mm 0 20mm; }
.cover-bottom .cb-left { float: left; letter-spacing: 3px; }
.cover-bottom .cb-right { float: right; color: #9fc0e0; }

/* ---- Table of contents ---- */
.toc { page-break-after: always; }
.toc h2 { border: none; margin-bottom: 6mm; }
.toc ol { list-style: none; padding: 0; margin: 0; }
.toc li { margin: 0 0 2.6mm 0; font-family: "Liberation Sans", Arial, sans-serif; font-size: 10.5pt; }
.toc a { color: #1f2933; text-decoration: none; }
.toc a::after { content: leader(". ") target-counter(attr(href), page); color: #6b7785; }

/* ---- Body typography ---- */
h1, h2, h3, h4 { font-family: "Liberation Sans", Arial, sans-serif; color: #0b2a4a; }
h2 {
  font-size: 15pt; margin: 9mm 0 3mm 0; padding-bottom: 1.6mm;
  border-bottom: 2px solid #0b2a4a; page-break-after: avoid;
}
h3 { font-size: 12pt; color: #14406e; margin: 6mm 0 1.5mm 0; page-break-after: avoid; }
h4 { font-size: 10.5pt; margin: 4mm 0 1mm 0; }
p { margin: 1.6mm 0; text-align: justify; }
/* Headings use clean styling; underline is reserved for key terms in the body. */
h1 u, h2 u, h3 u, h4 u, .toc u { text-decoration: none; }
u { text-decoration: underline; text-underline-offset: 1.5px; }
strong { color: #0b2a4a; }

ul, ol { margin: 1.6mm 0; padding-left: 6mm; }
li { margin: 0.8mm 0; }

table { width: 100%; border-collapse: collapse; margin: 3mm 0 5mm 0; font-family: "Liberation Sans", Arial, sans-serif; }
th { background: #0b2a4a; color: #fff; text-align: left; padding: 2mm 3mm; font-size: 9pt; }
td { padding: 1.8mm 3mm; font-size: 9pt; border: 0.4pt solid #d8dee8; vertical-align: top; }
tr:nth-child(even) td { background: #f5f7fa; }
thead { display: table-header-group; }
tr { page-break-inside: avoid; }

pre {
  background: #f4f6f9; border: 0.5pt solid #d8dee8; border-left: 3px solid #0b2a4a;
  padding: 3mm 4mm; font-family: "Liberation Mono", monospace; font-size: 8.6pt;
  line-height: 1.35; white-space: pre-wrap; page-break-inside: avoid;
}
code { font-family: "Liberation Mono", monospace; font-size: 9pt; background: #eef1f5; padding: 0 1px; }
pre code { background: transparent; padding: 0; }

blockquote {
  background: #eef3f9; border-left: 3px solid #14406e; margin: 3mm 0;
  padding: 2.5mm 5mm; color: #2a3744;
}
hr { border: 0; border-top: 0.5pt solid #d8dee8; margin: 6mm 0; }
a { color: #14406e; }
"""


def slugify(text: str) -> str:
    text = re.sub(r"<[^>]+>", "", text)
    text = text.replace("&amp;", "and")
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[\s_]+", "-", text) or "section"


def build_html() -> str:
    md_text = SRC.read_text(encoding="utf-8")

    md = MarkdownIt("commonmark").enable("table")
    html_body = md.render(md_text)

    # Drop the leading H1 (the cover carries the title).
    html_body = re.sub(r"<h1>.*?</h1>\s*", "", html_body, count=1, flags=re.DOTALL)

    # Add ids to headings and collect H2 entries for the table of contents.
    toc_entries: list[tuple[str, str]] = []

    def add_id(match: re.Match) -> str:
        level = match.group(1)
        inner = match.group(2)
        slug = slugify(inner)
        if level == "2":
            label = re.sub(r"<[^>]+>", "", inner).replace("&amp;", "&")
            toc_entries.append((slug, label))
        return f'<h{level} id="{slug}">{inner}</h{level}>'

    html_body = re.sub(r"<h([1-4])>(.*?)</h\1>", add_id, html_body, flags=re.DOTALL)

    toc_items = "\n".join(
        f'<li><a href="#{slug}">{label}</a></li>' for slug, label in toc_entries
    )

    cover = f"""
    <div class="cover">
      <div class="cover-top">
        <div class="cover-brand">{OPERATOR.upper()}</div>
        <div class="cover-brand-sub">OPERATOR OF WORLDCUP26 · {JURISDICTION.upper()}</div>
      </div>
      <div class="cover-rule"></div>
      <div class="cover-center">
        <div class="cover-eyebrow">OPERATOR POLICY PACK</div>
        <div class="cover-title">WorldCup26</div>
        <div class="cover-sub">Game Rules &nbsp;·&nbsp; Terms &amp; Conditions &nbsp;·&nbsp; Privacy Policy</div>
        <div class="cover-tag">Prepared for Revolut — Know-Your-Business / Onboarding Review</div>
        <table class="cover-info">
          <tr><td class="k">Operator</td><td class="v">{OPERATOR}</td></tr>
          <tr><td class="k">Jurisdiction</td><td class="v">{JURISDICTION}</td></tr>
          <tr><td class="k">Service / Website</td><td class="v">{WEBSITE}</td></tr>
          <tr><td class="k">Document version</td><td class="v">{VERSION}</td></tr>
          <tr><td class="k">Effective date</td><td class="v">{EFFECTIVE}</td></tr>
          <tr><td class="k">Prepared</td><td class="v">{PREPARED}</td></tr>
        </table>
      </div>
      <div class="cover-bottom"><div class="cb-inner">
        <span class="cb-left">CONFIDENTIAL</span>
        <span class="cb-right">{WEBSITE}</span>
      </div></div>
    </div>
    """

    toc = f"""
    <section class="toc">
      <h2>Contents</h2>
      <ol>
        {toc_items}
      </ol>
    </section>
    """

    return (
        "<!DOCTYPE html><html><head><meta charset='utf-8'>"
        f"<style>{CSS}</style></head><body>"
        f"{cover}{toc}<main>{html_body}</main>"
        "</body></html>"
    )


def main() -> None:
    html = build_html()
    HTML(string=html, base_url=str(SRC.parent)).write_pdf(str(OUT))
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
