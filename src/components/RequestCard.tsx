import { useState } from 'react';
import { TradeRequest } from '../types/api';
import { resolveMediaUrl } from '../lib/media';
import { formatLocalDateTime } from '../lib/datetime';
import { formatCurrency } from '../lib/money';
import styles from './RequestCard.module.css';

interface RequestCardProps {
  request: TradeRequest;
  onApprove?: () => void;
  onReject?: () => void;
  busy?: boolean;
}

export default function RequestCard({ request, onApprove, onReject, busy = false }: RequestCardProps) {
  const isPending = request.status === 'PENDING';
  const [avatarFailed, setAvatarFailed] = useState(false);

  const avatarSrc = resolveMediaUrl(request.requester_image_url);
  const initial = request.requester_name.trim().charAt(0).toUpperCase() || '?';
  
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div className={styles.requester}>
          <div className={styles.avatar}>
            {avatarSrc && !avatarFailed ? (
              <img
                src={avatarSrc}
                alt=""
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              /* A missing photo used to render the alt text, which spilled out
                 of the 40px circle. An initial fits, and matches EtfLogo. */
              <span aria-hidden="true" className={styles.avatarInitial}><bdi>{initial}</bdi></span>
            )}
          </div>
          <h3 className={styles.name}><bdi>{request.requester_name}</bdi></h3>
        </div>
        <div className={`${styles.statusBadge} ${styles[`status${request.status}`]}`}>
          {request.status}
        </div>
      </header>
      
      <div className={styles.tradeDetails}>
        <div className={styles.tradeType}>
          <span className={`${styles.typeMarker} ${styles[`type${request.request_type}`]}`}>
            {request.request_type}
          </span>
          <span className={styles.units}>{request.units} units of</span>
          <bdi className={styles.etfName}>{request.etf_name}</bdi>
        </div>
        
        <div className={styles.snapshots}>
          <p className={styles.snapshotNote}>Values recorded at submission:</p>
          <div className={styles.snapshotValues}>
            <div className={styles.snapshotStat}>
              <span className={styles.snapshotLabel}>ETF Price</span>
              <span className={styles.snapshotValue}>{formatCurrency(request.etf_value_snapshot, request.currency)}</span>
            </div>
            <div className={styles.snapshotStat}>
              <span className={styles.snapshotLabel}>Total Value</span>
              <span className={styles.snapshotValue}>{formatCurrency(request.total_value_snapshot, request.currency)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <footer className={styles.footer}>
        <div className={styles.timestamps}>
          <div>Requested: {formatLocalDateTime(request.created_at)}</div>
          {request.processed_at && (
            <div>Processed: {formatLocalDateTime(request.processed_at)}</div>
          )}
        </div>
        
        {isPending && (onApprove || onReject) && (
          <div className={styles.actions}>
            {onReject && (
              <button 
                className={`${styles.actionButton} ${styles.rejectButton}`}
                onClick={onReject}
                disabled={busy}
              >
                Reject
              </button>
            )}
            {onApprove && (
              <button 
                className={`${styles.actionButton} ${styles.approveButton}`}
                onClick={onApprove}
                disabled={busy}
              >
                Approve
              </button>
            )}
          </div>
        )}
      </footer>
    </article>
  );
}
