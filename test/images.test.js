import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { POST_IMAGES } from '../src/post-images.mjs';

test('blog photos: hero eager, inline lazy, dimensions, alt, credits, files <150 KB', () => {
  execSync('node build.mjs', { env: { ...process.env, BASE: '', PREVIEW: '', GO_LIVE: '1', THEME: 'A' } });
  for (const [slug, set] of Object.entries(POST_IMAGES)) {
    const s = readFileSync(`dist/blog/${slug}/index.html`, 'utf8');
    const imgs = [...s.matchAll(/<figure class="post-fig[^"]*"><img ([^>]+)>/g)].map((m) => m[1]);
    assert.equal(imgs.length, 1 + Object.keys(set.sections).length, `${slug}: figure count`);
    imgs.forEach((a, i) => {
      assert.match(a, /width="\d+" height="\d+"/, `${slug}: dimensions`);
      assert.match(a, /alt="[^"]{15,}"/, `${slug}: alt`);
      if (i === 0) { assert.ok(!a.includes('loading="lazy"'), 'hero not lazy'); assert.match(a, /fetchpriority="high"/); }
      else assert.match(a, /loading="lazy"/);
    });
    assert.ok(s.indexOf('post-hero') < s.indexOf('<h2'), `${slug}: hero before first H2`);
    assert.match(s, /Photo credits/);
    for (const im of [set.hero, ...Object.values(set.sections)]) {
      assert.match(im.source, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      assert.ok(im.author && im.licence && im.licenceUrl, `${im.file}: licence record`);
      for (const w of im.widths) {
        const f = `dist/img/blog/${im.file}${w === im.widths[0] ? '' : `-${w}`}.webp`;
        assert.ok(existsSync(f), f);
        assert.ok(statSync(f).size < 150 * 1024, `${f} too big`);
      }
    }
    const bp = [...s.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1])).find((x) => x['@type'] === 'BlogPosting');
    assert.equal(bp.image, `https://simracingmatch.com/img/blog/${set.hero.file}.webp`);
  }
});
