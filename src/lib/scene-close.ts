import type { PauseOffer } from '@/data/lexicons/zh-1/pauses/types';
import type { CardLexicon } from '@/data/lexicons/zh-1/types';
import { COPY } from '@/i18n/zh-CN';
import type { SceneId } from '@/lib/scene';
import type { Draw, Orientation } from '@/lib/shuffle';

export type PauseResolution =
  | { index: 1 | 2; kind: 'skip' }
  | { index: 1 | 2; kind: 'missing' }
  | { index: 1 | 2; kind: 'action'; actionId: string; custom: string };

type SceneCloseInput = {
  sceneId: SceneId;
  past: PauseResolution;
  present: PauseResolution;
  draws: [Draw, Draw, Draw];
  cards: Record<string, CardLexicon>;
  lookup: (
    sceneId: SceneId,
    cardId: string,
    orientation: Orientation,
    pauseIndex: 1 | 2,
  ) => PauseOffer | null;
};

const SCENE_LINE: Record<SceneId, string> = {
  door: '这局你选的是推门：门口出现什么由牌决定，房间怎么开由这扇门决定。',
  hand: '这局你选的是过手：手里出现什么由牌决定，手怎么放由这只手决定。',
};

export function composeSceneClose(input: SceneCloseInput): {
  sentences: [string, string, string, string];
  kept: Array<{ index: 1 | 2; text: string }>;
} {
  const pastDraw = drawFor(input.draws, 'past');
  const presentDraw = drawFor(input.draws, 'present');
  const futureDraw = drawFor(input.draws, 'future');
  assertSlot(input.past, 1);
  assertSlot(input.present, 2);

  const pastAction = actionOn(input, pastDraw, input.past);
  const presentAction = actionOn(input, presentDraw, input.present);
  const pastName = displayName(input.cards, pastDraw);
  const presentName = displayName(input.cards, presentDraw);
  const futureName = displayName(input.cards, futureDraw);

  const kept: Array<{ index: 1 | 2; text: string }> = [];
  const pastKept = keptText(input.past, pastAction);
  if (pastKept) kept.push({ index: input.past.index, text: pastKept });
  const presentKept = keptText(input.present, presentAction);
  if (presentKept) kept.push({ index: input.present.index, text: presentKept });

  return {
    sentences: [
      SCENE_LINE[input.sceneId],
      pauseSentence('过去', pastName, input.past, pastAction),
      pauseSentence('现在', presentName, input.present, presentAction),
      futureSentence(input.past.kind, input.present.kind, futureName),
    ],
    kept,
  };
}

function drawFor(draws: readonly Draw[], positionId: 'past' | 'present' | 'future'): Draw {
  const draw = draws.find((item) => item.positionId === positionId);
  if (!draw) throw new Error(`missing draw for ${positionId}`);
  return draw;
}

function assertSlot(resolution: PauseResolution, index: 1 | 2): void {
  if (resolution.index !== index) {
    throw new Error(`pause index ${resolution.index} does not match ${index}`);
  }
}

function displayName(cards: Record<string, CardLexicon>, draw: Draw): string {
  const nameZh = cards[draw.cardId]?.nameZh;
  if (!nameZh) throw new Error(`missing lexicon for ${draw.cardId}`);
  const orient = draw.orientation === 'reversed' ? COPY.reversed : COPY.upright;
  return `${nameZh}（${orient}）`;
}

function actionOn(
  input: SceneCloseInput,
  draw: Draw,
  resolution: PauseResolution,
): { labelZh: string; sentenceZh: string } | null {
  if (resolution.kind !== 'action') return null;
  const offer = input.lookup(input.sceneId, draw.cardId, draw.orientation, resolution.index);
  if (!offer) throw new Error(`pause offer missing for ${draw.cardId}`);
  const action = offer.actions.find((item) => item.id === resolution.actionId);
  if (!action) throw new Error(`pause action missing: ${resolution.actionId}`);
  return action;
}

function customText(resolution: PauseResolution): string {
  if (resolution.kind !== 'action') return '';
  return resolution.custom.trim();
}

function pauseSentence(
  when: '过去' | '现在',
  name: string,
  resolution: PauseResolution,
  action: { labelZh: string } | null,
): string {
  if (resolution.kind === 'missing') {
    return `${when}这一停，${name}前，这一停没有写好的步骤。`;
  }
  if (resolution.kind === 'skip') {
    return `${when}这一停，${name}前，你没有点选。`;
  }
  if (!action) throw new Error(`pause offer missing`);
  const custom = customText(resolution);
  if (!custom) return `${when}这一停，${name}前，你点了「${action.labelZh}」。`;
  return `${when}这一停，${name}前，你点了「${action.labelZh}」，并改成自己的话：「${custom}」。`;
}

function keptText(
  resolution: PauseResolution,
  action: { sentenceZh: string } | null,
): string | null {
  if (resolution.kind !== 'action') return null;
  const custom = customText(resolution);
  if (custom) return custom;
  if (!action) throw new Error(`pause offer missing`);
  return action.sentenceZh;
}

function futureSentence(past: PauseResolution['kind'], present: PauseResolution['kind'], futureName: string): string {
  if (past === 'missing' || present === 'missing') {
    return `写好的步骤没有齐，这张${futureName}是已经进到视野里的画面。`;
  }
  if (past === 'action' && present === 'action') {
    return `若照你刚才点的两步再走，这张${futureName}是已经进到视野里的画面。`;
  }
  if (past === 'action') {
    return `若只沿你在过去点的那一步走，这张${futureName}是已经进到视野里的画面。`;
  }
  if (present === 'action') {
    return `若只沿你在现在点的那一步走，这张${futureName}是已经进到视野里的画面。`;
  }
  return `你没有在这两处停留，这张${futureName}是已经进到视野里的画面。`;
}
