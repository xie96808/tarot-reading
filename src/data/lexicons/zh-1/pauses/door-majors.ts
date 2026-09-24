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

// The picture question stays fixed. Only the required prefix changes, so pause 2 cannot grow a second action set.
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

export const DOOR_MAJOR_OFFERS: readonly PauseOffer[] = [
  pause1(
    '00_the_fool',
    'upright',
    '门缝里，一只脚抬向崖边，白花和小包行李还在身边。你要先怎么迈出这一步？',
    steps(
      action('step', 'engage', '先把脚迈向崖边', '我先把这只脚迈向门缝外的崖边。'),
      action('pack', 'engage', '先把行李再留一点', '我先把身边的行李再留一点在门槛内。'),
      '我先把门带上，抬向崖边的那只脚留在门外。',
    ),
  ),
  pause2(
    '00_the_fool',
    'upright',
    '门缝里那只脚仍悬在崖边，白花还捏着。你要怎么安放这只还没落地的脚？',
    steps(
      action('near', 'engage', '让脚再靠近崖边', '我让这只脚再靠近崖边一点。'),
      action('rose', 'engage', '先把白花带进门', '我先把那朵白花带进门，脚仍停在崖边这边。'),
      '我先把门带上，悬在崖边的脚留在门外。',
    ),
  ),
  pause1(
    '00_the_fool',
    'reversed',
    '门缝里，迈向崖边的那只脚收了回来，停在半空。你要怎么放这只停住的脚？',
    steps(
      action('plant', 'engage', '先把脚踏回门槛', '我先把收回来的脚踏回门槛上。'),
      action('eyes', 'engage', '先睁眼看清崖边', '我先睁眼看清崖边，不把这一跳交给别人去接。'),
      '我先把门带上，停在半空的脚留在门外。',
    ),
  ),
  pause2(
    '00_the_fool',
    'reversed',
    '崖边还在门缝外，那只脚却不再往前。你要怎么对待这只收住的脚？',
    steps(
      action('stone', 'engage', '把脚放稳在门槛上', '我把这只收住的脚放稳在门槛上。'),
      action('tie', 'engage', '先系紧那小包行李', '我先系紧身边那小包行李，脚先不迈出。'),
      '我先把门带上，收住的脚留在门外。',
    ),
  ),
  pause1(
    '01_the_magician',
    'upright',
    '门缝里摊着一张桌子，杖、杯、剑和币都摆齐了。你要先怎么动这些已经在场的工具？',
    steps(
      action('wand', 'engage', '先拿起桌上的杖', '我先拿起桌上那根杖，对准一件已经在场的事。'),
      action('cup', 'engage', '先只碰那只杯', '我先只碰桌上那只杯，其余三件留在原处。'),
      '我先把门带上，桌上的四件工具留在门外。',
    ),
  ),
  pause2(
    '01_the_magician',
    'upright',
    '门缝里那张桌子还摊着，四件工具一件都没被收走。你要怎么用其中一件？',
    steps(
      action('turn', 'engage', '把四件转到同一边', '我把杖、杯、剑和币转到同一边。'),
      action('one', 'engage', '只拿起一件来用', '我只拿起桌上的一件来用。'),
      '我先把门带上，没被收走的工具留在门外。',
    ),
  ),
  pause1(
    '01_the_magician',
    'reversed',
    '门缝里，桌上的工具散成好几处，手没有落在任何一件上。你要怎么把这一桌收回来？',
    steps(
      action('gather', 'engage', '先把工具拢回桌上', '我先把散开的工具拢回同一张桌子。'),
      action('keep', 'engage', '只留下一件还拿得住的', '我只留下一件还拿得住的，其余开口先合上。'),
      '我先把门带上，散开的工具留在门外。',
    ),
  ),
  pause2(
    '01_the_magician',
    'reversed',
    '那些工具仍散在门缝里的桌上，没有一件被做完。你要怎么收这个开口？',
    steps(
      action('close', 'engage', '先合上多余的开口', '我先合上桌上多余的开口。'),
      action('point', 'engage', '把杖尖重新对准一件', '我把杖尖重新对准一件还在桌上的事。'),
      '我先把门带上，没做完的那一桌留在门外。',
    ),
  ),
  pause1(
    '02_the_high_priestess',
    'upright',
    '门缝里垂着一层没拉开的帷幕，卷轴搁在膝上。你要怎么靠近这层布？',
    steps(
      action('stay', 'engage', '先停在帷幕这边', '我先停在帷幕这边，不把卷轴上的字念给门外。'),
      action('lift', 'engage', '把帷幕掀开一线', '我把帷幕掀开一线，只看自己此刻能承认的那一点。'),
      '我先把门带上，没拉开的帷幕留在门外。',
    ),
  ),
  pause2(
    '02_the_high_priestess',
    'upright',
    '门缝里的帷幕仍垂着，膝上的卷轴也还合着。你要怎么对待这层还没拉开的布？',
    steps(
      action('sit', 'engage', '先在帷幕前坐一会儿', '我先在帷幕前坐一会儿。'),
      action('scroll', 'engage', '把卷轴留在自己这边', '我把卷轴留在自己这边，帷幕先不全拉开。'),
      '我先把门带上，合着的卷轴留在门外。',
    ),
  ),
  pause1(
    '02_the_high_priestess',
    'reversed',
    '门缝里，帷幕被拉严，外面的声响盖住了布后的安静。你要怎么对待这层拉严的布？',
    steps(
      action('quiet', 'engage', '先把声响挡在布外', '我先把盖住帷幕的声响挡在布外。'),
      action('seam', 'engage', '从缝里听已经出现的那一声', '我从帷幕的缝里听已经出现过的那一声。'),
      '我先把门带上，拉严的帷幕留在门外。',
    ),
  ),
  pause2(
    '02_the_high_priestess',
    'reversed',
    '那层帷幕仍闭在门缝里，没有被掀开。你要怎么靠近这层闭着的布？',
    steps(
      action('shut', 'engage', '让帷幕先保持闭上', '我让这层帷幕先保持闭上。'),
      action('keep', 'engage', '把那一句留在布后', '我把被盖住的那一句先留在布后，不整段交出去。'),
      '我先把门带上，闭着的帷幕留在门外。',
    ),
  ),
  pause1(
    '03_the_empress',
    'upright',
    '门缝里是一片还在长的麦穗，穗子没有被割。你要怎么照料这片麦？',
    steps(
      action('water', 'engage', '先给麦穗浇一次水', '我先给这片麦穗浇一次水。'),
      action('space', 'engage', '给正在长的麦留出空', '我给正在长的麦留出一块空，今天不收割。'),
      '我先把门带上，没被割的麦穗留在门外。',
    ),
  ),
  pause2(
    '03_the_empress',
    'upright',
    '门缝里的麦穗又高出一截，园地还开着。你要怎么继续照料它？',
    steps(
      action('prop', 'engage', '扶住倒向门边的麦', '我扶住倒向门边的那一束麦。'),
      action('sit', 'engage', '在麦边坐下看长势', '我在麦边坐下，看它自己还在长。'),
      '我先把门带上，高出一截的麦穗留在门外。',
    ),
  ),
  pause1(
    '03_the_empress',
    'reversed',
    '门缝里的麦穗发黄，园地薄了。你要怎么对待这片缺照料的麦？',
    steps(
      action('slow', 'engage', '先停下催熟', '我先停下催熟，让发黄的麦穗慢一点。'),
      action('body', 'engage', '先回到身体的节奏', '我先回到自己的身体节奏，不把园地再榨出一茬。'),
      '我先把门带上，发黄的麦穗留在门外。',
    ),
  ),
  pause2(
    '03_the_empress',
    'reversed',
    '那片发黄的麦仍在门缝里，没有被重新浇过。你要怎么待这片缺水的麦？',
    steps(
      action('sip', 'engage', '先浇一小口水', '我先给发黄的麦穗浇一小口水。'),
      action('sickle', 'engage', '先把镰刀放下', '我先把催熟的镰刀放在门槛外。'),
      '我先把门带上，缺水的麦穗留在门外。',
    ),
  ),
  pause1(
    '04_the_emperor',
    'upright',
    '门缝里是一把石座，扶手上的羊头对着门口。你要怎么坐这把座位？',
    steps(
      action('sit', 'engage', '先坐上这把石座', '我先坐上这把石座。'),
      action('mark', 'engage', '在座前划出一条边界', '我在石座前划出一条边界。'),
      '我先把门带上，那把石座留在门外。',
    ),
  ),
  pause2(
    '04_the_emperor',
    'upright',
    '门缝里的石座还空着，羊头仍对着门口。你要怎么安放这把座位？',
    steps(
      action('rule', 'engage', '把一条规矩放上石座', '我把一条能执行的规矩放上石座。'),
      action('stand', 'engage', '站在石座旁边', '我站在石座旁边，不拿它去压人。'),
      '我先把门带上，空着的石座留在门外。',
    ),
  ),
  pause1(
    '04_the_emperor',
    'reversed',
    '门缝里的石座还在，座面硬得像一层壳。你要怎么对待这把变硬的座位？',
    steps(
      action('loose', 'engage', '先从硬座上松一松', '我先从这把硬座上松一松。'),
      action('edge', 'engage', '给被挡住的人留出座边', '我给被这把石座挡住的人留出座边。'),
      '我先把门带上，变硬的石座留在门外。',
    ),
  ),
  pause2(
    '04_the_emperor',
    'reversed',
    '那把石座仍硬在门缝里，没有人把它坐软。你要怎么动这把硬座？',
    steps(
      action('perch', 'engage', '只坐石座的边', '我只坐这把石座的边。'),
      action('pare', 'engage', '把多余的硬壳削掉一点', '我把石座上多余的那层硬壳削掉一点。'),
      '我先把门带上，没被坐软的石座留在门外。',
    ),
  ),
  pause1(
    '05_the_hierophant',
    'upright',
    '门缝里，两个人跪在持钥匙的人面前。你要怎么对待这两个还跪着的人？',
    steps(
      action('keys', 'engage', '先看那两把交叉的钥匙', '我先看清那两把交叉的钥匙。'),
      action('listen', 'engage', '在两个人旁边停下来听', '我在那两个人旁边停下来听这套形式。'),
      '我先把门带上，跪着的两个人留在门外。',
    ),
  ),
  pause2(
    '05_the_hierophant',
    'upright',
    '门缝里那两个人还跪着，钥匙仍交叉在手里。你要怎么使用这套还在的形式？',
    steps(
      action('keep', 'engage', '只留下还托得住的规矩', '我只留下还托得住的规矩。'),
      action('give', 'engage', '把钥匙递给跪着的人', '我把还能用的那把钥匙递给跪着的人。'),
      '我先把门带上，交叉的钥匙留在门外。',
    ),
  ),
  pause1(
    '05_the_hierophant',
    'reversed',
    '门缝里，两个人仍跪着，面前的规矩却空了。你要怎么对待这套空掉的形式？',
    steps(
      action('rise', 'engage', '请两个人先站起来', '我请门缝里的两个人先站起来。'),
      action('split', 'engage', '把空壳和钥匙分开', '我把空了的形式和还拿着的钥匙分开。'),
      '我先把门带上，空掉的规矩留在门外。',
    ),
  ),
  pause2(
    '05_the_hierophant',
    'reversed',
    '那两个人仍跪在门缝里的空规矩前。你要怎么挪动他们？',
    steps(
      action('step', 'engage', '让其中一个人离开台阶', '我让其中一个人先离开台阶。'),
      action('key', 'engage', '把不再适用的钥匙放下', '我把不再适用的那把钥匙放回台阶。'),
      '我先把门带上，空规矩前的两个人留在门外。',
    ),
  ),
  pause1(
    '06_the_lovers',
    'upright',
    '门缝里站着两个人，脚前分成两条路。你要怎么走这道还没选定的岔？',
    steps(
      action('road', 'engage', '先走上其中一条路', '我先走上其中一条路。'),
      action('side', 'engage', '把身体放到选定的一边', '我把身体放到选定的那一边，另一条留在路口。'),
      '我先把门带上，岔开的两条路留在门外。',
    ),
  ),
  pause2(
    '06_the_lovers',
    'upright',
    '门缝里的两条路还分着，那两个人还站在路口。你要怎么对待这个还站着的路口？',
    steps(
      action('foot', 'engage', '把脚放到其中一条路上', '我把脚放到其中一条路上。'),
      action('look', 'engage', '先看清两条路各自通向哪', '我先看清两条路各自通向哪。'),
      '我先把门带上，还没选定的路口留在门外。',
    ),
  ),
  pause1(
    '06_the_lovers',
    'reversed',
    '门缝里两条路都亮着，两个人的脚停在中间。你要怎么对待这双还没落地的脚？',
    steps(
      action('off', 'engage', '先把一只脚从一条路上拿开', '我先把一只脚从其中一条路上拿开。'),
      action('one', 'engage', '只留一条还亮的路', '我只留一条还亮的路在门口。'),
      '我先把门带上，停在中间的两条路留在门外。',
    ),
  ),
  pause2(
    '06_the_lovers',
    'reversed',
    '那两个人仍站在门缝里的两条路中间。你要怎么对待还停在中间的这双脚？',
    steps(
      action('land', 'engage', '让脚落到其中一条路上', '我让脚落到其中一条路上。'),
      action('say', 'engage', '先在路口说出站哪一边', '我先在路口说出自己站的那一边。'),
      '我先把门带上，停在中间的人留在门外。',
    ),
  ),
  pause1(
    '07_the_chariot',
    'upright',
    '门缝里，一黑一白两只兽拉着同一辆车。你要怎么对待这两只兽？',
    steps(
      action('reins', 'engage', '把缰绳收到同一边', '我把两只兽的缰绳收到同一边。'),
      action('face', 'engage', '让两只兽朝向同一边', '我让一黑一白两只兽的脸朝向同一边。'),
      '我先把门带上，两只兽和车留在门外。',
    ),
  ),
  pause2(
    '07_the_chariot',
    'upright',
    '门缝里那两只兽还并排着，车轮还没过门槛。你要怎么驾这一步？',
    steps(
      action('roll', 'engage', '让车先滚过门槛', '我让这辆车先滚过门槛。'),
      action('which', 'engage', '先看清哪只兽在往回拉', '我先看清哪只兽在往回拉。'),
      '我先把门带上，还没过门槛的车留在门外。',
    ),
  ),
  pause1(
    '07_the_chariot',
    'reversed',
    '门缝里，两只兽往相反的方向扯，车轮在门槛上磨。你要怎么对待这辆还在原地的车？',
    steps(
      action('whip', 'engage', '先放下再加的那一鞭', '我先放下再加的那一鞭。'),
      action('still', 'engage', '让车先停稳', '我让车先停稳，看哪一只兽把方向带偏。'),
      '我先把门带上，磨着的车轮留在门外。',
    ),
  ),
  pause2(
    '07_the_chariot',
    'reversed',
    '两只兽仍在门缝里对拉，轮子没有转出去。你要怎么对待这两只还在对拉的兽？',
    steps(
      action('slack', 'engage', '先松开拉偏的那侧缰', '我先松开把车拉偏的那一侧缰绳。'),
      action('see', 'engage', '看清黑白两只兽各自朝哪', '我看清黑白两只兽各自朝哪。'),
      '我先把门带上，对拉的两只兽留在门外。',
    ),
  ),
  pause1(
    '08_strength',
    'upright',
    '门缝里，狮子的下颚被轻轻托着，嘴还张着。你要怎么对待这张嘴？',
    steps(
      action('jaw', 'engage', '轻轻按住狮子的下颚', '我轻轻按住狮子的下颚。'),
      action('wait', 'engage', '在狮口边再停一会儿', '我在狮口边再停一会儿，不把狮子打倒。'),
      '我先把门带上，张着的狮口留在门外。',
    ),
  ),
  pause2(
    '08_strength',
    'upright',
    '门缝里狮子的下颚仍被托着。你要怎么继续对待这张嘴？',
    steps(
      action('gap', 'engage', '让狮口留一条缝', '我让狮口留一条缝，力道还在。'),
      action('patience', 'engage', '用耐心按住下颚', '我用耐心按住狮子的下颚，不跟它硬碰。'),
      '我先把门带上，被托着的下颚留在门外。',
    ),
  ),
  pause1(
    '08_strength',
    'reversed',
    '门缝里，按着狮口的力气松了，或按得太死。你要怎么把这股力放回下颚？',
    steps(
      action('ease', 'engage', '把按死的力气松开一点', '我把按死狮口的力气松开一点。'),
      action('hold', 'engage', '重新托住狮子的下颚', '我重新托住狮子的下颚。'),
      '我先把门带上，用歪的那股力留在门外。',
    ),
  ),
  pause2(
    '08_strength',
    'reversed',
    '门缝里的狮口仍被按歪，下颚没有回到原处。你要怎么放正这只下颚？',
    steps(
      action('stop', 'engage', '先停止把嘴强迫合上', '我先停止把狮子的嘴强迫合上。'),
      action('return', 'engage', '让手重新停在下颚上', '我让手重新停在狮子的下颚上。'),
      '我先把门带上，按歪的狮口留在门外。',
    ),
  ),
  pause1(
    '09_the_hermit',
    'upright',
    '门缝里，一盏灯只照着脚下那一小段路。你要怎么使用这盏灯？',
    steps(
      action('raise', 'engage', '先把灯举到眼前', '我先把这盏灯举到眼前。'),
      action('back', 'engage', '提着灯退开一步', '我提着灯从喧响里退开一步。'),
      '我先把门带上，那盏灯留在门外。',
    ),
  ),
  pause2(
    '09_the_hermit',
    'upright',
    '门缝里的灯仍只照着一小段路。你要怎么走这段被照见的距离？',
    steps(
      action('edge', 'engage', '只走到灯光边上', '我只走到这盏灯照得见的边上。'),
      action('staff', 'engage', '把杖拄在灯下', '我把杖拄在灯下。'),
      '我先把门带上，只照一小段的灯留在门外。',
    ),
  ),
  pause1(
    '09_the_hermit',
    'reversed',
    '门缝里，灯还亮着，却被斗篷遮住。你要怎么对待这盏被遮住的灯？',
    steps(
      action('show', 'engage', '把灯从斗篷里露出来', '我把灯从斗篷里露出一点。'),
      action('share', 'engage', '让旁边的光分到灯上', '我让旁边的光也分到这盏灯上。'),
      '我先把门带上，遮住的灯留在门外。',
    ),
  ),
  pause2(
    '09_the_hermit',
    'reversed',
    '那盏灯仍藏在门缝里的斗篷中。你要怎么把它露出来？',
    steps(
      action('cloak', 'engage', '掀开斗篷的一角', '我掀开斗篷的一角，让灯焰露出来。'),
      action('flame', 'engage', '把灯放回照路的高度', '我把这盏灯放回能照见路的高度。'),
      '我先把门带上，藏在斗篷里的灯留在门外。',
    ),
  ),
  pause1(
    '10_wheel_of_fortune',
    'upright',
    '门缝里立着一只还在转的轮。你要怎么在这只轮上放自己？',
    steps(
      action('pose', 'engage', '在轮上换一个姿势', '我在这只还在转的轮上换一个姿势。'),
      action('notch', 'engage', '先看清轮转到了哪一格', '我先看清轮转到了哪一格。'),
      '我先把门带上，还在转的轮留在门外。',
    ),
  ),
  pause2(
    '10_wheel_of_fortune',
    'upright',
    '门缝里的轮又转过一格。你要怎么站在这一格上？',
    steps(
      action('rim', 'engage', '手扶着轮缘', '我把手扶在轮缘上，不抓辐条。'),
      action('stand', 'engage', '在轮上改一个站姿', '我在轮上改一个还能站住的姿势。'),
      '我先把门带上，新转过的这一格留在门外。',
    ),
  ),
  pause1(
    '10_wheel_of_fortune',
    'reversed',
    '门缝里，有人抓住辐条，轮却还在转。你要怎么对待这只被抓住的轮？',
    steps(
      action('release', 'engage', '先松开抓住的辐条', '我先松开抓住的辐条。'),
      action('circle', 'engage', '认出又转回来的那一圈', '我认出又转回来的那一圈，不给它再换名字。'),
      '我先把门带上，被抓住的轮留在门外。',
    ),
  ),
  pause2(
    '10_wheel_of_fortune',
    'reversed',
    '门缝里的手还抓着辐条，轮没有停。你要怎么放开这一抓？',
    steps(
      action('spokes', 'engage', '一根一根松开辐条', '我一根一根松开还抓着的辐条。'),
      action('place', 'engage', '放开已经转过去的位置', '我放开已经转过去的那个位置。'),
      '我先把门带上，抓着辐条的手留在门外。',
    ),
  ),
  pause1(
    '11_justice',
    'upright',
    '门缝里，一架天平两边都悬着，剑竖在中间。你要怎么放这架还没平的秤？',
    steps(
      action('both', 'engage', '先把两边都放上秤盘', '我先把两边都放上秤盘。'),
      action('sword', 'engage', '让剑先竖在中间', '我让剑先竖着，不急着落到某一边。'),
      '我先把门带上，悬着的天平留在门外。',
    ),
  ),
  pause2(
    '11_justice',
    'upright',
    '门缝里的天平仍没有平。你要怎么动这架秤？',
    steps(
      action('weight', 'engage', '往轻的一端加一枚砝码', '我往轻的那一端加一枚砝码。'),
      action('side', 'engage', '先看清自己站在哪一端', '我先看清自己站在天平的哪一端。'),
      '我先把门带上，还没平的天平留在门外。',
    ),
  ),
  pause1(
    '11_justice',
    'reversed',
    '门缝里，天平的一边沉下去，砝码像被人挪过。你要怎么对待这架偏了的秤？',
    steps(
      action('restore', 'engage', '把被挪开的砝码放回去', '我把被挪开的砝码放回去。'),
      action('hard', 'engage', '连不利的一端也放上秤', '我连对自己不利的那一端也放上秤。'),
      '我先把门带上，偏了的天平留在门外。',
    ),
  ),
  pause2(
    '11_justice',
    'reversed',
    '门缝里的天平仍然偏斜。你要怎么把它扶正？',
    steps(
      action('missing', 'engage', '先指出被拿掉的砝码', '我先指出被拿掉的那枚砝码。'),
      action('even', 'engage', '让两边重新悬起来', '我让天平的两边重新悬起来。'),
      '我先把门带上，仍然偏斜的秤留在门外。',
    ),
  ),
  pause1(
    '12_the_hanged_man',
    'upright',
    '门缝里，一个人倒吊着，一只脚踝系在门框上。你要怎么对待这个倒过来的人？',
    steps(
      action('stay', 'engage', '让他再倒吊一会儿', '我让他再倒吊一会儿。'),
      action('view', 'engage', '从他倒看的方向看一次', '我从他倒看的方向看一次门里。'),
      '我先把门带上，倒吊着的人留在门外。',
    ),
  ),
  pause2(
    '12_the_hanged_man',
    'upright',
    '那个人仍倒吊在门缝里，脚踝上的绳子没松。你要怎么使用这个倒着的视角？',
    steps(
      action('again', 'engage', '再看一会儿倒过来的那面', '我再看一会儿他倒过来看见的那一面。'),
      action('rope', 'engage', '看清系住脚踝的那根绳', '我看清系住脚踝的那根绳。'),
      '我先把门带上，脚踝上的绳子留在门外。',
    ),
  ),
  pause1(
    '12_the_hanged_man',
    'reversed',
    '门缝里，绳子还系着，倒吊的人停在空等里。你要怎么对待这根还没解开的绳？',
    steps(
      action('down', 'engage', '让他从门框回到地面', '我让倒吊的人从门框回到地面。'),
      action('loose', 'engage', '先不把绳子再系紧', '我先不把这根绳子再系紧。'),
      '我先把门带上，空等的绳子留在门外。',
    ),
  ),
  pause2(
    '12_the_hanged_man',
    'reversed',
    '门缝里的人仍被钉在倒吊的位置。你要怎么松开这根绳？',
    steps(
      action('knot', 'engage', '解开系在脚踝上的结', '我解开系在脚踝上的那个结。'),
      action('ground', 'engage', '把决定放回地面', '我把已经知道的那个决定放回地面，不再用倒吊推迟它。'),
      '我先把门带上，仍被钉住的人留在门外。',
    ),
  ),
  pause1(
    '13_death',
    'upright',
    '门缝里竖着一面旗，一顶王冠倒在马蹄边。你要怎么对待这顶已经落下的冠？',
    steps(
      action('crown', 'engage', '让王冠留在地上', '我让这顶王冠留在马蹄边的地上。'),
      action('banner', 'engage', '先看清旗上的那朵花', '我先看清旗上的那朵花。'),
      '我先把门带上，倒下的王冠留在门外。',
    ),
  ),
  pause2(
    '13_death',
    'upright',
    '门缝里的旗还竖着，地上的冠没有被捡起。你要怎么清这块地方？',
    steps(
      action('move', 'engage', '把落下的冠移出门槛', '我把这顶已经落下的冠移出门槛。'),
      action('flag', 'engage', '让旗停在空出的位置', '我让那面旗停在空出来的位置。'),
      '我先把门带上，没被捡起的冠留在门外。',
    ),
  ),
  pause1(
    '13_death',
    'reversed',
    '门缝里，落下的冠又被捡起来，旗几乎不动。你要怎么对待这顶还抓在手里的冠？',
    steps(
      action('down', 'engage', '把冠重新放回地上', '我把还抓着的冠重新放回地上。'),
      action('step', 'engage', '让旗再往前走一步', '我让几乎不动的旗再往前走一步。'),
      '我先把门带上，被捡起的冠留在门外。',
    ),
  ),
  pause2(
    '13_death',
    'reversed',
    '门缝里的冠仍被抓着，旗停在原地。你要怎么放下这顶冠？',
    steps(
      action('fingers', 'engage', '松开抓着冠的手指', '我松开抓着那顶冠的手指。'),
      action('shell', 'engage', '看清手里还剩的空壳', '我看清手里还剩的那层空壳。'),
      '我先把门带上，停住的旗留在门外。',
    ),
  ),
  pause1(
    '14_temperance',
    'upright',
    '门缝里，水正从一只杯倒进另一只杯。你要怎么对待这道还在流的水？',
    steps(
      action('pour', 'engage', '让水继续倒过去', '我让水继续从一只杯倒进另一只。'),
      action('slow', 'engage', '把倾倒的速度放慢', '我把两只杯之间的倾倒放慢。'),
      '我先把门带上，正在倒的两只杯留在门外。',
    ),
  ),
  pause2(
    '14_temperance',
    'upright',
    '门缝里的水仍在两只杯之间走。你要怎么调这道水？',
    steps(
      action('level', 'engage', '让两只杯保持能互相倒到', '我让两只杯保持在能互相倒到的位置。'),
      action('catch', 'engage', '接住已经倒过来的那一股', '我接住已经倒过来的那一股水。'),
      '我先把门带上，还在倒水的杯子留在门外。',
    ),
  ),
  pause1(
    '14_temperance',
    'reversed',
    '门缝里，一只杯倒得太猛，另一只几乎接不住。你要怎么对待这道洒出来的水？',
    steps(
      action('right', 'engage', '把倒得太猛的杯扶正', '我把倒得太猛的那只杯扶正一点。'),
      action('pause', 'engage', '让水先停一停再倒', '我让洒出来的那一侧先停一停。'),
      '我先把门带上，接不住的那只杯留在门外。',
    ),
  ),
  pause2(
    '14_temperance',
    'reversed',
    '水仍从门缝里的一只杯中洒出来。你要怎么接住这一股？',
    steps(
      action('lift', 'engage', '把洒水的杯口抬高', '我把洒水的杯口抬高一点。'),
      action('apart', 'engage', '让两只杯先分开一点', '我让两只杯先分开一点距离。'),
      '我先把门带上，洒出来的水留在门外。',
    ),
  ),
  pause1(
    '15_the_devil',
    'upright',
    '门缝里，链条是松的，却仍套在两个人身上。你要怎么对待这根还套着的链？',
    steps(
      action('ring', 'engage', '先摸到松着的那个环', '我先摸到这根链上松着的那个环。'),
      action('name', 'engage', '把这根链的名字说出来', '我把这根松链钩住的名字说出来。'),
      '我先把门带上，还套着的链留在门外。',
    ),
  ),
  pause2(
    '15_the_devil',
    'upright',
    '门缝里的链仍松松地套着。你要怎么对待这根还能看见的链？',
    steps(
      action('point', 'engage', '指出套在身上的那一环', '我指出这根松链套在身上的那一环。'),
      action('visible', 'engage', '让这根链停在看得见的地方', '我让这根松链停在看得见的地方。'),
      '我先把门带上，还能看见的链留在门外。',
    ),
  ),
  pause1(
    '15_the_devil',
    'reversed',
    '门缝里，手指已经摸到环扣，链却还没离开身体。你要怎么松开这一个环？',
    steps(
      action('buckle', 'engage', '把环扣转开一点', '我把已经摸到的环扣转开一点。'),
      action('one', 'engage', '这一次只松开一个环', '我这一次只松开一个环。'),
      '我先把门带上，还没离开身体的链留在门外。',
    ),
  ),
  pause2(
    '15_the_devil',
    'reversed',
    '门缝里的环扣仍在手指边，链没有落地。你要怎么放这根链？',
    steps(
      action('drop', 'engage', '让松开的链落到门槛外', '我让松开的那一截链落到门槛外。'),
      action('admit', 'engage', '先承认吸引还在再松一点', '我先承认这根链的吸引还在，再松开一点。'),
      '我先把门带上，没落地的链留在门外。',
    ),
  ),
  pause1(
    '16_the_tower',
    'upright',
    '门缝里，一顶冠正从裂开的塔顶落下。你要怎么对待这顶还在掉的冠？',
    steps(
      action('fall', 'engage', '让落下的冠掉到门外', '我让这顶冠掉到门外，不再按回塔顶。'),
      action('wall', 'engage', '站到裂开的墙外面', '我站到已经裂开的墙外面。'),
      '我先把门带上，正在落下的冠留在门外。',
    ),
  ),
  pause2(
    '16_the_tower',
    'upright',
    '冠仍从门缝里的塔顶往下掉，墙露出空地。你要怎么待这片空地？',
    steps(
      action('ground', 'engage', '先站到冠落下的地方', '我先站到冠落下的那块空地上。'),
      action('crack', 'engage', '不再补那面裂开的墙', '我不再补那面已经裂开的墙。'),
      '我先把门带上，裂开的塔留在门外。',
    ),
  ),
  pause1(
    '16_the_tower',
    'reversed',
    '门缝里，冠还挂在裂开的塔顶，没有落下来。你要怎么对待这顶还挂着的冠？',
    steps(
      action('see', 'engage', '先看清塔顶那道裂缝', '我先看清塔顶那道还没裂到底的缝。'),
      action('roof', 'engage', '先离开漏雨的屋顶', '我先离开已经漏雨的那层屋顶。'),
      '我先把门带上，还挂着的冠留在门外。',
    ),
  ),
  pause2(
    '16_the_tower',
    'reversed',
    '那顶冠仍挂在门缝里的裂缝上。你要怎么面对这顶还没掉的冠？',
    steps(
      action('live', 'engage', '指出自己还住在哪道裂里', '我指出自己还住在里面的那道裂。'),
      action('out', 'engage', '从裂开的房子迈出门槛', '我从裂开的房子里迈出门槛。'),
      '我先把门带上，挂在裂缝上的冠留在门外。',
    ),
  ),
  pause1(
    '17_the_star',
    'upright',
    '门缝里，两只壶正在倒水，一壶向着池，一壶向着地。你要怎么对待这两股水？',
    steps(
      action('pool', 'engage', '让倒向池里的水继续', '我让倒向池里的那一股继续。'),
      action('ground', 'engage', '接住倒在地上的那一点', '我接住倒在地上的那一点水。'),
      '我先把门带上，正在倒水的两只壶留在门外。',
    ),
  ),
  pause2(
    '17_the_star',
    'upright',
    '门缝里的两只壶还在倒。你要怎么让这点水留下来？',
    steps(
      action('keep', 'engage', '让其中一股水留在池里', '我让其中一股水留在池里。'),
      action('star', 'engage', '先看远处还亮着的那颗星', '我先看远处还亮着的那颗星。'),
      '我先把门带上，还在倒的两只壶留在门外。',
    ),
  ),
  pause1(
    '17_the_star',
    'reversed',
    '门缝里，两只壶还在，壶口却扣着，水没有倒出来。你要怎么对待这两只停住的壶？',
    steps(
      action('tilt', 'engage', '把其中一只壶重新倾倒', '我把其中一只停住的壶重新倾倒。'),
      action('look', 'engage', '先抬头看还在的那颗星', '我先抬头看还在的那颗星。'),
      '我先把门带上，扣着的两只壶留在门外。',
    ),
  ),
  pause2(
    '17_the_star',
    'reversed',
    '门缝里的壶口仍朝下扣着，水碰不到地。你要怎么打开这只扣着的壶？',
    steps(
      action('up', 'engage', '把扣着的壶口转上来', '我把扣着的壶口转上来。'),
      action('drop', 'engage', '允许一小滴水落到地上', '我允许一小滴水落到地上。'),
      '我先把门带上，朝下扣着的壶留在门外。',
    ),
  ),
  pause1(
    '18_the_moon',
    'upright',
    '门缝里，一条路从两座塔之间通出去，月光把石头照得发虚。你要怎么走这条还看不清的路？',
    steps(
      action('between', 'engage', '先只走到两塔之间', '我先只走到两座塔之间。'),
      action('towers', 'engage', '看清左右两座塔再抬脚', '我看清左右两座塔，再抬脚。'),
      '我先把门带上，两座塔之间的路留在门外。',
    ),
  ),
  pause2(
    '18_the_moon',
    'upright',
    '那条路仍夹在门缝里的两座塔中间。你要怎么走接下来的这一截？',
    steps(
      action('slow', 'engage', '在月光里放慢一步', '我在两座塔之间放慢一步。'),
      action('shadow', 'engage', '把看不清的影子标出来', '我把路上看不清的那段影子标出来。'),
      '我先把门带上，看不清的那截路留在门外。',
    ),
  ),
  pause1(
    '18_the_moon',
    'reversed',
    '门缝里，两座塔之间的雾散开一些，路还没有亮到正午。你要怎么走这截渐渐清楚的路？',
    steps(
      action('walk', 'engage', '先走雾已经散开的那截', '我先走两座塔之间雾已经散开的那截。'),
      action('split', 'engage', '把害怕的和路上的事分开', '我把害怕的和路上实际有的分成两边。'),
      '我先把门带上，还没亮到正午的路留在门外。',
    ),
  ),
  pause2(
    '18_the_moon',
    'reversed',
    '两座塔还在门缝里，雾只散了一半。你要怎么分辨路上的影子？',
    steps(
      action('own', 'engage', '指出自己添上的那段影', '我指出路上哪一段是自己添上的影。'),
      action('visible', 'engage', '走还看得见的那截', '我走两座塔之间还看得见的那截。'),
      '我先把门带上，散了一半的雾留在门外。',
    ),
  ),
  pause1(
    '19_the_sun',
    'upright',
    '门缝里，一个孩子骑在白马上，身后是一排向日葵。你要怎么对待这片照进来的光？',
    steps(
      action('child', 'engage', '让孩子骑到门口', '我让那个孩子骑到门口。'),
      action('flower', 'engage', '站到向日葵晒得到的一边', '我站到向日葵晒得到的一边。'),
      '我先把门带上，孩子和向日葵留在门外。',
    ),
  ),
  pause2(
    '19_the_sun',
    'upright',
    '向日葵仍朝着门缝里的光，孩子还在马上。你要怎么让这点热停在身上？',
    steps(
      action('face', 'engage', '把脸转向这轮太阳', '我把脸转向门缝里的这轮太阳。'),
      action('flag', 'engage', '让孩子手里的小旗展开', '我让孩子手里的小旗展开。'),
      '我先把门带上，向日葵和白马留在门外。',
    ),
  ),
  pause1(
    '19_the_sun',
    'reversed',
    '门缝里，太阳还在，一层窗帘拉着，向日葵晒不进屋里。你要怎么对待这层拉上的窗帘？',
    steps(
      action('curtain', 'engage', '把窗帘拉开一条缝', '我把窗帘拉开一条缝。'),
      action('return', 'engage', '让孩子回到能晒到的地方', '我让那个孩子回到能被晒到的地方。'),
      '我先把门带上，拉着的窗帘留在门外。',
    ),
  ),
  pause2(
    '19_the_sun',
    'reversed',
    '门缝里的窗帘仍拉着，孩子站在光的边上。你要怎么让光进到门内？',
    steps(
      action('wider', 'engage', '再把窗帘拉开一截', '我再把窗帘拉开一截。'),
      action('self', 'engage', '把自己也算进这片光', '我把自己也算进这片光里。'),
      '我先把门带上，还拉着的窗帘留在门外。',
    ),
  ),
  pause1(
    '20_judgement',
    'upright',
    '门缝里，几个人从棺中举起手臂，号角对着他们。你要怎么回应这些抬起来的人？',
    steps(
      action('arm', 'engage', '也举起一只手臂', '我也举起一只手臂。'),
      action('horn', 'engage', '先听完这声号角', '我先听完这声号角。'),
      '我先把门带上，举起手臂的人留在门外。',
    ),
  ),
  pause2(
    '20_judgement',
    'upright',
    '那些人仍在门缝里举着手，号角没有停。你要怎么回应这声还没停的号角？',
    steps(
      action('answer', 'engage', '向举着的人回应一次', '我向棺中举着的那些人回应一次。'),
      action('sit', 'engage', '从棺沿上坐起来', '我从棺沿上坐起来。'),
      '我先把门带上，还举着手的人留在门外。',
    ),
  ),
  pause1(
    '20_judgement',
    'reversed',
    '门缝里，号角还在响，有人捂着耳朵，棺中的人没有起来。你要怎么对待这声被捂住的号角？',
    steps(
      action('uncover', 'engage', '先把手从耳朵上拿开', '我先把手从耳朵上拿开。'),
      action('rise', 'engage', '让棺中的人先坐起来', '我让棺中的人先坐起来，不把号角听成责罚。'),
      '我先把门带上，捂着耳朵的人留在门外。',
    ),
  ),
  pause2(
    '20_judgement',
    'reversed',
    '门缝里的手仍捂着耳，棺中的人还没起来。你要怎么放开这只耳朵？',
    steps(
      action('down', 'engage', '把捂耳的手放下', '我把捂着耳朵的手放下。'),
      action('call', 'engage', '把号角听成一句具体的呼唤', '我把这声号角听成一句具体的呼唤，而不是整个人被否定。'),
      '我先把门带上，没起来的人留在门外。',
    ),
  ),
  pause1(
    '21_the_world',
    'upright',
    '门缝里，一个人站在圆圆的花环中央。你要怎么对待这个已经合上的圈？',
    steps(
      action('center', 'engage', '先站进花环的圆心', '我先站进这个花环的圆心。'),
      action('carry', 'engage', '把花环收成可以带走的圆', '我把这个花环收成可以带走的圆。'),
      '我先把门带上，合上的花环留在门外。',
    ),
  ),
  pause2(
    '21_the_world',
    'upright',
    '花环仍圆在门缝里，人还站在圈中。你要怎么带走这个圆？',
    steps(
      action('close', 'engage', '让花环在门口合上一次', '我让花环在门口合上一次。'),
      action('next', 'engage', '带着这个圆去看下一扇门', '我带着这个已经合上的圆去看下一扇门。'),
      '我先把门带上，圆着的花环留在门外。',
    ),
  ),
  pause1(
    '21_the_world',
    'reversed',
    '门缝里，花环已经圆了，一只脚停在圈外。你要怎么对待这半步还没踏进的圈？',
    steps(
      action('step', 'engage', '把脚踏进花环', '我把停在圈外的那只脚踏进花环。'),
      action('gap', 'engage', '先看清脚和花环的距离', '我先看清这只脚离花环还差多少。'),
      '我先把门带上，圈外的那只脚留在门外。',
    ),
  ),
  pause2(
    '21_the_world',
    'reversed',
    '那只脚仍停在门缝里的花环外面。你要怎么跨过剩下的距离？',
    steps(
      action('in', 'engage', '让脚跨进花环', '我让这只脚跨进花环。'),
      action('out', 'engage', '承认人还站在圈外', '我承认花环已经圆了，人还站在圈外。'),
      '我先把门带上，圈外的那半步留在门外。',
    ),
  ),
];
