import type { Astrology, Element } from '@/data/lexicons/zh-1/types';

export const ELEMENT_LABEL = {
  fire: '火',
  water: '水',
  air: '风',
  earth: '土',
} as const satisfies Record<Element, string>;

export const ASTROLOGY_LABEL = {
  uranus: '天王星',
  mercury: '水星',
  moon: '月亮',
  venus: '金星',
  aries: '白羊座',
  taurus: '金牛座',
  gemini: '双子座',
  cancer: '巨蟹座',
  leo: '狮子座',
  virgo: '处女座',
  jupiter: '木星',
  libra: '天秤座',
  neptune: '海王星',
  scorpio: '天蝎座',
  sagittarius: '射手座',
  capricorn: '摩羯座',
  mars: '火星',
  aquarius: '水瓶座',
  pisces: '双鱼座',
  sun: '太阳',
  pluto: '冥王星',
  saturn: '土星',
} as const satisfies Record<Astrology, string>;

export function formatCardMeta(card: { element: Element; astrology: Astrology | null }): string {
  const element = `元素 ${ELEMENT_LABEL[card.element]}`;
  if (!card.astrology) return element;
  return `${element} · 星对应 ${ASTROLOGY_LABEL[card.astrology]}`;
}
