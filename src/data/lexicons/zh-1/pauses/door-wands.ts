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

export const DOOR_WANDS_OFFERS: readonly PauseOffer[] = [
  pause1(
    'wands_01_ace',
    'upright',
    '门缝里，云中的手递出一根权杖，杖上的叶子和芽是新的。你要先怎么待这根长着新芽的杖？',
    steps(
      action('bud', 'engage', '先看杖上的新芽', '我先看这根杖上的新芽。'),
      action('hand', 'engage', '先看托杖的那只手', '我先看云中托着杖的那只手。'),
      '我先把门带上，长着新芽的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_01_ace',
    'upright',
    '门缝里那根权杖仍被托着，新叶和芽也还在。你要怎么安放这根还没落地的杖？',
    steps(
      action('leaf', 'engage', '先数最上面的叶子', '我先数这根杖最上面的叶子。'),
      action('cloud', 'engage', '先看托着杖的云', '我先看托着杖的那朵云。'),
      '我先把门带上，还没落地的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_01_ace',
    'reversed',
    '门缝里，同一根权杖尖朝下，叶子垂着，芽还没有向上张开。你要先怎么待这根芽未张开的杖？',
    steps(
      action('tip', 'engage', '先看朝下的杖尖', '我先看朝下的这根杖尖。'),
      action('bud', 'engage', '先看还没张开的芽', '我先看还没张开的那颗芽。'),
      '我先把门带上，芽未张开的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_01_ace',
    'reversed',
    '门缝里杖尖仍朝下，芽也还没有张开。你要怎么对待这根没被扶起的杖？',
    steps(
      action('lift', 'engage', '再把杖身扶起一点', '我再把朝下的杖身扶起一点。'),
      action('leaf', 'engage', '先看垂着的叶子', '我先看还垂着的叶子。'),
      '我先把门带上，没被扶起的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_02',
    'upright',
    '门缝里，一个人站在城墙上，手里一根权杖和一只小地球，身后另有一根杖。你要先怎么待这两根杖？',
    steps(
      action('hand', 'engage', '先看手里的那根杖', '我先看他手里的那根权杖。'),
      action('globe', 'engage', '先看手里的小地球', '我先看他另一只手里的小地球。'),
      '我先把门带上，城墙上的两根权杖留在门外。',
    ),
  ),
  pause2(
    'wands_02',
    'upright',
    '门缝里那两根权杖还在，一根在手里，一根仍在身后，小地球也还被托着。你要怎么安放这两根还没移动的杖？',
    steps(
      action('back', 'engage', '先看身后固定的那根', '我先看身后固定着的那根权杖。'),
      action('far', 'engage', '先看城墙外的山和海', '我先看城墙外的山和海。'),
      '我先把门带上，还在原处的两根权杖留在门外。',
    ),
  ),
  pause1(
    'wands_02',
    'reversed',
    '门缝里，人仍站在城墙上，脚没有挪开，手里的杖和小地球都还在，身后那根也还固定着。你要先怎么待这两根不动的杖？',
    steps(
      action('feet', 'engage', '先看没有挪开的脚', '我先看没有挪开的那双脚。'),
      action('model', 'engage', '先看还被托着的小地球', '我先看还被托着的小地球。'),
      '我先把门带上，没有挪动的两根权杖留在门外。',
    ),
  ),
  pause2(
    'wands_02',
    'reversed',
    '门缝里两根杖仍一前一后，人还转向城墙外，脚停在原地。你要怎么对待这两根还固定着的杖？',
    steps(
      action('turn', 'engage', '先看转向墙外的脸', '我先看转向城墙外的那张脸。'),
      action('near', 'engage', '先把手里的杖靠向身后那根', '我先把手里的杖靠向身后那根。'),
      '我先把门带上，还固定着的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_03',
    'upright',
    '门缝里，岸上的人背对着这边，身边立着三根权杖，海上有船。你要先怎么待这三根立着的杖？',
    steps(
      action('staves', 'engage', '先看身边的三根杖', '我先看立在他身边的三根权杖。'),
      action('ships', 'engage', '先看海上的船', '我先看海上的那些船。'),
      '我先把门带上，立在岸上的三根权杖留在门外。',
    ),
  ),
  pause2(
    'wands_03',
    'upright',
    '门缝里三根权杖仍立在岸上，船也还在海上。你要怎么安放这些还在等的杖？',
    steps(
      action('one', 'engage', '先只碰最近的一根杖', '我先只碰离他最近的一根权杖。'),
      action('hull', 'engage', '先看最前面的那条船', '我先看海上最前面的那条船。'),
      '我先把门带上，还立在岸边的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_03',
    'reversed',
    '门缝里，三根权杖还立在岸上，人转向一侧，海上的船离岸更远。你要先怎么待这三根还立着的杖？',
    steps(
      action('side', 'engage', '先看转向一侧的人', '我先看转向一侧的这个人。'),
      action('far', 'engage', '先看离岸更远的船', '我先看离岸更远的那些船。'),
      '我先把门带上，还立在岸上的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_03',
    'reversed',
    '门缝里杖仍立着，船还没有靠近。你要怎么对待这三根没有被挪动的杖？',
    steps(
      action('shift', 'engage', '先把其中一根杖转向船', '我先把其中一根权杖转向海上的船。'),
      action('cliff', 'engage', '先看他站着的岸', '我先看他站着的这道岸。'),
      '我先把门带上，没有被挪动的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_04',
    'upright',
    '门缝里，四根权杖支着一顶花冠，两个人举起花束站在杖下。你要先怎么待这四根挂着花冠的杖？',
    steps(
      action('garland', 'engage', '先看杖上的花冠', '我先看挂在四根杖上的花冠。'),
      action('bunch', 'engage', '先看他们举起的花束', '我先看两个人举起的花束。'),
      '我先把门带上，挂着花冠的四根权杖留在门外。',
    ),
  ),
  pause2(
    'wands_04',
    'upright',
    '门缝里花冠还挂在四根杖上，两个人仍举着花。你要怎么安放这顶还挂着的花冠？',
    steps(
      action('join', 'engage', '先站到四根杖中间', '我先站到四根权杖中间。'),
      action('one', 'engage', '先只接过一束花', '我先只接过他们举起的一束花。'),
      '我先把门带上，还挂着花冠的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_04',
    'reversed',
    '门缝里，花冠还在四根权杖上，两个人转开了身，花束没有举到一起。你要先怎么待这四根还支着花的杖？',
    steps(
      action('turn', 'engage', '先看转开的两个人', '我先看转开身的两个人。'),
      action('slack', 'engage', '先看还挂着的花冠', '我先看还挂在杖上的花冠。'),
      '我先把门带上，还支着花的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_04',
    'reversed',
    '门缝里四根杖仍支着花冠，人还没有转回来。你要怎么对待这顶没被站到的花冠？',
    steps(
      action('under', 'engage', '先走到花冠下面', '我先走到这四根杖的花冠下面。'),
      action('lower', 'engage', '先看放低的花束', '我先看没有举到一起的花束。'),
      '我先把门带上，没被站到的花冠留在门外。',
    ),
  ),
  pause1(
    'wands_05',
    'upright',
    '门缝里，五个人把五根权杖在空中相交，没有人倒下。你要先怎么待这些相交的杖？',
    steps(
      action('own', 'engage', '先看其中一根杖', '我先看相交着的其中一根权杖。'),
      action('feet', 'engage', '先看还站着的脚', '我先看还站在地上的那些脚。'),
      '我先把门带上，相交的五根权杖留在门外。',
    ),
  ),
  pause2(
    'wands_05',
    'upright',
    '门缝里五根权杖仍在空中相交，人还都站着。你要怎么安放这些还碰在一起的杖？',
    steps(
      action('low', 'engage', '先把一根杖放低', '我先把其中一根权杖放低。'),
      action('gap', 'engage', '先看杖与杖之间的空档', '我先看两根杖之间的空档。'),
      '我先把门带上，还碰在一起的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_05',
    'reversed',
    '门缝里，五根权杖还在挥，有人已经把身子转开，杖却还碰着。你要先怎么待这些还挥着的杖？',
    steps(
      action('aside', 'engage', '先看转开的人', '我先看已经把身子转开的人。'),
      action('clash', 'engage', '先看还碰着的杖', '我先看还碰在一起的权杖。'),
      '我先把门带上，还挥着的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_05',
    'reversed',
    '门缝里杖仍挥着，转开的人没有把杖放下。你要怎么对待这些还没分开的杖？',
    steps(
      action('one', 'engage', '先只放下一根杖', '我先只放下其中一根权杖。'),
      action('hands', 'engage', '先看还握着杖的手', '我先看还握着杖的那些手。'),
      '我先把门带上，还没分开的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_06',
    'upright',
    '门缝里，马上的人举着一根挂了花环的权杖，旁边的人也举着杖。你要先怎么待这根挂着花环的杖？',
    steps(
      action('wreath', 'engage', '先看杖上的花环', '我先看挂在权杖上的花环。'),
      action('crowd', 'engage', '先看旁边举起的杖', '我先看旁边那些人举起的权杖。'),
      '我先把门带上，挂着花环的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_06',
    'upright',
    '门缝里花环还在那根杖上，马还往前，旁边的杖也还举着。你要怎么安放这根被举着的杖？',
    steps(
      action('horse', 'engage', '先看马背上的人', '我先看马背上举着杖的人。'),
      action('leaf', 'engage', '先看花环上的叶子', '我先看花环上的叶子。'),
      '我先把门带上，还被举着的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_06',
    'reversed',
    '门缝里，花环还套在权杖上，马上的人转过脸，旁边的杖放低了。你要先怎么待这根还套着花环的杖？',
    steps(
      action('face', 'engage', '先看转过的脸', '我先看马上转过的那张脸。'),
      action('low', 'engage', '先看放低的那些杖', '我先看旁边放低的那些权杖。'),
      '我先把门带上，还套着花环的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_06',
    'reversed',
    '门缝里花环仍在，旁边的杖还没有再举起。你要怎么对待这根没被一起举起的杖？',
    steps(
      action('keep', 'engage', '先让花环留在杖上', '我先让花环留在这根权杖上。'),
      action('hoof', 'engage', '先看马的前蹄', '我先看这匹马的前蹄。'),
      '我先把门带上，没被一起举起的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_07',
    'upright',
    '门缝里，高处的人用一根权杖对着下面伸上来的六根杖。你要先怎么待下面这六根杖？',
    steps(
      action('high', 'engage', '先看他手里的那根', '我先看高处这人手里的那根权杖。'),
      action('six', 'engage', '先看下面伸上来的杖', '我先看从下面伸上来的六根权杖。'),
      '我先把门带上，高处和下面的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_07',
    'upright',
    '门缝里高处的人仍举着一根杖，下面六根还伸着。你要怎么安放这根还举着的杖？',
    steps(
      action('shoes', 'engage', '先看他两只不一样的鞋', '我先看他两只不一样的鞋。'),
      action('ridge', 'engage', '先看他站的那块高地', '我先看他站着的那块高地。'),
      '我先把门带上，还举在高处的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_07',
    'reversed',
    '门缝里，高处还在，人把身子转开，手里的杖和下面的六根仍对着。你要先怎么待这些还对着的杖？',
    steps(
      action('turn', 'engage', '先看转开的身子', '我先看转开的这个人。'),
      action('points', 'engage', '先看下面的杖尖', '我先看下面六根杖的尖。'),
      '我先把门带上，还对着的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_07',
    'reversed',
    '门缝里杖仍上下对着，人还没有转回来。你要怎么对待这根还握在高处的杖？',
    steps(
      action('lower', 'engage', '先把高处的杖放低一点', '我先把高处的这根权杖放低一点。'),
      action('one', 'engage', '先只看下面最近的一根', '我先只看下面最近的一根权杖。'),
      '我先把门带上，还握在高处的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_08',
    'upright',
    '门缝里，八根权杖斜着飞过天空，下面是河和坡。你要先怎么待这些飞着的杖？',
    steps(
      action('sky', 'engage', '先看斜飞的八根杖', '我先看斜飞在天上的八根权杖。'),
      action('river', 'engage', '先看杖下面的河', '我先看这些杖下面的河。'),
      '我先把门带上，飞在天上的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_08',
    'upright',
    '门缝里八根权杖仍在飞，河也还在下面。你要怎么安放这些还没落地的杖？',
    steps(
      action('lead', 'engage', '先看飞在最前的一根', '我先看飞在最前面的那根权杖。'),
      action('hill', 'engage', '先看河岸边的坡', '我先看河岸边的那道坡。'),
      '我先把门带上，还没落地的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_08',
    'reversed',
    '门缝里，八根权杖还在飞，方向彼此错开，下面的河也还在。你要先怎么待这些错开的杖？',
    steps(
      action('cross', 'engage', '先看错开的杖', '我先看方向错开的这些权杖。'),
      action('bank', 'engage', '先看下面那条河', '我先看杖下面那条河。'),
      '我先把门带上，方向错开的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_08',
    'reversed',
    '门缝里杖仍飞着，彼此还没有对齐。你要怎么对待这些还没对齐的杖？',
    steps(
      action('slow', 'engage', '先只跟上最慢的一根', '我先只跟上飞得最慢的那根权杖。'),
      action('land', 'engage', '先看河旁边的坡', '我先看河旁边它们可能落下的坡。'),
      '我先把门带上，还没对齐的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_09',
    'upright',
    '门缝里，一个人头上裹着布，靠着一根权杖站着，身后八根杖排成一排。你要先怎么待身后这排杖？',
    steps(
      action('lean', 'engage', '先看他靠着的那根', '我先看他靠着的那根权杖。'),
      action('row', 'engage', '先看身后排着的八根', '我先看身后排成一排的八根权杖。'),
      '我先把门带上，靠着的和排着的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_09',
    'upright',
    '门缝里人仍靠着那根杖，身后的八根也还排着。你要怎么安放这根被靠着的杖？',
    steps(
      action('cloth', 'engage', '先看头上的布', '我先看裹在头上的那块布。'),
      action('gap', 'engage', '先看两根杖之间的空档', '我先看两根杖之间的空档。'),
      '我先把门带上，被靠着的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_09',
    'reversed',
    '门缝里，头上的布还在，人把脸转开，仍不肯离开那根杖，身后八根也还排着。你要先怎么待这根被靠着的杖？',
    steps(
      action('face', 'engage', '先看转开的脸', '我先看转开的那张脸。'),
      action('row', 'engage', '先看身后的八根杖', '我先看身后还排着的八根权杖。'),
      '我先把门带上，不肯离开的那根权杖留在门外。',
    ),
  ),
  pause2(
    'wands_09',
    'reversed',
    '门缝里人还靠在杖上，布没有解开，身后的杖也没有散。你要怎么对待这根还被靠着的杖？',
    steps(
      action('cloth', 'engage', '先看还裹着的布', '我先看还裹在头上的布。'),
      action('stand', 'engage', '先让身后的八根保持排着', '我先让身后的八根权杖保持排着。'),
      '我先把门带上，还被靠着的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_10',
    'upright',
    '门缝里，一个人把腰弯下去，十根权杖压在背上，脸被杖挡住。你要先怎么待这十根压着的杖？',
    steps(
      action('bundle', 'engage', '先看压在背上的杖', '我先看压在背上的十根权杖。'),
      action('bend', 'engage', '先看弯下去的腰', '我先看被杖压弯的腰。'),
      '我先把门带上，压在背上的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_10',
    'upright',
    '门缝里十根权杖仍压在弯着的背上，脸还被挡住。你要怎么安放这些还压着的杖？',
    steps(
      action('face', 'engage', '先看被挡住的脸', '我先看被权杖挡住的那张脸。'),
      action('one', 'engage', '先只把最外面的一根挪开', '我先只把最外面的一根权杖挪开。'),
      '我先把门带上，还压在背上的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_10',
    'reversed',
    '门缝里，弯着的人转过一点，十根权杖里有几根已经滑到臂弯外。你要先怎么待这些滑出来的杖？',
    steps(
      action('slip', 'engage', '先看滑出来的杖', '我先看滑到臂弯外的那些权杖。'),
      action('back', 'engage', '先看还压在背上的', '我先看还压在背上的权杖。'),
      '我先把门带上，滑出来的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_10',
    'reversed',
    '门缝里还有权杖压在身上，人仍没有完全直起。你要怎么对待这些还没放下的杖？',
    steps(
      action('set', 'engage', '先把滑出来的一根放到地上', '我先把滑出来的一根权杖放到地上。'),
      action('spine', 'engage', '先看还弯着的背', '我先看还弯着的背。'),
      '我先把门带上，还没放下的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_page',
    'upright',
    '门缝里，一个年轻人身体前倾，看着权杖上的嫩叶和芽。你要先怎么待这根长着嫩芽的杖？',
    steps(
      action('leaf', 'engage', '先看杖上的嫩叶', '我先看权杖上的嫩叶。'),
      action('lean', 'engage', '先看前倾的这个人', '我先看身体前倾的这个人。'),
      '我先把门带上，长着嫩芽的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_page',
    'upright',
    '门缝里嫩叶和芽还在杖上，人仍望着它们。你要怎么安放这根被看着的杖？',
    steps(
      action('bud', 'engage', '先看最上面的那颗芽', '我先看杖上最上面的那颗芽。'),
      action('ground', 'engage', '先看他脚下的干地', '我先看他脚下的干地。'),
      '我先把门带上，被看着的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_page',
    'reversed',
    '门缝里，权杖上的芽还嫩着，年轻人把脸转到一边，没有再看那颗芽。你要先怎么待这根没被看着的杖？',
    steps(
      action('aside', 'engage', '先看转到一边的脸', '我先看转到一边的那张脸。'),
      action('bud', 'engage', '先看还嫩着的芽', '我先看杖上还嫩着的芽。'),
      '我先把门带上，没被看着的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_page',
    'reversed',
    '门缝里芽仍嫩着，人还把脸转向别处。你要怎么对待这根还没被看回去的杖？',
    steps(
      action('back', 'engage', '先把脸转回芽上', '我先把脸转回杖上的芽。'),
      action('leaf', 'engage', '先看嫩叶的边缘', '我先看嫩叶的边缘。'),
      '我先把门带上，还没被看回去的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_knight',
    'upright',
    '门缝里，马上的人举着一根长叶的权杖往前冲，马蹄抬起。你要先怎么待这根举着的杖？',
    steps(
      action('wand', 'engage', '先看举着的长叶杖', '我先看他举着的这根长叶权杖。'),
      action('hoof', 'engage', '先看抬起的马蹄', '我先看抬起的马蹄。'),
      '我先把门带上，举在马前的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_knight',
    'upright',
    '门缝里那根长叶的权杖仍举着，马还在往前。你要怎么安放这根还在冲的杖？',
    steps(
      action('leaf', 'engage', '先看杖上的叶子', '我先看这根杖上的叶子。'),
      action('mane', 'engage', '先看被风掀起的马鬃', '我先看被风掀起的马鬃。'),
      '我先把门带上，还举在马上的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_knight',
    'reversed',
    '门缝里，马仍往前，马上的人转过脸，长叶的权杖还举着。你要先怎么待这根还举着的杖？',
    steps(
      action('face', 'engage', '先看转过的脸', '我先看马上转过的那张脸。'),
      action('wand', 'engage', '先看还举着的杖', '我先看还举着的这根长叶权杖。'),
      '我先把门带上，还举着的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_knight',
    'reversed',
    '门缝里杖上的叶子还在抖，马没有停。你要怎么对待这根没收住的杖？',
    steps(
      action('lower', 'engage', '先把杖放低一寸', '我先把这根权杖放低一寸。'),
      action('hoof', 'engage', '先看还抬着的马蹄', '我先看还抬着的马蹄。'),
      '我先把门带上，没收住的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_queen',
    'upright',
    '门缝里，座位上的人一手拿着向日葵，一手拿着长叶的权杖，脚边有一只黑猫。你要先怎么待这根长叶的杖？',
    steps(
      action('wand', 'engage', '先看长叶的权杖', '我先看她手里这根长叶的权杖。'),
      action('cat', 'engage', '先看脚边的黑猫', '我先看脚边的那只黑猫。'),
      '我先把门带上，长叶的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_queen',
    'upright',
    '门缝里权杖上的叶子还在，向日葵和黑猫也还在。你要怎么安放这根被拿稳的杖？',
    steps(
      action('sun', 'engage', '先看那朵向日葵', '我先看她另一只手里的向日葵。'),
      action('leaf', 'engage', '先看杖上的叶子', '我先看权杖上的叶子。'),
      '我先把门带上，被拿稳的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_queen',
    'reversed',
    '门缝里，向日葵还开着，长叶的权杖仍在手里，黑猫把身子转开，人也把脸转到一边。你要先怎么待这根还握着的杖？',
    steps(
      action('cat', 'engage', '先看转开的黑猫', '我先看转开身子的黑猫。'),
      action('face', 'engage', '先看转到一边的脸', '我先看转到一边的那张脸。'),
      '我先把门带上，还握着的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_queen',
    'reversed',
    '门缝里杖还在手里，向日葵仍开着，猫也还转开。你要怎么对待这根没有被放下的杖？',
    steps(
      action('flower', 'engage', '先看还开着的向日葵', '我先看还开着的向日葵。'),
      action('leaf', 'engage', '先看杖上还在的叶子', '我先看杖上还在的叶子。'),
      '我先把门带上，没有被放下的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_king',
    'upright',
    '门缝里，座位上的人拿着一根长芽的权杖，衣上和座边有火蜥蜴。你要先怎么待这根长芽的杖？',
    steps(
      action('wand', 'engage', '先看长芽的权杖', '我先看他手里这根长芽的权杖。'),
      action('lizard', 'engage', '先看座边的火蜥蜴', '我先看座边的火蜥蜴。'),
      '我先把门带上，长芽的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_king',
    'upright',
    '门缝里那根权杖仍长着芽，火蜥蜴也还在座边。你要怎么安放这根被拿着的杖？',
    steps(
      action('bud', 'engage', '先看杖顶的芽', '我先看这根杖顶上的芽。'),
      action('lion', 'engage', '先看座位上的狮子纹', '我先看座位上的狮子纹。'),
      '我先把门带上，被拿着的权杖留在门外。',
    ),
  ),
  pause1(
    'wands_king',
    'reversed',
    '门缝里，长芽的权杖被握得斜向一边，座位上的人把脸转开，火蜥蜴还在。你要先怎么待这根斜着的杖？',
    steps(
      action('tilt', 'engage', '先看斜着的权杖', '我先看被握斜的这根权杖。'),
      action('face', 'engage', '先看转开的脸', '我先看转开的那张脸。'),
      '我先把门带上，斜着的权杖留在门外。',
    ),
  ),
  pause2(
    'wands_king',
    'reversed',
    '门缝里杖仍斜着，芽还在杖上，人没有转回来。你要怎么对待这根还没扶正的杖？',
    steps(
      action('bud', 'engage', '先看斜杖上的芽', '我先看这根斜杖上的芽。'),
      action('right', 'engage', '先把杖扶回竖直', '我先把这根权杖扶回竖直。'),
      '我先把门带上，还没扶正的权杖留在门外。',
    ),
  ),
];
