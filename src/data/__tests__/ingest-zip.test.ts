import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import sharp from 'sharp';
import { CARD_IDS } from '../card-ids';

describe('RWS_78_aligned.zip contract', () => {
  it('contains 78 aligned 800x1280 jpegs matching CARD_IDS', async () => {
    const bytes = readFileSync(path.join(process.cwd(), 'RWS_78_aligned.zip'));
    const zip = await JSZip.loadAsync(bytes);
    const faces = Object.keys(zip.files).filter((name) =>
      /^RWS_78\/aligned\/[a-z0-9_]+\.jpg$/.test(name),
    );
    expect(faces).toHaveLength(78);
    for (const id of CARD_IDS) {
      expect(zip.file(`RWS_78/aligned/${id}.jpg`)).toBeTruthy();
    }
    const fool = await zip.file('RWS_78/aligned/00_the_fool.jpg')!.async('nodebuffer');
    const meta = await sharp(fool).metadata();
    expect(meta.width).toBe(800);
    expect(meta.height).toBe(1280);
    expect(meta.format).toBe('jpeg');
  });
});
