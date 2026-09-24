import type { SceneId } from '@/lib/scene';
import type { Orientation } from '@/lib/shuffle';
import type { PauseAction, PauseOffer } from '@/data/lexicons/zh-1/pauses/types';

function action(id: string, kind: PauseAction['kind'], labelZh: string, sentenceZh: string): PauseAction {
  return { id, kind, labelZh, sentenceZh };
}

export const PAUSE_EXAMPLES: readonly PauseOffer[] = [
  {
    sceneId: 'door',
    cardId: 'cups_01_ace',
    orientation: 'upright',
    pauseIndex: 1,
    promptZh: '门缝里是一只还没被命名的杯。你要先怎么待它？',
    actions: [
      action('name', 'engage', '先给它起名', '我先给这只杯起一个名字，不急着喝。'),
      action('sip', 'engage', '先喝一口', '我先喝一口，名字以后再说。'),
      action('leave', 'leave', '先把门带上', '我先把门带上，杯子留在门缝那边。'),
    ],
  },
  {
    sceneId: 'door',
    cardId: 'cups_02',
    orientation: 'upright',
    pauseIndex: 2,
    promptAfterActionZh: '沿着刚才那一步，门又开了一线。两只杯在同一高度。你要怎么待这次交换？',
    promptAfterSkipZh: '刚才你没有点。门又开了一线。两只杯在同一高度。你要怎么待这次交换？',
    actions: [
      action('level', 'engage', '把杯子递到同一高度', '我把杯子递到和对方同一高度，不把对方当成答案。'),
      action('wait', 'engage', '先看清谁的杯子更高', '我先看清两只杯子是不是同一高度，再决定递不递。'),
      action('leave', 'leave', '先把门带上', '我先把门带上，这次交换留在门口。'),
    ],
  },
  {
    sceneId: 'door',
    cardId: 'cups_01_ace',
    orientation: 'reversed',
    pauseIndex: 1,
    promptZh: '门缝里这只杯口朝下。你要先怎么待这份没接住的开口？',
    actions: [
      action('cover', 'engage', '先把杯口转上来', '我先把杯口转上来，不急着解释它会打乱什么。'),
      action('name', 'engage', '先给堵住的地方起名', '我先给堵住的地方起一个名字。'),
      action('leave', 'leave', '先把门带上', '我先把门带上，杯口朝下的那只留在门缝那边。'),
    ],
  },
  {
    sceneId: 'hand',
    cardId: 'pents_01_ace',
    orientation: 'upright',
    pauseIndex: 1,
    promptZh: '掌心里是一枚还有重量的星币。你要先怎么待这颗种子？',
    actions: [
      action('plant', 'engage', '先把种子放进土里', '我先把这颗种子放进一块具体的土里。'),
      action('weigh', 'engage', '先称一称它的重量', '我先称一称手里的重量，不急着下锹。'),
      action('leave', 'leave', '放回桌上', '我把这枚星币放回桌上，没有接进手里。'),
    ],
  },
  {
    sceneId: 'hand',
    cardId: 'pents_page',
    orientation: 'upright',
    pauseIndex: 2,
    promptAfterActionZh: '沿着刚才那一步，掌心又多了一枚被端详的星币。你身上哪一种手艺够用在这一步？',
    promptAfterSkipZh: '刚才你没有点。掌心又多了一枚被端详的星币。你身上哪一种手艺够用在这一步？',
    actions: [
      action('craft', 'engage', '用正在学的那门手艺', '我用正在学的那门手艺，把第一步做完。'),
      action('small', 'engage', '先只做一个最小的动作', '我先做一个小到今天能做完的动作。'),
      action('leave', 'leave', '放回桌上', '我把侍从端详的这枚放回桌上。'),
    ],
  },
  {
    sceneId: 'door',
    cardId: 'pents_page',
    orientation: 'upright',
    pauseIndex: 2,
    promptAfterActionZh: '沿着刚才那一步，门缝里是一个把星币拿到眼前的人。你要怎么待这第一步？',
    promptAfterSkipZh: '刚才你没有点。门缝里是一个把星币拿到眼前的人。你要怎么待这第一步？',
    actions: [
      action('look', 'engage', '让他先把星币看清', '我让他把星币看清，再决定要不要进门。'),
      action('step', 'engage', '请他跨进门来', '我请他跨进门来，第一步在门槛里边。'),
      action('leave', 'leave', '先把门带上', '我先把门带上，侍从还在门外。'),
    ],
  },
];

export function lookupPauseOffer(
  sceneId: SceneId | null,
  cardId: string,
  orientation: Orientation,
  pauseIndex: 1 | 2,
): PauseOffer | null {
  if (sceneId !== 'door' && sceneId !== 'hand') return null;
  return (
    PAUSE_EXAMPLES.find(
      (offer) =>
        offer.sceneId === sceneId &&
        offer.cardId === cardId &&
        offer.orientation === orientation &&
        offer.pauseIndex === pauseIndex,
    ) ?? null
  );
}
