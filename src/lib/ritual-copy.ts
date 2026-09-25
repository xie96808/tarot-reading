import type { RitualStage } from '@/lib/ritual-machine';

const LOCKED_SCENE = '已经锁住的场景会一起放下，不能带进下一局。';

export function abandonCopy(stage: RitualStage, sceneLocked = false): string {
  let text = '';
  if (stage === 'question' || stage === 'spread' || stage === 'shuffle') {
    text = '牌序还没有封存。放弃只会结束这一局；现在离开不会丢掉一副已经洗好的牌。';
  } else if (stage === 'cut' || stage === 'deal' || stage === 'reveal' || stage === 'read') {
    text = '牌序已经封存。放弃本局将丢掉这副牌，无法恢复。';
  }
  if (!text || !sceneLocked) return text;
  return `${text}${LOCKED_SCENE}`;
}
