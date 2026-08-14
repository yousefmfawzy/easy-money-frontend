import { useState } from 'react';
import { resolveMediaUrl } from '../lib/media';
import styles from './EtfLogo.module.css';

interface EtfLogoProps {
  src: string | null;
  name: string;
  size?: number;
}

export default function EtfLogo({ src, name, size = 48 }: EtfLogoProps) {
  const [error, setError] = useState(false);
  
  const resolvedSrc = resolveMediaUrl(src);
  const showPlaceholder = !resolvedSrc || error;
  
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || '?';
    
  const style = { width: size, height: size, fontSize: size * 0.4 };

  if (showPlaceholder) {
    return (
      <div className={styles.placeholder} style={style}>
        <bdi>{initials}</bdi>
      </div>
    );
  }

  return (
    <img 
      src={resolvedSrc!} 
      alt={`${name} logo`} 
      className={styles.image} 
      style={style}
      onError={() => setError(true)}
    />
  );
}
