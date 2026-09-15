import { CARD_ID_SET, isCardId, type CardId } from '@/data/card-ids';
import { SPREADS, type SpreadId } from '@/data/lexicons/zh-1/spreads';
import {
  ALGO_ID,
  DECK_VERSION,
  LEXICON_VERSION,
  MAX_QUESTION_CODEPOINTS,
  MAX_READING_ID_LENGTH,
  SHARE_PROTOCOL_VERSION,
} from '@/config/site';
import type { Draw, Orientation } from '@/lib/shuffle';

export type ReadingPayloadV1 = {
  v: 1;
  deckVersion: 'rws-1';
  lexiconVersion: 'zh-1';
  algo: 'fy-hkdf-2';
  spreadId: SpreadId;
  q: string | null;
  reversals: boolean;
  cutIndex: number;
  commit: string;
  draws: Draw[];
  ts: number;
};

const COMMIT_RE = /^[0-9a-f]{16}$/;

function codepoints(value: string): number {
  return [...value].length;
}

function canonicalPayload(payload: ReadingPayloadV1): ReadingPayloadV1 {
  return {
    v: SHARE_PROTOCOL_VERSION,
    deckVersion: DECK_VERSION,
    lexiconVersion: LEXICON_VERSION,
    algo: ALGO_ID,
    spreadId: payload.spreadId,
    q: payload.q,
    reversals: payload.reversals,
    cutIndex: payload.cutIndex,
    commit: payload.commit,
    draws: payload.draws.map((draw) => ({
      positionId: draw.positionId,
      cardId: draw.cardId,
      orientation: draw.orientation,
    })),
    ts: payload.ts,
  };
}

function toBase64Url(json: string): string {
  if (typeof Buffer !== 'undefined') return Buffer.from(json, 'utf8').toString('base64url');
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(body: string): string {
  if (typeof Buffer !== 'undefined') return Buffer.from(body, 'base64url').toString('utf8');
  const padded = body.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((body.length + 3) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export function encodeReading(payload: ReadingPayloadV1): string {
  if (payload.q !== null && codepoints(payload.q) > MAX_QUESTION_CODEPOINTS) {
    throw new Error('QUESTION_TOO_LONG');
  }
  const json = JSON.stringify(canonicalPayload(payload));
  const id = `1.${toBase64Url(json)}`;
  if (id.length > MAX_READING_ID_LENGTH) {
    throw new Error('READING_ID_TOO_LONG');
  }
  return id;
}

export type DecodeResult =
  | { ok: true; payload: ReadingPayloadV1 }
  | { ok: false; error: string };

export function decodeReading(readingId: string): DecodeResult {
  try {
    if (readingId.length > MAX_READING_ID_LENGTH) return { ok: false, error: 'too_long' };
    if (!readingId.startsWith('1.')) return { ok: false, error: 'prefix' };
    const body = readingId.slice(2);
    if (!/^[A-Za-z0-9_-]+$/.test(body)) return { ok: false, error: 'charset' };
    const json = fromBase64Url(body);
    const raw = JSON.parse(json) as unknown;
    const payload = parsePayload(raw);
    if (!payload) return { ok: false, error: 'schema' };
    return { ok: true, payload };
  } catch {
    return { ok: false, error: 'decode' };
  }
}

function isOrientation(value: unknown): value is Orientation {
  return value === 'upright' || value === 'reversed';
}

function isSpreadId(value: unknown): value is SpreadId {
  return value === 'single' || value === 'three' || value === 'celtic';
}

function parsePayload(raw: unknown): ReadingPayloadV1 | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;
  const allowed = [
    'v',
    'deckVersion',
    'lexiconVersion',
    'algo',
    'spreadId',
    'q',
    'reversals',
    'cutIndex',
    'commit',
    'draws',
    'ts',
  ];
  if (Object.keys(obj).some((key) => !allowed.includes(key))) return null;
  if (obj.v !== 1) return null;
  if (obj.deckVersion !== DECK_VERSION) return null;
  if (obj.lexiconVersion !== LEXICON_VERSION) return null;
  if (obj.algo !== ALGO_ID) return null;
  if (!isSpreadId(obj.spreadId)) return null;
  if (!(obj.q === null || (typeof obj.q === 'string' && codepoints(obj.q) <= MAX_QUESTION_CODEPOINTS))) {
    return null;
  }
  if (typeof obj.reversals !== 'boolean') return null;
  if (!Number.isInteger(obj.cutIndex) || (obj.cutIndex as number) < 1 || (obj.cutIndex as number) > 77) {
    return null;
  }
  if (typeof obj.commit !== 'string' || !COMMIT_RE.test(obj.commit)) return null;
  if (!Number.isInteger(obj.ts) || (obj.ts as number) < 1577836800 || (obj.ts as number) > 4102444800) {
    return null;
  }
  if (!Array.isArray(obj.draws)) return null;
  const spread = SPREADS[obj.spreadId];
  if (obj.draws.length !== spread.positions.length) return null;
  const draws: Draw[] = [];
  const seen = new Set<CardId>();
  for (let i = 0; i < obj.draws.length; i += 1) {
    const item = obj.draws[i];
    if (!item || typeof item !== 'object') return null;
    const draw = item as Record<string, unknown>;
    if (Object.keys(draw).some((key) => !['positionId', 'cardId', 'orientation'].includes(key))) {
      return null;
    }
    if (draw.positionId !== spread.positions[i].id) return null;
    if (typeof draw.cardId !== 'string' || !isCardId(draw.cardId)) return null;
    if (!isOrientation(draw.orientation)) return null;
    if (!obj.reversals && draw.orientation !== 'upright') return null;
    if (seen.has(draw.cardId)) return null;
    seen.add(draw.cardId);
    draws.push({
      positionId: draw.positionId as string,
      cardId: draw.cardId,
      orientation: draw.orientation,
    });
  }
  void CARD_ID_SET;
  return {
    v: 1,
    deckVersion: 'rws-1',
    lexiconVersion: 'zh-1',
    algo: 'fy-hkdf-2',
    spreadId: obj.spreadId,
    q: obj.q as string | null,
    reversals: obj.reversals,
    cutIndex: obj.cutIndex as number,
    commit: obj.commit as string,
    draws,
    ts: obj.ts as number,
  };
}
