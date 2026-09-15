# 烛下塔罗

给此刻留一盏灯。在线塔罗仪式站点，生产地址 `https://tarot.xieyw.top`。

v1：中文优先；无账号、无付费、无 LLM；客户端抽牌；本地词库与确定性解读。

## 开发

```bash
npm install
npm run ingest
npm test
npm run dev
```

牌面源自仓库中的 `RWS_78_aligned.zip`。`npm run ingest` 生成 `public/cards/rws-1/`，该目录不提交。

## 不部署

本仓库包含 nginx / systemd 样例（`deploy/`），但默认不上线。需要服务器地址、备案号后再做发布。
