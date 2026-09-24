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

export const HAND_MAJOR_OFFERS: readonly PauseOffer[] = [
  pause1(
    '00_the_fool',
    'upright',
    '掌心里，一只脚踩在崖边的石上，手里是白花，肩上是小包，白狗在脚边。你要先怎么放这只踩在崖上的脚？',
    steps(
      action('foot', 'engage', '先把脚留在崖石上', '我先把这只踩在崖石上的脚留在掌心这边。'),
      action('rose', 'engage', '先握住那朵白花', '我先握住这朵白花，脚仍停在崖石上。'),
      '我把崖边的脚、白花和小包放回桌上。',
    ),
  ),
  pause2(
    '00_the_fool',
    'upright',
    '掌心里那只脚仍踩在崖石上，白花、小包和白狗都还在。你要怎么安放这只还没离开石面的脚？',
    steps(
      action('near', 'engage', '让脚再靠近崖沿', '我让这只脚再靠近崖沿一点。'),
      action('dog', 'engage', '先看白狗抬起的前爪', '我先看白狗抬起的那只前爪。'),
      '我把还踩在崖石上的脚放回桌上。',
    ),
  ),
  pause1(
    '00_the_fool',
    'reversed',
    '掌心里这张牌倒着，崖边的脚、白花、小包和白狗仍印在牌面上。你要先碰哪一件？',
    steps(
      action('rose', 'engage', '先碰那朵白花', '我先碰倒着的牌面上那朵白花。'),
      action('pack', 'engage', '先按住肩上的小包', '我先按住肩上那只小包。'),
      '我把倒着的崖边和白花放回桌上。',
    ),
  ),
  pause2(
    '00_the_fool',
    'reversed',
    '牌仍倒在掌心，崖石、白狗和白花都还看得见。你要怎么托住这只还印在崖石上的脚？',
    steps(
      action('stone', 'engage', '托住崖石这一端', '我托住牌面上崖石的这一端。'),
      action('sun', 'engage', '先看牌面上的太阳', '我先看牌面上那轮太阳。'),
      '我把倒着的崖石和白狗放回桌上。',
    ),
  ),
  pause1(
    '01_the_magician',
    'upright',
    '掌心里，一只手把长杖举过头顶，另一只手指向桌面，桌上有杯、剑、五角星币和一根短杖。你要先碰桌上的哪一件？',
    steps(
      action('cup', 'engage', '先碰桌上的杯', '我先碰桌上那只杯。'),
      action('coin', 'engage', '先碰五角星币', '我先碰桌上那枚五角星币。'),
      '我把举起的长杖和桌上的杯放回桌上。',
    ),
  ),
  pause2(
    '01_the_magician',
    'upright',
    '掌心里那只长杖仍举着，桌上的杯、剑、币和短杖都还在。你要怎么动其中一件？',
    steps(
      action('sword', 'engage', '先拿起桌上的剑', '我先拿起桌上那把剑。'),
      action('point', 'engage', '让指着桌面的手停住', '我让那只指着桌面的手先停住。'),
      '我把这张摊着工具的牌放回桌上。',
    ),
  ),
  pause1(
    '01_the_magician',
    'reversed',
    '掌心里这张牌倒着，长杖、杯子、剑、五角星币和短杖都还印着。你要先把哪一件转到朝上？',
    steps(
      action('wand', 'engage', '先把长杖这一头转上来', '我先把举起的长杖这一头转上来。'),
      action('lily', 'engage', '先看桌边的百合', '我先看桌边那丛百合。'),
      '我把倒着的工具和玫瑰放回桌上。',
    ),
  ),
  pause2(
    '01_the_magician',
    'reversed',
    '牌仍倒在掌心，头上的横八字和桌上的杯都还在。你要怎么放这只还举着的长杖？',
    steps(
      action('eight', 'engage', '先按住头上的横八字', '我先按住头上那个横八字。'),
      action('rose', 'engage', '先看桌边的玫瑰', '我先看桌边那些玫瑰。'),
      '我把倒着的长杖和杯子放回桌上。',
    ),
  ),
  pause1(
    '02_the_high_priestess',
    'upright',
    '掌心里，黑柱上写着 B，白柱上写着 J，两柱之间是石榴，膝上的卷轴露着一截，脚边是一弯月。你要先怎么待这截卷轴？',
    steps(
      action('scroll', 'engage', '先看卷轴上露着的字', '我先看卷轴上已经露着的那截字。'),
      action('moon', 'engage', '先碰脚边的弯月', '我先碰脚边那弯月。'),
      '我把卷轴和两根柱放回桌上。',
    ),
  ),
  pause2(
    '02_the_high_priestess',
    'upright',
    '掌心里两根柱还立着，石榴和卷轴都还在。你要怎么靠近这截还露着的卷轴？',
    steps(
      action('black', 'engage', '先停在写着 B 的柱边', '我先停在写着 B 的黑柱这一边。'),
      action('white', 'engage', '先停在写着 J 的柱边', '我先停在写着 J 的白柱这一边。'),
      '我把石榴和卷轴放回桌上。',
    ),
  ),
  pause1(
    '02_the_high_priestess',
    'reversed',
    '掌心里这张牌倒着，B 柱、J 柱、石榴、卷轴和弯月仍印着。你要先把哪一根柱转上来？',
    steps(
      action('black', 'engage', '先把黑柱转上来', '我先把写着 B 的黑柱转上来。'),
      action('scroll', 'engage', '让卷轴仍只露一截', '我让膝上的卷轴仍只露着这一截。'),
      '我把倒着的两根柱放回桌上。',
    ),
  ),
  pause2(
    '02_the_high_priestess',
    'reversed',
    '牌仍倒在掌心，弯月和卷轴都还看得见。你要怎么放这弯还印在脚边的月？',
    steps(
      action('moon', 'engage', '先托住这弯月', '我先托住牌面上这弯月。'),
      action('fruit', 'engage', '先看帷幕上的石榴', '我先看两柱之间那些石榴。'),
      '我把倒着的卷轴和弯月放回桌上。',
    ),
  ),
  pause1(
    '03_the_empress',
    'upright',
    '掌心里，麦穗围着一把红座，座上有一只心形盾，手里举着权杖，身后有一道瀑布。你要先怎么待这片麦穗？',
    steps(
      action('wheat', 'engage', '先碰身边的麦穗', '我先碰红座身边的麦穗。'),
      action('shield', 'engage', '先看心形盾上的记号', '我先看心形盾上那个圆和十字。'),
      '我把麦穗和红座放回桌上。',
    ),
  ),
  pause2(
    '03_the_empress',
    'upright',
    '掌心里麦穗仍围着红座，权杖和瀑布都还在。你要怎么安放这片还长在座边的麦？',
    steps(
      action('scepter', 'engage', '先握住那根权杖', '我先握住座上举起的那根权杖。'),
      action('fall', 'engage', '先看身后的瀑布', '我先看红座身后的那道瀑布。'),
      '我把还围着红座的麦穗放回桌上。',
    ),
  ),
  pause1(
    '03_the_empress',
    'reversed',
    '掌心里这张牌倒着，麦穗、红座、心形盾和瀑布仍印着。你要先把哪一片麦转到朝上？',
    steps(
      action('wheat', 'engage', '先把麦穗这一端转上来', '我先把麦穗这一端转上来。'),
      action('stars', 'engage', '先看头上的星', '我先看头上那圈星。'),
      '我把倒着的麦穗和心形盾放回桌上。',
    ),
  ),
  pause2(
    '03_the_empress',
    'reversed',
    '牌仍倒在掌心，红座和权杖都还在麦穗中间。你要怎么放这把还印着的红座？',
    steps(
      action('seat', 'engage', '先托住红座', '我先托住这把红座。'),
      action('trees', 'engage', '先看瀑布旁边的树', '我先看瀑布旁边那些树。'),
      '我把倒着的红座和麦穗放回桌上。',
    ),
  ),
  pause1(
    '04_the_emperor',
    'upright',
    '掌心里，石座两边各有一个羊头，一只手握着十字杖，另一只手托着圆球，身后是山和一条河。你要先怎么放这只托着的圆球？',
    steps(
      action('orb', 'engage', '先托住那只圆球', '我先托住手里那只圆球。'),
      action('ram', 'engage', '先看石座上的羊头', '我先看石座两边的羊头。'),
      '我把羊头石座和圆球放回桌上。',
    ),
  ),
  pause2(
    '04_the_emperor',
    'upright',
    '掌心里羊头石座还在，十字杖和圆球都没有放下。你要怎么安放这根还握着的十字杖？',
    steps(
      action('ankh', 'engage', '让十字杖仍竖着', '我让这根十字杖仍竖在石座旁。'),
      action('river', 'engage', '先看山边的河', '我先看石座后面那条河。'),
      '我把十字杖和羊头石座放回桌上。',
    ),
  ),
  pause1(
    '04_the_emperor',
    'reversed',
    '掌心里这张牌倒着，羊头、十字杖、圆球和山仍印着。你要先把圆球转到哪一边？',
    steps(
      action('orb', 'engage', '先把圆球转到朝上', '我先把那只圆球转到朝上。'),
      action('boots', 'engage', '先看石座下的铁靴', '我先看石座下那双铁靴。'),
      '我把倒着的羊头石座放回桌上。',
    ),
  ),
  pause2(
    '04_the_emperor',
    'reversed',
    '牌仍倒在掌心，两个羊头还在石座两侧。你要怎么放这两个还印着的羊头？',
    steps(
      action('one', 'engage', '先按住其中一个羊头', '我先按住石座一侧的羊头。'),
      action('other', 'engage', '再按住另一侧的羊头', '我再按住石座另一侧的羊头。'),
      '我把倒着的圆球和十字杖放回桌上。',
    ),
  ),
  pause1(
    '05_the_hierophant',
    'upright',
    '掌心里，两个人跪在台阶下，地上两把钥匙交叉，座上的人一手竖起两指，一手持着三层杖。你要先怎么待这两把交叉的钥匙？',
    steps(
      action('keys', 'engage', '先看交叉的两把钥匙', '我先看地上交叉的两把钥匙。'),
      action('fingers', 'engage', '先看竖起的那两指', '我先看座上竖起的那两指。'),
      '我把交叉的钥匙和三层杖放回桌上。',
    ),
  ),
  pause2(
    '05_the_hierophant',
    'upright',
    '掌心里两个人仍跪着，钥匙还交叉在他们中间。你要怎么安放这根还立着的三层杖？',
    steps(
      action('staff', 'engage', '让三层杖仍立着', '我让这根三层杖仍立在座旁。'),
      action('roses', 'engage', '先看斗篷上的玫瑰', '我先看其中一件斗篷上的玫瑰。'),
      '我把跪着的两个人和钥匙放回桌上。',
    ),
  ),
  pause1(
    '05_the_hierophant',
    'reversed',
    '掌心里这张牌倒着，跪着的两个人、交叉钥匙和三层杖仍印着。你要先怎么放这两把钥匙？',
    steps(
      action('keys', 'engage', '先把交叉的钥匙转上来', '我先把这两把交叉的钥匙转上来。'),
      action('lilies', 'engage', '先看斗篷上的百合', '我先看另一件斗篷上的百合。'),
      '我把倒着的钥匙和台阶放回桌上。',
    ),
  ),
  pause2(
    '05_the_hierophant',
    'reversed',
    '牌仍倒在掌心，两根石柱还立在座的两边。你要怎么放这根还印着的三层杖？',
    steps(
      action('staff', 'engage', '先托住三层杖', '我先托住这根三层杖。'),
      action('crown', 'engage', '先看座上的三重冠', '我先看座上那顶三重冠。'),
      '我把倒着的三层杖和跪着的人放回桌上。',
    ),
  ),
  pause1(
    '06_the_lovers',
    'upright',
    '掌心里，两个人面对面站着，头上是张开翅膀的人，一棵树结着果、缠着蛇，另一棵树烧着。你要先靠近哪一棵树？',
    steps(
      action('fruit', 'engage', '先靠近结着果的树', '我先靠近结着果、缠着蛇的那棵树。'),
      action('flame', 'engage', '先靠近烧着的树', '我先靠近烧着的那棵树。'),
      '我把两个人和两棵树放回桌上。',
    ),
  ),
  pause2(
    '06_the_lovers',
    'upright',
    '掌心里两个人仍站着，翅膀、果树和火焰都还在。你要怎么安放头上这个张开翅膀的人？',
    steps(
      action('wings', 'engage', '先看张开的翅膀', '我先看头上张开的那对翅膀。'),
      action('peak', 'engage', '先看两人中间的山', '我先看两人中间那座山。'),
      '我把翅膀和两棵树放回桌上。',
    ),
  ),
  pause1(
    '06_the_lovers',
    'reversed',
    '掌心里这张牌倒着，两个人、果树、火焰和翅膀仍印着。你要先把哪一棵树转上来？',
    steps(
      action('snake', 'engage', '先把缠着蛇的树转上来', '我先把缠着蛇的那棵树转上来。'),
      action('fire', 'engage', '先把烧着的树转上来', '我先把烧着的那棵树转上来。'),
      '我把倒着的两棵树放回桌上。',
    ),
  ),
  pause2(
    '06_the_lovers',
    'reversed',
    '牌仍倒在掌心，两个人还面对面，山也还在中间。你要怎么放头上这对还印着的翅膀？',
    steps(
      action('wings', 'engage', '先托住这对翅膀', '我先托住头上这对翅膀。'),
      action('sun', 'engage', '先看翅膀后的太阳', '我先看翅膀后面那轮太阳。'),
      '我把倒着的翅膀和两个人放回桌上。',
    ),
  ),
  pause1(
    '07_the_chariot',
    'upright',
    '掌心里，一黑一白两只狮身人面坐在石车两边，车上的人举着一根杖，头顶是星布。你要先怎么待这两只坐着的狮身人面？',
    steps(
      action('black', 'engage', '先看黑色的那只', '我先看坐在石车一边的黑色狮身人面。'),
      action('white', 'engage', '先看白色的那只', '我先看坐在另一边的白色狮身人面。'),
      '我把两只狮身人面和星布放回桌上。',
    ),
  ),
  pause2(
    '07_the_chariot',
    'upright',
    '掌心里两只狮身人面仍坐着，杖和星布都还在。你要怎么安放这根还举着的杖？',
    steps(
      action('wand', 'engage', '让杖仍举在车前', '我让这根杖仍举在石车前。'),
      action('city', 'engage', '先看河对岸的城', '我先看河对岸那些城楼。'),
      '我把星布下的石车放回桌上。',
    ),
  ),
  pause1(
    '07_the_chariot',
    'reversed',
    '掌心里这张牌倒着，黑白狮身人面、星布和杖仍印着。你要先把哪一只转到朝上？',
    steps(
      action('black', 'engage', '先把黑色那只转上来', '我先把黑色的狮身人面转上来。'),
      action('stars', 'engage', '先看星布上的星星', '我先看头顶星布上那些星星。'),
      '我把倒着的石车和狮身人面放回桌上。',
    ),
  ),
  pause2(
    '07_the_chariot',
    'reversed',
    '牌仍倒在掌心，石车前还有一只黄蓝相间的小饰。你要怎么放这只还印着的小饰？',
    steps(
      action('mark', 'engage', '先看车前那只小饰', '我先看石车前那只黄蓝相间的饰。'),
      action('water', 'engage', '先看车后的河', '我先看石车后面的河。'),
      '我把倒着的星布和杖放回桌上。',
    ),
  ),
  pause1(
    '08_strength',
    'upright',
    '掌心里，一只手按在狮子张开的下颚上，另一只手扶着狮头，花环从肩上垂到狮身。你要先怎么放这只按着下颚的手？',
    steps(
      action('jaw', 'engage', '让手仍按在下颚上', '我让这只手仍按在狮子的下颚上。'),
      action('wreath', 'engage', '先看垂下的花环', '我先看从肩上垂下的花环。'),
      '我把狮子和花环放回桌上。',
    ),
  ),
  pause2(
    '08_strength',
    'upright',
    '掌心里狮子的嘴仍张着，花环和头顶的横八字都还在。你要怎么安放这只还扶着狮头的手？',
    steps(
      action('head', 'engage', '让手仍扶着狮头', '我让这只手仍扶在狮头上。'),
      action('eight', 'engage', '先看头顶的横八字', '我先看头顶那个横八字。'),
      '我把张着嘴的狮子放回桌上。',
    ),
  ),
  pause1(
    '08_strength',
    'reversed',
    '掌心里这张牌倒着，狮子、按着下颚的手和花环仍印着。你要先把狮口转到哪一边？',
    steps(
      action('jaw', 'engage', '先把张开的狮口转上来', '我先把张开的狮口转上来。'),
      action('hills', 'engage', '先看远处的山', '我先看狮子身后那些山。'),
      '我把倒着的狮子和花环放回桌上。',
    ),
  ),
  pause2(
    '08_strength',
    'reversed',
    '牌仍倒在掌心，白衣和花冠都还在狮子旁边。你要怎么放这只还印在下颚上的手？',
    steps(
      action('hand', 'engage', '先按住下颚上的手', '我先按住印在下颚上的那只手。'),
      action('crown', 'engage', '先看头上的花冠', '我先看头上那圈花。'),
      '我把倒着的下颚和花环放回桌上。',
    ),
  ),
  pause1(
    '09_the_hermit',
    'upright',
    '掌心里，斗篷里的人站在雪峰上，一只手提着亮着的灯，另一只手拄着杖，灯里是一颗星。你要先怎么放这盏还亮着的灯？',
    steps(
      action('lamp', 'engage', '先把灯留在身前', '我先把这盏亮着的灯留在身前。'),
      action('staff', 'engage', '先握住那根杖', '我先握住雪峰上那根杖。'),
      '我把灯和雪峰上的杖放回桌上。',
    ),
  ),
  pause2(
    '09_the_hermit',
    'upright',
    '掌心里灯仍亮着，杖还拄在雪上，远处是山。你要怎么安放这盏还提着的灯？',
    steps(
      action('star', 'engage', '先看灯里的那颗星', '我先看灯里那颗星。'),
      action('peak', 'engage', '先看脚下的雪峰', '我先看杖拄着的那座雪峰。'),
      '我把亮着的灯放回桌上。',
    ),
  ),
  pause1(
    '09_the_hermit',
    'reversed',
    '掌心里这张牌倒着，灯、杖、斗篷和雪峰仍印着。你要先把灯和杖哪一件转到朝上？',
    steps(
      action('lamp', 'engage', '先把灯转到朝上', '我先把这盏灯转到朝上。'),
      action('beard', 'engage', '先看斗篷里的胡子', '我先看斗篷里那把胡子。'),
      '我把倒着的灯和雪峰放回桌上。',
    ),
  ),
  pause2(
    '09_the_hermit',
    'reversed',
    '牌仍倒在掌心，灯里的星还亮着，杖还是那一根。你要怎么托住这根还印着的杖？',
    steps(
      action('staff', 'engage', '先托住这根杖', '我先托住雪峰上这根杖。'),
      action('range', 'engage', '先看远处的雪山', '我先看灯后面那些雪山。'),
      '我把倒着的斗篷和灯放回桌上。',
    ),
  ),
  pause1(
    '10_wheel_of_fortune',
    'upright',
    '掌心里立着一只轮，轮缘上有一条蛇和一只红兽，轮顶是持剑的狮身人面，四角各有一本摊开的书。你要先怎么放这只轮？',
    steps(
      action('rim', 'engage', '先扶住轮缘', '我先扶住这只轮的轮缘。'),
      action('book', 'engage', '先看其中一本摊开的书', '我先看四角里其中一本摊开的书。'),
      '我把这只轮和四本书放回桌上。',
    ),
  ),
  pause2(
    '10_wheel_of_fortune',
    'upright',
    '掌心里轮还立着，蛇、红兽和轮顶的剑都还在。你要怎么安放轮顶这只还持着剑的狮身人面？',
    steps(
      action('sword', 'engage', '先看轮顶那把剑', '我先看轮顶狮身人面持着的那把剑。'),
      action('pair', 'engage', '先看轮下的牛和狮', '我先看轮下方那只带翅膀的牛和狮。'),
      '我把蛇、红兽和轮放回桌上。',
    ),
  ),
  pause1(
    '10_wheel_of_fortune',
    'reversed',
    '掌心里这张牌倒着，轮、蛇、红兽和四本书仍印着。你要先把轮的哪一缘转到朝上？',
    steps(
      action('top', 'engage', '先把持剑的那一缘转上来', '我先把持剑的狮身人面转到朝上。'),
      action('eagle', 'engage', '先看角上的鹰', '我先看其中一角那只鹰。'),
      '我把倒着的轮和书放回桌上。',
    ),
  ),
  pause2(
    '10_wheel_of_fortune',
    'reversed',
    '牌仍倒在掌心，轮上的字母和辐条都还看得见。你要怎么放这条还绕在轮上的蛇？',
    steps(
      action('snake', 'engage', '先按住这条蛇', '我先按住绕在轮缘上的这条蛇。'),
      action('beast', 'engage', '先看爬在轮上的红兽', '我先看爬在轮缘上的那只红兽。'),
      '我把倒着的蛇和红兽放回桌上。',
    ),
  ),
  pause1(
    '11_justice',
    'upright',
    '掌心里，一个人坐在两根石柱之间，一只手竖着剑，另一只手提着两边都悬着的天平，身后是紫帷幕。你要先怎么放这架还悬着的天平？',
    steps(
      action('scales', 'engage', '让天平仍悬在手里', '我让这架天平仍悬在手里。'),
      action('sword', 'engage', '让剑仍竖着', '我让这把剑仍竖在另一只手里。'),
      '我把剑和天平放回桌上。',
    ),
  ),
  pause2(
    '11_justice',
    'upright',
    '掌心里天平的两个盘仍悬着，剑和紫帷幕都还在。你要怎么安放这把还竖着的剑？',
    steps(
      action('blade', 'engage', '先看剑刃朝上的一端', '我先看这把剑刃朝上的一端。'),
      action('pillars', 'engage', '先看两边的石柱', '我先看座两边的两根石柱。'),
      '我把紫帷幕前的天平放回桌上。',
    ),
  ),
  pause1(
    '11_justice',
    'reversed',
    '掌心里这张牌倒着，剑、天平和两根石柱仍印着。你要先把剑尖转到哪一边？',
    steps(
      action('point', 'engage', '先把剑尖转到朝上', '我先把剑尖转到朝上。'),
      action('crown', 'engage', '先看头上的冠', '我先看头上那顶冠。'),
      '我把倒着的天平放回桌上。',
    ),
  ),
  pause2(
    '11_justice',
    'reversed',
    '牌仍倒在掌心，两个秤盘还用链子吊着。你要怎么放这两个还吊着的秤盘？',
    steps(
      action('pans', 'engage', '先托住两个秤盘', '我先托住这两个吊着的秤盘。'),
      action('square', 'engage', '先看胸前那块方饰', '我先看胸前那块方饰。'),
      '我把倒着的剑和秤盘放回桌上。',
    ),
  ),
  pause1(
    '12_the_hanged_man',
    'upright',
    '掌心里，一个人被绳子倒吊在树上，一只脚踝系着，另一条腿交叉，头上有一圈光。你要先怎么放这根系着脚踝的绳？',
    steps(
      action('rope', 'engage', '先看系在脚踝上的绳', '我先看系在脚踝上的那根绳。'),
      action('halo', 'engage', '先看头上的光圈', '我先看头上那圈光。'),
      '我把倒吊的人和树放回桌上。',
    ),
  ),
  pause2(
    '12_the_hanged_man',
    'upright',
    '掌心里那个人仍倒吊着，树上的叶子和光圈都还在。你要怎么安放这只还交叉着的腿？',
    steps(
      action('leg', 'engage', '先看交叉的那条腿', '我先看没有被绳子系住的那条腿。'),
      action('leaf', 'engage', '先看横枝上的叶子', '我先看横枝上那些叶子。'),
      '我把系着脚踝的绳放回桌上。',
    ),
  ),
  pause1(
    '12_the_hanged_man',
    'reversed',
    '掌心里这张牌倒着，倒吊的人、绳子、树和光圈仍印着。你要先把头上的光圈转到哪一边？',
    steps(
      action('halo', 'engage', '先把光圈转到朝上', '我先把头上的光圈转到朝上。'),
      action('trunk', 'engage', '先看长着叶子的树干', '我先看长着叶子的那根树干。'),
      '我把倒着的绳子和光圈放回桌上。',
    ),
  ),
  pause2(
    '12_the_hanged_man',
    'reversed',
    '牌仍倒在掌心，脚踝上的绳结还系在横枝上。你要怎么放这个还印着的绳结？',
    steps(
      action('knot', 'engage', '先按住这个绳结', '我先按住脚踝上这个绳结。'),
      action('leaves', 'engage', '先看树干上的叶子', '我先看树干上那些叶子。'),
      '我把倒着的树和倒吊的人放回桌上。',
    ),
  ),
  pause1(
    '13_death',
    'upright',
    '掌心里，白马上的人举着一面黑旗，旗上是一朵白花；地上躺着一个还戴着冠的人，旁边有跪着的人和一个孩子。你要先怎么放这面还举着的旗？',
    steps(
      action('flag', 'engage', '先看旗上的白花', '我先看黑旗上那朵白花。'),
      action('crown', 'engage', '先看地上那顶还戴着的冠', '我先看躺着的人头上那顶冠。'),
      '我把黑旗和地上的冠放回桌上。',
    ),
  ),
  pause2(
    '13_death',
    'upright',
    '掌心里黑旗仍举着，白马、船和两座塔之间的太阳都还在。你要怎么安放这朵还印在旗上的白花？',
    steps(
      action('rose', 'engage', '让白花仍留在旗上', '我让这朵白花仍留在黑旗上。'),
      action('child', 'engage', '先看马前的孩子', '我先看白马前那个孩子。'),
      '我把白马和黑旗放回桌上。',
    ),
  ),
  pause1(
    '13_death',
    'reversed',
    '掌心里这张牌倒着，黑旗、白马、冠和太阳仍印着。你要先把旗上的白花转到哪一边？',
    steps(
      action('flower', 'engage', '先把旗上的白花转上来', '我先把旗上那朵白花转上来。'),
      action('boat', 'engage', '先看水上的船', '我先看远处水上那条船。'),
      '我把倒着的黑旗放回桌上。',
    ),
  ),
  pause2(
    '13_death',
    'reversed',
    '牌仍倒在掌心，躺着的人还戴着冠，白马的蹄还抬着。你要怎么放这顶还戴在头上的冠？',
    steps(
      action('crown', 'engage', '先按住这顶冠', '我先按住躺着的人头上这顶冠。'),
      action('mitre', 'engage', '先看旁边那顶高冠', '我先看旁边那个人头上的高冠。'),
      '我把倒着的白马和冠放回桌上。',
    ),
  ),
  pause1(
    '14_temperance',
    'upright',
    '掌心里，长着红翅膀的人一只脚在水里、一只脚在岸上，两只金杯之间有一道水，旁边是鸢尾和一条小路。你要先怎么放这两只还在倒水的杯？',
    steps(
      action('pour', 'engage', '让水仍在两杯之间', '我让这道水仍留在两只金杯之间。'),
      action('path', 'engage', '先看岸边的小路', '我先看通向太阳的那条小路。'),
      '我把两只金杯和红翅膀放回桌上。',
    ),
  ),
  pause2(
    '14_temperance',
    'upright',
    '掌心里那道水仍从一只杯倒向另一只，鸢尾和太阳都还在。你要怎么安放这只还踩在水里的脚？',
    steps(
      action('foot', 'engage', '先看踩在水里的脚', '我先看踩进水里的那只脚。'),
      action('iris', 'engage', '先看水边的鸢尾', '我先看水边那些鸢尾。'),
      '我把还在倒水的两只杯放回桌上。',
    ),
  ),
  pause1(
    '14_temperance',
    'reversed',
    '掌心里这张牌倒着，红翅膀、两只金杯和一道水仍印着。你要先把哪一只杯转到朝上？',
    steps(
      action('cup', 'engage', '先把倾着的那只杯转上来', '我先把倾着倒水的那只杯转上来。'),
      action('sun', 'engage', '先看路尽头的太阳', '我先看小路尽头那轮太阳。'),
      '我把倒着的金杯和鸢尾放回桌上。',
    ),
  ),
  pause2(
    '14_temperance',
    'reversed',
    '牌仍倒在掌心，一只脚还在水里，一只脚还在岸上。你要怎么放这两只还印着的脚？',
    steps(
      action('water', 'engage', '先托住水里的那只脚', '我先托住踩在水里的那只脚。'),
      action('land', 'engage', '再看岸上的那只脚', '我再看踩在岸上的那只脚。'),
      '我把倒着的红翅膀放回桌上。',
    ),
  ),
  pause1(
    '15_the_devil',
    'upright',
    '掌心里，两个人颈上的链是松的，链连着中间的黑座，座上的人举着火把，额头有一颗五角星。你要先怎么放这根还松着的链？',
    steps(
      action('chain', 'engage', '先摸到这根松链', '我先摸到这两个人颈上的松链。'),
      action('torch', 'engage', '先看举起的火把', '我先看座上举起的那把火。'),
      '我把松链和火把放回桌上。',
    ),
  ),
  pause2(
    '15_the_devil',
    'upright',
    '掌心里链仍松松地套在颈上，翅膀和火把都还在。你要怎么安放这根还连着黑座的链？',
    steps(
      action('link', 'engage', '指出链上松着的那一环', '我指出这根链上松着的那一环。'),
      action('cube', 'engage', '先看链连着的黑座', '我先看链子连着的那座黑座。'),
      '我把黑座和松链放回桌上。',
    ),
  ),
  pause1(
    '15_the_devil',
    'reversed',
    '掌心里这张牌倒着，松链、火把、翅膀和黑座仍印着。你要先把火把转到哪一边？',
    steps(
      action('torch', 'engage', '先把火把转到朝上', '我先把举起的火把转到朝上。'),
      action('tails', 'engage', '先看两个人身后的尾巴', '我先看两个人身后的尾巴。'),
      '我把倒着的松链放回桌上。',
    ),
  ),
  pause2(
    '15_the_devil',
    'reversed',
    '牌仍倒在掌心，两个人还站在黑座两边，链还是松的。你要怎么放这根还印着的松链？',
    steps(
      action('chain', 'engage', '先按住这根松链', '我先按住颈上这根松链。'),
      action('horns', 'engage', '先看座上的角', '我先看座上那对弯角。'),
      '我把倒着的火把和黑座放回桌上。',
    ),
  ),
  pause1(
    '16_the_tower',
    'upright',
    '掌心里，闪电打在塔顶，一顶冠正在落下，两个人从塔上掉下来，窗口里有火。你要先怎么放这顶还在落下的冠？',
    steps(
      action('crown', 'engage', '先看正在落下的冠', '我先看塔顶旁边这顶正在落下的冠。'),
      action('bolt', 'engage', '先看打在塔上的闪电', '我先看打在塔顶的那道闪电。'),
      '我把落下的冠和塔放回桌上。',
    ),
  ),
  pause2(
    '16_the_tower',
    'upright',
    '掌心里冠仍离着塔顶，两个人还在往下掉，窗口的火还在。你要怎么安放这两个还掉着的人？',
    steps(
      action('people', 'engage', '先看掉在塔两侧的人', '我先看掉在塔两侧的两个人。'),
      action('flame', 'engage', '先看窗口里的火', '我先看塔窗里的火。'),
      '我把闪电和落下的冠放回桌上。',
    ),
  ),
  pause1(
    '16_the_tower',
    'reversed',
    '掌心里这张牌倒着，闪电、落下的冠、两个人和火仍印着。你要先把冠转到哪一边？',
    steps(
      action('crown', 'engage', '先把这顶冠转上来', '我先把正在落下的冠转上来。'),
      action('rocks', 'engage', '先看塔下的山石', '我先看塔下那些山石。'),
      '我把倒着的塔和冠放回桌上。',
    ),
  ),
  pause2(
    '16_the_tower',
    'reversed',
    '牌仍倒在掌心，塔身的窗还亮着火。你要怎么放这道还印着的闪电？',
    steps(
      action('bolt', 'engage', '先按住这道闪电', '我先按住打向塔顶的闪电。'),
      action('sparks', 'engage', '先看塔周围的火焰点子', '我先看散在塔周围的火焰点子。'),
      '我把倒着的闪电和两个人放回桌上。',
    ),
  ),
  pause1(
    '17_the_star',
    'upright',
    '掌心里，一个人跪着，两只壶在倒水，一股流向池，一股流向地上的小溪，树上有一只鸟，天上有一颗大星。你要先怎么放这两只还在倒水的壶？',
    steps(
      action('pool', 'engage', '先看倒进池里的那一股', '我先看倒进池里的那一股水。'),
      action('stream', 'engage', '先看倒在地上的那一股', '我先看倒在地上、汇成小溪的那一股。'),
      '我把两只壶和大星放回桌上。',
    ),
  ),
  pause2(
    '17_the_star',
    'upright',
    '掌心里两只壶仍在倒，大星、小鸟和池水都还在。你要怎么安放这只还踩在池里的脚？',
    steps(
      action('foot', 'engage', '先看踩在池里的脚', '我先看踩进池水的那只脚。'),
      action('bird', 'engage', '先看树上的鸟', '我先看树枝上那只鸟。'),
      '我把倒水的两只壶放回桌上。',
    ),
  ),
  pause1(
    '17_the_star',
    'reversed',
    '掌心里这张牌倒着，两只壶、大星、鸟和小溪仍印着。你要先把哪一只壶转到朝上？',
    steps(
      action('pool', 'engage', '先把倒向池的壶转上来', '我先把倒向池里的那只壶转上来。'),
      action('land', 'engage', '先把倒向地的壶转上来', '我先把倒向地上的那只壶转上来。'),
      '我把倒着的两只壶放回桌上。',
    ),
  ),
  pause2(
    '17_the_star',
    'reversed',
    '牌仍倒在掌心，天上的大星旁边还有较小的星。你要怎么放这颗还印着的大星？',
    steps(
      action('star', 'engage', '先托住这颗大星', '我先托住天上这颗大星。'),
      action('tree', 'engage', '先看停着鸟的树', '我先看停着鸟的那棵树。'),
      '我把倒着的大星和小溪放回桌上。',
    ),
  ),
  pause1(
    '18_the_moon',
    'upright',
    '掌心里，两座塔中间有一条弯路，路两边是一只狼和一只狗，水里爬着一只虾，月亮的脸在滴水。你要先怎么走这截印在两塔之间的路？',
    steps(
      action('path', 'engage', '先沿弯路看两座塔', '我先沿着两座塔之间的弯路看。'),
      action('cray', 'engage', '先看水里的虾', '我先看水边这只虾。'),
      '我把弯路和两座塔放回桌上。',
    ),
  ),
  pause2(
    '18_the_moon',
    'upright',
    '掌心里弯路仍夹在两座塔中间，狼、狗和滴水的月亮都还在。你要怎么安放这只还在滴水的月亮？',
    steps(
      action('face', 'engage', '先看月亮上的脸', '我先看月亮上那张脸。'),
      action('wolf', 'engage', '先看抬头的狼', '我先看弯路一边抬头的那只狼。'),
      '我把滴水的月亮和虾放回桌上。',
    ),
  ),
  pause1(
    '18_the_moon',
    'reversed',
    '掌心里这张牌倒着，两座塔、弯路、狼、狗和虾仍印着。你要先把月亮转到哪一边？',
    steps(
      action('moon', 'engage', '先把滴水的月亮转上来', '我先把这张滴水的月亮转上来。'),
      action('dog', 'engage', '先看路另一边的狗', '我先看弯路另一边那只狗。'),
      '我把倒着的两座塔放回桌上。',
    ),
  ),
  pause2(
    '18_the_moon',
    'reversed',
    '牌仍倒在掌心，虾还在水里，水滴还挂在月亮下面。你要怎么放这只还印着的虾？',
    steps(
      action('cray', 'engage', '先托住这只虾', '我先托住水里这只虾。'),
      action('towers', 'engage', '先看两座石塔', '我先看路两边的两座石塔。'),
      '我把倒着的虾和弯路放回桌上。',
    ),
  ),
  pause1(
    '19_the_sun',
    'upright',
    '掌心里，孩子骑在白马上，矮墙后有向日葵，旁边立着一面大红旗，天上是一张有脸的太阳。你要先怎么放这面还立着的红旗？',
    steps(
      action('flag', 'engage', '先看这面大红旗', '我先看立在白马旁边的大红旗。'),
      action('flowers', 'engage', '先看墙后的向日葵', '我先看矮墙后的向日葵。'),
      '我把红旗和向日葵放回桌上。',
    ),
  ),
  pause2(
    '19_the_sun',
    'upright',
    '掌心里孩子仍骑在白马上，红旗和有脸的太阳都还在。你要怎么安放这匹还抬着蹄的白马？',
    steps(
      action('horse', 'engage', '先看白马抬起的蹄', '我先看白马抬起的那只蹄。'),
      action('sun', 'engage', '先看太阳上的脸', '我先看天上太阳的那张脸。'),
      '我把白马和孩子放回桌上。',
    ),
  ),
  pause1(
    '19_the_sun',
    'reversed',
    '掌心里这张牌倒着，白马、孩子、向日葵和红旗仍印着。你要先把太阳的脸转到哪一边？',
    steps(
      action('face', 'engage', '先把太阳的脸转上来', '我先把太阳的脸转上来。'),
      action('wall', 'engage', '先看矮墙后的花', '我先看矮墙后面的向日葵。'),
      '我把倒着的红旗放回桌上。',
    ),
  ),
  pause2(
    '19_the_sun',
    'reversed',
    '牌仍倒在掌心，孩子的一只手还扬着，另一只手还扶着马。你要怎么放这面还立在杆上的红旗？',
    steps(
      action('banner', 'engage', '先按住这面红旗', '我先按住杆上这面大红旗。'),
      action('wreath', 'engage', '先看孩子头上的花冠', '我先看孩子头上那圈花。'),
      '我把倒着的白马和太阳放回桌上。',
    ),
  ),
  pause1(
    '20_judgement',
    'upright',
    '掌心里，云上的人吹着号角，号角上挂着一面带十字的旗；水里有三只棺，棺里的人举着手。你要先怎么回应这些举着的手？',
    steps(
      action('arms', 'engage', '先看棺里举起的手', '我先看三只棺里举起的手。'),
      action('horn', 'engage', '先看正在吹的号角', '我先看云上正在吹的号角。'),
      '我把号角和三只棺放回桌上。',
    ),
  ),
  pause2(
    '20_judgement',
    'upright',
    '掌心里号角仍对着水面，三只棺里的手还举着。你要怎么安放这面还挂在号角上的旗？',
    steps(
      action('flag', 'engage', '先看旗上的十字', '我先看号角上那面旗的十字。'),
      action('child', 'engage', '先看中间那只较小的棺', '我先看水里中间那只较小的棺。'),
      '我把举着的手和号角放回桌上。',
    ),
  ),
  pause1(
    '20_judgement',
    'reversed',
    '掌心里这张牌倒着，号角、十字旗和三只棺仍印着。你要先把号角转到哪一边？',
    steps(
      action('horn', 'engage', '先把号角转到朝上', '我先把这支号角转到朝上。'),
      action('hills', 'engage', '先看水后的山', '我先看水面后面那些山。'),
      '我把倒着的三只棺放回桌上。',
    ),
  ),
  pause2(
    '20_judgement',
    'reversed',
    '牌仍倒在掌心，棺里的手还张着，红翅膀还在云上。你要怎么放这些还印着的手？',
    steps(
      action('hands', 'engage', '先按住其中一只举起的手', '我先按住其中一只举起的手。'),
      action('wings', 'engage', '先看云上的红翅膀', '我先看云上那对红翅膀。'),
      '我把倒着的号角和十字旗放回桌上。',
    ),
  ),
  pause1(
    '21_the_world',
    'upright',
    '掌心里，花环中央的人两手各持一根短杖，紫带绕在身上，花环上下各有一个红结。你要先怎么放这个还圆着的花环？',
    steps(
      action('wreath', 'engage', '先沿花环看一圈', '我先沿着这个花环看一圈。'),
      action('wands', 'engage', '先看两手里的短杖', '我先看两手里各一根短杖。'),
      '我把花环和两根短杖放回桌上。',
    ),
  ),
  pause2(
    '21_the_world',
    'upright',
    '掌心里花环仍圆着，四角是天使、鹰、牛和狮，红结还系着。你要怎么安放花环上方这个还印着的红结？',
    steps(
      action('bow', 'engage', '先看花环上方的红结', '我先看花环上方那个红结。'),
      action('eagle', 'engage', '先看花环外的鹰', '我先看花环外那只鹰。'),
      '我把红结和花环放回桌上。',
    ),
  ),
  pause1(
    '21_the_world',
    'reversed',
    '掌心里这张牌倒着，花环、短杖、紫带和四角的脸仍印着。你要先把哪个红结转到朝上？',
    steps(
      action('bow', 'engage', '先把其中一个红结转上来', '我先把其中一个红结转上来。'),
      action('bull', 'engage', '先看云里的牛', '我先看云里那只牛。'),
      '我把倒着的花环放回桌上。',
    ),
  ),
  pause2(
    '21_the_world',
    'reversed',
    '牌仍倒在掌心，两根短杖还分别握在两只手里。你要怎么放这两根还印着的短杖？',
    steps(
      action('wands', 'engage', '先托住两根短杖', '我先托住这两根短杖。'),
      action('lion', 'engage', '先看云里的狮', '我先看云里那只狮。'),
      '我把倒着的短杖和紫带放回桌上。',
    ),
  ),
];
