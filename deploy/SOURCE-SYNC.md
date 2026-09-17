# main 自动发布至阿里云

工作流由“只同步源码”升级为网站自动发布。文件保持 `.github/workflows/sync-main.yml`，显示名称为 **Deploy main to Aliyun**。

## 发布流程

1. Ubuntu 24.04、Node 22.23.2 执行npm ci、lint、单测和服务器发布逻辑测试。
2. 构建Linux Next.js standalone，复制public与.next/static，写入RELEASE_SHA。
3. 打包成品，通过专用SSH密钥上传。
4. 服务器校验SHA-256、安全解包、切换current、重启tarot。
5. 核对healthz版本及首页、read页面和分享封面；失败自动切回旧版本。
6. 清理旧自动版本和上传包。

网站：https://tarot.xieyw.top；服务器：121.199.33.29:22。
线上链接：`/srv/tarot/current`；上一版本：`/srv/tarot/previous`。
版本：`/srv/tarot/releases/release-<完整SHA>/`。
单实例systemd restart有短暂切换窗口，不是零停机滚动发布。
串行工作流不取消正在发布的作业；拥堵时GitHub可能合并待执行推送，最新main进入队列。

## 磁盘策略

- 最多保留3个自动版本，保护current和previous。
- 原始 `release-20260916-172246` 额外保留作一次性兜底。
- 成功后删除本流程40位SHA命名的上传目录；下次发布前清理失败上传。
- 不删除未知目录、环境文件、日志或其他服务数据。
- 压缩包最多256MiB，展开最多1GiB、50000项；空闲不足2GiB停止。
- 版本数量不会随推送次数无限增加；日志及其他应用仍需单独治理。

改造前实测：40GB磁盘、约24GB可用；源码快照35MB、原线上版本174MB。

## 经批准的服务器受限权限

由管理员安装root所有的 `/usr/local/bin/tarot-ssh-gate` 和 `/usr/local/sbin/tarot-release`。
SSH入口仅接受受限rsync、prepare SHA、activate SHA、rollback；sudo仅授予固定发布程序，该程序再次检查参数。
`/srv/tarot` 和releases父目录改由root所有，防止应用用户替换受保护链接；应用仍以tarot低权限用户运行，环境文件不覆盖。
入口代码位于deploy/server；普通GitHub发布不更新特权入口，变更需管理员审查安装。
这意味着main提交者能够改变网站运行代码，发布期间有短暂重启。

Secrets沿用ALIYUN_SYNC_SSH_KEY、ALIYUN_SYNC_KNOWN_HOSTS；Variables沿用HOST/USER/PORT，可选ICP_NUMBER用于构建公开页脚。严格主机密钥核验保持不变。

## 暂停与回退（升级后）

```sh
bash deploy/disable-source-sync.sh
gh workflow enable sync-main.yml --repo xie96808/tarot-reading
ssh xiaoxiandi-aliyun /usr/local/sbin/tarot-release rollback
```

前两条分别暂停/恢复后续工作流，不停止正在运行的网站。需要固定停留在回退版本时，先暂停自动发布。
