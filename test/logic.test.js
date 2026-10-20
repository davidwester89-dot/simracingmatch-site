import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readConsent, saveConsent, createConsent, CONSENT_KEY, GA_ID_RE } from '../src/lib/consent.js';
import { parseFrontMatter, loadPosts } from '../src/blog.mjs';
import { renderMarkdown } from '../src/markdown.mjs';
import { knop } from '../src/lib/partnerlinks.js';

test('consent + partner knop data-vendor/pos', () => {
  assert.equal(CONSENT_KEY, 'sm-consent');
  assert.ok(GA_ID_RE.test('G-HJLSDLMDD0'));
  const store = { data: {}, getItem(k) { return this.data[k] ?? null; }, setItem(k, v) { this.data[k] = v; } };
  saveConsent(store, 'granted');
  assert.equal(readConsent(store).choice, 'granted');
  const html = knop('https://example.com/x', 'card_1', { partner: true, vendor: 'trakracer', label: 'Trak Racer' });
  assert.match(html, /data-vendor="trakracer"/);
  assert.match(html, /data-pos="card_1"/);
  assert.match(html, /rel="sponsored nofollow noopener"/);
});

test('blog front-matter + posts load', () => {
  const posts = loadPosts();
  assert.ok(posts.length >= 2, `posts ${posts.length}`);
  for (const p of posts) assert.ok(!/\]\(https:\/\/simracingmatch\.com/.test(p.body), `${p.file}: internal links must be root-relative`);
  const { meta, body } = parseFrontMatter(`---
title: Test post title here for length ok
description: A description that is long enough for the meta description field on the page itself here.
slug: test-post
datePublished: 2026-10-19
keyword: sim racing setup
---
## Hello

This is **bold** and a [link](https://example.com/).
`);
  assert.equal(meta.slug, 'test-post');
  assert.match(renderMarkdown(body), /<h2>Hello<\/h2>/);
  assert.match(renderMarkdown(body), /<strong>bold<\/strong>/);
});

test('markdown: root-relative links + setup-match CTA box', () => {
  const h = renderMarkdown('See [the PS5 guide](/blog/x/) and [Moza](https://mozaracing.com/).\n\n[Find your setup](/#setup-match) · [More articles](/blog/)\n', { matchLive: true });
  assert.match(h, /<a href="\/blog\/x\/">the PS5 guide<\/a>/);
  assert.match(h, /<a href="https:\/\/mozaracing\.com\/" rel="noopener">Moza<\/a>/);
  assert.match(h, /<p class="post-cta"><a href="\/#setup-match" class="btn" data-cta="blog_match" data-quiz="start">Find your setup<\/a><a href="\/blog\/">More articles<\/a><\/p>/);
});

test('markdown: match not live yet → blog link is the main button, match link says preview', () => {
  const h = renderMarkdown('[Find your setup](/#setup-match) · [More articles](/blog/)\n', { matchLive: false });
  assert.match(h, /<p class="post-cta"><a href="\/blog\/" class="btn">More articles<\/a><a href="\/#setup-match" data-cta="blog_match" data-quiz="start">Preview the 5 questions<\/a><\/p>/);
  assert.ok(!h.includes('Find your setup'));
});
