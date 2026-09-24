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

export const HAND_CUPS_OFFERS: readonly PauseOffer[] = [
  pause1(
    'cups_01_ace',
    'upright',
    '掌心里这张牌上，云中伸出一只手，托着一只金杯，水从杯沿往下流，杯上有一只鸽子，下面是莲叶。你要先怎么待这只还在流水的杯？',
    steps(
      action('rim', 'engage', '先看杯沿流下的水', '我先看从杯沿流下的水。'),
      action('dove', 'engage', '先看杯上的鸽子', '我先看停在杯上方的鸽子。'),
      '我把这只流水的金杯放回桌上。',
    ),
  ),
  pause2(
    'cups_01_ace',
    'upright',
    '掌心里金杯仍被云中的手托着，水和莲叶都还在。你要怎么安放这只还在淌水的杯？',
    steps(
      action('palm', 'engage', '先看托着杯的那只手', '我先看云中托着杯子的那只手。'),
      action('lotus', 'engage', '先看水上的莲', '我先看杯下那些莲叶和红花。'),
      '我把云中的手和金杯放回桌上。',
    ),
  ),
  pause1(
    'cups_01_ace',
    'reversed',
    '掌心里这张牌倒着，金杯、鸽子、流水和莲叶仍印着。你要先把杯口转到哪一边？',
    steps(
      action('cup', 'engage', '先把杯口转到朝上', '我先把这只金杯的杯口转上来。'),
      action('lines', 'engage', '先看还画着的水线', '我先看从杯沿画下来的水线。'),
      '我把倒着的金杯放回桌上。',
    ),
  ),
  pause2(
    'cups_01_ace',
    'reversed',
    '牌仍倒在掌心，鸽子还在杯的一端，莲叶还在另一端。你要怎么放这只还印着的鸽子？',
    steps(
      action('dove', 'engage', '先托住这只鸽子', '我先托住杯那一端的鸽子。'),
      action('cloud', 'engage', '先看云里伸出的手', '我先看云里伸出的那只手。'),
      '我把倒着的鸽子和莲叶放回桌上。',
    ),
  ),
  pause1(
    'cups_02',
    'upright',
    '掌心里，两个人各举一只杯，两只杯口相对，中间是缠着双蛇的杖，杖顶有翅膀和狮面。你要先怎么待这两只相对的杯？',
    steps(
      action('cups', 'engage', '让两只杯仍相对', '我让这两只杯仍相对举着。'),
      action('staff', 'engage', '先看中间的双蛇杖', '我先看两杯中间那根双蛇杖。'),
      '我把两只杯子和双蛇杖放回桌上。',
    ),
  ),
  pause2(
    'cups_02',
    'upright',
    '掌心里两只杯仍举在同一高度，房子和山都还在后面。你要怎么安放这两只还相对的杯？',
    steps(
      action('level', 'engage', '先看两只杯的高度', '我先看这两只杯是不是举在同一高度。'),
      action('house', 'engage', '先看后面的房子', '我先看两人后面那所房子。'),
      '我把相对的两只杯放回桌上。',
    ),
  ),
  pause1(
    'cups_02',
    'reversed',
    '掌心里这张牌倒着，两只杯、双蛇杖和两个人仍印着。你要先把哪一只杯转到朝上？',
    steps(
      action('one', 'engage', '先把其中一只杯转上来', '我先把其中一只杯子转上来。'),
      action('wings', 'engage', '先看杖顶的翅膀', '我先看杖顶那对翅膀。'),
      '我把倒着的两只杯放回桌上。',
    ),
  ),
  pause2(
    'cups_02',
    'reversed',
    '牌仍倒在掌心，两只杯口还朝着彼此。你要怎么放这根还印在中间的双蛇杖？',
    steps(
      action('staff', 'engage', '先按住双蛇杖', '我先按住两杯中间的双蛇杖。'),
      action('hills', 'engage', '先看远处的山', '我先看房子后面那些山。'),
      '我把倒着的双蛇杖放回桌上。',
    ),
  ),
  pause1(
    'cups_03',
    'upright',
    '掌心里，三个人把杯子举过头顶，脚边是苹果、葡萄和橙。你要先怎么待这三只举起的杯？',
    steps(
      action('cups', 'engage', '先看三只举起的杯', '我先看举过头顶的三只杯。'),
      action('fruit', 'engage', '先看脚边的果子', '我先看脚边的苹果和葡萄。'),
      '我把三只杯子和果子放回桌上。',
    ),
  ),
  pause2(
    'cups_03',
    'upright',
    '掌心里三只杯仍举着，白衣、红衣和黄衣都还在。你要怎么安放脚边这些还堆着的果子？',
    steps(
      action('fruit', 'engage', '先把果子留在脚边', '我先把这些果子留在三个人脚边。'),
      action('wreath', 'engage', '先看头上的花冠', '我先看其中一个人头上的花冠。'),
      '我把举起的三只杯放回桌上。',
    ),
  ),
  pause1(
    'cups_03',
    'reversed',
    '掌心里这张牌倒着，三只杯和脚边的果子仍印着。你要先把哪一只杯转到朝上？',
    steps(
      action('cup', 'engage', '先把其中一只杯转上来', '我先把其中一只举起的杯转上来。'),
      action('grapes', 'engage', '先看脚边的葡萄', '我先看脚边那串葡萄。'),
      '我把倒着的三只杯放回桌上。',
    ),
  ),
  pause2(
    'cups_03',
    'reversed',
    '牌仍倒在掌心，三个人还站在一起，杯子还举着。你要怎么放这些还印在脚边的果子？',
    steps(
      action('apples', 'engage', '先托住脚边的苹果', '我先托住脚边那些苹果。'),
      action('red', 'engage', '先看中间红衣举起的杯', '我先看中间红衣举起的那只杯。'),
      '我把倒着的果子和杯子放回桌上。',
    ),
  ),
  pause1(
    'cups_04',
    'upright',
    '掌心里，树下的人抱着胳膊，面前草地上有三只杯，云里又递来第四只。你要先怎么待这只从云里递来的杯？',
    steps(
      action('cloud', 'engage', '先看云里递来的杯', '我先看云中那只递来的杯。'),
      action('three', 'engage', '先看草地上的三只杯', '我先看树下草地上的三只杯。'),
      '我把云里的杯和树下放回桌上。',
    ),
  ),
  pause2(
    'cups_04',
    'upright',
    '掌心里第四只杯仍在云中，树下的人仍看着别处。你要怎么安放这只还没被看向的杯？',
    steps(
      action('offer', 'engage', '让云中的杯仍伸着', '我让云中递来的杯子仍停在那里。'),
      action('tree', 'engage', '先看人身后的树', '我先看人靠着的那棵树。'),
      '我把云中的第四只杯放回桌上。',
    ),
  ),
  pause1(
    'cups_04',
    'reversed',
    '掌心里这张牌倒着，云中的杯、树下的人和三只草地杯仍印着。你要先把云中那只杯转到哪一边？',
    steps(
      action('cloud', 'engage', '先把云中的杯转上来', '我先把云中递来的杯子转上来。'),
      action('arms', 'engage', '先看抱着的胳膊', '我先看树下抱着的那双胳膊。'),
      '我把倒着的四只杯放回桌上。',
    ),
  ),
  pause2(
    'cups_04',
    'reversed',
    '牌仍倒在掌心，三只杯还排在草地上，第四只还在云里。你要怎么放这三只还印在草上的杯？',
    steps(
      action('grass', 'engage', '先按住草地上的杯', '我先按住草地上这三只杯。'),
      action('boots', 'engage', '先看伸着的靴子', '我先看树下伸着的那双靴子。'),
      '我把倒着的云和杯子放回桌上。',
    ),
  ),
  pause1(
    'cups_05',
    'upright',
    '掌心里，黑斗篷对着三只倒掉的杯，旁边还立着两只，远处一边是城堡，一边是桥。你要先怎么待这三只倒掉的杯？',
    steps(
      action('spilled', 'engage', '先看倒掉的三只杯', '我先看黑斗篷前倒掉的三只杯。'),
      action('standing', 'engage', '先看还立着的两只', '我先看旁边还立着的两只杯。'),
      '我把倒掉的杯和黑斗篷放回桌上。',
    ),
  ),
  pause2(
    'cups_05',
    'upright',
    '掌心里三只杯仍倒着，两只立着的和桥都还在。你要怎么安放这摊还印在地上的水？',
    steps(
      action('spill', 'engage', '先看倒出来的那摊', '我先看三只杯倒出来的那摊。'),
      action('bridge', 'engage', '先看远处的桥', '我先看河上那座桥。'),
      '我把立着的两只杯放回桌上。',
    ),
  ),
  pause1(
    'cups_05',
    'reversed',
    '掌心里这张牌倒着，黑斗篷、三只倒杯、两只立杯和桥仍印着。你要先把哪一边的杯转到朝上？',
    steps(
      action('down', 'engage', '先把倒掉的杯转上来', '我先把倒掉的三只杯转上来。'),
      action('castle', 'engage', '先看远处的城堡', '我先看河对岸那座城堡。'),
      '我把倒着的黑斗篷放回桌上。',
    ),
  ),
  pause2(
    'cups_05',
    'reversed',
    '牌仍倒在掌心，黑斗篷还对着倒掉的杯。你要怎么放这两只还立着的杯？',
    steps(
      action('two', 'engage', '先托住还立着的两只', '我先托住旁边还立着的两只杯。'),
      action('river', 'engage', '先看斗篷后的河', '我先看黑斗篷后面那条河。'),
      '我把倒着的桥和杯子放回桌上。',
    ),
  ),
  pause1(
    'cups_06',
    'upright',
    '掌心里，石地上有六只插着白花的杯，较大的孩子正把其中一只递给较小的孩子，后面是旧房子。你要先怎么待这只正递着的杯？',
    steps(
      action('give', 'engage', '先看递到小手边的杯', '我先看正递到较小孩子面前的那只杯。'),
      action('ground', 'engage', '先看石地上的花杯', '我先看石地上另外几只花杯。'),
      '我把这六只花杯放回桌上。',
    ),
  ),
  pause2(
    'cups_06',
    'upright',
    '掌心里那只花杯仍在两个孩子之间，旧房子上的狮徽还挂着。你要怎么安放这只还没递完的花杯？',
    steps(
      action('cup', 'engage', '让花杯仍停在两手之间', '我让这只花杯仍停在两个孩子之间。'),
      action('lion', 'engage', '先看房子上的狮徽', '我先看旧房子上那个狮徽。'),
      '我把两个孩子和花杯放回桌上。',
    ),
  ),
  pause1(
    'cups_06',
    'reversed',
    '掌心里这张牌倒着，六只花杯、两个孩子和旧房子仍印着。你要先把哪一只花杯转到朝上？',
    steps(
      action('held', 'engage', '先把递着的那只转上来', '我先把正递着的那只花杯转上来。'),
      action('away', 'engage', '先看巷子里走开的人', '我先看巷子里那个走开的人。'),
      '我把倒着的花杯放回桌上。',
    ),
  ),
  pause2(
    'cups_06',
    'reversed',
    '牌仍倒在掌心，白花还插在六只杯里。你要怎么放这些还印着的白花？',
    steps(
      action('flowers', 'engage', '先看杯里的白花', '我先看插在杯里的白花。'),
      action('stones', 'engage', '先看脚下的石地', '我先看两个孩子脚下的石地。'),
      '我把倒着的旧房子和花杯放回桌上。',
    ),
  ),
  pause1(
    'cups_07',
    'upright',
    '掌心里，七只杯浮在云上，里面分别是城、珠宝、花环、龙、蒙头的人、一颗头和发光的人，下面有人仰头看。你要先怎么待这些浮着的杯？',
    steps(
      action('cups', 'engage', '先看其中一只浮着的杯', '我先看云上其中一只杯子。'),
      action('person', 'engage', '先看仰头的那个人', '我先看云下仰头的那个人。'),
      '我把这七只浮着的杯放回桌上。',
    ),
  ),
  pause2(
    'cups_07',
    'upright',
    '掌心里七只杯仍浮着，城、龙和花环都还在杯里。你要怎么安放这只还盛着龙的杯？',
    steps(
      action('dragon', 'engage', '先看盛着龙的杯', '我先看里面有龙的那只杯。'),
      action('castle', 'engage', '先看盛着城的杯', '我先看里面有城的那只杯。'),
      '我把云上的七只杯放回桌上。',
    ),
  ),
  pause1(
    'cups_07',
    'reversed',
    '掌心里这张牌倒着，七只杯和仰头的人仍印着。你要先把哪一只杯转到朝上？',
    steps(
      action('wreath', 'engage', '先把花环那只转上来', '我先把盛着花环的杯子转上来。'),
      action('glow', 'engage', '先看盛着发光的人的杯', '我先看里面发光的那只杯。'),
      '我把倒着的七只杯放回桌上。',
    ),
  ),
  pause2(
    'cups_07',
    'reversed',
    '牌仍倒在掌心，云还托着七只杯。你要怎么放这只还印着蒙头人的杯？',
    steps(
      action('veil', 'engage', '先按住蒙头人那只杯', '我先按住里面蒙着头的那只杯。'),
      action('head', 'engage', '先看盛着头像的杯', '我先看里面是一颗头的那只杯。'),
      '我把倒着的云和杯子放回桌上。',
    ),
  ),
  pause1(
    'cups_08',
    'upright',
    '掌心里，岸边排着八只杯，披红斗篷的人拄着杖，走向月亮和山。你要先怎么待这排留在岸边的杯？',
    steps(
      action('cups', 'engage', '先看岸边的八只杯', '我先看留在岸边的八只杯。'),
      action('staff', 'engage', '先看手里的杖', '我先看红斗篷手里那根杖。'),
      '我把八只杯和红斗篷放回桌上。',
    ),
  ),
  pause2(
    'cups_08',
    'upright',
    '掌心里八只杯仍排在岸边，月亮的脸和山都还在。你要怎么安放这根还拄着的杖？',
    steps(
      action('staff', 'engage', '让杖仍点在岸上', '我让这根杖仍点在岸边。'),
      action('moon', 'engage', '先看天上的月亮', '我先看红斗篷上方那张月亮的脸。'),
      '我把岸边的杯子和杖放回桌上。',
    ),
  ),
  pause1(
    'cups_08',
    'reversed',
    '掌心里这张牌倒着，八只杯、红斗篷、杖和月亮仍印着。你要先把哪一排杯子转到朝上？',
    steps(
      action('cups', 'engage', '先把岸边的杯子转上来', '我先把这八只杯子转上来。'),
      action('peaks', 'engage', '先看远处的山', '我先看水边那些山。'),
      '我把倒着的红斗篷放回桌上。',
    ),
  ),
  pause2(
    'cups_08',
    'reversed',
    '牌仍倒在掌心，红斗篷还背对着八只杯。你要怎么放这排还印在岸上的杯？',
    steps(
      action('row', 'engage', '先按住这八只杯', '我先按住岸边这八只杯。'),
      action('water', 'engage', '先看杯子旁边的水', '我先看八只杯旁边那片水。'),
      '我把倒着的月亮和杯子放回桌上。',
    ),
  ),
  pause1(
    'cups_09',
    'upright',
    '掌心里，九只杯排在架上，架下的人坐在凳上，胳膊交叠，身后是蓝布。你要先怎么待这排已经摆上架的杯？',
    steps(
      action('shelf', 'engage', '先看架上的九只杯', '我先看木架上的九只杯。'),
      action('arms', 'engage', '先看交叠的胳膊', '我先看坐着的人交叠的胳膊。'),
      '我把架上的九只杯放回桌上。',
    ),
  ),
  pause2(
    'cups_09',
    'upright',
    '掌心里九只杯仍排成一排，红帽和蓝布都还在。你要怎么安放这排还在头后的杯？',
    steps(
      action('cups', 'engage', '让九只杯仍留在架上', '我让这九只杯仍留在架上。'),
      action('bench', 'engage', '先看人坐着的凳', '我先看架下那张木凳。'),
      '我把红帽和九只杯放回桌上。',
    ),
  ),
  pause1(
    'cups_09',
    'reversed',
    '掌心里这张牌倒着，九只杯、蓝布和坐着的人仍印着。你要先把杯子转到哪一边？',
    steps(
      action('shelf', 'engage', '先把架上的杯转上来', '我先把这九只杯转上来。'),
      action('cap', 'engage', '先看那顶红帽', '我先看坐着的人头上那顶红帽。'),
      '我把倒着的九只杯放回桌上。',
    ),
  ),
  pause2(
    'cups_09',
    'reversed',
    '牌仍倒在掌心，胳膊还交叠，杯子还在架上。你要怎么放这排还印着的杯？',
    steps(
      action('nine', 'engage', '先托住架上的杯', '我先托住架上这排杯子。'),
      action('shoes', 'engage', '先看凳下的鞋', '我先看凳下那双系带的鞋。'),
      '我把倒着的蓝布和杯子放回桌上。',
    ),
  ),
  pause1(
    'cups_10',
    'upright',
    '掌心里，十只杯排成一道虹，虹下有房子、溪水，两个大人举手，两个孩子在溪边。你要先怎么待这道杯虹？',
    steps(
      action('rainbow', 'engage', '先看虹上的十只杯', '我先看排在虹上的十只杯。'),
      action('house', 'engage', '先看虹下的房子', '我先看虹下面那所房子。'),
      '我把这道杯虹放回桌上。',
    ),
  ),
  pause2(
    'cups_10',
    'upright',
    '掌心里十只杯仍弯在虹上，溪水和举手的人还在下面。你要怎么安放这道还展开的虹？',
    steps(
      action('arc', 'engage', '让十只杯仍留在虹上', '我让这十只杯仍留在虹上。'),
      action('children', 'engage', '先看溪边的孩子', '我先看溪边那两个孩子。'),
      '我把虹下的房子和杯子放回桌上。',
    ),
  ),
  pause1(
    'cups_10',
    'reversed',
    '掌心里这张牌倒着，十只杯、虹、房子和溪水仍印着。你要先把虹的哪一端转到朝上？',
    steps(
      action('cups', 'engage', '先把虹上的杯子转上来', '我先把这十只杯子转上来。'),
      action('hands', 'engage', '先看举起的手', '我先看两个大人举起的手。'),
      '我把倒着的杯虹放回桌上。',
    ),
  ),
  pause2(
    'cups_10',
    'reversed',
    '牌仍倒在掌心，溪水还从房子前流过。你要怎么放这道还印着的虹？',
    steps(
      action('rainbow', 'engage', '先按住这道虹', '我先按住排着十只杯的虹。'),
      action('trees', 'engage', '先看房子旁边的树', '我先看房子旁边那些树。'),
      '我把倒着的溪水和杯子放回桌上。',
    ),
  ),
  pause1(
    'cups_page',
    'upright',
    '掌心里，穿花衣的人把杯子举到眼前，一条鱼探在杯口，脚边是浪。你要先怎么待这只探出鱼的杯？',
    steps(
      action('fish', 'engage', '先看杯口的鱼', '我先看探在杯口的那条鱼。'),
      action('boots', 'engage', '先看踩在浪里的靴子', '我先看踩进浪里的黄靴。'),
      '我把探出鱼的杯子放回桌上。',
    ),
  ),
  pause2(
    'cups_page',
    'upright',
    '掌心里，花衣上的杯子仍举着，鱼还探在杯口。你身上哪一种手艺够用在这只杯子上？',
    steps(
      action('craft', 'engage', '用正在学的那门手艺', '我用正在学的那门手艺，先看清杯口这条鱼。'),
      action('fish', 'engage', '先只看杯口的鱼', '我先只看杯口这条鱼，不把杯子举得更高。'),
      '我把杯口的鱼和杯子放回桌上。',
    ),
  ),
  pause1(
    'cups_page',
    'reversed',
    '掌心里这张牌倒着，花衣、鱼、杯子和浪仍印着。你要先把杯口的鱼转到哪一边？',
    steps(
      action('fish', 'engage', '先把杯口的鱼转上来', '我先把杯口这条鱼转上来。'),
      action('cap', 'engage', '先看头上的软帽', '我先看头上那顶带穗的软帽。'),
      '我把倒着的鱼杯放回桌上。',
    ),
  ),
  pause2(
    'cups_page',
    'reversed',
    '牌仍倒在掌心，鱼还在杯口，浪还在脚边。你要怎么放这条还印着的鱼？',
    steps(
      action('fish', 'engage', '先托住杯口的鱼', '我先托住杯口这条鱼。'),
      action('waves', 'engage', '先看脚边的浪', '我先看黄靴旁边的浪。'),
      '我把倒着的花衣和鱼放回桌上。',
    ),
  ),
  pause1(
    'cups_knight',
    'upright',
    '掌心里，马上的人把金杯递在马头前，一只马蹄抬在溪边，头盔上有一对翅膀。你要先怎么待这只递在马前的杯？',
    steps(
      action('cup', 'engage', '先看马前的金杯', '我先看递在马头前的金杯。'),
      action('hoof', 'engage', '先看抬起的马蹄', '我先看溪边抬起的那只马蹄。'),
      '我把马前的金杯放回桌上。',
    ),
  ),
  pause2(
    'cups_knight',
    'upright',
    '掌心里金杯仍递在马头前，翅膀头盔和溪水都还在。你身上哪一种手艺够用在这只递出的杯上？',
    steps(
      action('craft', 'engage', '用正在学的那门手艺', '我用正在学的那门手艺，把这只金杯稳住。'),
      action('reins', 'engage', '先看马头上的缰', '我先看白马头上那套缰绳。'),
      '我把马上的金杯放回桌上。',
    ),
  ),
  pause1(
    'cups_knight',
    'reversed',
    '掌心里这张牌倒着，金杯、白马、翅膀头盔和溪水仍印着。你要先把金杯转到哪一边？',
    steps(
      action('cup', 'engage', '先把金杯转上来', '我先把马前这只金杯转上来。'),
      action('cape', 'engage', '先看肩上的红披风', '我先看肩上那件红披风。'),
      '我把倒着的金杯和白马放回桌上。',
    ),
  ),
  pause2(
    'cups_knight',
    'reversed',
    '牌仍倒在掌心，马蹄还抬着，金杯还在手里。你要怎么放这只还印着的金杯？',
    steps(
      action('cup', 'engage', '先托住这只金杯', '我先托住手里这只金杯。'),
      action('stream', 'engage', '先看马下的溪', '我先看白马蹄边那条溪。'),
      '我把倒着的翅膀头盔放回桌上。',
    ),
  ),
  pause1(
    'cups_queen',
    'upright',
    '掌心里，海座上的人双手捧着一只有盖的雕花杯，座柱上各有一条鱼尾人身。你要先怎么待这只盖着的杯？',
    steps(
      action('lid', 'engage', '先看杯上的盖', '我先看这只雕花杯的盖。'),
      action('tail', 'engage', '先看座上的鱼尾', '我先看座柱上的鱼尾人身。'),
      '我把有盖的雕花杯放回桌上。',
    ),
  ),
  pause2(
    'cups_queen',
    'upright',
    '掌心里有盖的杯子仍捧在海座上，浪还打在座脚。你身上哪一种手艺够用在这只盖着的杯上？',
    steps(
      action('craft', 'engage', '用正在学的那门手艺', '我用正在学的那门手艺，先托住这只有盖的杯。'),
      action('waves', 'engage', '先看座下的浪', '我先看打在座脚的浪。'),
      '我把海座上的雕花杯放回桌上。',
    ),
  ),
  pause1(
    'cups_queen',
    'reversed',
    '掌心里这张牌倒着，有盖的杯、海座和浪仍印着。你要先把杯盖转到哪一边？',
    steps(
      action('lid', 'engage', '先把杯盖转上来', '我先把这只杯的盖转上来。'),
      action('crown', 'engage', '先看头上的冠', '我先看头上那顶冠。'),
      '我把倒着的雕花杯放回桌上。',
    ),
  ),
  pause2(
    'cups_queen',
    'reversed',
    '牌仍倒在掌心，双手还捧着有盖的杯。你要怎么放这只还印着的杯？',
    steps(
      action('cup', 'engage', '先托住这只有盖的杯', '我先托住双手捧着的杯子。'),
      action('shell', 'engage', '先看座顶的扇贝形', '我先看座顶那个扇贝形。'),
      '我把倒着的海座和杯子放回桌上。',
    ),
  ),
  pause1(
    'cups_king',
    'upright',
    '掌心里，海座上的人一只手举着杯子，另一只手持着短杖，一边浪里有一条鱼，另一边有一条船。你要先怎么待这只举起的杯？',
    steps(
      action('cup', 'engage', '先看举起的杯子', '我先看举在座边的杯子。'),
      action('ship', 'engage', '先看远处的船', '我先看浪那边那条船。'),
      '我把举起的杯子和船放回桌上。',
    ),
  ),
  pause2(
    'cups_king',
    'upright',
    '掌心里杯子仍举在海座上，鱼和船都还在。你身上哪一种手艺够用在这只举起的杯上？',
    steps(
      action('craft', 'engage', '用正在学的那门手艺', '我用正在学的那门手艺，把这只杯子稳住。'),
      action('fish', 'engage', '先看浪里的鱼', '我先看座边浪里那条鱼。'),
      '我把海座上的杯子放回桌上。',
    ),
  ),
  pause1(
    'cups_king',
    'reversed',
    '掌心里这张牌倒着，杯子、短杖、鱼和船仍印着。你要先把杯子转到哪一边？',
    steps(
      action('cup', 'engage', '先把举起的杯转上来', '我先把这只杯子转上来。'),
      action('scepter', 'engage', '先看另一只手里的短杖', '我先看另一只手里的短杖。'),
      '我把倒着的杯子和船放回桌上。',
    ),
  ),
  pause2(
    'cups_king',
    'reversed',
    '牌仍倒在掌心，海座还立在浪里，杯子还举着。你要怎么放这只还印着的杯？',
    steps(
      action('cup', 'engage', '先托住这只杯子', '我先托住举着的这只杯子。'),
      action('arm', 'engage', '先看海座的石扶手', '我先看海座上的石扶手。'),
      '我把倒着的短杖和鱼放回桌上。',
    ),
  ),
];
