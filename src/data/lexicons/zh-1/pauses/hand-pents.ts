import type { CardId } from '@/data/card-ids';
import type { Orientation } from '@/lib/shuffle';
import { PAUSE_EXAMPLES } from './examples';
import type { PauseAction, PauseOffer } from './types';

function action(
  id: string,
  kind: PauseAction['kind'],
  labelZh: string,
  sentenceZh: string,
): PauseAction {
  return { id, kind, labelZh, sentenceZh };
}

function steps(
  first: PauseAction,
  second: PauseAction,
  leaveSentenceZh: string,
): readonly [PauseAction, PauseAction, PauseAction] {
  return [first, second, action('leave', 'leave', '放回桌上', leaveSentenceZh)];
}

function pause1(
  cardId: CardId,
  orientation: Orientation,
  promptZh: string,
  actions: readonly [PauseAction, PauseAction, PauseAction],
): PauseOffer {
  return { sceneId: 'hand', cardId, orientation, pauseIndex: 1, promptZh, actions };
}

function pause2(
  cardId: CardId,
  orientation: Orientation,
  body: string,
  actions: readonly [PauseAction, PauseAction, PauseAction],
): PauseOffer {
  return {
    sceneId: 'hand',
    cardId,
    orientation,
    pauseIndex: 2,
    promptAfterActionZh: `沿着刚才那一步，${body}`,
    promptAfterSkipZh: `刚才你没有点。${body}`,
    actions,
  };
}

// Same object as examples.ts. Retyping would drift from the locked hand lines.
function locked(cardId: CardId, orientation: Orientation, pauseIndex: 1 | 2): PauseOffer {
  const found = PAUSE_EXAMPLES.find(
    (offer) =>
      offer.sceneId === 'hand' &&
      offer.cardId === cardId &&
      offer.orientation === orientation &&
      offer.pauseIndex === pauseIndex,
  );
  if (!found) {
    throw new Error(`missing locked hand offer ${cardId} ${orientation} ${pauseIndex}`);
  }
  return found;
}

export const HAND_PENTS_OFFERS: readonly PauseOffer[] = [
  locked('pents_01_ace', 'upright', 1),
  pause2(
    'pents_01_ace',
    'upright',
    '掌心里那枚星币仍被云中的手托着，下面是园门和一条土路。你要怎么安放这枚还在园门前的星币？',
    steps(
      action('gate', 'engage', '先看星币下的园门', '我先看星币下面那扇园门。'),
      action('path', 'engage', '先看园门前的土路', '我先看园门前那条土路。'),
      '我把云中的手和星币放回桌上。',
    ),
  ),
  pause1(
    'pents_01_ace',
    'reversed',
    '掌心里这张牌倒着，云中的手、星币、园门和土路仍印着。你要先把这枚星币转到哪一边？',
    steps(
      action('coin', 'engage', '先把星币转上来', '我先把这枚星币转上来。'),
      action('gate', 'engage', '先看倒着的园门', '我先看印在牌上的那扇园门。'),
      '我把倒着的星币放回桌上。',
    ),
  ),
  pause2(
    'pents_01_ace',
    'reversed',
    '牌仍倒在掌心，云中的手还托着星币，土路还在园门前。你要怎么放这条还印着的土路？',
    steps(
      action('path', 'engage', '先按住这条土路', '我先按住园门前这条土路。'),
      action('cloud', 'engage', '先看云里伸出的手', '我先看云里伸出的那只手。'),
      '我把倒着的园门和星币放回桌上。',
    ),
  ),
  pause1(
    'pents_02',
    'upright',
    '掌心里，一个人把两枚星币抛在浪上，两枚之间缠着带子，身后有船。你要先怎么待这两枚还在空中的星币？',
    steps(
      action('left', 'engage', '先看偏左的那枚', '我先看偏左的那一枚星币。'),
      action('ribbon', 'engage', '先看缠着的带子', '我先看两枚星币之间的带子。'),
      '我把浪上的两枚星币放回桌上。',
    ),
  ),
  pause2(
    'pents_02',
    'upright',
    '掌心里两枚星币仍在浪上交替，船还在后面。你要怎么安放这两枚还没落地的星币？',
    steps(
      action('one', 'engage', '先只接住其中一枚', '我先只接住其中一枚星币。'),
      action('ship', 'engage', '先看身后的船', '我先看身后那条船。'),
      '我把还在浪上的星币放回桌上。',
    ),
  ),
  pause1(
    'pents_02',
    'reversed',
    '掌心里这张牌倒着，两枚星币、带子、浪和船仍印着。你要先把哪一枚转到朝上？',
    steps(
      action('coin', 'engage', '先把其中一枚转上来', '我先把其中一枚星币转上来。'),
      action('ship', 'engage', '先看印着的船', '我先看牌上印着的那条船。'),
      '我把倒着的两枚星币放回桌上。',
    ),
  ),
  pause2(
    'pents_02',
    'reversed',
    '牌仍倒在掌心，带子还缠在两枚星币之间。你要怎么放这条还印着的带子？',
    steps(
      action('ribbon', 'engage', '先按住这条带子', '我先按住两枚星币之间的带子。'),
      action('waves', 'engage', '先看浪的纹', '我先看星币下面那些浪纹。'),
      '我把倒着的船和星币放回桌上。',
    ),
  ),
  pause1(
    'pents_03',
    'upright',
    '掌心里是一间工坊，柱上有三枚星币，图纸捧在手里，木槌和凿子放在台边。你要先怎么待柱上这三枚星币？',
    steps(
      action('pillar', 'engage', '先看柱上的三枚', '我先看柱上这三枚星币。'),
      action('plan', 'engage', '先看捧在手里的图纸', '我先看捧在手里的那张图纸。'),
      '我把柱上的星币和台边的工具放回桌上。',
    ),
  ),
  pause2(
    'pents_03',
    'upright',
    '掌心里三枚星币仍在柱上，图纸还在手里，木槌和凿子还在台边。你要怎么安放台边这把凿子？',
    steps(
      action('chisel', 'engage', '先看台边的凿子', '我先看放在台边的凿子。'),
      action('mallet', 'engage', '先看台边的木槌', '我先看放在台边的木槌。'),
      '我把捧着的图纸和柱上的星币放回桌上。',
    ),
  ),
  pause1(
    'pents_03',
    'reversed',
    '掌心里这张牌倒着，柱上的三枚星币、手里的图纸、木槌和凿子仍印着。你要先把图纸转到哪一边？',
    steps(
      action('plan', 'engage', '先把图纸转上来', '我先把捧在手里的图纸转上来。'),
      action('chisel', 'engage', '先看台边的凿子', '我先看放在台边的凿子。'),
      '我把倒着的柱和星币放回桌上。',
    ),
  ),
  pause2(
    'pents_03',
    'reversed',
    '牌仍倒在掌心，凿子和木槌还在台边，三枚星币还在柱上。你要怎么放这把还印在台边的凿子？',
    steps(
      action('chisel', 'engage', '先按住台边的凿子', '我先按住放在台边的凿子。'),
      action('pillar', 'engage', '先看柱上的三枚', '我先看柱上这三枚星币。'),
      '我把倒着的图纸和木槌放回桌上。',
    ),
  ),
  pause1(
    'pents_04',
    'upright',
    '掌心里，一个人坐着，一枚星币抱在胸口，一枚顶在头上，两枚压在脚下，城在身后。你要先怎么待这四枚星币？',
    steps(
      action('chest', 'engage', '先看胸口那一枚', '我先看抱在胸口的那一枚星币。'),
      action('city', 'engage', '先看身后的城', '我先看星币后面的那座城。'),
      '我把这四枚星币放回桌上。',
    ),
  ),
  pause2(
    'pents_04',
    'upright',
    '掌心里四枚星币仍分在胸口、头顶和脚下，城也还在后面。你要怎么安放顶在头上的那一枚？',
    steps(
      action('head', 'engage', '先看头顶的那一枚', '我先看顶在头上的那一枚星币。'),
      action('feet', 'engage', '先看脚下的两枚', '我先看压在脚下的两枚星币。'),
      '我把城和四枚星币放回桌上。',
    ),
  ),
  pause1(
    'pents_04',
    'reversed',
    '掌心里这张牌倒着，四枚星币、坐着的人和城仍印着。你要先把哪一枚转到朝上？',
    steps(
      action('chest', 'engage', '先把胸口那枚转上来', '我先把胸口那枚星币转上来。'),
      action('city', 'engage', '先看倒着的城', '我先看印在后面的那座城。'),
      '我把倒着的四枚星币放回桌上。',
    ),
  ),
  pause2(
    'pents_04',
    'reversed',
    '牌仍倒在掌心，两枚星币还压在脚下。你要怎么放这两枚还印在脚下的星币？',
    steps(
      action('feet', 'engage', '先按住脚下的星币', '我先按住压在脚下的两枚星币。'),
      action('head', 'engage', '先看顶在头上的那枚', '我先看还顶在头上的那枚星币。'),
      '我把倒着的城和星币放回桌上。',
    ),
  ),
  pause1(
    'pents_05',
    'upright',
    '掌心里，雪中两个人停在窗下，窗玻璃上嵌着五枚星币，窗里有光。你要先怎么待这扇嵌着星币的窗？',
    steps(
      action('pane', 'engage', '先看窗上的五枚星币', '我先看嵌在窗玻璃上的五枚星币。'),
      action('snow', 'engage', '先看窗下的雪', '我先看两个人脚边的雪。'),
      '我把这扇窗和雪放回桌上。',
    ),
  ),
  pause2(
    'pents_05',
    'upright',
    '掌心里五枚星币仍嵌在窗上，雪和窗里的光都还在。你要怎么安放窗里这点还亮着的光？',
    steps(
      action('light', 'engage', '先看窗里的光', '我先看窗里那一点光。'),
      action('pair', 'engage', '先看雪里的两个人', '我先看窗下雪里的两个人。'),
      '我把嵌着星币的窗放回桌上。',
    ),
  ),
  pause1(
    'pents_05',
    'reversed',
    '掌心里这张牌倒着，五枚星币、雪、窗和光仍印着。你要先把窗上的星币转到哪一边？',
    steps(
      action('pane', 'engage', '先把窗上的星币转上来', '我先把窗玻璃上的五枚星币转上来。'),
      action('snow', 'engage', '先看倒着的雪', '我先看印在窗下的雪。'),
      '我把倒着的窗放回桌上。',
    ),
  ),
  pause2(
    'pents_05',
    'reversed',
    '牌仍倒在掌心，两个人还停在有光的窗下。你要怎么放这扇还印着光的窗？',
    steps(
      action('light', 'engage', '先按住窗里的光', '我先按住窗里那一点光。'),
      action('glass', 'engage', '先看玻璃上的星币', '我先看还嵌在玻璃上的星币。'),
      '我把倒着的雪和窗放回桌上。',
    ),
  ),
  pause1(
    'pents_06',
    'upright',
    '掌心里有一把秤，星币从高处递向跪着的人。你要先怎么待这把秤和这些星币？',
    steps(
      action('scale', 'engage', '先看秤的两边', '我先看这把秤的两边。'),
      action('pass', 'engage', '先看递出的星币', '我先看正从高处递出的星币。'),
      '我把秤和星币放回桌上。',
    ),
  ),
  pause2(
    'pents_06',
    'upright',
    '掌心里秤还在，星币仍停在递出的半路上。你要怎么安放这枚还没递完的星币？',
    steps(
      action('hand', 'engage', '先看下面伸出的手', '我先看下面伸出的那只手。'),
      action('beam', 'engage', '先看秤杆两端', '我先看这根秤杆的两端。'),
      '我把还没递完的星币放回桌上。',
    ),
  ),
  pause1(
    'pents_06',
    'reversed',
    '掌心里这张牌倒着，秤、递出的星币和跪着的人仍印着。你要先把秤转到哪一边？',
    steps(
      action('scale', 'engage', '先把秤转上来', '我先把这把秤转上来。'),
      action('kneel', 'engage', '先看跪着的人', '我先看跪在下面的人。'),
      '我把倒着的秤放回桌上。',
    ),
  ),
  pause2(
    'pents_06',
    'reversed',
    '牌仍倒在掌心，星币还在递出的手里和跪着的人手边。你要怎么放这些还印着的星币？',
    steps(
      action('coins', 'engage', '先托住递出的星币', '我先托住还在递出的手里的星币。'),
      action('scale', 'engage', '先看另一只手里的秤', '我先看另一只手里的秤。'),
      '我把倒着的秤和星币放回桌上。',
    ),
  ),
  pause1(
    'pents_07',
    'upright',
    '掌心里，一个人拄着锄，灌木上有六枚星币，还有一枚在根边的土上。你要先怎么待灌木上这六枚星币？',
    steps(
      action('bush', 'engage', '先看灌木上的六枚', '我先看灌木上的六枚星币。'),
      action('hoe', 'engage', '先看拄着的锄', '我先看他拄着的那把锄。'),
      '我把锄和灌木上的星币放回桌上。',
    ),
  ),
  pause2(
    'pents_07',
    'upright',
    '掌心里六枚星币仍在灌木上，根边的土上还有一枚，锄也还拄着。你要怎么安放根边这枚星币？',
    steps(
      action('root', 'engage', '先看根边土上的那枚', '我先看根边土上的那一枚星币。'),
      action('hoe', 'engage', '让锄仍拄在身侧', '我让这把锄仍拄在身侧。'),
      '我把灌木上的六枚星币放回桌上。',
    ),
  ),
  pause1(
    'pents_07',
    'reversed',
    '掌心里这张牌倒着，锄、灌木上的六枚星币和根边土上的一枚仍印着。你要先把灌木上的星币转到哪一边？',
    steps(
      action('bush', 'engage', '先把灌木上的星币转上来', '我先把灌木上的六枚星币转上来。'),
      action('root', 'engage', '先看根边土上的那枚', '我先看根边土上的那一枚星币。'),
      '我把倒着的星币放回桌上。',
    ),
  ),
  pause2(
    'pents_07',
    'reversed',
    '牌仍倒在掌心，人还靠在锄上，六枚在灌木上，一枚在根边的土上。你要怎么放这把还印着的锄？',
    steps(
      action('hoe', 'engage', '先按住这把锄', '我先按住他靠着的这把锄。'),
      action('root', 'engage', '先看根边的那枚', '我先看还在根边土上的那枚星币。'),
      '我把倒着的锄和星币放回桌上。',
    ),
  ),
  pause1(
    'pents_08',
    'upright',
    '掌心里，一枚星币在树桩上被敲，旁边有锤子和凳子，木柱上竖着七枚星币。你要先怎么待树桩上这一枚？',
    steps(
      action('coin', 'engage', '先看树桩上这一枚', '我先看树桩上这一枚星币。'),
      action('hammer', 'engage', '先看旁边的锤子', '我先看对着星币的那把锤子。'),
      '我把树桩上的星币放回桌上。',
    ),
  ),
  pause2(
    'pents_08',
    'upright',
    '掌心里锤子仍对着树桩上那枚星币，木柱上还竖着七枚，凳子也还在。你要怎么安放木柱上这些星币？',
    steps(
      action('post', 'engage', '先看木柱上的七枚', '我先看竖在木柱上的七枚星币。'),
      action('stool', 'engage', '先看旁边的凳子', '我先看树桩旁边的凳子。'),
      '我把锤子和树桩上的星币放回桌上。',
    ),
  ),
  pause1(
    'pents_08',
    'reversed',
    '掌心里这张牌倒着，锤子、树桩上的星币、凳子和木柱上的七枚仍印着。你要先把锤子转到哪一边？',
    steps(
      action('hammer', 'engage', '先把锤子转上来', '我先把这把锤子转上来。'),
      action('post', 'engage', '先看木柱上的星币', '我先看竖在木柱上的七枚星币。'),
      '我把倒着的树桩和星币放回桌上。',
    ),
  ),
  pause2(
    'pents_08',
    'reversed',
    '牌仍倒在掌心，树桩上那枚星币还在锤子下面，木柱上还竖着七枚。你要怎么放这枚还印在树桩上的星币？',
    steps(
      action('coin', 'engage', '先托住树桩上这一枚', '我先托住树桩上这一枚星币。'),
      action('post', 'engage', '先看木柱上的七枚', '我先看还竖在木柱上的七枚星币。'),
      '我把倒着的锤子和凳子放回桌上。',
    ),
  ),
  pause1(
    'pents_09',
    'upright',
    '掌心里是一座园子，葡萄结在藤上，一只鸟停在手套上，九枚星币在藤间。你要先怎么待这只停在手套上的鸟？',
    steps(
      action('bird', 'engage', '先看手套上的鸟', '我先看停在手套上的这只鸟。'),
      action('vine', 'engage', '先看藤间的星币', '我先看葡萄藤间的九枚星币。'),
      '我把鸟和葡萄藤放回桌上。',
    ),
  ),
  pause2(
    'pents_09',
    'upright',
    '掌心里鸟仍停在手套上，葡萄和星币也还在藤间。你要怎么安放这串还结在藤上的葡萄？',
    steps(
      action('grape', 'engage', '先看最近的一串葡萄', '我先看藤上最近的那一串葡萄。'),
      action('glove', 'engage', '先看托着鸟的手套', '我先看托着鸟的那只手套。'),
      '我把园子里的鸟和星币放回桌上。',
    ),
  ),
  pause1(
    'pents_09',
    'reversed',
    '掌心里这张牌倒着，鸟、手套、葡萄和九枚星币仍印着。你要先把手套上的鸟转到哪一边？',
    steps(
      action('bird', 'engage', '先把鸟转上来', '我先把手套上的鸟转上来。'),
      action('grape', 'engage', '先看倒着的葡萄', '我先看印在藤上的葡萄。'),
      '我把倒着的园子放回桌上。',
    ),
  ),
  pause2(
    'pents_09',
    'reversed',
    '牌仍倒在掌心，九枚星币还在葡萄藤间。你要怎么放这些还印在藤上的星币？',
    steps(
      action('coins', 'engage', '先按住藤间的星币', '我先按住葡萄藤间的星币。'),
      action('bird', 'engage', '先看手套上的鸟', '我先看还停在手套上的鸟。'),
      '我把倒着的葡萄和鸟放回桌上。',
    ),
  ),
  pause1(
    'pents_10',
    'upright',
    '掌心里，拱门上排着十枚星币，老人、孩子和狗都在廊下。你要先怎么待这道排着星币的拱？',
    steps(
      action('arch', 'engage', '先看拱上的十枚', '我先看排在拱上的十枚星币。'),
      action('dog', 'engage', '先看廊下的狗', '我先看拱门下的狗。'),
      '我把这道拱和星币放回桌上。',
    ),
  ),
  pause2(
    'pents_10',
    'upright',
    '掌心里十枚星币仍排在拱上，老人和孩子还在廊下。你要怎么安放廊下这只还在的狗？',
    steps(
      action('child', 'engage', '先看廊下的孩子', '我先看拱门下的孩子。'),
      action('elder', 'engage', '先看廊下的老人', '我先看拱门下的老人。'),
      '我把拱上的十枚星币放回桌上。',
    ),
  ),
  pause1(
    'pents_10',
    'reversed',
    '掌心里这张牌倒着，十枚星币、拱、老人、孩子和狗仍印着。你要先把拱上的星币转到哪一边？',
    steps(
      action('arch', 'engage', '先把拱上的星币转上来', '我先把这十枚星币转上来。'),
      action('dog', 'engage', '先看倒着的狗', '我先看印在廊下的狗。'),
      '我把倒着的拱放回桌上。',
    ),
  ),
  pause2(
    'pents_10',
    'reversed',
    '牌仍倒在掌心，老人和孩子还在拱下，狗也还在。你要怎么放这道还印着的拱？',
    steps(
      action('arch', 'engage', '先按住这道拱', '我先按住排着星币的拱。'),
      action('elder', 'engage', '先看廊下的老人', '我先看还在廊下的老人。'),
      '我把倒着的狗和星币放回桌上。',
    ),
  ),
  pause1(
    'pents_page',
    'upright',
    '掌心里，田边的人把一枚星币举到眼前，脚还在田埂上。你要先怎么待这枚举到眼前的星币？',
    steps(
      action('coin', 'engage', '先看举到眼前的星币', '我先看举到眼前的这枚星币。'),
      action('field', 'engage', '先看田埂那边的田', '我先看田埂那边的田。'),
      '我把举到眼前的星币放回桌上。',
    ),
  ),
  locked('pents_page', 'upright', 2),
  pause1(
    'pents_page',
    'reversed',
    '掌心里这张牌倒着，星币、田埂和田仍印着。你要先把举着的星币转到哪一边？',
    steps(
      action('coin', 'engage', '先把星币转上来', '我先把举着的星币转上来。'),
      action('ridge', 'engage', '先看倒着的田埂', '我先看印在脚下的田埂。'),
      '我把倒着的星币放回桌上。',
    ),
  ),
  pause2(
    'pents_page',
    'reversed',
    '牌仍倒在掌心，星币还举在眼前，脚还在田埂上。你要怎么放这条还印着的田埂？',
    steps(
      action('ridge', 'engage', '先按住这条田埂', '我先按住脚下这条田埂。'),
      action('furrow', 'engage', '先看田里的沟', '我先看田里最近的那条沟。'),
      '我把倒着的田和星币放回桌上。',
    ),
  ),
  pause1(
    'pents_knight',
    'upright',
    '掌心里，马上的人把一枚星币托在自己掌上，马在犁沟边。你要先怎么待这枚托在他掌上的星币？',
    steps(
      action('coin', 'engage', '先看他掌上的星币', '我先看托在他掌上的这枚星币。'),
      action('furrow', 'engage', '先看马旁的犁沟', '我先看马旁边那条犁沟。'),
      '我把马上的星币放回桌上。',
    ),
  ),
  pause2(
    'pents_knight',
    'upright',
    '掌心里星币仍托在他掌上，马还在犁沟边。你身上哪一种手艺够用在这枚托着的星币上？',
    steps(
      action('craft', 'engage', '用正在学的那门手艺', '我用正在学的那门手艺，先把这枚星币托稳。'),
      action('rein', 'engage', '先看马头上的缰', '我先看马头上的缰绳。'),
      '我把犁沟边的星币放回桌上。',
    ),
  ),
  pause1(
    'pents_knight',
    'reversed',
    '掌心里这张牌倒着，星币、马、犁沟和盔甲仍印着。你要先把掌上的星币转到哪一边？',
    steps(
      action('coin', 'engage', '先把星币转上来', '我先把他掌上的星币转上来。'),
      action('helmet', 'engage', '先看头上的盔', '我先看头上那顶盔。'),
      '我把倒着的马和星币放回桌上。',
    ),
  ),
  pause2(
    'pents_knight',
    'reversed',
    '牌仍倒在掌心，星币还在他掌上，犁沟还在马旁。你要怎么放这条还印着的犁沟？',
    steps(
      action('furrow', 'engage', '先按住这条犁沟', '我先按住马旁边这条犁沟。'),
      action('hoof', 'engage', '先看马的蹄', '我先看犁沟边的马蹄。'),
      '我把倒着的盔和星币放回桌上。',
    ),
  ),
  pause1(
    'pents_queen',
    'upright',
    '掌心里，园中的座位上，一枚星币放在膝头，旁边有一只兔子。你要先怎么待这枚放在膝上的星币？',
    steps(
      action('lap', 'engage', '先看膝上的星币', '我先看放在膝头的这枚星币。'),
      action('rabbit', 'engage', '先看座位旁的兔子', '我先看座位旁边的兔子。'),
      '我把膝上的星币放回桌上。',
    ),
  ),
  pause2(
    'pents_queen',
    'upright',
    '掌心里星币仍在膝上，兔子还在座位旁，四周有花。你身上哪一种手艺够用在这枚膝上的星币上？',
    steps(
      action('craft', 'engage', '用正在学的那门手艺', '我用正在学的那门手艺，先托住膝上这枚星币。'),
      action('flower', 'engage', '先看座位四周的花', '我先看座位四周的花。'),
      '我把兔子和膝上的星币放回桌上。',
    ),
  ),
  pause1(
    'pents_queen',
    'reversed',
    '掌心里这张牌倒着，星币、膝、兔子和花仍印着。你要先把膝上的星币转到哪一边？',
    steps(
      action('coin', 'engage', '先把星币转上来', '我先把膝上的星币转上来。'),
      action('rabbit', 'engage', '先看倒着的兔子', '我先看印在座位旁的兔子。'),
      '我把倒着的星币放回桌上。',
    ),
  ),
  pause2(
    'pents_queen',
    'reversed',
    '牌仍倒在掌心，兔子还在座位旁，星币还在膝上。你要怎么放这只还印着的兔子？',
    steps(
      action('rabbit', 'engage', '先按住这只兔子', '我先按住座位旁边的兔子。'),
      action('flower', 'engage', '先看四周的花', '我先看座位四周还开着的花。'),
      '我把倒着的花和星币放回桌上。',
    ),
  ),
  pause1(
    'pents_king',
    'upright',
    '掌心里，座位上的人把一枚星币放在膝上，葡萄和藤在座位上、也在座旁，座上有牛头，身后的城堡上没有藤。你要先怎么待这枚放在膝上的星币？',
    steps(
      action('knee', 'engage', '先看膝上的星币', '我先看放在膝上的这枚星币。'),
      action('castle', 'engage', '先看身后的城堡', '我先看身后那座城堡。'),
      '我把膝上的星币和城堡放回桌上。',
    ),
  ),
  pause2(
    'pents_king',
    'upright',
    '掌心里星币仍在膝上，葡萄和藤在座位上和座旁，牛头还在，城堡在后面。你身上哪一种手艺够用在这枚膝上的星币上？',
    steps(
      action('craft', 'engage', '用正在学的那门手艺', '我用正在学的那门手艺，先让这枚星币留在膝上。'),
      action('vine', 'engage', '先看座位上的藤', '我先看长在座位上的藤。'),
      '我把牛头座位和星币放回桌上。',
    ),
  ),
  pause1(
    'pents_king',
    'reversed',
    '掌心里这张牌倒着，膝上的星币、身后的城堡、座位上的藤和牛头仍印着。你要先把膝上的星币转到哪一边？',
    steps(
      action('coin', 'engage', '先把星币转上来', '我先把膝上的星币转上来。'),
      action('bull', 'engage', '先看座上的牛头', '我先看座位上的牛头。'),
      '我把倒着的星币和城堡放回桌上。',
    ),
  ),
  pause2(
    'pents_king',
    'reversed',
    '牌仍倒在掌心，藤还缠在座位上，星币还在膝上。你要怎么放这座还印着的城堡？',
    steps(
      action('castle', 'engage', '先看远处的城堡', '我先看还在后面的城堡。'),
      action('vine', 'engage', '先按住座位上的藤', '我先按住缠在座位上的藤。'),
      '我把倒着的牛头和星币放回桌上。',
    ),
  ),
];
