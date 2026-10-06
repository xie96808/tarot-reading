import type { SceneVisual } from '@/lib/scene-beats';

type RevealLike = {
  stage: string;
  revealed: readonly string[];
  pause?: { positionId: string } | null;
  futureBeat?: string | null;
};

/**
 * How many cards are face-up on the table / in palm right now.
 * Includes the 推门/过手 pause card (partial) before it is sealed into `revealed`.
 */
export function faceUpRevealCount(
  state: RevealLike,
  sceneVisuals?: Partial<Record<string, SceneVisual>> | null,
): number {
  if (state.stage !== 'reveal' && state.stage !== 'read') return 0;
  const ids = new Set(state.revealed);
  if (state.stage === 'reveal' && state.pause?.positionId) {
    ids.add(state.pause.positionId);
  }
  if (sceneVisuals) {
    for (const [positionId, visual] of Object.entries(sceneVisuals)) {
      if (visual && visual !== 'back') ids.add(positionId);
    }
  }
  return ids.size;
}
