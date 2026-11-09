// Home match form: quiz_start once on the first change or submit, then quiz_complete.
// Runs the built /js/consent.js and /js/match.js. track() still drops events with no consent.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { execSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { CONSENT_KEY } from '../src/lib/consent.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SELF = fileURLToPath(import.meta.url);
const ANSWERS = { budget: '300-700', platform: 'pc', space: 'desk', experience: 'beginner', style: 'casual' };

if (!process.env.QUIZ_SCENARIO) before(() => {
  execSync('node build.mjs', { cwd: ROOT, stdio: 'ignore', env: { ...process.env, BASE: '', PREVIEW: '', GO_LIVE: '1', THEME: 'A' } });
});

if (!process.env.QUIZ_SCENARIO) test('built match.js and consent.js carry quiz_start; CTA path stays', () => {
  const match = readFileSync(join(ROOT, 'src/assets/js/match.js'), 'utf8');
  const consent = readFileSync(join(ROOT, 'src/assets/js/consent.js'), 'utf8');
  assert.equal(readFileSync(join(ROOT, 'dist/js/match.js'), 'utf8'), match);
  assert.equal(readFileSync(join(ROOT, 'dist/js/consent.js'), 'utf8'), consent);
  assert.match(match, /let started = false/);
  assert.match(match, /form\.addEventListener\('change', markStart\)/);
  assert.match(match, /new CustomEvent\('sm:quiz-start', \{ detail: \{ cta_type: 'match_form' \} \}\)/);
  const submitAt = match.indexOf("form.addEventListener('submit'");
  const markAt = match.indexOf('markStart();', submitAt);
  const completeAt = match.indexOf("new CustomEvent('sm:quiz'", submitAt);
  assert.ok(submitAt > 0 && markAt > submitAt && completeAt > markAt, 'markStart runs before sm:quiz on submit');
  assert.match(match, /document\.addEventListener\('sm:quiz-started', \(\) => \{ started = true; \}, \{ once: true \}\)/);
  assert.match(consent, /document\.addEventListener\('sm:quiz-start', \(e\) => track\('quiz_start', \{ page: location\.pathname, cta_type: \(e\.detail && e\.detail\.cta_type\) \|\| 'match_form' \}\)\)/);
  assert.match(consent, /if \(track\('quiz_start', \{ page: location\.pathname, cta_type: t\.dataset\.cta \|\| 'quiz_start' \}\)\) \{\s*document\.dispatchEvent\(new CustomEvent\('sm:quiz-started'\)\);/);
  assert.match(consent, /t\.dataset\.quiz === 'start' \|\| t\.dataset\.cta === 'home_hero' \|\| t\.dataset\.cta === 'match_teaser' \|\| t\.dataset\.cta === 'nav_match'/);
  assert.match(consent, /document\.addEventListener\('sm:quiz'/);
});

if (!process.env.QUIZ_SCENARIO) test('consent granted or refused: form quiz_start order, and drops before consent', () => {
  const change = run('change-then-submit');
  const submitOnly = run('submit-only');
  const denied = run('consent-denied');
  const beforeConsent = run('before-consent-dropped');
  const cta = run('cta-unchanged');
  const ctaForm = run('cta-then-form');
  const ctaEarly = run('cta-before-consent');
  const all = { change, submitOnly, denied, beforeConsent, cta, ctaForm, ctaEarly };
  writeFileSync('/tmp/srm-quiz-scenarios.json', JSON.stringify(all, null, 2));

  assert.deepEqual(change.events.map((e) => e.name), ['quiz_start', 'quiz_complete']);
  assert.equal(change.quiz_start_count, 1);
  assert.equal(change.cta_clicks, 0);
  assert.equal(change.scrolled, true);
  assert.ok(change.changes >= 1);
  assert.equal(change.events[0].params.cta_type, 'match_form');
  assert.equal(change.events[0].params.page, '/');
  assert.deepEqual(change.events[1].params, { platform: 'pc', budget: '300-700' });
  assert.equal(change.showed_matches, true);

  assert.deepEqual(submitOnly.events.map((e) => e.name), ['quiz_start', 'quiz_complete']);
  assert.equal(submitOnly.quiz_start_count, 1);
  assert.equal(submitOnly.changes, 0);
  assert.equal(submitOnly.cta_clicks, 0);
  assert.equal(submitOnly.events[0].params.cta_type, 'match_form');
  assert.equal(submitOnly.showed_matches, true);

  assert.deepEqual(denied.events, []);
  assert.equal(denied.quiz_start_count, 0);
  assert.equal(denied.showed_matches, true, 'the form still runs when analytics are off');

  assert.deepEqual(beforeConsent.events_before_accept, []);
  assert.deepEqual(beforeConsent.events_after_accept, []);
  assert.equal(beforeConsent.quiz_start_after_submit, 0);
  assert.deepEqual(beforeConsent.events_after_submit.map((e) => e.name), ['quiz_complete']);
  assert.equal(beforeConsent.replayed, false);

  assert.deepEqual(cta.events, [{ name: 'quiz_start', params: { page: '/', cta_type: 'home_hero' } }]);
  assert.equal(cta.match_form_starts, 0);
  assert.equal(cta.cta_clicks, 1);

  assert.deepEqual(ctaForm.events.map((e) => e.name), ['quiz_start', 'quiz_complete']);
  assert.equal(ctaForm.quiz_start_count, 1);
  assert.equal(ctaForm.events[0].params.cta_type, 'home_hero');
  assert.equal(ctaForm.events[0].params.page, '/');
  assert.equal(ctaForm.match_form_starts, 0);
  assert.equal(ctaForm.showed_matches, true);

  assert.deepEqual(ctaEarly.events_before_accept, []);
  assert.deepEqual(ctaEarly.events_after_accept, []);
  assert.equal(ctaEarly.match_form_starts, 1);
  assert.deepEqual(ctaEarly.events_after_submit.map((e) => e.name), ['quiz_start', 'quiz_complete']);
  assert.equal(ctaEarly.events_after_submit[0].params.cta_type, 'match_form');
  assert.equal(ctaEarly.showed_matches, true);
});

function run(name) {
  const r = spawnSync(process.execPath, [SELF], {
    cwd: ROOT,
    env: { ...process.env, QUIZ_SCENARIO: name },
    encoding: 'utf8',
    timeout: 20000,
  });
  assert.equal(r.status, 0, `scenario ${name} failed\n${r.stdout}\n${r.stderr}`);
  const line = r.stdout.split('\n').find((l) => l.startsWith('SCENARIO_JSON:'));
  assert.ok(line, `no scenario output for ${name}\n${r.stdout}`);
  return JSON.parse(line.slice('SCENARIO_JSON:'.length));
}

function gaEvents(win) {
  const out = [];
  for (const item of win.dataLayer || []) {
    if (item && item[0] === 'event') out.push({ name: String(item[1]), params: { ...item[2] } });
  }
  return out;
}

async function runScenario(name) {
  const choice = name === 'consent-denied' ? 'denied' : (name === 'before-consent-dropped' || name === 'cta-before-consent' ? null : 'granted');
  const page = await boot(choice);
  if (name === 'cta-unchanged') {
    const steps = ['load /', 'consent granted', 'click hero CTA (no form field)'];
    page.hero.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
    const events = gaEvents(page.win);
    return { steps, events, match_form_starts: events.filter((e) => e.params.cta_type === 'match_form').length, cta_clicks: page.clicks };
  }
  if (name === 'cta-then-form') {
    page.hero.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
    page.form.scrollIntoView();
    for (const [key, value] of Object.entries(ANSWERS)) select(page.form, key, value, true);
    page.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const events = gaEvents(page.win);
    return {
      steps: ['load /', 'consent granted', 'click hero CTA', 'change fields', 'submit'],
      events,
      quiz_start_count: events.filter((e) => e.name === 'quiz_start').length,
      match_form_starts: events.filter((e) => e.params.cta_type === 'match_form').length,
      showed_matches: page.out.innerHTML.includes('Your matches'),
    };
  }
  if (name === 'cta-before-consent') {
    page.hero.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
    const eventsBefore = gaEvents(page.win);
    accept(page);
    const eventsAfter = gaEvents(page.win);
    for (const [key, value] of Object.entries(ANSWERS)) select(page.form, key, value, true);
    page.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const eventsSubmit = gaEvents(page.win);
    return {
      steps: ['load /', 'no consent', 'click hero CTA', 'accept', 'change fields', 'submit'],
      events_before_accept: eventsBefore,
      events_after_accept: eventsAfter,
      events_after_submit: eventsSubmit,
      match_form_starts: eventsSubmit.filter((e) => e.name === 'quiz_start' && e.params.cta_type === 'match_form').length,
      showed_matches: page.out.innerHTML.includes('Your matches'),
    };
  }
  page.form.scrollIntoView();
  const emitChange = name !== 'submit-only';
  if (name === 'change-then-submit') {
    select(page.form, 'platform', ANSWERS.platform, true);
    select(page.form, 'budget', ANSWERS.budget, true);
    for (const [key, value] of Object.entries(ANSWERS)) if (key !== 'platform' && key !== 'budget') select(page.form, key, value, false);
  } else {
    for (const [key, value] of Object.entries(ANSWERS)) select(page.form, key, value, emitChange && name !== 'before-consent-dropped');
  }
  if (name === 'before-consent-dropped') {
    select(page.form, 'platform', ANSWERS.platform, true);
    const eventsBefore = gaEvents(page.win);
    accept(page);
    const eventsAfter = gaEvents(page.win);
    page.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const eventsSubmit = gaEvents(page.win);
    return {
      steps: ['load /', 'no consent stored', 'scroll #match-form', 'no CTA click', 'change platform', 'snapshot: dropped', 'accept', 'snapshot: not replayed', 'submit'],
      events_before_accept: eventsBefore,
      events_after_accept: eventsAfter,
      events_after_submit: eventsSubmit,
      quiz_start_after_submit: eventsSubmit.filter((e) => e.name === 'quiz_start').length,
      replayed: eventsAfter.some((e) => e.name === 'quiz_start') || eventsSubmit.some((e) => e.name === 'quiz_start'),
      showed_matches: page.out.innerHTML.includes('Your matches'),
    };
  }
  const steps = name === 'submit-only'
    ? ['load /', 'consent granted', 'scroll #match-form', 'no CTA click', 'fill fields without change', 'submit']
    : ['load /', name === 'consent-denied' ? 'consent denied' : 'consent granted', 'scroll #match-form', 'no CTA click', 'change fields', 'submit'];
  page.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  const events = gaEvents(page.win);
  return {
    steps,
    events,
    quiz_start_count: events.filter((e) => e.name === 'quiz_start').length,
    changes: page.changes,
    cta_clicks: page.clicks,
    scrolled: page.scrolled,
    showed_matches: page.out.innerHTML.includes('Your matches'),
  };
}

function boot(choice) {
  const data = {
    srm: choice ? { [CONSENT_KEY]: JSON.stringify({ v: 1, choice, date: new Date().toISOString() }) } : {},
  };
  const store = {
    getItem(k) { return Object.prototype.hasOwnProperty.call(data.srm, k) ? data.srm[k] : null; },
    setItem(k, v) { data.srm[k] = String(v); },
    removeItem(k) { delete data.srm[k]; },
  };
  const doc = new Doc();
  const location = { hostname: 'simracingmatch.com', pathname: '/', href: 'https://simracingmatch.com/', search: '', hash: '' };
  const win = { localStorage: store, location, document: doc };
  globalThis.document = doc;
  globalThis.window = win;
  globalThis.location = location;
  globalThis.FormData = ScenarioFormData;

  doc.body.dataset.ga = 'G-TEST1234';
  doc.body.dataset.base = '';
  const skip = el(doc, 'a');
  skip.className = 'skip';
  skip.setAttribute('href', '#content');
  doc.body.append(skip);
  const hero = el(doc, 'a');
  hero.setAttribute('href', '/#setup-match');
  hero.setAttribute('data-cta', 'home_hero');
  hero.setAttribute('data-quiz', 'start');
  hero.textContent = 'Find your setup';
  doc.body.append(hero);
  const form = el(doc, 'form');
  form.id = 'match-form';
  form.hidden = true;
  const counts = { changes: 0, clicks: 0, scrolled: false };
  form.addEventListener('change', () => { counts.changes += 1; });
  form.scrollIntoView = () => { counts.scrolled = true; };
  doc.addEventListener('click', (e) => { if (e.target === hero || (e.target && e.target.closest && e.target.closest('[data-cta]'))) counts.clicks += 1; });
  for (const [name, values] of Object.entries({
    budget: ['u300', '300-700', '700-1500', 'o1500'],
    platform: ['pc', 'playstation', 'xbox'],
    space: ['desk', 'stand', 'cockpit'],
    experience: ['beginner', 'upgrader'],
    style: ['casual', 'competitive'],
  })) {
    for (const value of values) {
      const input = el(doc, 'input');
      input.type = 'radio';
      input.name = name;
      input.value = value;
      input.checked = false;
      form.append(input);
    }
  }
  const submit = el(doc, 'button');
  submit.setAttribute('type', 'submit');
  submit.setAttribute('data-quiz', 'submit');
  form.append(submit);
  doc.body.append(form);
  const out = el(doc, 'div');
  out.id = 'match-results';
  out.focus = () => { doc.activeElement = out; };
  doc.body.append(out);
  const dataEl = el(doc, 'script');
  dataEl.id = 'match-data';
  dataEl.textContent = JSON.stringify({
    checked: '8 November 2026',
    logos: {},
    partnerNote: '',
    bases: [{ brand: 'Test', model: 'Base', nm: 5.5, torque: '5.5 Nm', platforms: ['PC'], note: '', price: 439, url: 'https://example.test/base' }],
  });
  doc.body.append(dataEl);

  return import(pathToFileURL(join(ROOT, 'dist/js/consent.js')).href)
    .then(() => import(pathToFileURL(join(ROOT, 'dist/js/match.js')).href))
    .then(() => ({ doc, win, form, out, hero, ...counts, get changes() { return counts.changes; }, get clicks() { return counts.clicks; }, get scrolled() { return counts.scrolled; } }));
}

function select(form, name, value, emitChange) {
  const inputs = form.elements.filter((e) => e.name === name);
  for (const input of inputs) input.checked = input.value === value;
  if (emitChange) inputs.find((input) => input.checked).dispatchEvent(new Event('change', { bubbles: true }));
}

function accept(page) {
  const banner = page.doc.body.querySelector('section.consent') || descendants(page.doc.body).find((e) => e.classList.contains('consent'));
  assert.ok(banner, 'banner is open before a choice');
  const btn = el(page.doc, 'button');
  btn.setAttribute('data-c', 'yes');
  banner.append(btn);
  btn.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
}

class ScenarioFormData {
  constructor(form) {
    this.entries = [];
    if (!form || !form.elements) return;
    for (const input of form.elements) {
      if (!input.name || input.disabled) continue;
      if ((input.type === 'radio' || input.type === 'checkbox') && !input.checked) continue;
      this.entries.push([input.name, input.value]);
    }
  }
  get(name) {
    const hit = this.entries.find(([key]) => key === name);
    return hit ? hit[1] : null;
  }
}

function el(doc, tag) {
  const node = new El(tag);
  node.ownerDocument = doc;
  return node;
}

function descendants(node) {
  const out = [];
  const stack = [...(node.children || [])];
  while (stack.length) {
    const next = stack.shift();
    out.push(next);
    if (next.children) stack.unshift(...next.children);
  }
  return out;
}

function matches(node, selector) {
  return selector.split(',').some((raw) => {
    const sel = raw.trim();
    if (sel.startsWith('.')) return node._classes.has(sel.slice(1));
    let rest = sel;
    let tag = '';
    const tagMatch = rest.match(/^([A-Za-z][\w-]*)/);
    if (tagMatch && !sel.startsWith('[') && !sel.startsWith('#')) {
      tag = tagMatch[1].toUpperCase();
      rest = rest.slice(tagMatch[1].length);
      if (node.tagName !== tag) return false;
    }
    if (rest.startsWith('#')) return node.id === rest.slice(1);
    const attrs = [...rest.matchAll(/\[([^\]]+)\]/g)];
    if (!attrs.length) return rest === '' && !!tag;
    return attrs.every((m) => Object.prototype.hasOwnProperty.call(node.attrs, m[1].split('=')[0]));
  });
}

function listen(target, type, fn, options) {
  const list = target._listeners.get(type) || [];
  const once = options === true || !!(options && options.once);
  const call = once ? (ev) => {
    const cur = target._listeners.get(type) || [];
    target._listeners.set(type, cur.filter((f) => f !== call));
    fn(ev);
  } : fn;
  list.push(call);
  target._listeners.set(type, list);
}

function dispatch(target, ev) {
  const nodes = [target];
  if (ev.bubbles) {
    let parent = target.parentNode;
    while (parent) { nodes.push(parent); parent = parent.parentNode; }
  }
  const wrapped = new Proxy(ev, {
    get(obj, prop) {
      if (prop === 'target') return target;
      const value = Reflect.get(obj, prop, obj);
      return typeof value === 'function' ? value.bind(obj) : value;
    },
  });
  for (const node of nodes) {
    for (const fn of [...(node._listeners?.get(ev.type) || [])]) fn(wrapped);
  }
  return true;
}

class El {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.ownerDocument = null;
    this.attrs = {};
    this.dataset = {};
    this.id = '';
    this.hidden = false;
    this.textContent = '';
    this.innerHTML = '';
    this._classes = new Set();
    this._listeners = new Map();
    this.classList = {
      add: (...xs) => { for (const x of xs) this._classes.add(x); },
      remove: (...xs) => { for (const x of xs) this._classes.delete(x); },
      contains: (x) => this._classes.has(x),
    };
  }
  set className(value) { this._classes = new Set(String(value).split(/\s+/).filter(Boolean)); }
  get className() { return [...this._classes].join(' '); }
  setAttribute(name, value) {
    this.attrs[name] = String(value);
    if (name === 'id') this.id = String(value);
    if (name.startsWith('data-')) {
      const key = name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      this.dataset[key] = String(value);
    }
  }
  getAttribute(name) { return Object.prototype.hasOwnProperty.call(this.attrs, name) ? this.attrs[name] : null; }
  hasAttribute(name) { return Object.prototype.hasOwnProperty.call(this.attrs, name); }
  append(...nodes) { for (const node of nodes) adopt(this, node, this.children.length); }
  prepend(...nodes) { for (const node of nodes) adopt(this, node, 0); }
  after(node) {
    const parent = this.parentNode;
    adopt(parent, node, parent.children.indexOf(this) + 1);
  }
  get elements() { return descendants(this).filter((node) => node.tagName === 'INPUT' || node.tagName === 'BUTTON' || node.tagName === 'SELECT' || node.tagName === 'TEXTAREA'); }
  querySelectorAll(selector) { return descendants(this).filter((node) => matches(node, selector)); }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  matches(selector) { return matches(this, selector); }
  closest(selector) {
    let node = this;
    while (node && node.matches) {
      if (node.matches(selector)) return node;
      node = node.parentNode;
    }
    return null;
  }
  contains(node) {
    let current = node;
    while (current) { if (current === this) return true; current = current.parentNode; }
    return false;
  }
  addEventListener(type, fn, options) { listen(this, type, fn, options); }
  dispatchEvent(ev) { return dispatch(this, ev); }
  focus() { if (this.ownerDocument) this.ownerDocument.activeElement = this; }
}

class Doc {
  constructor() {
    this.cookie = '';
    this.referrer = '';
    this.activeElement = null;
    this._listeners = new Map();
    this.head = new El('head');
    this.body = new El('body');
    this.head.ownerDocument = this;
    this.body.ownerDocument = this;
    this.body.parentNode = this;
    this.head.parentNode = this;
  }
  createElement(tag) { return el(this, tag); }
  getElementById(id) { return descendants(this.body).find((node) => node.id === id) || null; }
  addEventListener(type, fn, options) { listen(this, type, fn, options); }
  dispatchEvent(ev) { return dispatch(this, ev); }
  contains(node) { return node === this || this.body.contains(node) || this.head.contains(node); }
  querySelector(selector) { return this.body.querySelector(selector); }
}

function adopt(parent, node, index) {
  if (node.parentNode && node.parentNode.children) node.parentNode.children = node.parentNode.children.filter((child) => child !== node);
  node.parentNode = parent;
  parent.children.splice(index, 0, node);
}

if (process.env.QUIZ_SCENARIO) {
  const out = await runScenario(process.env.QUIZ_SCENARIO);
  process.stdout.write(`SCENARIO_JSON:${JSON.stringify(out)}\n`);
}
