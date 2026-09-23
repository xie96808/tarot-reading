import { SPREADS, type SpreadId } from '@/data/lexicons/zh-1/spreads';
import type { CardLexicon, MeaningEntry, Mode, Theme } from '@/data/lexicons/zh-1/types';
import type { Draw } from '@/lib/shuffle';

export type RelationHit = {
  edgeId: string;
  ruleId: 'R1_REPEAT' | 'R2_TENSION' | 'R3_TURN' | 'R4_BRIDGE';
  sourcePositionIds: [string, string];
  sourceCardIds: [string, string];
  text: string;
};

export type StatLine = {
  kind: 'reversed' | 'majors' | 'element';
  text: string;
};

export type PositionReading = {
  positionId: string;
  positionNameZh: string;
  frameZh: string;
  cardId: string;
  nameZh: string;
  orientation: Draw['orientation'];
  keywords: string[];
  meaning: string;
  reflection: string;
};

export type ReadingDocument = {
  spreadId: SpreadId;
  positions: PositionReading[];
  relations: RelationHit[];
  stats: StatLine[];
  synthesis: string;
  takeaway: string;
};

const THEME_ZH: Record<Theme, string> = {
  begin: '开端',
  act: '行动',
  pause: '停驻',
  release: '放下',
  connect: '连结',
  discern: '辨认',
  sustain: '维持',
  integrate: '收束整合',
};

const MODE_ZH: Record<Mode, string> = {
  flow: '流动',
  inward: '向内',
  blocked: '受阻',
  excess: '过度',
};

const TENSION_PAIRS: Array<[Theme, Theme]> = [
  ['act', 'pause'],
  ['begin', 'release'],
  ['connect', 'discern'],
  ['sustain', 'release'],
];

const ELEMENT_ZH = {
  fire: '行动与意志',
  water: '情感与联系',
  air: '思想与辨别',
  earth: '日常资源与节奏',
} as const;

function themePair(a: Theme, b: Theme): boolean {
  return TENSION_PAIRS.some(
    ([x, y]) => (a === x && b === y) || (a === y && b === x),
  );
}

function meaningOf(card: CardLexicon, orientation: Draw['orientation']): MeaningEntry {
  return orientation === 'upright' ? card.upright : card.reversed;
}

export function buildPositionReadings(
  spreadId: SpreadId,
  draws: Draw[],
  cards: Record<string, CardLexicon>,
): PositionReading[] {
  const spread = SPREADS[spreadId];
  return spread.positions.map((position) => {
    const draw = draws.find((d) => d.positionId === position.id);
    if (!draw) throw new Error(`missing draw for ${position.id}`);
    const card = cards[draw.cardId];
    if (!card) throw new Error(`missing lexicon for ${draw.cardId}`);
    const meaning = meaningOf(card, draw.orientation);
    return {
      positionId: position.id,
      positionNameZh: position.nameZh,
      frameZh: position.frameZh,
      cardId: draw.cardId,
      nameZh: card.nameZh,
      orientation: draw.orientation,
      keywords: meaning.keywords,
      // Position-aware lead so past/future/outcome don't read as a naked lexicon dump.
      meaning: `在「${position.nameZh}」这个位置上，${meaning.meaning}`,
      reflection: meaning.reflection,
    };
  });
}

export function relationForEdge(
  spreadId: SpreadId,
  left: PositionReading,
  right: PositionReading,
  cards: Record<string, CardLexicon>,
): RelationHit {
  const spread = SPREADS[spreadId];
  const isTime = spread.timeEdges.some(([a, b]) => a === left.positionId && b === right.positionId);
  const leftCard = cards[left.cardId];
  const rightCard = cards[right.cardId];
  const leftM = meaningOf(leftCard, left.orientation);
  const rightM = meaningOf(rightCard, right.orientation);
  const edgeId = `${left.positionId}->${right.positionId}`;
  const sourcePositionIds: [string, string] = [left.positionId, right.positionId];
  const sourceCardIds: [string, string] = [left.cardId, right.cardId];

  if (leftM.theme === rightM.theme) {
    return {
      edgeId,
      ruleId: 'R1_REPEAT',
      sourcePositionIds,
      sourceCardIds,
      text: `${left.positionNameZh}与${right.positionNameZh}都谈到${THEME_ZH[leftM.theme]}，可留意这个主题如何在两个位置重复出现。`,
    };
  }
  if (themePair(leftM.theme, rightM.theme)) {
    return {
      edgeId,
      ruleId: 'R2_TENSION',
      sourcePositionIds,
      sourceCardIds,
      text: `一端关乎${THEME_ZH[leftM.theme]}，另一端关乎${THEME_ZH[rightM.theme]}；先读作需要协调的两种需求，而不是互相抵消。`,
    };
  }
  // R3 only when both ends are charged modes that differ — avoids flow↔anything sweeping to R3.
  const charged = (mode: typeof leftM.mode) =>
    mode === 'inward' || mode === 'blocked' || mode === 'excess';
  const turning = leftM.mode !== rightM.mode && charged(leftM.mode) && charged(rightM.mode);
  if (turning) {
    const connector = isTime ? `从${left.positionNameZh}到${right.positionNameZh}` : `${left.positionNameZh}与${right.positionNameZh}`;
    return {
      edgeId,
      ruleId: 'R3_TURN',
      sourcePositionIds,
      sourceCardIds,
      text: `${connector}，表达方式从${MODE_ZH[leftM.mode]}转向${MODE_ZH[rightM.mode]}；结合各位正文，看转换发生在何处。`,
    };
  }
  return {
    edgeId,
    ruleId: 'R4_BRIDGE',
    sourcePositionIds,
    sourceCardIds,
    text: isTime
      ? `${left.positionNameZh}提示${leftM.keywords[0]}，${right.positionNameZh}提示${rightM.keywords[0]}；这两处可以放在一起观察，不必急于合成同一个答案。`
      : `${left.positionNameZh}提示${leftM.keywords[0]}，${right.positionNameZh}提示${rightM.keywords[0]}；这两处并置出现，不必急于合成同一个答案。`,
  };
}

export function collectStats(
  spreadId: SpreadId,
  draws: Draw[],
  cards: Record<string, CardLexicon>,
): StatLine[] {
  if (spreadId === 'single') return [];
  const n = draws.length;
  const reversed = draws.filter((d) => d.orientation === 'reversed').length;
  const majors = draws.filter((d) => cards[d.cardId]?.arcana === 'major').length;
  const counts: Record<string, number> = { fire: 0, water: 0, air: 0, earth: 0 };
  for (const draw of draws) counts[cards[draw.cardId].element] += 1;
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const uniqueMode = ranked[0][1] !== ranked[1][1] && ranked[0][1] >= 2;
  const candidates: StatLine[] = [];
  if (reversed >= n / 2) {
    candidates.push({
      kind: 'reversed',
      text: '这组牌逆位偏多，可多留意各张自身的细微差别，而不必先统一成同一种语气。',
    });
  }
  if (majors >= n / 2) {
    candidates.push({
      kind: 'majors',
      text: '这组象征更偏向阶段性主题，不只是日常细节。',
    });
  }
  if (uniqueMode) {
    const element = ranked[0][0] as keyof typeof ELEMENT_ZH;
    candidates.push({
      kind: 'element',
      text: `元素更偏向${ELEMENT_ZH[element]}。`,
    });
  }
  return candidates.slice(0, 2);
}

export function composeReading(
  spreadId: SpreadId,
  draws: Draw[],
  cards: Record<string, CardLexicon>,
): ReadingDocument {
  const positions = buildPositionReadings(spreadId, draws, cards);
  const byId = Object.fromEntries(positions.map((p) => [p.positionId, p]));
  const spread = SPREADS[spreadId];
  const relations = spread.relationEdges.map(([a, b]) =>
    relationForEdge(spreadId, byId[a], byId[b], cards),
  );
  const stats = collectStats(spreadId, draws, cards);
  const focus = byId[spread.focusPositionId];
  const synthesis = buildSynthesis(spreadId, positions, relations, stats);
  return {
    spreadId,
    positions,
    relations,
    stats,
    synthesis,
    takeaway: focus.reflection,
  };
}

function buildSynthesis(
  spreadId: SpreadId,
  positions: PositionReading[],
  relations: RelationHit[],
  stats: StatLine[],
): string {
  const statText = stats.map((s) => s.text).join('');
  if (spreadId === 'single') {
    const p = positions[0];
    return `${p.nameZh}被读作此刻的一股力量：${p.keywords.slice(0, 3).join('、')}。${statText}`.trim();
  }
  if (spreadId === 'three') {
    return `${relations.map((r) => r.text).join('')}${statText}`;
  }
  const groups = {
    core: relations.filter((r) => r.edgeId.startsWith('present->') || r.edgeId.startsWith('foundation->present')),
    path: relations.filter((r) => r.edgeId === 'past->future' || r.edgeId === 'crown->outcome' || r.edgeId === 'foundation->present'),
    people: relations.filter((r) => r.edgeId === 'self->environment' || r.edgeId === 'hopes_fears->outcome'),
    close: relations.filter((r) => r.edgeId.endsWith('->outcome')),
  };
  const core = groups.core.map((r) => r.text).join('');
  const path = relations.filter((r) => r.edgeId === 'past->future' || r.edgeId === 'crown->outcome').map((r) => r.text).join('');
  const people = relations.filter((r) => r.edgeId === 'self->environment').map((r) => r.text).join('');
  const close = relations.filter((r) => r.edgeId === 'hopes_fears->outcome').map((r) => r.text).join('');
  return `当下核心：${core}\n来处与走向：${path}\n内外视角：${people}\n条件性收束：${close}${statText ? `\n${statText}` : ''}`;
}

export function usedCardIds(doc: ReadingDocument): string[] {
  return [
    ...doc.positions.map((p) => p.cardId),
    ...doc.relations.flatMap((r) => r.sourceCardIds),
  ];
}
