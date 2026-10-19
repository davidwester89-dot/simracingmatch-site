# SimracingMatch.com

English-first static site (Node, no frameworks). Dark motorsport UI with **two switchable themes**:

| Flag | Name | Look |
|------|------|------|
| `THEME=A` (default) | **Night Race** | Near-black carbon, signal red, condensed display type, racing-line hero |
| `THEME=B` | **Pit Wall Telemetry** | Graphite, amber/yellow, mono headings, telemetry-grid hero |

```bash
npm test
THEME=A npm run build    # or: npm run build:a
THEME=B npm run build    # or: npm run build:b
npm run serve            # http://127.0.0.1:8085/
```

Preview (Actions default): `BASE=/simracingmatch-site` → noindex, no CNAME.  
Live only after OK: `BASE=` + `GO_LIVE=1` (writes `CNAME` simracingmatch.com). **Do not push live without Moneymaker + Site-controleur.**

- GA4: `G-HJLSDLMDD0` — consent-gated. Events: `quiz_start` (Find your setup), stub `quiz_complete` via `sm:quiz`, `vendor_click` on `data-vendor`/`data-pos`.
- Partner links: label `partnerlink` + `rel="sponsored nofollow noopener"`; never affect match order.
- hreflang: `en` + `x-default` on every indexable page; optional `hreflangNl` per page (empty for now — no `/nl/`).
- Author: **SimracingMatch Editorial**. No personal names/photos.

## Adding a blog post (for Blogschrijver)

1. Create a Markdown file in **`src/posts/`** (filename free, e.g. `2026-10-19-my-slug.md`).
2. Start with YAML front-matter between `---` lines. **Required keys:**

```markdown
---
title: Your title here (keep <= 60 characters ideally)
description: Meta description 70–155 characters. Plain text, no quotes needed unless it contains a colon.
slug: url-slug-with-hyphens
datePublished: 2026-10-19
keyword: primary keyword phrase
dateModified: 2026-10-19
---

## First section

Body in Markdown. Use manufacturer links like [Moza](https://mozaracing.com/) with the check date in the prose.

### Subsection

- List item
- **Bold** and *italic* work. No raw HTML.
```

| Field | Rules |
|-------|--------|
| `title` | Shown as H1; also used in `<title>` (truncate if >60) |
| `description` | Meta description, 70–155 chars |
| `slug` | `a-z0-9` + hyphens only → `/blog/{slug}/` |
| `datePublished` | `YYYY-MM-DD` |
| `keyword` | Optional but preferred |
| `dateModified` | Optional; defaults to `datePublished` |

3. Run `npm test` && `npm run build`. The post appears on `/blog/` and in the sitemap. With **0 posts**, `/blog/` shows a short intro and stays **noindex** / out of the sitemap.

Byline is always **SimracingMatch Editorial**. No invented specs/prices/ratings — manufacturer data with dates only.

## Network footer

`src/network.mjs` — match sites only (no Goodfellas).
