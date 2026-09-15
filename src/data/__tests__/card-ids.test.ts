import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CARD_IDS, MAJOR_IDS, MINOR_IDS, zipFilenameFor } from '../card-ids';

describe('CARD_IDS', () => {
  it('has 78 unique ids: 22 majors + 56 minors', () => {
    expect(MAJOR_IDS).toHaveLength(22);
    expect(MINOR_IDS).toHaveLength(56);
    expect(CARD_IDS).toHaveLength(78);
    expect(new Set(CARD_IDS).size).toBe(78);
  });

  it('uses 01_ace as ace primary key', () => {
    expect(CARD_IDS).toContain('cups_01_ace');
    expect(CARD_IDS).not.toContain('cups_ace');
  });

  it('uses British judgement spelling and RWS 8=strength / 11=justice', () => {
    expect(CARD_IDS).toContain('20_judgement');
    expect(CARD_IDS).toContain('08_strength');
    expect(CARD_IDS).toContain('11_justice');
  });

  it('is a bijection with aligned filenames in the zip listing', () => {
    const listing = readFileSync(path.join(process.cwd(), 'RWS_78_aligned.zip'));
    // Presence check only — ingest tests dimensions. Filenames appear as utf8 in local headers.
    const asString = listing.toString('latin1');
    for (const id of CARD_IDS) {
      expect(asString).toContain(`RWS_78/aligned/${zipFilenameFor(id)}`);
    }
  });
});
