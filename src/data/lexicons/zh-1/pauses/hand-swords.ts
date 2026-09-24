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

export const HAND_SWORDS_OFFERS: readonly PauseOffer[] = [
  pause1(
    'swords_01_ace',
    'upright',
    '掌心里，云中的手递出一柄朝上的剑，剑尖托着冠和叶环。你要先怎么待这柄朝上的剑？',
    steps(
      action('crown', 'engage', '先看剑尖上的冠', '我先看剑尖上的冠和叶环。'),
      action('cloud', 'engage', '先看托剑的那只手', '我先看云中托着剑的那只手。'),
      '我把云中的剑放回桌上。',
    ),
  ),
  pause2(
    'swords_01_ace',
    'upright',
    '掌心里那柄剑仍朝上，冠和叶环还在剑尖。你要怎么安放这圈还托在剑尖的叶环？',
    steps(
      action('wreath', 'engage', '先看剑尖的叶环', '我先看还托在剑尖的叶环。'),
      action('blade', 'engage', '先沿刃看下去', '我先沿这柄朝上的刃看下去。'),
      '我把冠和剑放回桌上。',
    ),
  ),
  pause1(
    'swords_01_ace',
    'reversed',
    '掌心里这张牌倒着，剑、冠、叶环和云中的手仍印着。你要先把剑尖转到哪一边？',
    steps(
      action('tip', 'engage', '先把剑尖转上来', '我先把这柄剑的尖转上来。'),
      action('wreath', 'engage', '先看倒着的叶环', '我先看印在剑尖的叶环。'),
      '我把倒着的剑放回桌上。',
    ),
  ),
  pause2(
    'swords_01_ace',
    'reversed',
    '牌仍倒在掌心，叶环还连在冠上，手还从云里伸出。你要怎么放这只还印着的手？',
    steps(
      action('cloud', 'engage', '先按住云中的手', '我先按住云中托剑的那只手。'),
      action('crown', 'engage', '先看冠的边', '我先看剑尖那顶冠的边。'),
      '我把倒着的叶环和剑放回桌上。',
    ),
  ),
  pause1(
    'swords_02',
    'upright',
    '掌心里，一个人蒙着眼，两柄剑交叉在胸前，身后是海和一弯月。你要先怎么待这两柄交叉的剑？',
    steps(
      action('cross', 'engage', '先看交叉的两柄剑', '我先看交叉在胸前的两柄剑。'),
      action('cloth', 'engage', '先看蒙眼的布', '我先看蒙着眼的那块布。'),
      '我把交叉的两柄剑放回桌上。',
    ),
  ),
  pause2(
    'swords_02',
    'upright',
    '掌心里两柄剑仍交叉在胸前，海上的月还弯着。你要怎么安放身后这弯还挂着的月？',
    steps(
      action('moon', 'engage', '先看海上的月', '我先看海面上那弯月。'),
      action('sea', 'engage', '先看身后的海', '我先看人身后的海。'),
      '我把蒙眼的布和剑放回桌上。',
    ),
  ),
  pause1(
    'swords_02',
    'reversed',
    '掌心里这张牌倒着，两柄剑、蒙眼布、海和月仍印着。你要先把哪一柄剑转到朝上？',
    steps(
      action('blade', 'engage', '先把其中一柄转上来', '我先把交叉着的其中一柄剑转上来。'),
      action('moon', 'engage', '先看倒着的月', '我先看印在海上的那弯月。'),
      '我把倒着的两柄剑放回桌上。',
    ),
  ),
  pause2(
    'swords_02',
    'reversed',
    '牌仍倒在掌心，布还蒙在眼上，两柄剑还交叉着。你要怎么放这块还印着的布？',
    steps(
      action('cloth', 'engage', '先按住这块布', '我先按住蒙眼的这块布。'),
      action('water', 'engage', '先看身后的海', '我先看还印在身后的海。'),
      '我把倒着的月和剑放回桌上。',
    ),
  ),
  pause1(
    'swords_03',
    'upright',
    '掌心里，一颗心被三柄剑穿过，云里还在落雨。你要先怎么待这三柄穿过心的剑？',
    steps(
      action('blades', 'engage', '先看穿过心的三柄剑', '我先看穿过这颗心的三柄剑。'),
      action('rain', 'engage', '先看云里的雨', '我先看从云里落下的雨。'),
      '我把这颗心和三柄剑放回桌上。',
    ),
  ),
  pause2(
    'swords_03',
    'upright',
    '掌心里三柄剑仍穿过那颗心，雨也还在下。你要怎么安放这片还在下雨的云？',
    steps(
      action('cloud', 'engage', '先看下雨的云', '我先看还在下雨的那片云。'),
      action('middle', 'engage', '先看中间那一柄', '我先看穿过心的中间那一柄剑。'),
      '我把心上的三柄剑放回桌上。',
    ),
  ),
  pause1(
    'swords_03',
    'reversed',
    '掌心里这张牌倒着，心、三柄剑、云和雨仍印着。你要先把这颗心转到哪一边？',
    steps(
      action('heart', 'engage', '先把心转上来', '我先把这颗心转上来。'),
      action('rain', 'engage', '先看倒着的雨', '我先看印在云上的雨。'),
      '我把倒着的三柄剑放回桌上。',
    ),
  ),
  pause2(
    'swords_03',
    'reversed',
    '牌仍倒在掌心，三柄剑还留在心上，雨线还在。你要怎么放这些还印着的雨线？',
    steps(
      action('rain', 'engage', '先按住这些雨线', '我先按住云上的雨线。'),
      action('outer', 'engage', '先看最外面的一柄剑', '我先看最外面的那一柄剑。'),
      '我把倒着的心和剑放回桌上。',
    ),
  ),
  pause1(
    'swords_04',
    'upright',
    '掌心里，一个人躺在石棺上，三柄剑挂在石墙上，第四柄放在腿边，窗是黄蓝菱格。你要先怎么待这四柄剑？',
    steps(
      action('wall', 'engage', '先看石墙上的三柄', '我先看挂在石墙上的三柄剑。'),
      action('side', 'engage', '先看腿边那一柄', '我先看放在腿边的那一柄剑。'),
      '我把石墙上的剑放回桌上。',
    ),
  ),
  pause2(
    'swords_04',
    'upright',
    '掌心里三柄剑仍挂在石墙上，腿边那柄和菱格窗都还在。你要怎么安放这扇黄蓝菱格的窗？',
    steps(
      action('pane', 'engage', '先看菱格窗', '我先看这扇黄蓝菱格的窗。'),
      action('tomb', 'engage', '先看石棺的边', '我先看人躺着的石棺边。'),
      '我把腿边的剑放回桌上。',
    ),
  ),
  pause1(
    'swords_04',
    'reversed',
    '掌心里这张牌倒着，石棺、四柄剑和黄蓝菱格窗仍印着。你要先把墙上的剑转到哪一边？',
    steps(
      action('wall', 'engage', '先把墙上的剑转上来', '我先把石墙上的三柄剑转上来。'),
      action('pane', 'engage', '先看倒着的窗', '我先看印着的黄蓝菱格窗。'),
      '我把倒着的四柄剑放回桌上。',
    ),
  ),
  pause2(
    'swords_04',
    'reversed',
    '牌仍倒在掌心，第四柄剑还放在腿边。你要怎么放这柄还印在腿边的剑？',
    steps(
      action('side', 'engage', '先托住腿边的剑', '我先托住放在腿边的那柄剑。'),
      action('glass', 'engage', '先看窗上的菱格', '我先看窗上黄蓝相间的菱格。'),
      '我把倒着的石棺和剑放回桌上。',
    ),
  ),
  pause1(
    'swords_05',
    'upright',
    '掌心里，一个人手里握着剑，地上还躺着两柄，另两个人朝水边走开。你要先怎么待地上这两柄剑？',
    steps(
      action('ground', 'engage', '先看地上的两柄', '我先看躺在地上的两柄剑。'),
      action('away', 'engage', '先看朝水边走开的人', '我先看朝水边走开的那两个人。'),
      '我把地上和手里的剑放回桌上。',
    ),
  ),
  pause2(
    'swords_05',
    'upright',
    '掌心里地上的两柄剑还在，水边的云裂开着。你要怎么安放水边这些裂开的云？',
    steps(
      action('cloud', 'engage', '先看裂开的云', '我先看水边那些裂开的云。'),
      action('held', 'engage', '先看手里握着的剑', '我先看还握在手里的剑。'),
      '我把地上的两柄剑放回桌上。',
    ),
  ),
  pause1(
    'swords_05',
    'reversed',
    '掌心里这张牌倒着，手里的剑、地上的两柄和朝水边走开的人仍印着。你要先把地上的剑转到哪一边？',
    steps(
      action('ground', 'engage', '先把地上的剑转上来', '我先把地上的两柄剑转上来。'),
      action('water', 'engage', '先看倒着的水', '我先看印在远处的水。'),
      '我把倒着的剑放回桌上。',
    ),
  ),
  pause2(
    'swords_05',
    'reversed',
    '牌仍倒在掌心，两个人还朝水边走开，剑还在地上。你要怎么放这片还印着的水？',
    steps(
      action('water', 'engage', '先看他们走向的水', '我先看他们走向的那片水。'),
      action('held', 'engage', '先看手里的剑', '我先看还握在手里的剑。'),
      '我把倒着的云和剑放回桌上。',
    ),
  ),
  pause1(
    'swords_06',
    'upright',
    '掌心里，船上立着六柄剑，撑船的人带着披着的人和孩子，船后的水还乱着。你要先怎么待船上这六柄剑？',
    steps(
      action('boat', 'engage', '先看船上的六柄剑', '我先看立在船上的六柄剑。'),
      action('pole', 'engage', '先看撑船的竿', '我先看撑船的人手里的竿。'),
      '我把船上的六柄剑放回桌上。',
    ),
  ),
  pause2(
    'swords_06',
    'upright',
    '掌心里六柄剑仍立在船上，孩子还在船里。你要怎么安放船头前面这片较平的水？',
    steps(
      action('ahead', 'engage', '先看船头前的水', '我先看船头前面较平的那片水。'),
      action('child', 'engage', '先看船上的孩子', '我先看船上那个孩子。'),
      '我把撑船的竿和剑放回桌上。',
    ),
  ),
  pause1(
    'swords_06',
    'reversed',
    '掌心里这张牌倒着，六柄剑、船、竿、孩子和水面仍印着。你要先把船上的剑转到哪一边？',
    steps(
      action('blades', 'engage', '先把船上的剑转上来', '我先把立在船上的六柄剑转上来。'),
      action('child', 'engage', '先看倒着的孩子', '我先看印在船上的孩子。'),
      '我把倒着的船放回桌上。',
    ),
  ),
  pause2(
    'swords_06',
    'reversed',
    '牌仍倒在掌心，竿还在撑船的人手里，六柄剑还立着。你要怎么放这根还印着的竿？',
    steps(
      action('pole', 'engage', '先按住这根竿', '我先按住撑船的这根竿。'),
      action('cloak', 'engage', '先看披着的人', '我先看船上披着的那个人。'),
      '我把倒着的水和剑放回桌上。',
    ),
  ),
  pause1(
    'swords_07',
    'upright',
    '掌心里，一个人侧着脸，低头看怀里的五柄剑，条纹营帐边还立着两柄。你要先怎么待他怀里的这些剑？',
    steps(
      action('arms', 'engage', '先看怀里的五柄剑', '我先看他低头看着的五柄剑。'),
      action('camp', 'engage', '先看营帐边的两柄', '我先看条纹营帐边立着的两柄剑。'),
      '我把怀里的剑放回桌上。',
    ),
  ),
  pause2(
    'swords_07',
    'upright',
    '掌心里五柄剑仍在怀里，营帐的条纹也还在。你要怎么安放这些还立在营帐边的剑？',
    steps(
      action('two', 'engage', '先看营帐边的两柄', '我先看还立在营帐边的两柄剑。'),
      action('face', 'engage', '先看低下的侧脸', '我先看他低下的那张侧脸。'),
      '我把条纹营帐和剑放回桌上。',
    ),
  ),
  pause1(
    'swords_07',
    'reversed',
    '掌心里这张牌倒着，五柄剑、两柄立着的剑和条纹营帐仍印着。你要先把怀里的剑转到哪一边？',
    steps(
      action('arms', 'engage', '先把怀里的剑转上来', '我先把怀里的五柄剑转上来。'),
      action('tent', 'engage', '先看倒着的营帐', '我先看印着条纹的营帐。'),
      '我把倒着的剑放回桌上。',
    ),
  ),
  pause2(
    'swords_07',
    'reversed',
    '牌仍倒在掌心，侧脸还低向怀里的剑。你要怎么放这张还印着的侧脸？',
    steps(
      action('face', 'engage', '先看这张侧脸', '我先看低向剑的这张侧脸。'),
      action('stripe', 'engage', '先看营帐的条纹', '我先看营帐上的条纹。'),
      '我把倒着的营帐和剑放回桌上。',
    ),
  ),
  pause1(
    'swords_08',
    'upright',
    '掌心里，一个人被布蒙眼、被绳子绑着，周围的地上插着八柄剑。你要先怎么待周围这八柄剑？',
    steps(
      action('ring', 'engage', '先看周围的八柄剑', '我先看插在周围地上的八柄剑。'),
      action('rope', 'engage', '先看绑着的绳子', '我先看绑在身上的绳子。'),
      '我把周围的剑放回桌上。',
    ),
  ),
  pause2(
    'swords_08',
    'upright',
    '掌心里八柄剑仍插在周围，蒙眼的布和脚下的水洼都还在。你要怎么安放脚下这摊还在的水？',
    steps(
      action('puddle', 'engage', '先看脚下的水洼', '我先看脚下那摊水。'),
      action('cloth', 'engage', '先看蒙眼的布', '我先看蒙眼的那块布。'),
      '我把绳子和周围的剑放回桌上。',
    ),
  ),
  pause1(
    'swords_08',
    'reversed',
    '掌心里这张牌倒着，八柄剑、绳子、蒙眼布和水洼仍印着。你要先把周围的剑转到哪一边？',
    steps(
      action('blades', 'engage', '先把周围的剑转上来', '我先把这八柄剑转上来。'),
      action('rope', 'engage', '先看倒着的绳子', '我先看印在身上的绳子。'),
      '我把倒着的八柄剑放回桌上。',
    ),
  ),
  pause2(
    'swords_08',
    'reversed',
    '牌仍倒在掌心，水洼还在脚边，剑还围着。你要怎么放这摊还印着的水？',
    steps(
      action('puddle', 'engage', '先按住这摊水', '我先按住脚边这摊水。'),
      action('gap', 'engage', '先看两柄剑之间的空档', '我先看两柄剑之间的空档。'),
      '我把倒着的布和剑放回桌上。',
    ),
  ),
  pause1(
    'swords_09',
    'upright',
    '掌心里，一个人从床上坐起，双手捂着脸，九柄剑在暗处弯成一道弧，被子上有玫瑰。你要先怎么待这九柄弯成弧的剑？',
    steps(
      action('arc', 'engage', '先看弯成弧的九柄剑', '我先看暗处弯成弧的九柄剑。'),
      action('face', 'engage', '先看捂着脸的双手', '我先看捂在脸上的那双手。'),
      '我把这九柄剑放回桌上。',
    ),
  ),
  pause2(
    'swords_09',
    'upright',
    '掌心里九柄剑仍弯成弧，被子上的玫瑰和木头床头都还在。你要怎么安放被子上这些玫瑰？',
    steps(
      action('rose', 'engage', '先看被子上的玫瑰', '我先看被子上的那些玫瑰。'),
      action('board', 'engage', '先看木头床头', '我先看床头那块木头。'),
      '我把捂着脸的双手和剑放回桌上。',
    ),
  ),
  pause1(
    'swords_09',
    'reversed',
    '掌心里这张牌倒着，九柄剑、床、玫瑰和捂脸的手仍印着。你要先把这道剑弧转到哪一边？',
    steps(
      action('arc', 'engage', '先把剑弧转上来', '我先把这九柄剑转上来。'),
      action('rose', 'engage', '先看倒着的玫瑰', '我先看印在被子上的玫瑰。'),
      '我把倒着的九柄剑放回桌上。',
    ),
  ),
  pause2(
    'swords_09',
    'reversed',
    '牌仍倒在掌心，木头床头还在，双手还捂着脸。你要怎么放这块还印着的床头？',
    steps(
      action('board', 'engage', '先按住这块床头', '我先按住床头那块木头。'),
      action('hands', 'engage', '先看捂着的双手', '我先看还捂在脸上的双手。'),
      '我把倒着的玫瑰和剑放回桌上。',
    ),
  ),
  pause1(
    'swords_10',
    'upright',
    '掌心里，红披风裹着一个脸朝下的人，十柄剑在披风后面竖成一排，天边是一道黄光，黄光下是水。你要先怎么待披风后面这排竖着的剑？',
    steps(
      action('row', 'engage', '先看披风后面的十柄剑', '我先看竖在红披风后面的十柄剑。'),
      action('light', 'engage', '先看天边的黄光', '我先看天边那道黄光。'),
      '我把红披风和这排剑放回桌上。',
    ),
  ),
  pause2(
    'swords_10',
    'upright',
    '掌心里十柄剑仍竖在红披风后面，黄光和水都还在。你要怎么安放天边这道还亮着的黄光？',
    steps(
      action('dawn', 'engage', '先看这道黄光', '我先看天边这道黄光。'),
      action('water', 'engage', '先看黄光下的水', '我先看黄光下面的水。'),
      '我把竖在披风后面的剑放回桌上。',
    ),
  ),
  pause1(
    'swords_10',
    'reversed',
    '掌心里这张牌倒着，红披风、十柄竖着的剑、黄光和水仍印着。你要先把这排剑转到哪一边？',
    steps(
      action('row', 'engage', '先把这排剑转上来', '我先把竖着的十柄剑转上来。'),
      action('cloak', 'engage', '先看倒着的红披风', '我先看印着的红披风。'),
      '我把倒着的十柄剑放回桌上。',
    ),
  ),
  pause2(
    'swords_10',
    'reversed',
    '牌仍倒在掌心，十柄剑还竖在红披风后面，一只手还露在披风外。你要怎么放这只还露着的手？',
    steps(
      action('palm', 'engage', '先看披风外的手', '我先看露在红披风外的那只手。'),
      action('band', 'engage', '先看那道黄光', '我先看还印在天边的黄光。'),
      '我把倒着的水和剑放回桌上。',
    ),
  ),
  pause1(
    'swords_page',
    'upright',
    '掌心里，一个年轻人站在坡上，双手握着一柄朝上的剑，风吹着头发，天上有鸟。你要先怎么待他握着的这柄剑？',
    steps(
      action('grip', 'engage', '先看握剑的双手', '我先看握着剑的那双手。'),
      action('birds', 'engage', '先看天上的鸟', '我先看风里天上的鸟。'),
      '我把坡上的剑放回桌上。',
    ),
  ),
  pause2(
    'swords_page',
    'upright',
    '掌心里那柄剑仍被双手握着朝上，鸟还在风里。你身上哪一种手艺够用在这柄朝上的剑上？',
    steps(
      action('craft', 'engage', '用正在学的那门手艺', '我用正在学的那门手艺，先把这柄剑握稳。'),
      action('hill', 'engage', '先看他站的坡', '我先看他站着的那道坡。'),
      '我把风里的鸟和剑放回桌上。',
    ),
  ),
  pause1(
    'swords_page',
    'reversed',
    '掌心里这张牌倒着，剑、坡、头发和鸟仍印着。你要先把这柄剑转到哪一边？',
    steps(
      action('blade', 'engage', '先把剑转上来', '我先把这柄朝上的剑转上来。'),
      action('hair', 'engage', '先看被风吹的头发', '我先看被风吹起的头发。'),
      '我把倒着的剑放回桌上。',
    ),
  ),
  pause2(
    'swords_page',
    'reversed',
    '牌仍倒在掌心，鸟还在天上，剑还握在双手里。你要怎么放这些还印着的鸟？',
    steps(
      action('birds', 'engage', '先看天上的鸟', '我先看还在飞的鸟。'),
      action('hill', 'engage', '先看脚下的坡', '我先看他还站着的坡。'),
      '我把倒着的头发和剑放回桌上。',
    ),
  ),
  pause1(
    'swords_knight',
    'upright',
    '掌心里，马上的人举起剑往前，披风和马鬃被风掀起。你要先怎么待这柄举起的剑？',
    steps(
      action('sword', 'engage', '先看举起的剑', '我先看他举起的这柄剑。'),
      action('mane', 'engage', '先看被风掀起的马鬃', '我先看被风掀起的马鬃。'),
      '我把马上的剑放回桌上。',
    ),
  ),
  pause2(
    'swords_knight',
    'upright',
    '掌心里剑仍举在马前，披风还被风掀着。你身上哪一种手艺够用在这柄举起的剑上？',
    steps(
      action('craft', 'engage', '用正在学的那门手艺', '我用正在学的那门手艺，先看清这柄剑的刃。'),
      action('rein', 'engage', '先看马的缰绳', '我先看这匹马的缰绳。'),
      '我把披风和剑放回桌上。',
    ),
  ),
  pause1(
    'swords_knight',
    'reversed',
    '掌心里这张牌倒着，剑、马、披风和马鬃仍印着。你要先把举起的剑转到哪一边？',
    steps(
      action('sword', 'engage', '先把剑转上来', '我先把举起的剑转上来。'),
      action('cloak', 'engage', '先看倒着的披风', '我先看印着的披风。'),
      '我把倒着的剑和马放回桌上。',
    ),
  ),
  pause2(
    'swords_knight',
    'reversed',
    '牌仍倒在掌心，马蹄还抬着，剑还举在前面。你要怎么放这只还抬着的马蹄？',
    steps(
      action('hoof', 'engage', '先看抬起的马蹄', '我先看还抬着的马蹄。'),
      action('mane', 'engage', '先看马鬃', '我先看被风掀起的马鬃。'),
      '我把倒着的披风和剑放回桌上。',
    ),
  ),
  pause1(
    'swords_queen',
    'upright',
    '掌心里，云边的座位上，一个人把剑竖直，另一只手举起，天上有一只鸟。你要先怎么待这柄竖着的剑？',
    steps(
      action('blade', 'engage', '先看竖直的剑', '我先看她竖着的这柄剑。'),
      action('hand', 'engage', '先看举起的那只手', '我先看她举起的那只手。'),
      '我把竖着的剑放回桌上。',
    ),
  ),
  pause2(
    'swords_queen',
    'upright',
    '掌心里剑仍竖着，扶手上有一个雕着的小头，鸟还在天上。你身上哪一种手艺够用在这柄竖着的剑上？',
    steps(
      action('craft', 'engage', '用正在学的那门手艺', '我用正在学的那门手艺，先把这柄剑竖稳。'),
      action('bird', 'engage', '先看天上的鸟', '我先看还在飞的那只鸟。'),
      '我把座位上的剑放回桌上。',
    ),
  ),
  pause1(
    'swords_queen',
    'reversed',
    '掌心里这张牌倒着，剑、举起的手、鸟和座位仍印着。你要先把这柄剑转到哪一边？',
    steps(
      action('blade', 'engage', '先把剑转上来', '我先把竖直的剑转上来。'),
      action('bird', 'engage', '先看倒着的鸟', '我先看印在天上的鸟。'),
      '我把倒着的剑放回桌上。',
    ),
  ),
  pause2(
    'swords_queen',
    'reversed',
    '牌仍倒在掌心，扶手上的小头还在，剑还竖着。你要怎么放这个还雕着的小头？',
    steps(
      action('head', 'engage', '先看扶手上的小头', '我先看座位扶手上雕着的小头。'),
      action('hand', 'engage', '先看举起的手', '我先看还举着的那只手。'),
      '我把倒着的鸟和剑放回桌上。',
    ),
  ),
  pause1(
    'swords_king',
    'upright',
    '掌心里，座位上的人把一柄剑竖成一条直线，旁边有云和蝴蝶。你要先怎么待这柄竖成直线的剑？',
    steps(
      action('blade', 'engage', '先看这条竖着的剑', '我先看竖成直线的这柄剑。'),
      action('wing', 'engage', '先看旁边的蝴蝶', '我先看云边的蝴蝶。'),
      '我把竖着的剑放回桌上。',
    ),
  ),
  pause2(
    'swords_king',
    'upright',
    '掌心里剑仍竖成直线，蝴蝶还在云边。你身上哪一种手艺够用在这柄竖着的剑上？',
    steps(
      action('craft', 'engage', '用正在学的那门手艺', '我用正在学的那门手艺，先按住这柄剑。'),
      action('cloud', 'engage', '先看座位旁的云', '我先看座位旁边的云。'),
      '我把蝴蝶和剑放回桌上。',
    ),
  ),
  pause1(
    'swords_king',
    'reversed',
    '掌心里这张牌倒着，剑、云、蝴蝶和座位仍印着。你要先把这柄剑转到哪一边？',
    steps(
      action('blade', 'engage', '先把剑转上来', '我先把竖着的剑转上来。'),
      action('wing', 'engage', '先看倒着的蝴蝶', '我先看印在云边的蝴蝶。'),
      '我把倒着的剑放回桌上。',
    ),
  ),
  pause2(
    'swords_king',
    'reversed',
    '牌仍倒在掌心，按着剑的手还在，云还在座位旁。你要怎么放这只还按着剑的手？',
    steps(
      action('hilt', 'engage', '先看按剑的手', '我先看按着剑的那只手。'),
      action('cloud', 'engage', '先看旁边的云', '我先看还在座位旁的云。'),
      '我把倒着的蝴蝶和剑放回桌上。',
    ),
  ),
];
