# main 分支自动同步至阿里云

工作流：`.github/workflows/sync-main.yml`。
触发：推送到 main，或在 main 上手动 workflow_dispatch；其他分支不执行同步。
目标服务器：121.199.33.29:22，专用账号 tarot-sync。

## 同步范围

每次使用 `git archive` 打包触发提交的已跟踪文件，并通过 rsync 上传到：

```text
/srv/tarot/source/<完整 commit SHA>/
```

不传输本机未提交文件、`.git`、本机凭据、node_modules 或生成的构建目录。
仓库中的牌面源 ZIP 会传输；服务器若需生成牌面应另行运行项目构建流程。
同步脚本要求 rsync 3.x（Ubuntu Actions runner 提供）；macOS 自带 openrsync 不兼容服务器 rrsync 的受限命令语法，不作为生产执行环境。
传输后再次以 checksum dry-run 检查差异，通过后 Actions 输出 `SYNC_OK <SHA>`。

**这是源码同步，不是网站自动上线。** 不构建、不重启 tarot、不切换 `/srv/tarot/current`，不删除旧提交目录。
串行同步避免并发写入；GitHub concurrency 会合并拥堵时的待执行运行，不保证极短时间连续推送的每个中间版本都保留，但最新 main 会进入同步队列。
尚未设置旧版本自动清理，需按磁盘使用情况手动维护。

## 凭据与权限

仓库 Actions Variables：
- ALIYUN_SYNC_HOST
- ALIYUN_SYNC_USER
- ALIYUN_SYNC_PORT

仓库 Actions Secrets：
- ALIYUN_SYNC_SSH_KEY：本项目单独生成的 Ed25519 私钥，不复用 root 私钥。
- ALIYUN_SYNC_KNOWN_HOSTS：经现有可信 SSH 连接核验的服务器公钥。

服务器 authorized_keys 使用：

```text
restrict,command="/usr/bin/rrsync -wo -no-del /srv/tarot/source" <专用公钥>
```

专用用户未授予 sudo 权限；该密钥只允许 rsync 写入指定目录，禁止删除、交互命令和 SSH 转发。
主机密钥变更时同步应失败；独立核验新主机密钥后再更新 Secret，不关闭 host key 校验。

## 查看结果和暂停

在 GitHub Actions 中查看 “Sync main source to Aliyun” 的运行日志及摘要。
失败时对应提交目录可能不完整；不要将未经成功验证的目录用于部署。

暂停后续自动同步（保留所有服务器文件）：

```sh
bash deploy/disable-source-sync.sh
```

重新启用：

```sh
gh workflow enable sync-main.yml --repo xie96808/tarot-reading
```

如需撤销凭据，删除仓库的 ALIYUN_SYNC_SSH_KEY Secret，并通过管理员 SSH 移除 tarot-sync 的专用 authorized_keys 条目；不要修改 root 的 SSH 配置。
