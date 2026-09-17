# 资源接入与桌面适配：实施与验证记录

日期：2026-09-17。代码基线：c4440cd。未提交 Git，未部署线上。
项目目录：`/Users/xiexuan/codes/github_projects/tarot-reading`。
证据目录：`/private/tmp/tarot-adaptation-20260917`（本机临时目录；长期保留需备份整目录）。

## 已实施

- TableScene 的 photo/spread 两条展示分支：完整照片不再叠在交互牌上；洗牌和切牌保留 16:9 构图，示意牌堆独立展开；去掉整图位移/旋转。
- TableScene 的牌阵容器改为自然内容高度；Tableau 明确 grid 宽度，渲染原来遗漏的手机逐张视图。
- 凯尔特桌面牌阵增加垂直间距，错开交叉位的标签和按钮。手机逐张阅读不横转整个卡片。
- 根 metadata 增加默认 OG/Twitter 封面；本局分享页保留动态图片，显式覆盖 Twitter 图片。
- 解读页面使用顶部纸纹和装饰书签；翻牌使用 PNG 光晕，结束隐藏，减少动画时关闭。
- 动态分享图使用本地中文 WOFF 和纸纹，十张结果分成两列，问题文字不进入预览文案和图像。
- EmptyDeck 仅在真实空结果时显示，不新增搜索/收藏。当前完整牌典筛选不会触发此分支。
- next.config 的 outputFileTracingIncludes 包含生产分享图所需纸纹与中文字体。

## 改前 / 改后实际行为

执行命令（项目根目录）：

```sh
node /private/tmp/tarot-adaptation-20260917/capture.cjs before
node /private/tmp/tarot-adaptation-20260917/capture.cjs after
```

两个命令退出码均为 0。脚本输入：本机 `/read`，默认三张牌、跳过问题、自动洗牌；视口 390/768/1440×1000。
每个视口依次保存 shuffle/cut/reveal/read 截图和 `layout.json`。`after` 是第一批布局修复截图；最终截图位于 `production-results` 和 `after/table-*.png`。

人工检查确认：
- 改前 390px 翻牌区只剩桌布，没有可见牌；改后显示所选牌、翻牌按钮、位置导航。
- 改前 1440px 三张牌竖排且被桌面边界裁切；改后横排，三张牌及各自操作完整可见。
- 洗牌和切牌不再移动整张照片，独立示意区可展开，自动与指针洗牌都进入切牌阶段。
- 最终十张分享图：1200×630、中文正常、两列完整显示；阅读页纸纹与书签已目视检查。

截图：
- 改前：`/private/tmp/tarot-adaptation-20260917/before/390-reveal.png`
- 改前：`/private/tmp/tarot-adaptation-20260917/before/1440-reveal.png`
- 改后：`/private/tmp/tarot-adaptation-20260917/after/table-390.png`
- 改后：`/private/tmp/tarot-adaptation-20260917/after/table-1440.png`
- 十张牌阵：`/private/tmp/tarot-adaptation-20260917/after/1440-celtic.png`
- 生产截图集合：`/private/tmp/tarot-adaptation-20260917/production-results`

## 命令、原样结果与退出码

| 环境 / 命令 | 原样结果摘要 | 退出码 |
|---|---|---|
| 基线 `npm test` | `Test Files  21 passed (21)`；`Tests  61 passed (61)` | 0 |
| 修改后 `npm test` | `Test Files  22 passed (22)`；`Tests  70 passed (70)` | 0 |
| 修改后 `npx tsc --noEmit` | 无输出 | 0 |
| 修改后 `npm run build` | `✓ Compiled successfully in 2.0s`；`✓ Generating static pages using 7 workers (88/88) in 333ms` | 0 |
| 开发服务 `npm run test:e2e`（首批布局） | `15 passed (46.0s)` | 0 |
| 开发服务 `npm run test:e2e -- e2e/share-assets.spec.ts` | `4 passed (7.7s)` | 0 |
| standalone 服务 `npm run test:e2e`（最终完整运行） | `21 passed (47.4s)` | 0 |
| standalone 服务 `npm run test:e2e -- e2e/table-layout.spec.ts --grep 'enlarged reading text'`（进一步加强字体断言） | `1 passed (1.3s)` | 0 |
| `git diff --check` | 无输出 | 0 |
| 隔离基线 `(cd /private/tmp/tarot-adaptation-20260917/original && npm run lint)` | `✖ 10 problems (6 errors, 4 warnings)` | 1 |
| 修改后 `npm run lint` | `✖ 8 problems (6 errors, 2 warnings)` | 1 |

lint 六个错误均在基线存在：Card3D、HistoryList、RitualApp 的同步 effect 状态更新，以及 rng.ts 的 prefer-const。本轮没有修改这些逻辑来规避检查。

最终完整浏览器运行前，两轮曾因测试未等待图片解码、入场动画结束，以及对单位矩阵字符串判断过严失败。保留 `production-e2e-first.log`、`production-e2e-second.log`；测试改为等待实际图片尺寸和动画 finished，不使用强制通过或重试隐藏失败。

原始日志：证据目录中的 `baseline-tests.log`、`modified-tests.log`、`typecheck.log`、`build.log`、`baseline-lint.log`、`lint.log`、`e2e.log`、`share-e2e.log`、`production-e2e.log`、`enlarged-text.log`。

## 生产模式验证

实际执行：

```sh
npm run build
mkdir -p .next/standalone/public .next/standalone/.next/static
cp -R public/. .next/standalone/public/
cp -R .next/static/. .next/standalone/.next/static/
HOSTNAME=127.0.0.1 PORT=3100 node .next/standalone/server.js
npm run test:e2e
```

生产服务启动输出：`✓ Ready in 0ms`。打包后的中文 WOFF 文件实际存在；单张、三张、十张动态图片请求成功，图片尺寸断言通过。此次不是只验证开发服务。

## 覆盖与边界

- 视口：375、390、719、720、721、768、1023、1024、1440px。
- 单张/三张/十张流程、键盘入口、未完成会话恢复、指针洗牌、照片比例、牌面边界、无横向溢出、十张牌右列间距。
- 减少动画、装饰图片请求失败、阅读正文由17px放大至34px（不是整站浏览器200%缩放认证）。
- 图片规格和 alpha 通道、本局预览隐私、默认与动态分享图元数据。
- 仍使用烘焙在照片中的桌布；长牌阵会裁切背景，不宣称已经得到可独立缩放的桌布素材。
- 未做真实社交平台抓取、Safari/Firefox 全套回归、限速网络专项与空结果分支浏览器注入测试。

## 补丁、源码包及回退

代码交付包含18个修改/新增文件；不把此前已有的开发计划文档算入代码回退。

- 修改源码包：`/private/tmp/tarot-adaptation-20260917/modified-source.tar.gz`
- 补丁：`/private/tmp/tarot-adaptation-20260917/changes.patch`
- 哈希清单：`/private/tmp/tarot-adaptation-20260917/changes-manifest.json`
- 原始文件：`/private/tmp/tarot-adaptation-20260917/original`
- 回退脚本：`/private/tmp/tarot-adaptation-20260917/rollback.py`

隔离副本验证命令：

```sh
python3 /private/tmp/tarot-adaptation-20260917/package.py
python3 /private/tmp/tarot-adaptation-20260917/verify-package.py
```

原样结果：

```text
Packaged 18 modified/new code files
PATCH_EXIT_STATUS=0
PATCH_AND_ARCHIVE_HASHES_OK: 18
ROLLBACK_OK: 18 files restored/removed; unrelated files untouched
ROLLBACK_EXIT_STATUS=0
```

验证先向隔离基线应用补丁，逐个核对源码包、修改文件的 SHA-256，再实际执行回退并逐个核对原始 SHA-256；原工作区保持修改后的版本。

如需回退实际工作区，先停止预览服务，然后执行：

```sh
python3 /private/tmp/tarot-adaptation-20260917/rollback.py /Users/xiexuan/codes/github_projects/tarot-reading
```

脚本遇到后续编辑或备份哈希不符会中止，不覆盖后续改动；回退源码后需要重新构建才会改变 standalone 服务内容。
