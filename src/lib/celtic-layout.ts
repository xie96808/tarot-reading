export type Rect = { x: number; y: number; w: number; h: number };

export type CelticSlotGeom = {
  positionId: string;
  face: Rect;
  label: Rect;
  reveal: Rect;
  rotated: boolean;
};

export type CelticLayout = {
  board: { w: number; h: number };
  card: { w: number; h: number };
  slots: CelticSlotGeom[];
};

const TOP_PAD = 24;
const BOTTOM_PAD = 24;
const LABEL_H = 22;
const REVEAL_H = 44;
const BELOW_FACE = 8 + LABEL_H + 4 + REVEAL_H;

export function rectsIntersect(a: Rect, b: Rect): boolean {
  if (a.w <= 0 || a.h <= 0 || b.w <= 0 || b.h <= 0) return false;
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

function startingCardWidth(boardWidth: number): number {
  if (boardWidth >= 680) return 90;
  if (boardWidth >= 520) return 72;
  return 56;
}

function rowWidth(cardW: number, cardH: number): number {
  return cardW + 16 + cardH + 16 + cardW + 24 + cardW;
}

export function celticSlotLayout(
  boardWidth: number,
  options?: { interactive?: boolean },
): CelticLayout {
  const interactive = options?.interactive !== false;
  let cardW = startingCardWidth(boardWidth);
  let cardH = Math.round((cardW * 8) / 5);
  while (cardW > 36 && rowWidth(cardW, cardH) + 16 > boardWidth) {
    cardW -= 2;
    cardH = Math.round((cardW * 8) / 5);
  }
  const row = rowWidth(cardW, cardH);
  const left = (boardWidth - row) / 2;
  const pitch = cardH + 86;
  const pastX = left;
  const challengeX = pastX + cardW + 16;
  const futureX = challengeX + cardH + 16;
  const staffX = futureX + cardW + 24;
  const presentX = challengeX + cardH / 2 - cardW / 2;
  const pairW = (cardH - 8) / 2;
  const rows = [TOP_PAD, TOP_PAD + pitch, TOP_PAD + pitch * 2, TOP_PAD + pitch * 3];
  const zero: Rect = { x: 0, y: 0, w: 0, h: 0 };

  function upright(positionId: string, x: number, y: number): CelticSlotGeom {
    const face = { x, y, w: cardW, h: cardH };
    const label = { x, y: y + cardH + 8, w: cardW, h: LABEL_H };
    const reveal = interactive
      ? { x, y: label.y + LABEL_H + 4, w: cardW, h: REVEAL_H }
      : zero;
    return { positionId, face, label, reveal, rotated: false };
  }

  const presentFaceY = rows[1];
  const presentLabel = { x: challengeX, y: presentFaceY + cardH + 8, w: pairW, h: LABEL_H };
  const challengeLabel = { x: challengeX + pairW + 8, y: presentLabel.y, w: pairW, h: LABEL_H };
  const present: CelticSlotGeom = {
    positionId: 'present',
    face: { x: presentX, y: presentFaceY, w: cardW, h: cardH },
    label: presentLabel,
    reveal: interactive ? { x: presentLabel.x, y: presentLabel.y + LABEL_H + 4, w: pairW, h: REVEAL_H } : zero,
    rotated: false,
  };
  const challenge: CelticSlotGeom = {
    positionId: 'challenge',
    face: { x: challengeX, y: presentFaceY + (cardH - cardW) / 2, w: cardH, h: cardW },
    label: challengeLabel,
    reveal: interactive ? { x: challengeLabel.x, y: challengeLabel.y + LABEL_H + 4, w: pairW, h: REVEAL_H } : zero,
    rotated: true,
  };

  const slots: CelticSlotGeom[] = [
    present,
    challenge,
    upright('foundation', presentX, rows[2]),
    upright('past', pastX, rows[1]),
    upright('crown', presentX, rows[0]),
    upright('future', futureX, rows[1]),
    upright('self', staffX, rows[3]),
    upright('environment', staffX, rows[2]),
    upright('hopes_fears', staffX, rows[1]),
    upright('outcome', staffX, rows[0]),
  ];

  return {
    board: {
      w: boardWidth,
      h: TOP_PAD + pitch * 3 + cardH + BELOW_FACE + BOTTOM_PAD,
    },
    card: { w: cardW, h: cardH },
    slots,
  };
}
