export type SpreadId = 'single' | 'three' | 'celtic';

export type SpreadPosition = {
  id: string;
  drawOrder: number;
  nameZh: string;
  frameZh: string;
  group?: 'core' | 'path' | 'people' | 'close';
};

export type SpreadDefinition = {
  id: SpreadId;
  nameZh: string;
  titleZh: string;
  blurbZh: string;
  durationZh: string;
  positions: SpreadPosition[];
  relationEdges: Array<[string, string]>;
  timeEdges: Array<[string, string]>;
  focusPositionId: string;
};

export const SPREADS: Record<SpreadId, SpreadDefinition> = {
  single: {
    id: 'single',
    nameZh: '一束微光',
    titleZh: '单张',
    blurbZh: '给此刻一个观察的焦点',
    durationZh: '2–3 分钟',
    focusPositionId: 'focus',
    relationEdges: [],
    timeEdges: [],
    positions: [
      {
        id: 'focus',
        drawOrder: 1,
        nameZh: '此刻',
        frameZh: '把它读作此刻值得注意的一股力量，而不是整个问题的裁决。',
      },
    ],
  },
  three: {
    id: 'three',
    nameZh: '时间之河',
    titleZh: '三张',
    blurbZh: '看见过去、现在与可能的走向',
    durationZh: '5–8 分钟',
    focusPositionId: 'present',
    relationEdges: [
      ['past', 'present'],
      ['present', 'future'],
    ],
    timeEdges: [
      ['past', 'present'],
      ['present', 'future'],
    ],
    positions: [
      {
        id: 'past',
        drawOrder: 1,
        nameZh: '过去',
        frameZh: '把它读作已发生、仍托住或正在消退的影响；别把它当作正在发生的事实。',
      },
      {
        id: 'present',
        drawOrder: 2,
        nameZh: '现在',
        frameZh: '把它读作你此刻所站的位置：什么在运作，什么需要看见。',
      },
      {
        id: 'future',
        drawOrder: 3,
        nameZh: '未来',
        frameZh:
          '若当前的方式延续，这可能是接下来值得留意的方向；改变行动也会改变处境。',
      },
    ],
  },
  celtic: {
    id: 'celtic',
    nameZh: '处境之镜',
    titleZh: '凯尔特十字',
    blurbZh: '认真展开一件复杂的事',
    durationZh: '10–15 分钟',
    focusPositionId: 'self',
    relationEdges: [
      ['present', 'challenge'],
      ['foundation', 'present'],
      ['past', 'future'],
      ['crown', 'outcome'],
      ['self', 'environment'],
      ['hopes_fears', 'outcome'],
    ],
    timeEdges: [
      ['past', 'future'],
      ['crown', 'outcome'],
    ],
    positions: [
      {
        id: 'present',
        drawOrder: 1,
        nameZh: '现状',
        frameZh: '此事的核心场，你当前被什么包围',
        group: 'core',
      },
      {
        id: 'challenge',
        drawOrder: 2,
        nameZh: '横跨',
        frameZh: '与现状交织的力量；可能阻碍，也可能要求回应',
        group: 'core',
      },
      {
        id: 'foundation',
        drawOrder: 3,
        nameZh: '根基',
        frameZh: '更深的原因，以及身体、资源与现实条件',
        group: 'path',
      },
      {
        id: 'past',
        drawOrder: 4,
        nameZh: '过去',
        frameZh: '正在离开、却仍留下作用的一章',
        group: 'path',
      },
      {
        id: 'crown',
        drawOrder: 5,
        nameZh: '冠位',
        frameZh: '你所设想的目标或最好可能；不是已经到手的结果',
        group: 'path',
      },
      {
        id: 'future',
        drawOrder: 6,
        nameZh: '近未来',
        frameZh: '若当前动力延续，将进入视野的变化',
        group: 'path',
      },
      {
        id: 'self',
        drawOrder: 7,
        nameZh: '自我',
        frameZh: '你对自身位置的态度，不是人格诊断',
        group: 'people',
      },
      {
        id: 'environment',
        drawOrder: 8,
        nameZh: '环境',
        frameZh: '外部条件与互动视角；不声称读到他人的隐秘思想',
        group: 'people',
      },
      {
        id: 'hopes_fears',
        drawOrder: 9,
        nameZh: '希望与恐惧',
        frameZh: '期待与担忧如何指向同一件事',
        group: 'close',
      },
      {
        id: 'outcome',
        drawOrder: 10,
        nameZh: '结局',
        frameZh: '若前述力量延续，一种可能的收束；不是命定结局',
        group: 'close',
      },
    ],
  },
};

export function positionsFor(spreadId: SpreadId): SpreadPosition[] {
  return SPREADS[spreadId].positions;
}
