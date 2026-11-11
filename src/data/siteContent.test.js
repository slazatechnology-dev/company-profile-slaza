import { test } from 'node:test';
import assert from 'node:assert/strict';
import { translations } from './translations.js';
import { seedSiteContent, localizeSiteContent, mergeContent } from './siteContent.js';

test('seed lalu localize menghasilkan teks yang sama dengan website sekarang (ID dan EN)', () => {
  const seed = seedSiteContent();
  for (const lang of ['id', 'en']) {
    const merged = mergeContent(translations[lang], localizeSiteContent(seed, lang));
    assert.deepEqual(merged, translations[lang], lang);
  }
});

test('EN kosong memakai teks ID; link non-http dibuang; techStack dipecah per koma', () => {
  const c = seedSiteContent();
  c.hero.headline = { id: 'Judul baru', en: '  ' };
  c.portfolio.projects[0].url = 'javascript:alert(1)';
  c.portfolio.projects[0].techStack = 'Vue.js, , Firebase ';
  const en = localizeSiteContent(c, 'en');
  assert.equal(en.hero.headline, 'Judul baru');
  assert.equal(en.portfolio.projects[0].url, '');
  assert.deepEqual(en.portfolio.projects[0].techStack, ['Vue.js', 'Firebase']);
});

test('mergeContent: objek digabung, array diganti utuh', () => {
  const out = mergeContent({ a: { x: 1, y: 2 }, list: [1, 2, 3] }, { a: { y: 9 }, list: [7] });
  assert.deepEqual(out, { a: { x: 1, y: 9 }, list: [7] });
});
