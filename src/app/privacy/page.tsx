import type { Metadata } from 'next';

export const metadata: Metadata = { title: '隐私' };

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 20px 80px' }}>
      <h1>隐私</h1>
      <p>默认情况下，问题只留在当前浏览器。本机历史需要你主动保存，最多 20 条，仅这台设备可读。</p>
      <p>
        分享链接由浏览器生成。链接里会有抽出的牌；问题只有在你勾选后才会进入链接。个人留笺永不进入分享。base64url
        是编码，不是加密。收到链接的人可以转发。
      </p>
      <p>全站不把 Referer 带给第三方。结果页不进搜索索引。应用日志不记录问题原文。</p>
      <p>你可以在入席页的本机记录里删除单条或清空全部。清浏览器站点数据也会去掉进度和历史。</p>
    </main>
  );
}
