import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '64px 20px' }}>
      <h1>没有找到这一页</h1>
      <p>如果是一条分享链接，可能已损坏或来自尚未支持的版本。</p>
      <p>
        <Link href="/">回到桌边</Link>
      </p>
    </main>
  );
}
