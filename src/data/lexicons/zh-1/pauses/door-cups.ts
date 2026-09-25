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

export const DOOR_CUPS_OFFERS: readonly PauseOffer[] = [
  locked('cups_01_ace', 'upright', 1),
  pause2(
    'cups_01_ace',
    'upright',
    '门缝里那只杯仍被云中的手托着，水还从杯口往下淌。你要怎么安放这只还在流水的杯？',
    steps(
      action('catch', 'engage', '先用手接住杯沿', '我先用手接住这只杯的沿，水继续往下流。'),
      action('trace', 'engage', '先看水流到门槛哪边', '我先看这股水流到门槛的哪一边。'),
      '我先把门带上，还在流水的杯子留在门外。',
    ),
  ),
  locked('cups_01_ace', 'reversed', 1),
  pause2(
    'cups_01_ace',
    'reversed',
    '门缝里那只杯口仍朝下，水没有从杯里流出来。你要怎么对待这只堵住的杯？',
    steps(
      action('lift', 'engage', '再把杯口抬高一点', '我再把朝下的杯口抬高一点。'),
      action('rim', 'engage', '先擦掉杯沿的水', '我先擦掉杯沿上没流出来的水。'),
      '我先把门带上，仍朝下的杯口留在门外。',
    ),
  ),
  pause1(
    'cups_02',
    'upright',
    '门缝里，两个人各持一只杯，杯口朝着彼此，中间立着蛇杖。你要先怎么待这次对杯？',
    steps(
      action('offer', 'engage', '先把自己的杯递出去', '我先把自己的杯递向对方那一侧。'),
      action('see', 'engage', '先看清对方的杯', '我先看清对方手里的那只杯，自己的还拿着。'),
      '我先把门带上，对在一起的两只杯留在门外。',
    ),
  ),
  locked('cups_02', 'upright', 2),
  pause1(
    'cups_02',
    'reversed',
    '门缝里两只杯一高一低，两只手没有碰到一起。你要先怎么待这次没对上的交换？',
    steps(
      action('lower', 'engage', '先把自己的杯放低', '我先把自己偏高的那只杯放低一点。'),
      action('gap', 'engage', '先看清中间的空档', '我先看清两只杯中间那一段空档。'),
      '我先把门带上，一高一低的两只杯留在门外。',
    ),
  ),
  pause2(
    'cups_02',
    'reversed',
    '门缝里那两只杯仍一高一低，中间还空着。你要怎么安放这两只没碰到的杯？',
    steps(
      action('match', 'engage', '把两只杯挪到同一线', '我把两只没碰到的杯挪到同一条线上。'),
      action('hand', 'engage', '先只伸出自己的手', '我先只伸出自己的手，对方的杯先不动。'),
      '我先把门带上，没碰到一起的杯子留在门外。',
    ),
  ),
  pause1(
    'cups_03',
    'upright',
    '门缝里，三个人在园子里把杯子举到同一高度，果子堆在脚边。你要先怎么待这次举杯？',
    steps(
      action('raise', 'engage', '先把自己的杯子举起', '我先把自己的杯子举到和他们同一高度。'),
      action('edge', 'engage', '先站到圆圈边上', '我先站到举杯的圆圈边上，杯子还拿在自己手里。'),
      '我先把门带上，举着的三只杯留在门外。',
    ),
  ),
  pause2(
    'cups_03',
    'upright',
    '门缝里那三只杯还举着，园子里的果子也还在。你要怎么靠近这次举杯？',
    steps(
      action('join', 'engage', '把杯子伸进圆圈', '我把杯子伸进他们举着的圆圈。'),
      action('fruit', 'engage', '先递进一只果子', '我先把脚边的一只果子递进圆圈，杯子仍拿着。'),
      '我先把门带上，还举着的杯子留在门外。',
    ),
  ),
  pause1(
    'cups_03',
    'reversed',
    '门缝里，三个人仍站在一起，杯子举着，果子在脚边。你要先怎么待这三只还举着的杯？',
    steps(
      action('cups', 'engage', '先看一起举着的三只杯', '我先看他们一起举着的三只杯。'),
      action('fruit', 'engage', '先看脚边的果子', '我先看脚边堆着的果子，杯子仍举着。'),
      '我先把门带上，举着的三只杯留在门外。',
    ),
  ),
  pause2(
    'cups_03',
    'reversed',
    '门缝里那三个人还都在圈里，杯子仍举着，果子也还在脚边。你要怎么对待脚边这些果子？',
    steps(
      action('raise', 'engage', '先让三只杯保持举起', '我先让这三只杯保持举起。'),
      action('one', 'engage', '先只看脚边的一只果子', '我先只看脚边的一只果子。'),
      '我先把门带上，脚边的果子留在门外。',
    ),
  ),
  pause1(
    'cups_04',
    'upright',
    '门缝里，树下的人把脸转向一边，面前三只杯，云里又递来第四只。你要先怎么待这只新递来的杯？',
    steps(
      action('glance', 'engage', '先把脸转向第四只杯', '我先把脸转向云里递来的那第四只杯。'),
      action('tree', 'engage', '先留在树的这一边', '我先留在树的这一边，第四只杯先悬着。'),
      '我先把门带上，没被看的第四只杯留在门外。',
    ),
  ),
  pause2(
    'cups_04',
    'upright',
    '门缝里第四只杯还悬在云中，树下的人仍看着别处。你要怎么对待这只还没被接住的杯？',
    steps(
      action('reach', 'engage', '先向第四只杯伸手', '我先向云里那第四只杯伸出手。'),
      action('three', 'engage', '先只看面前的三只', '我先只看面前已经放着的三只杯。'),
      '我先把门带上，悬在云里的杯子留在门外。',
    ),
  ),
  pause1(
    'cups_04',
    'reversed',
    '门缝里第四只杯仍悬着，坐着的人把胳膊抱紧，脸还没转向它。你要先怎么待这只被躲开的杯？',
    steps(
      action('unarm', 'engage', '先松开抱着的胳膊', '我先松开抱着的胳膊，再看那只悬着的杯。'),
      action('away', 'engage', '先承认脸还转向树', '我先承认脸还转向树，第四只杯先不动。'),
      '我先把门带上，被躲开的杯子留在门外。',
    ),
  ),
  pause2(
    'cups_04',
    'reversed',
    '门缝里那只杯还在云中，树下的人仍没有转过脸。你要怎么靠近这只一直悬着的杯？',
    steps(
      action('turn', 'engage', '把脸转回杯的方向', '我把脸转回那只一直悬着的杯。'),
      action('root', 'engage', '先靠着树再坐一会儿', '我先靠着树再坐一会儿，杯子仍悬在云里。'),
      '我先把门带上，一直悬着的杯子留在门外。',
    ),
  ),
  pause1(
    'cups_05',
    'upright',
    '门缝里，黑斗篷的人低着头，面前三只杯倒了，身后还有两只立着，远处是桥。你要先怎么待这三只倒掉的杯？',
    steps(
      action('spill', 'engage', '先在倒掉的杯前停一下', '我先在三只倒掉的杯前停一下。'),
      action('stand', 'engage', '先回头看还立着的两只', '我先回头看还立在身后的那两只杯。'),
      '我先把门带上，倒掉的杯子留在门外。',
    ),
  ),
  pause2(
    'cups_05',
    'upright',
    '门缝里倒掉的三只杯还在地上，两只立着的仍在身后，桥也还在。你要怎么安放这地上的水和还立着的杯？',
    steps(
      action('bridge', 'engage', '先朝桥的方向侧过身', '我先朝桥的方向侧过身，倒掉的杯仍在地上。'),
      action('count', 'engage', '先数清还立着的两只', '我先数清身后还立着的那两只杯。'),
      '我先把门带上，地上的三只倒杯留在门外。',
    ),
  ),
  pause1(
    'cups_05',
    'reversed',
    '门缝里人仍对着洒出的水，没有转向身后还立着的两只杯，桥也没被走向。你要先怎么待这摊还没离开的水？',
    steps(
      action('stay', 'engage', '先让目光停在洒出的水上', '我先让目光停在洒出的水上。'),
      action('two', 'engage', '先只侧眼看那两只立杯', '我先只侧眼看身后还立着的两只杯。'),
      '我先把门带上，没离开的那摊水留在门外。',
    ),
  ),
  pause2(
    'cups_05',
    'reversed',
    '门缝里那个人还对着洒出的水，身后的两只杯和桥都没被走向。你要怎么对待这具还没转身的身子？',
    steps(
      action('shoulder', 'engage', '先把肩转向立着的杯', '我先把肩转向还立着的那两只杯。'),
      action('cloak', 'engage', '先让斗篷仍对着洒水', '我先让斗篷仍对着洒出的水，桥先不走。'),
      '我先把门带上，还没转身的人影留在门外。',
    ),
  ),
  pause1(
    'cups_06',
    'upright',
    '门缝里，园子中一个孩子把插着花的杯子递给更小的孩子，旧房子在后面。你要先怎么待这只花杯？',
    steps(
      action('give', 'engage', '先把花杯递到小手里', '我先把这只插着花的杯子递到更小的手里。'),
      action('yard', 'engage', '先在园子里站一会儿', '我先在园子里站一会儿，花杯还在两手之间。'),
      '我先把门带上，插着花的杯子留在门外。',
    ),
  ),
  pause2(
    'cups_06',
    'upright',
    '门缝里那只花杯还在两个孩子的手之间，旧房子也还在园后。你要怎么安放这只还没递完的花杯？',
    steps(
      action('pass', 'engage', '让花杯交到小手里', '我让这只花杯交到更小的那只手里。'),
      action('house', 'engage', '先看一眼后面的旧房子', '我先看一眼园后的旧房子，花杯先不收回。'),
      '我先把门带上，还在两手之间的花杯留在门外。',
    ),
  ),
  pause1(
    'cups_06',
    'reversed',
    '门缝里，插着花的杯子仍从较大的手里递向较小的手，旧房子在后面。你要先怎么待这只正递着的花杯？',
    steps(
      action('between', 'engage', '先让花杯停在两手之间', '我先让这只花杯停在两个孩子的手之间。'),
      action('house', 'engage', '先看后面的旧房子', '我先看孩子后面的那座旧房子。'),
      '我先把门带上，两手之间的花杯留在门外。',
    ),
  ),
  pause2(
    'cups_06',
    'reversed',
    '门缝里那只花杯还在两个孩子之间，旧房子也还在后面。你要怎么对待这只插着花的杯？',
    steps(
      action('flower', 'engage', '先看杯里的花', '我先看这只杯里的花。'),
      action('small', 'engage', '先看较小的那只手', '我先看正对着花杯的那只较小的手。'),
      '我先把门带上，孩子之间的花杯留在门外。',
    ),
  ),
  pause1(
    'cups_07',
    'upright',
    '门缝里，七只杯浮在雾中，里面分别露出城、珠宝、花环和一条龙，一个人仰头看。你要先怎么待这些浮着的杯？',
    steps(
      action('one', 'engage', '先只指向一只杯', '我先只指向雾里的一只杯，其余的先悬着。'),
      action('feet', 'engage', '先把脚留在雾下面', '我先把脚留在雾下面，不伸手进那些杯子。'),
      '我先把门带上，浮在雾里的杯子留在门外。',
    ),
  ),
  pause2(
    'cups_07',
    'upright',
    '门缝里那七只杯还浮着，城、珠宝和龙都还在杯里。你要怎么对待这些还没落地的杯？',
    steps(
      action('lower', 'engage', '请一只杯降到眼前', '我请雾里的一只杯降到眼前。'),
      action('cloud', 'engage', '先让七只都留在雾中', '我先让七只杯都留在雾中。'),
      '我先把门带上，还没落地的杯子留在门外。',
    ),
  ),
  pause1(
    'cups_07',
    'reversed',
    '门缝里雾还没散，七只杯仍悬着，没有一只被拿到门口。你要先怎么待这些下不来的杯？',
    steps(
      action('name', 'engage', '先给最近的一只起个样子', '我先看清离门口最近的那一只，给它一个样子。'),
      action('back', 'engage', '先从雾边退开一步', '我先从雾边退开一步，杯子仍悬着。'),
      '我先把门带上，下不来的杯子留在门外。',
    ),
  ),
  pause2(
    'cups_07',
    'reversed',
    '门缝里那七只杯还挂在雾中，门口一只都没有。你要怎么靠近这些仍悬着的杯？',
    steps(
      action('point', 'engage', '只把手指进雾里一只', '我只把手指进雾里的一只杯。'),
      action('wait', 'engage', '先等雾再淡一寸', '我先等雾再淡一寸，杯子先不拿下来。'),
      '我先把门带上，仍悬在雾里的杯子留在门外。',
    ),
  ),
  pause1(
    'cups_08',
    'upright',
    '门缝里，八只杯叠在岸边，一个披红斗篷的人正走向月亮和山。你要先怎么待这排被留下的杯？',
    steps(
      action('walk', 'engage', '先顺着山的方向走', '我先顺着月亮和山的方向再走一步。'),
      action('stack', 'engage', '先回头看一眼这排杯', '我先回头看一眼岸边叠着的这排杯。'),
      '我先把门带上，叠在岸边的杯子留在门外。',
    ),
  ),
  pause2(
    'cups_08',
    'upright',
    '门缝里那排杯子还叠着，红斗篷已经更靠近山。你要怎么安放这排留在身后的杯？',
    steps(
      action('onward', 'engage', '再向山走一步', '我再向月亮下面的山走一步。'),
      action('staff', 'engage', '先把杖插在杯和山之间', '我先把杖插在杯子和山之间。'),
      '我先把门带上，留在身后的那排杯子留在门外。',
    ),
  ),
  pause1(
    'cups_08',
    'reversed',
    '门缝里红斗篷停在半路，人回头看着那排杯子，山还在更远处。你要先怎么待这具停住的身子？',
    steps(
      action('halt', 'engage', '先让脚停在半路', '我先让脚停在杯子和山之间的半路上。'),
      action('face', 'engage', '先把脸从杯子转开', '我先把脸从那排杯子转开，朝向远处的山。'),
      '我先把门带上，停在半路的人影留在门外。',
    ),
  ),
  pause2(
    'cups_08',
    'reversed',
    '门缝里那个人仍停在杯和山之间，斗篷没有再往前。你要怎么对待这件停住的斗篷？',
    steps(
      action('fold', 'engage', '先把斗篷裹紧一点', '我先把停住的斗篷裹紧一点。'),
      action('mountain', 'engage', '先只看远处的山', '我先只看远处的山，杯子留在身后。'),
      '我先把门带上，没再往前的斗篷留在门外。',
    ),
  ),
  pause1(
    'cups_09',
    'upright',
    '门缝里，九只杯在一条弧形架上排好，一个人坐在架前，胳膊交叠。你要先怎么待这排已经摆好的杯？',
    steps(
      action('sit', 'engage', '先在架前坐下', '我先在这排杯子前面坐下。'),
      action('arc', 'engage', '先沿弧形看完一圈', '我先沿弧形把九只杯看完一圈。'),
      '我先把门带上，排好的九只杯留在门外。',
    ),
  ),
  pause2(
    'cups_09',
    'upright',
    '门缝里那九只杯还排在弧架上，座位也还在。你要怎么安放这排已经在身后的杯？',
    steps(
      action('ease', 'engage', '先把交叠的胳膊放下', '我先把交叠的胳膊放下，杯子仍排在架上。'),
      action('one', 'engage', '先只取下最边上的一只', '我先只取下弧架最边上的一只杯。'),
      '我先把门带上，排在弧架上的杯子留在门外。',
    ),
  ),
  pause1(
    'cups_09',
    'reversed',
    '门缝里九只杯仍像一堵墙排在架上，座位前的人抱着胳膊，没有靠进去。你要先怎么待这排挡在身后的杯？',
    steps(
      action('gap', 'engage', '先在杯墙和座位之间留空', '我先在杯墙和座位之间留出一段空。'),
      action('shelf', 'engage', '先别从架上再加杯子', '我先不从架上再加杯子，让这排维持现状。'),
      '我先把门带上，挡在身后的杯子留在门外。',
    ),
  ),
  pause2(
    'cups_09',
    'reversed',
    '门缝里那排杯子仍挡在座位后面，人还没有靠进椅子。你要怎么对待这排没被靠住的杯？',
    steps(
      action('lean', 'engage', '先只靠住椅子的边', '我先只靠住椅子的边，杯子仍在架上。'),
      action('mid', 'engage', '先看弧架正中的那一只', '我先看弧架正中的那一只杯。'),
      '我先把门带上，没被靠住的杯子留在门外。',
    ),
  ),
  pause1(
    'cups_10',
    'upright',
    '门缝里，十只杯排成一道虹，虹下有房子、孩子和一条河。你要先怎么待这道杯虹？',
    steps(
      action('door', 'engage', '先走到房子门口', '我先走到虹下那所房子的门口。'),
      action('river', 'engage', '先在河边站住', '我先在虹下的河边站住，杯子仍在天上。'),
      '我先把门带上，排成虹的杯子留在门外。',
    ),
  ),
  pause2(
    'cups_10',
    'upright',
    '门缝里那道杯虹还在，房子和河也都还在下面。你要怎么靠近这道已经展开的虹？',
    steps(
      action('child', 'engage', '先站到孩子那一边', '我先站到虹下孩子所在的那一边。'),
      action('arch', 'engage', '先在虹的正下方停住', '我先在十只杯的正下方停住。'),
      '我先把门带上，展开的杯虹留在门外。',
    ),
  ),
  pause1(
    'cups_10',
    'reversed',
    '门缝里十只杯仍弯成虹，房子的门却是暗的，人没有聚到虹下面。你要先怎么待这道没被站到的虹？',
    steps(
      action('lamp', 'engage', '先走到暗着的房门前', '我先走到那扇暗着的房门前。'),
      action('apart', 'engage', '先看清人还分开站着', '我先看清虹下的人还分开站着。'),
      '我先把门带上，没被站到的杯虹留在门外。',
    ),
  ),
  pause2(
    'cups_10',
    'reversed',
    '门缝里杯虹还在，暗着的房门前仍没有人聚拢。你要怎么对待这道空着的虹？',
    steps(
      action('sill', 'engage', '先在房门门槛上站一下', '我先在暗着的房门门槛上站一下。'),
      action('stream', 'engage', '先沿河走到虹的尽头', '我先沿河走到杯虹的尽头。'),
      '我先把门带上，空着的杯虹留在门外。',
    ),
  ),
  pause1(
    'cups_page',
    'upright',
    '门缝里，一个年轻人把杯子捧到眼前，杯口里探出一条鱼，脚下是水。你要先怎么待这只探出鱼的杯？',
    steps(
      action('fish', 'engage', '先让鱼留在杯口', '我先让那条鱼留在杯口，杯子仍捧着。'),
      action('tide', 'engage', '先看脚下的水', '我先看年轻人脚下的那片水。'),
      '我先把门带上，探出鱼的杯子留在门外。',
    ),
  ),
  pause2(
    'cups_page',
    'upright',
    '门缝里那只杯还捧在眼前，鱼仍探在杯口。你要怎么安放这条还在杯里的鱼？',
    steps(
      action('lower', 'engage', '把杯子放到与鱼同高', '我把杯子放到与探出的鱼同一高度。'),
      action('wave', 'engage', '先让杯口对着水面', '我先让杯口对着脚下的水面。'),
      '我先把门带上，杯口的鱼留在门外。',
    ),
  ),
  pause1(
    'cups_page',
    'reversed',
    '门缝里鱼缩回杯中，杯口没有对着门口，年轻人仍低着头。你要先怎么待这只鱼不出来的杯？',
    steps(
      action('tilt', 'engage', '先把杯口转向门口', '我先把缩着鱼的杯口转向门口。'),
      action('still', 'engage', '先让鱼留在杯里', '我先让那条鱼留在杯里，不把它倒出来。'),
      '我先把门带上，鱼不出来的杯子留在门外。',
    ),
  ),
  pause2(
    'cups_page',
    'reversed',
    '门缝里那条鱼仍缩在杯里，杯口还是没对着门口。你要怎么对待这只闭着的杯？',
    steps(
      action('rim', 'engage', '先只看杯沿', '我先只看这只闭着的杯的沿。'),
      action('head', 'engage', '先让低着的头抬起一点', '我先让低着的头抬起一点，鱼仍在杯里。'),
      '我先把门带上，闭着的杯子留在门外。',
    ),
  ),
  pause1(
    'cups_knight',
    'upright',
    '门缝里，马上的人把一只杯子递向前方，马蹄抬在水边。你要先怎么待这只递向前的杯？',
    steps(
      action('rein', 'engage', '先让马停在水边', '我先让马停在水边，杯子仍递向前。'),
      action('cup', 'engage', '先把杯子再递近一寸', '我先把这只杯子再向门口递近一寸。'),
      '我先把门带上，递向前的杯子留在门外。',
    ),
  ),
  pause2(
    'cups_knight',
    'upright',
    '门缝里那只杯子还在马前，水边的蹄仍抬着。你要怎么安放这只还在递出的杯？',
    steps(
      action('slow', 'engage', '先把马步放慢', '我先把水边的马步放慢，杯子继续递着。'),
      action('level', 'engage', '把杯口保持平稳', '我把这只递出的杯口保持平稳。'),
      '我先把门带上，还在马前的杯子留在门外。',
    ),
  ),
  pause1(
    'cups_knight',
    'reversed',
    '门缝里杯子倾斜，水沿着马蹄洒在门口，马还在往前。你要先怎么待这只洒水的杯？',
    steps(
      action('right', 'engage', '先把倾斜的杯扶正', '我先把这只倾斜的杯扶正。'),
      action('hoof', 'engage', '先让马蹄停住', '我先让还在往前的马蹄停住。'),
      '我先把门带上，洒水的杯子留在门外。',
    ),
  ),
  pause2(
    'cups_knight',
    'reversed',
    '门缝里那只杯仍斜着，洒出的水还在马蹄边。你要怎么对待这只没扶正的杯？',
    steps(
      action('upright', 'engage', '再把杯口抬平一点', '我再把斜着的杯口抬平一点。'),
      action('wipe', 'engage', '先看蹄边洒出的水', '我先看马蹄边已经洒出的水。'),
      '我先把门带上，没扶正的杯子留在门外。',
    ),
  ),
  pause1(
    'cups_queen',
    'upright',
    '门缝里，岸边的座位上放着一只雕花杯，杯口对着水面。你要先怎么待这只对着水的杯？',
    steps(
      action('shore', 'engage', '先在岸边坐下', '我先在岸边的座位上坐下，雕花杯对着水。'),
      action('gaze', 'engage', '先看杯里映出的水', '我先看雕花杯里映出的那一点水。'),
      '我先把门带上，对着水面的杯子留在门外。',
    ),
  ),
  pause2(
    'cups_queen',
    'upright',
    '门缝里那只雕花杯仍对着岸边的水，座位也还空着一半。你要怎么安放这只还在看水的杯？',
    steps(
      action('set', 'engage', '把杯子在膝上放稳', '我把这只雕花杯在膝上放稳。'),
      action('edge', 'engage', '先让杯口继续对水', '我先让杯口继续对着岸边的水。'),
      '我先把门带上，还在看水的杯子留在门外。',
    ),
  ),
  pause1(
    'cups_queen',
    'reversed',
    '门缝里雕花杯被捧得很近，岸边的台阶被水漫过，杯口没有对着开阔的水面。你要先怎么待这只被捧住的杯？',
    steps(
      action('away', 'engage', '先把杯子离身一点', '我先把捧得很近的雕花杯离身一点。'),
      action('step', 'engage', '先看被水漫过的台阶', '我先看岸边被水漫过的那级台阶。'),
      '我先把门带上，被捧住的杯子留在门外。',
    ),
  ),
  pause2(
    'cups_queen',
    'reversed',
    '门缝里那只杯仍贴近座位，漫过台阶的水还没退。你要怎么对待这只没对着水面的杯？',
    steps(
      action('turn', 'engage', '把杯口转向开阔的水', '我把杯口转向还没被挡住的那片水。'),
      action('dry', 'engage', '先在没被漫到的岸上停住', '我先在没被漫到的岸上停住。'),
      '我先把门带上，没对着水面的杯子留在门外。',
    ),
  ),
  pause1(
    'cups_king',
    'upright',
    '门缝里，海边的座位上有人把杯子端平，远处有一条船。你要先怎么待这只被端平的杯？',
    steps(
      action('steady', 'engage', '先让杯口保持端平', '我先让这只杯的口保持端平。'),
      action('ship', 'engage', '先看远处那条船', '我先看座位远处的那条船，杯子仍端着。'),
      '我先把门带上，被端平的杯子留在门外。',
    ),
  ),
  pause2(
    'cups_king',
    'upright',
    '门缝里那只杯还端在海边的座位上，船也还在远处。你要怎么安放这只已经端平的杯？',
    steps(
      action('throne', 'engage', '先把杯子放回座位扶手', '我先把端平的杯子放回座位的扶手上。'),
      action('sea', 'engage', '先看杯和船之间的海', '我先看杯子和远处那条船之间的海。'),
      '我先把门带上，端在座位上的杯子留在门外。',
    ),
  ),
  pause1(
    'cups_king',
    'reversed',
    '门缝里杯子被端得纹丝不动，座边的海却没有浪，船也停着。你要先怎么待这只不动的杯？',
    steps(
      action('loose', 'engage', '先让端杯的手松一点', '我先让端着杯子的手松一点。'),
      action('wave', 'engage', '先看座边那片没有浪的海', '我先看座边那片没有浪的海。'),
      '我先把门带上，纹丝不动的杯子留在门外。',
    ),
  ),
  pause2(
    'cups_king',
    'reversed',
    '门缝里那只杯仍纹丝不动，船还停在没有浪的海上。你要怎么对待这只过平的杯？',
    steps(
      action('tilt', 'engage', '让杯口微微偏一点', '我让这只过平的杯口微微偏一点。'),
      action('hull', 'engage', '先看停着的船', '我先看那条停在海上的船。'),
      '我先把门带上，过平的杯子留在门外。',
    ),
  ),
];
