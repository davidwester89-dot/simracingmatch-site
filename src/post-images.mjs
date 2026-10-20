/**
 * Photos for blog posts + licence record (one entry per image).
 * Only photos that show real sim racing hardware (wheel, pedals, rig, cockpit): manufacturer/event press
 * photos whose press page explicitly allows editorial use, else free-licence photos (Wikimedia Commons,
 * Unsplash, Pexels). No generic mood stock, no generated product images, no standalone logos. Captions must say what the photo really shows; a photo of a
 * different product than the one in the section says so. All files: src/assets/img/blog/*.webp,
 * cropped + resized by us (CC BY/BY-SA: "cropped" noted in the caption).
 * Keys of `sections` are the exact H2 text in the post. Sections without a usable licensed photo
 * are listed in `noPhoto` (documentation only).
 * Non-Wikimedia photos record `site` (e.g. 'Pexels'; licence 'Pexels License', no attribution required,
 * credited anyway); the credit line then names that site instead of Wikimedia Commons.
 */
const L = {
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
  'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/',
  CC0: 'https://creativecommons.org/publicdomain/zero/1.0/',
  'Pexels License': 'https://www.pexels.com/license/',
};
const img = (o) => ({ widths: [1200, 900, 600], width: 1200, height: 800, licenceUrl: L[o.licence], ...o });

export const POST_IMAGES = {
  'ps5-direct-drive-wheels-2026': {
    hero: img({
      file: 'ps5-hero-sim-racing-pedals-close-up',
      alt: 'Close-up of metal sim racing pedals with drilled pedal faces under blue light',
      caption: 'Sim racing pedals under blue light. Shown as a general example of racing hardware.',
      author: 'Gergő', licence: 'Pexels License', site: 'Pexels',
      source: 'https://www.pexels.com/photo/9787475/',
    }),
    sections: {
      'Why PS5 sim racers had fewer direct drive options': img({
        file: 'ps5-logitech-g923-wheel-playstation', height: 1067,
        alt: 'Logitech G923 steering wheel, PlayStation version, with PlayStation buttons on the hub',
        caption: 'The PlayStation version of the Logitech G923 has PlayStation buttons on the hub. It is a gear-driven wheel, not direct drive.',
        author: 'FreeMediaKid!', licence: 'CC BY 4.0',
        source: 'https://commons.wikimedia.org/wiki/File:Logitech_G923_(PlayStation_variant)_wheel,_front.jpg',
      }),
      "Moza R5S Pro and R16S Ultra: Moza's first PS5 bases": img({
        file: 'ps5-moza-ks-wheel',
        alt: 'Moza KS steering wheel with buttons, rotary knobs and a colour rev-light ring',
        caption: 'A Moza KS steering wheel. This is an existing Moza wheel, not one of the new PS5 products, which Moza has not yet priced.',
        author: 'TaurusEmerald', licence: 'CC BY-SA 4.0',
        source: 'https://commons.wikimedia.org/wiki/File:MOZA_KS_Racing_Steering_Wheel_Controller.jpg',
      }),
      'Thrustmaster TGT III: €699.99, sales from 3 December': img({
        file: 'ps5-thrustmaster-tx-wheel',
        alt: 'Thrustmaster TX Racing Wheel Leather Edition clamped to a desk',
        caption: 'An earlier Thrustmaster wheel, the TX Racing Wheel Leather Edition. It is not the T-GT III.',
        author: 'Asmoth', licence: 'CC BY-SA 4.0',
        source: 'https://commons.wikimedia.org/wiki/File:Thrustmaster_TX_Racing_Wheel_Leather_edition_-_front.jpg',
      }),
      'How to choose: torque, platform, budget, space': img({
        file: 'ps5-sim-racing-shifter-knob',
        alt: 'Close-up of a metal H-pattern gear shifter knob on a dark background',
        caption: 'Budget for more than the wheel base: pedals, a shifter, a cockpit, a seat and screens all add to the total.',
        author: 'Gergő', licence: 'Pexels License', site: 'Pexels',
        source: 'https://www.pexels.com/photo/9787472/',
      }),
    },
    noPhoto: ['Fanatec: bundle prices changed on 1 October', 'Other PS5-compatible direct drive options today'],
  },
  'simracing-expo-2026-announcements': {
    hero: img({
      file: 'expo-hero-sim-racing-pedals-blue-light',
      alt: 'Three metal sim racing pedals with drilled pedal faces, lit from the side by blue light',
      caption: 'A set of sim racing pedals under blue light. Not a photo of SimRacing Expo 2026.',
      author: 'Gergő', licence: 'Pexels License', site: 'Pexels',
      source: 'https://www.pexels.com/photo/9787476/',
    }),
    sections: {
      "Moza brings direct drive to PS5 (R5S Pro, R16S Ultra)": img({
        file: 'ps5-moza-ks-wheel',
        alt: 'Moza KS steering wheel with buttons, rotary knobs and a colour rev-light ring',
        caption: 'A Moza KS steering wheel. This is an existing Moza wheel, not one of the new PS5 products, which Moza has not yet priced.',
        author: 'TaurusEmerald', licence: 'CC BY-SA 4.0',
        source: 'https://commons.wikimedia.org/wiki/File:MOZA_KS_Racing_Steering_Wheel_Controller.jpg',
      }),
      'Fanatec Project Obsidian and Trak Racer': img({
        file: 'expo-sim-racing-cockpits-row',
        alt: 'Row of empty sim racing cockpits with bucket seats and pedal sets under blue light',
        caption: 'A row of sim racing cockpits at a gaming event. Not from SimRacing Expo.',
        author: 'Matheus Bertelli', licence: 'Pexels License', site: 'Pexels',
        source: 'https://www.pexels.com/photo/28993113/',
      }),
    },
    noPhoto: ['What happened at SimRacing Expo Frankfurt (16–18 October 2026)', 'Asetek DD10: €499 direct drive, launching 27 October', 'Asetek GT Nova wheel (March 2027, €299.99)', 'PXN S16 and S23: first hands-on in Europe', "What this means if you're buying a wheelbase now"],
  },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const src = (im, w) => `/img/blog/${im.file}${w === im.widths[0] ? '' : `-${w}`}.webp`;

/** <figure> for one image. Hero: eager + fetchpriority=high (LCP); others lazy. */
export function figure(im, { hero = false } = {}) {
  const srcset = [...im.widths].reverse().map((w) => `${src(im, w)} ${w}w`).join(', ');
  const sizes = im.portrait ? '(max-width: 520px) 100vw, 420px' : '(max-width: 760px) 100vw, 704px';
  const load = hero ? 'fetchpriority="high" decoding="async"' : 'loading="lazy" decoding="async"';
  const credit = im.own ? '' : `Photo: ${esc(im.author)}, <a href="${esc(im.source)}" rel="noopener">${esc(im.site || 'Wikimedia Commons')}</a>, <a href="${esc(im.licenceUrl)}" rel="noopener license">${esc(im.licence)}</a>${im.licence === 'CC0' ? '' : ', cropped'}`;
  return `<figure class="post-fig${hero ? ' post-hero' : ''}${im.portrait ? ' post-fig-portrait' : ''}"><img src="${src(im, im.widths[0])}" srcset="${srcset}" sizes="${sizes}" width="${im.width}" height="${im.height}" alt="${esc(im.alt)}" ${load}><figcaption>${esc(im.caption)} <span class="credit">${credit}</span></figcaption></figure>`;
}

/** Photo credits list for the bottom of a post. */
export function creditsList(set) {
  const all = [set.hero, ...Object.values(set.sections)].filter((im) => im && !im.own);
  return `<h2 class="src-h">Photo credits</h2><ul class="credits">${all.map((im) => `<li>${esc(im.alt)}: ${esc(im.author)}, <a href="${esc(im.source)}" rel="noopener">${esc(im.site || 'Wikimedia Commons')}</a>, <a href="${esc(im.licenceUrl)}" rel="noopener license">${esc(im.licence)}</a></li>`).join('')}</ul>`;
}
