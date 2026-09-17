#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile, cp, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ZIP_PATH = path.join(ROOT, 'RWS_78_aligned.zip');
const BACK_SRC = path.join(ROOT, 'src/assets/card-back.svg');
const OUT_ROOT = path.join(ROOT, 'public/cards');
const TMP_ROOT = path.join(ROOT, '.tmp-cards');
const DECK_VERSION = 'rws-1';
const WIDTHS = [320, 480, 800];

const MAJOR_IDS = [
  '00_the_fool',
  '01_the_magician',
  '02_the_high_priestess',
  '03_the_empress',
  '04_the_emperor',
  '05_the_hierophant',
  '06_the_lovers',
  '07_the_chariot',
  '08_strength',
  '09_the_hermit',
  '10_wheel_of_fortune',
  '11_justice',
  '12_the_hanged_man',
  '13_death',
  '14_temperance',
  '15_the_devil',
  '16_the_tower',
  '17_the_star',
  '18_the_moon',
  '19_the_sun',
  '20_judgement',
  '21_the_world',
];
const SUITS = ['cups', 'pents', 'swords', 'wands'];
const RANKS = ['01_ace', '02', '03', '04', '05', '06', '07', '08', '09', '10', 'page', 'knight', 'queen', 'king'];
const CARD_IDS = [...MAJOR_IDS, ...SUITS.flatMap((s) => RANKS.map((r) => `${s}_${r}`))];

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

async function main() {
  const zipBytes = await readFile(ZIP_PATH);
  assert(zipBytes.byteLength < 80 * 1024 * 1024, 'zip too large');
  const zip = await JSZip.loadAsync(zipBytes, { createFolders: false });

  const faces = new Map();
  for (const [name, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    assert(!name.includes('..') && !path.isAbsolute(name), `unsafe zip path: ${name}`);
    const match = name.match(/^RWS_78\/aligned\/([a-z0-9_]+)\.jpg$/);
    if (!match) continue;
    faces.set(match[1], entry);
  }

  assert(faces.size === 78, `expected 78 aligned faces, got ${faces.size}`);
  for (const id of CARD_IDS) {
    assert(faces.has(id), `missing ${id}.jpg`);
  }
  for (const id of faces.keys()) {
    assert(CARD_IDS.includes(id), `unexpected face ${id}`);
  }

  await rm(TMP_ROOT, { recursive: true, force: true });
  const tmpDeck = path.join(TMP_ROOT, DECK_VERSION);
  await mkdir(tmpDeck, { recursive: true });

  const cards = [];
  for (const cardId of CARD_IDS) {
    const bytes = await faces.get(cardId).async('nodebuffer');
    const image = sharp(bytes);
    const meta = await image.metadata();
    assert(meta.width === 800 && meta.height === 1280, `${cardId} is ${meta.width}x${meta.height}`);
    assert(meta.format === 'jpeg', `${cardId} is not jpeg`);
    const digest = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
    const dest = path.join(tmpDeck, cardId, digest);
    await mkdir(dest, { recursive: true });
    const variants = {};
    for (const width of WIDTHS) {
      const webpName = `${width}.webp`;
      const jpgName = `${width}.jpg`;
      await image
        .clone()
        .resize({ width })
        .webp({ quality: 78 })
        .toFile(path.join(dest, webpName));
      await image
        .clone()
        .resize({ width })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(path.join(dest, jpgName));
      variants[width] = {
        webp: `/cards/${DECK_VERSION}/${cardId}/${digest}/${webpName}`,
        jpeg: `/cards/${DECK_VERSION}/${cardId}/${digest}/${jpgName}`,
      };
    }
    cards.push({
      cardId,
      digest,
      sourceSha256: createHash('sha256').update(bytes).digest('hex'),
      width: 800,
      height: 1280,
      bytes: bytes.byteLength,
      variants,
    });
  }

  const manifest = {
    deckVersion: DECK_VERSION,
    generatedAt: new Date().toISOString(),
    count: cards.length,
    cards,
  };
  await writeFile(path.join(tmpDeck, 'manifest.json'), JSON.stringify(manifest, null, 2));
  await cp(BACK_SRC, path.join(TMP_ROOT, 'back.svg'));

  await mkdir(OUT_ROOT, { recursive: true });
  const finalDeck = path.join(OUT_ROOT, DECK_VERSION);
  const backup = path.join(OUT_ROOT, `${DECK_VERSION}.prev`);
  await rm(backup, { recursive: true, force: true });
  try {
    await rename(finalDeck, backup);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await rename(tmpDeck, finalDeck);
  await cp(path.join(TMP_ROOT, 'back.svg'), path.join(OUT_ROOT, 'back.svg'));
  const generatedManifest = path.join(ROOT, 'src/data/decks/rws-1/manifest.generated.ts');
  await mkdir(path.dirname(generatedManifest), { recursive: true });
  await writeFile(
    generatedManifest,
    `export const DECK_MANIFEST = ${JSON.stringify(manifest)} as const;\n`,
  );
  await rm(TMP_ROOT, { recursive: true, force: true });
  await rm(backup, { recursive: true, force: true });
  console.log(`ingest ok: ${cards.length} cards → public/cards/${DECK_VERSION}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
