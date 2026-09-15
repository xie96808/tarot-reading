import type { Metadata } from 'next';

export const metadata: Metadata = { title: '隐私' };

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 20px' }}>
      <h1>隐私</h1>
      <p>默认情况下，问题只留在当前浏览器。本机历史需要你主动保存。</p>
      <p>分享链接由浏览器生成。链接里会有抽出的牌；问题只有在你勾选后才会进入链接。个人留笺永不进入分享。</p>
      <p>base64url 是编码，不是加密。收到链接的人可以转发。</p>
    </main>
  );
}
