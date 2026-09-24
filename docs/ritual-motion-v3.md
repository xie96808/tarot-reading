# 仪式动效 v3：生成素材、实现和验证

基线：dba5aae（保留最新分享链接与历史记录修复）。本轮未提交、未推送，不触发自动生产发布。
本机生产预览：http://127.0.0.1:3102/read
证据目录：/private/tmp/tarot-motion-v3（长期留存请备份）。

## 查明的问题

- 原先主画面是三张不透明手势照片，真实牌堆动画位于默认关闭的details中，因此没有可见的洗牌动画。
- 原洗牌CSS在calc中使用JavaScript的 `%` 运算，部分transform声明无效；现在在TSX中计算layer，CSS只接收数字变量。
- 桌子、桌布和手势曾在同一张照片中，缺少独立布局层。
- 普通卡牌的光晕缺少正确定位容器；手机切换到下一张已经揭示的位置时，新挂载卡片也可能跳过翻转。
- 已生成牌库环境中，476条静态图片引用检查为0缺失；主要问题是展示层、隐藏动画及加载反馈，并非这些已引用文件全部丢失。

## 素材

使用内置image_gen新生成无牌、无手、无桌布的木桌背景，保留原有素材，最终项目资产为：

- public/table/wood-v3.webp：1600×900，99,266字节。
- public/table/wood-v3.jpg：1600×900，126,868字节。

原始生成文件：/Users/xiexuan/.codex/generated_images/01a0ae12-82a2-77c3-9e37-8f70136afd21/exec-d6c4bf34-a066-48fc-9504-ce467617d456.png
仅缩放和格式压缩后接入；不生成替代塔罗牌面，继续使用项目既有RWS牌面和SVG牌背。桌布、灯光、微粒、光环与卡牌运动使用原生CSS/React绘制，不依赖GIF或自动播放视频。

最终生成提示词（内置工具，无CLI/API密钥）：

> Create a production website background asset: perfectly overhead dark walnut tabletop, landscape 16:9 composition, richly realistic fine natural wood grain, muted espresso and warm umber palette. Very subtle soft warm candle illumination entering from the upper left OUTSIDE the image, gentle vignette at corners. The entire central 90% is clear, visually quiet continuous wood so animated tarot cards and an independently drawn green fabric mat can be composited over it. Flat orthographic overhead camera, no perspective tilt. No cards, no hands, no tablecloth, no felt, no candles or objects visible, no symbols, no writing, no watermark. Premium restrained cinematic photographic material texture, not an illustration. This is the actual reusable background for a responsive interactive tarot table; prioritize believable understated material, low contrast grain, and dark edges over dramatic spotlighting.

## 动效适配

- TableScene：静止木桌、可伸缩桌布、独立交互层；主画面直接展示牌堆，移除折叠示意层。
- ShuffleTable：16张牌，待机轻微展开，按住交错混合，松开/自动洗牌后归拢。循环1600ms，归拢阶段至少展示1900ms。
- CutTable：两叠牌的位移和厚度随滑块变化，显示准确张数；确认后先合拢500ms，再进入发牌。
- Tableau/Card3D：通过实际牌位和牌堆坐标计算飞行起点，单张飞行620ms；三张间隔180ms、十张120ms；阶段计时覆盖最后一张落稳。
- Card3D：640ms立体翻牌，光晕与翻转层分离；手机新揭示的位置也播放翻转，恢复旧牌和手动导航不混用状态。
- CardFace：提前请求本局响应式图片，载入占位、淡入、失败重试；清单失败可重新加载。
- WebP失败转JPEG；背景全失败时保留CSS桌布和可操作卡牌。
- 减少动画偏好禁用运动；隐藏页面暂停装饰与洗牌动画。仍保留键盘、自动洗牌和逐张导航。
- 不修改随机算法、抽牌结果、分享编码或保存规则。

## 验证

工作目录：/Users/xiexuan/codes/github_projects/tarot-reading。

| 命令/环境 | 结果 | 退出码 |
|---|---|---|
| 基线npm test | 77 passed | 0 |
| 修改后npm test | 81 passed | 0 |
| npm run lint | 无诊断 | 0 |
| npx tsc --noEmit | 无输出 | 0 |
| npm run build | 89个静态页面构建完成 | 0 |
| 最终文案调整后npx next build | 构建通过（牌库已在前次完整build生成） | 0 |
| 生产构建浏览器回归 | 32项通过 | 0 |
| 静态图片引用扫描 | 476条引用、0缺失 | 0 |

生产回归配置位于 /private/tmp/tarot-motion-v3/playwright.production.config.cjs，使用端口3102；原3100服务未被中断。测试内容包括390/1440px实际洗牌transform变化、切牌运动、合拢、发牌起点、每个手机牌位的翻转、JPEG回退、清单重试，以及原有单/三/十张、响应式、分享和历史流程。

首轮测试有一次失败，是Next开发环境自带的空alert被全局定位器匹配；改为等待真实清单200响应并检查main内alert，未关闭断言或跳过失败。
未宣称所有设备均达到固定帧率；未执行Safari/Firefox全套回归。

## 演示与回退

演示：/private/tmp/tarot-motion-v3/ritual-demo.webm（生产构建实际录制，不是合成预演）。
改前截图：/private/tmp/tarot-motion-v3/before-shuffle.png。
改后关键帧：/private/tmp/tarot-motion-v3/test-results。

交付角色：
- /private/tmp/tarot-motion-v3/modified-source.tar.gz
- /private/tmp/tarot-motion-v3/changes.patch
- 本文及证据目录中的测试日志
- /private/tmp/tarot-motion-v3/rollback.py

补丁与源码包按逐文件SHA-256校验；回退在隔离副本中执行，不撤销当前工作区。具体结果见 /private/tmp/tarot-motion-v3/roundtrip.log。
回退脚本会检查修改后哈希，遇到用户后续编辑就中止；不要用它覆盖新工作。
