import type { CardId } from '@/data/card-ids';
import type { Orientation } from '@/lib/shuffle';
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

export const DOOR_SWORDS_OFFERS: readonly PauseOffer[] = [
  pause1(
    'swords_01_ace',
    'upright',
    '门缝里，云中的手递出一柄朝上的剑，剑尖托着冠和叶环。你要先怎么待这柄新刃？',
    steps(
      action('tip', 'engage', '先看剑尖上的冠', '我先看这柄剑尖上的冠和叶环。'),
      action('blade', 'engage', '先沿刃看下去', '我先沿这柄朝上的刃看下去。'),
      '我先把门带上，云中递出的新刃留在门外。',
    ),
  ),
  pause2(
    'swords_01_ace',
    'upright',
    '门缝里那柄剑仍朝上，冠和叶环还在剑尖。你要怎么安放这柄还没落地的新刃？',
    steps(
      action('crown', 'engage', '先让冠留在剑尖', '我先让冠和叶环留在剑尖上。'),
      action('cloud', 'engage', '先看托剑的那只手', '我先看云中托着剑的那只手。'),
      '我先把门带上，还朝上的新刃留在门外。',
    ),
  ),
  pause1(
    'swords_01_ace',
    'reversed',
    '门缝里，同一柄剑刃朝下，冠和叶环垂在下面。你要先怎么待这柄朝下的剑？',
    steps(
      action('turn', 'engage', '先把刃转回朝上', '我先把朝下的刃转回朝上。'),
      action('wreath', 'engage', '先托住垂下的叶环', '我先托住垂在下面的冠和叶环。'),
      '我先把门带上，朝下的剑留在门外。',
    ),
  ),
  pause2(
    'swords_01_ace',
    'reversed',
    '门缝里那柄剑仍朝下，叶环还垂着。你要怎么对待这柄没转回来的剑？',
    steps(
      action('lift', 'engage', '再把剑尖抬高一点', '我再把朝下的剑尖抬高一点。'),
      action('ring', 'engage', '先看垂着的叶环', '我先看还垂着的那圈叶环。'),
      '我先把门带上，没转回来的剑留在门外。',
    ),
  ),
  pause1(
    'swords_02',
    'upright',
    '门缝里，一个人蒙着眼，两柄剑交叉在胸前，身后是海和一弯月。你要先怎么待这两柄交叉的剑？',
    steps(
      action('cloth', 'engage', '先看蒙眼的布', '我先看蒙着眼的那块布，两柄剑仍交叉着。'),
      action('cross', 'engage', '先看清交叉的刃', '我先看清胸前交叉的两柄刃。'),
      '我先把门带上，交叉在胸前的两柄剑留在门外。',
    ),
  ),
  pause2(
    'swords_02',
    'upright',
    '门缝里那两柄剑仍交叉在胸前，眼上的布也还系着。你要怎么安放这两柄还没分开的剑？',
    steps(
      action('left', 'engage', '先只松开左边那一柄', '我先只松开交叉着的左边那一柄剑。'),
      action('moon', 'engage', '先看身后那弯月', '我先看海面上的那弯月，剑仍交叉着。'),
      '我先把门带上，还交叉着的两柄剑留在门外。',
    ),
  ),
  pause1(
    'swords_02',
    'reversed',
    '门缝里，蒙眼的布松了一角，人转过一点，两柄剑仍交叉在胸前。你要先怎么待这两柄还交叉的剑？',
    steps(
      action('loose', 'engage', '先看松了的那一角布', '我先看松下来的那一角布。'),
      action('hold', 'engage', '先让两柄剑继续交叉', '我先让两柄剑继续交叉在胸前。'),
      '我先把门带上，布松了仍交叉的剑留在门外。',
    ),
  ),
  pause2(
    'swords_02',
    'reversed',
    '门缝里布还松着一角，交叉的两柄剑没有放下。你要怎么对待这两柄不肯分开的剑？',
    steps(
      action('one', 'engage', '先放下其中一柄', '我先放下交叉着的其中一柄剑。'),
      action('face', 'engage', '先看转过来的半张脸', '我先看转过来的那半张脸，剑仍交叉着。'),
      '我先把门带上，不肯分开的两柄剑留在门外。',
    ),
  ),
  pause1(
    'swords_03',
    'upright',
    '门缝里，一颗心被三柄剑穿过，云里还在落雨。你要先怎么待这颗被穿过的心？',
    steps(
      action('rain', 'engage', '先看落在心上的雨', '我先看落在这颗心上的雨。'),
      action('count', 'engage', '先数清穿过的三柄剑', '我先数清穿过这颗心的三柄剑。'),
      '我先把门带上，被三柄剑穿过的心留在门外。',
    ),
  ),
  pause2(
    'swords_03',
    'upright',
    '门缝里那颗心仍被三柄剑穿过，雨也还在下。你要怎么安放这三柄还插着的剑？',
    steps(
      action('middle', 'engage', '先只看中间那一柄', '我先只看穿过心的中间那一柄剑。'),
      action('cloud', 'engage', '先看下雨的那片云', '我先看还在下雨的那片云。'),
      '我先把门带上，还插在心上的三柄剑留在门外。',
    ),
  ),
  pause1(
    'swords_03',
    'reversed',
    '门缝里，被三柄剑穿过的心转了过去，雨还挂在云上。你要先怎么待这颗转过去的心？',
    steps(
      action('face', 'engage', '先把心转回朝前', '我先把转过去的心转回朝前。'),
      action('drop', 'engage', '先看挂在云上的雨', '我先看还挂在云上的雨。'),
      '我先把门带上，转过去的心留在门外。',
    ),
  ),
  pause2(
    'swords_03',
    'reversed',
    '门缝里那颗心仍转着，三柄剑没有拔出。你要怎么对待这三柄还留在心上的剑？',
    steps(
      action('outer', 'engage', '先只碰到最外面的一柄', '我先只碰到最外面的那一柄剑。'),
      action('still', 'engage', '先让三柄剑保持插着', '我先让这三柄剑保持插在心上。'),
      '我先把门带上，还留在心上的剑留在门外。',
    ),
  ),
  pause1(
    'swords_04',
    'upright',
    '门缝里，一个人躺着，一柄剑垫在身下，三柄剑挂在墙上，彩色玻璃还亮着。你要先怎么待这些挂着和垫着的剑？',
    steps(
      action('wall', 'engage', '先看墙上的三柄剑', '我先看挂在墙上的三柄剑。'),
      action('rest', 'engage', '先看躺着的人', '我先看躺着的这个人，剑先不动。'),
      '我先把门带上，挂着和垫着的剑留在门外。',
    ),
  ),
  pause2(
    'swords_04',
    'upright',
    '门缝里那个人仍躺着，墙上的三柄剑也还挂着。你要怎么安放这柄垫在身下的剑？',
    steps(
      action('under', 'engage', '先看身下那一柄', '我先看垫在身下的那一柄剑。'),
      action('glass', 'engage', '先看彩色玻璃上的人', '我先看彩色玻璃上的那个人，剑仍挂着。'),
      '我先把门带上，还挂在墙上的剑留在门外。',
    ),
  ),
  pause1(
    'swords_04',
    'reversed',
    '门缝里，躺着的人转过身，墙上的剑还挂着，身下那柄也还在。你要先怎么待这些没被取下的剑？',
    steps(
      action('sit', 'engage', '先让人坐起一点', '我先让转过身的人坐起一点。'),
      action('hang', 'engage', '先让墙上的剑继续挂着', '我先让墙上的三柄剑继续挂着。'),
      '我先把门带上，没被取下的剑留在门外。',
    ),
  ),
  pause2(
    'swords_04',
    'reversed',
    '门缝里人还没有重新躺平，三柄剑仍挂在墙上。你要怎么对待这柄还垫在身下的剑？',
    steps(
      action('flat', 'engage', '先把身下的剑摆正', '我先把垫在身下的那柄剑摆正。'),
      action('hands', 'engage', '先看并着的那双手', '我先看转过身的人还并着的手。'),
      '我先把门带上，还垫在身下的剑留在门外。',
    ),
  ),
  pause1(
    'swords_05',
    'upright',
    '门缝里，一个人手里握着剑，地上还躺着两柄，另两个人朝水边走开。你要先怎么待地上这几柄剑？',
    steps(
      action('ground', 'engage', '先看地上的两柄', '我先看还躺在地上的两柄剑。'),
      action('away', 'engage', '先看朝水边走开的人', '我先看朝水边走开的那两个人。'),
      '我先把门带上，地上和手里的剑留在门外。',
    ),
  ),
  pause2(
    'swords_05',
    'upright',
    '门缝里地上的剑还在，走开的人没有回头，手里的剑也还握着。你要怎么安放这些被捡起的剑？',
    steps(
      action('lower', 'engage', '先把捡起的一柄放低', '我先把捡起的一柄剑放低。'),
      action('sea', 'engage', '先看水边裂开的云', '我先看水边那些裂开的云。'),
      '我先把门带上，被捡起的剑留在门外。',
    ),
  ),
  pause1(
    'swords_05',
    'reversed',
    '门缝里，地上的剑还在，拿剑的人转过身，走开的人仍朝水边去。你要先怎么待这些还在地上的剑？',
    steps(
      action('down', 'engage', '先让地上的剑留在原地', '我先让地上的剑留在原地。'),
      action('back', 'engage', '先看转过身的人', '我先看转过身、手里还拿着剑的人。'),
      '我先把门带上，还在地上的剑留在门外。',
    ),
  ),
  pause2(
    'swords_05',
    'reversed',
    '门缝里那几柄地上的剑仍没被收起，人还是转着。你要怎么对待这些没收起的剑？',
    steps(
      action('one', 'engage', '先只收起地上的一柄', '我先只收起地上的一柄剑。'),
      action('water', 'engage', '先看人走向的那片水', '我先看他们走向的那片水。'),
      '我先把门带上，没收起的剑留在门外。',
    ),
  ),
  pause1(
    'swords_06',
    'upright',
    '门缝里，船上立着六柄剑，撑船的人带着披着的人和孩子，后面的水还乱着。你要先怎么待船上这六柄剑？',
    steps(
      action('boat', 'engage', '先看立在船上的剑', '我先看立在船上的六柄剑。'),
      action('pole', 'engage', '先看撑船的那根竿', '我先看撑船的人手里的竿。'),
      '我先把门带上，立在船上的六柄剑留在门外。',
    ),
  ),
  pause2(
    'swords_06',
    'upright',
    '门缝里六柄剑仍立在船上，后面的水还没平静。你要怎么安放这些还在船上的剑？',
    steps(
      action('child', 'engage', '先看船上的孩子', '我先看船上那个孩子。'),
      action('ahead', 'engage', '先看船头前面较平的水', '我先看船头前面较平的那片水。'),
      '我先把门带上，还立在船上的剑留在门外。',
    ),
  ),
  pause1(
    'swords_06',
    'reversed',
    '门缝里，船还在水上，六柄剑仍立着，船上的人转向身后的乱水。你要先怎么待这些还没靠岸的剑？',
    steps(
      action('turn', 'engage', '先看转向乱水的人', '我先看转向身后乱水的人。'),
      action('hull', 'engage', '先看船里立着的剑', '我先看还立在船里的六柄剑。'),
      '我先把门带上，还没靠岸的剑留在门外。',
    ),
  ),
  pause2(
    'swords_06',
    'reversed',
    '门缝里船仍停在乱水和静水之间，剑没有被搬下船。你要怎么对待这六柄还立在船上的剑？',
    steps(
      action('one', 'engage', '先只碰船里的一柄剑', '我先只碰船里的一柄剑。'),
      action('shore', 'engage', '先看船还没靠近的岸', '我先看船还没靠近的那道岸。'),
      '我先把门带上，没被搬下船的剑留在门外。',
    ),
  ),
  pause1(
    'swords_07',
    'upright',
    '门缝里，一个人抱着五柄剑轻步走开，地上还插着两柄，后面是营帐。你要先怎么待他抱着的这些剑？',
    steps(
      action('arms', 'engage', '先看抱在怀里的剑', '我先看抱在怀里的五柄剑。'),
      action('camp', 'engage', '先看营帐边插着的两柄', '我先看还插在营帐边的两柄剑。'),
      '我先把门带上，抱走的和插着的剑留在门外。',
    ),
  ),
  pause2(
    'swords_07',
    'upright',
    '门缝里那个人仍抱着剑，地上的两柄还插着。你要怎么安放这些被带走的剑？',
    steps(
      action('glance', 'engage', '先看他回头的那一眼', '我先看他回头的那一眼。'),
      action('two', 'engage', '先让地上的两柄留在原地', '我先让地上的两柄剑留在原地。'),
      '我先把门带上，被带走的剑留在门外。',
    ),
  ),
  pause1(
    'swords_07',
    'reversed',
    '门缝里，抱剑的人转回营帐，怀里的剑露了出来，地上两柄仍插着。你要先怎么待这些被看见的剑？',
    steps(
      action('show', 'engage', '先看露出来的剑', '我先看怀里露出来的剑。'),
      action('tent', 'engage', '先看他转回的营帐', '我先看他转回的那片营帐。'),
      '我先把门带上，被看见的剑留在门外。',
    ),
  ),
  pause2(
    'swords_07',
    'reversed',
    '门缝里剑还露在怀里，地上的两柄没有被拔起。你要怎么对待这些藏不住的剑？',
    steps(
      action('set', 'engage', '先把怀里的一柄放回地上', '我先把怀里的一柄剑放回地上。'),
      action('feet', 'engage', '先看他放轻的脚步', '我先看他还放轻的脚步。'),
      '我先把门带上，藏不住的剑留在门外。',
    ),
  ),
  pause1(
    'swords_08',
    'upright',
    '门缝里，一个人被布蒙眼、被绳子绑着，周围插着八柄剑。你要先怎么待周围这些剑？',
    steps(
      action('rope', 'engage', '先看绑着的绳子', '我先看绑在身上的绳子。'),
      action('ring', 'engage', '先数周围的剑', '我先数插在周围的八柄剑。'),
      '我先把门带上，周围的剑和绑着的人留在门外。',
    ),
  ),
  pause2(
    'swords_08',
    'upright',
    '门缝里绳子还绑着，八柄剑仍插在周围。你要怎么安放这些围着人的剑？',
    steps(
      action('cloth', 'engage', '先看蒙眼的布', '我先看蒙眼的那块布。'),
      action('gap', 'engage', '先看剑与剑之间的空档', '我先看两柄剑之间的空档。'),
      '我先把门带上，围着人的剑留在门外。',
    ),
  ),
  pause1(
    'swords_08',
    'reversed',
    '门缝里，绑着的绳子松了一点，人的手转了过来，周围的剑还插在地上。你要先怎么待这些还插着的剑？',
    steps(
      action('hands', 'engage', '先看转过来的手', '我先看转过来的那双手。'),
      action('loose', 'engage', '先看松了的绳子', '我先看松下来的那段绳子。'),
      '我先把门带上，还插着的剑留在门外。',
    ),
  ),
  pause2(
    'swords_08',
    'reversed',
    '门缝里绳子仍松着，八柄剑没有被拔起。你要怎么对待这些还围着的剑？',
    steps(
      action('one', 'engage', '先只碰最近的一柄剑', '我先只碰离人最近的一柄剑。'),
      action('puddle', 'engage', '先看脚下的水洼', '我先看脚下的水洼，剑仍围着。'),
      '我先把门带上，还围着的剑留在门外。',
    ),
  ),
  pause1(
    'swords_09',
    'upright',
    '门缝里，一个人从床上坐起，双手捂着脸，九柄剑横在床头的墙上。你要先怎么待这九柄横着的剑？',
    steps(
      action('face', 'engage', '先看捂着脸的手', '我先看捂着脸的那双手。'),
      action('row', 'engage', '先看横在墙上的剑', '我先看横在床头墙上的九柄剑。'),
      '我先把门带上，横在床头的剑留在门外。',
    ),
  ),
  pause2(
    'swords_09',
    'upright',
    '门缝里人还坐在床上，九柄剑仍横着。你要怎么安放这些悬在床头的剑？',
    steps(
      action('quilt', 'engage', '先看被子上的花', '我先看被子上的那些花。'),
      action('low', 'engage', '先只看最下面的一柄', '我先只看最下面的那一柄剑。'),
      '我先把门带上，悬在床头的剑留在门外。',
    ),
  ),
  pause1(
    'swords_09',
    'reversed',
    '门缝里，坐在床上的人转过脸，双手离开了一点，九柄剑仍横在墙上。你要先怎么待这些还横着的剑？',
    steps(
      action('down', 'engage', '先看离开脸的手', '我先看离开脸一点的那双手。'),
      action('wall', 'engage', '先让墙上的剑保持横着', '我先让这九柄剑保持横在墙上。'),
      '我先把门带上，还横着的剑留在门外。',
    ),
  ),
  pause2(
    'swords_09',
    'reversed',
    '门缝里床还在，人仍转着脸，剑没有从墙上取下。你要怎么对待这些没被取下的剑？',
    steps(
      action('sheet', 'engage', '先看被子上的花纹', '我先看被子上还在的花纹。'),
      action('edge', 'engage', '先碰最靠边的一柄剑', '我先碰最靠边的那一柄剑。'),
      '我先把门带上，没被取下的剑留在门外。',
    ),
  ),
  pause1(
    'swords_10',
    'upright',
    '门缝里，一个人俯着，十柄剑落在背上，天边有一道光。你要先怎么待背上这十柄剑？',
    steps(
      action('back', 'engage', '先看背上的剑', '我先看落在背上的十柄剑。'),
      action('light', 'engage', '先看天边那道光', '我先看天边的那道光。'),
      '我先把门带上，落在背上的剑留在门外。',
    ),
  ),
  pause2(
    'swords_10',
    'upright',
    '门缝里十柄剑仍在背上，天边的光也还在。你要怎么安放这些已经落下的剑？',
    steps(
      action('cloak', 'engage', '先看铺在地上的红披风', '我先看铺在地上的红披风。'),
      action('dawn', 'engage', '先让目光停在那道光上', '我先让目光停在天边的那道光上。'),
      '我先把门带上，已经落下的剑留在门外。',
    ),
  ),
  pause1(
    'swords_10',
    'reversed',
    '门缝里，俯着的人转过一点，背上的剑还没拔完，天边仍有光。你要先怎么待这些没拔完的剑？',
    steps(
      action('one', 'engage', '先只看最外面的一柄', '我先只看背上最外面的一柄剑。'),
      action('dawn', 'engage', '先看还在的那道光', '我先看天边还在的那道光。'),
      '我先把门带上，没拔完的剑留在门外。',
    ),
  ),
  pause2(
    'swords_10',
    'reversed',
    '门缝里背上的剑仍剩着，人还没有完全转过来。你要怎么对待这些还留在背上的剑？',
    steps(
      action('pull', 'engage', '先让最靠边的一柄离开背', '我先让最靠边的一柄剑离开背。'),
      action('red', 'engage', '先看红披风的一角', '我先看红披风还露着的一角。'),
      '我先把门带上，还留在背上的剑留在门外。',
    ),
  ),
  pause1(
    'swords_page',
    'upright',
    '门缝里，一个年轻人站在坡上，双手握着一柄朝上的剑，风吹着头发，天上有鸟。你要先怎么待他握着的这柄剑？',
    steps(
      action('grip', 'engage', '先看握剑的双手', '我先看握着剑的那双手。'),
      action('wind', 'engage', '先看吹过的风和鸟', '我先看吹过头发的风，和天上的鸟。'),
      '我先把门带上，年轻人握着的剑留在门外。',
    ),
  ),
  pause2(
    'swords_page',
    'upright',
    '门缝里那柄剑仍被握着朝上，风还吹着，鸟也还在。你要怎么安放这柄还没放下的剑？',
    steps(
      action('hill', 'engage', '先看他站的坡', '我先看他站着的那道坡。'),
      action('point', 'engage', '先看剑尖指着的天', '我先看剑尖指着的那片天。'),
      '我先把门带上，还被握着的剑留在门外。',
    ),
  ),
  pause1(
    'swords_page',
    'reversed',
    '门缝里，年轻人转过身，剑比他的手臂伸得更前，风仍吹着。你要先怎么待这柄抢在前面的剑？',
    steps(
      action('arm', 'engage', '先看伸在前面的剑', '我先看抢在手臂前面的这柄剑。'),
      action('birds', 'engage', '先看还在飞的鸟', '我先看风里还在飞的鸟。'),
      '我先把门带上，抢在前面的剑留在门外。',
    ),
  ),
  pause2(
    'swords_page',
    'reversed',
    '门缝里剑仍比手臂靠前，人还转着，风没有停。你要怎么对待这柄没收住的剑？',
    steps(
      action('back', 'engage', '先把剑收回与肩同高', '我先把这柄剑收回与肩同高。'),
      action('hair', 'engage', '先看被风吹起的头发', '我先看被风吹起的头发。'),
      '我先把门带上，没收住的剑留在门外。',
    ),
  ),
  pause1(
    'swords_knight',
    'upright',
    '门缝里，马上的人举起剑往前冲，披风和马鬃被风掀起。你要先怎么待这柄举着的剑？',
    steps(
      action('sword', 'engage', '先看举起的剑', '我先看他举起的这柄剑。'),
      action('horse', 'engage', '先看往前的马', '我先看还在往前的这匹马。'),
      '我先把门带上，举着往前的剑留在门外。',
    ),
  ),
  pause2(
    'swords_knight',
    'upright',
    '门缝里剑仍举在马前，披风还掀着。你要怎么安放这柄还在冲的剑？',
    steps(
      action('rein', 'engage', '先看马的缰绳', '我先看这匹马的缰绳。'),
      action('blade', 'engage', '先让剑尖保持朝前', '我先让剑尖保持朝前。'),
      '我先把门带上，还在冲的剑留在门外。',
    ),
  ),
  pause1(
    'swords_knight',
    'reversed',
    '门缝里，马仍往前，马上的人转过脸，剑还指着前方。你要先怎么待这柄还指着前方的剑？',
    steps(
      action('face', 'engage', '先看转过的脸', '我先看马上转过的那张脸。'),
      action('fast', 'engage', '先看还在往前的马', '我先看还在往前冲的马。'),
      '我先把门带上，还指着前方的剑留在门外。',
    ),
  ),
  pause2(
    'swords_knight',
    'reversed',
    '门缝里剑仍指着前方，马没有慢下来。你要怎么对待这柄没收住的剑？',
    steps(
      action('lower', 'engage', '先把剑放低一寸', '我先把这柄剑放低一寸。'),
      action('cloak', 'engage', '先看被风掀起的披风', '我先看被风掀起的披风。'),
      '我先把门带上，指在马前的剑留在门外。',
    ),
  ),
  pause1(
    'swords_queen',
    'upright',
    '门缝里，云边的座位上，一个人把剑竖直，另一只手伸向前方，周围有蝴蝶。你要先怎么待这柄竖着的剑？',
    steps(
      action('upright', 'engage', '先看竖直的剑', '我先看她竖着的这柄剑。'),
      action('hand', 'engage', '先看伸向前的那只手', '我先看伸向前方的那只手。'),
      '我先把门带上，竖在座位旁的剑留在门外。',
    ),
  ),
  pause2(
    'swords_queen',
    'upright',
    '门缝里那柄剑仍竖着，伸向前的手也还在，蝴蝶没有落定。你要怎么安放这柄还竖着的剑？',
    steps(
      action('cloud', 'engage', '先看座位周围的云', '我先看座位周围的云。'),
      action('hilt', 'engage', '先看握剑的那只手', '我先看握着剑柄的那只手。'),
      '我先把门带上，还竖着的剑留在门外。',
    ),
  ),
  pause1(
    'swords_queen',
    'reversed',
    '门缝里，剑仍竖得笔直，座位上的人把脸转开，伸着的手没有收回。你要先怎么待这柄仍笔直的剑？',
    steps(
      action('face', 'engage', '先看转开的脸', '我先看转开的那张脸。'),
      action('blade', 'engage', '先看笔直的刃', '我先看这柄仍笔直的刃。'),
      '我先把门带上，仍笔直的剑留在门外。',
    ),
  ),
  pause2(
    'swords_queen',
    'reversed',
    '门缝里剑还是那么直，人仍把脸转开。你要怎么对待这柄没有偏过的剑？',
    steps(
      action('hand', 'engage', '先让伸着的手停一下', '我先让伸向前的手停一下。'),
      action('wing', 'engage', '先看还飞着的蝴蝶', '我先看还在飞的蝴蝶。'),
      '我先把门带上，没有偏过的剑留在门外。',
    ),
  ),
  pause1(
    'swords_king',
    'upright',
    '门缝里，座位上的人把一柄剑竖成一条直线，云和蝴蝶在旁边。你要先怎么待这柄竖成直线的剑？',
    steps(
      action('axis', 'engage', '先看这条竖着的剑', '我先看这条竖成直线的剑。'),
      action('seat', 'engage', '先看他坐着的姿势', '我先看他坐着的姿势，剑仍竖着。'),
      '我先把门带上，竖成直线的剑留在门外。',
    ),
  ),
  pause2(
    'swords_king',
    'upright',
    '门缝里那柄剑仍竖成直线，蝴蝶还停在云边。你要怎么安放这柄还没偏过的剑？',
    steps(
      action('hilt', 'engage', '先看按着剑的手', '我先看按着剑的那只手。'),
      action('wing', 'engage', '先看云边的蝴蝶', '我先看云边的那只蝴蝶。'),
      '我先把门带上，还竖成直线的剑留在门外。',
    ),
  ),
  pause1(
    'swords_king',
    'reversed',
    '门缝里，座位上的人把剑握得更紧，脸转向一侧，刃仍是那一条直线。你要先怎么待这柄被握紧的剑？',
    steps(
      action('tight', 'engage', '先看握紧的手', '我先看握紧剑的那只手。'),
      action('side', 'engage', '先看转向一侧的脸', '我先看转向一侧的那张脸。'),
      '我先把门带上，被握紧的剑留在门外。',
    ),
  ),
  pause2(
    'swords_king',
    'reversed',
    '门缝里剑仍被握得很紧，人还转向一侧。你要怎么对待这柄没有松开的剑？',
    steps(
      action('ease', 'engage', '先让握剑的手松一点', '我先让握剑的手松一点。'),
      action('cloud', 'engage', '先看他身边的云', '我先看座位身边的云。'),
      '我先把门带上，没有松开的剑留在门外。',
    ),
  ),
];
