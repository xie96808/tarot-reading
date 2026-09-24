import type { RitualStage } from '@/lib/ritual-machine';

export function abandonCopy(stage: RitualStage): string {
  if (stage === 'question' || stage === 'spread' || stage === 'shuffle') {
    return '牌序还没有封存。放弃只会结束这一局；现在离开不会丢掉一副已经洗好的牌。';
  }
  if (stage === 'cut' || stage === 'deal' || stage === 'reveal' || stage === 'read') {
    return '牌序已经封存。放弃本局将丢掉这副牌，无法恢复。';
  }
  return '';
}
