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

export const HAND_WANDS_OFFERS: readonly PauseOffer[] = [
  pause1(
    'wands_01_ace',
    'upright',
    '掌心里，云中的手递出一根权杖，杖上的叶子和芽是新的。你要先怎么待这根长着新芽的杖？',
    steps(
      action('bud', 'engage', '先看杖上的新芽', '我先看这根杖上的新芽。'),
      action('cloud', 'engage', '先看托杖的那只手', '我先看云中托着杖的那只手。'),
      '我把长着新芽的权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_01_ace',
    'upright',
    '掌心里那根权杖仍被托着，新叶和芽也还在。你要怎么安放托着杖的这朵云？',
    steps(
      action('leaf', 'engage', '先看最上面的叶子', '我先看这根杖最上面的叶子。'),
      action('cloud', 'engage', '先看托着杖的云', '我先看托着杖的那朵云。'),
      '我把云中的权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_01_ace',
    'reversed',
    '掌心里这张牌倒着，权杖、叶子、芽和云中的手仍印着。你要先把杖尖转到哪一边？',
    steps(
      action('tip', 'engage', '先把杖尖转上来', '我先把这根杖的尖转上来。'),
      action('bud', 'engage', '先看倒着的芽', '我先看印在杖上的芽。'),
      '我把倒着的权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_01_ace',
    'reversed',
    '牌仍倒在掌心，叶子还连在杖上，手还从云里伸出。你要怎么放这些还印着的叶子？',
    steps(
      action('leaf', 'engage', '先按住这些叶子', '我先按住杖上的叶子。'),
      action('cloud', 'engage', '先看云里的手', '我先看云里伸出的那只手。'),
      '我把倒着的芽和权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_02',
    'upright',
    '掌心里，一个人站在城墙上，手里一根权杖和一只小地球，身后另有一根杖。你要先怎么待这两根杖？',
    steps(
      action('held', 'engage', '先看手里的那根杖', '我先看他手里的那根权杖。'),
      action('globe', 'engage', '先看手里的小地球', '我先看他另一只手里的小地球。'),
      '我把城墙上的两根权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_02',
    'upright',
    '掌心里两根权杖还在，一根在手里，一根在身后，城墙外有山和海。你要怎么安放城墙外这片海？',
    steps(
      action('sea', 'engage', '先看城墙外的海', '我先看城墙外的海。'),
      action('back', 'engage', '先看身后那根杖', '我先看身后固定着的那根权杖。'),
      '我把小地球和权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_02',
    'reversed',
    '掌心里这张牌倒着，两根权杖、小地球、城墙和海仍印着。你要先把小地球转到哪一边？',
    steps(
      action('globe', 'engage', '先把小地球转上来', '我先把这只小地球转上来。'),
      action('wall', 'engage', '先看倒着的城墙', '我先看印着的城墙。'),
      '我把倒着的两根权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_02',
    'reversed',
    '牌仍倒在掌心，身后那根杖还固定着，小地球还在手里。你要怎么放这根还固定着的杖？',
    steps(
      action('back', 'engage', '先按住身后的杖', '我先按住身后那根权杖。'),
      action('hills', 'engage', '先看城墙外的山', '我先看城墙外的山。'),
      '我把倒着的海和权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_03',
    'upright',
    '掌心里，岸上的人背对着这边，身边立着三根权杖，海上有船。你要先怎么待这三根立着的杖？',
    steps(
      action('staves', 'engage', '先看身边的三根杖', '我先看立在他身边的三根权杖。'),
      action('ships', 'engage', '先看海上的船', '我先看海上的那些船。'),
      '我把岸上的三根权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_03',
    'upright',
    '掌心里三根权杖仍立在岸上，船也还在海上。你要怎么安放海上最前面的这条船？',
    steps(
      action('hull', 'engage', '先看最前面的船', '我先看海上最前面的那条船。'),
      action('cliff', 'engage', '先看他站着的岸', '我先看他站着的这道岸。'),
      '我把立着的三根权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_03',
    'reversed',
    '掌心里这张牌倒着，三根权杖、背对的人和船仍印着。你要先把这三根杖转到哪一边？',
    steps(
      action('staves', 'engage', '先把三根杖转上来', '我先把立着的三根权杖转上来。'),
      action('ships', 'engage', '先看倒着的船', '我先看印在海上的船。'),
      '我把倒着的三根权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_03',
    'reversed',
    '牌仍倒在掌心，人还背对着这边，杖还立在岸上。你要怎么放这道还印着的岸？',
    steps(
      action('cliff', 'engage', '先看这道岸', '我先看他还站着的岸。'),
      action('one', 'engage', '先看最近的一根杖', '我先看离他最近的一根权杖。'),
      '我把倒着的船和权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_04',
    'upright',
    '掌心里，四根权杖支着一顶花冠，两个人举起花束站在杖下。你要先怎么待这四根挂着花冠的杖？',
    steps(
      action('garland', 'engage', '先看杖上的花冠', '我先看挂在四根杖上的花冠。'),
      action('bunch', 'engage', '先看举起的花束', '我先看两个人举起的花束。'),
      '我把挂着花冠的权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_04',
    'upright',
    '掌心里花冠还挂在四根杖上，两个人仍举着花。你要怎么安放这束还举着的花？',
    steps(
      action('one', 'engage', '先看其中一束花', '我先看他们举起的一束花。'),
      action('join', 'engage', '先看四根杖中间', '我先看四根权杖中间的空处。'),
      '我把花冠和权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_04',
    'reversed',
    '掌心里这张牌倒着，四根权杖、花冠和花束仍印着。你要先把花冠转到哪一边？',
    steps(
      action('garland', 'engage', '先把花冠转上来', '我先把挂在杖上的花冠转上来。'),
      action('bunch', 'engage', '先看倒着的花束', '我先看印着的花束。'),
      '我把倒着的四根权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_04',
    'reversed',
    '牌仍倒在掌心，花束还在两个人手里，花冠还在杖上。你要怎么放这顶还挂着的花冠？',
    steps(
      action('garland', 'engage', '先按住这顶花冠', '我先按住挂在四根杖上的花冠。'),
      action('pair', 'engage', '先看举花的两个人', '我先看还举着花的两个人。'),
      '我把倒着的花束和权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_05',
    'upright',
    '掌心里，五个人把五根权杖在空中相交，脚都还在地上。你要先怎么待这些相交的杖？',
    steps(
      action('own', 'engage', '先看其中一根杖', '我先看相交着的其中一根权杖。'),
      action('feet', 'engage', '先看还站着的脚', '我先看还站在地上的那些脚。'),
      '我把相交的五根权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_05',
    'upright',
    '掌心里五根权杖仍在空中相交，人还都站着。你要怎么安放两根杖之间的这处空档？',
    steps(
      action('gap', 'engage', '先看杖与杖的空档', '我先看两根杖之间的空档。'),
      action('low', 'engage', '先看放得较低的一根', '我先看五根里放得较低的那根权杖。'),
      '我把还碰在一起的权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_05',
    'reversed',
    '掌心里这张牌倒着，五根权杖和五个人仍印着。你要先把哪一根杖转到朝上？',
    steps(
      action('one', 'engage', '先把其中一根转上来', '我先把其中一根权杖转上来。'),
      action('feet', 'engage', '先看倒着的脚', '我先看印在地上的那些脚。'),
      '我把倒着的五根权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_05',
    'reversed',
    '牌仍倒在掌心，手还握着杖，杖还碰在一起。你要怎么放这些还握着杖的手？',
    steps(
      action('hands', 'engage', '先看握杖的手', '我先看还握着杖的那些手。'),
      action('clash', 'engage', '先看还碰着的杖', '我先看还碰在一起的权杖。'),
      '我把倒着的五根权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_06',
    'upright',
    '掌心里，马上的人举着一根挂了花环的权杖，旁边的人也举着杖。你要先怎么待这根挂着花环的杖？',
    steps(
      action('wreath', 'engage', '先看杖上的花环', '我先看挂在权杖上的花环。'),
      action('crowd', 'engage', '先看旁边举起的杖', '我先看旁边那些人举起的权杖。'),
      '我把挂着花环的权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_06',
    'upright',
    '掌心里花环还在那根杖上，马还在，旁边的杖也还举着。你要怎么安放花环上这些叶子？',
    steps(
      action('leaf', 'engage', '先看花环上的叶子', '我先看花环上的叶子。'),
      action('horse', 'engage', '先看马背上的人', '我先看马背上举着杖的人。'),
      '我把马上的花环和权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_06',
    'reversed',
    '掌心里这张牌倒着，花环、马、举起的杖和旁边的杖仍印着。你要先把花环转到哪一边？',
    steps(
      action('wreath', 'engage', '先把花环转上来', '我先把杖上的花环转上来。'),
      action('hoof', 'engage', '先看倒着的马蹄', '我先看印着的马蹄。'),
      '我把倒着的花环和权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_06',
    'reversed',
    '牌仍倒在掌心，花环还套在权杖上，马蹄还在。你要怎么放这只还印着的马蹄？',
    steps(
      action('hoof', 'engage', '先看马的前蹄', '我先看这匹马的前蹄。'),
      action('crowd', 'engage', '先看旁边的杖', '我先看旁边还举着的权杖。'),
      '我把倒着的花环放回桌上。',
    ),
  ),
  pause1(
    'wands_07',
    'upright',
    '掌心里，高处的人用一根权杖对着下面伸上来的六根杖，两只鞋不一样。你要先怎么待下面这六根杖？',
    steps(
      action('six', 'engage', '先看下面的六根杖', '我先看从下面伸上来的六根权杖。'),
      action('shoes', 'engage', '先看两只不一样的鞋', '我先看他两只不一样的鞋。'),
      '我把高处和下面的权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_07',
    'upright',
    '掌心里高处的人仍举着一根杖，下面六根还伸着。你要怎么安放他站着的这块高地？',
    steps(
      action('ridge', 'engage', '先看这块高地', '我先看他站着的那块高地。'),
      action('high', 'engage', '先看他手里的那根', '我先看高处这人手里的那根权杖。'),
      '我把下面的六根权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_07',
    'reversed',
    '掌心里这张牌倒着，七根权杖、高地和两只鞋仍印着。你要先把高处的杖转到哪一边？',
    steps(
      action('high', 'engage', '先把高处的杖转上来', '我先把高处的这根权杖转上来。'),
      action('shoes', 'engage', '先看倒着的鞋', '我先看印着的两只鞋。'),
      '我把倒着的七根权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_07',
    'reversed',
    '牌仍倒在掌心，六根杖还从下面伸上来。你要怎么放下面最近的这根杖？',
    steps(
      action('near', 'engage', '先看下面最近的一根', '我先看下面最近的一根权杖。'),
      action('ridge', 'engage', '先看这块高地', '我先看他还站着的高地。'),
      '我把倒着的鞋和权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_08',
    'upright',
    '掌心里，八根权杖斜着飞过天空，下面是河和坡。你要先怎么待这些飞着的杖？',
    steps(
      action('sky', 'engage', '先看斜飞的八根杖', '我先看斜飞在天上的八根权杖。'),
      action('river', 'engage', '先看杖下面的河', '我先看这些杖下面的河。'),
      '我把飞着的八根权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_08',
    'upright',
    '掌心里八根权杖仍在飞，河岸边的坡也还在。你要怎么安放河岸边的这道坡？',
    steps(
      action('hill', 'engage', '先看河岸边的坡', '我先看河岸边的那道坡。'),
      action('lead', 'engage', '先看飞在最前的一根', '我先看飞在最前面的那根权杖。'),
      '我把还在天上的权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_08',
    'reversed',
    '掌心里这张牌倒着，八根权杖、河和坡仍印着。你要先把飞着的杖转到哪一边？',
    steps(
      action('sky', 'engage', '先把八根杖转上来', '我先把这八根权杖转上来。'),
      action('river', 'engage', '先看倒着的河', '我先看印在下面的河。'),
      '我把倒着的八根权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_08',
    'reversed',
    '牌仍倒在掌心，八根杖还斜在河的上方。你要怎么放下面这条还印着的河？',
    steps(
      action('river', 'engage', '先按住这条河', '我先按住杖下面这条河。'),
      action('hill', 'engage', '先看河边的坡', '我先看河旁边的坡。'),
      '我把倒着的权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_09',
    'upright',
    '掌心里，一个人头上裹着布，靠着一根权杖站着，身后八根杖排成一排。你要先怎么待身后这排杖？',
    steps(
      action('row', 'engage', '先看身后的八根杖', '我先看身后排成一排的八根权杖。'),
      action('cloth', 'engage', '先看头上的布', '我先看裹在头上的那块布。'),
      '我把靠着的杖和这排杖放回桌上。',
    ),
  ),
  pause2(
    'wands_09',
    'upright',
    '掌心里人仍靠着那根杖，头上的布也还裹着。你要怎么安放他靠着的这根杖？',
    steps(
      action('lean', 'engage', '先看他靠着的那根', '我先看他靠着的那根权杖。'),
      action('gap', 'engage', '先看两根杖的空档', '我先看两根杖之间的空档。'),
      '我把头上的布和权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_09',
    'reversed',
    '掌心里这张牌倒着，九根权杖、头上的布和靠着的人仍印着。你要先把身后的杖转到哪一边？',
    steps(
      action('row', 'engage', '先把身后的杖转上来', '我先把身后的八根权杖转上来。'),
      action('cloth', 'engage', '先看倒着的布', '我先看印在头上的布。'),
      '我把倒着的九根权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_09',
    'reversed',
    '牌仍倒在掌心，布还裹在头上，一根杖还被靠着。你要怎么放这块还裹着的布？',
    steps(
      action('cloth', 'engage', '先按住这块布', '我先按住裹在头上的布。'),
      action('lean', 'engage', '先看被靠着的杖', '我先看他还靠着的那根权杖。'),
      '我把倒着的布和权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_10',
    'upright',
    '掌心里，一个人把腰弯下去，十根权杖压在背上，脸被杖挡住。你要先怎么待这十根压着的杖？',
    steps(
      action('bundle', 'engage', '先看压在背上的杖', '我先看压在背上的十根权杖。'),
      action('bend', 'engage', '先看弯下去的腰', '我先看被杖压弯的腰。'),
      '我把压在背上的权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_10',
    'upright',
    '掌心里十根权杖仍压在弯着的背上，脸还被挡住。你要怎么安放这张被杖挡住的脸？',
    steps(
      action('face', 'engage', '先看被挡住的脸', '我先看被权杖挡住的那张脸。'),
      action('outer', 'engage', '先看最外面的一根', '我先看这捆里最外面的一根权杖。'),
      '我把弯着的腰和权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_10',
    'reversed',
    '掌心里这张牌倒着，十根权杖、弯着的腰和被挡住的脸仍印着。你要先把这捆杖转到哪一边？',
    steps(
      action('bundle', 'engage', '先把这捆杖转上来', '我先把这十根权杖转上来。'),
      action('bend', 'engage', '先看倒着的腰', '我先看印着的弯腰。'),
      '我把倒着的十根权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_10',
    'reversed',
    '牌仍倒在掌心，脸还被权杖挡住，腰还弯着。你要怎么放这张还被挡住的脸？',
    steps(
      action('face', 'engage', '先看这张被挡住的脸', '我先看还被杖挡住的脸。'),
      action('bend', 'engage', '先看弯着的背', '我先看还弯着的背。'),
      '我把倒着的权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_page',
    'upright',
    '掌心里，一个年轻人身体前倾，看着权杖上的嫩叶和芽，脚下是干地。你要先怎么待这根长着嫩芽的杖？',
    steps(
      action('leaf', 'engage', '先看杖上的嫩叶', '我先看权杖上的嫩叶。'),
      action('ground', 'engage', '先看脚下的干地', '我先看他脚下的干地。'),
      '我把长着嫩芽的权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_page',
    'upright',
    '掌心里嫩叶和芽还在杖上，人仍望着它们。你身上哪一种手艺够用在这根长芽的杖上？',
    steps(
      action('craft', 'engage', '用正在学的那门手艺', '我用正在学的那门手艺，先看清杖上这颗芽。'),
      action('bud', 'engage', '先看最上面的芽', '我先看杖上最上面的那颗芽。'),
      '我把干地上的权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_page',
    'reversed',
    '掌心里这张牌倒着，权杖、嫩叶、芽和干地仍印着。你要先把这颗芽转到哪一边？',
    steps(
      action('bud', 'engage', '先把芽转上来', '我先把杖上的芽转上来。'),
      action('ground', 'engage', '先看倒着的干地', '我先看印在脚下的干地。'),
      '我把倒着的权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_page',
    'reversed',
    '牌仍倒在掌心，嫩叶还在杖上，人还前倾着。你要怎么放这些还印着的嫩叶？',
    steps(
      action('leaf', 'engage', '先看嫩叶的边缘', '我先看嫩叶的边缘。'),
      action('lean', 'engage', '先看前倾的人', '我先看还前倾着的这个人。'),
      '我把倒着的芽和权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_knight',
    'upright',
    '掌心里，马上的人举着一根长叶的权杖，马蹄抬起，马鬃被风掀着。你要先怎么待这根举着的杖？',
    steps(
      action('wand', 'engage', '先看举着的长叶杖', '我先看他举着的这根长叶权杖。'),
      action('hoof', 'engage', '先看抬起的马蹄', '我先看抬起的马蹄。'),
      '我把马上的权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_knight',
    'upright',
    '掌心里那根长叶的权杖仍举着，马鬃还被风掀起。你身上哪一种手艺够用在这根举着的杖上？',
    steps(
      action('craft', 'engage', '用正在学的那门手艺', '我用正在学的那门手艺，先看清杖上的叶子。'),
      action('mane', 'engage', '先看被风掀起的马鬃', '我先看被风掀起的马鬃。'),
      '我把马蹄和权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_knight',
    'reversed',
    '掌心里这张牌倒着，权杖、叶子、马蹄和马鬃仍印着。你要先把这根杖转到哪一边？',
    steps(
      action('wand', 'engage', '先把杖转上来', '我先把举起的权杖转上来。'),
      action('mane', 'engage', '先看倒着的马鬃', '我先看印着的马鬃。'),
      '我把倒着的权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_knight',
    'reversed',
    '牌仍倒在掌心，马蹄还抬着，叶子还在杖上。你要怎么放这只还抬着的马蹄？',
    steps(
      action('hoof', 'engage', '先看抬起的马蹄', '我先看还抬着的马蹄。'),
      action('leaf', 'engage', '先看杖上的叶子', '我先看这根杖上的叶子。'),
      '我把倒着的马鬃和权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_queen',
    'upright',
    '掌心里，座位上的人一手拿着向日葵，一手拿着长叶的权杖，脚边有一只黑猫。你要先怎么待这根长叶的杖？',
    steps(
      action('wand', 'engage', '先看长叶的权杖', '我先看她手里这根长叶的权杖。'),
      action('cat', 'engage', '先看脚边的黑猫', '我先看脚边的那只黑猫。'),
      '我把长叶的权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_queen',
    'upright',
    '掌心里权杖上的叶子还在，向日葵和黑猫也还在。你身上哪一种手艺够用在这根长叶的杖上？',
    steps(
      action('craft', 'engage', '用正在学的那门手艺', '我用正在学的那门手艺，先托住这根长叶的杖。'),
      action('sun', 'engage', '先看那朵向日葵', '我先看她另一只手里的向日葵。'),
      '我把黑猫和权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_queen',
    'reversed',
    '掌心里这张牌倒着，权杖、向日葵和黑猫仍印着。你要先把向日葵转到哪一边？',
    steps(
      action('sun', 'engage', '先把向日葵转上来', '我先把这朵向日葵转上来。'),
      action('cat', 'engage', '先看倒着的黑猫', '我先看印在脚边的黑猫。'),
      '我把倒着的权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_queen',
    'reversed',
    '牌仍倒在掌心，黑猫还在脚边，叶子还在杖上。你要怎么放这只还印着的黑猫？',
    steps(
      action('cat', 'engage', '先看脚边的黑猫', '我先看还在脚边的黑猫。'),
      action('leaf', 'engage', '先看杖上的叶子', '我先看杖上还在的叶子。'),
      '我把倒着的向日葵和权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_king',
    'upright',
    '掌心里，座位上的人拿着一根长芽的权杖，衣上和座边有火蜥蜴。你要先怎么待这根长芽的杖？',
    steps(
      action('wand', 'engage', '先看长芽的权杖', '我先看他手里这根长芽的权杖。'),
      action('lizard', 'engage', '先看座边的火蜥蜴', '我先看座边的火蜥蜴。'),
      '我把长芽的权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_king',
    'upright',
    '掌心里那根权杖仍长着芽，火蜥蜴也还在座边。你身上哪一种手艺够用在这根长芽的杖上？',
    steps(
      action('craft', 'engage', '用正在学的那门手艺', '我用正在学的那门手艺，先看清杖顶这颗芽。'),
      action('lion', 'engage', '先看座位上的狮子纹', '我先看座位上的狮子纹。'),
      '我把火蜥蜴和权杖放回桌上。',
    ),
  ),
  pause1(
    'wands_king',
    'reversed',
    '掌心里这张牌倒着，权杖、芽、火蜥蜴和座位仍印着。你要先把这根杖转到哪一边？',
    steps(
      action('wand', 'engage', '先把杖转上来', '我先把长芽的权杖转上来。'),
      action('lizard', 'engage', '先看倒着的火蜥蜴', '我先看印在座边的火蜥蜴。'),
      '我把倒着的权杖放回桌上。',
    ),
  ),
  pause2(
    'wands_king',
    'reversed',
    '牌仍倒在掌心，芽还在杖上，火蜥蜴还在座边。你要怎么放这只还印着的火蜥蜴？',
    steps(
      action('lizard', 'engage', '先看座边的火蜥蜴', '我先看还在座边的火蜥蜴。'),
      action('bud', 'engage', '先看杖上的芽', '我先看这根杖上的芽。'),
      '我把倒着的狮子纹和权杖放回桌上。',
    ),
  ),
];
