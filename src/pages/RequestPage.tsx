import { useState, useEffect, useRef } from 'react';
import { useAsync } from '../hooks/useAsync';
import { getEtfs } from '../api/etfs';
import { submitTradeRequest } from '../api/requests';
import { RequestType, TradeRequest } from '../types/api';
import { multiplyDecimalStrings } from '../lib/decimal';
import { formatLocalDateTime } from '../lib/datetime';
import { isZeroDecimal } from '../lib/money';
import { friendlyMessage } from '../api/errorMessages';
import MoneyValue from '../components/MoneyValue';
import ErrorBanner from '../components/ErrorBanner';
import Spinner from '../components/Spinner';
import styles from './RequestPage.module.css';

export default function RequestPage() {
  const { data: etfs, isLoading: etfsLoading, error: etfsError, run: fetchEtfs } = useAsync(getEtfs);
  
  useEffect(() => {
    fetchEtfs();
  }, [fetchEtfs]);

  const [etfId, setEtfId] = useState<number | ''>('');
  const [requestType, setRequestType] = useState<RequestType>('BUY');
  const [units, setUnits] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [photo, setPhoto] = useState<File | null>(null);
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<TradeRequest | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhoto(null);
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
        setPhotoPreview(null);
      }
      return;
    }

    // Client-side pre-check
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setValidationErrors(prev => ({ ...prev, photo: "That file type isn't supported. Please use a JPEG, PNG, or WEBP photo." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setValidationErrors(prev => ({ ...prev, photo: "That photo is too large. Please use one under 5 MB." }));
      return;
    }

    setValidationErrors(prev => {
      const copy = { ...prev };
      delete copy.photo;
      return copy;
    });

    setPhoto(file);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(URL.createObjectURL(file));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!etfId) errors.etfId = "Please select an ETF.";
    
    if (!units || !/^\d+(\.\d+)?$/.test(units) || isZeroDecimal(units)) {
      errors.units = "Units must be greater than zero.";
    }
    
    if (!name.trim()) {
      errors.name = "Name is required.";
    }
    
    if (!photo) {
      errors.photo = "A photo is required.";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitTradeRequest({
        requesterName: name.trim(),
        etfId: Number(etfId),
        requestType,
        units,
        image: photo!
      });
      setConfirmation(result);
    } catch (error) {
      setSubmitError(friendlyMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedEtf = etfs?.find(e => e.id === Number(etfId));
  const indicativeTotal = selectedEtf && units && !isNaN(Number(units)) && Number(units) > 0
    ? multiplyDecimalStrings(units, selectedEtf.current_value)
    : null;

  if (etfsLoading) {
    return (
      <div className={styles.centerPage}>
        <Spinner />
      </div>
    );
  }

  if (etfsError) {
    return (
      <div className={styles.centerPage}>
        <ErrorBanner message={friendlyMessage(etfsError)} onRetry={fetchEtfs} />
      </div>
    );
  }

  if (confirmation) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.confirmationCard}>
            <h1 className={styles.title}>Request Submitted</h1>
            <p className={styles.subtitle}>These are the values recorded by the organizers:</p>
            
            <dl className={styles.detailsList}>
              <div className={styles.detailRow}>
                <dt>ETF</dt>
                <dd><bdi>{confirmation.etf_name}</bdi></dd>
              </div>
              <div className={styles.detailRow}>
                <dt>Type</dt>
                <dd>{confirmation.request_type}</dd>
              </div>
              <div className={styles.detailRow}>
                <dt>Units</dt>
                <dd>{confirmation.units}</dd>
              </div>
              <div className={styles.detailRow}>
                <dt>Price Snapshot</dt>
                <dd><MoneyValue value={confirmation.etf_value_snapshot} currency={confirmation.currency} /></dd>
              </div>
              <div className={styles.detailRow}>
                <dt>Total Value</dt>
                <dd><MoneyValue value={confirmation.total_value_snapshot} currency={confirmation.currency} /></dd>
              </div>
              <div className={styles.detailRow}>
                <dt>Status</dt>
                <dd>{confirmation.status}</dd>
              </div>
              <div className={styles.detailRow}>
                <dt>Created At</dt>
                <dd>{formatLocalDateTime(confirmation.created_at)}</dd>
              </div>
            </dl>
            
            <button 
              type="button" 
              className={styles.resetButton}
              onClick={() => {
                setConfirmation(null);
                setEtfId('');
                setRequestType('BUY');
                setUnits('');
                setName('');
                setPhoto(null);
                setPhotoPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              Submit another request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Trade Request</h1>
        
        {submitError && (
          <div className={styles.submitError}>
            <ErrorBanner message={submitError} />
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          
          <div className={styles.formGroup}>
            <label htmlFor="etfId" className={styles.label}>Select ETF</label>
            <select 
              id="etfId" 
              className={styles.input} 
              value={etfId} 
              onChange={e => {
                setEtfId(e.target.value === '' ? '' : Number(e.target.value));
                setValidationErrors(prev => { const c = {...prev}; delete c.etfId; return c; });
              }}
              aria-invalid={!!validationErrors.etfId}
              aria-describedby={validationErrors.etfId ? "etfId-error" : undefined}
            >
              <option value="">-- Choose an ETF --</option>
              {etfs?.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name} - {e.current_value} {e.currency}
                </option>
              ))}
            </select>
            {validationErrors.etfId && <div id="etfId-error" className={styles.errorText} role="alert">{validationErrors.etfId}</div>}
          </div>

          <fieldset className={styles.formGroup}>
            <legend className={styles.label}>Action</legend>
            <div className={styles.radioGroup}>
              <label className={`${styles.radioLabel} ${requestType === 'BUY' ? styles.radioLabelActive : ''}`}>
                <input 
                  type="radio" 
                  name="requestType" 
                  value="BUY" 
                  checked={requestType === 'BUY'} 
                  onChange={() => setRequestType('BUY')}
                  className={styles.visuallyHidden}
                />
                BUY
              </label>
              <label className={`${styles.radioLabel} ${requestType === 'SELL' ? styles.radioLabelActive : ''}`}>
                <input 
                  type="radio" 
                  name="requestType" 
                  value="SELL" 
                  checked={requestType === 'SELL'} 
                  onChange={() => setRequestType('SELL')}
                  className={styles.visuallyHidden}
                />
                SELL
              </label>
            </div>
          </fieldset>

          <div className={styles.formGroup}>
            <label htmlFor="units" className={styles.label}>Units</label>
            <input 
              id="units" 
              type="number" 
              inputMode="decimal" 
              min="0" 
              step="any"
              className={styles.input}
              value={units}
              onChange={e => {
                setUnits(e.target.value);
                setValidationErrors(prev => { const c = {...prev}; delete c.units; return c; });
              }}
              aria-invalid={!!validationErrors.units}
              aria-describedby={validationErrors.units ? "units-error" : undefined}
            />
            {validationErrors.units && <div id="units-error" className={styles.errorText} role="alert">{validationErrors.units}</div>}
          </div>

          {selectedEtf && indicativeTotal && (
            <div className={styles.indicativeBox}>
              <span className={styles.indicativeLabel}>Indicative Total</span>
              <span className={styles.indicativeValue}>
                <MoneyValue value={indicativeTotal} currency={selectedEtf.currency} />
              </span>
              <p className={styles.indicativeDisclaimer}>
                This total is indicative only. The organizers will record the final price at submission.
              </p>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>Your Name</label>
            <input 
              id="name" 
              type="text" 
              className={styles.input}
              value={name}
              onChange={e => {
                setName(e.target.value);
                setValidationErrors(prev => { const c = {...prev}; delete c.name; return c; });
              }}
              aria-invalid={!!validationErrors.name}
              aria-describedby={validationErrors.name ? "name-error" : undefined}
            />
            {validationErrors.name && <div id="name-error" className={styles.errorText} role="alert">{validationErrors.name}</div>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="photo" className={styles.label}>Verification Photo</label>
            <input 
              id="photo" 
              type="file" 
              accept="image/jpeg,image/png,image/webp" 
              capture="environment"
              className={styles.fileInput}
              onChange={handlePhotoChange}
              ref={fileInputRef}
              aria-invalid={!!validationErrors.photo}
              aria-describedby={validationErrors.photo ? "photo-error" : undefined}
            />
            {validationErrors.photo && <div id="photo-error" className={styles.errorText} role="alert">{validationErrors.photo}</div>}
            
            {photoPreview && (
              <div className={styles.photoPreview}>
                <img src={photoPreview} alt="Preview" />
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
