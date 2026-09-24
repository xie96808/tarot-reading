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
  question: string;
  framing: string;
  positions: PositionReading[];
  relations: RelationHit[];
  stats: StatLine[];
  synthesis: string;
  takeaway: string;
};

export const CELTIC_READING_GROUPS = [
  { id: 'core', title: '当下核心', positionIds: ['present', 'challenge'], edgeIds: ['present->challenge'] },
  { id: 'path', title: '来处与走向', positionIds: ['foundation', 'past', 'crown', 'future'], edgeIds: ['foundation->present', 'past->future', 'crown->outcome'] },
  { id: 'people', title: '内外视角', positionIds: ['self', 'environment'], edgeIds: ['self->environment'] },
  { id: 'close', title: '条件性收束', positionIds: ['hopes_fears', 'outcome'], edgeIds: ['hopes_fears->outcome'] },
] as const;

export type ReadingGroup = {
  id: string;
  title: string;
  positions: PositionReading[];
  relations: RelationHit[];
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
      text: `${left.positionNameZh}关乎${THEME_ZH[leftM.theme]}，${right.positionNameZh}关乎${THEME_ZH[rightM.theme]}；先读作需要协调的两种需求，而不是互相抵消。`,
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

function named(draws: Draw[], cards: Record<string, CardLexicon>, pick: (draw: Draw) => boolean): string {
  return draws.filter(pick).map((draw) => cards[draw.cardId].nameZh).join('、');
}

export function collectStats(
  spreadId: SpreadId,
  draws: Draw[],
  cards: Record<string, CardLexicon>,
): StatLine[] {
  if (spreadId === 'single') return [];
  const n = draws.length;
  const reversedDraws = draws.filter((d) => d.orientation === 'reversed');
  const majorDraws = draws.filter((d) => cards[d.cardId]?.arcana === 'major');
  const counts: Record<string, number> = { fire: 0, water: 0, air: 0, earth: 0 };
  for (const draw of draws) counts[cards[draw.cardId].element] += 1;
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const uniqueMode = ranked[0][1] !== ranked[1][1] && ranked[0][1] >= 2;
  const candidates: StatLine[] = [];
  if (reversedDraws.length >= n / 2) {
    candidates.push({
      kind: 'reversed',
      text: `这组 ${n} 张里有 ${reversedDraws.length} 张逆位（${named(draws, cards, (d) => d.orientation === 'reversed')}），读作较多内在、受阻或过度的表达，仍需结合各牌分别理解。`,
    });
  }
  if (majorDraws.length >= n / 2) {
    candidates.push({
      kind: 'majors',
      text: `这组 ${n} 张里有 ${majorDraws.length} 张大阿尔卡纳（${named(draws, cards, (d) => cards[d.cardId].arcana === 'major')}），象征更偏向阶段性主题，不只是日常细节。`,
    });
  }
  if (uniqueMode) {
    const element = ranked[0][0] as keyof typeof ELEMENT_ZH;
    const elementNames = named(draws, cards, (d) => cards[d.cardId].element === element);
    candidates.push({
      kind: 'element',
      text: `元素更偏向${ELEMENT_ZH[element]}（${ranked[0][1]} 张：${elementNames}）。`,
    });
  }
  return candidates.slice(0, 2);
}

export function framingLine(question: string): string {
  const q = question.trim();
  if (!q) return '这次没有写下问题。下面是按牌位读这组牌，不是对某个具体问题的回答。';
  return `你问的是「${q}」。下面不回答这个问题，只把这组牌当作看它的一副镜片：牌义来自词库，不根据问题改写。`;
}

export function takeawayLine(question: string, focus: PositionReading): string {
  const q = question.trim();
  if (!q) return focus.reflection;
  const orient = focus.orientation === 'reversed' ? '逆位' : '正位';
  return `若把「${q}」放在「${focus.positionNameZh}」这个位置上看，${focus.nameZh}（${orient}）留给你的仍是词库里的这句自问。「${focus.reflection}」牌没有根据问题改写这句，也没有替你作答。`;
}

export const RULE_WHY_ZH: Record<RelationHit['ruleId'], string> = {
  R1_REPEAT: '这两张牌的主题标签相同，所以读成同一个主题在两个位置重复出现，而不是两件无关的事。',
  R2_TENSION: '这两张牌的主题是一对需要协调的张力，所以先并置两种需求，不把它们读成互相抵消。',
  R3_TURN: '这两张牌的表达方式不同，且至少一端偏向内在、受阻或过度，所以读成表达方式的转换。',
  R4_BRIDGE: '这两张牌没有命中重复、张力或转换，所以只把两个位置的关键词并置，不合成同一个答案。',
};

export function whyForRelation(rel: RelationHit, positions: PositionReading[]): string {
  const left = positions.find((p) => p.positionId === rel.sourcePositionIds[0])?.positionNameZh;
  const right = positions.find((p) => p.positionId === rel.sourcePositionIds[1])?.positionNameZh;
  return `${left}与${right}：${RULE_WHY_ZH[rel.ruleId]}`;
}

export function readingGroups(doc: ReadingDocument): ReadingGroup[] | null {
  if (doc.spreadId !== 'celtic') return null;
  const byPos = Object.fromEntries(doc.positions.map((position) => [position.positionId, position]));
  const byEdge = Object.fromEntries(doc.relations.map((rel) => [rel.edgeId, rel]));
  return CELTIC_READING_GROUPS.map((group) => ({
    id: group.id,
    title: group.title,
    positions: group.positionIds.map((id) => byPos[id]),
    relations: group.edgeIds.map((id) => byEdge[id]),
  }));
}

export function composeReading(
  spreadId: SpreadId,
  draws: Draw[],
  cards: Record<string, CardLexicon>,
  question: string,
): ReadingDocument {
  const trimmed = question.trim();
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
    question: trimmed,
    framing: framingLine(trimmed),
    positions,
    relations,
    stats,
    synthesis,
    takeaway: takeawayLine(trimmed, focus),
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
    const focus = positions[0];
    return `${focus.nameZh}被读作此刻的一股力量：${focus.keywords.slice(0, 3).join('、')}。${statText}`.trim();
  }
  if (spreadId === 'three') {
    const body = relations.map((rel) => rel.text).join('\n');
    return statText ? `${body}\n${statText}` : body;
  }
  const body = CELTIC_READING_GROUPS.map((group) => {
    const text = group.edgeIds.map((id) => relations.find((rel) => rel.edgeId === id)?.text ?? '').join('');
    return `${group.title}：${text}`;
  }).join('\n');
  return statText ? `${body}\n${statText}` : body;
}

export function usedCardIds(doc: ReadingDocument): string[] {
  return [
    ...doc.positions.map((p) => p.cardId),
    ...doc.relations.flatMap((r) => r.sourceCardIds),
  ];
}
