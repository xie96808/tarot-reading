# Lint 修复验证（2026-09-17）

基线提交：1eea73a。修复尚未提交、未推送。
工作目录：`/Users/xiexuan/codes/github_projects/tarot-reading`。
证据与回退文件：`/private/tmp/tarot-lint-fix`（临时目录，长期留存请备份整目录）。

## 修改内容

1. RitualApp 通过 useSyncExternalStore 的服务端/客户端就绪快照分隔初始化；仅在客户端挂载后读取待恢复会话。保留用户选择前不覆盖存档的条件。
2. 浏览器可见性、减少动画偏好改为外部订阅；在 visibilitychange 回调直接派发 HOLD_CANCEL，移除 effect 中的同步更新链。
3. HistoryList 订阅稳定的序列化存储快照，支持同页删除及跨标签页更新；存储降级提示订阅独立状态。
4. 修正写入失败时旧存储遮住新内存副本的问题，清除失败时保留内存删除标记，防止旧存档重新出现。
5. Card3D 合并呈现状态，在 revealed 变化时有条件重置；effect 仅保留可清理的动画帧/计时器。手动朝向由函数式更新保护。手机逐张牌按位置与牌身份设置 key，避免上一张牌状态泄漏。
6. rng 删除永远为 false 的 cancelled 变量及无效分支；移除两处过期 eslint 注释。

没有关闭 lint 规则，没有用无意义的 setTimeout 绕过同步状态更新检查。保留 AGENTS.md 和 CLAUDE.md；代码回退不操作这两个指引文件。

## 命令与实际结果

以下命令除注明外均在工作目录执行。

| 命令 | 原样输出摘要 | 退出码 |
|---|---|---|
| 基线 `npm run lint` | `✖ 8 problems (6 errors, 2 warnings)` | 1 |
| 修复后 `npm run lint` | 仅 npm 脚本标题，无诊断 | 0 |
| `npx tsc --noEmit` | 无输出 | 0 |
| `npm test` | `Test Files  23 passed (23)`；`Tests  72 passed (72)` | 0 |
| `npm run build` | `✓ Compiled successfully in 1614ms`；`✓ Generating static pages using 7 workers (88/88) in 291ms` | 0 |
| 生产服务上 `npm run test:e2e` | `26 passed (55.4s)` | 0 |
| `git diff --check` | 无输出 | 0 |

生产验证启动命令：

```sh
mkdir -p .next/standalone/public .next/standalone/.next/static
cp -R public/. .next/standalone/public/
cp -R .next/static/. .next/standalone/.next/static/
HOSTNAME=127.0.0.1 PORT=3100 node .next/standalone/server.js
```

服务输出 `✓ Ready in 0ms`。本地预览为 http://127.0.0.1:3100/read。

日志：`/private/tmp/tarot-lint-fix/{baseline-lint,lint,types,unit,build,e2e}.log`。
第一轮开发环境测试出现一次测试按钮名称写错导致的超时（25 passed / 1 failed）；已改成仓库实际文案“看落牌方向”“转正看清”，并完整重跑通过。原始记录在 e2e-first.log，未隐藏失败或放宽功能断言。

## 新增验证输入与已确认行为

- 恢复场景：sessionStorage 中保存 question 阶段、问题“保留我的问题”；验证入口展示“继续这局”，选择前原存档不变，继续后文本恢复且无 hydration 报错。
- 降级场景：Storage.setItem 抛 QuotaExceededError；验证降级提示出现、仍可进入问题步骤、无页面异常。单测另模拟可读但不可写的旧存档，验证新内存值及删除标记优先。
- 可见性场景：空格按住洗牌时派发 hidden=true 的 visibilitychange；恢复可见后回到 idle，不误进入切牌。（自动化事件模拟，不宣称真实操作系统后台测试。）
- 朝向场景：恢复包含逆位牌的三张牌阵，手动切换落牌朝向，跨越1000ms自动转正期限后选择仍保留；切换第二张牌不继承上一张状态；第三张新翻牌正常完成。
- 历史场景：两条记录，当前页删除一条后立即更新；另一个同源标签页清空 localStorage，当前页同步移除历史区。
- 原有21项浏览器测试全部保留并通过，包括响应式布局、分享图、单/三/十张流程。

## 源码包、补丁、回退

- 修改源码：`/private/tmp/tarot-lint-fix/modified-source.tar.gz`
- 补丁：`/private/tmp/tarot-lint-fix/changes.patch`
- 修改前后 SHA-256：`/private/tmp/tarot-lint-fix/changes-manifest.json`
- 原始文件：`/private/tmp/tarot-lint-fix/original`
- 回退脚本：`/private/tmp/tarot-lint-fix/rollback.py`

已执行：

```sh
python3 /private/tmp/tarot-lint-fix/package.py
python3 /private/tmp/tarot-lint-fix/verify-package.py
```

原样输出：

```text
Packaged 11 modified/new code files
PATCH_EXIT_STATUS=0
PATCH_AND_ARCHIVE_HASHES_OK: 11
ROLLBACK_OK: 11 files restored/removed; unrelated files untouched
ROLLBACK_EXIT_STATUS=0
```

验证过程：隔离基线应用补丁，核对源码包与修改文件哈希；实际执行回退，再逐文件核对原始哈希。工作区保留修复后版本。
如需回退工作区，先停止预览服务，执行下列命令，再重新构建：

```sh
python3 /private/tmp/tarot-lint-fix/rollback.py /Users/xiexuan/codes/github_projects/tarot-reading
```

脚本在文件存在后续修改或原始备份哈希不符时中止；不覆盖后续工作，不操作文档和指引文件。
