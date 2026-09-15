# 设计稿重构核对记录

本记录验证的是 **文档、原始资产、设计契约探针和文档回退**；不是网站实现验收。没有创建应用、安装框架依赖、连接服务器或更改 DNS。

## 结论

- 原稿与牌面 zip 的 SHA-256 保持不变。
- 新稿 22 张大牌 + 4×14 张小牌的定义与实际 78 个文件一致；所有 JPEG 为 800×1280。
- 文档中的均匀整数函数已实际执行边界探针；独立参考模型检查 HKDF 分块、确定性、样本/用途区分、洗切不变量与分享编码长度。
- 这些是设计合同探针，不是生产 RNG、完整 schema 解码器或浏览器状态机的测试；未来实现仍按设计稿 §12 验收。
- 差异补丁已在临时副本正向应用并逐字节比较，也已逆向应用并逐字节比较；回退脚本在临时副本执行成功，工作区保持重构稿。
- 未运行：网站 build、Playwright、Lighthouse、VoiceOver、微信真机、nginx/TLS/systemd、外网域名及生产回滚。

## 文件摘要

| 文件 | SHA-256 |
| --- | --- |
| `/Users/xiexuan/codes/github_projects/tarot-reading/docs/design.md` | `766b4f2f9e5c79b57f3cd1113970ae6126565e80070e9849b501319da31d5b01` |
| `/Users/xiexuan/codes/github_projects/tarot-reading/docs/history/design.original-2026-09-16.md` | `8973a0022f85c3c168f69079ef0df1a3752593f204d5dc47644bb2a5e9e68aa6` |
| `/Users/xiexuan/codes/github_projects/tarot-reading/docs/plan-review/design.patch` | `f13b4295da67d6f55da37ddea981d01ab819d56d56fa75e8e19012c5326b8fbe` |
| `/Users/xiexuan/codes/github_projects/tarot-reading/docs/plan-review/rollback.sh` | `585327491d7f9d46ea6c420e2c23b16d7000cd660d334988901ed73b9a7cb995` |
| `/Users/xiexuan/codes/github_projects/tarot-reading/docs/plan-review/check-plan.py` | `4fc827a61918f38ac02f9fe2ff60e6650270f7132bc69ff90210a30e699c2bf6` |
| `/Users/xiexuan/codes/github_projects/tarot-reading/docs/plan-review/spec-probe.mjs` | `f637073dfadc521f4c9f046c8de733a28641f74a8a331f629e8f0c06f64725d5` |
| `/Users/xiexuan/codes/github_projects/tarot-reading/docs/plan-review/verify.py` | `cb2910b5da75639ad3ea04ab957640991eb75b563b19523b575807f76723e01e` |
| `/Users/xiexuan/codes/github_projects/tarot-reading/RWS_78_aligned.zip` | `3b54ec3ae4e4c86081a452c3f145d20f598c260150c4493c34be9e4086919b28` |

## 复跑

```sh
python3 /Users/xiexuan/codes/github_projects/tarot-reading/docs/plan-review/verify.py
```

回退脚本默认只读检查；`--self-test` 在临时副本验证；显式 `--restore` 才将主文档恢复为原稿。若主文档已有后续编辑，摘要保护会中止覆盖。回退只影响 design.md，保留审核材料。

## 实际命令与字面输出

以下临时目录是本次测试真实使用的路径，测试后已自动清理；其余均为工作区文件。

### Baseline source check

工作目录：`/Users/xiexuan/codes/github_projects/tarot-reading`

```sh
python3 /Users/xiexuan/codes/github_projects/tarot-reading/docs/plan-review/check-plan.py --mode baseline --document /Users/xiexuan/codes/github_projects/tarot-reading/docs/history/design.original-2026-09-16.md
```

退出状态：`0`

```text
PASS original backup and artwork SHA-256 unchanged
PASS brand/domain/no-LLM constraints retained
CONFIRMED baseline has fixed random pool, float mapping, shared length budget, robots disallow
BASELINE SOURCE CHECKS COMPLETE (not application tests)
```

### Modified document check

工作目录：`/Users/xiexuan/codes/github_projects/tarot-reading`

```sh
python3 /Users/xiexuan/codes/github_projects/tarot-reading/docs/plan-review/check-plan.py --mode modified --document /Users/xiexuan/codes/github_projects/tarot-reading/docs/design.md
```

退出状态：`0`

```text
PASS original backup and artwork SHA-256 unchanged
PASS brand/domain/no-LLM constraints retained
PASS document card mapping = ZIP: 22 majors + 56 minors; all 78 images 800x1280
PASS 16 top-level sections, closed code fences, section references and core contracts
DOCUMENT_SHA256 766b4f2f9e5c79b57f3cd1113970ae6126565e80070e9849b501319da31d5b01
MODIFIED DOCUMENT CHECKS COMPLETE (browser/production tests remain pending)
```

### Executable design-contract probes

工作目录：`/Users/xiexuan/codes/github_projects/tarot-reading`

```sh
node /Users/xiexuan/codes/github_projects/tarot-reading/docs/plan-review/spec-probe.mjs
```

退出状态：`0`

```text
PASS actual design uniformInt snippet: rejection, invalid bounds, full uint32 bound
PASS 8-bit exhaustive analogue: every accepted bucket has exactly 3 values
PASS HKDF design reference: 513 uint32 values / 3 blocks deterministic; sample and purpose separation
REFERENCE_VECTOR_SHA256 0ac93c7f14a812cad31bc63e8cb06ac56d6a075567954e79f499907ea9f0190f
PASS design reference: 78 unique cards and boundary cuts 1/23/39/77
SHARE_SINGLE_NO_QUESTION_LENGTH 358
SHARE_THREE_NO_QUESTION_LENGTH 568
SHARE_CELTIC_NO_QUESTION_LENGTH 1292
SHARE_CELTIC_CJK_200_LENGTH 2089 (must show oversize prompt)
SHARE_CELTIC_EMOJI_200_LENGTH 2356 (must show oversize prompt)
SPEC PROBES COMPLETE. No application, browser, or deployment tests were executed.
```

### Rollback input check

工作目录：`/Users/xiexuan/codes/github_projects/tarot-reading`

```sh
sh /Users/xiexuan/codes/github_projects/tarot-reading/docs/plan-review/rollback.sh --check
```

退出状态：`0`

```text
PASS rollback inputs verified; no files changed
```

### Rollback execution on temporary copy

工作目录：`/Users/xiexuan/codes/github_projects/tarot-reading`

```sh
sh /Users/xiexuan/codes/github_projects/tarot-reading/docs/plan-review/rollback.sh --self-test
```

退出状态：`0`

```text
PASS rollback executed on temporary copy; original bytes restored; workspace unchanged
```

### Apply document patch

工作目录：`/var/folders/37/w1780s5110xgjf0hj4zy4r940000gn/T/tarot-plan-diff-xg0szisc`

```sh
patch -p1 -i /Users/xiexuan/codes/github_projects/tarot-reading/docs/plan-review/design.patch
```

退出状态：`0`

```text
patching file 'docs/design.md'
```

### Patched document matches modified artifact

工作目录：`/var/folders/37/w1780s5110xgjf0hj4zy4r940000gn/T/tarot-plan-diff-xg0szisc`

```sh
cmp /var/folders/37/w1780s5110xgjf0hj4zy4r940000gn/T/tarot-plan-diff-xg0szisc/docs/design.md /Users/xiexuan/codes/github_projects/tarot-reading/docs/design.md
```

退出状态：`0`

```text
(empty stdout/stderr)
```

### Reverse document patch

工作目录：`/var/folders/37/w1780s5110xgjf0hj4zy4r940000gn/T/tarot-plan-diff-xg0szisc`

```sh
patch -R -p1 -i /Users/xiexuan/codes/github_projects/tarot-reading/docs/plan-review/design.patch
```

退出状态：`0`

```text
patching file 'docs/design.md'
```

### Reverse patch matches original artifact

工作目录：`/var/folders/37/w1780s5110xgjf0hj4zy4r940000gn/T/tarot-plan-diff-xg0szisc`

```sh
cmp /var/folders/37/w1780s5110xgjf0hj4zy4r940000gn/T/tarot-plan-diff-xg0szisc/docs/design.md /Users/xiexuan/codes/github_projects/tarot-reading/docs/history/design.original-2026-09-16.md
```

退出状态：`0`

```text
(empty stdout/stderr)
```
