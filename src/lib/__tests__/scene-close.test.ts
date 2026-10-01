import { describe, expect, it } from 'vitest';
import { CARDS } from '@/data/lexicons/zh-1';
import { lookupPauseOffer } from '@/data/lexicons/zh-1/pauses/examples';
import { composeReading } from '@/lib/reading';
import { composeSceneClose, type PauseResolution } from '@/lib/scene-close';
import type { Draw, Orientation } from '@/lib/shuffle';

const DOOR = '三张牌都在桌上。推门只决定怎么看，不改变已经抽出的牌。';
const HAND = '三张牌都在桌上。过手只决定怎么看，不改变已经抽出的牌。';
const FUTURE = '接下来是权杖王牌（正位）。这张在回应之前就已经抽出，刚才的选择不改变它。';
const ACE = '圣杯王牌（正位）';
const TWO = '圣杯二（正位）';
const ACE_REVERSED = '圣杯王牌（逆位）';

function seen(when: '过去' | '现在', name: string, line = ''): string {
  return `${when}这张是${name}。${line}`;
}

function spread(
  past: Draw['cardId'],
  present: Draw['cardId'],
  future: Draw['cardId'],
  pastOrientation: Orientation = 'upright',
): [Draw, Draw, Draw] {
  return [
    { positionId: 'present', cardId: present, orientation: 'upright' },
    { positionId: 'future', cardId: future, orientation: 'upright' },
    { positionId: 'past', cardId: past, orientation: pastOrientation },
  ];
}

const cups = () => spread('cups_01_ace', 'cups_02', 'wands_01_ace');

function skip(index: 1 | 2): PauseResolution {
  return { index, kind: 'skip' };
}

function missing(index: 1 | 2): PauseResolution {
  return { index, kind: 'missing' };
}

function action(index: 1 | 2, actionId: string, custom = ''): PauseResolution {
  return { index, kind: 'action', actionId, custom };
}

function close(
  sceneId: 'door' | 'hand',
  past: PauseResolution,
  present: PauseResolution,
  draws: [Draw, Draw, Draw],
  lookup: typeof lookupPauseOffer = lookupPauseOffer,
) {
  return composeSceneClose({ sceneId, past, present, draws, cards: CARDS, lookup });
}

describe('composeSceneClose', () => {
  it('locks skip/skip, action/skip, skip/action, and action/action', () => {
    const draws = cups();
    expect(close('door', skip(1), skip(2), draws).sentences).toEqual([
      DOOR,
      seen('过去', ACE),
      seen('现在', TWO),
      FUTURE,
    ]);
    expect(close('door', skip(1), skip(2), draws).kept).toEqual([]);
    expect(close('door', skip(1), skip(2), draws).sentences.join('\n')).not.toContain('你没有点选');

    expect(close('door', action(1, 'name'), skip(2), draws).sentences).toEqual([
      DOOR,
      seen('过去', ACE, '我先给这只杯起一个名字，不急着喝。'),
      seen('现在', TWO),
      FUTURE,
    ]);
    expect(close('door', action(1, 'name'), skip(2), draws).kept).toEqual([
      { index: 1, text: '我先给这只杯起一个名字，不急着喝。' },
    ]);

    expect(close('door', skip(1), action(2, 'level'), draws).sentences).toEqual([
      DOOR,
      seen('过去', ACE),
      seen('现在', TWO, '我把杯子递到和对方同一高度，不把对方当成答案。'),
      FUTURE,
    ]);
    expect(close('door', skip(1), action(2, 'level'), draws).kept).toEqual([
      { index: 2, text: '我把杯子递到和对方同一高度，不把对方当成答案。' },
    ]);

    const both = close('door', action(1, 'name'), action(2, 'level'), draws);
    expect(both.sentences).toEqual([
      DOOR,
      seen('过去', ACE, '我先给这只杯起一个名字，不急着喝。'),
      seen('现在', TWO, '我把杯子递到和对方同一高度，不把对方当成答案。'),
      FUTURE,
    ]);
    expect(both.sentences.join('\n')).not.toContain('你点了');
    expect(both.kept).toEqual([
      { index: 1, text: '我先给这只杯起一个名字，不急着喝。' },
      { index: 2, text: '我把杯子递到和对方同一高度，不把对方当成答案。' },
    ]);
  });

  it('keeps the door cups custom on the present sentence only', () => {
    const custom = '我只递到能看见对方眼睛的高度';
    const result = close('door', action(1, 'name'), action(2, 'level', custom), cups());
    expect(result.sentences).toEqual([
      DOOR,
      seen('过去', ACE, '我先给这只杯起一个名字，不急着喝。'),
      seen('现在', TWO, custom),
      FUTURE,
    ]);
    expect(result.sentences[2]).toContain(custom);
    expect(result.kept).toEqual([
      { index: 1, text: '我先给这只杯起一个名字，不急着喝。' },
      { index: 2, text: custom },
    ]);
  });

  it('accepts reversed cups ace cover and name', () => {
    const draws = spread('cups_01_ace', 'cups_02', 'wands_01_ace', 'reversed');
    const cover = close('door', action(1, 'cover'), skip(2), draws);
    expect(cover.sentences[1]).toBe(seen('过去', ACE_REVERSED, '我先把杯口转上来，不急着解释它会打乱什么。'));
    expect(cover.kept).toEqual([{ index: 1, text: '我先把杯口转上来，不急着解释它会打乱什么。' }]);

    const named = close('door', action(1, 'name'), skip(2), draws);
    expect(named.sentences[1]).toBe(seen('过去', ACE_REVERSED, '我先给堵住的地方起一个名字。'));
    expect(named.kept).toEqual([{ index: 1, text: '我先给堵住的地方起一个名字。' }]);
  });

  it('counts leave as an action', () => {
    const result = close('door', action(1, 'leave'), skip(2), cups());
    expect(result.sentences).toEqual([
      DOOR,
      seen('过去', ACE, '我先把门带上，杯子留在门缝那边。'),
      seen('现在', TWO),
      FUTURE,
    ]);
    expect(result.kept).toEqual([{ index: 1, text: '我先把门带上，杯子留在门缝那边。' }]);
  });

  it('locks the hand close for the pentacles example', () => {
    const result = close(
      'hand',
      action(1, 'plant'),
      action(2, 'craft'),
      spread('pents_01_ace', 'pents_page', 'wands_01_ace'),
    );
    expect(result.sentences).toEqual([
      HAND,
      seen('过去', '星币王牌（正位）', '我先把这颗种子放进一块具体的土里。'),
      seen('现在', '星币侍从（正位）', '我用正在学的那门手艺，把第一步做完。'),
      FUTURE,
    ]);
    expect(result.kept).toEqual([
      { index: 1, text: '我先把这颗种子放进一块具体的土里。' },
      { index: 2, text: '我用正在学的那门手艺，把第一步做完。' },
    ]);
  });

  it('uses the long missing sentence and not the screen line', () => {
    const pastMissing = close('door', missing(1), skip(2), cups(), () => null);
    expect(pastMissing.sentences).toEqual([
      DOOR,
      `${seen('过去', ACE)}这一停没有单独写好的步骤。`,
      seen('现在', TWO),
      FUTURE,
    ]);
    expect(pastMissing.sentences[1]).not.toBe('这一停没有写好的步骤。');
    expect(pastMissing.sentences[3]).not.toContain('仍');
    expect(pastMissing.kept).toEqual([]);

    const presentMissing = close('door', action(1, 'name'), missing(2), cups());
    expect(presentMissing.sentences[1]).toBe(seen('过去', ACE, '我先给这只杯起一个名字，不急着喝。'));
    expect(presentMissing.sentences[2]).toBe(`${seen('现在', TWO)}这一停没有单独写好的步骤。`);
    expect(presentMissing.sentences[3]).toBe(FUTURE);
    expect(presentMissing.sentences[3]).not.toContain('你没有点选');
    expect(presentMissing.sentences[3]).not.toContain('你刚才点的两步');
    expect(presentMissing.kept).toEqual([{ index: 1, text: '我先给这只杯起一个名字，不急着喝。' }]);
  });

  it('throws when an action has no offer or the action id is absent', () => {
    expect(() => close('door', action(1, 'name'), skip(2), cups(), () => null)).toThrow();
    expect(() => close('door', action(1, 'plant'), skip(2), cups())).toThrow();
  });

  it('keeps a period inside custom text from adding a fifth sentence', () => {
    const custom = '先停一下。再看。';
    const result = close('door', action(1, 'name', custom), skip(2), cups());
    expect(result.sentences).toHaveLength(4);
    expect(result.sentences[1]).toBe(seen('过去', ACE, custom));
    expect(result.kept).toEqual([{ index: 1, text: custom }]);
  });

  it('drops stray custom on skip and blank custom on an action', () => {
    const past = { index: 1 as const, kind: 'skip' as const, custom: '不该出现。' };
    const skipped = close('door', past as PauseResolution, action(2, 'level'), cups());
    expect(skipped.sentences[1]).toBe(seen('过去', ACE));
    expect(skipped.sentences.join('\n')).not.toContain('不该出现');
    expect(skipped.kept).toEqual([
      { index: 2, text: '我把杯子递到和对方同一高度，不把对方当成答案。' },
    ]);

    const blank = close('door', action(1, 'name', ' \n\t '), skip(2), cups());
    expect(blank.sentences[1]).toBe(seen('过去', ACE, '我先给这只杯起一个名字，不急着喝。'));
    expect(blank.kept).toEqual([{ index: 1, text: '我先给这只杯起一个名字，不急着喝。' }]);
  });

  it('does not change composeReading for the same spread', () => {
    const draws = cups();
    const question = '要不要推开这扇门';
    const before = composeReading('three', draws, CARDS, question);
    close('door', action(1, 'name', '我只递到能看见对方眼睛的高度。'), action(2, 'level'), draws);
    const after = composeReading('three', draws, CARDS, question);
    expect(after).toEqual(before);
  });
});
