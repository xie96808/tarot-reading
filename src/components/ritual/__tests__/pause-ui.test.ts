import { createElement, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { lookupPauseOffer } from '@/data/lexicons/zh-1/pauses';
import { PauseSheet } from '@/components/ritual/PauseSheet';
import { SceneCloseView } from '@/components/ritual/SceneCloseView';

const offer = lookupPauseOffer('door', 'cups_01_ace', 'upright', 1);
if (!offer || offer.pauseIndex !== 1) throw new Error('missing door pause offer');

const noop = () => undefined;

function html(node: ReactElement): string {
  return renderToStaticMarkup(node);
}

describe('PauseSheet', () => {
  it('renders the locked choosing lines and keeps actions disabled until motion finishes', () => {
    const markup = html(
      createElement(PauseSheet, {
        sceneId: 'door',
        offer,
        phase: 'choosing',
        custom: '',
        previous: null,
        actionsEnabled: false,
        onChoose: noop,
        onCustom: noop,
        onConfirm: noop,
        onSkip: noop,
        onRevert: noop,
      }),
    );
    expect(markup).toContain('门缝里先只露出大半张。点一步，或先不点。');
    expect(markup).toContain(offer.promptZh);
    expect(markup).toContain('先把门带上');
    expect(markup).toContain('先不选，看这张牌');
    expect(markup).toContain('href="/about#help"');
    expect(markup).toContain('方法页');
    expect(markup).not.toContain('也可以改成自己的话。');
    expect(markup).toContain('disabled=""');
    expect(markup).not.toContain('已写');
  });

  it('opens the single-line custom field only for writing', () => {
    const markup = html(
      createElement(PauseSheet, {
        sceneId: 'door',
        offer,
        phase: 'writing',
        custom: '一句',
        previous: null,
        actionsEnabled: true,
        onChoose: noop,
        onCustom: noop,
        onConfirm: noop,
        onSkip: noop,
        onRevert: noop,
      }),
    );
    expect(markup).toContain('也可以改成自己的话。');
    expect(markup).toContain('就用这句');
    expect(markup).toContain('返回这几个选择');
    expect(markup.toLowerCase()).toContain('enterkeyhint="done"');
    expect(markup).toContain('已写 2 / 40 字');
    expect(markup).not.toContain('先不选，看这张牌');
    expect(markup).not.toContain('先把门带上');
  });
});

describe('SceneCloseView', () => {
  const sentences = [
    '这局你选的是推门：门口出现什么由牌决定，房间怎么开由这扇门决定。',
    '过去这一停，圣杯王牌（正位）前，你点了「先给它起名」。',
    '现在这一停，圣杯二（正位）前，你没有点选。',
    '若只沿你在过去点的那一步走，这张权杖王牌（正位）是已经进到视野里的画面。',
  ] as [string, string, string, string];

  it('asks which sentence to keep when two actions exist', () => {
    const markup = html(
      createElement(SceneCloseView, {
        sentences,
        kept: [
          { index: 1, text: '我先给这只杯起一个名字，不急着喝。' },
          { index: 2, text: '我把杯子递到和对方同一高度，不把对方当成答案。' },
        ],
        keptIndex: null,
        selectable: true,
        skipped: [],
      }),
    );
    expect(markup).toContain('你点过的两步');
    expect(markup).toContain(sentences[3]);
    expect(markup).toContain('这两句里，留下哪一句给你自己？未来不是选项。');
    expect(markup).toContain('先选定要留下的那一句。');
    expect(markup).toContain('type="radio"');
    expect(markup).not.toContain('这是你的命运');
  });

  it('shows the single kept sentence without asking again', () => {
    const markup = html(
      createElement(SceneCloseView, {
        sentences,
        kept: [{ index: 1, text: '我先给这只杯起一个名字，不急着喝。' }],
        keptIndex: 1,
        selectable: true,
        skipped: [{ index: 2, text: sentences[2] }],
      }),
    );
    expect(markup).toContain('留下的是这一句。未来不是选项。');
    expect(markup).toContain('我先给这只杯起一个名字，不急着喝。');
    expect(markup).toContain(sentences[2]);
    expect(markup).not.toContain('type="radio"');
    expect(markup).not.toContain('先选定要留下的那一句。');
  });

  it('does not offer another choice on the end page', () => {
    const markup = html(
      createElement(SceneCloseView, {
        sentences,
        kept: [{ index: 1, text: '我先给这只杯起一个名字，不急着喝。' }],
        keptIndex: 1,
        selectable: false,
        skipped: [],
      }),
    );
    expect(markup).toContain(sentences[0]);
    expect(markup).toContain('我先给这只杯起一个名字，不急着喝。');
    expect(markup).not.toContain('这两句里，留下哪一句给你自己？');
    expect(markup).not.toContain('type="radio"');
  });
});
