'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import styles from './DeckBrowser.module.css';

export function DeckSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  return (
    <label className={styles.search}>
      <span className="visually-hidden">搜索牌名</span>
      <input
        type="search"
        defaultValue={initialQuery}
        placeholder="搜索牌名或关键词"
        autoComplete="off"
        onChange={(event) => {
          const value = event.target.value;
          const params = new URLSearchParams(searchParams.toString());
          if (value.trim()) params.set('q', value);
          else params.delete('q');
          const qs = params.toString();
          startTransition(() => {
            router.replace(qs ? `${pathname}?${qs}` : pathname);
          });
        }}
      />
    </label>
  );
}
