import styles from './CardBack.module.css';

type CardBackProps = {
  className?: string;
  alt?: string;
};

export function CardBack({ className, alt = '牌背' }: CardBackProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`${styles.back} ${className ?? ''}`}
      src="/cards/back.svg"
      alt={alt}
      width={800}
      height={1280}
      draggable={false}
    />
  );
}
