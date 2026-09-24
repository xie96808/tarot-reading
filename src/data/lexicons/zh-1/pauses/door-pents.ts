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
  return [first, second, action('leave', 'leave', '先把门带上', leaveSentenceZh)];
}

function pause1(
  cardId: CardId,
  orientation: Orientation,
  promptZh: string,
  actions: readonly [PauseAction, PauseAction, PauseAction],
): PauseOffer {
  return { sceneId: 'door', cardId, orientation, pauseIndex: 1, promptZh, actions };
}

function pause2(
  cardId: CardId,
  orientation: Orientation,
  body: string,
  actions: readonly [PauseAction, PauseAction, PauseAction],
): PauseOffer {
  return {
    sceneId: 'door',
    cardId,
    orientation,
    pauseIndex: 2,
    promptAfterActionZh: `沿着刚才那一步，${body}`,
    promptAfterSkipZh: `刚才你没有点。${body}`,
    actions,
  };
}

// Same object as examples.ts. Retyping would drift from the locked door lines.
function locked(cardId: CardId, orientation: Orientation, pauseIndex: 1 | 2): PauseOffer {
  const found = PAUSE_EXAMPLES.find(
    (offer) =>
      offer.sceneId === 'door' &&
      offer.cardId === cardId &&
      offer.orientation === orientation &&
      offer.pauseIndex === pauseIndex,
  );
  if (!found) {
    throw new Error(`missing locked door offer ${cardId} ${orientation} ${pauseIndex}`);
  }
  return found;
}

export const DOOR_PENTS_OFFERS: readonly PauseOffer[] = [
  pause1(
    'pents_01_ace',
    'upright',
    '门缝里，云中的手托着一枚星币，币下是园门和一条还没被翻开的土路。你要先怎么待这枚停在门口的星币？',
    steps(
      action('near', 'engage', '先让星币靠近园门', '我先让这枚星币靠近园门。'),
      action('soil', 'engage', '先看土路上的土', '我先看星币下面那条土路上还没翻开的土。'),
      '我先把门带上，停在门口的星币留在门外。',
    ),
  ),
  pause2(
    'pents_01_ace',
    'upright',
    '门缝里那枚星币仍托在园门前，土路也还在。你要怎么安放这枚还没进园的星币？',
    steps(
      action('gate', 'engage', '把星币放到园门边上', '我把这枚星币放到园门边上。'),
      action('path', 'engage', '先沿土路看一眼园内', '我先沿土路看一眼园门里面。'),
      '我先把门带上，还没进园的星币留在门外。',
    ),
  ),
  pause1(
    'pents_01_ace',
    'reversed',
    '门缝里星币翻了过去，园门关着，下面的土没有被掀开。你要先怎么待这枚没落地的星币？',
    steps(
      action('turn', 'engage', '先把星币翻回正面', '我先把翻过去的星币翻回正面。'),
      action('gate', 'engage', '先看这扇关着的园门', '我先看这扇关着的园门，土先不掀。'),
      '我先把门带上，没落地的星币留在门外。',
    ),
  ),
  pause2(
    'pents_01_ace',
    'reversed',
    '门缝里那枚星币仍翻着，园门还关，土也还平着。你要怎么对待这枚进不了园的星币？',
    steps(
      action('face', 'engage', '让币面重新朝上', '我让这枚星币的面重新朝上。'),
      action('latch', 'engage', '先摸一下园门的门闩', '我先摸一下关着的园门的门闩。'),
      '我先把门带上，进不了园的星币留在门外。',
    ),
  ),
  pause1(
    'pents_02',
    'upright',
    '门缝里，一个人把两枚星币抛在浪上，身后的船还在走。你要先怎么待这两枚在空中的星币？',
    steps(
      action('left', 'engage', '先接住偏左的那枚', '我先接住偏左的那枚星币。'),
      action('ship', 'engage', '先看身后那条船', '我先看身后还在走的那条船，两枚星币仍在空中。'),
      '我先把门带上，抛在浪上的星币留在门外。',
    ),
  ),
  pause2(
    'pents_02',
    'upright',
    '门缝里那两枚星币还在浪上交替，船也还在后面。你要怎么安放这两枚还没落地的星币？',
    steps(
      action('one', 'engage', '先只把一枚接到手里', '我先只把其中一枚接到手里。'),
      action('ribbon', 'engage', '先看缠着两枚的带子', '我先看缠在两枚星币之间的那条带子。'),
      '我先把门带上，还在浪上的星币留在门外。',
    ),
  ),
  pause1(
    'pents_02',
    'reversed',
    '门缝里两枚星币仍在空中，有一枚已经偏低，船离岸更远。你要先怎么待这枚偏低的星币？',
    steps(
      action('low', 'engage', '先托住偏低的那枚', '我先托住已经偏低的那枚星币。'),
      action('far', 'engage', '先看离岸更远的船', '我先看那条离岸更远的船。'),
      '我先把门带上，偏低的星币留在门外。',
    ),
  ),
  pause2(
    'pents_02',
    'reversed',
    '门缝里偏低的那枚星币还没被接住，另一枚仍在上面。你要怎么对待这两枚接不住的星币？',
    steps(
      action('both', 'engage', '先让两枚都降到同一高度', '我先让两枚星币都降到同一高度。'),
      action('drop', 'engage', '先允许偏低的那枚落地', '我先允许偏低的那枚星币落到门槛上。'),
      '我先把门带上，接不住的星币留在门外。',
    ),
  ),
  pause1(
    'pents_03',
    'upright',
    '门缝里，一座石拱砌到一半，图纸摊在石上，凿子靠在拱边。你要先怎么待这截没砌完的石拱？',
    steps(
      action('plan', 'engage', '先对照图纸看石拱', '我先对照摊开的图纸看这截石拱。'),
      action('chisel', 'engage', '先拿起靠着的凿子', '我先拿起靠在拱边的凿子，石拱先不往上砌。'),
      '我先把门带上，没砌完的石拱留在门外。',
    ),
  ),
  pause2(
    'pents_03',
    'upright',
    '门缝里那截石拱还停在一半，图纸和凿子都还在。你要怎么靠近这件没完成的石工？',
    steps(
      action('line', 'engage', '先把图纸边和石边对齐', '我先把图纸的边和石拱的边对齐。'),
      action('stone', 'engage', '先只摸最上面的那块石', '我先只摸石拱最上面的那块石头。'),
      '我先把门带上，停在一半的石拱留在门外。',
    ),
  ),
  pause1(
    'pents_03',
    'reversed',
    '门缝里石拱停在半截，图纸和石头对不齐，凿子没有碰上去。你要先怎么待这截对不齐的石拱？',
    steps(
      action('shift', 'engage', '先挪一挪对不齐的图纸', '我先挪一挪和石头对不齐的图纸。'),
      action('rest', 'engage', '先让凿子继续靠着', '我先让凿子继续靠在拱边，不去敲。'),
      '我先把门带上，对不齐的石拱留在门外。',
    ),
  ),
  pause2(
    'pents_03',
    'reversed',
    '门缝里那截石拱仍和图纸错开，凿子还靠在一边。你要怎么对待这件错开的石工？',
    steps(
      action('mark', 'engage', '先在错开的地方做个记号', '我先在图纸和石头错开的地方做个记号。'),
      action('stop', 'engage', '先停住不再往上砌', '我先停住，这截石拱先不往上砌。'),
      '我先把门带上，错开的石拱留在门外。',
    ),
  ),
  pause1(
    'pents_04',
    'upright',
    '门缝里，一个人坐着，一枚星币抱在胸口，一枚顶在头上，两枚压在脚下，城在身后。你要先怎么待这四枚被抱住的星币？',
    steps(
      action('chest', 'engage', '先看胸口那一枚', '我先看被抱在胸口的那一枚星币。'),
      action('city', 'engage', '先看身后的城', '我先看星币后面的那座城。'),
      '我先把门带上，被抱住的星币留在门外。',
    ),
  ),
  pause2(
    'pents_04',
    'upright',
    '门缝里那四枚星币还分别在胸口、头顶和脚下。你要怎么安放这些还被护着的星币？',
    steps(
      action('feet', 'engage', '先挪开脚下的一枚', '我先挪开压在脚下的一枚星币。'),
      action('keep', 'engage', '先让胸口那枚继续被抱着', '我先让胸口那枚星币继续被抱着。'),
      '我先把门带上，还被护着的星币留在门外。',
    ),
  ),
  pause1(
    'pents_04',
    'reversed',
    '门缝里四枚星币仍被箍在身上，身后的城没有被走进去。你要先怎么待这些箍住的星币？',
    steps(
      action('loose', 'engage', '先松开箍着胸口的手', '我先松开箍着胸口那枚星币的手。'),
      action('gate', 'engage', '先看城的方向', '我先看身后那座还没走进去的城。'),
      '我先把门带上，箍在身上的星币留在门外。',
    ),
  ),
  pause2(
    'pents_04',
    'reversed',
    '门缝里那些星币仍贴在身上，通向城的路还空着。你要怎么对待这些没放下的星币？',
    steps(
      action('one', 'engage', '先只放下头顶的那枚', '我先只放下顶在头上的那枚星币。'),
      action('road', 'engage', '先在通向城的路上站一下', '我先在通向城的空路上站一下。'),
      '我先把门带上，没放下的星币留在门外。',
    ),
  ),
  pause1(
    'pents_05',
    'upright',
    '门缝里，雪中两个人停在窗下，窗上有五枚星币，窗里有光。你要先怎么待这扇亮着的窗？',
    steps(
      action('light', 'engage', '先看窗里的光', '我先看这扇窗里的光。'),
      action('snow', 'engage', '先在雪里再站一会儿', '我先在窗下的雪里再站一会儿。'),
      '我先把门带上，亮着的窗子留在门外。',
    ),
  ),
  pause2(
    'pents_05',
    'upright',
    '门缝里雪还在下，五枚星币仍嵌在那扇有光的窗上。你要怎么靠近这扇还隔着的窗？',
    steps(
      action('pane', 'engage', '先走到窗玻璃前面', '我先走到嵌着星币的窗玻璃前面。'),
      action('pair', 'engage', '先和雪里的另一个人并排', '我先和雪里的另一个人并排站住。'),
      '我先把门带上，还隔着的窗子留在门外。',
    ),
  ),
  pause1(
    'pents_05',
    'reversed',
    '门缝里雪还在下，窗里的光还在，两个人仍站在窗外，门没有开。你要先怎么待这扇没打开的门？',
    steps(
      action('sill', 'engage', '先站到门边的雪上', '我先站到这扇没打开的门边的雪上。'),
      action('glass', 'engage', '先只看窗上的五枚星币', '我先只看窗上那五枚星币。'),
      '我先把门带上，没打开的门留在门外。',
    ),
  ),
  pause2(
    'pents_05',
    'reversed',
    '门缝里那两个人还在雪里，有光的窗和关着的门都没变。你要怎么对待这扇仍关着的门？',
    steps(
      action('knock', 'engage', '先在门上敲一下', '我先在这扇仍关着的门上敲一下。'),
      action('stay', 'engage', '先让脚留在雪里', '我先让脚留在窗外的雪里。'),
      '我先把门带上，仍关着的门留在门外。',
    ),
  ),
  pause1(
    'pents_06',
    'upright',
    '门缝里有一把秤，几枚星币从高处递向跪着的人。你要先怎么待这把秤和这些星币？',
    steps(
      action('scale', 'engage', '先看秤盘两边', '我先看这把秤的两边秤盘。'),
      action('pass', 'engage', '先把一枚星币递下去', '我先把一枚星币从高处递下去。'),
      '我先把门带上，秤和星币留在门外。',
    ),
  ),
  pause2(
    'pents_06',
    'upright',
    '门缝里那把秤还在，星币仍停在递出的半路上。你要怎么安放这些还没递完的星币？',
    steps(
      action('hand', 'engage', '让星币交到下面的手里', '我让这枚星币交到下面伸出的手里。'),
      action('beam', 'engage', '先看秤杆两端', '我先看这根秤杆的两端。'),
      '我先把门带上，还没递完的星币留在门外。',
    ),
  ),
  pause1(
    'pents_06',
    'reversed',
    '门缝里秤还在，星币停在秤盘上，没有递到跪着的人手里。你要先怎么待这些停在秤上的星币？',
    steps(
      action('pan', 'engage', '先让星币留在秤盘上', '我先让这些星币留在秤盘上。'),
      action('kneel', 'engage', '先看跪着的那双手', '我先看跪着的那双手，星币先不递。'),
      '我先把门带上，停在秤上的星币留在门外。',
    ),
  ),
  pause2(
    'pents_06',
    'reversed',
    '门缝里星币仍堆在秤盘上，下面的手还空着。你要怎么对待这些没递出去的星币？',
    steps(
      action('one', 'engage', '先只取下一枚', '我先只从秤盘上取下一枚星币。'),
      action('empty', 'engage', '先看那双空着的手', '我先看下面那双还空着的手。'),
      '我先把门带上，没递出去的星币留在门外。',
    ),
  ),
  pause1(
    'pents_07',
    'upright',
    '门缝里，一个人拄着锄，面前的枝上挂着七枚星币。你要先怎么待枝上这些星币？',
    steps(
      action('hoe', 'engage', '先把锄靠在一边', '我先把锄靠在一边，再看枝上的星币。'),
      action('branch', 'engage', '先数枝上的星币', '我先数一数枝上挂着的星币。'),
      '我先把门带上，挂在枝上的星币留在门外。',
    ),
  ),
  pause2(
    'pents_07',
    'upright',
    '门缝里那七枚星币还挂在枝上，锄也还靠着。你要怎么靠近这些还没离开枝的星币？',
    steps(
      action('look', 'engage', '先只看最下面的一枚', '我先只看枝上最下面的那一枚星币。'),
      action('wait', 'engage', '先让星币继续挂着', '我先让这些星币继续挂在枝上。'),
      '我先把门带上，还没离开枝的星币留在门外。',
    ),
  ),
  pause1(
    'pents_07',
    'reversed',
    '门缝里手伸向枝上的星币，果实还没离开枝，锄横在中间。你要先怎么待这只伸出去的手？',
    steps(
      action('back', 'engage', '先把手收回锄这边', '我先把伸向枝的手收回锄这边。'),
      action('fruit', 'engage', '先看还连着枝的那枚', '我先看还连在枝上、没被摘下的那枚星币。'),
      '我先把门带上，伸向枝的手留在门外。',
    ),
  ),
  pause2(
    'pents_07',
    'reversed',
    '门缝里那只手还停在枝前，星币仍连在枝上。你要怎么对待这只没摘下的手？',
    steps(
      action('hoe', 'engage', '先把锄放回地上', '我先把横在中间的锄放回地上。'),
      action('leaf', 'engage', '先只碰叶子不碰星币', '我先只碰枝上的叶子，不碰星币。'),
      '我先把门带上，没摘下星币的手留在门外。',
    ),
  ),
  pause1(
    'pents_08',
    'upright',
    '门缝里有一张工作台，锤子对着台上的一枚星币，墙上已经挂着几枚。你要先怎么待台上这一枚？',
    steps(
      action('hammer', 'engage', '先把锤子放在台边', '我先把锤子放在工作台边上，再看这一枚星币。'),
      action('coin', 'engage', '先只看台上这一枚', '我先只看工作台上这一枚星币。'),
      '我先把门带上，工作台上的星币留在门外。',
    ),
  ),
  pause2(
    'pents_08',
    'upright',
    '门缝里工作台还在，锤子仍对着那枚星币，墙上的也还挂着。你要怎么安放台上这一枚？',
    steps(
      action('strike', 'engage', '先只敲台上这一枚', '我先只敲工作台上这一枚星币。'),
      action('wall', 'engage', '先看墙上已经挂着的', '我先看墙上已经挂着的那几枚星币。'),
      '我先把门带上，对着锤子的星币留在门外。',
    ),
  ),
  pause1(
    'pents_08',
    'reversed',
    '门缝里锤子停在半空，工作台上的星币还没敲完，眼睛不在星币上。你要先怎么待这把停住的锤子？',
    steps(
      action('lower', 'engage', '先把锤子放回台上', '我先把停在半空的锤子放回工作台。'),
      action('eye', 'engage', '先把眼睛放回星币上', '我先把眼睛放回台上那枚还没敲完的星币。'),
      '我先把门带上，停住的锤子留在门外。',
    ),
  ),
  pause2(
    'pents_08',
    'reversed',
    '门缝里那把锤子仍停着，台上的星币还是没敲完。你要怎么对待这枚停在台上的星币？',
    steps(
      action('turn', 'engage', '先把星币在台上转一下', '我先把这枚没敲完的星币在台上转一下。'),
      action('hang', 'engage', '先别把它挂上墙', '我先不把这枚星币挂上墙。'),
      '我先把门带上，没敲完的星币留在门外。',
    ),
  ),
  pause1(
    'pents_09',
    'upright',
    '门缝里是一座园子，葡萄已经结上，一只鸟停在手套上，九枚星币在藤间。你要先怎么待这只停在手上的鸟？',
    steps(
      action('bird', 'engage', '先让鸟留在手套上', '我先让这只鸟留在手套上。'),
      action('vine', 'engage', '先看藤间的星币', '我先看葡萄藤间的那些星币。'),
      '我先把门带上，停在手套上的鸟留在门外。',
    ),
  ),
  pause2(
    'pents_09',
    'upright',
    '门缝里那只鸟还在手套上，葡萄和星币也还在藤间。你要怎么靠近这座已经长起来的园子？',
    steps(
      action('grape', 'engage', '先只摘一串最近的葡萄', '我先只摘离门口最近的一串葡萄。'),
      action('walk', 'engage', '先沿藤走一步', '我先沿葡萄藤走一步，鸟仍停在手套上。'),
      '我先把门带上，长起来的园子留在门外。',
    ),
  ),
  pause1(
    'pents_09',
    'reversed',
    '门缝里园墙很高，葡萄和鸟都隔在里面，园门没有开。你要先怎么待这扇关着的园门？',
    steps(
      action('wall', 'engage', '先看这堵高墙', '我先看把葡萄和鸟隔在里面的这堵墙。'),
      action('latch', 'engage', '先碰到园门的门闩', '我先碰到这扇没开的园门的门闩。'),
      '我先把门带上，关着的园门留在门外。',
    ),
  ),
  pause2(
    'pents_09',
    'reversed',
    '门缝里园门仍关着，鸟不在门口，葡萄还在墙内。你要怎么对待这扇把园子挡住的门？',
    steps(
      action('crack', 'engage', '先把门推开一条缝', '我先把这扇园门推开一条缝。'),
      action('out', 'engage', '先留在墙外', '我先留在园墙外面，葡萄仍在里面。'),
      '我先把门带上，挡住园子的门留在门外。',
    ),
  ),
  pause1(
    'pents_10',
    'upright',
    '门缝里，拱门上排着十枚星币，老人、孩子和狗都在廊下。你要先怎么待这道排着星币的拱门？',
    steps(
      action('arch', 'engage', '先在拱门下站住', '我先在排着星币的拱门下站住。'),
      action('dog', 'engage', '先看廊下的狗', '我先看拱门下那只狗，星币仍排在上面。'),
      '我先把门带上，排着星币的拱门留在门外。',
    ),
  ),
  pause2(
    'pents_10',
    'upright',
    '门缝里那十枚星币还排在拱上，廊下的人还在。你要怎么靠近这道已经站了人的拱门？',
    steps(
      action('elder', 'engage', '先走到老人那一侧', '我先走到拱门下老人所在的那一侧。'),
      action('child', 'engage', '先停在孩子旁边', '我先停在拱门下的孩子旁边。'),
      '我先把门带上，站了人的拱门留在门外。',
    ),
  ),
  pause1(
    'pents_10',
    'reversed',
    '门缝里拱上的星币还排着，廊下的人没有站到一起，狗也分开。你要先怎么待这道没聚拢的拱门？',
    steps(
      action('gap', 'engage', '先看人与人之间的空档', '我先看拱门下人与人之间的空档。'),
      action('coins', 'engage', '先只看拱上的星币', '我先只看还排在拱上的十枚星币。'),
      '我先把门带上，没聚拢的拱门留在门外。',
    ),
  ),
  pause2(
    'pents_10',
    'reversed',
    '门缝里星币仍排成拱，廊下的人还是分开站着。你要怎么对待这道空着间隔的拱门？',
    steps(
      action('middle', 'engage', '先站到空档中间', '我先站到廊下那处空档的中间。'),
      action('dog', 'engage', '先走到分开的狗旁边', '我先走到和人分开的那只狗旁边。'),
      '我先把门带上，空着间隔的拱门留在门外。',
    ),
  ),
  pause1(
    'pents_page',
    'upright',
    '门缝里，田边的人把一枚星币举到眼前，脚还在田埂上。你要先怎么待这枚被举到眼前的星币？',
    steps(
      action('eye', 'engage', '先让星币留在眼前', '我先让这枚星币留在眼前。'),
      action('field', 'engage', '先看田埂那边的田', '我先看田埂那边的田，星币仍举着。'),
      '我先把门带上，举到眼前的星币留在门外。',
    ),
  ),
  locked('pents_page', 'upright', 2),
  pause1(
    'pents_page',
    'reversed',
    '门缝里星币仍举在眼前，脚停在田埂外，没有迈进田里。你要先怎么待这枚没被带进田的星币？',
    steps(
      action('lower', 'engage', '先把星币放到与田同高', '我先把举着的星币放到与田同一高度。'),
      action('ridge', 'engage', '先让脚留在田埂外', '我先让脚留在田埂外，星币仍举着。'),
      '我先把门带上，没被带进田的星币留在门外。',
    ),
  ),
  pause2(
    'pents_page',
    'reversed',
    '门缝里那枚星币还挡在眼前，田埂外的脚仍没有迈进去。你要怎么对待这枚挡住视线的星币？',
    steps(
      action('aside', 'engage', '先把星币移开一点', '我先把挡在眼前的星币移开一点。'),
      action('furrow', 'engage', '先看田里的一条沟', '我先看田里最近的那条沟。'),
      '我先把门带上，挡住视线的星币留在门外。',
    ),
  ),
  pause1(
    'pents_knight',
    'upright',
    '门缝里，马上的人把星币托在掌上，马走在犁沟边。你要先怎么待这枚托在掌上的星币？',
    steps(
      action('palm', 'engage', '先让星币留在掌上', '我先让这枚星币留在掌上。'),
      action('furrow', 'engage', '先看马旁边的犁沟', '我先看马旁边那条犁沟。'),
      '我先把门带上，托在掌上的星币留在门外。',
    ),
  ),
  pause2(
    'pents_knight',
    'upright',
    '门缝里那枚星币还托在掌上，马仍沿着犁沟走。你要怎么安放这枚还没放下的星币？',
    steps(
      action('slow', 'engage', '先让马走得更慢', '我先让犁沟边的马走得更慢。'),
      action('set', 'engage', '先把星币在掌心放稳', '我先把这枚星币在掌心放稳。'),
      '我先把门带上，还没放下的星币留在门外。',
    ),
  ),
  pause1(
    'pents_knight',
    'reversed',
    '门缝里马蹄停着不抬，星币悬在犁沟上方，没有落到土里。你要先怎么待这枚悬着的星币？',
    steps(
      action('hoof', 'engage', '先看停住的马蹄', '我先看这只停住不抬的马蹄。'),
      action('above', 'engage', '先让星币继续悬着', '我先让这枚星币继续悬在犁沟上方。'),
      '我先把门带上，悬在犁沟上的星币留在门外。',
    ),
  ),
  pause2(
    'pents_knight',
    'reversed',
    '门缝里马蹄仍不抬，星币还悬在犁沟上面。你要怎么对待这枚落不下去的星币？',
    steps(
      action('lower', 'engage', '先把星币放低一寸', '我先把悬着的星币向犁沟放低一寸。'),
      action('rein', 'engage', '先让缰绳松一点', '我先让停着的马的缰绳松一点。'),
      '我先把门带上，落不下去的星币留在门外。',
    ),
  ),
  pause1(
    'pents_queen',
    'upright',
    '门缝里，园中的座位上，一枚星币放在膝头，旁边有一只兔子。你要先怎么待这枚放在膝上的星币？',
    steps(
      action('lap', 'engage', '先让星币留在膝头', '我先让这枚星币留在膝头。'),
      action('rabbit', 'engage', '先看座位旁边的兔子', '我先看座位旁边的那只兔子。'),
      '我先把门带上，放在膝上的星币留在门外。',
    ),
  ),
  pause2(
    'pents_queen',
    'upright',
    '门缝里膝上的星币还在，兔子也还在园中的座位旁。你要怎么靠近这枚和这只兔子？',
    steps(
      action('garden', 'engage', '先看座位四周的花', '我先看座位四周已经开着的花。'),
      action('hand', 'engage', '先把手放在星币旁边', '我先把手放在膝上星币的旁边，先不拿走。'),
      '我先把门带上，膝上的星币和兔子留在门外。',
    ),
  ),
  pause1(
    'pents_queen',
    'reversed',
    '门缝里膝上的星币还在，兔子不靠近，园门对着座位却关着。你要先怎么待这枚和这扇关着的园门？',
    steps(
      action('gate', 'engage', '先看这扇关着的园门', '我先看对着座位、却关着的那扇园门。'),
      action('coin', 'engage', '先让星币留在膝上', '我先让这枚星币留在膝上，兔子先不叫。'),
      '我先把门带上，膝上的星币留在门外。',
    ),
  ),
  pause2(
    'pents_queen',
    'reversed',
    '门缝里兔子仍不靠近座位，园门也还关着，星币留在膝上。你要怎么对待这只不靠近的兔子？',
    steps(
      action('space', 'engage', '先在座位和兔子之间留空', '我先在座位和兔子之间留出一段空。'),
      action('open', 'engage', '先把园门打开一条缝', '我先把关着的园门打开一条缝。'),
      '我先把门带上，不靠近的兔子留在门外。',
    ),
  ),
  pause1(
    'pents_king',
    'upright',
    '门缝里，座位上的人把一枚星币放在膝上，身后是城堡和藤蔓。你要先怎么待这枚放在膝上的星币？',
    steps(
      action('knee', 'engage', '先看膝上的星币', '我先看放在膝上的这一枚星币。'),
      action('castle', 'engage', '先看身后的城堡', '我先看星币身后的那座城堡。'),
      '我先把门带上，放在膝上的星币留在门外。',
    ),
  ),
  pause2(
    'pents_king',
    'upright',
    '门缝里那枚星币还在膝上，城堡和藤蔓也都还在后面。你要怎么安放这枚和这座城堡？',
    steps(
      action('vine', 'engage', '先看爬在墙上的藤', '我先看爬在城堡墙上的藤蔓。'),
      action('hold', 'engage', '先让星币继续留在膝上', '我先让这枚星币继续留在膝上。'),
      '我先把门带上，膝上的星币和城堡留在门外。',
    ),
  ),
  pause1(
    'pents_king',
    'reversed',
    '门缝里膝上的星币还在，城堡的门关着，藤蔓没有爬过墙。你要先怎么待这扇关着的城堡门？',
    steps(
      action('door', 'engage', '先走到关着的城堡门前', '我先走到那扇关着的城堡门前。'),
      action('vine', 'engage', '先看没爬过墙的藤', '我先看还没爬过墙的那些藤蔓。'),
      '我先把门带上，关着的城堡门留在门外。',
    ),
  ),
  pause2(
    'pents_king',
    'reversed',
    '门缝里城堡的门仍关着，膝上的星币没被拿走，藤还停在墙下。你要怎么对待这扇没打开的门？',
    steps(
      action('key', 'engage', '先在门上找到门环', '我先在这扇没打开的城堡门上找到门环。'),
      action('wall', 'engage', '先沿墙看藤停在哪里', '我先沿墙看藤蔓停在哪里。'),
      '我先把门带上，没打开的城堡门留在门外。',
    ),
  ),
];
