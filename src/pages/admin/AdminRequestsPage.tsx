import { useState, useEffect, useCallback } from 'react';
import { getEtfs } from '../../api/etfs';
import { listRequests, setRequestStatus } from '../../api/admin';
import { friendlyMessage } from '../../api/errorMessages';
import { Etf, RequestStatus, TradeRequest } from '../../types/api';
import RequestCard from '../../components/RequestCard';
import Spinner from '../../components/Spinner';
import ErrorBanner from '../../components/ErrorBanner';
import EmptyState from '../../components/EmptyState';
import styles from './AdminRequestsPage.module.css';

export default function AdminRequestsPage() {
  const [etfs, setEtfs] = useState<Etf[]>([]);
  const [requests, setRequests] = useState<TradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<string | 'All'>('All');
  const [etfFilter, setEtfFilter] = useState<string | 'All'>('All');
  
  const [busyRequestId, setBusyRequestId] = useState<number | null>(null);

  const fetchEtfs = useCallback(async () => {
    try {
      const data = await getEtfs();
      setEtfs(data);
    } catch (err) {
      console.error('Failed to load ETFs', err);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listRequests({
        status: statusFilter,
        request_type: typeFilter,
        etf_id: etfFilter
      });
      setRequests(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, etfFilter]);

  useEffect(() => {
    fetchEtfs();
  }, [fetchEtfs]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id: number) => {
    if (!window.confirm("Approve this request? Approving a request does not change any ETF price — organizers settle it in person; the market price only moves when an organizer changes it on the ETF screen.")) {
      return;
    }
    setBusyRequestId(id);
    try {
      await setRequestStatus(id, 'APPROVED');
      await fetchRequests();
    } catch (err) {
      alert(friendlyMessage(err));
    } finally {
      setBusyRequestId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm("Reject this request?")) return;
    setBusyRequestId(id);
    try {
      await setRequestStatus(id, 'REJECTED');
      await fetchRequests();
    } catch (err) {
      alert(friendlyMessage(err));
    } finally {
      setBusyRequestId(null);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Requests</h1>
        <div className={styles.disclaimerBox}>
          <strong>Note:</strong> Approving a request does <strong>not</strong> change any ETF price — organizers settle it in person; the market price only moves when an organizer changes it on the ETF screen.
        </div>
      </header>

      <section className={styles.filtersSection} aria-label="Filters">
        <div className={styles.filterGroup}>
          <label htmlFor="statusFilter" className={styles.filterLabel}>Status</label>
          <select 
            id="statusFilter" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as RequestStatus | 'All')}
            className={styles.filterSelect}
          >
            <option value="All">All</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="typeFilter" className={styles.filterLabel}>Type</label>
          <select 
            id="typeFilter" 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="All">All</option>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="etfFilter" className={styles.filterLabel}>ETF</label>
          <select 
            id="etfFilter" 
            value={etfFilter} 
            onChange={(e) => setEtfFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="All">All</option>
            {etfs.map(etf => (
              <option key={etf.id} value={etf.id}>{etf.name}</option>
            ))}
          </select>
        </div>
      </section>

      <main className={styles.content}>
        {loading ? (
          <div className={styles.centerBox}><Spinner /></div>
        ) : error ? (
          <div className={styles.centerBox}><ErrorBanner message={friendlyMessage(error)} onRetry={fetchRequests} /></div>
        ) : requests.length === 0 ? (
          <EmptyState 
            title="No requests found" 
            description="No trade requests match the current filters." 
          />
        ) : (
          <div className={styles.grid}>
            {requests.map(request => (
              <RequestCard 
                key={request.id}
                request={request}
                busy={busyRequestId === request.id}
                onApprove={request.status === 'PENDING' ? () => handleApprove(request.id) : undefined}
                onReject={request.status === 'PENDING' ? () => handleReject(request.id) : undefined}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
