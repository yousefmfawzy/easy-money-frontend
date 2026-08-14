import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getEtf, getEtfHistory } from '../../api/etfs';
import { updateEtfName, uploadEtfLogo, setEtfValue, adjustEtfValue } from '../../api/admin';
import { friendlyMessage } from '../../api/errorMessages';
import { isZeroDecimal } from '../../lib/money';
import { ApiError } from '../../api/client';
import EtfLogo from '../../components/EtfLogo';
import MoneyValue from '../../components/MoneyValue';
import TrendBadge from '../../components/TrendBadge';
import Spinner from '../../components/Spinner';
import ErrorBanner from '../../components/ErrorBanner';
import ValueHistoryChart from '../../components/ValueHistoryChart';
import styles from './AdminEtfDetailPage.module.css';
import { Etf, HistoryPoint } from '../../types/api';

export default function AdminEtfDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  const [etf, setEtf] = useState<Etf | null>(null);
  const [history, setHistory] = useState<HistoryPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [etfData, historyData] = await Promise.all([
        getEtf(id),
        getEtfHistory(id, 200)
      ]);
      setEtf(etfData);
      setHistory(historyData);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Rename Section State
  const [nameInput, setNameInput] = useState('');
  const [nameBusy, setNameBusy] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState(false);

  useEffect(() => {
    if (etf) setNameInput(etf.name);
  }, [etf]);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !nameInput.trim() || nameInput.trim() === etf?.name) return;
    
    setNameBusy(true);
    setNameError(null);
    setNameSuccess(false);
    try {
      await updateEtfName(id, nameInput.trim());
      setNameSuccess(true);
      await loadData();
    } catch (err) {
      setNameError(friendlyMessage(err));
    } finally {
      setNameBusy(false);
    }
  };

  // Logo Section State
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoSuccess, setLogoSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setLogoFile(null);
      setLogoError(null);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setLogoError("That file type isn't supported. Please use a JPEG, PNG, or WEBP photo.");
      setLogoFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoError("That photo is too large. Please use one under 5 MB.");
      setLogoFile(null);
      return;
    }

    setLogoError(null);
    setLogoFile(file);
    setLogoSuccess(false);
  };

  const handleUploadLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !logoFile) return;
    
    setLogoBusy(true);
    setLogoError(null);
    setLogoSuccess(false);
    try {
      await uploadEtfLogo(id, logoFile);
      setLogoSuccess(true);
      setLogoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadData();
    } catch (err) {
      setLogoError(friendlyMessage(err));
    } finally {
      setLogoBusy(false);
    }
  };

  // Absolute Value State
  const [absValueInput, setAbsValueInput] = useState('');
  const [absBusy, setAbsBusy] = useState(false);
  const [absError, setAbsError] = useState<string | null>(null);
  const [absSuccess, setAbsSuccess] = useState(false);

  const handleSetAbs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !absValueInput) return;
    
    setAbsBusy(true);
    setAbsError(null);
    setAbsSuccess(false);
    try {
      await setEtfValue(id, absValueInput);
      setAbsSuccess(true);
      setAbsValueInput('');
      await loadData();
    } catch (err) {
      setAbsError(friendlyMessage(err));
    } finally {
      setAbsBusy(false);
    }
  };

  // Percentage State
  const [pctValueInput, setPctValueInput] = useState('');
  const [pctBusy, setPctBusy] = useState(false);
  const [pctError, setPctError] = useState<string | null>(null);
  const [pctSuccess, setPctSuccess] = useState(false);

  const handleSetPct = async (pct: string) => {
    if (!id || !pct) return;
    
    setPctBusy(true);
    setPctError(null);
    setPctSuccess(false);
    try {
      await adjustEtfValue(id, pct);
      setPctSuccess(true);
      setPctValueInput('');
      await loadData();
    } catch (err) {
      if (err instanceof ApiError && err.code === 'ZERO_VALUE_PERCENTAGE') {
        setPctError(friendlyMessage(err));
      } else {
        setPctError(friendlyMessage(err));
      }
    } finally {
      setPctBusy(false);
    }
  };

  if (loading) return <div className={styles.centerPage}><Spinner /></div>;
  if (error || !etf || !history) return <div className={styles.centerPage}><ErrorBanner message={friendlyMessage(error)} onRetry={loadData} /></div>;

  const isZero = isZeroDecimal(etf.current_value);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTitleRow}>
          <EtfLogo src={etf.logo_url} name={etf.name} size={64} />
          <h1 className={styles.title}><bdi>{etf.name}</bdi></h1>
        </div>
        
        <div className={styles.readouts}>
          <div className={styles.readoutGroup}>
            <div className={styles.readoutLabel}>Current Value</div>
            <div className={styles.readoutValueLarge}>
              <MoneyValue value={etf.current_value} currency={etf.currency} />
            </div>
          </div>
          
          <div className={styles.readoutGroup}>
            <div className={styles.readoutLabel}>Previous Value</div>
            <div className={styles.readoutValue}>
              <MoneyValue value={etf.previous_value} currency={etf.currency} />
            </div>
          </div>
          
          <div className={styles.trendGroup}>
            <TrendBadge 
              trend={etf.trend}
              amount={etf.last_change_amount}
              percentage={etf.last_change_percentage}
            />
          </div>
        </div>
      </header>

      <section className={styles.chartSection}>
        <ValueHistoryChart history={history} currency={etf.currency} />
      </section>

      <div className={styles.formsGrid}>
        {/* Rename Section */}
        <section className={styles.formSection}>
          <h2 id="rename-heading" className={styles.sectionTitle}>Rename ETF</h2>
          <form aria-labelledby="rename-heading" onSubmit={handleRename} className={styles.form}>
            {nameError && <div role="alert" className={styles.inlineError}>{nameError}</div>}
            {nameSuccess && <div className={styles.inlineSuccess}>Name updated successfully.</div>}
            <div>
              <label htmlFor="rename-input" className={styles.label}>New ETF name</label>
              <div className={styles.inputRow}>
                <input 
                  id="rename-input"
                  type="text" 
                  value={nameInput}
                  onChange={e => { setNameInput(e.target.value); setNameError(null); setNameSuccess(false); }}
                  className={styles.input}
                />
                <button type="submit" disabled={nameBusy || !nameInput.trim() || nameInput.trim() === etf.name} className={styles.button}>
                  {nameBusy ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Logo Section */}
        <section className={styles.formSection}>
          <h2 id="logo-heading" className={styles.sectionTitle}>Update Logo</h2>
          <form aria-labelledby="logo-heading" onSubmit={handleUploadLogo} className={styles.form}>
            {logoError && <div role="alert" className={styles.inlineError}>{logoError}</div>}
            {logoSuccess && <div className={styles.inlineSuccess}>Logo updated successfully.</div>}
            <div>
              <label htmlFor="logo-input" className={styles.label}>New logo file</label>
              <div className={styles.inputRow}>
                <input 
                  id="logo-input"
                  type="file" 
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleLogoChange}
                  ref={fileInputRef}
                  className={styles.fileInput}
                />
                <button type="submit" disabled={logoBusy || !logoFile} className={styles.button}>
                  {logoBusy ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Absolute Value Section */}
        <section className={styles.formSection}>
          <h2 id="abs-heading" className={styles.sectionTitle}>Set Absolute Value</h2>
          <form aria-labelledby="abs-heading" onSubmit={handleSetAbs} className={styles.form}>
            {absError && <div role="alert" className={styles.inlineError}>{absError}</div>}
            {absSuccess && <div className={styles.inlineSuccess}>Value updated successfully.</div>}
            <div>
              <label htmlFor="abs-input" className={styles.label}>New absolute value</label>
              <div className={styles.inputRow}>
                <input 
                  id="abs-input"
                  type="number" 
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={absValueInput}
                  onChange={e => { setAbsValueInput(e.target.value); setAbsError(null); setAbsSuccess(false); }}
                  className={styles.input}
                  placeholder="e.g. 450.00"
                />
                <button type="submit" disabled={absBusy || !absValueInput} className={styles.button}>
                  {absBusy ? 'Applying...' : 'Apply'}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Percentage Section */}
        <section className={styles.formSection}>
          <h2 id="pct-heading" className={styles.sectionTitle}>Adjust by Percentage</h2>
          <form aria-labelledby="pct-heading" onSubmit={(e) => { e.preventDefault(); handleSetPct(pctValueInput); }} className={styles.form}>
            {pctError && <div role="alert" className={styles.inlineError}>{pctError}</div>}
            {pctSuccess && <div className={styles.inlineSuccess}>Value adjusted successfully.</div>}
            {isZero && !pctError && (
              <div className={styles.inlineWarning}>
                This ETF's value is 0, so a percentage change would still be 0. Set an absolute value first, then percentage changes will work.
              </div>
            )}
            
            <div className={styles.quickButtons}>
              <button type="button" onClick={() => handleSetPct('-10')} disabled={pctBusy} className={styles.quickButton}>-10%</button>
              <button type="button" onClick={() => handleSetPct('-5')} disabled={pctBusy} className={styles.quickButton}>-5%</button>
              <button type="button" onClick={() => handleSetPct('+5')} disabled={pctBusy} className={styles.quickButton}>+5%</button>
              <button type="button" onClick={() => handleSetPct('+10')} disabled={pctBusy} className={styles.quickButton}>+10%</button>
            </div>
            
            <div>
              <label htmlFor="pct-input" className={styles.label}>Percentage adjustment</label>
              <div className={styles.inputRow}>
                <input 
                  id="pct-input"
                  type="number" 
                  inputMode="decimal"
                  step="any"
                  value={pctValueInput}
                  onChange={e => { setPctValueInput(e.target.value); setPctError(null); setPctSuccess(false); }}
                  className={styles.input}
                  placeholder="Custom %"
                />
                <button type="submit" disabled={pctBusy || !pctValueInput} className={styles.button}>
                  {pctBusy ? 'Applying...' : 'Apply'}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
